import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as LocalStrategy } from "passport-local";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage, verifyPassword } from "./storage";
import crypto from "crypto";

const getOidcConfig = memoize(
  async () => {
    // Don't attempt to connect if REPL_ID is not configured
    if (!process.env.REPL_ID || process.env.REPL_ID === 'your-repl-id') {
      throw new Error('REPL_ID not configured - Replit OAuth unavailable');
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

function base64UrlEncode(input: Buffer | string): string {
  const buffer = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string): Buffer {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Buffer.from(base64, "base64");
}

function createAuthToken(userId: string): string {
  const payload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET!)
    .update(payloadEncoded)
    .digest();
  return `${payloadEncoded}.${base64UrlEncode(signature)}`;
}

function verifyAuthToken(token: string): { sub: string; exp: number } | null {
  const [payloadEncoded, signatureEncoded] = token.split(".");
  if (!payloadEncoded || !signatureEncoded) {
    return null;
  }
  const expectedSignature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET!)
    .update(payloadEncoded)
    .digest();
  const signature = base64UrlDecode(signatureEncoded);
  if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(signature, expectedSignature)) {
    return null;
  }
  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded).toString("utf8"));
    if (!payload?.sub || !payload?.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  // Cookie settings for Replit's proxy environment
  // When accessed through Replit's proxy (HTTPS), we need secure cookies
  // The proxy sets x-forwarded-proto header, which express trusts via "trust proxy"
  const isProduction = process.env.NODE_ENV === "production";
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: "auto", // Automatically set secure based on request protocol
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup local authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await authStorage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        const isValidPassword = user.password && await verifyPassword(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }
        const sessionUser = {
          claims: { sub: user.id },
          isLocal: true,
          expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        };
        return done(null, sessionUser);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Local login endpoint
  app.post("/api/auth/local/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        // Explicitly save session before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            return res.status(500).json({ message: "Session error" });
          }
          const token = createAuthToken(user.claims.sub);
          return res.json({ success: true, message: "Login successful", token });
        });
      });
    })(req, res, next);
  });

  // Logout endpoint (works for both local and OIDC)
  app.get("/api/logout", async (req, res) => {
    const user = req.user as any;
    const isLocal = user?.isLocal;
    const wantsJson = req.headers.accept?.includes("application/json");
    
    req.logout(() => {
      if (wantsJson) {
        res.json({ success: true });
        return;
      }
      if (isLocal || !process.env.REPL_ID) {
        res.redirect("/");
      } else {
        getOidcConfig().then(config => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
            }).href
          );
        }).catch(() => {
          res.redirect("/");
        });
      }
    });
  });

  // Skip OIDC setup if REPL_ID is not configured
  if (!process.env.REPL_ID || process.env.REPL_ID === 'your-repl-id') {
    console.warn("[Auth] REPL_ID not configured - Replit OAuth authentication is disabled, using local auth only");

    // Redirect /api/login to login page for local auth
    app.get("/api/login", (req, res) => {
      res.redirect("/login");
    });
    return;
  }

  let config;
  try {
    config = await getOidcConfig();
  } catch (error) {
    console.error("[Auth] Failed to connect to Replit OAuth:", error);
    console.warn("[Auth] Falling back to local authentication only");

    // Redirect /api/login to login page for local auth
    app.get("/api/login", (req, res) => {
      res.redirect("/login");
    });
    return;
  }

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Get the correct domain for OAuth callbacks
  const getReplitDomain = (reqHostname: string): string => {
    // Prefer environment variables for Replit domains
    const replitDomain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS;
    if (replitDomain) {
      return replitDomain.split(",")[0]; // Take the first domain if multiple
    }
    return reqHostname;
  };

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  app.get("/api/login", (req, res, next) => {
    const domain = getReplitDomain(req.hostname);
    ensureStrategy(domain);
    passport.authenticate(`replitauth:${domain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const domain = getReplitDomain(req.hostname);
    ensureStrategy(domain);
    passport.authenticate(`replitauth:${domain}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length);
    const payload = verifyAuthToken(token);
    if (payload) {
      const now = Math.floor(Date.now() / 1000);
      if (now <= payload.exp) {
        (req as any).user = {
          claims: { sub: payload.sub },
          isLocal: true,
          expires_at: payload.exp,
        };
        return next();
      }
    }
  }

  if (!req.isAuthenticated() || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // For local users, just check if session is still valid
  if (user.isLocal) {
    const now = Math.floor(Date.now() / 1000);
    if (user.expires_at && now <= user.expires_at) {
      return next();
    }
    return res.status(401).json({ message: "Session expired" });
  }

  // For OIDC users, check token expiration
  if (!user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

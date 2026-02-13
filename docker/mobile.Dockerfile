FROM node:20-alpine

WORKDIR /app

# Copy only package files first (better cache)
COPY apps/mobile/package.json ./

# Install dependencies (this installs `expo`)
RUN npm install

# Copy the rest of the mobile app
COPY apps/mobile ./

EXPOSE 8081 19000 19001 19002

CMD ["npx", "expo", "start", "--lan", "--non-interactive"]

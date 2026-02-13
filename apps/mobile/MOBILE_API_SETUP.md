# Mobile App API Connection Setup

## Issues Fixed

1. **Logout Button**: Fixed async handling in ProfileScreen to properly await logout operation
2. **API Connection**: Updated API base URL configuration to work with physical devices and emulators

## Running the Mobile App with API Connection

### Option 1: Using Environment Variable (Recommended for Physical Devices)

Set the `EXPO_PUBLIC_API_URL` environment variable before starting the app:

```bash
# Find your computer's local IP address
# On Linux/Mac: ip addr show | grep "inet " | grep -v 127.0.0.1
# On Windows: ipconfig | findstr IPv4

# Export the environment variable (replace with your IP)
export EXPO_PUBLIC_API_URL=http://192.168.1.100:3000

# Start the mobile app
cd apps/mobile
npm start
```

### Option 2: Using app.config.ts (For Docker/Production)

Edit `apps/mobile/app.config.ts` and hardcode the API URL:

```typescript
extra: {
  apiUrl: 'http://YOUR_SERVER_IP:3000',
},
```

### Option 3: Default Behavior (Development)

Without configuration, the app uses these defaults:
- **Android Emulator**: `http://10.0.2.2:3000` (automatically connects to host machine)
- **iOS Simulator**: `http://localhost:3000` (may not work, use Option 1)
- **Physical Devices**: Requires Option 1 or 2

## Testing the Connection

1. Start the API server:
   ```bash
   cd apps/api
   npm run dev
   ```

2. Start the mobile app:
   ```bash
   cd apps/mobile
   npm start
   ```

3. Open the app on your device/emulator
4. Check the console logs for API connection messages
5. Try logging in and fetching courses/paths

## Troubleshooting

### "Cannot connect to API server" Error

1. Verify API server is running: `curl http://localhost:3000/api/paths`
2. Check firewall allows connections on port 3000
3. Ensure your device is on the same network as your computer
4. For physical devices, use your computer's local IP, not localhost

### Logout Button Not Working

- Fixed: The logout button now properly awaits the async logout operation
- If still issues, check console logs for errors

### Paths/Courses Not Loading

1. Check API server logs for errors
2. Verify the API endpoints are accessible: `curl http://YOUR_IP:3000/api/paths`
3. Check network inspector in Expo dev tools
4. Ensure `EXPO_PUBLIC_API_URL` points to the correct server

## API Endpoints Used by Mobile App

- `POST /api/auth/local/login` - User login
- `GET /api/logout` - User logout
- `GET /api/auth/user` - Get current user
- `GET /api/paths` - Get learning paths
- `GET /api/courses` - Get courses
- `GET /api/enrollments` - Get user enrollments
- `GET /api/progress` - Get user progress
- `GET /api/certificates` - Get user certificates
- `GET /api/leaderboard/*` - Leaderboard endpoints

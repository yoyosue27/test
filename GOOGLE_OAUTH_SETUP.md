# Google OAuth Setup Guide

To enable real Google login functionality, follow these steps:

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the Google+ API:
   - Search for "Google+ API"
   - Click "Enable"

## 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose "External" for User Type
   - Fill in required fields (app name, user support email, etc.)
   - Add these scopes:
     - `userinfo.email`
     - `userinfo.profile`
   - Add test users (your email)
4. Go back to Credentials and create **OAuth 2.0 Client ID**
5. Select **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
7. Add authorized redirect URIs:
   - `http://localhost:5173/`
   - `http://127.0.0.1:5173/`

## 3. Copy Your Client ID

From the credentials page, copy your **Client ID** (not the Client Secret)

## 4. Set Environment Variable

Create a `.env.local` file in your project root:

```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID.

## 5. Restart Development Server

```bash
npm run dev
```

## 6. Test Google Login

1. Click the "Google" button on the login page
2. A Google Sign-In dialog will appear
3. Sign in with your Google account
4. You'll be automatically logged in and can create posts

## How It Works

1. **Frontend**: Loads Google Sign-In library and requests an ID token when user clicks Google button
2. **Backend**: Receives the ID token and validates it
3. **User Creation**: If first time, creates a new user account with their Google profile info
4. **Session Storage**: Stores authentication token and user info (respects "Remember me" setting)

## Troubleshooting

### "Google Client ID not configured" Error
- Make sure `.env.local` file exists in the project root
- Check that `VITE_GOOGLE_CLIENT_ID` is set correctly
- Restart the dev server

### Google sign-in dialog doesn't appear
- Check browser console for errors
- Make sure you added the correct authorized origins in Google Cloud Console
- Verify the Client ID is correct

### "Invalid token" Error
- Token might have expired - try again
- Check server console for detailed error messages
- Verify the backend can read the token payload

### User already exists but with different provider
- Each email can only have one account
- Delete the existing account from `data/users.json` if needed (be careful!)
- Or use the same email for both signup methods

## Security Notes

- The Client ID is public and safe to share (it's not a secret)
- The ID Token is short-lived and validated server-side
- Never commit `.env.local` to version control
- In production, add `.env.local` to `.gitignore`

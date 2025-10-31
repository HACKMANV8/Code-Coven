# Environment Variables Setup

## Backend Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/safelink

# Server Port
PORT=5000

# JWT Secret (for authentication tokens)
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production

# Twilio SMS Configuration
# Get these from https://console.twilio.com/
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## Quick Setup Steps

1. **Create the `.env` file:**
   ```bash
   cd backend
   touch .env
   ```

2. **Add your MongoDB URI** (if using MongoDB Atlas or custom setup)

3. **Set up Twilio** (see `backend/TWILIO_SETUP.md` for detailed instructions):
   - Sign up at https://www.twilio.com/try-twilio
   - Get Account SID and Auth Token from Twilio Console
   - Get a Twilio phone number
   - Add the credentials to `.env`

4. **Set a secure JWT secret:**
   ```env
   JWT_SECRET=your_very_long_random_secret_string_here
   ```

5. **Restart the backend server** after updating `.env`

## Important Notes

⚠️ **Never commit `.env` file to Git!** It contains sensitive credentials.
- The `.env` file should be in `.gitignore`
- Use `.env.example` (without real values) if you need to share the structure

## Testing Twilio

Once configured, test by:
1. Opening the PWA at http://localhost:8081
2. Adding an emergency contact with a verified phone number
3. Double-tapping the emergency button
4. Checking the backend console for SMS status

See `backend/TWILIO_SETUP.md` for detailed Twilio setup instructions.



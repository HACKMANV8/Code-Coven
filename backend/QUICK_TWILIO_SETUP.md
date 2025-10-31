# Quick Twilio Setup to Get SMS Working

## Step 1: Get Twilio Credentials (5 minutes)

1. **Sign up for Twilio** (if you don't have an account):
   - Go to: https://www.twilio.com/try-twilio
   - Sign up (it's free, includes trial credits)

2. **Get your credentials from Twilio Console**:
   - Log in at: https://console.twilio.com/
   - On the dashboard, you'll see:
     - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
     - **Auth Token**: Click the eye icon to reveal (keep this secret!)

3. **Get a phone number**:
   - Click "Phone Numbers" → "Manage" → "Buy a number"
   - Select a number (you get 1 free with trial)
   - Copy the number in E.164 format (e.g., `+14155552671`)

## Step 2: Add to .env File

Open `backend/.env` and add these 3 lines at the bottom:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_from_console
TWILIO_PHONE_NUMBER=+14155552671
```

**Replace the values with your actual Twilio credentials!**

## Step 3: Verify Your Phone Number (IMPORTANT for Trial)

If you're using a **trial account**, you MUST verify the recipient phone number:

1. Go to Twilio Console
2. Click "Phone Numbers" → "Verified Caller IDs"
3. Click "Add a new Caller ID"
4. Enter the phone number that will RECEIVE emergency alerts
5. Verify it via call or SMS
6. Wait for verification (usually instant)

**You can only send SMS to verified numbers on trial accounts!**

## Step 4: Restart Backend

```bash
cd backend
# Stop current server (Ctrl+C if running)
npm start
```

## Step 5: Test

1. Go to http://localhost:8081 (PWA)
2. Add an emergency contact with a **verified** phone number
3. Double-tap the emergency button
4. Check your phone - you should receive SMS!

## Common Issues

### "Twilio not configured"
- Make sure all 3 Twilio variables are in `.env`
- Restart the backend server after adding them

### "Phone number unverified"
- Add the recipient number to "Verified Caller IDs" in Twilio Console
- Trial accounts require verification

### "Invalid phone number"
- Use E.164 format: `+[country code][number]`
- Examples: `+14155552671` (US), `+447700900000` (UK), `+919876543210` (India)

### Still not working?
Check the backend console logs - they'll show specific error messages!



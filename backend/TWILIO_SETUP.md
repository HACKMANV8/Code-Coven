# Twilio SMS Setup Guide

Follow these steps to configure Twilio for sending emergency SMS alerts:

## 1. Create a Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account (includes free trial credits)
3. Verify your email and phone number

## 2. Get Your Twilio Credentials

1. Log in to the [Twilio Console](https://console.twilio.com/)
2. From the dashboard, you'll find:
   - **Account SID**: Found on the main dashboard
   - **Auth Token**: Click to reveal (keep this secret!)

## 3. Get a Twilio Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose a number (you get 1 free number with trial account)
3. Note down the phone number in E.164 format (e.g., `+1234567890`)

## 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## 5. Verify Phone Numbers (Trial Account)

If you're on a Twilio trial account:
- You can only send SMS to **verified phone numbers**
- Go to **Phone Numbers** → **Verified Caller IDs** in Twilio Console
- Add the phone numbers you want to send emergency alerts to

## 6. Restart Your Backend Server

After setting up `.env`:

```bash
cd backend
npm start
```

## Testing

Once configured, test the emergency alert:
1. Open the PWA at http://localhost:8081
2. Double-tap the emergency button
3. Check the backend console for SMS status
4. Recipients should receive the emergency SMS

## Troubleshooting

### "Twilio not configured" error
- Make sure `.env` file exists in `backend` directory
- Verify all three Twilio variables are set
- Restart the server after updating `.env`

### "The number +1234567890 is not a valid phone number"
- Use E.164 format: `+[country code][number]`
- Example: `+14155552671` (US), `+447700900000` (UK)

### "The number +1234567890 is unverified"
- For trial accounts, verify recipient numbers in Twilio Console
- Or upgrade to a paid account

### "Insufficient funds" or "Permission denied"
- Check your Twilio account balance
- Verify your account is active

## Twilio Pricing

- **Trial Account**: Free, but limited to verified numbers
- **Pay-as-you-go**: ~$0.0075 per SMS (very affordable)
- Free trial includes $15.50 credit

## Security Note

⚠️ **Never commit `.env` file to Git!** It contains sensitive credentials.
The `.env.example` file is safe to commit as it doesn't contain real credentials.


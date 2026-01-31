# Welcome Email Setup Guide

## Overview
This implementation adds welcome email functionality to the user registration process. When a user successfully registers, a welcome email is automatically sent to their email address.

## Features Implemented

1. **Email Service** (`src/services/emailService.js`)
   - Uses Nodemailer for SMTP email sending
   - Sends HTML welcome email with user's name
   - Handles errors gracefully (doesn't block registration)

2. **Rate Limiting** (`src/middlewares/rateLimit.middleware.js`)
   - Limits registration attempts: 10 requests per 15 minutes per IP
   - Prevents abuse and spam registrations

3. **Updated Registration Flow**
   - Registration succeeds even if email fails
   - Returns `emailSent` flag in response
   - Frontend shows warning if email failed

## Installation

### 1. Install Required Dependencies

```bash
cd backend
npm install nodemailer express-rate-limit
```

### 2. Configure Environment Variables

Add the following to your `.env` file (see `.env.example` for reference):

```env
# Email Configuration (SMTP)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=your_mailtrap_username
EMAIL_PASS=your_mailtrap_password
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173
```

## Testing with Mailtrap (Recommended for Development)

1. **Sign up for Mailtrap** (free): https://mailtrap.io
2. **Get SMTP credentials** from your Mailtrap inbox
3. **Update `.env`** with Mailtrap credentials:
   ```env
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_SECURE=false
   EMAIL_USER=your_mailtrap_username
   EMAIL_PASS=your_mailtrap_password
   EMAIL_FROM=noreply@test.com
   ```

4. **Test Registration**:
   - Register a new user via the frontend
   - Check Mailtrap inbox to see the welcome email
   - Verify email content includes user's name

## Production SMTP Configuration

### Gmail Example:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password  # Use App Password, not regular password
EMAIL_FROM=noreply@yourdomain.com
```

**Note**: For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `EMAIL_PASS`

### Other SMTP Providers:
- **SendGrid**: `smtp.sendgrid.net`, port `587`
- **Mailgun**: `smtp.mailgun.org`, port `587`
- **AWS SES**: Use your region's SMTP endpoint

## API Response Format

### Success Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "role": "user"
    },
    "accessToken": "...",
    "refreshToken": "...",
    "emailSent": true
  },
  "message": "User registered successfully",
  "errors": null
}
```

### Email Failed Response:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "...",
    "refreshToken": "...",
    "emailSent": false
  },
  "message": "Registered, but email failed to send",
  "errors": null
}
```

## Rate Limiting

- **Limit**: 10 registration attempts per 15 minutes per IP
- **Response when exceeded**:
  ```json
  {
    "success": false,
    "message": "Too many registration attempts from this IP. Please try again after 15 minutes.",
    "errors": null
  }
  ```

## Testing

### Test Registration Request:
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "password": "Test1234!"
  }'
```

### Expected Behavior:
1. User is registered successfully
2. Welcome email is sent (check Mailtrap inbox)
3. Response includes `emailSent: true` or `emailSent: false`
4. Frontend shows warning if email failed

## Files Modified/Created

### Backend:
- ✅ `src/services/emailService.js` (NEW)
- ✅ `src/middlewares/rateLimit.middleware.js` (NEW)
- ✅ `src/services/auth.service.js` (MODIFIED)
- ✅ `src/controllers/auth.controller.js` (MODIFIED)
- ✅ `src/routes/v1/auth.routes.js` (MODIFIED)
- ✅ `src/config/env.js` (MODIFIED)
- ✅ `.env.example` (MODIFIED)

### Frontend:
- ✅ `src/api/auth.api.js` (MODIFIED)
- ✅ `src/pages/Register.jsx` (MODIFIED)
- ✅ `src/contexts/AuthContext.jsx` (MODIFIED)
- ✅ `src/styles/auth.css` (MODIFIED - added warning styles)

## Troubleshooting

### Email Not Sending:
1. Check `.env` file has correct SMTP credentials
2. Verify SMTP server is accessible (check firewall)
3. Check backend logs for email errors
4. For Gmail: Ensure App Password is used, not regular password

### Rate Limit Issues:
- If testing multiple registrations, wait 15 minutes or use different IPs
- Rate limit is per IP address

### Registration Still Works Without Email:
- This is by design - registration succeeds even if email fails
- Check `emailSent` flag in response to know if email was sent
- Frontend will show warning if email failed

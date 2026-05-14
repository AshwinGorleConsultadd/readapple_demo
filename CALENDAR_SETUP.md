# Google Calendar Auth Setup

Run this once before the demo to authenticate:

1. Start the backend: `uvicorn main:app --reload`
2. Open in browser: http://localhost:8000/auth/google
3. Sign in with the demo Google account
4. Approve calendar access
5. Token saved to `token.json` automatically
6. All demo appointments will be booked on this account

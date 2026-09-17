# Google Sign-In setup

The frontend uses Google Identity Services and sends the returned ID credential to:

`POST /api/auth/google`

Set this in `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

In Google Cloud Console, configure the OAuth client as a Web application and add your development origin (for example `http://localhost:5173`) to the allowed JavaScript origins.

The backend must verify the credential server-side and issue the same TaskFlow HTTP-only session cookie used by email/password login.

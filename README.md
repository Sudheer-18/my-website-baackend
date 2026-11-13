# Portfolio contact backend

This Express API accepts contact form messages and delivers them to the portfolio owner through SMTP.

## Run locally

1. Copy `.env.example` to `.env` and set your SMTP account and app password. For Gmail, use a Google App Password; do not use your regular account password.
2. From this folder, run `npm install` if dependencies are not installed, then `npm start`.
3. Run the frontend with `npm run dev` from `D:\Myprotifilo\project`. Vite proxies `/api` requests to `http://localhost:3000`.
4. Check `http://localhost:3000/api/health` to verify the API is running.

The contact form sends `POST /api/contact` with `{ "name": "...", "email": "...", "message": "..." }`. It validates input, limits each client IP to five submissions per 15 minutes, and sends to `CONTACT_EMAIL` (never to an address chosen by the submitter).

## Deploy

The frontend uses `https://my-website-baackend.onrender.com` for production requests by default. To override it, set `VITE_API_URL` in the Vercel project to the backend base URL and redeploy. The backend accepts the deployed Vercel origin and `http://localhost:5173`; set `FRONTEND_ORIGIN` in Render if you use a different frontend domain.

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `CONTACT_EMAIL` in Render's environment settings. Never commit real credentials; keep `.env` out of source control and use placeholders in `.env.example`. Redeploy the backend after changing backend code or environment values, and redeploy the frontend after changing frontend code or Vercel environment variables.

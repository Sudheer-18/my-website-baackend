# Portfolio contact backend

This Express API accepts contact form messages and delivers them to the portfolio owner through SMTP.

## Run locally

1. Copy `.env.example` to `.env` and set your SMTP account and app password. For Gmail, use a Google App Password; do not use your regular account password.
2. From this folder, run `npm install` if dependencies are not installed, then `npm start`.
3. Run the frontend with `npm run dev` from `D:\Myprotifilo\project`. Vite proxies `/api` requests to `http://localhost:3000`.
4. Check `http://localhost:3000/api/health` to verify the API is running.

The contact form sends `POST /api/contact` with `{ "name": "...", "email": "...", "message": "..." }`. It validates input, limits each client IP to five submissions per 15 minutes, and sends to `CONTACT_EMAIL` (never to an address chosen by the submitter).

## Deploy

Set the SMTP variables from `.env.example` and `FRONTEND_ORIGIN` to your deployed website's origin in the backend hosting environment. Keep `.env` out of source control. Configure the frontend build's `VITE_API_URL` to the backend base URL when the API is hosted on a different origin; otherwise, route `/api` to this backend through your hosting provider's reverse proxy.

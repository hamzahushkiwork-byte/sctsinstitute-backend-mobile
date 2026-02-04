# Railway Deployment Guide

## Deployment Steps
1. **Push your changes** to your GitHub repository.
2. **Link Railway to your Repository**:
   - Go to [Railway](https://railway.app/) and create a new project.
   - Select "Deploy from GitHub repo".
   - Choose your repository and the `backend` service.
3. **Environment Variables**:
   In Railway, go to **Service > Settings > Variables** and add:
   - `MONGODB_URI`: Your MongoDB connection string (e.g., MongoDB Atlas).
   - `NODE_ENV`: `production`
   - `PORT`: `8080` (Railway usually provides this automatically).
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://your-frontend-domain.up.railway.app`).
   - `JWT_ACCESS_SECRET`: A secure random string.
   - `JWT_REFRESH_SECRET`: A secure random string.
   - `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, etc. (if using email features).
4. **Networking**:
   - Go to **Service > Settings > Domains**.
   - Click **Generate Domain**.
   - Railway will provide a public URL like `https://sctsinstitute-backend-production.up.railway.app`.

## Validation
Confirm the following endpoints work:
- `https://<your-railway-domain>/health` -> Returns `{ status: "ok" }`
- `https://<your-railway-domain>/` -> Returns service info.
- `https://<your-railway-domain>/api/v1` -> Should show your API routes or 404 (depending on routes).

## Logs
Check the Railway logs for:
- `🚀 Server running on port 8080`
- `✅ MongoDB connected`

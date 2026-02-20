# Frontend Environment Setup for Production

## SPA Routing Setup (Important!)

This is a React SPA using client-side routing. For clean URLs (e.g., `/admin/login` instead of `/#/admin/login`) to work on Render:

1. **Vite Build**: The `npm run build` command outputs to the `dist/` folder.
2. **Render Static Config**: The `render.yaml` file configures Render to:
   - Build using `npm run build`
   - Publish from the `dist/` folder  
   - Rewrite all routes (`/*`) to `index.html` (React Router then handles client-side routing)

This is **already configured**. When you push to GitHub, Render will automatically rebuild and redeploy.

### Troubleshooting 404s:
- In Render dashboard: Open your frontend service → **Settings** → **Publish directory** → Ensure it says `dist` (not `public`).
- Trigger a **Manual Deploy** to force a rebuild.
- Clear your browser cache and hard-refresh (Ctrl+Shift+R or Cmd+Shift+R).

---

## API Endpoints Setup

Before deploying to Render, update API endpoints to use environment variables:

## Option A: Hardcoded URLs (Quick, but less flexible)

Update the following files with your Render backend URL (e.g., `https://sommys-store-backend.onrender.com`):

1. `src/pages/AdminLogin.jsx` — line 4-5
2. `src/pages/AdminDashboard.jsx` — line 4
3. `src/pages/SignIn.jsx`, `SignUp.jsx` — update AUTH URLs
4. `src/pages/Products.jsx` — update fetch URL

## Option B: Environment Variables (Recommended)

1. Create `.env` in the frontend root:
   ```
   VITE_API_URL=http://localhost:5001
   ```

2. Update code to use:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'
   ```

3. On Render, set environment variable via dashboard:
   - `VITE_API_URL=https://sommys-store-backend.onrender.com`

See `RENDER_DEPLOY.md` in the backend repo for full deployment instructions.

Render deployment instructions
=============================

This repo is prepared to deploy two separate services on Render:

- Frontend: static site (Vite build output in `dist`)
- Backend: Node.js API (Express)

Files added:

- `render.yaml` — configuration that defines two Render services (frontend static site + backend web service). Update repo URLs or branches if needed.

Quick steps (Frontend):

1. Go to Render dashboard → New → Static Site
2. Connect repository: `https://github.com/uwaizeben-commits/sommys_store-frontend`
3. Branch: `main`
4. Build Command: `npm install && npm run build`
5. Publish Directory: `dist`
6. Create the site — wait for build to finish

Quick steps (Backend):

1. Go to Render dashboard → New → Web Service
2. Connect repository: `https://github.com/uwaizeben-commits/sommys_store-backend`
3. Branch: `main`
4. Environment: `Node` (choose Node version compatible with app, e.g. 18+)
5. Build Command: `npm install`
6. Start Command: `node src/index.js`
7. Set environment variables (in Render dashboard Settings → Environment):
   - `MONGO_URI` = your MongoDB connection string (required)
   - `PORT` = 5001 (optional; Render will assign a port automatically but the app reads process.env.PORT)
   - `NODE_ENV` = production
8. Deploy

Notes and recommendations:

- Do NOT commit secrets like `.env` or any credentials. Use Render's Environment settings.
- If you prefer a single service (backend serves the frontend), add a build step to the backend repository to run `npm run build` inside `frontend/` and serve its `dist/` dir from Express. Ask me to prepare that if desired.
- If you change `publishPath` in `render.yaml`, update the static site settings accordingly.
- For custom domains, configure DNS records per Render docs and add the domain in the Render dashboard.
- CORS: Ensure your backend accepts requests from your frontend domain (add it to `cors()` origin list if you tighten CORS).
- Migrations/Seed: If you need initial admin user or initial products, use `seed.js` from the backend repo and run it once (on your local machine or via a one-off Render job). Keep credentials secure.

If you want, I can:

- Prepare a single-repo backend setup that builds and serves the frontend (one Render web service).
- Add a small `render-start.sh` script or update `package.json` scripts to better match Render's expectations.

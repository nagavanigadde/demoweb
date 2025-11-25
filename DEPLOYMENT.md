# Deployment Guide for Vercel

## Project Structure
```
DemoWeb/
├── frontend/           # React + Vite frontend
├── api/                # Serverless API functions
├── backend/            # (Not used in production, local dev only)
├── package.json        # Root package.json for API dependencies
└── vercel.json         # Vercel configuration
```

## Environment Variables Required

You need to set these in Vercel Dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/demoweb` |
| `JWT_SECRET` | Secret key for JWT token signing | Use a long random string (64+ chars) |

## Deployment Methods

### Method 1: Vercel Dashboard (Easiest)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add `MONGODB_URI` with your MongoDB Atlas connection string
   - Add `JWT_SECRET` with your secret key
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - First deployment will ask for project settings
   - Accept all defaults (vercel.json handles the configuration)

4. **Add Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   ```
   - Enter values when prompted
   - Select "Production" environment

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Steps

1. **Seed the Database**
   - Once deployed, visit: `https://your-app.vercel.app/api/seed`
   - This creates default users and products
   - You only need to do this once

2. **Test Login**
   - Go to your app URL
   - Login with:
     - Admin: `admin1` / `admin123`
     - User: `user1` / `user123`

## Default Test Accounts

After seeding, these accounts are available:

**Admin Accounts:**
- Username: `admin1`, Password: `admin123`
- Username: `admin2`, Password: `admin456`

**User Accounts:**
- Username: `user1`, Password: `user123`
- Username: `user2`, Password: `user456`

## How It Works

### Architecture
- **Frontend**: Vite builds static files to `frontend/dist`
- **Backend**: Serverless functions in `/api` folder
- **Database**: MongoDB Atlas (cloud-hosted)
- **Routing**: Vercel routes `/api/*` to serverless functions, everything else to React app

### API Endpoints
- `POST /api/login` - User authentication
- `GET /api/me` - Get current user
- `GET /api/products` - Get all products (with optional search)
- `POST /api/products` - Add new product (admin only)
- `POST /api/seed` - Seed database with default data

### Build Process
1. Vercel runs `npm install` in root (installs API dependencies)
2. Vercel runs `cd frontend && npm install` (installs frontend dependencies)
3. Vercel runs `npm run build` which executes `cd frontend && npm run build`
4. Vite builds the React app to `frontend/dist`
5. Vercel deploys static files + serverless functions

## Troubleshooting

### Build Fails
- Check that `package.json` exists in root
- Verify `frontend/package.json` exists
- Check build logs in Vercel dashboard

### API Routes Don't Work
- Verify environment variables are set in Vercel
- Check that MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check Vercel function logs

### Database Connection Fails
- Verify `MONGODB_URI` is correct
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0` (allow all)
- Check MongoDB Atlas user permissions

### Frontend Can't Reach API
- The frontend automatically uses `/api` in production
- Check browser console for CORS errors
- Verify API routes are deployed (visit `/api/seed` in browser)

## Continuous Deployment

Once set up, Vercel automatically:
- Deploys on every push to `main` branch
- Creates preview deployments for pull requests
- Runs builds and shows status in GitHub

## Custom Domain

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Vercel handles SSL certificates automatically

## Monitoring

- View logs: Vercel Dashboard → Your Project → Logs
- View analytics: Vercel Dashboard → Your Project → Analytics
- Monitor functions: Vercel Dashboard → Your Project → Functions

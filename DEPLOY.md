# Deploy to Railway (FREE)

## Steps:

1. **Sign up**: https://railway.app (use GitHub)

2. **Deploy**:
   ```bash
   cd backend
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

3. **Add PostgreSQL**:
   - Dashboard → New → Database → PostgreSQL
   - Copy DATABASE_URL to variables

4. **Set Environment Variables**:
   ```
   PORT=3000
   DATABASE_URL=(auto-added)
   JWT_SECRET=your-secret-key
   ```

5. **Get URL**: 
   - Settings → Domains → Generate Domain
   - Your backend: `https://your-app.railway.app`

## Alternative: Render.com
```bash
# Push to GitHub first
git init
git add .
git commit -m "backend"
git push

# Then: render.com → New Web Service → Connect Repo
```

Free tier: 750 hours/month

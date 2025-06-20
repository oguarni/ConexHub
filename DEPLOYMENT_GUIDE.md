# 🚀 ConexHub B2B Marketplace - Deployment Guide

## Overview

This guide covers deploying the ConexHub B2B Marketplace to modern cloud platforms:
- **Frontend**: Vercel (React.js)
- **Backend**: Render (Node.js)
- **Database**: Render PostgreSQL

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account (free tier available)
- Render account (free tier available)
- Domain name (optional, for custom domains)

## 🎯 Deployment Strategy

### Architecture Overview
```
Frontend (Vercel) → Backend API (Render) → PostgreSQL (Render)
```

---

## 📱 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Verify configuration files**:
   ```bash
   # Check if vercel.json exists
   ls frontend/vercel.json
   
   # Check production environment
   ls frontend/.env.production
   ```

2. **Update API URLs** in `frontend/.env.production`:
   ```env
   REACT_APP_API_URL=https://your-backend-name.onrender.com
   ```

### Step 2: Deploy to Vercel

1. **Connect GitHub repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure build settings**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://conexhub-backend.onrender.com
   REACT_APP_ENV=production
   GENERATE_SOURCEMAP=false
   ```

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

---

## 🖥️ Backend Deployment (Render)

### Step 1: Prepare Backend

1. **Verify configuration files**:
   ```bash
   # Check if render.yaml exists
   ls render.yaml
   
   # Check production environment template
   ls .env.production
   ```

### Step 2: Setup Database

1. **Create PostgreSQL Database**:
   - Go to [render.com](https://render.com)
   - New → PostgreSQL
   - Database Name: `conexhub_production`
   - User: `conexhub_user`
   - Region: Oregon (free tier)
   - Plan: Free

2. **Get Database URL**:
   - Copy the Internal Database URL
   - Format: `postgresql://user:password@host:port/database`

### Step 3: Create Environment Group

1. **Create Secret Group**:
   - Dashboard → Environment Groups
   - Name: `conexhub-secrets`

2. **Add Variables**:
   ```env
   DATABASE_URL=postgresql://conexhub_user:PASSWORD@dpg-XXX.oregon-postgres.render.com/conexhub_production
   JWT_SECRET=your-64-character-secure-secret
   JWT_REFRESH_SECRET=your-different-64-character-secret
   ```

3. **Generate Secure Secrets**:
   ```bash
   # Generate JWT secrets
   node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   ```

### Step 4: Deploy Backend Service

1. **Create Web Service**:
   - New → Web Service
   - Connect your GitHub repository
   - Root Directory: `backend`

2. **Configure Service**:
   ```yaml
   Name: conexhub-backend
   Environment: Node
   Region: Oregon
   Branch: main
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables**:
   - Link the `conexhub-secrets` group
   - Add public variables:
   ```env
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://your-frontend.vercel.app
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

4. **Health Check**:
   - Health Check Path: `/api/health`

### Step 5: Run Database Migration

1. **Add build command for migrations**:
   ```yaml
   buildCommand: "npm install && npm run db:migrate:prod"
   ```

2. **Manual migration** (if needed):
   - Go to Shell tab in Render dashboard
   - Run: `npm run db:migrate:prod`

---

## 🔐 Security Configuration

### Environment Variables Checklist

#### Required Secrets (Add to Render Environment Group):
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET` (64+ characters)
- ✅ `JWT_REFRESH_SECRET` (different from JWT_SECRET)

#### Optional Secrets:
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (for email)
- `PIX_CLIENT_ID`, `PIX_CLIENT_SECRET` (for payments)

#### Public Variables:
- `NODE_ENV=production`
- `FRONTEND_URL`
- `ALLOWED_ORIGINS`
- `CORS_CREDENTIALS=true`

### Security Headers

The deployment includes security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 🧪 Testing Deployment

### Frontend Testing
1. Visit your Vercel URL
2. Check if the app loads correctly
3. Verify API calls work (check Network tab)
4. Test authentication flow

### Backend Testing
1. Visit your Render backend URL + `/api/health`
2. Should return: `{ "status": "ok", "timestamp": "..." }`
3. Test API endpoints:
   ```bash
   curl https://your-backend.onrender.com/api/health
   curl https://your-backend.onrender.com/api/products
   ```

### Database Testing
1. Check migration status in Render logs
2. Verify tables were created
3. Test basic CRUD operations

---

## 📊 Monitoring & Maintenance

### Logs Access
- **Vercel**: Functions tab → View logs
- **Render**: Service dashboard → Logs tab
- **Database**: PostgreSQL dashboard → Logs

### Performance Monitoring
- Vercel Analytics (built-in)
- Render Metrics (CPU, Memory, Response time)
- Database metrics (Connections, Queries)

### Backup Strategy
- Render PostgreSQL includes automatic backups
- Configure backup retention as needed
- Consider additional backup solutions for production

---

## 🚨 Troubleshooting

### Common Issues

#### Frontend Build Fails
```bash
# Check build locally
cd frontend
npm run build

# Common fixes:
npm install --legacy-peer-deps
```

#### Backend Service Won't Start
1. Check environment variables are set
2. Verify database connection
3. Check migration status:
   ```bash
   npm run db:migrate:prod
   ```

#### Database Connection Issues
1. Verify `DATABASE_URL` format
2. Check database is running
3. Verify network connectivity

#### CORS Issues
1. Check `ALLOWED_ORIGINS` includes frontend URL
2. Verify `CORS_CREDENTIALS` setting
3. Check protocol (http vs https)

### Health Check Endpoints

Add to `backend/server.js`:
```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});
```

---

## 🎉 Post-Deployment

### Domain Configuration
1. **Frontend**: Configure custom domain in Vercel
2. **Backend**: Configure custom domain in Render (paid plan)
3. **SSL**: Automatically handled by both platforms

### Performance Optimization
1. Enable Vercel Analytics
2. Configure CDN caching
3. Monitor Core Web Vitals
4. Set up error tracking (Sentry)

### SEO Setup
1. Configure meta tags
2. Add sitemap.xml
3. Set up Google Analytics
4. Configure robots.txt

---

## 📞 Support

### Documentation Links
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Sequelize CLI](https://sequelize.org/docs/v6/other-topics/migrations/)

### Emergency Contacts
- Database issues: Check Render PostgreSQL status
- Service downtime: Check Render/Vercel status pages
- SSL certificate issues: Contact platform support

---

## 🔄 Continuous Deployment

### Automatic Deployments
- **Frontend**: Auto-deploys on push to main branch
- **Backend**: Auto-deploys on push to main branch
- **Migrations**: Run automatically during build

### Manual Deployment
```bash
# Frontend
vercel --prod

# Backend (via git)
git push origin main
```

### Rollback Strategy
1. **Vercel**: Use deployment history to rollback
2. **Render**: Use deployment history or redeploy previous commit
3. **Database**: Use backup restoration if needed

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migration tested
- [ ] CORS settings verified
- [ ] Security headers configured
- [ ] Health check endpoint added

### Deployment
- [ ] Database created and connected
- [ ] Backend service deployed and running
- [ ] Frontend deployed and accessible
- [ ] API endpoints responding correctly
- [ ] Authentication flow working

### Post-Deployment
- [ ] Custom domains configured (if applicable)
- [ ] Monitoring and logging set up
- [ ] Performance testing completed
- [ ] Security audit performed
- [ ] Backup strategy implemented

---

**🎯 Your ConexHub B2B Marketplace is now live and ready for business!**
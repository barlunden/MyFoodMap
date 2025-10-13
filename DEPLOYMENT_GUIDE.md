# Deployment Guide - MyFoodMap Security Edition

## 🚨 CRITICAL: Security Pre-Deployment Checklist

### Before ANY deployment, ensure:

1. **Environment Variables Secured**
   ```bash
   # NEVER commit these values to git!
   DATABASE_URL="postgresql://..."
   JWT_SECRET="[64-character random string]"
   ```

2. **Production Database Setup**
   ```bash
   # Railway PostgreSQL (recommended)
   railway add postgresql
   railway run echo $DATABASE_URL
   ```

3. **Backend Security Ready**
   - All `/no-auth` endpoints removed ✅
   - JWT authentication enforced ✅
   - User isolation implemented ✅
   - Strong secrets configured ✅

## 📋 Deployment Steps

### 1. GitHub Repository Update
```bash
# Add security improvements
git add .
git commit -m "🔒 SECURITY: Implement authentication for Safe Foods & privacy protection

- Remove all /no-auth endpoints for sensitive data
- Enforce JWT authentication on Safe Foods API
- Implement user data isolation
- Add privacy policy and security documentation
- Update frontend to use authenticated endpoints
- Strengthen JWT secret management"

git push origin main
```

### 2. Railway Backend Deployment
```bash
cd backend
railway login
railway link [your-project]

# Set production environment variables
railway variables set JWT_SECRET="[generate-new-64-char-secret]"
railway variables set DATABASE_URL="[railway-postgres-url]"
railway variables set NODE_ENV="production"

# Deploy
railway up
```

### 3. Netlify Frontend Deployment
```bash
# In Netlify dashboard:
# 1. Connect GitHub repository
# 2. Set build command: npm run build
# 3. Set publish directory: dist
# 4. Set environment variables:
#    PUBLIC_API_URL=https://your-railway-app.railway.app/api
```

### 4. Database Migration (Production)
```bash
# Run migrations on production database
npx prisma migrate deploy --schema=./shared/prisma/schema.prisma
```

## 🔐 Production Security Configuration

### Environment Variables (Production)
```bash
# Railway Backend
DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/railway"
JWT_SECRET="[CRITICAL: 64-character cryptographically secure random string]"
NODE_ENV="production"
FRONTEND_URL="https://your-netlify-app.netlify.app"

# Netlify Frontend
PUBLIC_API_URL="https://your-railway-app.railway.app/api"
```

### HTTPS & Security Headers
Railway and Netlify automatically provide:
- ✅ HTTPS/TLS encryption
- ✅ Security headers
- ✅ DDoS protection

## 🛡️ Post-Deployment Security Verification

### Test Authentication Flow
```bash
# 1. Register new user
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'

# 2. Login
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# 3. Test protected endpoint (should fail without token)
curl https://your-app.railway.app/api/safe-foods

# 4. Test with token (should succeed)
curl -H "Authorization: Bearer [JWT_TOKEN]" \
  https://your-app.railway.app/api/safe-foods
```

### User Data Isolation Test
1. Create two user accounts
2. Log in as User A, create safe foods
3. Log in as User B, verify they can't see User A's data
4. Verify Safe Foods are completely isolated

## 🚨 Production Monitoring

### Health Checks
- Backend: `https://your-app.railway.app/api/health`
- Frontend: Monitor Netlify deployment status
- Database: Railway PostgreSQL metrics

### Security Monitoring
- Failed authentication attempts
- Unusual API access patterns
- Database connection security
- HTTPS certificate status

## 📞 Emergency Procedures

### Security Incident Response
1. **Immediate**: Rotate JWT_SECRET if compromised
2. **Identify**: Check logs for unauthorized access
3. **Contain**: Temporarily disable affected endpoints
4. **Notify**: Inform users if data may be affected
5. **Document**: Record incident and response

### Data Breach Protocol
1. Immediate database access review
2. User password reset notifications
3. Security audit and patching
4. Compliance reporting (GDPR/CCPA)

---

**This is now a production-ready, privacy-compliant ARFID management platform.** 🛡️

All sensitive health data is protected with industry-standard security measures.
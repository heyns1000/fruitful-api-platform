# Deployment Guide

This guide covers deploying the Fruitful API Platform to various hosting providers.

## Cloudflare (Recommended)

The application is optimized for Cloudflare's edge network with Workers and Pages.

### Prerequisites
- Cloudflare account
- Wrangler CLI installed: `npm install -g wrangler`
- Cloudflare D1 database set up

### Frontend Deployment (Cloudflare Pages)

1. **Build the frontend**
```bash
cd frontend
npm run build
```

2. **Deploy to Cloudflare Pages**
```bash
wrangler pages deploy dist --project-name=fruitful-api-console
```

Or connect your GitHub repository to Cloudflare Pages for automatic deployments:
- Go to Cloudflare Dashboard → Pages
- Create a new project
- Connect your GitHub repository
- Set build command: `cd frontend && npm run build`
- Set build output directory: `frontend/dist`

### Backend Deployment (Cloudflare Workers)

1. **Set up D1 Database**
```bash
wrangler d1 create fruitful_api
# Note the database ID from the output
```

2. **Update wrangler.toml**
Edit `backend/wrangler.toml` and add your database ID:
```toml
[[d1_databases]]
binding = "DB"
database_name = "fruitful_api"
database_id = "your-actual-database-id"
```

3. **Set secrets**
```bash
cd backend
wrangler secret put JWT_SECRET
wrangler secret put VAULT_ENCRYPTION_KEY
```

4. **Deploy**
```bash
wrangler publish
```

### Environment Variables (Cloudflare)

Set these via Cloudflare Dashboard or wrangler:
- `JWT_SECRET` - Your JWT signing key
- `VAULT_ENCRYPTION_KEY` - 32-character encryption key
- `NODE_ENV` - production
- `VAULT_LEVEL` - 7
- `FAA_X13_COMPLIANCE_MODE` - strict

## Docker Deployment

### Using Docker Compose (Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432

### Production Docker

1. **Build images**
```bash
docker build -t fruitful-api-frontend ./frontend
docker build -t fruitful-api-backend ./backend
```

2. **Run with environment variables**
```bash
docker run -d \
  --name fruitful-backend \
  -e DATABASE_URL=your-postgres-url \
  -e JWT_SECRET=your-secret \
  -p 5000:5000 \
  fruitful-api-backend

docker run -d \
  --name fruitful-frontend \
  -p 3000:3000 \
  fruitful-api-frontend
```

## Traditional VPS/Server Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Nginx (recommended)
- PM2 (for process management)

### Setup Backend

1. **Clone and install**
```bash
git clone https://github.com/heyns1000/fruitful-api-platform.git
cd fruitful-api-platform
npm install
```

2. **Configure environment**
```bash
cd backend
cp .env.example .env
# Edit .env with your settings
```

3. **Set up database**
```bash
createdb fruitful_api
npm run migrate
```

4. **Start with PM2**
```bash
pm2 start src/index.js --name fruitful-api-backend
pm2 save
pm2 startup
```

### Setup Frontend

1. **Build**
```bash
cd frontend
npm run build
```

2. **Serve with Nginx**

Create `/etc/nginx/sites-available/fruitful-api`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/fruitful-api-platform/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Vault-Level "7";
    add_header X-FAA-X13-Compliant "true";
}
```

3. **Enable and restart Nginx**
```bash
ln -s /etc/nginx/sites-available/fruitful-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### SSL with Let's Encrypt

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

## Heroku Deployment

### Frontend (Heroku + Nginx Buildpack)

1. **Create `static.json` in frontend/**
```json
{
  "root": "dist/",
  "routes": {
    "/**": "index.html"
  },
  "headers": {
    "/**": {
      "X-Frame-Options": "DENY",
      "X-Vault-Level": "7"
    }
  }
}
```

2. **Deploy**
```bash
cd frontend
heroku create fruitful-api-frontend
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static
git push heroku main
```

### Backend

```bash
cd backend
heroku create fruitful-api-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your-secret
heroku config:set VAULT_LEVEL=7
git push heroku main
```

## Vercel Deployment

### Frontend
```bash
cd frontend
vercel --prod
```

### Backend (Vercel Serverless Functions)
Note: Requires adapting Express app to serverless format.

## Environment Variables Checklist

✅ Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `VAULT_ENCRYPTION_KEY` - 32-character encryption key

✅ Recommended:
- `NODE_ENV` - production
- `VAULT_LEVEL` - 7
- `FAA_X13_COMPLIANCE_MODE` - strict
- `FAA_X13_AUDIT_LOG` - enabled

✅ Optional:
- `PORT` - Server port (default: 5000)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

## Health Checks

After deployment, verify:

1. **Backend health**
```bash
curl https://your-api.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "vaultLevel": 7,
  "faaX13Compliant": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

2. **Frontend access**
Visit your domain and test login with demo credentials:
- Email: admin@fruitful.com
- Password: admin123

## Monitoring

### Application Logs
```bash
# PM2
pm2 logs fruitful-api-backend

# Docker
docker logs -f fruitful-backend

# Cloudflare Workers
wrangler tail
```

### Database Monitoring
Monitor PostgreSQL performance and connections.

### Rate Limiting
Check rate limit headers in API responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, Cloudflare)
- Scale backend instances
- Use Redis for session storage

### Database Scaling
- Connection pooling
- Read replicas
- Query optimization

## Rollback

### Cloudflare
```bash
wrangler rollback
```

### PM2
```bash
pm2 reload fruitful-api-backend
```

### Docker
```bash
docker-compose down
docker-compose up -d
```

## Security Checklist

✅ HTTPS enabled
✅ Environment variables secured
✅ Database credentials protected
✅ Rate limiting configured
✅ CORS properly configured
✅ Security headers set
✅ VaultLevel 7 encryption active
✅ FAA-X13 audit logging enabled

## Support

For deployment issues:
- Check logs first
- Verify environment variables
- Test database connectivity
- Review security settings

Documentation: https://docs.fruitful.com
Support: support@fruitful.com

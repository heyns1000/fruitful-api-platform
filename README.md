# Fruitful API Platform

Enterprise API developer console for Fruitful Global Planet - OAuth2, REST APIs, WebSockets, API keys, usage analytics, and billing.

## 🚀 Features

### Frontend (React + Vite + Tailwind CSS)
- **JWT Authentication** - Secure user authentication
- **API Key Management** - Create, manage, and revoke API keys
- **API Playground** - Interactive testing for all endpoints
- **Real-time Analytics** - Usage metrics and performance monitoring
- **Webhook Management** - Configure event notifications
- **Billing Dashboard** - Subscription and invoice management
- **HSOMNI9000 Design System** - Modern, responsive UI

### Backend (Express + PostgreSQL)
- **RESTful APIs** - ClaimRoot, VaultMesh, SeedScrolls, PulseTrade
- **Rate Limiting** - Configurable request limits
- **VaultLevel 7 Security** - Enterprise-grade encryption
- **FAA-X13 Compliance** - Audit logging and compliance features
- **OAuth2 Support** - Industry-standard authentication
- **Webhook Delivery** - Event-driven notifications

## 🏗️ Architecture

```
fruitful-api-platform/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API service layer
│   │   ├── stores/        # State management (Zustand)
│   │   └── styles/        # Global styles
│   └── package.json
├── backend/           # Express + PostgreSQL
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth, rate limiting, etc.
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Helper utilities
│   └── package.json
└── package.json       # Root workspace config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/heyns1000/fruitful-api-platform.git
cd fruitful-api-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Backend:
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and secrets
```

4. **Setup database**
```bash
# Create PostgreSQL database
createdb fruitful_api

# Run migrations
cd backend
npm run migrate
```

5. **Start development servers**
```bash
# From root directory
npm run dev

# Or separately:
npm run frontend  # Starts on http://localhost:3000
npm run backend   # Starts on http://localhost:5000
```

## 🔑 Demo Credentials

```
Email: admin@fruitful.com
Password: admin123
```

## 📚 API Documentation

### Available APIs

#### ClaimRoot API
Manage land claims and ownership records
- Endpoint: `POST /api/playground/claim-root`
- Authentication: API Key required

#### VaultMesh API  
Secure data storage and retrieval
- Endpoint: `POST /api/playground/vault-mesh`
- Authentication: API Key required

#### SeedScrolls API
Document versioning and history tracking
- Endpoint: `POST /api/playground/seed-scrolls`
- Authentication: API Key required

#### PulseTrade API
Real-time trading and market data
- Endpoint: `POST /api/playground/pulse-trade`
- Authentication: API Key required

### Authentication

All API requests require either:
1. **JWT Token** (for console access)
   - Header: `Authorization: Bearer <token>`
   
2. **API Key** (for API endpoints)
   - Header: `X-API-Key: <your-api-key>`

### Rate Limits

- **Authentication endpoints**: 5 requests per 15 minutes
- **API endpoints**: 100 requests per 15 minutes
- **Strict endpoints**: 10 requests per minute

## 🔒 Security

### VaultLevel 7 Security
- End-to-end encryption
- Secure key storage
- HTTPS enforced in production
- Regular security audits

### FAA-X13 Compliance
- Comprehensive audit logging
- Data retention policies
- Privacy controls
- Compliance reporting

## 🌐 Deployment

### Cloudflare Workers + Pages

This application is optimized for deployment on Cloudflare's edge network.

**Frontend (Cloudflare Pages)**
```bash
cd frontend
npm run build
# Deploy dist/ directory to Cloudflare Pages
```

**Backend (Cloudflare Workers)**
```bash
cd backend
# Configure wrangler.toml
wrangler publish
```

### Traditional Hosting

**Frontend**
```bash
cd frontend
npm run build
# Serve dist/ directory with any static host
```

**Backend**
```bash
cd backend
npm start
# Use PM2, systemd, or Docker for process management
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
npm test --workspace=frontend

# Run backend tests
npm test --workspace=backend
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

- Documentation: [docs.fruitful.com](https://docs.fruitful.com)
- Email: support@fruitful.com
- Issues: [GitHub Issues](https://github.com/heyns1000/fruitful-api-platform/issues)

## 🏆 HSOMNI9000 Design System

This project uses the HSOMNI9000 design system featuring:
- Vault-themed color palette
- Responsive grid system
- Accessible components
- Dark mode optimized
- VaultLevel 7 security indicators

---

**Built with ❤️ for Fruitful Global Planet**

*VaultLevel 7 • FAA-X13 Compliant • HSOMNI9000 Design*

# Acquisitions API

A secure Node.js authentication API built with Express, featuring advanced security via Arcjet and flexible database connectivity supporting both Neon Local (development) and Neon Cloud (production) environments.

## 🏗️ Architecture

- **Framework**: Express.js 5.1.0 with ES Modules
- **Database**: PostgreSQL via Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM with migrations
- **Authentication**: JWT with secure HTTP-only cookies
- **Security**: Arcjet (bot detection, rate limiting, security policies)
- **Logging**: Winston with structured logging
- **Validation**: Zod schemas

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Neon account with API key

### Development Setup (with Neon Local)

1. **Clone and setup environment**:
   ```bash
   git clone <repository-url>
   cd acquisitions
   cp .env.development .env
   ```

2. **Configure Neon credentials**:
   ```bash
   # Edit .env and add your Neon credentials:
   NEON_API_KEY=your_neon_api_key_here
   NEON_PROJECT_ID=your_neon_project_id_here  
   PARENT_BRANCH_ID=your_parent_branch_id_here
   ARCJET_KEY=your_arcjet_key_here
   ```

3. **Start development environment**:
   ```bash
   npm run docker:dev
   ```

This will:
- Start Neon Local proxy (creates ephemeral database branch)
- Build and run the application in development mode
- Enable hot reloading for code changes
- Make the API available at `http://localhost:3000`

4. **Verify it's working**:
   ```bash
   curl http://localhost:3000/health
   ```

5. **Stop development environment**:
   ```bash
   npm run docker:dev:down
   ```

## 🔧 Environment Configuration

### Development (.env.development)
```env
# Server
NODE_ENV=development  
PORT=3000
LOG_LEVEL=debug

# Database - Neon Local (automatically configured)
DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=require

# Neon Local Config
NEON_API_KEY=your_neon_api_key
NEON_PROJECT_ID=your_neon_project_id  
PARENT_BRANCH_ID=your_parent_branch_id

# Security
JWT_SECRET=dev-jwt-secret-key-change-in-production
ARCJET_KEY=your_arcjet_key
```

### Production (.env.production)
```env
# Server
NODE_ENV=production
PORT=3000  
LOG_LEVEL=info

# Database - Neon Cloud
DATABASE_URL=postgresql://user:password@ep-xyz-pooler.region.aws.neon.tech/dbname?sslmode=require

# Security (MUST use secure values)
JWT_SECRET=your-super-secure-jwt-secret
ARCJET_KEY=your_arcjet_production_key
```

## 🐳 Docker Commands

| Command | Description |
|---------|-------------|
| `npm run docker:dev` | Start development with Neon Local |
| `npm run docker:dev:down` | Stop development and cleanup volumes |
| `npm run docker:prod` | Start production (detached) |
| `npm run docker:prod:down` | Stop production |
| `npm run docker:build:dev` | Build development image only |
| `npm run docker:build:prod` | Build production image only |

## 🌍 Development vs Production

### Development Environment
- **Database**: Neon Local proxy creates ephemeral branches
- **Benefits**:
  - Fresh database on each restart
  - No need to manage connection strings  
  - Automatic cleanup when containers stop
  - Hot reloading enabled
  - Debug logging enabled
  - Relaxed security for development

### Production Environment  
- **Database**: Direct connection to Neon Cloud
- **Features**:
  - Multi-stage Docker builds for optimization
  - Non-root user for security
  - Health checks and restart policies
  - Resource limits and logging rotation
  - Production-grade security headers
  - Optional Nginx reverse proxy

## 📡 API Endpoints

### Authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login  
- `POST /api/auth/sign-out` - User logout

### System
- `GET /health` - Health check
- `GET /api` - API status

### Example Usage

**Register a user**:
```bash
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com", 
    "password": "securepass123",
    "role": "user"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

## 🛡️ Security Features

- **Arcjet Integration**: Advanced bot detection and rate limiting
- **Role-based Rate Limits**:
  - Guest: 5 requests/minute
  - User: 10 requests/minute  
  - Admin: 20 requests/minute
- **JWT Authentication**: HTTP-only secure cookies
- **Password Hashing**: bcrypt with salt rounds
- **Security Headers**: Helmet.js integration
- **CORS**: Configurable cross-origin policies

## 🗄️ Database

### Schema
- **Users Table**: id, name, email, password, role, timestamps

### Migrations
```bash
# Generate migration
npm run db:generate

# Apply migrations (in container)
docker exec acquisitions-app-dev npm run db:migrate

# Database studio
npm run db:studio
```

## 🔍 Monitoring & Logging

### Health Checks
- Application: `GET /health`
- Docker health checks configured for both services
- Automatic restarts on failure

### Logging
- **Development**: Console + file logging (debug level)
- **Production**: Structured JSON logging (info level) 
- **Log Files**: `logs/error.log`, `logs/combined.log`
- **HTTP Requests**: Morgan middleware integration

### Log Rotation (Production)
- Max size: 10MB per file
- Keep 3 files maximum
- JSON format for log aggregation

## 🚀 Deployment

### Production Deployment

1. **Prepare environment variables**:
   ```bash
   export DATABASE_URL="postgresql://user:password@your-neon-url..."
   export JWT_SECRET="your-super-secure-jwt-secret"
   export ARCJET_KEY="your-production-arcjet-key"
   ```

2. **Deploy**:
   ```bash
   npm run docker:prod
   ```

3. **Verify deployment**:
   ```bash
   curl http://localhost:3000/health
   ```

### Cloud Deployment (AWS/GCP/Azure)
- Use the production Dockerfile target
- Set environment variables via cloud secrets management
- Configure load balancer health checks to `/health`
- Use managed PostgreSQL (Neon Cloud) for database

## 🔧 Local Development (Non-Docker)

```bash
# Install dependencies
npm install

# Start local development
npm run dev

# Lint and format
npm run lint
npm run format
```

## ⚠️ Environment Variables Reference

### Required for Development
- `NEON_API_KEY`: Your Neon API key
- `NEON_PROJECT_ID`: Your Neon project ID
- `PARENT_BRANCH_ID`: Parent branch for ephemeral branches
- `ARCJET_KEY`: Arcjet security key

### Required for Production  
- `DATABASE_URL`: Full Neon Cloud connection string
- `JWT_SECRET`: Secure JWT signing key
- `ARCJET_KEY`: Arcjet production key

### Optional
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (default: info)
- `JWT_EXPIRES_IN`: Token expiration (default: 1d)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Start development environment: `npm run docker:dev`
4. Make your changes
5. Run tests and linting: `npm run lint`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Useful Links

- [Neon Database](https://neon.tech/)
- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Arcjet Security](https://arcjet.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
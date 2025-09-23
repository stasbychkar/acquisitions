# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Architecture Overview

This is a Node.js authentication API built with Express.js 5.1.0 using ES modules. The application follows a clean architecture pattern with clear separation of concerns:

### Core Structure
- **Entry Point**: `src/index.js` → `src/server.js` → `src/app.js`
- **Architecture Pattern**: MVC with service layer (Controller → Service → Model)
- **Module System**: ES modules with path aliases via Node.js imports map
- **Path Aliases**: Use import aliases like `#config/*`, `#controllers/*`, `#middleware/*`, etc.

### Key Components
- **Database**: PostgreSQL with Drizzle ORM, dual environment support (Neon Local for dev, Neon Cloud for prod)
- **Authentication**: JWT tokens stored in HTTP-only cookies with bcrypt password hashing
- **Security**: Arcjet integration with role-based rate limiting, bot detection, and security policies
- **Logging**: Winston with structured logging, Morgan for HTTP request logging
- **Validation**: Zod schemas for request validation

### Security Architecture
- **Arcjet Middleware**: Applied globally with role-based rate limits (guest: 5/min, user: 10/min, admin: 20/min)
- **Security Headers**: Helmet.js for standard security headers
- **CORS**: Configurable cross-origin policies
- **JWT Strategy**: HTTP-only cookies for secure token storage

## Common Development Commands

### Development Environment (Preferred)
```bash
# Start development with Neon Local (creates ephemeral database branch)
npm run docker:dev

# Stop development environment and cleanup
npm run docker:dev:down
```

### Production Environment
```bash
# Start production environment (requires .env.production)
npm run docker:prod

# Stop production environment
npm run docker:prod:down
```

### Local Development (Non-Docker)
```bash
# Install dependencies
npm install

# Start with hot reload
npm run dev

# Start production mode locally
npm start
```

### Database Operations
```bash
# Generate new migration
npm run db:generate

# Apply migrations (run inside container for Docker setups)
npm run db:migrate
# OR for Docker environments:
docker exec acquisitions-app-dev npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Code Quality
```bash
# Lint code
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### Docker Commands
```bash
# Build specific images
npm run docker:build:dev
npm run docker:build:prod

# View logs
docker logs -f acquisitions-app-dev    # Development
docker logs -f acquisitions-app-prod   # Production
```

## Development Environment Setup

### Required Environment Variables
Create `.env.development` from template with:
- `NEON_API_KEY`: Your Neon API key
- `NEON_PROJECT_ID`: Your Neon project ID  
- `PARENT_BRANCH_ID`: Parent branch for ephemeral branches
- `ARCJET_KEY`: Arcjet security key

### Database Strategy
- **Development**: Uses Neon Local proxy that creates ephemeral database branches
- **Production**: Direct connection to Neon Cloud
- **Benefits**: Fresh database on each dev restart, automatic cleanup, no connection string management

## Code Organization Patterns

### Import Aliases
All source code uses Node.js import aliases:
```javascript
import logger from '#config/logger.js';
import authRoutes from '#routes/auth.routes.js';
import securityMiddleware from '#middleware/security.middleware.js';
```

### Service Layer Pattern
Controllers delegate business logic to services:
```
Controller → Service → Model
```

### File Structure Convention
```
src/
├── config/          # Configuration (database, logger, arcjet)
├── controllers/     # Request handlers
├── middleware/      # Custom middleware (security, auth)
├── models/         # Drizzle ORM models/schemas
├── routes/         # Express route definitions
├── services/       # Business logic layer
├── utils/          # Utility functions (jwt, cookies, format)
└── validations/    # Zod validation schemas
```

### API Endpoints
- Authentication: `/api/auth/sign-up`, `/api/auth/sign-in`, `/api/auth/sign-out`
- Health: `/health`, `/api`
- Users: `/api/users/*` (protected routes)

## Testing and Debugging

### Health Checks
```bash
# Check application health
curl http://localhost:3000/health

# Check API status
curl http://localhost:3000/api
```

### Database Testing
```bash
# Test database connection inside dev container
docker exec acquisitions-app-dev npm run db:studio
```

### Security Testing
The application includes role-based rate limiting. Test with different user roles to see varying limits.

## Important Notes

### Drizzle ORM Usage
- Schema files are in `src/models/*.js`
- Migrations output to `./drizzle` directory
- Use `drizzle-kit` commands for schema management

### Arcjet Security
- Global security middleware applies to all routes
- Role-based rate limiting automatically adjusts based on user authentication
- Bot detection and security policies run on all requests

### Dual Database Environment
- Development automatically uses Neon Local with ephemeral branches
- Production requires manual Neon Cloud connection string setup
- Database schema is shared between environments via Drizzle migrations
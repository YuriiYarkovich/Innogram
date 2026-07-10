# Innogram - Social Media Application

A modern social media application built with microservices architecture.

## Project Structure

```
innogram/
├── apps/
│   ├── core_microservice/          # NestJS API Gateway & Business Logic
│   ├── auth_microservice/          # Express.js Authentication Service
│   ├── notifications_consumer_microservice/  # NestJS Notifications Service
│   └── client_app/                 # Next.js Frontend Application
├── packages/
│   ├── shared/                     # Shared utilities and constants
│   └── types/                      # Shared TypeScript types
├── scripts/                       # Build and deployment scripts
├── docker/                        # Docker configurations
└── .github/workflows/             # CI/CD pipelines
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)
- Docker and Docker Compose

## Environment Setup

Create a local environment file before starting containers:

```bash
cp .env.example .env
```

Edit `.env` and set real values for secrets and OAuth:

- `JWT_SECRET`
- `SESSION_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`

For local Google OAuth through nginx, `GOOGLE_CALLBACK_URL` must match the URL configured in Google Cloud, usually:

```bash
GOOGLE_CALLBACK_URL=http://localhost/api/auth/google/callback
```

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start infrastructure services:**

   ```bash
   npm run docker:infra
   ```

   This starts only PostgreSQL, Redis, and MinIO. Wait until they are healthy:

   ```bash
   docker compose ps
   ```

3. **Run database migrations manually:**

   ```bash
   npm run db:migrate:docker
   ```

   This uses the `core_microservice` image to execute TypeORM migrations against the running PostgreSQL container. Run this after infrastructure is healthy and before starting the app services.

4. **Initialize the MinIO bucket manually:**

   ```bash
   npm run minio:init
   ```

   This runs a temporary `minio/mc` container on the Compose network and creates `S3_BUCKET` if it does not already exist.

5. **Start application services:**

   ```bash
   npm run docker:app
   ```

   This starts `core_microservice`, `auth_microservice`, `client_app`, and `nginx`.

6. **Open the application:**

   ```text
   http://localhost
   ```

   If `HTTP_PORT` is changed in `.env`, use that port instead.

## Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all services
- `npm run test` - Run tests for all services
- `npm run lint` - Lint all services
- `npm run type-check` - Type check all services
- `npm run docker:infra` - Start PostgreSQL, Redis, and MinIO
- `npm run db:migrate:docker` - Run database migrations inside a temporary core service container
- `npm run minio:init` - Create the configured MinIO bucket using a temporary MinIO client container
- `npm run docker:app` - Start backend, frontend, and nginx services
- `npm run docker:up` - Start every Compose service
- `npm run docker:down` - Stop all Compose services

## Docker Startup Details

The database migration and MinIO bucket setup are manual steps, not Compose services:

- Database migrations are run by `scripts/run-db-migrations.sh`.
- MinIO bucket initialization is run by `scripts/init-minio.sh`.

Do not run these operations during Docker image builds. Image builds do not have access to the runtime PostgreSQL and MinIO containers, and builds should not mutate environment-specific infrastructure.

Recommended full startup sequence:

```bash
npm install
cp .env.example .env
# edit .env
npm run docker:infra
docker compose ps
npm run db:migrate:docker
npm run minio:init
npm run docker:app
```

To rebuild app images after code changes:

```bash
docker compose build core_microservice auth_microservice client_app
npm run docker:app
```

To stop all containers:

```bash
npm run docker:down
```

To remove persisted PostgreSQL, Redis, and MinIO data as well:

```bash
docker compose down -v
```

## Services

### Core Microservice (Port 3001)
- NestJS API Gateway
- Main business logic
- Database operations
- Real-time features

### Authentication Microservice (Port 3002)
- Express.js service
- JWT token management
- OAuth 2.0 integration
- Session management

### Notifications Consumer (Port 3003)
- NestJS service
- Message processing
- Email notifications
- Real-time notifications

### Client Application (Port 3000)
- Next.js frontend
- React components
- User interface
- Real-time updates

## Development Workflow

1. Each feature should be focused and testable
2. Follow microservices architecture patterns
3. Implement features incrementally
4. Write tests for each component

## Contributing

1. Create a feature branch: `git checkout -b feature/INO-XXX`
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Create a Pull Request

## License

MIT

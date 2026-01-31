# Backend Setup Instructions

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## Environment Setup

1. **Create `.env` file** in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
UPLOAD_DIR=uploads

MONGODB_URI="mongodb+srv://hushkihamza9_db_user:nZrtZr3UV5eF7KOa@sctsinstitute-cluster.6r0szmk.mongodb.net/?appName=sctsinstitute-cluster"
MONGODB_DB="sctsinstitute"
```

**IMPORTANT**: The `.env` file is in `.gitignore` and should NEVER be committed. The MongoDB password will be rotated after setup.

## Database Setup

The backend uses MongoDB Atlas. The connection is configured in `.env` file.

## Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

## Seeding Data

**Seed the database** with initial data:
```bash
npm run seed
```

This will:
- Clear all existing collections
- Create an admin user (email: `admin@sctsinstitute.com`, password: `Admin@12345`)
- Create sample hero slides, services, courses, partners, and page content

**Note**: Seed only runs in development mode (`NODE_ENV=development`)

## Verify Installation

1. Server should start on `http://localhost:5000`
2. Test health endpoint: `http://localhost:5000/api/v1/health`
3. Should return: `{"success":true,"data":null,"message":"API is running"}`

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run lint` - Run ESLint

## API Endpoints

All API endpoints are prefixed with `/api/v1`:

### Public Endpoints
- `GET /api/v1/health` - Health check
- `GET /api/v1/home/hero-slides` - Get hero slides
- `GET /api/v1/services` - Get all services
- `GET /api/v1/services/:slug` - Get service by slug
- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:slug` - Get course by slug
- `GET /api/v1/partners` - Get all partners
- `GET /api/v1/pages/:key` - Get page content by key
- `POST /api/v1/contact` - Submit contact form

### Authentication
- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Admin Endpoints (Protected)
All admin endpoints require Bearer token authentication.

See Postman collection for full API documentation.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB Atlas cluster is running
- Verify `MONGODB_URI` in `.env` is correct
- Check network access in MongoDB Atlas (IP whitelist)

### Port Already in Use
- Change PORT in `.env` file
- Or stop the process using port 5000

### Seed Fails
- Ensure `NODE_ENV=development` in `.env`
- Check MongoDB connection is working
- Verify all environment variables are set

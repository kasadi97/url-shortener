# 🔗 URL Shortener

A modern, full-stack URL shortener application with click tracking analytics, built with Node.js, Express, PostgreSQL, and vanilla JavaScript.

## ✨ Features

- 🎯 **URL Shortening**: Convert long URLs into short, shareable links
- 📊 **Click Analytics**: Track click counts and view detailed statistics
- 🛡️ **Security**: Rate limiting, input validation, and security headers
- 📱 **Responsive Design**: Clean, mobile-friendly interface
- ⚡ **Fast Performance**: Optimized database queries and caching
- 🐳 **Docker Ready**: Easy deployment with Docker and Docker Compose

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM and migrations
- **Helmet** - Security middleware
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing
- **Validator.js** - Input validation
- **nanoid** - Unique ID generation

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with modern features
- **Vanilla JavaScript** - Client-side functionality
- **Fetch API** - HTTP requests

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Prisma Migrate** - Database migrations

## 📁 Project Structure

```
url-shortener/
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── database.js      # Database connection
│   │   ├── routes/
│   │   │   └── url.js           # URL routes
│   │   └── index.js             # Main server file
│   ├── prisma/
│   │   ├── migrations/          # Database migrations
│   │   └── schema.prisma        # Database schema
│   ├── package.json
│   ├── .env                     # Environment variables
│   └── .env.example            # Environment template
├── public/
│   ├── index.html              # Home page
│   └── stats.html              # Statistics page
├── Dockerfile                  # Docker configuration
├── docker-compose.yml         # Docker Compose setup
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kasadi97/url-shortener.git
   cd url-shortener
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   NODE_ENV=development
   PORT=5000
   ```

4. **Set up database**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 🐳 Docker Setup

### Using Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Manual Docker Build
```bash
docker build -t url-shortener .
docker run -p 5000:5000 url-shortener
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Create Short URL
```http
POST /api/url/shorten
```
**Request Body:**
```json
{
  "longUrl": "https://example.com/very/long/url"
}
```
**Response:**
```json
{
  "shortCode": "abc123",
  "longUrl": "https://example.com/very/long/url",
  "message": "URL shortened successfully",
  "existing": false
}
```

#### Get All Statistics
```http
GET /api/url/stats?page=1&limit=50
```
**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "longUrl": "https://example.com",
      "shortCode": "abc123",
      "clicks": 42,
      "createdAt": "2025-09-22T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalUrls": 100,
    "totalClicks": 1250,
    "averageClicks": 12.5
  }
}
```

#### Get Specific URL Statistics
```http
GET /api/url/stats/:shortCode
```
**Response:**
```json
{
  "id": 1,
  "longUrl": "https://example.com",
  "shortCode": "abc123",
  "clicks": 42,
  "createdAt": "2025-09-22T12:00:00.000Z"
}
```

#### Redirect to Original URL
```http
GET /:shortCode
```
Redirects to the original URL and increments click counter.

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-22T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "database": "Connected"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5000 |

### Security Features

- **Rate Limiting**: 100 requests per 15 minutes (general), 20 requests per 15 minutes (URL shortening)
- **Input Validation**: URL format validation and sanitization
- **Security Headers**: Helmet.js with CSP
- **CORS**: Configurable cross-origin policies

## 🧪 Development

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### Development Server
```bash
npm run dev
```

## 📊 Features Overview

### Home Page (`/`)
- Clean, focused interface for URL shortening
- Real-time validation and error handling
- Responsive design for all devices

### Statistics Page (`/stats`)
- Comprehensive analytics dashboard
- Summary metrics (total URLs, clicks, averages)
- Detailed URL listing with click counts
- Auto-refresh functionality
- Pagination support

## 🚀 Deployment

### Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Render
1. Create new Web Service
2. Connect repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`

### Heroku
1. Create Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy via Git

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Repository](https://github.com/kasadi97/url-shortener)
- [Issues](https://github.com/kasadi97/url-shortener/issues)
- [Prisma Documentation](https://prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)

---

Built with ❤️ by [kasadi97](https://github.com/kasadi97)
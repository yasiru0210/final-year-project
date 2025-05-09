# Face Recognition Backend

This is the backend service for the Face Recognition System, built with Express.js and Node.js.

## Features

- User authentication and authorization
- Face image upload and storage
- Face recognition and matching
- Admin dashboard and management
- Secure file handling
- Comprehensive logging
- Error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example` and fill in your configuration
5. Start MongoDB service
6. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Face Recognition
- `POST /api/faces/upload` - Upload a face image
- `POST /api/faces/search` - Search for matching faces

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/faces` - Get all faces
- `DELETE /api/admin/faces/:id` - Delete a face
- `GET /api/admin/stats` - Get system statistics

## Security

- JWT-based authentication
- Password hashing with bcrypt
- File upload restrictions
- CORS protection
- Helmet security headers
- Input validation

## Error Handling

The API uses a consistent error response format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Logging

The application uses Winston for logging. Logs are stored in:
- `error.log` - Error logs
- `combined.log` - All logs

## Testing

Run tests with:
```bash
npm test
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 
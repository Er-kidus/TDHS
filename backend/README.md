# Pharmacy Management System - Backend

A comprehensive Go-based backend API for national pharmacy management with EMR integration.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Multi-role user system (admin, pharmacist, technician, doctor, patient)
- **Pharmacy Management**: Multi-pharmacy support with inventory tracking
- **Prescription Management**: Electronic prescription processing and validation
- **Inventory Management**: Real-time stock tracking, low-stock alerts, expiry monitoring
- **EMR Integration**: FHIR-compliant external system integration
- **Security**: HIPAA-compliant data handling and encryption

## Tech Stack

- **Go**: Primary backend language
- **Gin**: HTTP web framework
- **PostgreSQL**: Primary database
- **JWT**: Authentication tokens
- **GORM**: Database ORM (planned)
- **Redis**: Caching and session management
- **Docker**: Containerization

## Getting Started

### Prerequisites

- Go 1.21+
- PostgreSQL 15+
- Redis (optional, for caching)
- Docker (optional)

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your database credentials and JWT secret

4. Install dependencies:
   ```bash
   go mod download
   ```

5. Run database migrations:
   ```bash
   psql -U username -d pharmacy_db -f migrations/001_create_users_table.sql
   psql -U username -d pharmacy_db -f migrations/002_create_pharmacies_table.sql
   # ... continue with all migration files
   ```

6. Start the server:
   ```bash
   go run main.go
   ```

The API will be available at `http://localhost:8080`

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh JWT token

### User Management

- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update current user profile

### Pharmacy Management

- `GET /api/v1/pharmacies` - List all pharmacies
- `GET /api/v1/pharmacies/:id` - Get pharmacy by ID
- `POST /api/v1/pharmacies` - Create new pharmacy
- `PUT /api/v1/pharmacies/:id` - Update pharmacy
- `DELETE /api/v1/pharmacies/:id` - Delete pharmacy

### Medication Management

- `GET /api/v1/medications` - List all medications
- `GET /api/v1/medications/:id` - Get medication by ID
- `POST /api/v1/medications` - Create new medication
- `PUT /api/v1/medications/:id` - Update medication
- `DELETE /api/v1/medications/:id` - Delete medication

### Prescription Management

- `GET /api/v1/prescriptions` - List all prescriptions
- `GET /api/v1/prescriptions/:id` - Get prescription by ID
- `POST /api/v1/prescriptions` - Create new prescription
- `PUT /api/v1/prescriptions/:id` - Update prescription
- `DELETE /api/v1/prescriptions/:id` - Delete prescription
- `POST /api/v1/prescriptions/:id/fill` - Fill prescription
- `GET /api/v1/prescriptions/patient/:patientId` - Get patient prescriptions

### Inventory Management

- `GET /api/v1/inventory` - List inventory (requires pharmacy_id query param)
- `GET /api/v1/inventory/:id` - Get inventory item by ID
- `POST /api/v1/inventory` - Create inventory item
- `PUT /api/v1/inventory/:id` - Update inventory item
- `DELETE /api/v1/inventory/:id` - Delete inventory item
- `GET /api/v1/inventory/low-stock` - Get low stock items
- `POST /api/v1/inventory/restock` - Restock item

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

The system uses the following main tables:

- `users` - User accounts and authentication
- `pharmacies` - Pharmacy information
- `medications` - Drug catalog
- `inventory` - Stock management
- `prescriptions` - Prescription records
- `prescription_items` - Individual prescription medications
- `emr_systems` - External EMR system configurations
- `emr_integration_logs` - EMR integration audit logs

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- SQL injection prevention

## Development

### Running Tests

```bash
go test ./...
```

### Building for Production

```bash
go build -o pharmacy-api main.go
```

### Docker Support

```bash
docker build -t pharmacy-backend .
docker run -p 8080:8080 pharmacy-backend
```

## Environment Variables

See `.env.example` for all available configuration options.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

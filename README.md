# National Pharmacy Management System

A comprehensive, national-level pharmacy management system integrated with EMR (Electronic Medical Records) systems, built with modern web technologies.

## Overview

This system provides a complete solution for pharmacy operations including prescription management, inventory tracking, user management, and EMR integration. It's designed to scale at a national level while maintaining security, compliance, and ease of use.

## Architecture

The system follows a microservices architecture with:

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Go with Gin framework and PostgreSQL
- **Database**: PostgreSQL with Redis for caching
- **Integration**: FHIR standard for EMR interoperability
- **Deployment**: Docker containers with docker-compose

## Key Features

### Core Functionality
- **Multi-role User System**: Admin, Pharmacist, Technician, Doctor, Patient roles
- **Prescription Management**: Electronic prescribing, filling, and tracking
- **Inventory Management**: Real-time stock tracking, low-stock alerts, expiry management
- **Pharmacy Management**: Multiple pharmacy support with centralized administration
- **Medication Database**: Comprehensive medication information with NDC codes
- **EMR Integration**: FHIR-compliant integration with external EMR systems

### Security & Compliance
- **Authentication**: JWT-based authentication with role-based access control
- **HIPAA Compliance**: Secure handling of patient health information
- **Audit Logging**: Complete audit trail for all operations
- **Data Encryption**: Encrypted data at rest and in transit

### Technical Features
- **Scalable Architecture**: Microservices design for horizontal scaling
- **Real-time Updates**: WebSocket support for live updates
- **API-first Design**: RESTful APIs with comprehensive documentation
- **Responsive UI**: Mobile-friendly interface with modern UX patterns

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Go 1.21+ (for local development)
- PostgreSQL 15+ (if not using Docker)

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Pharmacy
   ```

2. Start all services:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Database: localhost:5432

### Local Development

#### Backend Setup
```bash
cd backend
go mod download
go run main.go
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Database Setup
```bash
# Create database
createdb pharmacy_db

# Run migrations
migrate -path migrations -database "postgres://user:password@localhost/pharmacy_db?sslmode=disable" up
```

## API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Token refresh

### User Management
- `GET /api/v1/users` - List users (admin only)
- `GET /api/v1/users/{id}` - Get user details
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

### Pharmacy Management
- `GET /api/v1/pharmacies` - List pharmacies
- `POST /api/v1/pharmacies` - Create pharmacy
- `PUT /api/v1/pharmacies/{id}` - Update pharmacy
- `DELETE /api/v1/pharmacies/{id}` - Delete pharmacy

### Prescription Management
- `GET /api/v1/prescriptions` - List prescriptions
- `POST /api/v1/prescriptions` - Create prescription
- `PUT /api/v1/prescriptions/{id}/fill` - Fill prescription
- `GET /api/v1/prescriptions/patient/{id}` - Get patient prescriptions

### Inventory Management
- `GET /api/v1/inventory` - List inventory items
- `POST /api/v1/inventory` - Add inventory item
- `PUT /api/v1/inventory/{id}` - Update inventory
- `GET /api/v1/inventory/low-stock` - Get low stock items
- `POST /api/v1/inventory/restock` - Restock item

## Database Schema

The system uses the following main tables:

- `users` - User accounts and authentication
- `pharmacies` - Pharmacy information
- `medications` - Medication catalog
- `prescriptions` - Prescription records
- `prescription_items` - Individual prescription items
- `inventory` - Pharmacy inventory
- `emr_systems` - EMR system configurations
- `emr_integration_logs` - Integration audit logs

## Configuration

### Environment Variables

#### Backend
```bash
DATABASE_URL=postgres://user:password@localhost:5432/pharmacy_db?sslmode=disable
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
PORT=8080
ENVIRONMENT=development
```

#### Frontend
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NODE_ENV=development
```

## Security Considerations

1. **Change Default Credentials**: Always change default passwords and JWT secrets
2. **Use HTTPS**: Enable SSL/TLS in production
3. **Database Security**: Use strong database passwords and restrict access
4. **Regular Updates**: Keep dependencies updated for security patches
5. **Audit Logs**: Monitor audit logs for suspicious activities

## EMR Integration

The system supports FHIR (Fast Healthcare Interoperability Resources) standard for EMR integration:

- **FHIR Resources**: Patient, Medication, MedicationRequest, Observation
- **Authentication**: OAuth 2.0 for secure API access
- **Data Mapping**: Automatic mapping between internal and FHIR formats
- **Error Handling**: Comprehensive error handling and retry logic

## Development Guidelines

### Code Structure
```
Pharmacy/
|-- backend/
|   |-- internal/
|   |   |-- api/          # API handlers and routes
|   |   |-- models/       # Data models
|   |   |-- services/     # Business logic
|   |   |-- config/       # Configuration
|   |   |-- database/     # Database setup
|   |   |-- utils/        # Utilities
|   |-- migrations/       # Database migrations
|   |-- main.go          # Entry point
|-- frontend/
|   |-- src/
|   |   |-- app/         # Next.js pages
|   |   |-- components/   # React components
|   |   |-- lib/         # Utilities and API client
|   |   |-- types/       # TypeScript types
|   |   |-- hooks/       # Custom hooks
|-- docker-compose.yml    # Docker configuration
```

### Contributing
1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Ensure all tests pass before submitting

## Deployment

### Production Deployment
1. Set up production database
2. Configure environment variables
3. Build and deploy containers
4. Set up load balancer
5. Configure monitoring and logging
6. Set up backup and disaster recovery

### Monitoring
- Application metrics with Prometheus
- Log aggregation with ELK stack
- Error tracking with Sentry
- Performance monitoring with APM tools

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Integration with more EMR systems
- [ ] AI-powered drug interaction checking
- [ ] Telepharmacy support
- [ ] Blockchain for prescription tracking

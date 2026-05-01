# 🏥 National Pharmacy + EMR System - Go Backend

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- PostgreSQL 15+
- Redis (optional)

### Setup
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgres://your_user:your_password@localhost:5432/pharmacy_db?sslmode=disable

# Install dependencies
go mod download

# Run services (each in separate terminal)
go run cmd/auth-service/main.go
go run cmd/pharmacy-service/main.go
go run cmd/emr-service/main.go
go run cmd/prescription-service/main.go
go run cmd/api-gateway/main.go
```

## 📋 Services

### 🔐 Auth Service (Port 8001)
- User authentication & authorization
- JWT token generation
- Role-based access control
- Multi-tenant support

### 💊 Pharmacy Service (Port 8002)
- Medicine inventory management
- Stock tracking & alerts
- Sales & billing
- Supplier management
- Purchase orders

### 🧑‍⚕️ EMR Service (Port 8003)
- Patient management
- Medical records
- Allergies & conditions
- Patient search

### 🧾 Prescription Service (Port 8004)
- E-prescription creation
- QR code generation
- Prescription validation
- Fill prescription workflow

### 🌐 API Gateway (Port 8080)
- Single entry point for all services
- Request routing & load balancing
- CORS handling

## 🗄️ Database Schema

The system uses PostgreSQL with the following main tables:
- Users (multi-role authentication)
- Hospitals (multi-tenant support)
- Medicines (national drug registry)
- PharmacyInventory (stock tracking)
- Patients (medical records)
- Prescriptions (e-prescriptions)
- SalesTransactions (billing)
- InventoryTransactions (audit trail)
- Suppliers (procurement)
- PurchaseOrders (ordering)
- MedicalRecords (EMR)
- Allergies & Conditions (patient history)

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - User profile
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

### Pharmacy Management
- `GET /api/v1/pharmacy/medicines` - List medicines
- `POST /api/v1/pharmacy/medicines` - Add medicine
- `PUT /api/v1/pharmacy/medicines/:id` - Update medicine
- `GET /api/v1/pharmacy/inventory` - Get inventory
- `GET /api/v1/pharmacy/inventory/low-stock` - Low stock alerts
- `POST /api/v1/pharmacy/sales` - Create sale
- `GET /api/v1/pharmacy/suppliers` - List suppliers

### EMR (Electronic Medical Records)
- `GET /api/v1/emr/patients` - List patients
- `POST /api/v1/emr/patients` - Create patient
- `GET /api/v1/emr/patients/:id` - Get patient
- `GET /api/v1/emr/patients/search` - Search patients
- `GET /api/v1/emr/patients/:id/medical-history` - Medical history
- `POST /api/v1/emr/patients/:id/medical-records` - Add medical record

### Prescriptions
- `GET /api/v1/prescriptions` - List prescriptions
- `POST /api/v1/prescriptions` - Create prescription
- `GET /api/v1/prescriptions/:id/qr` - Generate QR code
- `POST /api/v1/prescriptions/:id/validate` - Validate prescription
- `POST /api/v1/prescriptions/:id/fill` - Fill prescription

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing (bcrypt)
- CORS support
- Input validation
- SQL injection protection (GORM)

## 📊 Features

### Multi-Tenant Architecture
- Hospital-based data isolation
- Role-based permissions
- API key authentication

### Drug Traceability
- Batch number tracking
- Expiry date monitoring
- Controlled substance tracking
- QR code verification

### Real-time Features
- Low stock alerts
- Prescription notifications
- Inventory synchronization

### Audit Trail
- Every inventory change logged
- Prescription fill tracking
- User action logging
- Transaction history

## 🚀 Production Deployment

### Environment Variables
```bash
DATABASE_URL=postgres://user:pass@host:5432/dbname?sslmode=require
JWT_SECRET=your-production-secret-key
REDIS_URL=redis://host:6379
```

### Docker Support
```dockerfile
# Add Dockerfile for containerization
# Use multi-stage builds for optimization
```

### Monitoring
- Health check endpoints on all services
- Structured logging
- Metrics collection ready
- Error tracking

## 🧪 Testing

### Unit Tests
```bash
go test ./...
```

### Integration Tests
```bash
go test -tags=integration ./...
```

### API Testing
Use Postman or similar tool with the API Gateway at http://localhost:8080

## 📈 Scalability

- Microservices architecture
- Horizontal scaling ready
- Database connection pooling
- Redis caching support
- Load balancer compatible

## 🎯 Next Steps

1. **Add Redis caching** for frequently accessed data
2. **Implement message queue** for async processing
3. **Add WebSocket support** for real-time updates
4. **Implement rate limiting** for API protection
5. **Add monitoring & metrics** for production
6. **Create Docker images** for containerization
7. **Set up CI/CD pipeline** for automated deployment

This backend provides a solid foundation for a national-level pharmacy + EMR integrated system with enterprise-grade features.

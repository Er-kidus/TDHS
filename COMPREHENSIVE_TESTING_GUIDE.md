# Comprehensive Testing Guide - National Pharmacy Management System

## Table of Contents
1. [System Setup](#system-setup)
2. [Mock Credentials](#mock-credentials)
3. [Feature Testing Checklist](#feature-testing-checklist)
4. [Step-by-Step Testing Workflow](#step-by-step-testing-workflow)
5. [Advanced Features Testing](#advanced-features-testing)
6. [Troubleshooting Guide](#troubleshooting-guide)

---

## System Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed (for Go backend)
- Go 1.19+ installed (for microservices)

### Starting the System

#### Option 1: Simple Backend (Recommended for Testing)
```bash
# Terminal 1: Start Simple Backend
cd d:/Software_Engineering_5th_Year_Second_semester/Pharmacy/backend
node simple-backend.js

# Terminal 2: Start Frontend
cd d:/Software_Engineering_5th_Year_Second_semester/Pharmacy/frontend
npm run dev
```

#### Option 2: Full Go Microservices
```bash
# Terminal 1: Start Go Backend Services
cd d:/Software_Engineering_5th_Year_Second_semester/Pharmacy/go-backend
go run cmd/auth-service/main.go

# Terminal 2: Start Frontend
cd d:/Software_Engineering_5th_Year_Second_semester/Pharmacy/frontend
npm run dev
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Registration**: http://localhost:3000/register
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard

---

## Mock Credentials

### Pre-configured Test Users

#### 1. Pharmacy Manager (Admin)
- **Email**: admin@pharmacy.test
- **Password**: admin123
- **Role**: admin
- **Pharmacy ID**: 1

#### 2. Pharmacist
- **Email**: pharmacist@pharmacy.test
- **Password**: pharm123
- **Role**: pharmacist
- **Pharmacy ID**: 1

#### 3. Pharmacy Technician
- **Email**: tech@pharmacy.test
- **Password**: tech123
- **Role**: technician
- **Pharmacy ID**: 1

### New Registration Test Data
- **Email**: newuser@test.com
- **Password**: newuser123
- **First Name**: Test
- **Last Name**: User
- **Phone**: +1234567890
- **Role**: pharmacist

---

## Feature Testing Checklist

### Phase 1: UI/UX Features

#### Registration Process
- [ ] **Premium Design**: Verify modern gradient background and card layout
- [ ] **Form Validation**: Test email format, password strength, required fields
- [ ] **Toast Notifications**: Check success/error toast messages
- [ ] **Pharmacy Dropdown**: Verify pharmacy selection loads correctly
- [ ] **Form Persistence**: Test form data survives page refresh

#### Login Process
- [ ] **Modern UI**: Verify clean login interface
- [ ] **Authentication**: Test login with mock credentials
- [ ] **Error Handling**: Test invalid credentials error messages
- [ ] **Redirect**: Verify successful login redirects to dashboard

#### Dashboard Overview
- [ ] **Professional Layout**: Verify sidebar navigation and header
- [ ] **User Profile**: Check user info display in header
- [ ] **Real-time Clock**: Verify current time updates
- [ ] **Role Badge**: Check user role display

### Phase 2: Professional Logic Features

#### Form Handling
- [ ] **React Hook Form**: Test form validation and submission
- [ ] **Zod Validation**: Verify schema validation works
- [ ] **Loading States**: Check skeleton loaders during data fetch
- [ ] **Error Recovery**: Test error handling and recovery

#### Toast Notifications
- [ ] **Success Messages**: Verify green toast notifications
- [ ] **Error Messages**: Verify red error notifications
- [ ] **Info Messages**: Verify blue info notifications
- [ ] **Auto-dismiss**: Check toast auto-dismiss functionality

### Phase 3: EMR Integration Features

#### Command Palette Search
- [ ] **Keyboard Shortcut**: Press Ctrl+K or Cmd+K to open
- [ ] **Patient Search**: Search by National ID, Phone, or Name
- [ ] **Debounced Search**: Test search debouncing (300ms delay)
- [ ] **Keyboard Navigation**: Use arrow keys to navigate results
- [ ] **Patient Selection**: Select patient and verify success message

#### QR Code System
- [ ] **QR Generation**: Verify QR codes are generated for prescriptions
- [ ] **Hash Verification**: Test MD5 hash verification system
- [ ] **Anti-fraud**: Check QR code validation works
- [ ] **Prescription Validity**: Verify 6-month validity period

#### Inventory Management
- [ ] **Low Stock Alerts**: Verify visual indicators for low stock
- [ ] **Expiry Tracking**: Check expiry date warnings
- [ ] **Batch Information**: Verify batch number tracking
- [ ] **Controlled Substances**: Check controlled substance flags

### Phase 4: Modern Features

#### Interactive Analytics
- [ ] **Sales Trend Chart**: Verify line chart with revenue data
- [ ] **Drug Category Chart**: Test pie/bar chart switching
- [ ] **Custom Tooltips**: Check hover tooltips on charts
- [ ] **Time Range Selector**: Test 7d/30d/90d/1y range buttons
- [ ] **Mock Data**: Verify realistic data generation

#### Real-time Updates
- [ ] **Optimistic UI**: Test instant prescription status updates
- [ ] **Inventory Updates**: Verify real-time quantity adjustments
- [ ] **Status Indicators**: Check loading states during updates
- [ ] **Error Rollback**: Test automatic rollback on failed updates

#### PDF Export
- [ ] **Receipt Export**: Test PDF receipt generation
- [ ] **Invoice Export**: Test PDF invoice generation
- [ ] **Prescription Export**: Test PDF prescription printing
- [ ] **Inventory Report**: Test PDF inventory reports
- [ ] **Print Functionality**: Verify print button works

#### Responsive Tables
- [ ] **Desktop View**: Verify table layout on desktop
- [ ] **Mobile View**: Test card view on mobile screens
- [ ] **Sticky Columns**: Check first column sticks on horizontal scroll
- [ ] **Touch Interactions**: Test touch-friendly mobile interactions

---

## Step-by-Step Testing Workflow

### Step 1: System Startup
1. **Start Backend**: Run `node simple-backend.js` in backend folder
2. **Start Frontend**: Run `npm run dev` in frontend folder
3. **Verify Services**: Ensure both services are running without errors
4. **Access Application**: Navigate to http://localhost:3000

### Step 2: Registration Testing
1. **Navigate**: Go to http://localhost:3000/register
2. **Test Validation**: Try submitting empty form
3. **Test Email Format**: Enter invalid email (should show error)
4. **Test Password**: Enter weak password (should show error)
5. **Successful Registration**: Fill form with valid data and submit
6. **Verify Toast**: Check for success notification
7. **Redirect**: Verify redirect to login page

### Step 3: Login Testing
1. **Navigate**: Go to http://localhost:3000/login
2. **Test Invalid Login**: Use wrong credentials
3. **Verify Error**: Check error message appears
4. **Test Valid Login**: Use admin@pharmacy.test / admin123
5. **Verify Success**: Check redirect to dashboard
6. **Check Profile**: Verify user info in header

### Step 4: Dashboard Testing
1. **Overview Tab**: Verify stats cards and charts
2. **Interactive Charts**: Click on chart elements and tooltips
3. **Command Palette**: Press Ctrl+K and search for patients
4. **Sidebar Navigation**: Click through all sidebar items
5. **Responsive Design**: Resize browser to test mobile layout

### Step 5: Advanced Features Testing
1. **Analytics**: Test chart interactions and time range selectors
2. **PDF Export**: Test export functionality from dashboard
3. **Real-time Updates**: Test status updates (if available)
4. **Mobile Tables**: Test responsive table behavior

---

## Advanced Features Testing

### Command Palette Deep Testing
```javascript
// Test these search queries in command palette (Ctrl+K):
1. Search by National ID: "1234567890123"
2. Search by Phone: "+1234567890"
3. Search by Name: "John"
4. Search by Partial Name: "Jo"
5. Test keyboard navigation: Arrow keys, Enter, Escape
```

### Analytics Testing
```javascript
// Test these interactions:
1. Hover over chart points to see tooltips
2. Click time range buttons (7d, 30d, 90d, 1y)
3. Switch between pie and bar charts
4. Verify chart data updates dynamically
```

### PDF Export Testing
```javascript
// Test these export scenarios:
1. Export sample receipt data
2. Export sample invoice data
3. Export sample prescription data
4. Export sample inventory data
5. Verify PDF files download correctly
```

### Mobile Responsiveness Testing
```javascript
// Test these screen sizes:
1. Desktop (1920x1080): Full table view
2. Tablet (768x1024): Responsive layout
3. Mobile (375x667): Card view for tables
4. Verify touch interactions work on mobile
```

---

## Troubleshooting Guide

### Common Issues

#### Backend Connection Issues
**Problem**: Frontend can't connect to backend
**Solution**: 
- Verify backend is running on port 8080
- Check for CORS errors in browser console
- Ensure API URLs are correct in frontend code

#### Login Issues
**Problem**: Login fails with valid credentials
**Solution**:
- Check backend logs for authentication errors
- Verify user exists in backend data
- Clear browser localStorage and try again

#### Chart Rendering Issues
**Problem**: Charts don't display data
**Solution**:
- Check Recharts library installation
- Verify mock data generation functions work
- Check browser console for JavaScript errors

#### PDF Export Issues
**Problem**: PDF export doesn't work
**Solution**:
- Verify html2canvas library is installed
- Check browser console for export errors
- Test with different data sets

#### Mobile Layout Issues
**Problem**: Mobile layout doesn't work properly
**Solution**:
- Verify Tailwind CSS responsive utilities
- Check viewport meta tag in HTML
- Test with browser developer tools mobile simulation

### Debug Commands

#### Frontend Debugging
```bash
# Check for build errors
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Check for linting issues
npm run lint
```

#### Backend Debugging
```bash
# Check Go backend compilation
go build ./...

# Run with verbose logging
go run cmd/auth-service/main.go -v

# Test API endpoints
curl http://localhost:8080/api/v1/auth/login
```

### Browser Developer Tools
1. **Console**: Check for JavaScript errors
2. **Network**: Verify API requests and responses
3. **Elements**: Inspect HTML structure and CSS
4. **Application**: Check localStorage and cookies

---

## Testing Success Criteria

### Basic Functionality
- [ ] User can register successfully
- [ ] User can login with valid credentials
- [ ] Dashboard loads with user data
- [ ] All navigation elements work

### Advanced Features
- [ ] Command palette search works
- [ ] Interactive charts display data
- [ ] PDF export generates files
- [ ] Mobile layout is responsive

### Error Handling
- [ ] Form validation works
- [ ] Error messages display correctly
- [ ] System recovers from errors
- [ ] Loading states show properly

### Performance
- [ ] Pages load within 3 seconds
- [ ] Charts render smoothly
- [ ] Search results appear quickly
- [ ] Mobile performance is acceptable

---

## Final Verification Checklist

Before completing testing, verify:

1. **All mock credentials work** for login
2. **All features are accessible** from the dashboard
3. **Error handling works** for invalid inputs
4. **Mobile layout is functional** on small screens
5. **PDF exports generate** correctly
6. **Charts display data** properly
7. **Command palette search** finds patients
8. **Toast notifications** appear for all actions
9. **Responsive design** works across devices
10. **System is stable** during extended use

---

**Testing Complete!** The National Pharmacy Management System is ready for demonstration and deployment.

# Pharmacy Management System - Frontend

A Next.js-based frontend for the national pharmacy management system with EMR integration.

## Features

- **Authentication**: Login, registration, and JWT token management
- **Dashboard**: Role-based dashboard with relevant metrics and alerts
- **User Management**: Multi-role user system (admin, pharmacist, technician, doctor, patient)
- **Prescription Management**: Electronic prescription viewing and management
- **Inventory Management**: Real-time stock tracking and low-stock alerts
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Update `.env.local` with your API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main dashboard
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable components
├── lib/                  # Utilities and API client
│   └── api.ts           # API configuration
├── types/                # TypeScript type definitions
│   └── index.ts         # Main types file
└── hooks/                # Custom React hooks
```

## API Integration

The frontend communicates with the backend API using Axios. All API calls are automatically authenticated using JWT tokens stored in localStorage.

### Authentication Flow

1. User logs in via `/login`
2. JWT token is stored in localStorage
3. Token is automatically included in all subsequent API requests
4. Unauthorized responses (401) automatically redirect to login

### Role-Based Access

The dashboard and features adapt based on user roles:
- **Patients**: View prescriptions and personal information
- **Doctors**: Create and manage prescriptions
- **Pharmacists**: Process prescriptions and manage inventory
- **Technicians**: Assist with prescription processing
- **Administrators**: Full system access

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL

## Styling

The project uses Tailwind CSS for styling with a custom color scheme. Primary colors are configured in `tailwind.config.js`.

## TypeScript

All components are written in TypeScript with strict type checking. Type definitions are centralized in `src/types/index.ts`.

## Development Notes

- All pages use the `'use client'` directive for client-side rendering
- API calls include error handling and loading states
- Forms use React Hook Form with Zod validation
- Responsive design is implemented using Tailwind CSS classes

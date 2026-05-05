import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PatientProvider } from "@/contexts/PatientContext";
import { AppShell } from "@/components/layout/AppShell";
import Login from "@/pages/Login";
import ReceptionDashboard from "@/pages/dashboard/ReceptionDashboard";
import DoctorDashboard from "@/pages/dashboard/DoctorDashboard";
import NurseDashboard from "@/pages/dashboard/NurseDashboard";
import PharmacistDashboard from "@/pages/dashboard/PharmacistDashboard";
import LabDashboard from "@/pages/dashboard/LabDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import SuperAdminDashboard from "../super-admi-portal/SuperAdminDashboard";
import PatientPortal from "@/pages/PatientPortal";
import PatientRegister from "@/pages/PatientRegister";
import PatientRegistration from "@/pages/PatientRegistration";
import PatientRegistry from "@/pages/PatientRegistry";
import Appointments from "@/pages/Appointments";
import ClinicalEncounter from "@/pages/ClinicalEncounter";
import WardBoard from "@/pages/WardBoard";
import EmergencyBoard from "@/pages/EmergencyBoard";
import Billing from "@/pages/Billing";
import AuditAI from "@/pages/AuditAI";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const DashboardRouter = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case "doctor": return <DoctorDashboard />;
    case "nurse": return <NurseDashboard />;
    case "admin": return <Navigate to="/admin" replace />;
    case "superadmin": return <Navigate to="/super-admin" replace />;
    case "pharmacist": return <PharmacistDashboard />;
    case "lab": return <LabDashboard />;
    case "patient": return <PatientPortal />;
    default: return <ReceptionDashboard />;
  }
};

const AuthenticatedRoutes = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <AppShell>
      <Routes>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/registration" element={<PatientRegistration />} />
        <Route path="/patients" element={<PatientRegistry />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/clinical" element={<ClinicalEncounter />} />
        <Route path="/lab" element={<LabDashboard />} />
        <Route path="/pharmacy" element={<PharmacistDashboard />} />
        <Route path="/ward" element={<WardBoard />} />
        <Route path="/emergency" element={<EmergencyBoard />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/audit" element={<AuditAI />} />
        <Route path="/portal" element={<PatientPortal />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/patient/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PatientRegister />} />
      <Route path="/admin" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" replace />} />
      <Route path="/super-admin" element={isAuthenticated ? <SuperAdminDashboard /> : <Navigate to="/login" replace />} />
      <Route path="/super-admin/onboarding-queue" element={isAuthenticated ? <SuperAdminDashboard /> : <Navigate to="/login" replace />} />
      <Route path="/super-admin/onboarding-queue/:applicationId" element={isAuthenticated ? <SuperAdminDashboard /> : <Navigate to="/login" replace />} />
      <Route path="/*" element={<AuthenticatedRoutes />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <PatientProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </PatientProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

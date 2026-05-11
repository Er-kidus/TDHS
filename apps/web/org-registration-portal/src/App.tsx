import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import LoginClient from "../Logintemp";
import RegisterPage from "../registration";
import RequestAccessPage from "../requestaccsess";
import { PortalPreferencesProvider } from "./components/layout/PortalPreferences";
import { PortalShell } from "./components/layout/PortalShell";
import PendingAccessPage from "./dashboard/pages/PendingAccessPage.tsx";
import OrganizationalDomainPage from "./dashboard/pages/OrganizationalDomainPage.tsx";
import UpdateRequestPage from "./dashboard/pages/UpdateRequestPage.tsx";
import RequestStatusPage from "./dashboard/pages/RequestStatusPage.tsx";
import { getOrgAuthToken } from "./lib/orgApplicationApi";

function RequireOrgAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const token = useMemo(() => getOrgAuthToken(), []);

  if (!token) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return children;
}

export default function App() {
  return (
    <PortalPreferencesProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginClient />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <RequireOrgAuth>
                <PortalShell />
              </RequireOrgAuth>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard/pending-access" replace />} />
            <Route path="/request-access" element={<RequestAccessPage />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/pending-access" replace />} />
            <Route path="/dashboard/pending-access" element={<PendingAccessPage />} />
            <Route path="/dashboard/organizational-domain" element={<OrganizationalDomainPage />} />
            <Route path="/dashboard/update-request" element={<UpdateRequestPage />} />
            <Route path="/dashboard/request-status" element={<RequestStatusPage />} />
            <Route path="*" element={<Navigate to="/dashboard/pending-access" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PortalPreferencesProvider>
  );
}

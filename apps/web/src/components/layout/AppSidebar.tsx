import React from "react";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Users, Calendar, Stethoscope, FlaskConical,
  Pill, CreditCard, Building2, Siren, Shield, UserCircle,
  ShieldAlert, ClipboardPlus, Activity, Heart,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  titleKey: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", titleKey: "nav.dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["reception", "doctor", "nurse", "admin", "pharmacist", "lab"] },
  { title: "Registration", titleKey: "nav.registration", url: "/registration", icon: ClipboardPlus, roles: ["reception", "admin"] },
  { title: "Patients", titleKey: "nav.patients", url: "/patients", icon: Users, roles: ["reception", "doctor", "nurse", "admin"] },
  { title: "Appointments", titleKey: "nav.appointments", url: "/appointments", icon: Calendar, roles: ["reception", "doctor", "nurse"] },
  { title: "Clinical", titleKey: "nav.clinical", url: "/clinical", icon: Stethoscope, roles: ["doctor", "nurse"] },
  { title: "Laboratory", titleKey: "nav.lab", url: "/lab", icon: FlaskConical, roles: ["doctor", "lab", "nurse"] },
  { title: "Pharmacy", titleKey: "nav.pharmacy", url: "/pharmacy", icon: Pill, roles: ["doctor", "pharmacist"] },
  { title: "Ward", titleKey: "nav.ward", url: "/ward", icon: Building2, roles: ["doctor", "nurse", "admin"] },
  { title: "Emergency", titleKey: "nav.emergency", url: "/emergency", icon: Siren, roles: ["doctor", "nurse", "reception"] },
  { title: "Billing", titleKey: "nav.billing", url: "/billing", icon: CreditCard, roles: ["reception", "admin"] },
  { title: "Admin", titleKey: "nav.admin", url: "/admin", icon: Shield, roles: ["admin", "superadmin"] },
  { title: "Super Admin", titleKey: "nav.superadmin", url: "/super-admin", icon: ShieldAlert, roles: ["superadmin"] },
  { title: "Audit & AI", titleKey: "nav.audit", url: "/audit", icon: Activity, roles: ["admin", "doctor"] },
  { title: "Patient Portal", titleKey: "nav.portal", url: "/portal", icon: UserCircle, roles: ["patient"] },
];

export const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const filteredItems = navItems.filter(item =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg medical-gradient flex items-center justify-center flex-shrink-0">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">Tenadam</p>
              <p className="text-[10px] text-muted-foreground truncate">Healthcare System</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50 touch-target"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="text-[10px] text-muted-foreground">
            <p>v1.0.0 • © 2026 Tenadam</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

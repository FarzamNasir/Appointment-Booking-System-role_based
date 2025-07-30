import { Calendar, Home, Users, UserCheck, Clock, MessageCircle, Mic } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

const userMenuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Appointments",
    url: "/appointments",
    icon: Calendar,
  },
  {
    title: "AI Chat",
    url: "/chat",
    icon: MessageCircle,
  },
];

const adminMenuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Patients",
    url: "/patients",
    icon: Users,
  },
  {
    title: "Doctors",
    url: "/doctors",
    icon: UserCheck,
  },
  {
    title: "Availability",
    url: "/availability",
    icon: Clock,
  },
  {
    title: "Appointments",
    url: "/appointments",
    icon: Calendar,
  },
];
import { useContext } from "react";
import { RoleContext } from "../contexts/RoleContext";
import { useNavigate } from "react-router-dom";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useContext(RoleContext);
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Sidebar className="glass border-r border-glass-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-medical-primary to-medical-accent rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">MedFlow AI</h2>
            <p className="text-sm text-slate-400">Healthcare Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 font-medium">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(role === "user" ? userMenuItems : adminMenuItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`text-slate-200 hover:bg-glass-light hover:text-white transition-all duration-200 rounded-xl ${
                      location.pathname === item.url ? 'bg-gradient-to-r from-medical-primary/20 to-medical-accent/20 text-medical-accent border-l-2 border-medical-accent' : ''
                    }`}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <button
              className="w-full mt-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              onClick={handleLogout}
            >
              Switch Role
            </button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}


import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DataProvider, useData } from "@/contexts/DataContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import Index from "./pages/Index";
import PatientsPage from "./pages/PatientsPage";
import DoctorsPage from "./pages/DoctorsPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ChatPage from "./pages/ChatPage";
import VoiceNotePage from "./pages/VoiceNotePage";
import NotFound from "./pages/NotFound";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import AdminAuthPage from "./pages/AdminAuthPage";
import { RoleProvider, RoleContext } from "./contexts/RoleContext";

const queryClient = new QueryClient();


const AppContent = () => {
  const { loading } = useData();
  const { role } = React.useContext(RoleContext);
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show role selection if no role is chosen
  // Always show role selection page on first load (no sidebar)
  if (!role) {
    return <RoleSelectionPage />;
  }

  // User role: only user pages
  if (role === "user") {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/user-home" element={<Index />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/voice-note" element={<VoiceNotePage />} />
              <Route path="/voice-note/:id" element={<VoiceNotePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Admin role: show admin auth if not logged in (handled in AdminAuthPage)
  if (role === "admin") {
    // Check for JWT token in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const isAuthenticated = !!token;
    if (!isAuthenticated) {
      // Show only the auth page, no sidebar
      return (
        <main className="flex min-h-screen items-center justify-center">
          <Routes>
            <Route path="/" element={<AdminAuthPage />} />
            <Route path="/admin-auth" element={<AdminAuthPage />} />
            <Route path="*" element={<AdminAuthPage />} />
          </Routes>
        </main>
      );
    }
    // Authenticated admin: show sidebar and admin pages
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin-home" element={<Index />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/availability" element={<AvailabilityPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return <NotFound />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </DataProvider>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

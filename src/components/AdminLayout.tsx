import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Users, Megaphone, Bell, BarChart3, DollarSign, MessageSquare, ChevronLeft, Menu, X, Dumbbell, UtensilsCrossed, Music, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminNav = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/workouts", icon: Dumbbell, label: "Workouts" },
  { to: "/admin/meals", icon: UtensilsCrossed, label: "Meals" },
  { to: "/admin/music", icon: Music, label: "Music" },
  { to: "/admin/gyms", icon: MapPin, label: "Gyms" },
  { to: "/admin/announcements", icon: Megaphone, label: "Announcements" },
  { to: "/admin/push", icon: Bell, label: "Push" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/revenue", icon: DollarSign, label: "Revenue" },
  { to: "/admin/feedback", icon: MessageSquare, label: "Feedback" },
];


const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-background/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen w-64 bg-card border-r border-border z-50 transition-transform lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Fit<span className="text-primary">AI</span> Admin</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden touch-target" aria-label="Close sidebar"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1" aria-label="Admin navigation">
          {adminNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors touch-target",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full touch-target text-xs" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="w-3 h-3 mr-1" /> User App
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden touch-target" aria-label="Open sidebar">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-sm font-medium text-muted-foreground">Admin Panel</h2>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

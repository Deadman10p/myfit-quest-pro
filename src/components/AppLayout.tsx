import React from "react";
import { NavLink as RouterNavLink, useLocation, Outlet } from "react-router-dom";
import { Home, Dumbbell, UtensilsCrossed, MessageCircle, TrendingUp, Bell, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/workouts", icon: Dumbbell, label: "Workouts" },
  { to: "/nutrition", icon: UtensilsCrossed, label: "Nutrition" },
  { to: "/coach", icon: MessageCircle, label: "Coach" },
  { to: "/progress", icon: TrendingUp, label: "Progress" },
];

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">
          Fit<span className="text-primary">AI</span>
        </h1>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <RouterNavLink to="/admin" className="p-2 rounded-lg hover:bg-secondary touch-target" aria-label="Admin panel">
              <Shield className="w-5 h-5 text-primary" />
            </RouterNavLink>
          )}
          <RouterNavLink to="/notifications" className="relative p-2 rounded-lg hover:bg-secondary touch-target" aria-label={`Notifications, ${unreadCount} unread`}>
            <Bell className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </RouterNavLink>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border safe-bottom" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-md mx-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <RouterNavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors touch-target",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </RouterNavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;

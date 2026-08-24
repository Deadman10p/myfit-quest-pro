import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import AppLayout from "@/components/AppLayout";
import AdminLayout from "@/components/AdminLayout";
import SplashScreen from "@/pages/SplashScreen";
import LoginScreen from "@/pages/LoginScreen";
import SignupScreen from "@/pages/SignupScreen";
import ForgotPasswordScreen from "@/pages/ForgotPasswordScreen";
import OnboardingScreen from "@/pages/OnboardingScreen";
import Dashboard from "@/pages/Dashboard";
import WorkoutScreen from "@/pages/WorkoutScreen";
import NutritionScreen from "@/pages/NutritionScreen";
import CoachScreen from "@/pages/CoachScreen";
import ProgressScreen from "@/pages/ProgressScreen";
import NotificationsScreen from "@/pages/NotificationsScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import GymFinderScreen from "@/pages/GymFinderScreen";
import FeedbackScreen from "@/pages/FeedbackScreen";
import GamificationScreen from "@/pages/GamificationScreen";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";
import AdminPush from "@/pages/admin/AdminPush";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminRevenue from "@/pages/admin/AdminRevenue";
import AdminFeedback from "@/pages/admin/AdminFeedback";
import AdminWorkouts from "@/pages/admin/AdminWorkouts";
import AdminMeals from "@/pages/admin/AdminMeals";
import AdminMusic from "@/pages/admin/AdminMusic";
import AdminGyms from "@/pages/admin/AdminGyms";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <SplashScreen />;

  const needsOnboarding = user && profile && !profile.onboarded;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={needsOnboarding ? "/onboarding" : "/dashboard"} /> : <SplashScreen />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginScreen />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupScreen />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/onboarding" element={user ? <OnboardingScreen /> : <Navigate to="/login" />} />

      <Route element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <AppLayout />) : <Navigate to="/login" />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workouts" element={<WorkoutScreen />} />
        <Route path="/nutrition" element={<NutritionScreen />} />
        <Route path="/coach" element={<CoachScreen />} />
        <Route path="/progress" element={<ProgressScreen />} />
        <Route path="/notifications" element={<NotificationsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/gyms" element={<GymFinderScreen />} />
        <Route path="/feedback" element={<FeedbackScreen />} />
        <Route path="/leaderboard" element={<GamificationScreen />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="workouts" element={<AdminWorkouts />} />
        <Route path="meals" element={<AdminMeals />} />
        <Route path="music" element={<AdminMusic />} />
        <Route path="gyms" element={<AdminGyms />} />

        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="push" element={<AdminPush />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="revenue" element={<AdminRevenue />} />
        <Route path="feedback" element={<AdminFeedback />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

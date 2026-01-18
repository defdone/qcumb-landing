import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { useRouter, usePathname } from "next/navigation";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import CreatorDashboard from "@/pages/creator-dashboard";
import FanView from "@/pages/fan-view";
import CreatorProfile from "@/pages/creator-profile";
import SettingsPage from "@/pages/settings";
import Purchases from "@/pages/purchases";
import FanHome from "@/pages/fan-home";
import PostView from "@/pages/post-view";
import NotFound from "@/pages/not-found";
import AdminPanel from "@/pages/admin";

function ProtectedRoute({
  component: Component,
  allowedRoles,
}: {
  component: React.ComponentType;
  allowedRoles?: ("creator" | "fan" | "admin")[];
}) {
  const { isAuthenticated, currentUser, isReady } = useAuth();
  const [, setLocation] = useLocation();

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    // Admin może mieć dostęp do wszystkiego
    if (currentUser.role === "admin") {
      return <Component />;
    }
    const redirectPath = currentUser.role === "creator" ? "/creator" : "/";
    return <Redirect to={redirectPath} />;
  }

  if (allowedRoles && !currentUser) {
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={FanHome} />
      <Route path="/creator">
        <ProtectedRoute component={CreatorDashboard} allowedRoles={["creator"]} />
      </Route>
      <Route path="/fan">
        <Redirect to="/" />
      </Route>
      <Route path="/explore">
        <ProtectedRoute component={FanView} allowedRoles={["fan", "creator"]} />
      </Route>
      <Route path="/creator/:id">
        <ProtectedRoute component={CreatorProfile} allowedRoles={["fan", "creator"]} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route path="/purchases">
        <ProtectedRoute component={Purchases} allowedRoles={["fan", "creator"]} />
      </Route>
      <Route path="/post/:id">
        <ProtectedRoute component={PostView} allowedRoles={["fan", "creator"]} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminPanel} allowedRoles={["admin"]} />
      </Route>
      <Route path="/login">
        <Redirect to="/login" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const router = useRouter();
  const pathname = usePathname() || "/home";

  const useNextLocation = () => {
    const location = pathname.startsWith("/home")
      ? pathname.replace("/home", "") || "/"
      : pathname;

    const navigate = (to: string) => {
      const target = to.startsWith("/") ? to : `/${to}`;
      router.push(`/home${target === "/" ? "" : target}`);
    };

    return [location, navigate] as [string, (to: string) => void];
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
          <AuthProvider>
            <WouterRouter hook={useNextLocation}>
              <div className="min-h-screen bg-background">
                <Navbar />
                <Router />
              </div>
            </WouterRouter>
            <Toaster />
          </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

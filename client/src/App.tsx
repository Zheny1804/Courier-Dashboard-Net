import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useAppWebSocket } from "@/hooks/use-websocket";
import { AppLayout } from "@/components/layout";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import InputPage from "@/pages/input-page";
import ApproxStatsPage from "@/pages/approx-stats-page";
import AccurateStatsPage from "@/pages/accurate-stats-page";

function ProtectedRouter() {
  const { user, isLoading } = useAuth();
  
  // Custom hook that binds WebSocket updates to React Query invalidation
  useAppWebSocket();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={InputPage} />
        <Route path="/approx" component={ApproxStatsPage} />
        <Route path="/accurate" component={AccurateStatsPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ProtectedRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

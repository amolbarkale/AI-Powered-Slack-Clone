import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { ChannelProvider } from "./contexts/ChannelContext";
import { ChatProvider } from "./contexts/ChatContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WorkspaceProvider>
        <ChannelProvider>
          <ChatProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ChatProvider>
        </ChannelProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

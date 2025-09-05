import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RemindersDemo from "./pages/RemindersDemo";
import ScheduleDemo from "./pages/ScheduleDemo";
import OrderingDemo from "./pages/OrderingDemo";
import HelperRemindersDemo from "./pages/HelperRemindersDemo";
import SOSDemo from "./pages/SOSDemo";
import SOSContactsDemo from "./pages/SOSContactsDemo";
import MedicalMapDemo from "./pages/MedicalMapDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo/reminders" element={<RemindersDemo />} />
            <Route path="/demo/schedule" element={<ScheduleDemo />} />
            <Route path="/demo/order" element={<OrderingDemo />} />
            <Route path="/demo/helper-reminders" element={<HelperRemindersDemo />} />
            <Route path="/demo/sos" element={<SOSDemo />} />
            <Route path="/demo/sos/contacts" element={<SOSContactsDemo />} />
            <Route path="/demo/medical-map" element={<MedicalMapDemo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

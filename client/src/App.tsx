import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DashboardPage from "./pages/DashboardPage";
import FAQPage from "./pages/FAQPage";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import AnalysisPage from "./pages/AnalysisPage";
import LibraryPage from "./pages/LibraryPage";
import HistoryPage from "./pages/HistoryPage";
import ComparisonPage from "./pages/ComparisonPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={LandingPage} />
      <Route path={"/dashboard"}>
        <DashboardLayout>
          <DashboardPage />
        </DashboardLayout>
      </Route>
      <Route path={"/editor"}>
        <DashboardLayout>
          <Home />
        </DashboardLayout>
      </Route>
      <Route path={"/analysis"}>
        <DashboardLayout>
          <AnalysisPage />
        </DashboardLayout>
      </Route>
      <Route path={"/library"}>
        <DashboardLayout>
          <LibraryPage />
        </DashboardLayout>
      </Route>
      <Route path={"/history"}>
        <DashboardLayout>
          <HistoryPage />
        </DashboardLayout>
      </Route>
      <Route path={"/comparison"}>
        <DashboardLayout>
          <ComparisonPage />
        </DashboardLayout>
      </Route>
      <Route path={"/settings"}>
        <DashboardLayout>
          <SettingsPage />
        </DashboardLayout>
      </Route>
      <Route path={"/profile"}>
        <DashboardLayout>
          <ProfilePage />
        </DashboardLayout>
      </Route>
      <Route path={"/about"}>
        <DashboardLayout>
          <AboutPage />
        </DashboardLayout>
      </Route>
      <Route path={"/contact"}>
        <DashboardLayout>
          <ContactPage />
        </DashboardLayout>
      </Route>
      <Route path={"/faq"}>
        <DashboardLayout>
          <FAQPage />
        </DashboardLayout>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

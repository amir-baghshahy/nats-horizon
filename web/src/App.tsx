import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useDirection } from "./hooks/useDirection";
import Layout from "./components/Layout";
import { PageLoading } from "./components/ui/PageState";
import SetupWizard from "./pages/setup/SetupWizard";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Streams = lazy(() => import("./pages/Streams"));
const Consumers = lazy(() => import("./pages/Consumers"));
const Connections = lazy(() => import("./pages/Connections"));
const Security = lazy(() => import("./pages/Security"));
const Subjects = lazy(() => import("./pages/Subjects"));
const StreamDetail = lazy(() => import("./pages/StreamDetail"));
const ConsumerDetail = lazy(() => import("./pages/ConsumerDetail"));
const Messages = lazy(() => import("./pages/Messages"));
const KVStore = lazy(() => import("./pages/KVStore"));
const Cluster = lazy(() => import("./pages/Cluster"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Metrics = lazy(() => import("./pages/Metrics"));
const History = lazy(() => import("./pages/History"));
const Tenancy = lazy(() => import("./pages/Tenancy"));
const VisualStreamGraph = lazy(() => import("./pages/VisualStreamGraph"));

function App() {
  useDirection();
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null);
  const prevLocationRef = useRef(location);

  // Check setup status on mount
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch("/api/config/setup");
        if (res.ok) {
          const data = await res.json();
          setSetupCompleted(data.setup_completed);
        } else {
          // If endpoint doesn't exist, assume setup is completed (backward compat)
          setSetupCompleted(true);
        }
      } catch {
        // If can't reach API, assume setup is completed
        setSetupCompleted(true);
      }
    };
    checkSetup();
  }, []);

  useEffect(() => {
    if (prevLocationRef.current !== location) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => setIsTransitioning(false), 300);
      prevLocationRef.current = location;
      return () => clearTimeout(timeout);
    }
  }, [location]);

  // Show loading while checking setup
  if (setupCompleted === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-primary">
        <div className="avatar h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // Show setup wizard if not completed
  if (!setupCompleted) {
    return <SetupWizard />;
  }

  return (
    <Layout>
      <div
        className={`transition-all duration-300 ease-out ${
          isTransitioning
            ? "translate-y-4 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/streams" element={<Streams />} />
            <Route path="/streams/:name" element={<StreamDetail />} />
            <Route path="/consumers" element={<Consumers />} />
            <Route path="/consumers/:name" element={<ConsumerDetail />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/messages" element={<Messages />} />
            <Route
              path="/core-messaging"
              element={<Navigate to="/messages" replace />}
            />
            <Route path="/kv-store" element={<KVStore />} />
            <Route path="/cluster" element={<Cluster />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/visual-stream-graph" element={<VisualStreamGraph />} />
            <Route path="/history" element={<History />} />
            <Route path="/security" element={<Security />} />
            <Route path="/tenancy" element={<Tenancy />} />
          </Routes>
        </Suspense>
      </div>
    </Layout>
  );
}

export default App;

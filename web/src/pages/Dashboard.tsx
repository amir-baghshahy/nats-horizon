import { useDashboard } from "./dashboard/hooks/useDashboard";
import DashboardPage from "./dashboard/DashboardPage";

export default function Dashboard() {
  const props = useDashboard();
  return <DashboardPage {...props} />;
}

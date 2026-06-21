import { useMetrics } from "./metrics/hooks/useMetrics";
import MetricsPage from "./metrics/MetricsPage";

export default function Metrics() {
  const props = useMetrics();
  return <MetricsPage {...props} />;
}

import { useCluster } from "./cluster/hooks/useCluster";
import ClusterPage from "./cluster/ClusterPage";

export default function Cluster() {
  const props = useCluster();
  return <ClusterPage {...props} />;
}

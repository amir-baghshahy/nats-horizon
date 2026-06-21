import { useConnections } from "./connections/hooks/useConnections";
import ConnectionsPage from "./connections/ConnectionsPage";

export default function Connections() {
  const props = useConnections();
  return <ConnectionsPage {...props} />;
}

import { useHistory } from "./history/hooks/useHistory";
import HistoryPage from "./history/HistoryPage";

export default function History() {
  const props = useHistory();
  return <HistoryPage {...props} />;
}

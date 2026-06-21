import { useSecurity } from "./security/hooks/useSecurity";
import SecurityPage from "./security/SecurityPage";

export default function Security() {
  const props = useSecurity();
  return <SecurityPage {...props} />;
}

import { useTenancy } from "./tenancy/hooks/useTenancy";
import TenancyPage from "./tenancy/TenancyPage";

export default function Tenancy() {
  const props = useTenancy();
  return <TenancyPage {...props} />;
}

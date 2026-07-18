import type { AssetCriticality, Severity } from "@/generated/prisma/enums";
import { StatusBadge } from "@/components/shared/status-badge";
import { ASSET_CRITICALITY_STYLES, SEVERITY_STYLES } from "@/lib/constants";

export function SeverityBadge({ value }: { value: Severity }) {
  return <StatusBadge style={SEVERITY_STYLES[value]} />;
}

export function CriticalityBadge({ value }: { value: AssetCriticality }) {
  return <StatusBadge style={ASSET_CRITICALITY_STYLES[value]} />;
}

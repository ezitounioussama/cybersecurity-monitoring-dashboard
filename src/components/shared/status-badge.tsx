import { Badge } from "@/components/ui/badge";
import type {
  AlertStatus,
  AssetStatus,
  IncidentStatus,
  PatchStatus,
  Role,
  ThreatConfidence,
  ThreatStatus,
} from "@/generated/prisma/enums";
import {
  ALERT_STATUS_STYLES,
  ASSET_STATUS_STYLES,
  INCIDENT_STATUS_STYLES,
  PATCH_STATUS_STYLES,
  ROLE_STYLES,
  THREAT_CONFIDENCE_STYLES,
  THREAT_STATUS_STYLES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type BadgeStyle = { label: string; className: string };

/** Base renderer — all status/severity badges route their colors through this. */
export function StatusBadge({ style }: { style: BadgeStyle }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium whitespace-nowrap", style.className)}
    >
      {style.label}
    </Badge>
  );
}

export const AlertStatusBadge = ({ value }: { value: AlertStatus }) => (
  <StatusBadge style={ALERT_STATUS_STYLES[value]} />
);
export const IncidentStatusBadge = ({ value }: { value: IncidentStatus }) => (
  <StatusBadge style={INCIDENT_STATUS_STYLES[value]} />
);
export const AssetStatusBadge = ({ value }: { value: AssetStatus }) => (
  <StatusBadge style={ASSET_STATUS_STYLES[value]} />
);
export const PatchStatusBadge = ({ value }: { value: PatchStatus }) => (
  <StatusBadge style={PATCH_STATUS_STYLES[value]} />
);
export const ThreatConfidenceBadge = ({
  value,
}: {
  value: ThreatConfidence;
}) => <StatusBadge style={THREAT_CONFIDENCE_STYLES[value]} />;
export const ThreatStatusBadge = ({ value }: { value: ThreatStatus }) => (
  <StatusBadge style={THREAT_STATUS_STYLES[value]} />
);
export const RoleBadge = ({ value }: { value: Role }) => (
  <StatusBadge style={ROLE_STYLES[value]} />
);

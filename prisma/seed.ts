import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type {
  AlertStatus,
  AuditAction,
  AssetCriticality,
  AssetStatus,
  IncidentStatus,
  PatchStatus,
  Role,
  Severity,
  ThreatConfidence,
  ThreatStatus,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DEFAULT_ORG = { clerkOrgId: "sentinel-default", name: "Sentinel Security", slug: "sentinel" };

// ---------------------------------------------------------------------------
// Random helpers
// ---------------------------------------------------------------------------
const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(arr: readonly T[]): T => arr[rand(arr.length)]!;
const chance = (p: number) => Math.random() < p;
function weighted<T>(entries: [T, number][]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [value, w] of entries) {
    if ((r -= w) < 0) return value;
  }
  return entries[0]![0];
}
function daysAgo(maxDays: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - rand(maxDays));
  d.setHours(rand(24), rand(60), rand(60), 0);
  return d;
}

const SEVERITY: [Severity, number][] = [["LOW", 4], ["MEDIUM", 4], ["HIGH", 2], ["CRITICAL", 1]];
const FIRST = ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery", "Quinn", "Noor", "Yara", "Omar", "Lena", "Diego", "Mia", "Kai", "Nadia", "Theo", "Sofia"];
const LAST = ["Chen", "Patel", "Garcia", "Kim", "Haddad", "Rossi", "Novak", "Silva", "Okafor", "Dubois", "Meyer", "Costa", "Ahmed", "Ivanov", "Tanaka", "Ferrari", "Bauer", "Moreau", "Santos", "Weber"];
const OS = ["Ubuntu 22.04", "Ubuntu 24.04", "Windows Server 2022", "Windows Server 2019", "RHEL 9", "Debian 12", "Amazon Linux 2023", "macOS 14", "CentOS 7", "Windows 11"];
const HOST_ROLES = ["web", "db", "api", "cache", "worker", "mail", "dns", "vpn", "bastion", "ci"];
const HOST_ENVS = ["prod", "stage", "dev", "qa"];
const ALERT_SOURCES = ["Firewall", "IDS/IPS", "EDR", "SIEM", "WAF", "Proxy", "Cloud Trail", "Antivirus"];
const ALERT_RULES = ["ET SCAN Nmap", "ET MALWARE Cobalt Strike", "Brute Force SSH", "SQL Injection Attempt", "Suspicious PowerShell", "Port Scan Detected", "DNS Tunneling", "Data Exfiltration", "Privilege Escalation", "Ransomware Behavior"];
const ALERT_TITLES = ["Suspicious outbound connection", "Multiple failed logins", "Malware signature detected", "Unusual data transfer", "Unauthorized access attempt", "Port scan from external host", "Anomalous DNS query", "Credential dumping detected", "Lateral movement observed", "C2 beacon detected"];
const THREAT_SOURCES = ["AlienVault OTX", "AbuseIPDB", "VirusTotal", "MISP", "Recorded Future", "GreyNoise", "Spamhaus", "Emerging Threats"];
const IOC_TYPES = ["IP", "DOMAIN", "HASH", "URL"] as const;
const INCIDENT_TITLES = ["Ransomware on finance subnet", "Phishing campaign targeting staff", "Compromised service account", "Data exfiltration attempt", "DDoS against public API", "Insider policy violation", "Web shell on public server", "Credential stuffing wave", "Malware outbreak in workstations", "Cloud bucket misconfiguration"];

function randomIp(pub = false): string {
  if (pub) return `${1 + rand(223)}.${rand(256)}.${rand(256)}.${1 + rand(254)}`;
  return `10.${rand(256)}.${rand(256)}.${1 + rand(254)}`;
}
function randomCve(): string {
  return `CVE-${2019 + rand(6)}-${1000 + rand(40000)}`;
}
function cvssForSeverity(sev: Severity): number {
  const base = { LOW: 1, MEDIUM: 4, HIGH: 7, CRITICAL: 9 }[sev];
  return Math.min(10, Number((base + Math.random() * (sev === "CRITICAL" ? 1 : 2.9)).toFixed(1)));
}

async function main() {
  console.log("Seeding Sentinel SOC dashboard…");

  const org = await prisma.organization.upsert({
    where: { clerkOrgId: DEFAULT_ORG.clerkOrgId },
    update: {},
    create: { ...DEFAULT_ORG, plan: "enterprise" },
  });
  const organizationId = org.id;

  // Idempotent reset — clear this org's data in FK-safe order.
  await prisma.incidentAlert.deleteMany({ where: { incident: { organizationId } } });
  await prisma.activity.deleteMany({ where: { incident: { organizationId } } });
  await prisma.notification.deleteMany({ where: { organizationId } });
  await prisma.auditLog.deleteMany({ where: { organizationId } });
  await prisma.vulnerability.deleteMany({ where: { organizationId } });
  await prisma.alert.deleteMany({ where: { organizationId } });
  await prisma.incident.deleteMany({ where: { organizationId } });
  await prisma.asset.deleteMany({ where: { organizationId } });
  await prisma.threatFeed.deleteMany({ where: { organizationId } });
  await prisma.user.deleteMany({ where: { organizationId } });

  // Users (20) — 2 admins, 8 analysts, 10 viewers.
  const roleFor = (i: number): Role => (i < 2 ? "ADMIN" : i < 10 ? "ANALYST" : "VIEWER");
  await prisma.user.createMany({
    data: Array.from({ length: 20 }, (_, i) => {
      const name = `${FIRST[i]} ${LAST[i]}`;
      return {
        organizationId,
        clerkUserId: `seed_user_${i}`,
        email: `${FIRST[i]!.toLowerCase()}.${LAST[i]!.toLowerCase()}@sentinel.example`,
        name,
        avatarUrl: `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(name)}`,
        role: roleFor(i),
        isActive: chance(0.9),
        createdAt: daysAgo(200),
      };
    }),
  });
  const users = await prisma.user.findMany({ where: { organizationId }, select: { id: true, role: true } });
  const userIds = users.map((u) => u.id);
  const analystIds = users.filter((u) => u.role !== "VIEWER").map((u) => u.id);

  // Assets (300)
  await prisma.asset.createMany({
    data: Array.from({ length: 300 }, () => {
      const role = pick(HOST_ROLES);
      const env = pick(HOST_ENVS);
      return {
        organizationId,
        hostname: `${role}-${env}-${String(1 + rand(60)).padStart(2, "0")}`,
        ipAddress: randomIp(chance(0.2)),
        operatingSystem: pick(OS),
        criticality: weighted<AssetCriticality>([["LOW", 3], ["MEDIUM", 4], ["HIGH", 2], ["CRITICAL", 1]]),
        status: weighted<AssetStatus>([["ACTIVE", 7], ["UNDER_MAINTENANCE", 1], ["INACTIVE", 1], ["DECOMMISSIONED", 1]]),
        ownerId: chance(0.8) ? pick(userIds) : null,
        lastScanAt: chance(0.85) ? daysAgo(30) : null,
        createdAt: daysAgo(200),
      };
    }),
  });
  const assets = await prisma.asset.findMany({ where: { organizationId }, select: { id: true } });
  const assetIds = assets.map((a) => a.id);

  // Vulnerabilities (500)
  await prisma.vulnerability.createMany({
    data: Array.from({ length: 500 }, () => {
      const severity = weighted(SEVERITY);
      return {
        organizationId,
        cve: randomCve(),
        cvssScore: cvssForSeverity(severity),
        severity,
        assetId: pick(assetIds),
        patchStatus: weighted<PatchStatus>([["UNPATCHED", 4], ["IN_PROGRESS", 2], ["PATCHED", 3], ["NOT_APPLICABLE", 1]]),
        exploitAvailable: chance(0.2),
        description: `${severity} severity issue affecting a network service. Remediation recommended.`,
        discoveredAt: daysAgo(90),
      };
    }),
  });

  // Alerts (200)
  await prisma.alert.createMany({
    data: Array.from({ length: 200 }, () => {
      const severity = weighted(SEVERITY);
      const status = weighted<AlertStatus>([["OPEN", 4], ["ACKNOWLEDGED", 2], ["RESOLVED", 3], ["FALSE_POSITIVE", 1]]);
      const detectedAt = daysAgo(90);
      return {
        organizationId,
        title: pick(ALERT_TITLES),
        description: "Automatically generated detection from a monitoring sensor.",
        severity,
        status,
        source: pick(ALERT_SOURCES),
        sourceIp: randomIp(chance(0.5)),
        destinationIp: randomIp(),
        destinationAssetId: chance(0.6) ? pick(assetIds) : null,
        rule: pick(ALERT_RULES),
        rawLog: `[${detectedAt.toISOString()}] ${pick(ALERT_RULES)} src=${randomIp(true)} dst=${randomIp()} action=alert`,
        detectedAt,
        resolvedAt: status === "RESOLVED" ? new Date(detectedAt.getTime() + 3_600_000) : null,
        createdAt: detectedAt,
      };
    }),
  });
  const alerts = await prisma.alert.findMany({ where: { organizationId }, select: { id: true } });
  const alertIds = alerts.map((a) => a.id);

  // Incidents (100) + activities + linked alerts
  for (let i = 0; i < 100; i++) {
    const createdAt = daysAgo(90);
    const analystId = chance(0.75) ? pick(analystIds) : null;
    const incident = await prisma.incident.create({
      data: {
        organizationId,
        title: `${pick(INCIDENT_TITLES)} #${i + 1}`,
        description: "Investigation tracking record with response coordination notes.",
        severity: weighted(SEVERITY),
        status: weighted<IncidentStatus>([["NEW", 3], ["INVESTIGATING", 3], ["CONTAINED", 2], ["ERADICATED", 1], ["RECOVERED", 1], ["CLOSED", 2]]),
        assignedAnalystId: analystId,
        evidenceUrls: chance(0.4) ? [`https://evidence.sentinel.example/case-${i + 1}.pdf`] : [],
        createdAt,
      },
    });
    const activityActor = analystId ?? pick(analystIds);
    await prisma.activity.createMany({
      data: [
        { incidentId: incident.id, userId: activityActor, action: "created the incident", createdAt },
        ...(chance(0.6)
          ? [{ incidentId: incident.id, userId: activityActor, action: "changed status to Investigating", createdAt: new Date(createdAt.getTime() + 7_200_000) }]
          : []),
      ],
    });
    const linkCount = rand(4);
    const linked = new Set<string>();
    for (let j = 0; j < linkCount; j++) linked.add(pick(alertIds));
    if (linked.size) {
      await prisma.incidentAlert.createMany({
        data: [...linked].map((alertId) => ({ incidentId: incident.id, alertId })),
        skipDuplicates: true,
      });
    }
  }

  // Threat Intelligence (50)
  await prisma.threatFeed.createMany({
    data: Array.from({ length: 50 }, () => {
      const iocType = pick(IOC_TYPES);
      const ip = iocType === "IP" ? randomIp(true) : null;
      const domain = iocType === "DOMAIN" || iocType === "URL" ? `mal-${rand(9999)}.example.net` : null;
      const hash = iocType === "HASH" ? [...Array(40)].map(() => "0123456789abcdef"[rand(16)]).join("") : null;
      const ioc = ip ?? hash ?? (iocType === "URL" ? `http://${domain}/payload` : domain) ?? "unknown";
      return {
        organizationId,
        ioc,
        iocType,
        ipAddress: ip,
        domain,
        hash,
        source: pick(THREAT_SOURCES),
        confidence: weighted<ThreatConfidence>([["LOW", 2], ["MEDIUM", 3], ["HIGH", 3], ["CONFIRMED", 2]]),
        status: weighted<ThreatStatus>([["ACTIVE", 4], ["MONITORING", 3], ["MITIGATED", 2], ["EXPIRED", 1]]),
        lastSeenAt: daysAgo(60),
      };
    }),
  });

  // Audit logs (~250 derived events)
  await prisma.auditLog.createMany({
    data: Array.from({ length: 250 }, () => {
      const actor = pick(users);
      return {
        organizationId,
        userId: actor.id,
        action: weighted<AuditAction>([["CREATE", 4], ["UPDATE", 4], ["DELETE", 1], ["EXPORT", 1], ["LOGIN", 2]]),
        entityType: pick(["Alert", "Incident", "Asset", "Vulnerability", "ThreatFeed", "User"]),
        entityId: pick(assetIds),
        ipAddress: randomIp(),
        role: actor.role,
        createdAt: daysAgo(90),
      };
    }),
  });

  // Notifications (derived — recent activity for a sample of users)
  await prisma.notification.createMany({
    data: Array.from({ length: 120 }, () => ({
      organizationId,
      userId: pick(userIds),
      type: pick(["ALERT", "INCIDENT", "VULNERABILITY", "SYSTEM", "USER"] as const),
      title: pick(["New critical alert", "Incident assigned to you", "Exploitable vulnerability", "Weekly summary", "Role updated"]),
      message: "Automated notification generated during seeding.",
      isRead: chance(0.5),
      createdAt: daysAgo(20),
    })),
  });

  const [a, v, al, inc, tf] = await Promise.all([
    prisma.asset.count({ where: { organizationId } }),
    prisma.vulnerability.count({ where: { organizationId } }),
    prisma.alert.count({ where: { organizationId } }),
    prisma.incident.count({ where: { organizationId } }),
    prisma.threatFeed.count({ where: { organizationId } }),
  ]);
  console.log(`Done → users:20 assets:${a} vulns:${v} alerts:${al} incidents:${inc} threats:${tf}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

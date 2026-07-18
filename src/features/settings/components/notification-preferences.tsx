"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "soc:notification-preferences";

type PreferenceKey =
  | "criticalAlertEmails"
  | "incidentAssignments"
  | "weeklyDigest";

type Preference = {
  key: PreferenceKey;
  label: string;
  description: string;
};

const PREFERENCES: Preference[] = [
  {
    key: "criticalAlertEmails",
    label: "Critical alert emails",
    description: "Email me the moment a critical severity alert fires.",
  },
  {
    key: "incidentAssignments",
    label: "Incident assignments",
    description: "Notify me when an incident is assigned to me.",
  },
  {
    key: "weeklyDigest",
    label: "Weekly digest",
    description: "A Monday summary of open alerts and incident trends.",
  },
];

type PreferenceState = Record<PreferenceKey, boolean>;

const DEFAULTS: PreferenceState = {
  criticalAlertEmails: true,
  incidentAssignments: true,
  weeklyDigest: false,
};

function readStored(): PreferenceState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<PreferenceState>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

/** User-level notification preferences. Client-only persistence for v1. */
export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<PreferenceState>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPrefs(readStored());
    setMounted(true);
  }, []);

  function toggle(key: PreferenceKey, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Control which updates reach you. Saved to this browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {PREFERENCES.map((preference) => (
          <div
            key={preference.key}
            className="flex items-center justify-between gap-4"
          >
            <div className="space-y-0.5">
              <Label htmlFor={preference.key} className="text-sm font-medium">
                {preference.label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {preference.description}
              </p>
            </div>
            <Switch
              id={preference.key}
              checked={prefs[preference.key]}
              disabled={!mounted}
              onCheckedChange={(value) => toggle(preference.key, value)}
              aria-label={preference.label}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

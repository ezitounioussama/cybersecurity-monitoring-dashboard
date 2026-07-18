"use client";

import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useEffect, useState, type ComponentType } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeOption = {
  value: "light" | "dark" | "system";
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const OPTIONS: ThemeOption[] = [
  { value: "light", label: "Light", icon: IconSun },
  { value: "dark", label: "Dark", icon: IconMoon },
  { value: "system", label: "System", icon: IconDeviceDesktop },
];

/** User-level theme preference, persisted by next-themes to localStorage. */
export function ThemePreference() {
  const { theme, setTheme } = useTheme();
  // Avoid hydration mismatch: theme is only known on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>
          Choose how the dashboard looks. System follows your device settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="radiogroup"
          aria-label="Theme preference"
          className="grid grid-cols-3 gap-2 sm:max-w-md"
        >
          {OPTIONS.map((option) => {
            const active = mounted && theme === option.value;
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                variant={active ? "default" : "outline"}
                className={cn("h-auto flex-col gap-1.5 py-3", !active && "text-muted-foreground")}
                onClick={() => setTheme(option.value)}
              >
                <Icon className="size-5" />
                <span className="text-xs font-medium">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

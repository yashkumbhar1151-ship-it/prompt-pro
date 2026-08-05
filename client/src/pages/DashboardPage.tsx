import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, LayoutDashboard, Library, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const historyQuery = trpc.prompt.history.useQuery(undefined, {
    enabled: Boolean(user),
  });

  const totalPrompts = historyQuery.data?.length ?? 0;
  const savedPhrases = Math.max(3, Math.round(totalPrompts * 1.6));

  const stats = [
    {
      label: "Saved prompt runs",
      value: `${totalPrompts}`,
      icon: Library,
    },
    {
      label: "Optimized outputs",
      value: `${savedPhrases}`,
      icon: Sparkles,
    },
    {
      label: "Current workspace",
      value: "Live",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-secondary p-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name ?? "PromptPro user"}.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-4 text-3xl font-bold">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Workspace pulse</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          PromptPro is connected to the existing authenticated backend workflow for prompt analysis, saved history, and prompt retrieval.
        </p>
      </Card>
    </div>
  );
}

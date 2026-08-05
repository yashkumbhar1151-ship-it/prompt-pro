import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ComparisonPage() {
  const { user } = useAuth();
  const historyQuery = trpc.prompt.history.useQuery(undefined, {
    enabled: Boolean(user),
  });

  const first = historyQuery.data?.[0];
  const second = historyQuery.data?.[1] ?? first;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Prompt Comparison</h1>
        <p className="mt-2 text-sm text-muted-foreground">Compare historical prompt runs using the saved backend analysis results.</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Before</p>
            <p className="mt-2 text-sm">{first?.originalPrompt ?? "Run a prompt analysis to populate the comparison view."}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">After</p>
            <p className="mt-2 text-sm">{second?.enhanced ?? "The optimized prompt will appear here after the first analysis."}</p>
          </div>
        </div>

        <div className="mt-4">
          <Button variant="outline">Export comparison</Button>
        </div>
      </Card>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

function renderHistoryContent(
  data: Array<{ id: number; originalPrompt: string; createdAt: string | Date }> | undefined,
  isLoading: boolean,
) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
        Loading history…
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
        No prompt history available yet.
      </div>
    );
  }

  return data.map((item) => (
    <div key={item.id} className="rounded-2xl border p-4">
      <p className="text-sm font-semibold">{item.originalPrompt.slice(0, 120)}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {new Date(item.createdAt).toLocaleString()}
      </p>
    </div>
  ));
}

export default function HistoryPage() {
  const { user } = useAuth();
  const historyQuery = trpc.prompt.history.useQuery(undefined, {
    enabled: Boolean(user),
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Prompt History</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View the latest prompt analysis history from the authenticated backend.
        </p>

        <div className="mt-6 space-y-3">
          {renderHistoryContent(historyQuery.data, historyQuery.isLoading)}
        </div>
      </Card>
    </div>
  );
}

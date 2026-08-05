import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function LibraryPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const historyQuery = trpc.prompt.history.useQuery(undefined, {
    enabled: Boolean(user),
  });
  const deleteMutation = trpc.prompt.delete.useMutation();

  const filtered = (historyQuery.data ?? []).filter((item) =>
    `${item.originalPrompt} ${item.enhanced}`.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      await historyQuery.refetch();
      toast.success("Prompt removed from library.");
    } catch {
      toast.error("Unable to remove the prompt right now.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Prompt Library</h1>
        <p className="mt-2 text-sm text-muted-foreground">Save, search, filter, and revisit authenticated prompt runs.</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            aria-label="Search prompts"
            className="w-full rounded-xl border bg-background px-3 py-2"
            placeholder="Search your prompts"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Sort</Button>
        </div>

        <div className="mt-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">No prompts found yet.</div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-semibold">{item.originalPrompt.slice(0, 90) || "Untitled prompt"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Duplicate</Button>
                    <Button variant="outline" size="sm">Favorite</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

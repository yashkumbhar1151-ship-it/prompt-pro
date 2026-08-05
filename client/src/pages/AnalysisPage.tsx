import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { computePromptMetrics } from "@/lib/promptMetrics";

export default function AnalysisPage() {
  const { user } = useAuth();
  const [original, setOriginal] = useState("");
  const [result, setResult] = useState<{ review: string; enhanced: string; id: number; createdAt: Date } | null>(null);
  const analyzeMutation = trpc.prompt.analyze.useMutation();
  const historyQuery = trpc.prompt.history.useQuery(undefined, {
    enabled: Boolean(user),
  });

  const metrics = useMemo(() => {
    if (!result) return null;
    return computePromptMetrics(original, result.enhanced, result.review);
  }, [original, result]);

  const handleAnalyze = async () => {
    if (!original.trim()) {
      toast.error("Please provide a prompt to analyze.");
      return;
    }

    try {
      const data = await analyzeMutation.mutateAsync({ originalPrompt: original });
      setResult(data);
      await historyQuery.refetch();
      toast.success("Prompt analyzed successfully.");
    } catch {
      toast.error("Unable to analyze the prompt right now.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Prompt Analysis</h1>
            <p className="text-sm text-muted-foreground">Analyze prompts through the existing backend prompt analysis route.</p>
          </div>
          <div className="rounded-full bg-secondary px-3 py-1 text-sm">Authenticated: {user ? "yes" : "no"}</div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <Textarea
              value={original}
              onChange={(event) => setOriginal(event.target.value)}
              className="min-h-[260px]"
              placeholder="Type or paste a prompt to analyze..."
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending || !original.trim()}>
                {analyzeMutation.isPending ? "Analyzing..." : "Analyze"}
              </Button>
              <Button variant="outline" onClick={() => setOriginal("")}>Clear</Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold">Analysis output</h2>
              {result ? (
                <div className="mt-4 space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <Streamdown>{result.review}</Streamdown>
                  </div>
                  <div className="rounded-xl bg-secondary p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Improved prompt</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{result.enhanced}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Run the analyzer to generate a live scorecard and improved prompt.</p>
              )}
            </Card>
          </div>
        </div>
      </Card>

      {metrics && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Prompt metrics</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Overall Prompt Score", metrics.overallScore],
              ["Clarity", metrics.clarity],
              ["Context", metrics.context],
              ["Specificity", metrics.specificity],
              ["Completeness", metrics.completeness],
              ["Structure", metrics.structure],
              ["Readability", metrics.readability],
              ["Creativity", metrics.creativity],
              ["Hallucination Risk", metrics.hallucinationRisk],
              ["Token Estimate", metrics.tokenEstimate],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border bg-secondary/40 p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl border p-4">
              <h3 className="text-lg font-semibold">Suggestions</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {metrics.suggestions.map((item) => (
                  <li key={item} className="list-disc pl-4">{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="text-lg font-semibold">Before / After comparison</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Before</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{original || "No prompt entered yet."}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">After</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{result?.enhanced}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

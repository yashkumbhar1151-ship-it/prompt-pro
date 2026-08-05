import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  BrainCircuit,
  Copy,
  Download,
  History,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const analyzePromptMutation = trpc.prompt.analyze.useMutation();
  const historyQuery = trpc.prompt.history.useQuery(undefined, {
    enabled: isAuthenticated && showHistory,
  });
  const deletePromptMutation = trpc.prompt.delete.useMutation();

  const [currentAnalysis, setCurrentAnalysis] = useState<{
    id: number;
    review: string;
    enhanced: string;
    createdAt: Date;
  } | null>(null);

  useEffect(() => {
    const savedDraft = window.localStorage.getItem("promptpro-draft");
    if (savedDraft) {
      setOriginalPrompt(savedDraft);
    }
  }, []);

  const promptStats = useMemo(() => {
    const characterCount = originalPrompt.length;
    const estimatedTokens = Math.max(40, Math.round(characterCount / 4));
    return {
      characterCount,
      estimatedTokens,
    };
  }, [originalPrompt]);

  const handleAnalyze = async (mode: "analyze" | "optimize" | "generate" = "analyze") => {
    if (!originalPrompt.trim()) {
      toast.error("Please enter a prompt to analyze");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzePromptMutation.mutateAsync({
        originalPrompt,
      });
      setCurrentAnalysis(result);
      setSelectedHistoryId(null);

      let successMessage = "Prompt analyzed successfully!";
      if (mode === "optimize") {
        successMessage = "Prompt optimization complete";
      } else if (mode === "generate") {
        successMessage = "Generated a refined prompt version";
      }

      toast.success(successMessage);
    } catch (error) {
      toast.error("Failed to analyze prompt. Please try again.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveDraft = () => {
    if (!originalPrompt.trim()) {
      toast.error("Nothing to save yet.");
      return;
    }

    window.localStorage.setItem("promptpro-draft", originalPrompt);
    toast.success("Prompt draft saved locally.");
  };

  const handleCopyEnhanced = async () => {
    if (currentAnalysis?.enhanced) {
      await navigator.clipboard.writeText(currentAnalysis.enhanced);
      toast.success("Enhanced prompt copied to clipboard!");
    }
  };

  const handleExportJSON = () => {
    if (!currentAnalysis) {
      toast.error("Analyze a prompt before exporting.");
      return;
    }

    const payload = {
      originalPrompt,
      review: currentAnalysis.review,
      enhanced: currentAnalysis.enhanced,
      createdAt: currentAnalysis.createdAt.toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "promptpro-analysis.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("JSON export downloaded.");
  };

  const handleExportMarkdown = () => {
    if (!currentAnalysis) {
      toast.error("Analyze a prompt before exporting.");
      return;
    }

    const markdown = `# PromptPro Analysis\n\n## Original Prompt\n${originalPrompt}\n\n## Analysis Review\n${currentAnalysis.review}\n\n## Enhanced Prompt\n${currentAnalysis.enhanced}`;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "promptpro-analysis.md";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Markdown export downloaded.");
  };

  const handleSelectHistory = (item: any) => {
    setCurrentAnalysis({
      id: item.id,
      review: item.review,
      enhanced: item.enhanced,
      createdAt: new Date(item.createdAt),
    });
    setOriginalPrompt(item.originalPrompt);
    setSelectedHistoryId(item.id);
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await deletePromptMutation.mutateAsync({ id });
      await historyQuery.refetch();
      if (selectedHistoryId === id) {
        setCurrentAnalysis(null);
        setSelectedHistoryId(null);
      }
      toast.success("Prompt deleted from history");
    } catch {
      toast.error("Failed to delete prompt");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md border-2 border-accent p-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">PromptPro</h1>
          <p className="mb-6 text-lg text-muted-foreground">
            AI-Powered Prompt Engineering Assistant
          </p>
          <p className="mb-8 text-sm text-muted-foreground">
            Analyze and optimize your prompts for better LLM performance
          </p>
          <Button
            onClick={() => startLogin()}
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Sign In to Get Started
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-5xl font-black text-foreground">PromptPro</h1>
          <p className="text-lg text-muted-foreground">
            Analyze and optimize your prompts for maximum LLM effectiveness
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-2 border-border p-6 transition-colors hover:border-accent/50">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-foreground">Prompt Editor</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{promptStats.characterCount} characters</span>
                  <span>•</span>
                  <span>{promptStats.estimatedTokens} estimated tokens</span>
                </div>
              </div>

              <Textarea
                ref={textareaRef}
                value={originalPrompt}
                onChange={(event) => {
                  setOriginalPrompt(event.target.value);
                  window.localStorage.setItem("promptpro-draft", event.target.value);
                }}
                placeholder="Paste or type your prompt here..."
                className="min-h-48 border-2 border-border font-mono text-sm focus:border-accent"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  onClick={() => handleAnalyze("analyze")}
                  disabled={isAnalyzing || !originalPrompt.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isAnalyzing ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => handleAnalyze("optimize")} disabled={!originalPrompt.trim()}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Optimize
                </Button>
                <Button variant="outline" onClick={() => handleAnalyze("generate")} disabled={!originalPrompt.trim()}>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Generate
                </Button>
                <Button variant="outline" onClick={handleCopyEnhanced} disabled={!currentAnalysis?.enhanced}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleExportJSON} disabled={!currentAnalysis}>
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
                <Button variant="outline" onClick={handleExportMarkdown} disabled={!currentAnalysis}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Markdown
                </Button>
              </div>
            </Card>

            {currentAnalysis && (
              <div className="space-y-6">
                <Card className="border-2 border-accent/30 bg-secondary/20 p-6">
                  <h3 className="mb-4 text-2xl font-bold text-foreground">Analysis Review</h3>
                  <div className="prose prose-sm max-w-none text-foreground">
                    <Streamdown>{currentAnalysis.review}</Streamdown>
                  </div>
                </Card>

                <Card className="border-2 border-accent/30 bg-accent/5 p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-2xl font-bold text-foreground">Enhanced Prompt</h3>
                    <Button onClick={handleCopyEnhanced} variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <div className="rounded-lg border-2 border-border bg-card p-4 font-mono text-sm whitespace-pre-wrap break-words text-foreground">
                    {currentAnalysis.enhanced}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Analyzed on {currentAnalysis.createdAt.toLocaleDateString()} at{" "}
                    {currentAnalysis.createdAt.toLocaleTimeString()}
                  </p>
                </Card>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-2 border-border p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center text-xl font-bold text-foreground">
                  <History className="mr-2 h-5 w-5 text-accent" />
                  History
                </h3>
                <Button onClick={() => setShowHistory(!showHistory)} variant="outline" size="sm" className="text-xs">
                  {showHistory ? "Hide" : "Show"}
                </Button>
              </div>

              {showHistory && (
                <div className="space-y-2">
                  {historyQuery.isLoading ? (
                    <div className="flex justify-center py-4">
                      <Spinner className="h-5 w-5" />
                    </div>
                  ) : null}

                  {!historyQuery.isLoading && historyQuery.data && historyQuery.data.length > 0 ? (
                    <div className="max-h-96 space-y-2 overflow-y-auto">
                      {historyQuery.data.map((item) => {
                        const isSelected = selectedHistoryId === item.id;
                        const borderClass = isSelected
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50 bg-card";
                        return (
                          <div
                            key={item.id}
                            className={`rounded-lg border-2 p-3 transition-all ${borderClass}`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelectHistory(item)}
                              className="mb-2 block w-full text-left"
                            >
                              <p className="truncate font-mono text-xs text-muted-foreground">
                                {item.originalPrompt.substring(0, 50)}...
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </button>
                            <Button
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteHistory(item.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className="w-full text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {!historyQuery.isLoading && (!historyQuery.data || historyQuery.data.length === 0) ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No history yet. Start analyzing prompts!</p>
                  ) : null}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

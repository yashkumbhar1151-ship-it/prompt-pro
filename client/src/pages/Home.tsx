import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Copy, Trash2, History } from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
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

  const handleAnalyze = async () => {
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
      toast.success("Prompt analyzed successfully!");
    } catch (error) {
      toast.error("Failed to analyze prompt. Please try again.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyEnhanced = () => {
    if (currentAnalysis?.enhanced) {
      navigator.clipboard.writeText(currentAnalysis.enhanced);
      toast.success("Enhanced prompt copied to clipboard!");
    }
  };

  const handleSelectHistory = (item: any) => {
    setCurrentAnalysis({
      id: item.id,
      review: item.review,
      enhanced: item.enhanced,
      createdAt: new Date(item.createdAt),
    });
    setSelectedHistoryId(item.id);
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await deletePromptMutation.mutateAsync({ id });
      if (historyQuery.data) {
        const newData = historyQuery.data.filter((item) => item.id !== id);
        historyQuery.refetch();
      }
      if (selectedHistoryId === id) {
        setCurrentAnalysis(null);
        setSelectedHistoryId(null);
      }
      toast.success("Prompt deleted from history");
    } catch (error) {
      toast.error("Failed to delete prompt");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center border-2 border-accent">
          <h1 className="text-4xl font-bold text-foreground mb-4">PromptPro</h1>
          <p className="text-lg text-muted-foreground mb-6">
            AI-Powered Prompt Engineering Assistant
          </p>
          <p className="text-sm text-muted-foreground mb-8">
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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-foreground mb-2">PromptPro</h1>
          <p className="text-lg text-muted-foreground">
            Analyze and optimize your prompts for maximum LLM effectiveness
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Input and Analysis Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Card */}
            <Card className="p-6 border-2 border-border hover:border-accent/50 transition-colors">
              <h2 className="text-2xl font-bold text-foreground mb-4">Your Prompt</h2>
              <Textarea
                ref={textareaRef}
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                placeholder="Paste or type your prompt here..."
                className="min-h-40 font-mono text-sm border-2 border-border focus:border-accent"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !originalPrompt.trim()}
                className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze & Optimize"
                )}
              </Button>
            </Card>

            {/* Analysis Results */}
            {currentAnalysis && (
              <div className="space-y-6">
                {/* Part 1: Review */}
                <Card className="p-6 border-2 border-accent/30 bg-secondary/20">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Part 1: Analysis Review
                  </h3>
                  <div className="prose prose-sm max-w-none text-foreground">
                    <Streamdown>{currentAnalysis.review}</Streamdown>
                  </div>
                </Card>

                {/* Part 2: Enhanced Prompt */}
                <Card className="p-6 border-2 border-accent/30 bg-accent/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-foreground">
                      Part 2: Enhanced Prompt
                    </h3>
                    <Button
                      onClick={handleCopyEnhanced}
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent hover:bg-accent/10"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-card border-2 border-border rounded-lg p-4 font-mono text-sm whitespace-pre-wrap break-words text-foreground">
                    {currentAnalysis.enhanced}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Analyzed on {currentAnalysis.createdAt.toLocaleDateString()} at{" "}
                    {currentAnalysis.createdAt.toLocaleTimeString()}
                  </p>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar: History */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-2 border-border sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground flex items-center">
                  <History className="h-5 w-5 mr-2 text-accent" />
                  History
                </h3>
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {showHistory ? "Hide" : "Show"}
                </Button>
              </div>

              {showHistory && (
                <div className="space-y-2">
                  {historyQuery.isLoading ? (
                    <div className="flex justify-center py-4">
                      <Spinner className="h-5 w-5" />
                    </div>
                  ) : historyQuery.data && historyQuery.data.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {historyQuery.data.map((item) => {
                        const isSelected = selectedHistoryId === item.id;
                        const borderClass = isSelected
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50 bg-card";
                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${borderClass}`}
                          >
                            <div
                              onClick={() => handleSelectHistory(item)}
                              className="mb-2"
                            >
                              <p className="text-xs font-mono text-muted-foreground truncate">
                                {item.originalPrompt.substring(0, 50)}...
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHistory(item.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className="w-full text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No history yet. Start analyzing prompts!
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

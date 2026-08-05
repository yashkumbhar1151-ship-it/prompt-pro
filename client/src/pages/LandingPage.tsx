import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Wand2, ShieldCheck, Layers3 } from "lucide-react";
import { startLogin } from "@/const";

const featureCards = [
  {
    icon: Sparkles,
    title: "Prompt scoring",
    description: "Turn vague prompts into high-signal instructions with measurable clarity and structure.",
  },
  {
    icon: Wand2,
    title: "Live optimization",
    description: "Route every prompt through the existing prompt-analysis backend and immediately capture the improved output.",
  },
  {
    icon: Layers3,
    title: "Prompt library",
    description: "Save, revisit, compare, and organize prompt iterations inside one LMS-style workspace.",
  },
  {
    icon: ShieldCheck,
    title: "Production-ready UX",
    description: "Responsive, secure, and polished for authenticated product use across desktop and mobile.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 md:px-8 lg:py-12">
        <header className="flex items-center justify-between rounded-full border bg-card/70 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-lg font-semibold">PromptPro</p>
          </div>
          <Button onClick={() => startLogin()} variant="default">
            Sign in
          </Button>
        </header>

        <section className="grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              Premium prompt intelligence for modern teams
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Build sharper prompts and better AI outcomes.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              PromptPro gives product teams, marketers, and operators a polished prompt studio with live analysis, history, comparison, and saved prompt workflows.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => startLogin()} size="lg" className="gap-2">
                Launch workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button onClick={() => window.location.assign("/editor")} variant="outline" size="lg">
                Open editor
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Live signal</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-card p-3">
                  <p className="text-3xl font-bold">93</p>
                  <p className="text-xs text-muted-foreground">Prompt score</p>
                </div>
                <div className="rounded-xl bg-card p-3">
                  <p className="text-3xl font-bold">1.4k</p>
                  <p className="text-xs text-muted-foreground">Tokens</p>
                </div>
                <div className="rounded-xl bg-card p-3 col-span-2">
                  <p className="text-sm font-medium">Analysis status</p>
                  <p className="text-sm text-muted-foreground">Connected to the existing backend prompt analyzer.</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-5">
                <div className="mb-3 inline-flex rounded-xl bg-secondary p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}

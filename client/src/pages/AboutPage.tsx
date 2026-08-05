import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">About PromptPro</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          PromptPro is a premium prompt analysis and optimization experience built to improve prompt clarity, structure, and model output quality.
        </p>
      </Card>
    </div>
  );
}

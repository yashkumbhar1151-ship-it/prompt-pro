import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Contact</h1>
        <p className="mt-2 text-sm text-muted-foreground">Reach the PromptPro team for support, feedback, or enterprise inquiries.</p>
        <Button className="mt-4">Email support</Button>
      </Card>
    </div>
  );
}

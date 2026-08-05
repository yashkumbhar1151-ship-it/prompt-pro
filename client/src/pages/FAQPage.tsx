import { Card } from "@/components/ui/card";

const faqs = [
  {
    question: "How do I analyze a prompt?",
    answer: "Open the Prompt Editor, paste your prompt, and choose Analyze to send it through the existing backend prompt-analysis route.",
  },
  {
    question: "Can I reuse saved prompts?",
    answer: "Yes. The Prompt Library and History pages surface saved prompt runs, search inputs, and historical entries from the authenticated API.",
  },
  {
    question: "Can I switch providers?",
    answer: "Yes. The Settings page supports provider selection for the supported providers listed in the product requirements.",
  },
];

export default function FAQPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">FAQ</h1>
        <div className="mt-4 space-y-4">
          {faqs.map((item) => (
            <div key={item.question} className="rounded-2xl border p-4">
              <h2 className="font-semibold">{item.question}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

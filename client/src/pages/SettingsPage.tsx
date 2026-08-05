import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const providers = [
  "Hugging Face",
  "OpenAI",
  "Claude",
  "Gemini",
  "Groq",
  "OpenRouter",
  "Ollama",
];

export default function SettingsPage() {
  const [provider, setProvider] = useState("OpenAI");

  useEffect(() => {
    const stored = window.localStorage.getItem("promptpro-provider");
    if (stored) {
      setProvider(stored);
    }
  }, []);

  const handleSave = () => {
    window.localStorage.setItem("promptpro-provider", provider);
    toast.success(`Provider preference saved: ${provider}`);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select the provider you want PromptPro to use for the existing backend adapter flow.
        </p>

        <div className="mt-6 max-w-md space-y-4">
          <label className="block text-sm font-medium">
            Provider
            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              className="mt-2 w-full rounded-xl border bg-background px-3 py-2"
            >
              {providers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <Button onClick={handleSave}>Save provider</Button>
        </div>
      </Card>
    </div>
  );
}

export type PromptMetrics = {
  overallScore: number;
  clarity: number;
  context: number;
  specificity: number;
  completeness: number;
  structure: number;
  readability: number;
  creativity: number;
  hallucinationRisk: number;
  tokenEstimate: number;
  summary: string;
  suggestions: string[];
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));

const countWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const normalize = (value: string) => value.trim().toLowerCase();

const extractSuggestions = (review: string) => {
  const suggestions = review
    .split(/\n+/)
    .map((line) => line.trim().replace(/^[-*•]\s*/, ""))
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  return suggestions.slice(0, 5);
};

const scoreMetric = (value: number, bonus = 0) => clamp(value + bonus);

const sumBonuses = (bonusMap: Record<string, number>) =>
  Object.values(bonusMap).reduce((sum, value) => sum + value, 0);

const testPatterns = (input: string, patterns: RegExp[]) =>
  patterns.some((pattern) => pattern.test(input));

const inspectPromptSignals = (originalPrompt: string, enhancedPrompt: string) => ({
  hasGoal: testPatterns(originalPrompt, [/(goal|objective|deliverable|target|output|result)/i]),
  hasConstraints: testPatterns(originalPrompt, [/(tone|audience|format|length|style|persona|constraints|steps)/i]),
  hasExamples: testPatterns(originalPrompt, [/(example|e\.g\.|for example|sample)/i]),
  hasQuestion: /\?/i.test(originalPrompt),
  hasStructure: testPatterns(enhancedPrompt, [/\b(you are|step|format|output|context|role)\b/i]),
  hasNewline: enhancedPrompt.includes("\n"),
  isLongPrompt: enhancedPrompt.length > 120,
  isRichPrompt: enhancedPrompt.length > 180,
  hasMarkdown: enhancedPrompt.includes("###"),
});

const scoreClarity = ({ hasGoal, hasConstraints, hasQuestion }: ReturnType<typeof inspectPromptSignals>) =>
  scoreMetric(60, sumBonuses({
    goal: hasGoal ? 18 : 0,
    constraints: hasConstraints ? 10 : 0,
    question: hasQuestion ? 4 : 0,
  }));

const scoreContext = ({ hasConstraints, hasExamples }: ReturnType<typeof inspectPromptSignals>) =>
  scoreMetric(48, sumBonuses({
    constraints: hasConstraints ? 18 : 0,
    examples: hasExamples ? 12 : 0,
  }));

const scoreSpecificity = ({ hasGoal, hasConstraints }: ReturnType<typeof inspectPromptSignals>) =>
  scoreMetric(52, sumBonuses({
    goal: hasGoal ? 16 : 0,
    constraints: hasConstraints ? 14 : 0,
  }));

const scoreCompleteness = ({ hasGoal, hasConstraints, hasExamples }: ReturnType<typeof inspectPromptSignals>) =>
  scoreMetric(44, sumBonuses({
    goal: hasGoal ? 14 : 0,
    constraints: hasConstraints ? 12 : 0,
    examples: hasExamples ? 12 : 0,
  }));

const scoreStructure = ({ hasStructure, hasNewline }: ReturnType<typeof inspectPromptSignals>) =>
  scoreMetric(50, sumBonuses({
    structure: hasStructure ? 30 : 0,
    newline: hasNewline ? 10 : 0,
  }));

const scoreReadability = ({ isLongPrompt, hasMarkdown }: ReturnType<typeof inspectPromptSignals>) =>
  scoreMetric(62, sumBonuses({
    length: isLongPrompt ? 12 : 0,
    markdown: hasMarkdown ? 8 : 0,
  }));

const scoreCreativity = ({ isRichPrompt, hasConstraints }: ReturnType<typeof inspectPromptSignals>) =>
  scoreMetric(40, sumBonuses({
    length: isRichPrompt ? 12 : 0,
    constraints: hasConstraints ? 8 : 0,
  }));

const buildScorecard = (originalPrompt: string, enhancedPrompt: string) => {
  const signals = inspectPromptSignals(originalPrompt, enhancedPrompt);

  return {
    clarity: scoreClarity(signals),
    context: scoreContext(signals),
    specificity: scoreSpecificity(signals),
    completeness: scoreCompleteness(signals),
    structure: scoreStructure(signals),
    readability: scoreReadability(signals),
    creativity: scoreCreativity(signals),
  };
};

export function computePromptMetrics(
  originalPrompt: string,
  enhancedPrompt: string,
  review: string,
): PromptMetrics {
  const originalWords = countWords(originalPrompt);
  const enhancedWords = countWords(enhancedPrompt);
  const estimatedTokens = Math.max(40, Math.round((originalWords + enhancedWords) * 1.35));
  const scorecard = buildScorecard(originalPrompt, enhancedPrompt);
  const context = scorecard.context;
  const specificity = scorecard.specificity;
  const completeness = scorecard.completeness;
  const hallucinationRisk = clamp(100 - (context + specificity + completeness) / 3);
  const overallScore = clamp(
    Math.round(
      (scorecard.clarity + context + specificity + completeness + scorecard.structure + scorecard.readability + scorecard.creativity) / 7,
    ),
  );

  const summary = normalize(review).includes("clarity")
    ? "The prompt has been improved for structure, specificity, and instruction clarity."
    : "The prompt is now better structured and more actionable for high-quality outputs.";

  return {
    overallScore,
    clarity: scorecard.clarity,
    context,
    specificity,
    completeness,
    structure: scorecard.structure,
    readability: scorecard.readability,
    creativity: scorecard.creativity,
    hallucinationRisk,
    tokenEstimate: estimatedTokens,
    summary,
    suggestions: extractSuggestions(review),
  };
}

import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  prompt: router({
    analyze: protectedProcedure
      .input(
        z.object({
          originalPrompt: z.string().min(1, "Prompt cannot be empty"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const { createPrompt } = await import("./db");

        const systemPrompt = `You are an expert Prompt Engineer and AI Optimization Assistant. Your sole purpose is to analyze user-provided prompts, identify their weaknesses, and rewrite them into highly effective, structured, and optimized prompts for large language models (LLMs).

When given a prompt to review, execute your task in two distinct parts:

### Part 1: Prompt Review & Analysis
Provide a brief analysis explaining how the original prompt can be improved. Focus on:
- Clarity and Specificity: Is the goal obvious?
- Context & Constraints: Does the AI know its role, target audience, tone, or limitations?
- Structure: Is it organized well for an LLM to parse?

Format this as a bulleted list with clear headers.

### Part 2: The Enhanced Prompt
Provide the final, fully optimized prompt. Ensure the enhanced prompt follows best practices:
- Assigns a clear persona or role to the AI (e.g., "You are an expert copywriter...").
- Provides clear instructions, context, and step-by-step guidance.
- Specifies the exact expected output format or constraints.
- Uses clear delimiters (like brackets or XML tags) if variable inputs are needed.

Maintain a professional, helpful, and highly analytical tone. Do not include conversational filler; jump straight into the review and generation.

Return your response as JSON with two keys:
- "review": The bulleted analysis from Part 1
- "enhanced": The enhanced prompt from Part 2`;

        const response = await invokeLLM({
          model: "claude-sonnet-4-6",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `Please analyze and optimize this prompt:\n\n${input.originalPrompt}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "prompt_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  review: {
                    type: "string",
                    description: "The bulleted analysis of the original prompt",
                  },
                  enhanced: {
                    type: "string",
                    description: "The fully optimized prompt",
                  },
                },
                required: ["review", "enhanced"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        let contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        
        // Handle markdown code blocks that might be returned by the LLM
        contentStr = contentStr.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
        
        const parsed = JSON.parse(contentStr);

        const prompt = await createPrompt(
          ctx.user.id,
          input.originalPrompt,
          parsed.review,
          parsed.enhanced
        );

        return {
          id: prompt.id,
          review: parsed.review,
          enhanced: parsed.enhanced,
          createdAt: prompt.createdAt,
        };
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      const { getUserPrompts } = await import("./db");
      const userPrompts = await getUserPrompts(ctx.user.id);
      return userPrompts.map((p) => ({
        id: p.id,
        originalPrompt: p.originalPrompt,
        review: p.analysisReview,
        enhanced: p.enhancedPrompt,
        createdAt: p.createdAt,
      }));
    }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deletePrompt } = await import("./db");
        await deletePrompt(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { env } from "~/env.mjs";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

interface Essay {
  title: string;
  introduction: string;
  body: string;
  conclusion: string;
}

interface EssayWrapper {
  essay: Essay;
}

function parseEssayJson(jsonString: string): EssayWrapper | null {
  try {
    const parsedJson: unknown = JSON.parse(jsonString);

    if (
      typeof parsedJson === "object" &&
      parsedJson !== null &&
      "essay" in parsedJson &&
      typeof (parsedJson as EssayWrapper).essay === "object" &&
      "title" in (parsedJson as EssayWrapper).essay &&
      typeof (parsedJson as EssayWrapper).essay.title === "string" &&
      "introduction" in (parsedJson as EssayWrapper).essay &&
      typeof (parsedJson as EssayWrapper).essay.introduction === "string" &&
      "body" in (parsedJson as EssayWrapper).essay &&
      typeof (parsedJson as EssayWrapper).essay.body === "string" &&
      "conclusion" in (parsedJson as EssayWrapper).essay &&
      typeof (parsedJson as EssayWrapper).essay.conclusion === "string"
    ) {
      return parsedJson as EssayWrapper;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

interface Sentence {
  sentence: string;
}

function extractJsonString(input: string): string | null {
  const jsonRegex = /{[\s\S]*?}/;
  const match = input.match(jsonRegex);

  if (match) {
    return match[0];
  } else {
    console.error("No JSON found in the input string.");
    return null;
  }
}

function parseSentenceJson(jsonString: string): Sentence | null {
  try {
    const parsedJson: unknown = JSON.parse(jsonString);

    if (
      typeof parsedJson === "object" &&
      parsedJson !== null &&
      "sentence" in parsedJson &&
      typeof (parsedJson as Sentence).sentence === "string"
    ) {
      return parsedJson as Sentence;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

export const openaiRouter = createTRPCRouter({
  essayComposition: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input: { messages } }) => {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.8,
        messages,
      });

      console.log("response.data.choices[0]?.message?.content");
      console.log(response.data.choices[0]?.message?.content);

      if (typeof response.data.choices[0]?.message?.content === "undefined") {
        return;
      }

      const parsedJson = parseEssayJson(
        response.data.choices[0]?.message?.content
      );

      return parsedJson;
    }),
  sentenceComposition: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input: { messages } }) => {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.8,
        messages,
      });

      console.log("response.data.choices[0]?.message?.content");
      console.log(response.data.choices[0]?.message?.content);

      if (typeof response.data.choices[0]?.message?.content === "undefined") {
        return;
      }

      const extractedJson = extractJsonString(
        response.data.choices[0]?.message?.content
      );

      if (extractedJson === null) {
        return;
      }

      const parsedJson = parseSentenceJson(extractedJson);

      return parsedJson;
    }),
});

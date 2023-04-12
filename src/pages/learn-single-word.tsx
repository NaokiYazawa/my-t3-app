import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "~/utils/api";
import Highlighter from "react-highlight-words";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyToClipboardButton } from "~/components/CopyToClipboardButton";

const formSchema = z.object({
  word: z
    .string()
    .min(1, "Word must be at least 1 letter")
    .refine(
      (value) => {
        const onlyAlphabets = /^[A-Za-z]+$/;
        return onlyAlphabets.test(value);
      },
      {
        message: "Please enter only alphabets (A-Z, a-z)",
      }
    ),
});

interface FormInputs {
  word: string;
}

interface Sentence {
  sentence: string;
}

type messageType = { role: "user" | "assistant"; content: string };

function createPrompt(word: string): messageType[] {
  return [
    {
      role: "user",
      content: `
You are an excellent IELTS instructor.
Please write a sentence containing the word entered.

The input will be formatted in the following schema:    
\`\`\`json
{
  word: string // word
}
\`\`\`

The output should be formatted in the following JSON schema:

{
  sentence: string // sentence
} 

NOTES:
* Please be sure to include the input words in your sentence.
* Please make sure that the sentence you create should be academic and logical.
* Please do not include anything other than JSON in your answer.

Input:
\`\`\`json
{
  word: ${word}
}
\`\`\`
`,
    },
  ];
}

const LearnSingleWords = () => {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentence, setSentence] = useState<Sentence>({
    sentence: "Submitting word will generate a sentence",
  });

  const { mutate } = api.openai.sentenceComposition.useMutation({
    onMutate: async () => {
      toast("Word successfully submitted.\nNow generating sentence...", {
        duration: 5000,
        icon: "👏",
      });
      setLoading(true);
    },
    onError: async () => {
      setLoading(false);
      toast.error("Something went wrong. Please try again", {
        duration: 5000,
      });
      setLoading(true);
    },
    onSuccess: async (data) => {
      setLoading(false);
      if (typeof data === "undefined" || data === null) {
        return;
      }
      setSentence(data);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormInputs) => {
    setWord(data.word);
    mutate({
      messages: createPrompt(data.word),
    });
  };

  return (
    <>
      <div className="max-w-screen container mx-auto flex min-h-screen flex-col items-center justify-center space-y-8 p-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-row items-start  gap-3 md:w-2/3 md:items-center"
        >
          <div className="relative block w-full">
            <input
              {...register("word")}
              className={`text-gray-four w-full flex-grow appearance-none rounded border-2 border-gray-300 px-3 py-2 leading-tight focus:border-blue-400 ${
                errors.word && "border-red-500"
              }`}
              type="text"
              placeholder="Enter a word..."
              name="word"
              id="word"
            />
            {errors.word && (
              <p className="absolute -bottom-6 text-xs italic text-red-500">
                {errors.word.message}
              </p>
            )}
          </div>
          <button
            className={`w-full rounded bg-green-500 px-3 py-2 text-white md:w-auto ${
              loading ? "opacity-50" : ""
            }`}
            disabled={loading}
          >
            Submit
          </button>
        </form>

        <div className="flex w-full flex-col items-center justify-center md:w-2/3">
          {loading ? (
            <div className="w-full rounded-xl bg-white p-6">
              <h3 className="mb-2 text-xl font-semibold">Sentence</h3>
              <p className="mb-4 animate-fadeInOut text-base">
                Generating sentence...
              </p>
            </div>
          ) : (
            <div className="w-full rounded-xl bg-white p-6">
              <div className="flex items-center">
                <h3 className="mb-2 text-xl font-semibold">Sentence</h3>
                {sentence.sentence && (
                  <CopyToClipboardButton textToCopy={sentence.sentence} />
                )}
              </div>
              <div className="mb-4 border-l-4 border-blue-500 pl-4 text-base">
                <Highlighter
                  searchWords={[word]}
                  autoEscape={true}
                  textToHighlight={sentence.sentence}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LearnSingleWords;

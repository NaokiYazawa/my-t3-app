import { AiFillDelete } from "react-icons/ai";
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { api } from "~/utils/api";
import Highlighter from "react-highlight-words";
import { CopyToClipboardButton } from "~/components/CopyToClipboardButton";
import toast from "react-hot-toast";
import { readCSV } from "~/common/read_csv";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const wordSchema = z.object({
  name: z.string().min(1, "Word must be at least 1 letter"),
});

const formSchema = z.object({
  words: z.array(wordSchema),
});

type FormInput = {
  name: string;
};

type FormInputs = {
  words: FormInput[];
};

interface Essay {
  title: string;
  introduction: string;
  body: string;
  conclusion: string;
}

interface EssayWrapper {
  essay: Essay;
}

type messageType = { role: "user" | "assistant"; content: string };

function createPrompt(words: string[]): messageType[] {
  return [
    {
      role: "user",
      content: `
You are an excellent IELTS instructor.
Please write an academic and logical essay that includes the input words and is structured as Introduction, Body, and Conclusion.

The input will be formatted in the following schema:    
\`\`\`json
{
  words: ["", "", "", ...] // array of words
}
\`\`\`

The output should be formatted in the following schema:
    
\`\`\`json
{
  essay: {
    title: string, // title of the essay
    introduction: string, // introduction of the essay
    body: string, // body of the essay
    conclusion: string, // conclusion of the essay
  }
}
\`\`\`    
    
NOTES:
* Please be sure to include the input words in your essay.
* Please use a line feed code to start a new line.
* Please make sure that the essay you create are appropriate for IELTS.
* Please do not include anything other than JSON in your answer.
    
Input:
\`\`\`json
{
  words: ${words}
}
\`\`\`
`,
    },
  ];
}

const LearnMultipleWords = () => {
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [essay, setEssay] = useState<EssayWrapper>({
    essay: {
      title: "Submitting words will generate a title",
      introduction: "Submitting words will generate a introduction.",
      body: "Submitting words will generate a body.",
      conclusion: "Submitting words will generate a conclusion.",
    },
  });

  const [uploadedFileName, setUploadedFileName] = useState("");
  const { mutate } = api.openai.essayComposition.useMutation({
    onMutate: async () => {
      toast("Words successfully submitted.\nNow generating essay...", {
        duration: 8000,
        icon: "👏",
      });
      setLoading(true);
    },
    onSuccess: async (data) => {
      setLoading(false);
      if (typeof data === "undefined" || data === null) {
        return;
      }
      setEssay(data);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      words: [{ name: "" }],
    },
    resolver: zodResolver(formSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "words",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadedFileName(file.name);

      const csvData = await readCSV(file);

      csvData.slice(0, fields.length).forEach((row, rowIndex) => {
        if (typeof row[0] === "undefined") {
          return;
        }
        setValue(`words.${rowIndex}.name` as const, row[0]);
      });

      csvData.slice(fields.length).forEach((row, index) => {
        if (typeof row[0] === "undefined") {
          return;
        }
        if (index > 8) {
          toast.error("up to 10 words can be entered at a time", {
            duration: 3000,
          });
          return;
        }
        append({ name: row[0] });
      });
    } catch (error) {
      console.error("Error reading the CSV file:", error);
    }
  };

  const onSubmit = (data: FormInputs) => {
    const words = data.words.map((word) => {
      return word.name;
    });
    setWords(words);
    mutate({
      messages: createPrompt(words),
    });
  };

  return (
    <>
      <div className="max-w-screen container mx-auto flex min-h-screen flex-col p-5 md:flex-row md:space-x-8">
        <div className="my-5 h-1/2 w-full md:h-full md:w-2/5 lg:w-1/3">
          <div className="my-4 flex flex-col justify-center">
            <label
              htmlFor="csv-upload"
              className="flex w-40 cursor-pointer items-center rounded-lg border border-blue-600 bg-white px-2 py-2 uppercase tracking-wide text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9 9v6h2V9h5l-6-6-6 6h5zm11 11v-2H0v2h20zM7 18H3v-3h4v3zm10 0h-4v-3h4v3z" />
              </svg>
              <span className="text-xs leading-normal">CSVファイルを選択</span>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {uploadedFileName && (
              <div className="mt-2 text-xs text-gray-600">
                選択されたファイル: {uploadedFileName}
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field, index) => (
              <div className="flex items-center space-x-4" key={index}>
                <div className="flex w-10 min-w-min items-center justify-center">
                  {index + 1}
                </div>
                <div className="block w-full">
                  <input
                    id={`words[${index}].name`}
                    {...register(`words.${index}.name` as const)}
                    defaultValue={field.name}
                    className="block w-full rounded border border-gray-300 px-3 py-2"
                  />
                  {errors.words && errors.words[index] && (
                    <div className="mt-1 text-xs text-red-500">
                      {errors?.words[index]?.name?.message}
                    </div>
                  )}
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex items-center justify-center"
                  >
                    <AiFillDelete className="text-xl text-red-500" />
                  </button>
                )}
              </div>
            ))}
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              {fields.length < 10 && (
                <button
                  type="button"
                  onClick={() => append({ name: "" })}
                  className="w-full rounded bg-blue-500 px-3 py-2 text-white md:w-auto"
                >
                  Add Word
                </button>
              )}
              <button
                type="submit"
                className={`w-full rounded bg-green-500 px-3 py-2 text-white md:w-auto ${
                  loading ? "opacity-50" : ""
                }`}
                disabled={loading}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
        <div className="my-5 h-1/2 w-full md:h-full md:w-3/5 lg:w-2/3">
          <div className="flex w-full flex-col items-center justify-center">
            {loading ? (
              <div className="w-full rounded-xl bg-white p-6">
                <h2 className="mb-4 animate-fadeInOut text-2xl font-semibold">
                  Generating title...
                </h2>
                <h3 className="mb-2 text-xl font-semibold">Introduction</h3>
                <p className="mb-4 animate-fadeInOut text-base">
                  Generating introduction...
                </p>
                <h3 className="mb-2 text-xl font-semibold">Body</h3>
                <p className="mb-4 animate-fadeInOut whitespace-pre-line text-base">
                  Generating body...
                </p>
                <h3 className="mb-2 text-xl font-semibold">Conclusion</h3>
                <p className="mb-4 animate-fadeInOut text-base">
                  Generating conclusion...
                </p>
              </div>
            ) : (
              <div className="w-full rounded-xl bg-white p-6">
                <h2 className="mb-4 text-2xl font-semibold">
                  <Highlighter
                    searchWords={words}
                    autoEscape={true}
                    textToHighlight={essay.essay.title}
                  />
                </h2>
                <div className="flex items-center">
                  <h3 className="mb-2 text-xl font-semibold">Introduction</h3>
                  {essay.essay.body && (
                    <CopyToClipboardButton
                      textToCopy={essay.essay.introduction}
                    />
                  )}
                </div>
                <div className="mb-4 border-l-4 border-blue-500 pl-4 text-base">
                  <Highlighter
                    searchWords={words}
                    autoEscape={true}
                    textToHighlight={essay.essay.introduction}
                  />
                </div>
                <div className="flex items-center">
                  <h3 className="mb-2 text-xl font-semibold">Body</h3>
                  {essay.essay.body && (
                    <CopyToClipboardButton textToCopy={essay.essay.body} />
                  )}
                </div>
                <div className="mb-4 whitespace-pre-line border-l-4 border-blue-500 pl-4 text-base">
                  <Highlighter
                    searchWords={words}
                    autoEscape={true}
                    textToHighlight={essay.essay.body}
                  />
                </div>
                <div className="flex items-center">
                  <h3 className="mb-2 text-xl font-semibold">Conclusion</h3>
                  {essay.essay.body && (
                    <CopyToClipboardButton
                      textToCopy={essay.essay.conclusion}
                    />
                  )}
                </div>
                <div className="mb-4 border-l-4 border-blue-500 pl-4 text-base">
                  <Highlighter
                    searchWords={words}
                    autoEscape={true}
                    textToHighlight={essay.essay.conclusion}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LearnMultipleWords;

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface WordShape {
  word: string;
}

export interface CreateEssayFormShape {
  words: WordShape[];
}

const schema: z.Schema<CreateEssayFormShape> = z.object({
  words: z.array(
    z.object({
      word: z.string().min(1),
    })
  ),
});

export const emptyWord: WordShape = {
  word: "",
};

export const useEssayCompositionForm = () => {
  return useForm<CreateEssayFormShape>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      words: [emptyWord],
    },
  });
};

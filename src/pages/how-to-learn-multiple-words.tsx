import React from "react";
import { FaBook, FaBolt, FaGraduationCap } from "react-icons/fa";
import Link from "next/link";

const HowToLearnMultipleWords: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <main className="w-full max-w-3xl space-y-6 p-4">
        <h1 className="text-center text-4xl font-bold text-black md:text-5xl">
          How to Use the Word Learning Support Service
        </h1>

        <div className="space-y-4 text-lg">
          <p>
            Our Word Learning Support Service helps you learn English words
            effectively by generating academic essays that include the words you
            want to learn. The AI-generated essays are practical and
            IELTS-oriented, allowing you to learn new words in context.
          </p>

          <h2 className="text-2xl font-semibold">How to use the service:</h2>
          <ol className="list-none space-y-4 pl-0">
            <li className="flex items-center space-x-4">
              <FaBook className="h-8 w-8 text-teal-500" />
              <span>
                Enter one word per form field. You can add up to 10 form fields.
              </span>
            </li>
            <li className="flex items-center space-x-4">
              <FaBolt className="h-8 w-8 text-teal-500" />
              <span>Click the "Submit" button.</span>
            </li>
            <li className="flex items-center space-x-4">
              <FaGraduationCap className="h-8 w-8 text-teal-500" />
              <span>
                Wait for a moment, and an essay containing the words you entered
                will be generated.
              </span>
            </li>
          </ol>
          <Link
            href="/learn-multiple-words"
            className="mx-auto mt-6 block max-w-min whitespace-nowrap rounded-md bg-gradient-to-r from-teal-400 to-blue-500 px-4 py-2 text-lg font-bold text-white"
          >
            Start Learning Now
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HowToLearnMultipleWords;

import React from "react";
import Link from "next/link";

const StudyEnglishVocabulary: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <main className="flex flex-col items-center space-y-6 px-5">
        <h1 className="text-center text-4xl font-bold md:text-5xl">
          Word Learning Support Service
        </h1>
        <h2 className="px-4 text-center text-2xl font-semibold text-black md:text-3xl">
          Learn words with certainty
        </h2>

        <div className="flex flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0">
          <Link href="/learn-single-word">
            <button className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 md:w-auto">
              Learn a word in a sentence
            </button>
          </Link>
          <Link href="/how-to-learn-multiple-words">
            <button className="w-full rounded-lg bg-gradient-to-r from-green-600 to-teal-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:from-green-700 hover:to-teal-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 md:w-auto">
              Learn multiple words in an essay
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default StudyEnglishVocabulary;

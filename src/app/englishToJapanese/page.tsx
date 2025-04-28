"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Question {
  word: string;
  meaning: string;
  example: string;
  translation: string;
  remark: string;
}

export default function EnglishToJapanesePage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const range = searchParams.get("range");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const filePath = `/json/${type}/${range}.json`;
        const response = await fetch(filePath);

        if (!response.ok) {
          throw new Error("Failed to fetch question data");
        }

        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch question data");
        setLoading(false);
      }
    };

    if (type && range) {
      fetchQuestions();
    }
  }, [type, range]);

  const handleAnswer = (understood: boolean) => {
    // TODO: ここで理解度を保存する処理を追加
    if (!understood) {
    }
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">No questions found.</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-gray-700 font-bold mb-6">English → Japanese</h1>

      {/* 進捗表示 */}
      <div className="mb-4 text-gray-600">
        Question {currentQuestionIndex + 1} / {questions.length}
      </div>

      {/* 問題カード */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Word</h2>
          <p className="text-2xl text-violet-600 mb-4">{currentQuestion.word}</p>

          <h2 className="text-xl font-bold text-gray-700 mb-2">Example</h2>
          <p className="text-lg text-gray-600">{currentQuestion.example}</p>
        </div>

        {!showAnswer ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              I got it
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              I don&apos;t know
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-700 mb-2">Meaning:</h3>
              <p className="text-lg text-gray-600 mb-4">{currentQuestion.meaning}</p>

              <h3 className="font-bold text-gray-700 mb-2">Translation:</h3>
              <p className="text-lg text-gray-600 mb-4">{currentQuestion.translation}</p>

              {currentQuestion.remark && (
                <>
                  <h3 className="font-bold text-gray-700 mb-2">Remark:</h3>
                  <p className="text-gray-600">{currentQuestion.remark}</p>
                </>
              )}
            </div>

            {currentQuestionIndex < questions.length - 1 && (
              <button
                onClick={handleNext}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Next Question
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

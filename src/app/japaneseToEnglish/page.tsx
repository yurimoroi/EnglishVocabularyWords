"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Question {
  id: number;
  word: string;
  meaning: string;
  example: string;
  translation: string;
  remark: string;
}

export default function JapaneseToEnglishPage() {
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
          throw new Error("問題データの取得に失敗しました");
        }

        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "問題データの取得に失敗しました");
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
          <div className="text-gray-600">読み込み中...</div>
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
        <div className="text-center text-gray-600">問題が見つかりませんでした。</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-gray-700 font-bold mb-6">Japanese → English</h1>

      {/* 進捗表示 */}
      <div className="mb-4 text-gray-600">
        問題 {currentQuestionIndex + 1} / {questions.length}
      </div>

      {/* 問題カード */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-2">意味</h2>
          <p className="text-2xl text-violet-600 mb-4">{currentQuestion.meaning}</p>

          <h2 className="text-xl font-bold text-gray-700 mb-2">例文</h2>
          <p className="text-lg text-gray-600 mb-2">{currentQuestion.example}</p>

          <h2 className="text-xl font-bold text-gray-700 mb-2">訳</h2>
          <p className="text-lg text-gray-600 mb-2">{currentQuestion.translation}</p>
        </div>

        {!showAnswer ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              わかった
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              わからなかった
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-700 mb-2">単語:</h3>
              <p className="text-lg text-gray-600">{currentQuestion.word}</p>
              {currentQuestion.remark && (
                <>
                  <h3 className="font-bold text-gray-700 mt-4 mb-2">備考:</h3>
                  <p className="text-gray-600">{currentQuestion.remark}</p>
                </>
              )}
            </div>

            {currentQuestionIndex < questions.length - 1 && (
              <button
                onClick={handleNext}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                次の問題へ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: number;
  word: string;
  meaning: string;
  example: string;
  translation: string;
  remark: string;
}

export default function AnswerPage() {
  const { user } = useAuth();

  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") as string;
  const range = searchParams.get("range") as string;
  const random = searchParams.get("random");
  const mode = searchParams.get("mode");
  const onlyWrong = searchParams.get("onlyWrong");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<number[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const speakText = async (text: string) => {
    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
            audioConfig: { audioEncoding: "MP3" },
          }),
        }
      );

      const data = await response.json();
      const audioContent = data.audioContent;
      const audioBlob = new Blob([Uint8Array.from(atob(audioContent), (c) => c.charCodeAt(0))], {
        type: "audio/mp3",
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);
      newAudio.play();
    } catch (error) {
      console.error("音声合成に失敗しました:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        URL.revokeObjectURL(audio.src);
      }
    };
  }, [audio]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const filePath = `/json/${type}/${range}.json`;
        const response = await fetch(filePath);

        if (!response.ok) {
          throw new Error("問題データの取得に失敗しました");
        }

        const data = await response.json();
        let processedQuestions = data;

        // 間違えた問題のみを表示する場合
        if (onlyWrong === "true" && user) {
          const resultDocRef = doc(db, "results", user.uid);
          const resultDoc = await getDoc(resultDocRef);

          if (resultDoc.exists()) {
            const userData = resultDoc.data();
            if (userData[type] && userData[type][range]) {
              const wrongQuestionIds = userData[type][range];
              processedQuestions = processedQuestions.filter((question: Question) =>
                wrongQuestionIds.includes(question.id)
              );
            }
          }
        }

        // ランダム出題の場合、問題をシャッフル
        if (random === "true") {
          processedQuestions = [...processedQuestions].sort(() => Math.random() - 0.5);
        }

        setQuestions(processedQuestions);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "問題データの取得に失敗しました");
        setLoading(false);
      }
    };

    if (type && range) {
      fetchQuestions();
    }
  }, [type, range, random, onlyWrong, user]);

  const handleAnswer = (understood: boolean) => {
    if (understood) {
      setShowConfirmation(true);
      setShowAnswer(true);
    } else {
      const currentQuestion = questions[currentQuestionIndex];
      setWrongQuestionIds((prev) => [...prev, currentQuestion.id]);
      setShowAnswer(true);
    }
  };

  const handleConfirmation = (correct: boolean) => {
    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      const currentQuestion = questions[currentQuestionIndex];
      setWrongQuestionIds((prev) => [...prev, currentQuestion.id]);
    }
    setShowConfirmation(false);

    if (currentQuestionIndex < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(currentQuestionIndex === questions.length);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(currentQuestionIndex === questions.length);
    }
  };

  const handleSaveResult = async () => {
    try {
      if (user === null) return;

      const userDocRef = doc(db, "results", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // 既存のデータを取得
        const existingData = userDoc.data();

        // 同じtypeのrangeのみを更新
        await updateDoc(userDocRef, {
          [type]: {
            ...existingData[type],
            [range]: wrongQuestionIds,
          },
        });
      } else {
        // 新規登録
        await setDoc(userDocRef, {
          [type]: {
            [range]: wrongQuestionIds,
          },
        });
      }
    } catch (error) {
      console.error("誤った問題の保存に失敗しました:", error);
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
        <div className="flex justify-center mt-4">
          <button
            onClick={() => router.push("/question")}
            className="text-gray-600 hover:text-gray-800 flex items-center cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            問題選択に戻る
          </button>
        </div>
      </div>
    );
  }

  // 全問解き終わった場合
  if (currentQuestionIndex === questions.length) {
    const score = Math.round((correctAnswers / questions.length) * 100);
    let message = "";
    if (score === 100) {
      message = "素晴らしい！完璧なスコアです！";
    } else if (score >= 80) {
      message = "とても良い出来です！";
    } else if (score >= 60) {
      message = "よく頑張りました！";
    } else {
      message = "もう一度復習してみましょう！";
    }

    // 間違えた問題のみを保存する場合は保存しない
    if (onlyWrong !== "true") {
      handleSaveResult();
    }

    return (
      <div className="px-8 lg:px-50 py-4 bg-gray-50 h-screen overflow-hidden">
        <div className="p-8 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-center text-gray-700 mb-4">お疲れ様でした！</h2>
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-violet-600 mb-2">{score}点</p>
              <p className="text-gray-600">{message}</p>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.push("/question")}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white text-center font-medium py-4 px-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm cursor-pointer"
              >
                問題選択に戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="px-8 lg:px-50 py-4 bg-gray-50 h-screen overflow-hidden">
      {/* 戻るボタン */}
      <button
        onClick={() => {
          if (window.confirm("問題選択画面に戻りますか？\n現在の進捗は保存されません。")) {
            router.push("/question");
          }
        }}
        className="mb-2 text-xs text-gray-600 hover:text-gray-800 flex items-center cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        問題選択に戻る
      </button>

      {/* 進捗表示 */}
      <div className="mb-2 text-gray-600 text-xs">
        問題 {currentQuestionIndex + 1} / {questions.length}
      </div>

      {/* 問題カード */}
      <div className="bg-white rounded-lg shadow-lg p-6 sm:h-100 h-[calc(100vh-10rem)] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {mode === "japaneseToEnglish" ? (
            <>
              <h2 className="text-xs font-bold text-gray-700 mb-1">意味</h2>
              <p className="text-xs text-violet-600">{currentQuestion.meaning}</p>

              {currentQuestion.example && (
                <>
                  <h2 className="text-xs font-bold text-gray-700 mt-3 mb-1">例文</h2>
                  <p className="text-xs text-gray-600">{currentQuestion.example}</p>
                </>
              )}

              {currentQuestion.translation && (
                <>
                  <h2 className="text-xs font-bold text-gray-700 mt-3 mb-1">日本語訳</h2>
                  <p className="text-xs text-gray-600">{currentQuestion.translation}</p>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xs font-bold text-gray-700">Word</h2>
                <button
                  onClick={() => speakText(currentQuestion.word)}
                  className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-violet-600">{currentQuestion.word}</p>

              {currentQuestion.example && (
                <>
                  <h2 className="text-xs font-bold text-gray-700 mt-3 mb-1">Example</h2>
                  <p className="text-xs text-gray-600">{currentQuestion.example}</p>
                </>
              )}
            </>
          )}

          {showAnswer && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {mode === "japaneseToEnglish" ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-700 text-xs">単語:</h3>
                    <button
                      onClick={() => speakText(currentQuestion.word)}
                      className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">{currentQuestion.word}</p>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-gray-700 mb-1 text-xs">Meaning:</h3>
                  <p className="text-xs text-gray-600">{currentQuestion.meaning}</p>

                  {currentQuestion.translation && (
                    <>
                      <h3 className="font-bold text-gray-700 mt-3 mb-1 text-xs">
                        Example Meaning:
                      </h3>
                      <p className="text-xs text-gray-600">{currentQuestion.translation}</p>
                    </>
                  )}
                </>
              )}
              {currentQuestion.remark && (
                <>
                  <h3 className="font-bold text-gray-700 mt-3 mb-1 text-xs">
                    {mode === "japaneseToEnglish" ? "備考:" : "Remark:"}
                  </h3>
                  <p className="text-xs text-gray-600">{currentQuestion.remark}</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          {!showAnswer && !showConfirmation ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(true)}
                className="bg-green-500 hover:bg-green-600 text-white text-center font-medium py-4 px-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap cursor-pointer"
              >
                {mode === "japaneseToEnglish" ? "わかった" : "I got it"}
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="bg-red-500 hover:bg-red-600 text-white text-center font-medium py-4 px-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap cursor-pointer"
              >
                {mode === "japaneseToEnglish" ? "わからなかった" : "I don't know"}
              </button>
            </div>
          ) : showConfirmation ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleConfirmation(true)}
                className="bg-green-500 hover:bg-green-600 text-white text-center font-medium py-4 px-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap cursor-pointer"
              >
                {mode === "japaneseToEnglish" ? "正解" : "Correct"}
              </button>
              <button
                onClick={() => handleConfirmation(false)}
                className="bg-red-500 hover:bg-red-600 text-white text-center font-medium py-4 px-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap cursor-pointer"
              >
                {mode === "japaneseToEnglish" ? "不正解" : "Incorrect"}
              </button>
            </div>
          ) : (
            currentQuestionIndex < questions.length && (
              <button
                onClick={handleNext}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white text-center font-medium py-4 px-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap cursor-pointer"
              >
                {mode === "japaneseToEnglish"
                  ? currentQuestionIndex === questions.length - 1
                    ? "終了！"
                    : "次の問題へ"
                  : currentQuestionIndex === questions.length - 1
                  ? "Finish!"
                  : "Next Question"}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

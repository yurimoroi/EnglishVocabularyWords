"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { FiArrowLeft, FiVolume2 } from "react-icons/fi";
import { Question } from "@/types/answerPage";

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
  const [wrongQuestion, setWrongQuestion] = useState<number[]>([]);
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
        if (type === "reviews" && user) {
          // 昨日の日付を取得
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          // 昨日の学習記録を取得
          const reviewDocRef = doc(db, "reviews", user.uid);
          const reviewDoc = await getDoc(reviewDocRef);

          if (!reviewDoc.exists()) {
            setError("復習データが見つかりませんでした");
            setLoading(false);
            return;
          }

          const data = reviewDoc.data();
          if (!data[yesterdayStr]) {
            setError("昨日の学習記録が見つかりませんでした");
            setLoading(false);
            return;
          }

          // 昨日学習した単元の問題を全て取得
          const allQuestions: Question[] = [];
          for (const review of data[yesterdayStr]) {
            const filePath = `/json/${review.type}/${review.range}.json`;
            const response = await fetch(filePath);
            if (!response.ok) continue;

            const questions = await response.json();
            allQuestions.push(...questions);
          }

          // 最大50問をランダムに選択
          const selectedQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 50);

          setQuestions(selectedQuestions);
          setLoading(false);
          return;
        } else if (range === "overcome" && user) {
          const resultDocRef = doc(db, "results", user.uid);
          const resultDoc = await getDoc(resultDocRef);

          if (resultDoc.exists()) {
            const resultData = resultDoc.data();
            if (resultData[type]) {
              const fieldNames = Object.keys(resultData[type]);

              const data = [];
              for (const fieldName of fieldNames) {
                const filePath = `/json/${type}/${fieldName}.json`;
                const response = await fetch(filePath);
                if (!response.ok) {
                  throw new Error("問題データの取得に失敗しました");
                }

                const questions = await response.json();
                data.push(...questions);
              }

              const wrongQuestion: number[] = [];
              for (const [, value] of Object.entries(resultData[type])) {
                if (Array.isArray(value)) {
                  value.forEach((v: number) => {
                    wrongQuestion.push(v);
                  });
                }
              }

              const processedQuestions = data.filter(
                (question: Question, index: number) => wrongQuestion[index] !== 0
              );

              const selectedQuestions = processedQuestions
                .sort(() => Math.random() - 0.5)
                .slice(0, 50);

              setQuestions(selectedQuestions);
              setLoading(false);
            }
          }
          return;
        }

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
              const wrongQuestion = userData[type][range];
              processedQuestions = processedQuestions.filter(
                (question: Question, index: number) => wrongQuestion[index] !== 0
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

    if (type && (range || type === "reviews")) {
      fetchQuestions();
    }
  }, [type, range, random, onlyWrong, user]);

  const handleAnswer = (understood: boolean) => {
    if (understood) {
      setShowConfirmation(true);
      setShowAnswer(true);
    } else {
      setWrongQuestion((prev) => [...prev, 1]);
      setShowAnswer(true);
    }
  };

  const handleConfirmation = (correct: boolean) => {
    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
      setWrongQuestion((prev) => [...prev, 0]);
    } else {
      setWrongQuestion((prev) => [...prev, 1]);
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

      // reviewsの場合またはovercomeの場合はDBに登録しない
      if (type === "reviews" || range === "overcome") return;

      // 誤った問題の保存
      const resultDocRef = doc(db, "results", user.uid);
      const resultDoc = await getDoc(resultDocRef);

      if (resultDoc.exists()) {
        const existingData = resultDoc.data();
        const existingWrongQuestions = existingData[type]?.[range] || [];

        // 新しい配列の長さに合わせて初期化
        const initializedWrongQuestions = Array(wrongQuestion.length).fill(0);

        // ランダム出題の場合、回答を問題順に並び替える
        let newWrongQuestions;
        if (random === "true") {
          // 問題の元の順序を保持するためのマッピングを作成
          const originalOrder = questions.map((q, index) => ({
            id: q.id,
            wrongCount: wrongQuestion[index],
          }));

          // ID順にソート
          originalOrder.sort((a, b) => a.id - b.id);

          // ソートされた順序で新しい配列を作成
          newWrongQuestions = originalOrder.map((item) => item.wrongCount);
        } else {
          newWrongQuestions = initializedWrongQuestions.map(
            (_, index) => (existingWrongQuestions[index] || 0) + wrongQuestion[index]
          );
        }

        await updateDoc(resultDocRef, {
          count: {
            [type]: {
              ...(existingData.count?.[type] || {}),
              [range]: {
                ...(existingData.count?.[type]?.[range] || {}),
                count: (existingData.count?.[type]?.[range]?.count || 0) + 1,
              },
            },
          },
          [type]: {
            ...(existingData[type] || {}),
            [range]: newWrongQuestions,
          },
        });
      } else {
        // ランダム出題の場合、回答を問題順に並び替える
        let finalWrongQuestions;
        if (random === "true") {
          // 問題の元の順序を保持するためのマッピングを作成
          const originalOrder = questions.map((q, index) => ({
            id: q.id,
            wrongCount: wrongQuestion[index],
          }));

          // ID順にソート
          originalOrder.sort((a, b) => a.id - b.id);

          // ソートされた順序で新しい配列を作成
          finalWrongQuestions = originalOrder.map((item) => item.wrongCount);
        } else {
          finalWrongQuestions = wrongQuestion;
        }

        await setDoc(resultDocRef, {
          count: {
            [type]: {
              [range]: { count: 1 },
            },
          },
          [type]: {
            [range]: finalWrongQuestions,
          },
        });
      }

      // 学習記録の保存
      const reviewDocRef = doc(db, "reviews", user.uid);
      const reviewDoc = await getDoc(reviewDocRef);
      const today = new Date().toISOString().split("T")[0];

      if (reviewDoc.exists()) {
        const existingData = reviewDoc.data();
        const todayReviews = existingData[today] || [];

        // 同じtypeとrangeの組み合わせが既に存在するかチェック
        const isDuplicate = todayReviews.some(
          (review: { type: string; range: string }) =>
            review.type === type && review.range === range
        );

        if (!isDuplicate) {
          // その日のデータのみを保持
          await setDoc(reviewDocRef, {
            [today]: [
              ...todayReviews,
              {
                type,
                range,
              },
            ],
          });
        }
      } else {
        await setDoc(reviewDocRef, {
          [today]: [
            {
              type,
              range,
            },
          ],
        });
      }

      // 統計データの保存
      const statisticsDocRef = doc(db, "statistics", user.uid);
      const statisticsDoc = await getDoc(statisticsDocRef);
      const score = Math.round((correctAnswers / questions.length) * 100);

      if (statisticsDoc.exists()) {
        const existingData = statisticsDoc.data();
        const todayStats = existingData[today][0] || [];
        await updateDoc(statisticsDocRef, {
          [today]: [
            {
              correctRate:
                ((todayStats.correctRate || 0) + score) / (todayStats.correctRate ? 2 : 1),
              numberOfWords: (todayStats.numberOfWords || 0) + questions.length,
            },
          ],
        });

        if (type !== "reviews" && range !== "overcome") {
          if (score === 100) {
            const perfect = existingData[type]?.[range]?.perfect || 0;

            await updateDoc(statisticsDocRef, {
              [type]: {
                ...(existingData[type] || {}),
                [range]: {
                  perfect: perfect + 1,
                },
              },
            });
          }
        }
      } else {
        await setDoc(statisticsDocRef, {
          [today]: [
            {
              correctRate: score,
              numberOfWords: questions.length,
            },
          ],
        });

        if (type !== "reviews" && range !== "overcome") {
          if (score === 100) {
            await updateDoc(statisticsDocRef, {
              [type]: {
                [range]: {
                  perfect: 1,
                },
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("データの保存に失敗しました:", error);
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
            <FiArrowLeft />
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
        <FiArrowLeft />
        問題選択に戻る
      </button>

      {/* 進捗表示 */}
      <div className="mb-2 text-gray-600 text-xs">
        問題 {currentQuestionIndex + 1} / {questions.length}
      </div>

      {/* 問題カード */}
      <div className="bg-white rounded-lg shadow-lg p-6 sm:h-150 h-[calc(100vh-10rem)] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {mode === "japaneseToEnglish" ? (
            <>
              <h2 className="text-xs font-bold text-gray-700 mb-1">意味</h2>
              <p className="text-sm text-violet-600">
                {currentQuestion.meaning.split("　").map((word, index) => (
                  <span key={index}>
                    {word}
                    {index < currentQuestion.meaning.split("　").length - 1 && <br />}
                  </span>
                ))}
              </p>

              {currentQuestion.example && (
                <>
                  <h2 className="text-xs font-bold text-gray-700 mt-3 mb-1">例文</h2>
                  <p className="text-sm text-gray-600">{currentQuestion.example}</p>
                </>
              )}

              {currentQuestion.translation && (
                <>
                  <h2 className="text-xs font-bold text-gray-700 mt-3 mb-1">日本語訳</h2>
                  <p className="text-sm text-gray-600">{currentQuestion.translation}</p>
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
                  <FiVolume2 />
                </button>
              </div>
              <p className="text-sm text-violet-600">{currentQuestion.word}</p>

              {currentQuestion.example && (
                <>
                  <h2 className="text-xs font-bold text-gray-700 mt-3 mb-1">Example</h2>
                  <p className="text-sm text-gray-600">{currentQuestion.example}</p>
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
                      <FiVolume2 />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{currentQuestion.word}</p>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-gray-700 mb-1 text-xs">Meaning:</h3>
                  <p className="text-sm text-gray-600">
                    {currentQuestion.meaning.split("　").map((word, index) => (
                      <span key={index}>
                        {word}
                        {index < currentQuestion.meaning.split("　").length - 1 && <br />}
                      </span>
                    ))}
                  </p>

                  {currentQuestion.translation && (
                    <>
                      <h3 className="font-bold text-gray-700 mt-3 mb-1 text-xs">
                        Example Meaning:
                      </h3>
                      <p className="text-sm text-gray-600">{currentQuestion.translation}</p>
                    </>
                  )}
                </>
              )}
              {currentQuestion.remark && (
                <>
                  <h3 className="font-bold text-gray-700 mt-3 mb-1 text-xs">
                    {mode === "japaneseToEnglish" ? "備考:" : "Remark:"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentQuestion.remark.split("　").map((word, index) => (
                      <span key={index}>
                        {word}
                        {index < currentQuestion.remark.split("　").length - 1 && <br />}
                      </span>
                    ))}
                  </p>
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { FiPenTool, FiClock } from "react-icons/fi";

export default function QuestionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState("TOEIC");
  const [selectedDirection, setSelectedDirection] = useState("japaneseToEnglish");
  const [isRandom, setIsRandom] = useState(false);
  const [isOnlyWrong, setIsOnlyWrong] = useState(false);
  const [yesterdayReviews, setYesterdayReviews] = useState<Array<{ type: string; range: string }>>(
    []
  );

  useEffect(() => {
    const fetchYesterdayReviews = async () => {
      if (!user) return;

      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const reviewDocRef = doc(db, "reviews", user.uid);
        const reviewDoc = await getDoc(reviewDocRef);

        if (reviewDoc.exists()) {
          const data = reviewDoc.data();
          if (data[yesterdayStr]) {
            setYesterdayReviews(data[yesterdayStr]);
          }
        }
      } catch (error) {
        console.error("前日の復習データの取得に失敗しました:", error);
      }
    };

    fetchYesterdayReviews();
  }, [user]);

  const buttonStyle =
    "bg-violet-500 hover:bg-violet-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer";

  const questionTypes = [
    { id: "TOEIC", label: "TOEIC" },
    { id: "TOEIC_THEME", label: "TOEIC THEME" },
    { id: "TOEIC_THEME2", label: "TOEIC THEME2" },
    { id: "IELTS", label: "IELTS" },
  ];

  const directionTypes = [
    { id: "japaneseToEnglish", label: "日本語 → 英語" },
    { id: "englishToJapanese", label: "英語 → 日本語" },
  ];

  const handleQuestionSetClick = (set: string) => {
    // セット名から数値範囲を抽出（例：'TOEIC 1-100' から '1-100'）
    const range = set.split(" ")[1];

    // クエリパラメータとしてタイプとファイル名を渡す
    router.push(
      `/answer?type=${selectedType.toLowerCase()}&range=${range}&mode=${selectedDirection}&random=${isRandom}&onlyWrong=${isOnlyWrong}`
    );
  };

  const toeicSets = [
    "TOEIC 1-50",
    "TOEIC 51-100",
    "TOEIC 101-150",
    "TOEIC 151-200",
    "TOEIC 201-250",
    "TOEIC 251-300",
    "TOEIC 301-350",
    "TOEIC 351-400",
    "TOEIC 401-450",
    "TOEIC 451-500",
    "TOEIC 501-550",
    "TOEIC 551-600",
    "TOEIC 601-650",
    "TOEIC 651-700",
    "TOEIC 701-750",
    "TOEIC 751-800",
    "TOEIC 801-850",
    "TOEIC 851-900",
    "TOEIC 901-950",
    "TOEIC 951-1000",
    "TOEIC supplement1",
    "TOEIC supplement2",
    "TOEIC supplement3",
  ];

  const toeicThemeSets = [
    "TOEIC_THEME Banking_and_Finance",
    "TOEIC_THEME Marketing",
    "TOEIC_THEME Hospitality",
    "TOEIC_THEME Office",
    "TOEIC_THEME Shopping",
    "TOEIC_THEME Transportation",
    "TOEIC_THEME Health",
    "TOEIC_THEME Telephone",
    "TOEIC_THEME Travel",
    "TOEIC_THEME Mail",
    "TOEIC_THEME Insurance",
    "TOEIC_THEME Meetings",
  ];

  const toeicTheme2Sets = [
    "TOEIC_THEME2 General_Business",
    "TOEIC_THEME2 Office_Issues",
    "TOEIC_THEME2 Personnel",
    "TOEIC_THEME2 Purchasing",
    "TOEIC_THEME2 Financing_and_Budgeting",
    "TOEIC_THEME2 Management_Issues",
    "TOEIC_THEME2 Restaurants_and_Events",
    "TOEIC_THEME2 Travel",
    "TOEIC_THEME2 Entertainment",
    "TOEIC_THEME2 Health",
  ];

  // const ieltsSets = [
  //   "IELTS 1-100",
  //   "IELTS 101-200",
  //   "IELTS 201-300",
  //   "IELTS 301-400",
  //   "IELTS 401-500",
  //   "IELTS 501-600",
  //   "IELTS 601-700",
  //   "IELTS 701-800",
  // ];

  const handleReviewClick = () => {
    router.push(
      `/answer?type=reviews&range=none&mode=${selectedDirection}&random=true&onlyWrong=${isOnlyWrong}`
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-gray-700 font-bold mb-6">問題を解いて、単語を覚えよう</h1>

      {/* 前日の復習セクション */}
      {yesterdayReviews.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => handleReviewClick()}
            className="w-full bg-violet-100 hover:bg-violet-200 text-violet-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <FiClock />
            前日の復習
          </button>
        </div>
      )}

      {/* 苦手の克服セクション */}
      <div className="mb-8">
        <button
          onClick={() =>
            router.push(
              `/answer?type=${selectedType.toLowerCase()}&range=overcome&mode=${selectedDirection}&random=true&onlyWrong=true`
            )
          }
          className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <FiPenTool />
          苦手の克服
        </button>
      </div>

      {/* 問題の方向セレクター */}
      <div className="mb-6">
        <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-2">
          問題の方向を選択
        </label>
        <select
          id="direction"
          value={selectedDirection}
          onChange={(e) => setSelectedDirection(e.target.value)}
          className="w-full text-gray-700 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500"
        >
          {directionTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* 問題種類セレクター */}
      <div className="mb-6">
        <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-2">
          問題の種類を選択
        </label>
        <select
          id="questionType"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full text-gray-700 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500"
        >
          {questionTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* 出題設定 */}
      <div className="mb-6 flex flex-col gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isRandom}
            onChange={(e) => setIsRandom(e.target.checked)}
            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-sm text-gray-700">ランダムに出題する</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isOnlyWrong}
            onChange={(e) => setIsOnlyWrong(e.target.checked)}
            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-sm text-gray-700">過去に間違えた問題のみ出題する</span>
        </label>
      </div>

      {/* 問題セットのグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedType === "TOEIC" &&
          toeicSets.map((set, index) => (
            <button key={index} className={buttonStyle} onClick={() => handleQuestionSetClick(set)}>
              {set}
            </button>
          ))}
        {/* {selectedType === "IELTS" &&
          ieltsSets.map((set, index) => (
            <button key={index} className={buttonStyle} onClick={() => handleQuestionSetClick(set)}>
              {set}
            </button>
          ))} */}
        {selectedType === "TOEIC_THEME" &&
          toeicThemeSets.map((set, index) => (
            <button key={index} className={buttonStyle} onClick={() => handleQuestionSetClick(set)}>
              {set}
            </button>
          ))}
        {selectedType === "TOEIC_THEME2" &&
          toeicTheme2Sets.map((set, index) => (
            <button key={index} className={buttonStyle} onClick={() => handleQuestionSetClick(set)}>
              {set}
            </button>
          ))}
      </div>
    </div>
  );
}

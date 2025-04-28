"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuestionPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("TOEIC");
  const [selectedDirection, setSelectedDirection] = useState("japaneseToEnglish");

  const buttonStyle =
    "bg-violet-500 hover:bg-violet-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg hover:cursor-pointer";

  const questionTypes = [
    { id: "TOEIC", label: "TOEIC" },
    { id: "IELTS", label: "IELTS" },
  ];

  const directionTypes = [
    { id: "japaneseToEnglish", label: "日本語 → 英語" },
    { id: "englishToJapanese", label: "英語 → 日本語" },
  ];

  const handleQuestionSetClick = (set: string) => {
    // セット名から数値範囲を抽出（例：'TOEIC 1-100' から '1-100'）
    const range = set.split(" ")[1];

    // 選択された方向に基づいてパスを決定
    const basePath =
      selectedDirection === "englishToJapanese" ? "/englishToJapanese" : "/japaneseToEnglish";

    // クエリパラメータとしてタイプとファイル名を渡す
    router.push(`${basePath}?type=${selectedType.toLowerCase()}&range=${range}`);
  };

  const toeicSets = [
    "TOEIC 1-100",
    "TOEIC 101-200",
    "TOEIC 201-300",
    "TOEIC 301-400",
    "TOEIC 401-500",
    "TOEIC 501-600",
    "TOEIC 601-700",
    "TOEIC 701-800",
    "TOEIC 801-900",
    "TOEIC 901-1000",
  ];

  const ieltsSets = [
    "IELTS 1-100",
    "IELTS 101-200",
    "IELTS 201-300",
    "IELTS 301-400",
    "IELTS 401-500",
    "IELTS 501-600",
    "IELTS 601-700",
    "IELTS 701-800",
  ];

  return (
    <div className="p-8">
      <h1 className="text-gray-700 font-bold mb-6">問題を解いて、単語を覚えよう</h1>

      {/* 過去の間違えた問題ボタン */}
      <div className="mb-8">
        <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg hover:cursor-pointer">
          過去に間違えた問題を復習する
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

      {/* 問題セットのグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedType === "TOEIC" &&
          toeicSets.map((set, index) => (
            <button key={index} className={buttonStyle} onClick={() => handleQuestionSetClick(set)}>
              {set}
            </button>
          ))}
        {selectedType === "IELTS" &&
          ieltsSets.map((set, index) => (
            <button key={index} className={buttonStyle} onClick={() => handleQuestionSetClick(set)}>
              {set}
            </button>
          ))}
      </div>
    </div>
  );
}

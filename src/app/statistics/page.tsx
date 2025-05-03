"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatisticsPage = () => {
  const [selectedSubject, setSelectedSubject] = useState("englishToJapanese");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // 日ごとの正答率データ（仮データ）
  const dailyAccuracyData = {
    labels: [
      "1日",
      "2日",
      "3日",
      "4日",
      "5日",
      "6日",
      "7日",
      "8日",
      "9日",
      "10日",
      "11日",
      "12日",
      "13日",
      "14日",
      "15日",
      "16日",
      "17日",
      "18日",
      "19日",
      "20日",
      "21日",
      "22日",
      "23日",
      "24日",
      "25日",
      "26日",
      "27日",
      "28日",
      "29日",
      "30日",
      "31日",
    ],
    datasets: [
      {
        label: "正答率",
        data: [
          65, 70, 75, 80, 85, 90, 95, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 50, 55, 60, 65, 70,
          75, 80, 85, 90, 95, 50, 55, 60, 65, 70,
        ],
        borderColor: "rgb(124, 58, 237)",
        backgroundColor: "rgba(124, 58, 237, 0.5)",
        tension: 0.4,
      },
    ],
  };

  // 科目ごとの進捗率データ（仮データ）
  const subjectProgressData = {
    labels: ["完了", "未完了"],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ["rgb(124, 58, 237)", "rgb(229, 231, 235)"],
        borderWidth: 0,
      },
    ],
  };

  // 日ごとの学習単語数データ（仮データ）
  const dailyWordCountData = {
    labels: [
      "1日",
      "2日",
      "3日",
      "4日",
      "5日",
      "6日",
      "7日",
      "8日",
      "9日",
      "10日",
      "11日",
      "12日",
      "13日",
      "14日",
      "15日",
      "16日",
      "17日",
      "18日",
      "19日",
      "20日",
      "21日",
      "22日",
      "23日",
      "24日",
      "25日",
      "26日",
      "27日",
      "28日",
      "29日",
      "30日",
      "31日",
    ],
    datasets: [
      {
        label: "学習単語数",
        data: [
          50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230,
          240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350,
        ],
        backgroundColor: "rgba(124, 58, 237, 0.5)",
        borderColor: "rgb(124, 58, 237)",
        borderWidth: 1,
      },
    ],
  };

  const rateOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 500,
      },
    },
  };

  const hasData = true; // 実際のデータの有無を確認する変数

  return (
    <div className="px-8 lg:px-50 py-4 bg-gray-50 h-screen overflow-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-gray-700 mb-6">学習統計</h1>

        {/* 日ごとの正答率 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">日ごとの正答率</h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          {hasData ? (
            <div className="h-80">
              <Line data={dailyAccuracyData} options={rateOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              データがありません
            </div>
          )}
        </div>

        {/* 科目ごとの進捗率 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">科目ごとの進捗率</h2>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="englishToJapanese">英→日</option>
              <option value="japaneseToEnglish">日→英</option>
            </select>
          </div>
          {hasData ? (
            <div className="h-80 flex justify-center items-center">
              <div className="w-64 h-64">
                <Doughnut
                  data={subjectProgressData}
                  options={{
                    ...rateOptions,
                    cutout: "70%",
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              データがありません
            </div>
          )}
        </div>

        {/* 日ごとの学習単語数 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">日ごとの学習単語数</h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          {hasData ? (
            <div className="h-80">
              <Bar data={dailyWordCountData} options={barOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              データがありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;

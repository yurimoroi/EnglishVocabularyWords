"use client";

import { useState, useEffect } from "react";
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
import { questionTypes, toeicSets } from "@/options/options";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";

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

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: (number | null)[];
    borderColor?: string;
    backgroundColor: string | string[];
    tension?: number;
    borderWidth?: number;
  }[];
}

const StatisticsPage = () => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState("TOEIC");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dailyAccuracyData, setDailyAccuracyData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "正答率",
        data: [],
        borderColor: "rgb(124, 58, 237)",
        backgroundColor: "rgba(124, 58, 237, 0.5)",
        tension: 0.4,
      },
    ],
  });
  const [subjectProgressData, setSubjectProgressData] = useState<ChartData>({
    labels: ["完了", "未完了"],
    datasets: [
      {
        label: "進捗率",
        data: [0, 0],
        backgroundColor: ["rgb(124, 58, 237)", "rgb(229, 231, 235)"],
        borderWidth: 0,
      },
    ],
  });
  const [dailyWordCountData, setDailyWordCountData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "学習単語数",
        data: [],
        backgroundColor: "rgba(124, 58, 237, 0.5)",
        borderColor: "rgb(124, 58, 237)",
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user) return;

      try {
        const statisticsDocRef = doc(db, "statistics", user.uid);
        const statisticsDoc = await getDoc(statisticsDocRef);

        if (statisticsDoc.exists()) {
          const data = statisticsDoc.data();
          const [year, month] = selectedMonth.split("-");
          const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

          // 日付のラベルを生成
          const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`);

          // 正答率データの処理
          const accuracyData = Array(daysInMonth).fill(null);
          const wordCountData = Array(daysInMonth).fill(0);

          Object.entries(data).forEach(([date, stats]) => {
            const [statsYear, statsMonth, statsDay] = date.split("-");
            if (statsYear === year && statsMonth === month) {
              const dayIndex = parseInt(statsDay) - 1;
              if (Array.isArray(stats)) {
                const dayStats = stats[0];
                if (dayStats) {
                  accuracyData[dayIndex] = dayStats.correctRate || 0;
                  wordCountData[dayIndex] = dayStats.numberOfWords || 0;
                }
              }
            }
          });

          setDailyAccuracyData((prev) => ({
            ...prev,
            labels,
            datasets: [
              {
                ...prev.datasets[0],
                data: accuracyData,
              },
            ],
          }));

          setDailyWordCountData((prev) => ({
            ...prev,
            labels,
            datasets: [
              {
                ...prev.datasets[0],
                data: wordCountData,
              },
            ],
          }));

          // 進捗率データの処理
          if (selectedSubject === "TOEIC") {
            const totalSets = toeicSets.length;
            const completedSets = Object.keys(data).reduce((count, date) => {
              const stats = data[date];
              if (Array.isArray(stats)) {
                stats.forEach((stat) => {
                  if (stat.type === "TOEIC" && stat.range) {
                    const range = stat.range.split(" ")[1];
                    if (toeicSets.includes(`TOEIC ${range}`)) {
                      count++;
                    }
                  }
                });
              }
              return count;
            }, 0);

            setSubjectProgressData((prev) => ({
              ...prev,
              datasets: [
                {
                  ...prev.datasets[0],
                  data: [completedSets, totalSets - completedSets],
                },
              ],
            }));
          }
        }
      } catch (error) {
        console.error("統計データの取得に失敗しました:", error);
      }
    };

    fetchStatistics();
  }, [user, selectedMonth, selectedSubject]);

  const rateOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max:
          Math.max(
            ...dailyWordCountData.datasets[0].data.filter((v): v is number => typeof v === "number")
          ) + 10,
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const hasData = dailyAccuracyData.datasets[0].data.some((value) => typeof value === "number");

  return (
    <div className="px-4 sm:px-8 lg:px-50 py-4 bg-gray-50 min-h-screen overflow-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-gray-700 mb-6">学習統計</h1>

        {/* 日ごとの正答率 */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-lg font-bold text-gray-700">日ごとの正答率</h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          {hasData ? (
            <div className="h-[300px] sm:h-[400px]">
              <Line data={dailyAccuracyData} options={rateOptions} />
            </div>
          ) : (
            <div className="h-[300px] sm:h-[400px] flex items-center justify-center text-gray-500">
              データがありません
            </div>
          )}
        </div>

        {/* 科目ごとの進捗率 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-lg font-bold text-gray-700">科目ごとの進捗率</h2>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {questionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
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
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-lg font-bold text-gray-700">日ごとの学習単語数</h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          {hasData ? (
            <div className="h-[300px] sm:h-[400px]">
              <Bar data={dailyWordCountData} options={barOptions} />
            </div>
          ) : (
            <div className="h-[300px] sm:h-[400px] flex items-center justify-center text-gray-500">
              データがありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;

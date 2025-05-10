"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { directionTypes, questionTypes } from "@/options/options";
import { passwordSchema } from "@/schema/schema";

const SettingsPage = () => {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // 学習設定の状態
  const [direction, setDirection] = useState("japaneseToEnglish");
  const [questionType, setQuestionType] = useState("TOEIC");
  const [isRandom, setIsRandom] = useState(false);
  const [isOnlyWrong, setIsOnlyWrong] = useState(false);

  // 設定の読み込み
  useEffect(() => {
    const loadSettings = () => {
      if (!user) return;

      try {
        const userData = sessionStorage.getItem("user");
        if (userData) {
          const data = JSON.parse(userData);
          setDirection(data.direction || "japaneseToEnglish");
          setQuestionType(data.questionType || "TOEIC");
          setIsRandom(data.isRandom || false);
          setIsOnlyWrong(data.isOnlyWrong || false);
        }
      } catch (error) {
        console.error("設定の読み込みに失敗しました:", error);
      }
    };

    loadSettings();
  }, [user]);

  // 設定の保存
  const saveAllSettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const usersDocRef = doc(db, "users", user.uid);
      const usersDoc = await getDoc(usersDocRef);

      const settings = {
        direction,
        questionType,
        isRandom,
        isOnlyWrong,
      };

      if (usersDoc.exists()) {
        await updateDoc(usersDocRef, settings);
        // セッションストレージも更新
        const userData = sessionStorage.getItem("user");
        if (userData) {
          const currentData = JSON.parse(userData);
          sessionStorage.setItem(
            "user",
            JSON.stringify({
              ...currentData,
              ...settings,
            })
          );
        }
      }

      alert("設定を保存しました");
    } catch (error) {
      console.error("設定の保存に失敗しました:", error);
      alert("設定の保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
    setErrors({});
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const validatePassword = () => {
    const newErrors: typeof errors = {};

    try {
      passwordSchema.parse(newPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.newPassword = error.errors[0].message;
      }
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "パスワードが一致しません";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validatePassword()) return;

    try {
      setIsLoading(true);
      if (user) {
        await updatePassword(user, newPassword);
        setShowPasswordModal(false);
        alert("パスワードを変更しました");
      }
    } catch (error) {
      console.error("パスワードの変更に失敗しました:", error);
      setErrors({
        currentPassword: "現在のパスワードが正しくありません",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-8 lg:px-50 py-4 bg-gray-50 h-screen overflow-hidden">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-700">設定</h1>
          <button
            onClick={saveAllSettings}
            disabled={isLoading}
            className="text-sm bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "保存中..." : "保存"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">アカウント設定</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">メールアドレス</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <button className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer" disabled>
                変更
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">パスワード</p>
                <p className="text-sm text-gray-500">••••••••</p>
              </div>
              <button
                onClick={handlePasswordChange}
                className="text-xs text-violet-500 hover:text-violet-700 cursor-pointer"
              >
                変更
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">学習設定</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">問題の方向</p>
                <select
                  value={direction}
                  onChange={(e) => {
                    setDirection(e.target.value);
                  }}
                  className="mt-1 text-sm text-gray-700 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {directionTypes.map((direction) => (
                    <option key={direction.id} value={direction.id}>
                      {direction.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">問題の種類</p>
                <select
                  value={questionType}
                  onChange={(e) => {
                    setQuestionType(e.target.value);
                  }}
                  className="mt-1 text-sm text-gray-700 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {questionTypes.map((questionType) => (
                    <option key={questionType.id} value={questionType.id}>
                      {questionType.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">出題順序</p>
                <div className="mt-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRandom}
                      onChange={(e) => {
                        setIsRandom(e.target.checked);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    <span className="ml-3 text-sm text-gray-700">
                      {isRandom ? "ランダム" : "順番通り"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">過去に間違えた問題</p>
                <div className="mt-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOnlyWrong}
                      onChange={(e) => {
                        setIsOnlyWrong(e.target.checked);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    <span className="ml-3 text-sm text-gray-700">
                      {isOnlyWrong ? "オン" : "オフ"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">音声設定</p>
                <p className="text-sm text-gray-500">自動再生</p>
              </div>
              <button className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer" disabled>
                変更
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">その他</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">通知設定</p>
                <p className="text-sm text-gray-500">毎日20:00</p>
              </div>
              <button className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer" disabled>
                変更
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">データのエクスポート</p>
                <p className="text-sm text-gray-500">学習履歴をCSVで出力</p>
              </div>
              <button className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer" disabled>
                エクスポート
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* パスワード変更モーダル */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-700 mb-4">パスワードの変更</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  現在のパスワード
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full border ${
                    errors.currentPassword ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500`}
                />
                {errors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新しいパスワード
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full border ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500`}
                />
                {errors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新しいパスワード（確認）
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                disabled={isLoading}
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                className="text-sm bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "変更中..." : "変更"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

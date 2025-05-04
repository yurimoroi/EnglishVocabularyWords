"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { updatePassword } from "firebase/auth";

const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください")
  .max(30, "パスワードは30文字以下で入力してください")
  .regex(/[a-z]/, "小文字の英字を含めてください")
  .regex(/[A-Z]/, "大文字の英字を含めてください")
  .regex(/[0-9]/, "数字を含めてください")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "記号を含めてください");

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
    <div className="px-8 lg:px-50 py-4 bg-gray-50 h-screen overflow-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-gray-700 mb-6">設定</h1>

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
                <p className="text-sm font-medium text-gray-700">出題順序</p>
                <p className="text-sm text-gray-500">ランダム</p>
              </div>
              <button className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer" disabled>
                変更
              </button>
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

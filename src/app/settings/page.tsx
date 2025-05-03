"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const SettingsPage = () => {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-700 mb-4">パスワードの変更</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  現在のパスワード
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新しいパスワード
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新しいパスワード（確認）
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                キャンセル
              </button>
              <button className="text-sm bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg">
                変更
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

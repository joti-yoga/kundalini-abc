import { Link } from "react-router-dom";

export default function EntryChoice() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center p-4">
      <h1 className="text-2xl font-semibold mb-6">歡迎加入 Joti's 昆達里尼 ABC 瑜伽</h1>
      <p className="mb-8">請選擇您要以什麼方式進入</p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link to="/register" className="bg-yellow-400 text-white py-2 px-4 rounded-xl shadow">註冊新帳號</Link>
        <Link to="/login" className="border border-yellow-400 text-yellow-600 py-2 px-4 rounded-xl">已有帳號登入</Link>
        <Link to="/guest-home" className="text-gray-500 underline">以訪客身份體驗</Link>
      </div>
    </div>
  );
}
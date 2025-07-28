import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold text-yellow-600 mb-4">Joti's 昆達里尼 ABC 瑜伽</h1>
      <p className="mb-6">Asana．Breath．Chant — 開啟你的內在轉化之旅</p>
      <div className="flex gap-4">
        <Link to="/guest-home" className="bg-white border border-yellow-400 text-yellow-600 px-6 py-2 rounded-xl shadow">訪客體驗</Link>
        <Link to="/register" className="bg-yellow-400 text-white px-6 py-2 rounded-xl shadow">立即註冊</Link>
      </div>
    </div>
  );
}
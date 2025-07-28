import { Link } from "react-router-dom";

export default function Upgrade() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">升級為專屬會員</h1>
      <p className="mb-4">解鎖完整課程內容，享受更多個人化功能</p>
      <button className="bg-yellow-400 text-white px-6 py-2 rounded-xl shadow mb-4">立即升級（月付 NT$399）</button>
      <Link to="/member-home" className="text-sm text-gray-500 underline">稍後再說</Link>
    </div>
  );
}
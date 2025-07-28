import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-yellow-600 mb-4">歡迎回來！</h1>
      <p className="mb-6">祝您有個充實的昆達里尼瑜伽旅程</p>
      <Link to="/member-home" className="bg-yellow-400 text-white px-6 py-2 rounded-xl shadow">前往會員首頁</Link>
    </div>
  );
}
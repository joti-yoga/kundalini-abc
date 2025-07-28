import { Link } from "react-router-dom";

export default function TrialPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
      <h2 className="text-2xl font-semibold mb-4">開啟免費 3 天體驗</h2>
      <p className="mb-6">無需綁定信用卡，立即體驗完整功能！</p>
      <Link to="/member-home" className="bg-yellow-400 text-white px-6 py-2 rounded-xl shadow">立即開啟體驗</Link>
    </div>
  );
}
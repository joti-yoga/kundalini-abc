import { Link } from "react-router-dom";

export default function TrialEnd() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">體驗已結束</h2>
      <p className="mb-6">升級會員以持續使用全部課程與功能</p>
      <Link to="/upgrade" className="bg-yellow-400 text-white px-6 py-2 rounded-xl shadow">升級會員</Link>
    </div>
  );
}
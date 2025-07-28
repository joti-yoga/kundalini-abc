import { Link } from "react-router-dom";

export default function MemberHome() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-4">會員首頁</h1>
      <nav className="grid gap-4">
        <Link to="/courses" className="block bg-yellow-100 rounded-xl p-4 shadow">我的課程</Link>
        <Link to="/community" className="block bg-yellow-100 rounded-xl p-4 shadow">社群交流</Link>
        <Link to="/profile" className="block bg-yellow-100 rounded-xl p-4 shadow">個人設定</Link>
        <Link to="/upgrade" className="block bg-yellow-400 text-white rounded-xl p-4 shadow">升級會員</Link>
      </nav>
    </div>
  );
}
import { Link } from "react-router-dom";

export default function RegisterSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center p-6">
      <h1 className="text-2xl font-bold mb-4">註冊成功！</h1>
      <p className="mb-6">歡迎加入 Joti's 昆達里尼 ABC 瑜伽 App</p>
      <Link to="/welcome" className="bg-yellow-400 text-white py-2 px-6 rounded-xl shadow">開始體驗</Link>
    </div>
  );
}
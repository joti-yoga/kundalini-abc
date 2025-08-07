import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 2000); // 2 秒後跳轉

    return () => clearTimeout(timer); // 清除計時器
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-yellow-50 p-8 rounded-2xl shadow-md text-center space-y-4">
        <h2 className="text-2xl font-semibold text-yellow-600">註冊成功！</h2>
        <p className="text-gray-600">歡迎加入 Joti's 昆達里尼瑜伽</p>
        <p className="text-gray-400 text-sm">即將為你導向主畫面...</p>
      </div>
    </div>
  );
}
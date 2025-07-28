import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Launch = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/intro");
    }, 3000); // 停留 3 秒

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <img src="/logo.png" alt="App Logo" className="w-40 h-40" />
    </div>
  );
};

export default Launch;
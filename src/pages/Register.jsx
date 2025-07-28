import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // 模擬註冊成功
    navigate("/register-success");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form onSubmit={handleSubmit} className="bg-yellow-50 p-8 rounded-2xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-center">建立帳號</h2>
        <input type="text" placeholder="姓名" className="w-full p-2 border rounded-md" required />
        <input type="email" placeholder="Email" className="w-full p-2 border rounded-md" required />
        <input type="password" placeholder="密碼" className="w-full p-2 border rounded-md" required />
        <button type="submit" className="w-full bg-yellow-400 text-white py-2 rounded-xl shadow">註冊</button>
      </form>
    </div>
  );
}
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/member-home");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form onSubmit={handleLogin} className="bg-yellow-50 p-8 rounded-2xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-center">會員登入</h2>
        <input type="email" placeholder="Email" className="w-full p-2 border rounded-md" required />
        <input type="password" placeholder="密碼" className="w-full p-2 border rounded-md" required />
        <button type="submit" className="w-full bg-yellow-400 text-white py-2 rounded-xl shadow">登入</button>
      </form>
    </div>
  );
}
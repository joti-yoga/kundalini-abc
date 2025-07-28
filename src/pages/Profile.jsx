export default function Profile() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-4">個人設定</h1>
      <ul className="space-y-2 text-gray-700">
        <li>會員名稱：Joti</li>
        <li>會員狀態：已啟用</li>
        <li>Email：example@example.com</li>
      </ul>
    </div>
  );
}
import { Link } from "react-router-dom";

// 假設這裡會接收一個影片清單資料
const mockCourses = [
  { id: "1", title: "心臟清理練習" },
  { id: "2", title: "呼吸能量提升課" },
  { id: "3", title: "靈性唱誦與放鬆" },
];

export default function Courses() {
  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">我的課程</h2>
      <ul className="space-y-3">
        {mockCourses.map(course => (
          <li key={course.id}>
            <Link to={`/course/${course.id}`} className="block p-4 bg-yellow-100 rounded-xl shadow">
              {course.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
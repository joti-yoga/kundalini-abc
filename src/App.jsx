import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Launch from './pages/Launch';
import Welcome from './pages/Welcome';
import Intro from './pages/Intro';
import RegisterSuccess from './pages/RegisterSuccess';
import CoursePlayer from './pages/CoursePlayer';
import MemberSettings from './pages/MemberSettings';
import Upgrade from './pages/Upgrade';
import Entry from './pages/Entry';
import CourseList from './pages/CourseList';
import PracticeCalendar from './pages/PracticeCalendar';  // 引入 PracticeCalendar
import Community from './pages/Community';  // 引入 Community
import DesignSystemDemo from './pages/DesignSystemDemo';  // 引入設計系統示例
import RouteTest from './pages/RouteTest';  // 引入路由測試頁面
import VimeoTest from './pages/VimeoTest';  // 引入 Vimeo 測試頁面




function App() {
  return (
    <Router>
      <Routes>
        {/* 其他頁面路由 */}
        <Route path="/" element={<Launch />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/entry" element={<Entry />} />
        <Route path="/welcome" element={<Welcome />} />

        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/home" element={<Home />} />
        <Route path="/course/:id" element={<CoursePlayer />} />
        <Route path="/course-player/:videoIds" element={<CoursePlayer />} />
        <Route path="/settings" element={<MemberSettings />} />
        <Route path="/upgrade" element={<Upgrade />} />

        {/* 新增路由設定 */}
        <Route path="/course-list" element={<CourseList />} />
        <Route path="/practice-calendar" element={<PracticeCalendar />} />  {/* 新增練習日曆頁面路由 */}
        <Route path="/community" element={<Community />} />  {/* 新增社群互動頁面路由 */}
        <Route path="/design-system" element={<DesignSystemDemo />} />  {/* 設計系統示例頁面 */}
        <Route path="/route-test/:videoIds" element={<RouteTest />} />  {/* 路由測試頁面 */}
        <Route path="/vimeo-test" element={<VimeoTest />} />  {/* Vimeo 測試頁面 */}


      </Routes>
    </Router>
  );
}

export default App;
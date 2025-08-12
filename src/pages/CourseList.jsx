import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import styled from 'styled-components';

// Styled Components 用於動態間距控制
const StyledVideoTitle = styled.h3`
  font-size: 1.5rem;
  color: #1f2937;
  font-weight: 600;
  margin-bottom: ${props => props.$isMobile ? '0.05rem' : '0.5rem'};
`;

const StyledVideoDescription = styled.p`
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: ${props => props.$isMobile ? '0.1rem' : '0.75rem'};
`;

// 自定義 Hook 來監聽視窗大小
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// YouTube 新手必修影片資料
const beginnerCoursesVideos = [
  {
    id: "beginner-1",
    title: "深長呼吸",
    description: "呼吸就是最好的藥—昆達里尼瑜伽「神經淨化呼吸法」：【深長呼吸】完整教學｜同步改善肺部功能＋憂鬱預防，科學驗證的冷靜耐心養成術",
    duration: "5分鐘01秒",
    youtubeId: "f07tEDlzB5c",
    thumbnail: `https://img.youtube.com/vi/f07tEDlzB5c/maxresdefault.jpg`
  },
  {
    id: "beginner-2",
    title: "調頻與冥想入門",
    description: "學習基本的調頻技巧和簡單的冥想練習",
    duration: "30分鐘",
    youtubeId: "e_esmWeX2Oc",
    thumbnail: `https://img.youtube.com/vi/e_esmWeX2Oc/maxresdefault.jpg`
  },
  {
    id: "beginner-3",
    title: "基礎體式練習",
    description: "學習昆達里尼瑜伽的基本體式和動作序列",
    duration: "40分鐘",
    youtubeId: "BvcoNwATUW4",
    thumbnail: `https://img.youtube.com/vi/BvcoNwATUW4/maxresdefault.jpg`
  }
];

// YouTube 完整課程影片資料
const completeCoursesVideos = [
  {
    id: "complete-1",
    title: "拜日式熱身+提升的奎亞+克爾坦奎亞SaTaNaMa唱誦冥想",
    description: "適合初學者的完整昆達里尼瑜伽課程，包含調頻、熱身、體式、放鬆、冥想和結束祈禱",
    duration: "1.5小時",
    youtubeId: "dQw4w9WgXcQ", // 測試用 YouTube ID
    thumbnail: `https://img.youtube.com/vi/q19x_KVHico/maxresdefault.jpg`
  }
];

// 假設這是來自後端的課程資料，包含了影片選項
const mockCourses = [
  { id: "1", title: "1. 調頻", options: [
      { id: "1-1", title: "調頻影片 1", duration: 10, description: "10 分鐘調頻練習", youtubeId: "tvkcOmfXQuE", thumbnail: "https://img.youtube.com/vi/tvkcOmfXQuE/maxresdefault.jpg" },
      { id: "1-2", title: "調頻影片 2", duration: 15, description: "15 分鐘調頻練習", youtubeId: "", thumbnail: "" },
      { id: "1-3", title: "調頻影片 3", duration: 20, description: "20 分鐘調頻練習", youtubeId: "", thumbnail: "" }
  ] },
  { id: "2", title: "2. 熱身（呼吸/動作）", options: [
      { id: "2-1", title: "熱身影片 1", duration: 15, description: "15 分鐘熱身", youtubeId: "e_esmWeX2Oc", thumbnail: "https://img.youtube.com/vi/e_esmWeX2Oc/maxresdefault.jpg" },
      { id: "2-2", title: "熱身影片 2", duration: 20, description: "20 分鐘熱身", youtubeId: "HTV4E4ornUA", thumbnail: "https://img.youtube.com/vi/HTV4E4ornUA/maxresdefault.jpg" },
      { id: "2-3", title: "熱身影片 3", duration: 25, description: "25 分鐘熱身", youtubeId: "", thumbnail: "" },
      { id: "2-4", title: "熱身影片 4", duration: 30, description: "30 分鐘熱身", youtubeId: "", thumbnail: "" },
      { id: "2-5", title: "熱身影片 5", duration: 35, description: "35 分鐘熱身", youtubeId: "", thumbnail: "" },
      { id: "2-6", title: "熱身影片 6", duration: 40, description: "40 分鐘熱身", youtubeId: "", thumbnail: "" },
      { id: "2-7", title: "熱身影片 7", duration: 45, description: "45 分鐘熱身", youtubeId: "", thumbnail: "" },
      { id: "2-8", title: "熱身影片 8", duration: 50, description: "50 分鐘熱身", youtubeId: "", thumbnail: "" }
  ] },
  { id: "3", title: "3. 體式動作序列/身體奎亞", options: [
      { id: "3-1", title: "體式動作影片 1", duration: 25, description: "25 分鐘體式動作", youtubeId: "BvcoNwATUW4", thumbnail: "https://img.youtube.com/vi/BvcoNwATUW4/maxresdefault.jpg" },
      { id: "3-2", title: "體式動作影片 2", duration: 30, description: "30 分鐘體式動作", youtubeId: "ASHd6cEdKRs", thumbnail: "https://img.youtube.com/vi/ASHd6cEdKRs/maxresdefault.jpg" }
  ] },
  { id: "4", title: "4. 放鬆休息", options: [
      { id: "4-1", title: "放鬆影片 1", duration: 15, description: "15 分鐘放鬆練習", youtubeId: "Gg5F3Py8un4", thumbnail: "https://img.youtube.com/vi/Gg5F3Py8un4/maxresdefault.jpg" },
      { id: "4-2", title: "放鬆影片 2", duration: 20, description: "20 分鐘放鬆練習", youtubeId: "JwIwBnYsVNk", thumbnail: "https://img.youtube.com/vi/JwIwBnYsVNk/maxresdefault.jpg" }
  ] },
  { id: "5", title: "5. 冥想（呼吸/唱誦）", options: [
      { id: "5-1", title: "冥想影片 1", duration: 20, description: "20 分鐘冥想", youtubeId: "VDdVzux-7HY", thumbnail: "https://img.youtube.com/vi/VDdVzux-7HY/maxresdefault.jpg" },
      { id: "5-2", title: "冥想影片 2", duration: 25, description: "25 分鐘冥想", youtubeId: "HTV4E4ornUA", thumbnail: "https://img.youtube.com/vi/HTV4E4ornUA/maxresdefault.jpg" },
      { id: "5-3", title: "冥想影片 3", duration: 30, description: "30 分鐘冥想", youtubeId: "KYwWSdNb3UA", thumbnail: "https://img.youtube.com/vi/KYwWSdNb3UA/maxresdefault.jpg" },
      { id: "5-4", title: "冥想影片 4", duration: 35, description: "35 分鐘冥想", youtubeId: "yEYFwtmMVLg", thumbnail: "https://img.youtube.com/vi/yEYFwtmMVLg/maxresdefault.jpg" },
      { id: "5-5", title: "冥想影片 5", duration: 40, description: "40 分鐘冥想", youtubeId: "KsOP80J80T8", thumbnail: "https://img.youtube.com/vi/KsOP80J80T8/maxresdefault.jpg" },
      { id: "5-6", title: "冥想影片 6", duration: 45, description: "45 分鐘冥想", youtubeId: "1Z4VQv71l-I", thumbnail: "https://img.youtube.com/vi/1Z4VQv71l-I/maxresdefault.jpg" },
      { id: "5-7", title: "冥想影片 7", duration: 50, description: "50 分鐘冥想", youtubeId: "V3skjng5qP0", thumbnail: "https://img.youtube.com/vi/V3skjng5qP0/maxresdefault.jpg" },
      { id: "5-8", title: "冥想影片 8", duration: 55, description: "55 分鐘冥想", youtubeId: "QnwrIXNddqk", thumbnail: "https://img.youtube.com/vi/QnwrIXNddqk/maxresdefault.jpg" },
      { id: "5-9", title: "冥想影片 9", duration: 60, description: "60 分鐘冥想", youtubeId: "aCyKYSj3aU0", thumbnail: "https://img.youtube.com/vi/aCyKYSj3aU0/maxresdefault.jpg" },
      { id: "5-10", title: "冥想影片 10", duration: 65, description: "65 分鐘冥想", youtubeId: "sip_w8Oxr6o", thumbnail: "https://img.youtube.com/vi/sip_w8Oxr6o/maxresdefault.jpg" }
  ] },
  { id: "6", title: "6. 結束祈禱", options: [
      { id: "6-1", title: "結束祈禱影片 1", duration: 10, description: "10 分鐘結束祈禱", youtubeId: "sQ6KQU2wQ_k", thumbnail: "https://img.youtube.com/vi/sQ6KQU2wQ_k/maxresdefault.jpg" }
  ] }
];

export default function CourseList() {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= 767;

  // 不再需要 useEffect 來修改 CSS 變數，styled-components 會自動處理
  
  const [selectedCourses, setSelectedCourses] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    beginner: false,
    complete: false,
    playlist: false,
    custom: false
  });
  
  const [expandedCourses, setExpandedCourses] = useState({});
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [isGuestMode, setIsGuestMode] = useState(false);

  // 檢查訪客模式狀態
  useEffect(() => {
    const guestMode = localStorage.getItem('isGuestMode') === 'true';
    setIsGuestMode(guestMode);
  }, []);

  // 監聽認證狀態變化並獲取用戶資料
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // 如果 Firestore 中沒有用戶資料，使用 Firebase Auth 的資料
            setUserData({
              displayName: user.displayName || user.email?.split('@')[0] || '用戶',
              email: user.email
            });
          }
        } catch (error) {
          console.error('獲取用戶資料失敗：', error);
          // 發生錯誤時使用 Firebase Auth 的基本資料
          setUserData({
            displayName: user.displayName || user.email?.split('@')[0] || '用戶',
            email: user.email
          });
        }
      } else if (!loading && !isGuestMode) {
        // 用戶未登入且非訪客模式，重定向到登入頁面
        navigate('/entry');
      }
      setAuthLoading(false);
    };

    fetchUserData();
  }, [user, loading, navigate, isGuestMode]);

  // 切換折疊選單
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // 切換課程折疊選單
  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // 用於處理顯示課程選擇
  const handleCourseSelection = (courseId, optionId, duration) => {
    setSelectedCourses(prevState => {
      const updatedCourses = { ...prevState };
      updatedCourses[courseId] = optionId;
      return updatedCourses;
    });
  };

  const getSelectedCoursesDuration = () => {
    const selectedCoursesData = mockCourses.filter(course => selectedCourses[course.id]);
    return selectedCoursesData.reduce((total, course) => {
      const selectedOption = course.options.find(option => option.id === selectedCourses[course.id]);
      return total + (selectedOption ? selectedOption.duration : 0);
    }, 0);
  };

  // 檢查是否所有6個類別都已選擇
  const isPlaylistComplete = () => {
    return mockCourses.every(course => selectedCourses[course.id]);
  };

  // 獲取完整的播放列表資料
  const getCompletePlaylistData = () => {
    return mockCourses.map(course => {
      const selectedOption = course.options.find(option => option.id === selectedCourses[course.id]);
      return {
        categoryTitle: course.title,
        ...selectedOption
      };
    });
  };

  // 保存播放列表
  const savePlaylist = () => {
    if (!playlistName.trim()) {
      alert('請輸入播放列表名稱');
      return;
    }
    
    const playlistData = {
      id: Date.now().toString(),
      name: playlistName,
      videos: getCompletePlaylistData(),
      totalDuration: getSelectedCoursesDuration(),
      createdAt: new Date().toLocaleDateString()
    };
    
    setSavedPlaylists(prev => [...prev, playlistData]);
    setPlaylistName('');
    setShowSaveDialog(false);
    alert('播放列表已保存！');
  };

  // 載入已保存的播放列表
  const loadPlaylist = (playlist) => {
    const newSelectedCourses = {};
    playlist.videos.forEach((video, index) => {
      const courseId = (index + 1).toString();
      newSelectedCourses[courseId] = video.id;
    });
    setSelectedCourses(newSelectedCourses);
  };

  // 刪除已保存的播放列表
  const deletePlaylist = (playlistId) => {
    if (confirm('確定要刪除這個播放列表嗎？')) {
      setSavedPlaylists(prev => prev.filter(p => p.id !== playlistId));
    }
  };

  // 獲取顯示名稱的函數
  const getDisplayName = () => {
    if (isGuestMode) {
      return "訪客";
    }
    if (!userData || !userData.displayName || userData.displayName.trim() === "") {
      return "帥哥/美女";
    }
    return userData.displayName;
  };

  // 處理影片播放（訪客模式限制）
  const handleVideoPlay = (youtubeId) => {
    if (isGuestMode) {
      // 訪客模式：添加時間限制參數，只播放前60秒
      const guestUrl = `https://www.youtube.com/watch?v=${youtubeId}&t=0s&end=60`;
      window.open(guestUrl, '_blank');
      
      // 顯示訪客限制提醒
      setTimeout(() => {
        alert('訪客模式僅能觀看前1分鐘。如需觀看完整影片，請註冊成為會員！');
      }, 1000);
    } else {
      // 正常用戶：播放完整影片
      window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
    }
  };

  // 登出處理
  const handleLogout = async () => {
    if (confirm('確定要登出嗎？')) {
      try {
        // 清除訪客模式標記
        localStorage.removeItem('isGuestMode');
        await signOut(auth);
        navigate('/entry');
      } catch (error) {
        console.error('登出失敗：', error);
        alert('登出失敗，請稍後再試');
      }
    }
  };

  // 如果正在載入認證狀態，顯示載入畫面
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* 固定頂部橫幅 - 合併標題和導航 */}
      <div className="fixed top-0 left-0 right-0 w-full z-50 shadow-md" style={{ backgroundColor: '#999700' }}>
        <div className="w-full px-6 py-4">
          {/* 電腦版布局 - 標題靠左，按鈕靠右 */}
          <div className="hidden md:flex justify-between items-center">
            {/* 左側標題 */}
            <h1 className="text-2xl font-bold" style={{ color: 'white' }}>
              Joti's昆達里尼ABC瑜伽
            </h1>
            
            {/* 右側導航區域 */}
            <div className="flex items-center" style={{gap: '16px'}}>
              {/* 歡迎詞 */}
              <span className="text-white text-sm">
                Hi, {getDisplayName()}
              </span>
              
              {/* 導航按鈕 */}
              <Link 
                to="/home" 
                className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition"
                style={{marginLeft: '16px'}}
              >
                回主選單
              </Link>
              
              <Link 
                to="/practice-calendar" 
                className="px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition"
                style={{marginLeft: '16px'}}
              >
                練習日曆
              </Link>
              
              <Link 
                to="/community" 
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
                style={{marginLeft: '16px'}}
              >
                社群互動
              </Link>
              
              <button 
                onClick={handleLogout}
                className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
                style={{marginLeft: '16px'}}
              >
                登出
              </button>
            </div>
          </div>

          {/* 手機版布局 - 標題在上方，按鈕在下一行靠右 */}
          <div className="md:hidden">
            {/* 標題行 */}
            <div className="mb-3">
              <h1 className="text-xl font-bold" style={{ color: 'white' }}>
                Joti's昆達里尼ABC瑜伽
              </h1>
            </div>
            
            {/* 按鈕行 - 靠右對齊 */}
            <div className="flex justify-end items-center" style={{gap: '8px'}}>
              {/* 歡迎詞 */}
              <span className="text-white text-xs mr-2">
                Hi, {getDisplayName()}
              </span>
              
              {/* 導航按鈕 */}
              <Link 
                to="/home" 
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                style={{marginLeft: '8px'}}
              >
                回主選單
              </Link>
              
              <Link 
                to="/practice-calendar" 
                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                style={{marginLeft: '8px'}}
              >
                練習日曆
              </Link>
              
              <Link 
                to="/community" 
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                style={{marginLeft: '8px'}}
              >
                社群互動
              </Link>
              
              <button 
                onClick={handleLogout}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 為固定橫幅留出空間 - 電腦版和手機版不同高度 */}
      <div className="p-6" style={{ paddingTop: '200px' }}>
        {/* 訪客模式提示橫幅 */}
        {isGuestMode && (
          <div className="mb-6 bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <strong>訪客模式：</strong>您目前以訪客身份瀏覽，每個影片僅能觀看前1分鐘。
                  <Link to="/entry" className="underline hover:text-orange-800 ml-2">
                    立即註冊享受完整體驗
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
        {/* 三個主要按鈕區域 */}
        <div className="space-y-6">
          {/* 新手必修 */}
          <div className="bg-green-100 rounded-xl shadow">
            <button
              onClick={() => toggleSection('beginner')}
              className="w-full p-4 text-left text-4xl font-semibold text-gray-700 hover:bg-green-200 rounded-xl transition flex justify-between items-center"
              style={{ fontSize: '2.25rem' }}
            >
              新手必修
              <span className="text-2xl" style={{ fontSize: '1.5rem' }}>{expandedSections.beginner ? '▼' : '▶'}</span>
            </button>
            {expandedSections.beginner && (
              <div className="p-4 pt-0">
                <div className="space-y-4">
                  {beginnerCoursesVideos.map(video => (
                    <div key={video.id} className="bg-green-200 p-4 rounded-lg">
                      <div className="flex flex-col video-card-mobile gap-4">
                        {/* 影片封面 */}
                        <div className="flex-shrink-0">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="video-thumbnail video-thumbnail-mobile object-cover rounded cursor-pointer hover:opacity-80 transition mx-auto sm:mx-0 border-2 border-green-500"
                            onClick={() => handleVideoPlay(video.youtubeId)}
                          />
                        </div>
                        
                        {/* 影片資訊 */}
                        <div className="flex-1 video-info-mobile">
                          <StyledVideoTitle $isMobile={isMobile}>{video.title}</StyledVideoTitle>
                          <StyledVideoDescription $isMobile={isMobile}>{video.description}</StyledVideoDescription>
                          <div className="flex flex-col gap-3">
                            <span className="text-base font-medium text-gray-700 bg-white px-2 py-1 rounded w-fit" style={{ fontSize: '1rem' }}>
                              時長: {video.duration}
                            </span>

                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 完整課 */}
          <div className="bg-yellow-100 rounded-xl shadow">
            <button
              onClick={() => toggleSection('complete')}
              className="w-full p-4 text-left text-4xl font-semibold text-gray-700 hover:bg-yellow-200 rounded-xl transition flex justify-between items-center"
              style={{ fontSize: '2.25rem' }}
            >
              完整課
              <span className="text-2xl" style={{ fontSize: '1.5rem' }}>{expandedSections.complete ? '▼' : '▶'}</span>
            </button>
            {expandedSections.complete && (
              <div className="p-4 pt-0">
                <div className="space-y-4">
                  {completeCoursesVideos.map(video => (
                    <div key={video.id} className="bg-yellow-200 p-4 rounded-lg">
                      <div className="flex flex-col video-card-mobile gap-4">
                        {/* 影片封面 */}
                        <div className="flex-shrink-0">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="video-thumbnail video-thumbnail-mobile object-cover rounded cursor-pointer hover:opacity-80 transition mx-auto sm:mx-0 border-2 border-red-500"
                            onClick={() => handleVideoPlay(video.youtubeId)}
                          />
                        </div>
                        
                        {/* 影片資訊 */}
                        <div className="flex-1 video-info-mobile">
                          <StyledVideoTitle $isMobile={isMobile}>{video.title}</StyledVideoTitle>
                          <StyledVideoDescription $isMobile={isMobile}>{video.description}</StyledVideoDescription>
                          <div className="flex flex-col gap-3">
                            <span className="text-base font-medium text-gray-700 bg-white px-2 py-1 rounded w-fit" style={{ fontSize: '1rem' }}>
                              時長: {video.duration}
                            </span>

                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 播放列表 */}
          <div className="bg-yellow-100 rounded-xl shadow">
            <button
              onClick={() => toggleSection('playlist')}
              className="w-full p-4 text-left text-4xl font-semibold text-gray-700 hover:bg-yellow-200 rounded-xl transition flex justify-between items-center"
              style={{ fontSize: '2.25rem' }}
            >
              播放列表
              <span className="text-2xl" style={{ fontSize: '1.5rem' }}>{expandedSections.playlist ? '▼' : '▶'}</span>
            </button>
            {expandedSections.playlist && (
              <div className="p-4 pt-0">
                {/* 預設播放列表 */}
                <div className="bg-yellow-200 p-3 rounded-lg mb-4">
                  <h4 className="text-lg font-semibold mb-2" style={{ fontSize: '1.25rem' }}>預設播放列表</h4>
                  <p className="text-gray-600 text-base mb-3" style={{ fontSize: '1rem' }}>預設的課程播放列表，適合不同程度的練習者。</p>
                  <div className="space-y-2">
                    <button className="block w-full bg-white border px-3 py-2 rounded hover:bg-gray-50 transition text-base text-left" style={{ fontSize: '1rem' }}>
                      初級播放列表
                    </button>
                    <button className="block w-full bg-white border px-3 py-2 rounded hover:bg-gray-50 transition text-base text-left" style={{ fontSize: '1rem' }}>
                      中級播放列表
                    </button>
                    <button className="block w-full bg-white border px-3 py-2 rounded hover:bg-gray-50 transition text-base text-left" style={{ fontSize: '1rem' }}>
                      高級播放列表
                    </button>
                  </div>
                </div>

                {/* 自定義播放列表 */}
                <div className="bg-yellow-200 p-3 rounded-lg">
                  <h4 className="text-lg font-semibold mb-2" style={{ fontSize: '1.25rem' }}>我的自定義播放列表</h4>
                  {savedPlaylists.length === 0 ? (
                    <p className="text-gray-600 text-base" style={{ fontSize: '1rem' }}>還沒有保存的播放列表，請到自選課建立您的專屬播放列表。</p>
                  ) : (
                    <div className="space-y-3">
                      {savedPlaylists.map(playlist => (
                        <div key={playlist.id} className="bg-white p-3 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h5 className="font-semibold text-base" style={{ fontSize: '1rem' }}>{playlist.name}</h5>
                              <p className="text-sm text-gray-600" style={{ fontSize: '0.875rem' }}>總時長: {playlist.totalDuration} 分鐘 | 建立於: {playlist.createdAt}</p>
                            </div>
                            <div className="flex gap-2 ml-2">
                              <button
                                onClick={() => loadPlaylist(playlist)}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 transition"
                                style={{ fontSize: '0.875rem' }}
                              >
                                載入
                              </button>
                              <button
                                onClick={() => deletePlaylist(playlist.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition"
                                style={{ fontSize: '0.875rem' }}
                              >
                                刪除
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700" style={{ fontSize: '0.875rem' }}>
                            <p>包含影片: {playlist.videos.map(v => v.title).join(' → ')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 自選課 */}
          <div className="bg-yellow-100 rounded-xl shadow">
            <button
              onClick={() => toggleSection('custom')}
              className="w-full p-4 text-left text-4xl font-semibold text-gray-700 hover:bg-yellow-200 rounded-xl transition flex justify-between items-center"
              style={{ fontSize: '2.25rem' }}
            >
              自選課
              <span className="text-2xl" style={{ fontSize: '1.5rem' }}>{expandedSections.custom ? '▼' : '▶'}</span>
            </button>
            {expandedSections.custom && (
              <div className="p-4 pt-0">
                {/* 原本的六大課程選項 */}
                <div className="space-y-4">
                  {mockCourses.map(course => (
                    <div key={course.id} className="bg-yellow-200 rounded-lg">
                      <button
                        onClick={() => toggleCourse(course.id)}
                        className="w-full p-3 text-left text-2xl font-semibold text-gray-700 hover:bg-yellow-300 rounded-lg transition flex justify-between items-center"
                style={{ fontSize: '1.5rem' }}
                      >
                        {course.title}
                        <span className="text-base" style={{ fontSize: '1rem' }}>{expandedCourses[course.id] ? '▼' : '▶'}</span>
                      </button>
                      {expandedCourses[course.id] && (
                        <div className="px-3 pb-3">
                          <div className="space-y-2">
                            {course.options.map(option => (
                              <div key={option.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  {/* 影片縮圖 */}
                                  {option.thumbnail && option.youtubeId && (
                                    <div className="flex-shrink-0">
                                      <img 
                                        src={option.thumbnail} 
                                        alt={option.title}
                                        className="video-thumbnail object-cover rounded cursor-pointer hover:opacity-80 transition"
                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${option.youtubeId}`, '_blank')}
                                      />
                                    </div>
                                  )}
                                  {/* 預留位置的佔位符 */}
                                  {option.thumbnail === "" && (
                                    <div className="flex-shrink-0">
                                      <div className="video-thumbnail bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                        待上傳
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <button
                                      onClick={() => handleCourseSelection(course.id, option.id, option.duration)}
                                      className={`px-3 py-1 rounded-full text-base ${selectedCourses[course.id] === option.id ? 'bg-yellow-500 text-white' : 'bg-white border'}`}
                                style={{ fontSize: '1rem' }}
                                    >
                                      {selectedCourses[course.id] === option.id ? '已選擇' : option.title}
                                    </button>
                                    <div className="text-sm text-gray-600 mt-1" style={{ fontSize: '0.875rem' }}>{option.description}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 顯示選擇的課程總時長和播放列表預覽 */}
                {Object.keys(selectedCourses).length > 0 && (
                  <div className="mt-4 space-y-4">
                    {/* 播放列表預覽 */}
                    <div className="p-3 bg-yellow-200 rounded-lg">
                      <h4 className="text-lg font-semibold mb-3" style={{ fontSize: '1.25rem' }}>當前播放列表預覽</h4>
                      <div className="space-y-2">
                        {mockCourses.map((course, index) => {
                          const selectedOption = course.options.find(option => option.id === selectedCourses[course.id]);
                          return (
                            <div key={course.id} className="flex items-center justify-between bg-white p-2 rounded border">
                              <div className="flex items-center gap-3">
                                <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                                  {index + 1}
                                </span>
                                <div>
                                  <p className="font-medium text-sm" style={{ fontSize: '0.875rem' }}>{course.title}</p>
                                  {selectedOption ? (
                                    <p className="text-xs text-gray-600" style={{ fontSize: '0.75rem' }}>
                                      {selectedOption.title} ({selectedOption.duration}分鐘)
                                    </p>
                                  ) : (
                                    <p className="text-xs text-red-500" style={{ fontSize: '0.75rem' }}>尚未選擇</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 操作按鈕區域 */}
                    <div className="p-3 bg-yellow-200 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2" style={{ fontSize: '1.25rem' }}>總時長：{getSelectedCoursesDuration()} 分鐘</h4>
                      <div className="flex flex-col gap-2">
                        {Object.keys(selectedCourses).length > 0 ? (
                          <Link to={`/course-player/${Object.values(selectedCourses).join(',')}`}>
                            <button className="w-full bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition text-base" style={{ fontSize: '1rem' }}>
                              開始自選課程
                            </button>
                          </Link>
                        ) : (
                          <button 
                            disabled
                            className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed transition text-base" 
                            style={{ fontSize: '1rem' }}
                          >
                            請先選擇課程
                          </button>
                        )}
                        {isPlaylistComplete() && (
                          <button 
                            onClick={() => setShowSaveDialog(true)}
                            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-base" 
                            style={{ fontSize: '1rem' }}
                          >
                            保存為播放列表
                          </button>
                        )}
                        {!isPlaylistComplete() && (
                          <p className="text-sm text-gray-600 text-center" style={{ fontSize: '0.875rem' }}>
                            請從每個類別中選擇一個影片才能保存播放列表
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 保存播放列表對話框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4" style={{ fontSize: '1.25rem' }}>保存播放列表</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontSize: '0.875rem' }}>
                播放列表名稱
              </label>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="請輸入播放列表名稱"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                style={{ fontSize: '1rem' }}
              />
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600" style={{ fontSize: '0.875rem' }}>此播放列表包含:</p>
              <ul className="text-xs text-gray-500 mt-1" style={{ fontSize: '0.75rem' }}>
                {getCompletePlaylistData().map((video, index) => (
                  <li key={index}>• {video.categoryTitle}: {video.title}</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setPlaylistName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                style={{ fontSize: '1rem' }}
              >
                取消
              </button>
              <button
                onClick={savePlaylist}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                style={{ fontSize: '1rem' }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
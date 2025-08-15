import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Hook for window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Video data
const beginnerCoursesVideos = [
  {
    id: "beginner-1",
    title: "深長呼吸",
    description: "呼吸就是最好的藥—昆達里尼瑜伽「神經淨化呼吸法」：【深長呼吸】完整教學｜同步改善肺部功能＋憂鬱預防，科學驗證的冷靜耐心養成術",
    duration: "5分鐘01秒",
    youtubeId: "f07tEDlzB5c",
    thumbnail: "https://img.youtube.com/vi/f07tEDlzB5c/maxresdefault.jpg"
  },
  {
    id: "beginner-2",
    title: "屏息/懸息",
    description: "為什麼頂尖瑜伽士都在練「呼吸中止」？掌握懸息法，喚醒沉睡的昆達里尼能量！",
    duration: "3分54秒",
    youtubeId: "TqdWpGvdCEs",
    thumbnail: "https://img.youtube.com/vi/TqdWpGvdCEs/maxresdefault.jpg"
  },
  {
    id: "beginner-3",
    title: "火呼吸",
    description: "練習【火呼吸】可以變聰明？增加肺活量、清除毒素｜強健臍輪、抗壓能力、行動力、免疫力｜打破上癮｜這兩類人不能練習！",
    duration: "8分43秒",
    youtubeId: "2L5wFRii8fw",
    thumbnail: "https://img.youtube.com/vi/2L5wFRii8fw/maxresdefault.jpg"
  },
  {
    id: "beginner-4",
    title: "身體鎖：根鎖、頸鎖、大鎖",
    description: "啟動昆達里尼能量的關鍵竟是「憋尿動作」？解密身體鎖的奧秘",
    duration: "2分27秒",
    youtubeId: "TCh-Qcz-DK8",
    thumbnail: "https://img.youtube.com/vi/TCh-Qcz-DK8/maxresdefault.jpg"
  },
  {
    id: "beginner-5",
    title: "坐姿",
    description: "冥想時的坐姿解說大全：簡易坐姿、蓮花坐、至善式、岩石坐",
    duration: "3分31秒",
    youtubeId: "rsOpfPySzR4",
    thumbnail: "https://img.youtube.com/vi/rsOpfPySzR4/maxresdefault.jpg"
  }
];

const completeCoursesVideos = [
  {
    id: "complete-1",
    title: "拜日式熱身+提升的奎亞+克爾坦奎亞SaTaNaMa唱誦冥想",
    description: "適合初學者的完整昆達里尼瑜伽課程，包含調頻、熱身、體式、放鬆、冥想和結束祈禱",
    duration: "1.5小時",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/q19x_KVHico/maxresdefault.jpg"
  }
];

// 自選課程數據
const mockCourses = [
  { id: "1", title: "1. 調頻", options: [
      { id: "1-1", title: "調頻影片 1", duration: 10, description: "10 分鐘調頻練習", youtubeId: "tvkcOmfXQuE", thumbnail: "https://img.youtube.com/vi/tvkcOmfXQuE/maxresdefault.jpg" }
  ] },
  { id: "2", title: "2. 熱身（呼吸/動作）", options: [
      { id: "2-1", title: "熱身影片 1", duration: 15, description: "15 分鐘熱身", youtubeId: "e_esmWeX2Oc", thumbnail: "https://img.youtube.com/vi/e_esmWeX2Oc/maxresdefault.jpg" },
      { id: "2-2", title: "熱身影片 2", duration: 20, description: "20 分鐘熱身", youtubeId: "HTV4E4ornUA", thumbnail: "https://img.youtube.com/vi/HTV4E4ornUA/maxresdefault.jpg" }
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
      { id: "5-3", title: "冥想影片 3", duration: 30, description: "30 分鐘冥想", youtubeId: "KYwWSdNb3UA", thumbnail: "https://img.youtube.com/vi/KYwWSdNb3UA/maxresdefault.jpg" }
  ] },
  { id: "6", title: "6. 結束祈禱", options: [
      { id: "6-1", title: "結束祈禱影片 1", duration: 10, description: "10 分鐘結束祈禱", youtubeId: "sQ6KQU2wQ_k", thumbnail: "https://img.youtube.com/vi/sQ6KQU2wQ_k/maxresdefault.jpg" }
  ] }
];

export default function CourseList() {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    beginner: false,
    complete: false,
    playlist: false,
    custom: false
  });
  const [expandedCourses, setExpandedCourses] = useState({});
  const [selectedCourses, setSelectedCourses] = useState({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const navigate = useNavigate();
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 768;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    if (!loading) {
      fetchUserData();
    }
  }, [user, loading]);

  // 載入已儲存的播放列表
  useEffect(() => {
    const loadSavedPlaylists = () => {
      const playlists = JSON.parse(localStorage.getItem('savedPlaylists') || '[]');
      setSavedPlaylists(playlists);
    };
    
    loadSavedPlaylists();
    
    // 監聽 localStorage 變化
    const handleStorageChange = () => {
      loadSavedPlaylists();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/entry');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => {
      // 如果當前選單已經展開，則關閉所有選單
      if (prev[section]) {
        return {
          beginner: false,
          complete: false,
          playlist: false,
          custom: false
        };
      }
      // 否則關閉所有選單，只展開當前選單
      return {
        beginner: false,
        complete: false,
        playlist: false,
        custom: false,
        [section]: true
      };
    });
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => {
      // 如果當前課程已經展開，則關閉所有課程
      if (prev[courseId]) {
        return {};
      }
      // 否則關閉所有課程，只展開當前課程
      return {
        [courseId]: true
      };
    });
  };

  const handleCourseSelection = (courseId, optionId) => {
    setSelectedCourses(prev => ({
      ...prev,
      [courseId]: optionId
    }));
  };

  const getSelectedCoursesDuration = () => {
    let totalDuration = 0;
    Object.entries(selectedCourses).forEach(([courseId, optionId]) => {
      const course = mockCourses.find(c => c.id === courseId);
      if (course) {
        const option = course.options.find(o => o.id === optionId);
        if (option) {
          totalDuration += option.duration;
        }
      }
    });
    return totalDuration;
  };

  const isPlaylistComplete = () => {
    return Object.keys(selectedCourses).length === mockCourses.length;
  };

  const savePlaylist = () => {
    if (!playlistName.trim()) return;
    
    const selectedVideoIds = Object.values(selectedCourses);
    const playlistUrl = `/course-player/${selectedVideoIds.join(',')}`;
    
    // 保存播放列表到本地存儲
    const currentPlaylists = JSON.parse(localStorage.getItem('savedPlaylists') || '[]');
    const newPlaylist = {
      id: Date.now().toString(),
      name: playlistName,
      description: playlistDescription,
      courses: selectedCourses,
      videoIds: selectedVideoIds,
      duration: getSelectedCoursesDuration(),
      createdAt: new Date().toISOString()
    };
    const updatedPlaylists = [...currentPlaylists, newPlaylist];
    localStorage.setItem('savedPlaylists', JSON.stringify(updatedPlaylists));
    
    // 更新本地狀態
    setSavedPlaylists(updatedPlaylists);
    
    console.log('Saving playlist:', playlistName, selectedCourses);
    setShowSaveDialog(false);
    setPlaylistName('');
    setPlaylistDescription('');
    
    // 跳轉到播放頁面
    navigate(playlistUrl);
  };

  // 刪除播放列表
  const deletePlaylist = (playlistId) => {
    const updatedPlaylists = savedPlaylists.filter(playlist => playlist.id !== playlistId);
    localStorage.setItem('savedPlaylists', JSON.stringify(updatedPlaylists));
    setSavedPlaylists(updatedPlaylists);
  };

  // 播放已儲存的播放列表
  const playPlaylist = (playlist) => {
    const playlistUrl = `/course-player/${playlist.videoIds.join(',')}`;
    navigate(playlistUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Fixed Top Banner */}
      <div className="fixed top-0 left-0 right-0 w-full z-50 shadow-md" style={{ backgroundColor: '#fef3c7' }}>
        <div className="w-full px-6 py-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center">
            <h1 className="text-2xl font-bold" style={{ color: '#999700' }}>
              Joti's昆達里尼ABC瑜伽
            </h1>
            
            <div className="flex items-center" style={{gap: '16px'}}>
              <span className="text-sm" style={{ color: '#999700' }}>
                Hi, {user ? (userData?.displayName || user.email) : '訪客'}
              </span>
              
              <Link 
                to="/member-home" 
                className="text-sm px-3 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                回主選單
              </Link>
              <Link 
                to="/practice-calendar"
                className="text-sm px-3 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                練習日曆
              </Link>
              <Link 
                to="/community" 
                className="text-sm px-3 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                社群互動
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm px-3 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                登出
              </button>
            </div>
          </div>
          
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="mb-3">
              <h1 className="text-xl font-bold" style={{ color: '#999700' }}>
                Joti's昆達里尼ABC瑜伽
              </h1>
            </div>
            
            <div className="flex justify-end items-center" style={{gap: '8px'}}>
              <span className="text-xs mr-2" style={{ color: '#999700' }}>
                Hi, {user ? (userData?.displayName || user.email) : '訪客'}
              </span>
              
              <Link 
                to="/member-home" 
                className="text-xs px-2 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                回主選單
              </Link>
              <Link 
                to="/practice-calendar" 
                className="text-xs px-2 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                練習日曆
              </Link>
              <Link 
                to="/community" 
                className="text-xs px-2 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                社群互動
              </Link>
              <button 
                onClick={handleLogout}
                className="text-xs px-2 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6" style={{ paddingTop: '120px' }}>
        {/* Guest notification */}
        {!user && (
          <div className="mb-6 bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  您目前以訪客身份瀏覽，僅能觀看影片前1分鐘。
                  <Link to="/entry" className="underline hover:text-orange-800 ml-2">
                    立即註冊享3日免費試用
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Desktop: Four main buttons with inline content */}
        {!isMobile && (
          <div className="space-y-8">
            {/* Four main navigation buttons */}
            <div className="flex justify-center" style={{gap: '2.5rem'}}>
              <div className="bg-green-100 rounded-xl shadow" style={{width: '200px', height: '200px'}}>
                <button
                  onClick={() => toggleSection('beginner')}
                  className="w-full h-full flex flex-col items-center justify-center text-2xl font-semibold text-gray-700 hover:bg-green-200 rounded-xl transition"
                >
                  新手必修
                </button>
              </div>
              
              <div className="bg-yellow-100 rounded-xl shadow" style={{width: '200px', height: '200px'}}>
                <button
                  onClick={() => toggleSection('complete')}
                  className="w-full h-full flex flex-col items-center justify-center text-2xl font-semibold text-gray-700 hover:bg-yellow-200 rounded-xl transition"
                >
                  完整課
                </button>
              </div>
              
              <div className="bg-blue-100 rounded-xl shadow" style={{width: '200px', height: '200px'}}>
                <button
                  onClick={() => toggleSection('playlist')}
                  className="w-full h-full flex flex-col items-center justify-center text-2xl font-semibold text-gray-700 hover:bg-blue-200 rounded-xl transition"
                >
                  播放列表
                </button>
              </div>
              
              <div className="bg-purple-100 rounded-xl shadow" style={{width: '200px', height: '200px'}}>
                <button
                  onClick={() => toggleSection('custom')}
                  className="w-full h-full flex flex-col items-center justify-center text-2xl font-semibold text-gray-700 hover:bg-purple-200 rounded-xl transition"
                >
                  自選課
                </button>
              </div>
            </div>

            {/* Inline content sections */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              {/* 新手必修內容 */}
              {expandedSections.beginner && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">新手必修</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {beginnerCoursesVideos.map(video => (
                      <button 
                        key={video.id} 
                        className="bg-green-50 rounded-lg p-4 shadow hover:shadow-lg transition-all duration-200 text-left w-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                        aria-label={`觀看影片：${video.title}`}
                      >
                        <div className="aspect-video mb-3 rounded-lg overflow-hidden" style={{ width: '400px', height: '224px' }}>
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                        <p className="text-sm text-gray-500">時長：{video.duration}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 完整課內容 */}
              {expandedSections.complete && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">完整課</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completeCoursesVideos.map(video => (
                      <button 
                        key={video.id} 
                        className="bg-yellow-50 rounded-lg p-4 shadow hover:shadow-lg transition-all duration-200 text-left w-full hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                        aria-label={`觀看影片：${video.title}`}
                      >
                        <div className="aspect-video mb-3 rounded-lg overflow-hidden" style={{ width: '400px', height: '224px' }}>
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                        <p className="text-sm text-gray-500">時長：{video.duration}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 播放列表內容 */}
              {expandedSections.playlist && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">播放列表</h2>
                  <div className="bg-blue-50 rounded-lg p-6">
                    {savedPlaylists.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-lg text-gray-600 mb-4">還沒有儲存的播放列表</p>
                        <p className="text-gray-500">前往「自選課」建立你的專屬課程並儲存至播放列表</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {savedPlaylists.map((playlist) => (
                          <div key={playlist.id} className="bg-white rounded-lg p-4 shadow hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">{playlist.name}</h3>
                                {playlist.description && (
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{playlist.description}</p>
                                )}
                                <p className="text-sm text-gray-600">
                                  {Object.keys(playlist.courses).length} 個影片 • 總時長: {playlist.duration} 分鐘
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  建立於: {new Date(playlist.createdAt).toLocaleDateString('zh-TW')}
                                </p>
                              </div>
                              <button
                                onClick={() => deletePlaylist(playlist.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded transition"
                                title="刪除播放列表"
                              >
                                ✕
                              </button>
                            </div>
                            
                            {/* 播放列表預覽 */}
                            <div className="mb-3">
                              <div className="text-xs text-gray-600 space-y-1">
                                {Object.entries(playlist.courses).slice(0, 3).map(([courseId, optionId]) => {
                                  const course = mockCourses.find(c => c.id === courseId);
                                  const option = course?.options.find(o => o.id === optionId);
                                  return option ? (
                                    <div key={courseId} className="flex justify-between">
                                      <span>{course.title}: {option.title}</span>
                                      <span>{option.duration} 分鐘</span>
                                    </div>
                                  ) : null;
                                })}
                                {Object.keys(playlist.courses).length > 3 && (
                                  <div className="text-gray-400">...還有 {Object.keys(playlist.courses).length - 3} 個影片</div>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => playPlaylist(playlist)}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                              開始播放
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 自選課內容 */}
              {expandedSections.custom && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">自選課</h2>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <p className="text-lg text-gray-700 mb-6 text-center">選擇每個類別的影片，組成你的專屬課程</p>
                    
                    {/* 已選課程內容 - 移到上方 */}
                    {Object.keys(selectedCourses).length > 0 && (
                      <div className="mb-6 p-6 bg-white rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">你的專屬課程</h3>
                        <div className="flex gap-6 overflow-x-auto pb-2" style={{ gap: '24px' }}>
                           {Object.entries(selectedCourses).map(([courseId, optionId]) => {
                             const course = mockCourses.find(c => c.id === courseId);
                             const option = course?.options.find(o => o.id === optionId);
                             return option ? (
                               <div key={courseId} className="flex-shrink-0 p-3 bg-purple-50 rounded-lg" style={{ width: '200px' }}>
                                 <div className="flex flex-col gap-2">
                                   {option.thumbnail ? (
                                     <img
                                       src={option.thumbnail}
                                       alt={option.title}
                                       className="object-cover rounded w-full"
                                       style={{ height: '100px' }}
                                     />
                                   ) : (
                                     <div className="bg-gray-200 rounded w-full flex items-center justify-center" style={{ height: '100px' }}>
                                        <span className="text-gray-400 text-xs">即將上線</span>
                                      </div>
                                   )}
                                   <div className="text-center">
                                     <p className="font-medium text-gray-800 text-sm">{course.title.replace(/^\d+\.\s*/, '')}</p>
                                     <p className="text-xs text-gray-600 mt-1">{option.title}</p>
                                     <span className="text-purple-600 font-medium text-xs mt-1 block">{option.duration} 分鐘</span>
                                   </div>
                                 </div>
                               </div>
                             ) : null;
                           })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold text-gray-800">總時長: {getSelectedCoursesDuration()} 分鐘</span>
                          </div>
                          
                          {/* 儲存對話框區域內顯示 - 桌面版 */}
                          {showSaveDialog ? (
                            <div className="mt-4 p-6 rounded-lg border-2 border-yellow-600" style={{backgroundColor: '#fef3c7'}}>
                              <h4 className="text-xl font-bold mb-6 text-center" style={{ color: '#999700' }}>
                                建立專屬播放列表
                              </h4>
                              
                              {/* 播放列表名稱 */}
                              <div className="mb-4">
                                <label className="block text-base font-medium mb-3" style={{ color: '#999700' }}>播放列表名稱 *</label>
                                <input
                                  type="text"
                                  value={playlistName}
                                  onChange={(e) => setPlaylistName(e.target.value)}
                                  placeholder="為你的專屬課程命名"
                                  className="w-full border border-gray-400 rounded focus:outline-none focus:border-gray-600 px-4 py-3 text-base"
                                  autoFocus
                                />
                              </div>
                              
                              {/* 播放列表描述 */}
                              <div className="mb-4">
                                <label className="block text-base font-medium mb-3" style={{ color: '#999700' }}>播放列表描述（選填）</label>
                                <textarea
                                  value={playlistDescription}
                                  onChange={(e) => setPlaylistDescription(e.target.value)}
                                  placeholder="描述這個專屬課程的特色或目標"
                                  rows={3}
                                  className="w-full border border-gray-400 rounded focus:outline-none focus:border-gray-600 resize-none px-4 py-3 text-base"
                                />
                              </div>
                              
                              {/* 課程資訊摘要 */}
                              <div className="mb-6 text-center" style={{color: '#999700'}}>
                                <div className="text-base mb-2">
                                  <span>已選擇 {Object.keys(selectedCourses).length} 個影片</span>
                                </div>
                                <div className="text-base font-medium">
                                  <span>總時長：{getSelectedCoursesDuration()} 分鐘</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-4 justify-center">
                                <button
                                  onClick={() => {
                                    setShowSaveDialog(false);
                                    setPlaylistName('');
                                    setPlaylistDescription('');
                                  }}
                                  className="bg-gray-200 text-gray-800 border border-gray-400 rounded hover:bg-gray-300 transition duration-200 font-medium px-6 py-3"
                                >
                                  取消
                                </button>
                                <button
                                  onClick={savePlaylist}
                                  disabled={!playlistName.trim()}
                                  className="bg-yellow-400 text-white rounded hover:bg-yellow-500 transition duration-200 font-bold shadow-none disabled:bg-gray-300 disabled:cursor-not-allowed px-6 py-3"
                                >
                                  保存並開始
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-4 justify-center">
                              <button
                                onClick={() => setShowSaveDialog(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                              >
                                儲存至播放列表
                              </button>
                              <button
                                disabled={!isPlaylistComplete()}
                                onClick={() => {
                                  if (isPlaylistComplete()) {
                                    const selectedVideoIds = Object.values(selectedCourses);
                                    console.log('Selected courses:', selectedCourses);
                                    console.log('Selected video IDs:', selectedVideoIds);
                                    const playlistUrl = `/course-player/${selectedVideoIds.join(',')}`;
                                    console.log('Playlist URL:', playlistUrl);
                                    navigate(playlistUrl);
                                  }
                                }}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
                              >
                                {isPlaylistComplete() ? '立即開始課程' : `還需選擇 ${mockCourses.length - Object.keys(selectedCourses).length} 個類別`}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* 6個子分類按鈕 - 單行佈局 */}
                    <div className="flex justify-center gap-4 mb-6 overflow-x-auto">
                      {mockCourses.map((course, index) => {
                        const colors = [
                          'bg-red-100 hover:bg-red-200',
                          'bg-orange-100 hover:bg-orange-200', 
                          'bg-yellow-100 hover:bg-yellow-200',
                          'bg-green-100 hover:bg-green-200',
                          'bg-blue-100 hover:bg-blue-200',
                          'bg-indigo-100 hover:bg-indigo-200'
                        ];
                        return (
                          <div key={course.id} className={`${colors[index]} rounded-xl shadow flex-shrink-0`} style={{width: '140px', height: '140px'}}>
                            <button
                              onClick={() => toggleCourse(course.id)}
                              className="w-full h-full flex flex-col items-center justify-center text-lg font-semibold text-gray-700 rounded-xl transition"
                            >
                              <span className="text-center px-2">{course.title.replace(/^\d+\.\s*/, '')}</span>
                              {selectedCourses[course.id] && (
                                <span className="text-xs text-green-600 mt-1">✓</span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* 子分類展開內容 */}
                    {mockCourses.map(course => (
                      expandedCourses[course.id] && (
                        <div key={`expanded-${course.id}`} className="mb-6 bg-white rounded-lg shadow-lg p-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-4">{course.title}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {course.options.map(option => (
                              <button
                                key={option.id}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                                  selectedCourses[course.id] === option.id
                                    ? 'border-purple-500 bg-purple-100 shadow-md'
                                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md'
                                }`}
                                onClick={() => handleCourseSelection(course.id, option.id)}
                              >
                                <div className="flex items-start gap-3">
                                  {option.thumbnail ? (
                                    <img
                                      src={option.thumbnail}
                                      alt={option.title}
                                      className="object-cover rounded flex-shrink-0 transition-transform duration-200 hover:scale-105"
                                      style={{ width: '400px', height: '224px' }}
                                    />
                                  ) : (
                                    <div className="bg-gray-200 rounded flex-shrink-0 flex items-center justify-center" style={{ width: '400px', height: '224px' }}>
                                      <span className="text-gray-400 text-xs">即將上線</span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-800 text-sm">{option.title}</h4>
                                    <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                                    <p className="text-xs text-purple-600 mt-1">{option.duration} 分鐘</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    ))}

                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile: Original vertical layout */}
        {isMobile && (
          <div className="space-y-6">
            {/* 新手必修 */}
            <div className="bg-green-100 rounded-xl shadow">
              <button
                onClick={() => toggleSection('beginner')}
                className="w-full p-6 text-left text-2xl font-semibold text-gray-700 hover:bg-green-200 rounded-xl transition flex justify-between items-center"
              >
                <span>新手必修</span>
                <span className="text-2xl">{expandedSections.beginner ? '▼' : '▶'}</span>
              </button>
              
              {expandedSections.beginner && (
                <div className="p-4 pt-0">
                  <div className="space-y-4">
                    {beginnerCoursesVideos.map(video => (
                      <button 
                        key={video.id} 
                        className="bg-green-200 p-4 rounded-lg w-full text-left hover:bg-green-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 hover:shadow-lg"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="aspect-video object-cover rounded transition-transform duration-200 hover:scale-105"
                              style={{ width: '160px', height: '90px' }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{video.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                            <span className="text-base font-medium text-gray-700 bg-white px-2 py-1 rounded w-fit">
                              時長: {video.duration}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 完整課 */}
            <div className="bg-yellow-100 rounded-xl shadow">
              <button
                onClick={() => toggleSection('complete')}
                className="w-full p-6 text-left text-2xl font-semibold text-gray-700 hover:bg-yellow-200 rounded-xl transition flex justify-between items-center"
              >
                <span>完整課</span>
                <span className="text-2xl">{expandedSections.complete ? '▼' : '▶'}</span>
              </button>
              
              {expandedSections.complete && (
                <div className="p-4 pt-0">
                  <div className="space-y-4">
                    {completeCoursesVideos.map(video => (
                      <button 
                        key={video.id} 
                        className="bg-yellow-200 p-4 rounded-lg w-full text-left hover:bg-yellow-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 hover:shadow-lg"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="aspect-video object-cover rounded transition-transform duration-200 hover:scale-105"
                              style={{ width: '160px', height: '90px' }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{video.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                            <span className="text-base font-medium text-gray-700 bg-white px-2 py-1 rounded w-fit">
                              時長: {video.duration}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 播放列表 */}
            <div className="bg-blue-100 rounded-xl shadow">
              <button
                onClick={() => toggleSection('playlist')}
                className="w-full p-6 text-left text-2xl font-semibold text-gray-700 hover:bg-blue-200 rounded-xl transition flex justify-between items-center"
              >
                <span>播放列表</span>
                <span className="text-2xl">{expandedSections.playlist ? '▼' : '▶'}</span>
              </button>
              
              {expandedSections.playlist && (
                <div className="p-4 pt-0">
                  <div className="bg-blue-200 p-4 rounded-lg">
                    {savedPlaylists.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-700 mb-2 text-sm">還沒有儲存的播放列表</p>
                        <p className="text-gray-600 text-xs">前往「自選課」建立你的專屬課程並儲存至播放列表</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedPlaylists.map((playlist) => (
                          <div key={playlist.id} className="bg-white rounded-lg p-3 shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 text-sm truncate">{playlist.name}</h3>
                                {playlist.description && (
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{playlist.description}</p>
                                )}
                                <p className="text-xs text-gray-600 mt-1">
                                  {Object.keys(playlist.courses).length} 個影片 • {playlist.duration} 分鐘
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(playlist.createdAt).toLocaleDateString('zh-TW')}
                                </p>
                              </div>
                              <button
                                onClick={() => deletePlaylist(playlist.id)}
                                className="text-red-500 hover:text-red-700 p-1 ml-2 flex-shrink-0"
                                title="刪除播放列表"
                              >
                                ✕
                              </button>
                            </div>
                            
                            {/* 播放列表預覽 */}
                            <div className="mb-2">
                              <div className="text-xs text-gray-600 space-y-1">
                                {Object.entries(playlist.courses).slice(0, 2).map(([courseId, optionId]) => {
                                  const course = mockCourses.find(c => c.id === courseId);
                                  const option = course?.options.find(o => o.id === optionId);
                                  return option ? (
                                    <div key={courseId} className="flex justify-between text-xs">
                                      <span className="truncate mr-2">{course.title}: {option.title}</span>
                                      <span className="flex-shrink-0">{option.duration}分</span>
                                    </div>
                                  ) : null;
                                })}
                                {Object.keys(playlist.courses).length > 2 && (
                                  <div className="text-gray-400 text-xs">...還有 {Object.keys(playlist.courses).length - 2} 個影片</div>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => playPlaylist(playlist)}
                              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                            >
                              開始播放
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 自選課 */}
            <div className="bg-purple-100 rounded-xl shadow">
              <button
                onClick={() => toggleSection('custom')}
                className="w-full p-6 text-left text-2xl font-semibold text-gray-700 hover:bg-purple-200 rounded-xl transition flex justify-between items-center"
              >
                <span>自選課</span>
                <span className="text-2xl">{expandedSections.custom ? '▼' : '▶'}</span>
              </button>
              
              {expandedSections.custom && (
                <div className="p-4 pt-0">
                  <div className="bg-purple-200 p-4 rounded-lg">
                    <p className="text-base text-gray-700 mb-4 text-center">選擇每個類別的影片，組成你的專屬課程</p>
                    
                    {/* 課程選擇區域 */}
                    <div className="space-y-3">
                      {mockCourses.map(course => (
                        <div key={course.id} className="bg-white rounded-lg shadow">
                          <button
                            onClick={() => toggleCourse(course.id)}
                            className="w-full p-3 text-left flex justify-between items-center hover:bg-gray-50 rounded-lg transition"
                          >
                            <span className="font-semibold text-gray-800 text-sm">{course.title}</span>
                            <div className="flex items-center gap-2">
                              {selectedCourses[course.id] && (
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">已選擇</span>
                              )}
                              <span className="text-base">{expandedCourses[course.id] ? '▼' : '▶'}</span>
                            </div>
                          </button>
                          
                          {expandedCourses[course.id] && (
                            <div className="p-3 pt-0">
                              <div className="space-y-2">
                                {course.options.map(option => (
                                  <button
                                  key={option.id}
                                  className={`p-3 rounded-lg border-2 transition-all duration-200 w-full text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 hover:shadow-lg ${
                                    selectedCourses[course.id] === option.id
                                      ? 'border-purple-500 bg-purple-100'
                                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                  }`}
                                  onClick={() => {
                                    if (option.youtubeId) {
                                      window.open(`https://www.youtube.com/watch?v=${option.youtubeId}`, '_blank');
                                    }
                                    handleCourseSelection(course.id, option.id);
                                  }}
                                >
                                    <div className="flex items-start gap-3">
                                      {option.thumbnail ? (
                                        <img
                                          src={option.thumbnail}
                                          alt={option.title}
                                          className="object-cover rounded flex-shrink-0 transition-transform duration-200 hover:scale-105"
                                          style={{ width: '160px', height: '90px' }}
                                        />
                                      ) : (
                                        <div className="bg-gray-200 rounded flex-shrink-0 flex items-center justify-center" style={{ width: '160px', height: '90px' }}>
                                          <span className="text-gray-400 text-xs">即將上線</span>
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-800 text-sm">{option.title}</h4>
                                        <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                                        <p className="text-xs text-purple-600 mt-1">{option.duration} 分鐘</p>
                                      </div>
                                    </div>
                                   </button>
                                 ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* 已選課程預覽 */}
                    {Object.keys(selectedCourses).length > 0 && (
                      <div className="mt-4 p-3 bg-white rounded-lg shadow">
                        <h3 className="font-semibold text-gray-800 mb-2 text-sm">已選課程預覽</h3>
                        <div className="space-y-1">
                          {Object.entries(selectedCourses).map(([courseId, optionId]) => {
                            const course = mockCourses.find(c => c.id === courseId);
                            const option = course?.options.find(o => o.id === optionId);
                            return option ? (
                              <div key={courseId} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700">{course.title}: {option.title}</span>
                                <span className="text-purple-600">{option.duration} 分鐘</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800 text-sm">總時長: {getSelectedCoursesDuration()} 分鐘</span>
                          </div>
                          
                          {/* 儲存對話框區域內顯示 */}
                          {showSaveDialog ? (
                            <div className="mt-4 p-4 rounded-lg border-2 border-yellow-600" style={{backgroundColor: '#fef3c7'}}>
                              <h4 className="text-lg font-bold mb-4 text-center" style={{ color: '#999700' }}>
                                建立專屬播放列表
                              </h4>
                              
                              {/* 播放列表名稱 */}
                              <div className="mb-3">
                                <label className="block text-sm font-medium mb-2" style={{ color: '#999700' }}>播放列表名稱 *</label>
                                <input
                                  type="text"
                                  value={playlistName}
                                  onChange={(e) => setPlaylistName(e.target.value)}
                                  placeholder="為你的專屬課程命名"
                                  className="w-full border border-gray-400 rounded focus:outline-none focus:border-gray-600 px-3 py-2 text-sm"
                                  autoFocus
                                />
                              </div>
                              
                              {/* 播放列表描述 */}
                              <div className="mb-3">
                                <label className="block text-sm font-medium mb-2" style={{ color: '#999700' }}>播放列表描述（選填）</label>
                                <textarea
                                  value={playlistDescription}
                                  onChange={(e) => setPlaylistDescription(e.target.value)}
                                  placeholder="描述這個專屬課程的特色或目標"
                                  rows={2}
                                  className="w-full border border-gray-400 rounded focus:outline-none focus:border-gray-600 resize-none px-3 py-2 text-sm"
                                />
                              </div>
                              
                              {/* 課程資訊摘要 */}
                              <div className="mb-4 text-center text-sm" style={{color: '#999700'}}>
                                <div className="mb-1">
                                  <span>已選擇 {Object.keys(selectedCourses).length} 個影片</span>
                                </div>
                                <div className="font-medium">
                                  <span>總時長：{getSelectedCoursesDuration()} 分鐘</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setShowSaveDialog(false);
                                    setPlaylistName('');
                                    setPlaylistDescription('');
                                  }}
                                  className="flex-1 bg-gray-200 text-gray-800 border border-gray-400 rounded hover:bg-gray-300 transition duration-200 font-medium px-3 py-2 text-sm"
                                >
                                  取消
                                </button>
                                <button
                                  onClick={savePlaylist}
                                  disabled={!playlistName.trim()}
                                  className="flex-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition duration-200 font-bold shadow-none disabled:bg-gray-300 disabled:cursor-not-allowed px-3 py-2 text-sm"
                                >
                                  保存並開始
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowSaveDialog(true)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                              >
                                儲存至播放列表
                              </button>
                              <button
                                disabled={!isPlaylistComplete()}
                                onClick={() => {
                                   if (isPlaylistComplete()) {
                                     const selectedVideoIds = Object.values(selectedCourses);
                                     console.log('Mobile - Selected courses:', selectedCourses);
                                     console.log('Mobile - Selected video IDs:', selectedVideoIds);
                                     const playlistUrl = `/course-player/${selectedVideoIds.join(',')}`;
                                     console.log('Mobile - Playlist URL:', playlistUrl);
                                     navigate(playlistUrl);
                                   }
                                 }}
                                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm"
                              >
                                {isPlaylistComplete() ? '開始練習' : `還需選擇 ${mockCourses.length - Object.keys(selectedCourses).length} 個類別`}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 保存播放列表對話框已移至「自選課」區域內顯示 */}
    </div>
  );
}
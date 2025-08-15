import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';

// 課程數據（重構為平台無關格式）
const mockCourses = [
  { id: "1", title: "1. 調頻", options: [
      { id: "1-1", title: "調頻影片 1", duration: 10, description: "10 分鐘調頻練習", video: { url: "https://www.youtube.com/watch?v=tvkcOmfXQuE", platform: "youtube" } }
  ] },
  { id: "2", title: "2. 熱身（呼吸/動作）", options: [
      { id: "2-1", title: "熱身影片 1", duration: 15, description: "15 分鐘熱身", video: { url: "https://www.youtube.com/watch?v=e_esmWeX2Oc", platform: "youtube" } },
      { id: "2-2", title: "熱身影片 2", duration: 20, description: "20 分鐘熱身", video: { url: "https://www.youtube.com/watch?v=HTV4E4ornUA", platform: "youtube" } }
  ] },
  { id: "3", title: "3. 體式動作序列/身體奎亞", options: [
      { id: "3-1", title: "體式動作影片 1", duration: 25, description: "25 分鐘體式動作", video: { url: "https://www.youtube.com/watch?v=BvcoNwATUW4", platform: "youtube" } },
      { id: "3-2", title: "體式動作影片 2", duration: 30, description: "30 分鐘體式動作", video: { url: "https://www.youtube.com/watch?v=ASHd6cEdKRs", platform: "youtube" } }
  ] },
  { id: "4", title: "4. 放鬆休息", options: [
      { id: "4-1", title: "放鬆影片 1", duration: 15, description: "15 分鐘放鬆練習", video: { url: "https://www.youtube.com/watch?v=Gg5F3Py8un4", platform: "youtube" } },
      { id: "4-2", title: "放鬆影片 2", duration: 20, description: "20 分鐘放鬆練習", video: { url: "https://www.youtube.com/watch?v=JwIwBnYsVNk", platform: "youtube" } }
  ] },
  { id: "5", title: "5. 冥想（呼吸/唱誦）", options: [
      { id: "5-1", title: "冥想影片 1", duration: 20, description: "20 分鐘冥想", video: { url: "https://www.youtube.com/watch?v=VDdVzux-7HY", platform: "youtube" } },
      { id: "5-2", title: "冥想影片 2", duration: 25, description: "25 分鐘冥想", video: { url: "https://www.youtube.com/watch?v=HTV4E4ornUA", platform: "youtube" } },
      { id: "5-3", title: "冥想影片 3", duration: 30, description: "30 分鐘冥想", video: { url: "https://www.youtube.com/watch?v=KYwWSdNb3UA", platform: "youtube" } },
      { id: "5-4", title: "冥想影片 4", duration: 35, description: "35 分鐘冥想", video: { url: "https://www.youtube.com/watch?v=yEYFwtmMVLg", platform: "youtube" } },
      { id: "5-5", title: "冥想影片 5", duration: 40, description: "40 分鐘冥想", video: { url: "https://www.youtube.com/watch?v=KsOP80J80T8", platform: "youtube" } },
      { id: "5-6", title: "冥想影片 6", duration: 45, description: "45 分鐘冥想", video: { url: "https://www.youtube.com/watch?v=1Z4VQv71l-I", platform: "youtube" } },
      { id: "5-7", title: "冥想影片 7", duration: 50, description: "50 分鐘冥想", video: { url: "https://www.youtube.com/watch?v=V3skjng5qP0", platform: "youtube" } },
      { id: "5-8", title: "冥想影片 8", duration: 55, description: "55 分鐘冥想", video: { url: "https://www.youtube.com/watch?v=QnwrIXNddqk", platform: "youtube" } },
      { id: "5-9", title: "冥想影片 9", duration: 60, description: "60 分鐘冥想", video: { url: "https://www.youtube.com/watch?v=aCyKYSj3aU0", platform: "youtube" } },
      { id: "5-10", title: "冥想影片 10", duration: 65, description: "65 分鐘冥想", video: { url: "https://www.youtube.com/watch?v=sip_w8Oxr6o", platform: "youtube" } }
  ] },
  { id: "6", title: "6. 結束祈禱", options: [
      { id: "6-1", title: "結束祈禱影片 1", duration: 10, description: "10 分鐘結束祈禱", video: { url: "https://www.youtube.com/watch?v=sQ6KQU2wQ_k", platform: "youtube" } }
  ] }
];

export default function CoursePlayer() {
  console.log('CoursePlayer component is rendering...');
  
  const { id, videoIds } = useParams();
  
  // 調試 URL 參數
  console.log('CoursePlayer - URL params:', { id, videoIds });
  console.log('CoursePlayer - window.location.pathname:', window.location.pathname);
  console.log('CoursePlayer - useParams result:', useParams());
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('private');
  const [noteType, setNoteType] = useState('experience');
  const [completedVideos, setCompletedVideos] = useState([]);
  const [videoEndedFlag, setVideoEndedFlag] = useState(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [invalidVideos, setInvalidVideos] = useState([]);
  const [showInvalidWarning, setShowInvalidWarning] = useState(false);

  // 根據傳入的ID獲取播放列表
  useEffect(() => {
    const paramValue = videoIds || id; // 優先使用新的 videoIds 參數
    if (paramValue) {
      console.log('CoursePlayer - Received parameter:', paramValue);
      const videoIdArray = paramValue.split(',');
      console.log('CoursePlayer - Video IDs array:', videoIdArray);
      const playlistData = [];
      const invalidVideos = [];
      
      videoIdArray.forEach(videoId => {
        console.log('CoursePlayer - Looking for video ID:', videoId);
        // 查找對應的影片數據
        for (const course of mockCourses) {
          const option = course.options.find(opt => opt.id === videoId);
          if (option) {
            console.log('CoursePlayer - Found video:', option.title, 'Video URL:', option.video?.url);
            
            // 檢查影片URL是否有效
            if (option.video?.url && option.video.url.trim() !== '') {
              playlistData.push({
                ...option,
                categoryTitle: course.title
              });
            } else {
              console.warn('CoursePlayer - Invalid video URL for:', option.title);
              invalidVideos.push({
                id: option.id,
                title: option.title,
                reason: 'Empty or missing video URL'
              });
            }
            break;
          }
        }
      });
      
      console.log('CoursePlayer - Final playlist:', playlistData);
      console.log('CoursePlayer - Invalid videos:', invalidVideos);
      
      // 如果有無效影片，顯示警告
      if (invalidVideos.length > 0) {
        console.warn(`發現 ${invalidVideos.length} 個無效影片:`, invalidVideos.map(v => v.title).join(', '));
        setInvalidVideos(invalidVideos);
        setShowInvalidWarning(true);
      }
      
      setPlaylist(playlistData);
      setIsLoading(false);
    }
  }, [id, videoIds]);

  // 重置影片結束標記當切換影片時，並設置自動播放定時器
  useEffect(() => {
    setVideoEndedFlag(false);
    
    // 清除之前的定時器
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer);
    }
    
    // 設置新的自動播放定時器（影片時長 + 5秒緩衝）
    if (playlist[currentVideoIndex] && playlist[currentVideoIndex].video?.url) {
      const videoDurationMs = playlist[currentVideoIndex].duration * 60 * 1000; // 轉換為毫秒
      const timer = setTimeout(() => {
        console.log('Auto-play timer triggered');
        handleVideoEnd();
      }, videoDurationMs + 5000); // 影片時長 + 5秒緩衝
      
      setAutoPlayTimer(timer);
    }
    
    // 清理函數
    return () => {
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
      }
    };
  }, [currentVideoIndex, playlist]);
  
  // 組件卸載時清理定時器
  useEffect(() => {
    return () => {
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
      }
    };
  }, []);

  // 播放下一個影片
  const playNext = () => {
    if (currentVideoIndex < playlist.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  // 播放上一個影片
  const playPrevious = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  // 跳轉到指定影片
  const jumpToVideo = (index) => {
    setCurrentVideoIndex(index);
  };

  // 處理影片播放結束
  const handleVideoEnd = () => {
    if (videoEndedFlag) return; // 避免重複觸發
    setVideoEndedFlag(true);
    
    // 清除自動播放定時器
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer);
      setAutoPlayTimer(null);
    }
    
    const currentVideo = playlist[currentVideoIndex];
    if (currentVideo && !completedVideos.includes(currentVideo.id)) {
      // 記錄影片完成
      setCompletedVideos(prev => [...prev, currentVideo.id]);
      
      // 保存練習記錄到本地存儲
      const today = new Date().toISOString().split('T')[0];
      const practiceRecord = {
        id: currentVideo.id,
        title: currentVideo.title,
        duration: currentVideo.duration,
        completedAt: new Date().toISOString(),
        category: currentVideo.categoryTitle
      };
      
      // 獲取現有記錄
      const existingRecords = JSON.parse(localStorage.getItem('practiceRecords') || '{}');
      if (!existingRecords[today]) {
        existingRecords[today] = { courses: [], notes: [] };
      }
      existingRecords[today].courses.push(practiceRecord);
      localStorage.setItem('practiceRecords', JSON.stringify(existingRecords));
    }
    
    // 如果還有下一個影片，自動播放
    if (currentVideoIndex < playlist.length - 1) {
      console.log('Auto-playing next video...');
      setTimeout(() => {
        setCurrentVideoIndex(currentVideoIndex + 1);
      }, 2000); // 2秒後自動播放下一個影片
    } else {
      // 播放列表結束
      console.log('Playlist completed!');
      alert('恭喜！您已完成整個播放列表的練習。');
    }
  };

  // 保存心得記錄
  const saveNote = () => {
    if (!noteContent.trim()) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newNote = {
      id: `note_${Date.now()}`,
      content: noteContent,
      visibility: noteVisibility,
      type: noteType,
      createdAt: new Date().toISOString(),
      videoId: playlist[currentVideoIndex]?.id,
      videoTitle: playlist[currentVideoIndex]?.title
    };
    
    // 保存到本地存儲
    const existingRecords = JSON.parse(localStorage.getItem('practiceRecords') || '{}');
    if (!existingRecords[today]) {
      existingRecords[today] = { courses: [], notes: [] };
    }
    existingRecords[today].notes.push(newNote);
    localStorage.setItem('practiceRecords', JSON.stringify(existingRecords));
    
    setNoteContent('');
    setShowNoteModal(false);
    
    // 自動播放下一個影片
    if (currentVideoIndex < playlist.length - 1) {
      setTimeout(() => {
        playNext();
      }, 1000);
    }
  };

  // 跳過心得記錄
  const skipNote = () => {
    setShowNoteModal(false);
    setNoteContent('');
    
    // 自動播放下一個影片
    if (currentVideoIndex < playlist.length - 1) {
      setTimeout(() => {
        playNext();
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">載入播放列表中...</p>
        </div>
      </div>
    );
  }

  if (playlist.length === 0) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ 播放列表無法載入</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <p className="text-gray-600 mb-4">可能的原因：</p>
            <ul className="text-left text-gray-600 space-y-2 mb-4">
              <li>• 選擇的影片沒有有效的YouTube連結</li>
              <li>• 影片ID格式不正確</li>
              <li>• 所有選擇的影片都暫時無法播放</li>
            </ul>
            <p className="text-sm text-gray-500">請返回課程列表重新選擇有效的影片。</p>
          </div>
          <Link to="/course-list" className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition">
            返回課程列表
          </Link>
        </div>
      </div>
    );
  }

  const currentVideo = playlist[currentVideoIndex];
  const totalDuration = playlist.reduce((sum, video) => sum + video.duration, 0);
  
  // 調試信息
  console.log('=== CoursePlayer Debug Info ===');
  console.log('CoursePlayer - Current video index:', currentVideoIndex);
  console.log('CoursePlayer - Current video:', currentVideo);
  console.log('CoursePlayer - Video URL:', currentVideo?.video?.url);
  console.log('CoursePlayer - Playlist length:', playlist.length);
  console.log('CoursePlayer - Full playlist:', playlist);
  console.log('================================');

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* 標題欄 */}
      <div className="w-full py-4 px-6 bg-yellow-600 text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">自選課程播放</h1>
          <Link to="/course-list" className="bg-yellow-700 px-4 py-2 rounded hover:bg-yellow-800 transition">
            返回課程列表
          </Link>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* 無效影片警告 */}
        {showInvalidWarning && invalidVideos.length > 0 && (
          <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">注意：部分影片無法播放</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>以下影片因缺少有效的YouTube連結而被跳過：</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {invalidVideos.map((video) => (
                      <li key={video.id}>{video.title}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowInvalidWarning(false)}
                    className="text-xs text-yellow-800 font-medium hover:text-yellow-600"
                  >
                    關閉提示
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 影片播放區域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* 當前影片資訊 */}
              <div className="p-4 bg-yellow-100">
                <h2 className="text-lg font-semibold text-gray-800">
                  {currentVideo.categoryTitle}
                </h2>
                <h3 className="text-xl font-bold text-gray-900 mt-1">
                  {currentVideo.title}
                </h3>
                <p className="text-gray-600 mt-2">{currentVideo.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">
                    影片 {currentVideoIndex + 1} / {playlist.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    時長: {currentVideo.duration} 分鐘
                  </span>
                </div>
              </div>
              
              {/* 播放按鈕 */}
              {!userInteracted && (
                <div className="p-4 text-center bg-gray-100">
                  <button
                     onClick={() => {
                       console.log('=== 播放按鈕點擊調試信息 ===');
                       console.log('當前視頻URL:', currentVideo.video.url);
                       console.log('用戶互動狀態:', userInteracted);
                       console.log('播放狀態:', isPlaying);
                       console.log('視頻ID:', currentVideo.id);
                       console.log('完整視頻對象:', currentVideo);
                       
                       setUserInteracted(true);
                       setIsPlaying(true);
                       
                       // 延遲檢查狀態
                       setTimeout(() => {
                         console.log('=== 1秒後狀態檢查 ===');
                         console.log('用戶互動狀態:', true);
                         console.log('播放狀態:', true);
                       }, 1000);
                     }}
                     className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
                   >
                     🎬 開始播放視頻
                   </button>
                  <p className="text-sm text-gray-600 mt-2">點擊按鈕開始播放課程視頻</p>
                </div>
              )}
              
              {/* ReactPlayer 播放器 */}
              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                {currentVideo.video?.url ? (
                  <ReactPlayer
                    className="absolute top-0 left-0"
                    url={currentVideo.video.url}
                    width="100%"
                    height="100%"
                    playing={isPlaying && userInteracted}
                    controls={true}
                    onEnded={handleVideoEnd}
                    onError={(error) => {
                        console.error('=== ReactPlayer 錯誤詳情 ===');
                        console.error('錯誤對象:', error);
                        console.error('當前URL:', currentVideo.video.url);
                        console.error('用戶互動狀態:', userInteracted);
                        console.error('播放狀態:', isPlaying);
                        
                        // 嘗試不同的URL格式
                        const videoId = currentVideo.video.url.split('v=')[1]?.split('&')[0];
                        if (videoId) {
                          console.log('提取的視頻ID:', videoId);
                          console.log('建議的替代URL格式:');
                          console.log('- 標準格式:', `https://www.youtube.com/watch?v=${videoId}`);
                          console.log('- 嵌入格式:', `https://www.youtube.com/embed/${videoId}`);
                          console.log('- 短鏈格式:', `https://youtu.be/${videoId}`);
                        }
                      }}
                    onPlay={() => {
                        console.log('=== ReactPlayer 開始播放 ===');
                        console.log('播放URL:', currentVideo.video.url);
                        console.log('用戶互動狀態:', userInteracted);
                        console.log('播放狀態:', isPlaying);
                        setUserInteracted(true);
                        setIsPlaying(true);
                      }}


                    key={currentVideo.id} // 強制重新載入播放器
                    config={{
                      youtube: {
                        playerVars: {
                          autoplay: userInteracted ? 1 : 0,
                          rel: 0
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl text-gray-400 mb-4">🎥</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">影片即將上線</h3>
                      <p className="text-gray-500">此影片內容正在準備中，敬請期待</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 播放控制 */}
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setUserInteracted(true);
                      setIsPlaying(true);
                      playPrevious();
                    }}
                    disabled={currentVideoIndex === 0}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← 上一個
                  </button>
                  
                  <span className="text-gray-600">
                    {currentVideoIndex + 1} / {playlist.length}
                  </span>
                  
                  <button
                    onClick={() => {
                      setUserInteracted(true);
                      setIsPlaying(true);
                      playNext();
                    }}
                    disabled={currentVideoIndex === playlist.length - 1}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一個 →
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 播放列表側邊欄 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-4 bg-yellow-100 border-b">
                <h3 className="text-lg font-semibold text-gray-800">播放列表</h3>
                <p className="text-sm text-gray-600 mt-1">
                  總時長: {totalDuration} 分鐘
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {playlist.map((video, index) => (
                  <div
                    key={video.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${
                      index === currentVideoIndex ? 'bg-yellow-50 border-l-4 border-l-yellow-500' : ''
                    }`}
                    onClick={() => {
                      setUserInteracted(true);
                      setIsPlaying(true);
                      jumpToVideo(index);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        index === currentVideoIndex ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">
                          {video.categoryTitle}
                        </p>
                        <p className={`text-sm font-medium truncate ${
                          index === currentVideoIndex ? 'text-yellow-700' : 'text-gray-800'
                        }`}>
                          {video.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {video.duration} 分鐘
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 心得記錄模態框 */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                練習心得記錄
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                剛完成了「{currentVideo.title}」，想要記錄一下練習心得嗎？
              </p>
              
              {/* 記錄類型選擇 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  記錄類型
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="noteType"
                      value="experience"
                      checked={noteType === 'experience'}
                      onChange={(e) => setNoteType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">練習心得</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="noteType"
                      value="question"
                      checked={noteType === 'question'}
                      onChange={(e) => setNoteType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">問題記錄</span>
                  </label>
                </div>
              </div>

              {/* 可見性選擇 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  可見性設置
                </label>
                <select
                  value={noteVisibility}
                  onChange={(e) => setNoteVisibility(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="private">僅自己可見</option>
                  <option value="public">公開分享</option>
                  <option value="question">公開提問</option>
                </select>
              </div>

              {/* 心得內容輸入 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {noteType === 'experience' ? '練習心得' : '問題描述'}
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder={noteType === 'experience' ? '分享你的練習感受...' : '描述你遇到的問題...'}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* 按鈕區域 */}
              <div className="flex gap-3">
                <button
                  onClick={skipNote}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                >
                  跳過
                </button>
                <button
                  onClick={saveNote}
                  disabled={!noteContent.trim()}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  保存記錄
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
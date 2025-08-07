import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// 課程數據（與CourseList.jsx保持一致）
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

export default function CoursePlayer() {
  const { id } = useParams();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('private');
  const [noteType, setNoteType] = useState('experience');
  const [completedVideos, setCompletedVideos] = useState([]);

  // 根據傳入的ID獲取播放列表
  useEffect(() => {
    if (id) {
      const videoIds = id.split(',');
      const playlistData = [];
      
      videoIds.forEach(videoId => {
        // 查找對應的影片數據
        for (const course of mockCourses) {
          const option = course.options.find(opt => opt.id === videoId);
          if (option) {
            playlistData.push({
              ...option,
              categoryTitle: course.title
            });
            break;
          }
        }
      });
      
      setPlaylist(playlistData);
      setIsLoading(false);
    }
  }, [id]);

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
      
      // 顯示心得記錄彈窗
      setShowNoteModal(true);
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">找不到影片</h2>
          <p className="text-gray-600 mb-6">無法載入指定的播放列表，請檢查選擇的影片是否有效。</p>
          <Link to="/course-list" className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition">
            返回課程列表
          </Link>
        </div>
      </div>
    );
  }

  const currentVideo = playlist[currentVideoIndex];
  const totalDuration = playlist.reduce((sum, video) => sum + video.duration, 0);

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
              
              {/* YouTube 播放器 */}
              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                {currentVideo.youtubeId ? (
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&rel=0&enablejsapi=1`}
                    title={currentVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                      // 監聽 YouTube 播放器事件
                      window.addEventListener('message', (event) => {
                        if (event.origin !== 'https://www.youtube.com') return;
                        if (event.data && typeof event.data === 'string') {
                          try {
                            const data = JSON.parse(event.data);
                            if (data.event === 'video-progress' && data.info && data.info.currentTime) {
                              // 檢查是否接近影片結束（最後 3 秒）
                              const duration = data.info.duration;
                              const currentTime = data.info.currentTime;
                              if (duration && currentTime && (duration - currentTime) <= 3) {
                                handleVideoEnd();
                              }
                            }
                          } catch (e) {
                            // 忽略解析錯誤
                          }
                        }
                      });
                    }}
                  ></iframe>
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
                    onClick={playPrevious}
                    disabled={currentVideoIndex === 0}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← 上一個
                  </button>
                  
                  <span className="text-gray-600">
                    {currentVideoIndex + 1} / {playlist.length}
                  </span>
                  
                  <button
                    onClick={playNext}
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
                    onClick={() => jumpToVideo(index)}
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
import React, { useState } from 'react';
import VimeoPlayer from '../components/VimeoPlayer';

const VimeoTest = () => {
  const [currentVideoId, setCurrentVideoId] = useState('1110248772'); // 測試影片 ID - 與其他頁面統一
  const [logs, setLogs] = useState([]);
  const [playerError, setPlayerError] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const handlePlayerReady = (player) => {
    addLog('播放器準備就緒', 'success');
    console.log('Vimeo Player Ready:', player);
  };

  const handlePlayerError = (error) => {
    addLog(`播放器錯誤: ${error.message || error}`, 'error');
    setPlayerError(error);
    console.error('Vimeo Player Error:', error);
  };

  const handlePlay = () => {
    addLog('開始播放', 'info');
  };

  const handlePause = () => {
    addLog('暫停播放', 'info');
  };

  const handleVideoEnded = () => {
    addLog('影片播放結束 - 觸發自動播放', 'success');
    // 模擬自動播放下一個影片
    const currentIndex = testVideoIds.findIndex(video => video.id === currentVideoId);
    const nextIndex = (currentIndex + 1) % testVideoIds.length;
    const nextVideo = testVideoIds[nextIndex];
    
    addLog(`自動切換到下一個影片: ${nextVideo.name}`, 'info');
    setCurrentVideoId(nextVideo.id);
  };

  const testAutoPlay = () => {
    addLog('手動觸發自動播放測試', 'info');
    handleVideoEnded();
  };

  const testVideoIds = [
    { id: '1110248772', name: '調頻影片 - 黃金鏈接與保護咒' },
    { id: '1110249619', name: '拜日式熱身3遍' },
    { id: '1110249646', name: '太陽奎亞 - 太陽能量啟動' },
    { id: '1110249732', name: '放鬆影片 - 全身放鬆引導' },
    { id: '1110249794', name: '克爾坦奎亞SaTaNaMa唱誦' }
  ];

  const clearLogs = () => {
    setLogs([]);
    setPlayerError(null);
  };

  const checkEnvironment = () => {
    const envInfo = {
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE,
      vimeoClientId: import.meta.env.VITE_VIMEO_CLIENT_ID,
      currentDomain: window.location.hostname,
      currentOrigin: window.location.origin,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };
    
    addLog(`環境檢查: ${JSON.stringify(envInfo, null, 2)}`, 'info');
    console.log('Environment Check:', envInfo);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Vimeo Player 測試頁面</h1>
        
        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">控制面板</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {testVideoIds.map((video) => (
              <button
                key={video.id}
                onClick={() => {
                  setCurrentVideoId(video.id);
                  addLog(`切換到 ${video.name} (ID: ${video.id})`, 'info');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentVideoId === video.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {video.name}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={checkEnvironment}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
              檢查環境
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              清除日誌
            </button>
            <button
              onClick={testAutoPlay}
              className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              🧪 測試自動播放功能
            </button>
          </div>
        </div>

        {/* 播放器區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 影片播放器 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">影片播放器</h2>
            <div className="unified-video-container">
              <VimeoPlayer
                key={currentVideoId} // 強制重新渲染
                videoId={currentVideoId}
                width={400}
                height={225}
                responsive={false}
                controls={true}
                onReady={handlePlayerReady}
                onError={handlePlayerError}
                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={handleVideoEnded}
                className="w-full h-full"
              />
            </div>
            
            {playerError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-sm font-medium text-red-800 mb-2">播放器錯誤詳情:</h3>
                <pre className="text-xs text-red-700 whitespace-pre-wrap">
                  {JSON.stringify(playerError, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* 日誌區域 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">系統日誌</h2>
            <div className="h-96 overflow-y-auto bg-gray-50 rounded-md p-4">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">暫無日誌記錄</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded ${
                        log.type === 'error'
                          ? 'bg-red-100 text-red-800'
                          : log.type === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <span className="font-mono text-gray-500">[{log.timestamp}]</span>
                      <span className="ml-2">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 環境信息 */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">當前環境信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>開發模式:</strong> {import.meta.env.DEV ? '是' : '否'}
            </div>
            <div>
              <strong>環境:</strong> {import.meta.env.MODE}
            </div>
            <div>
              <strong>域名:</strong> {window.location.hostname}
            </div>
            <div>
              <strong>來源:</strong> {window.location.origin}
            </div>
            <div>
              <strong>Vimeo Client ID:</strong> {import.meta.env.VITE_VIMEO_CLIENT_ID ? '已設定' : '未設定'}
            </div>
            <div>
              <strong>當前影片 ID:</strong> {currentVideoId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VimeoTest;
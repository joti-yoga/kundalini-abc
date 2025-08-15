import React, { useState } from 'react';
import ReactPlayer from 'react-player';

const testUrls = [
  'https://www.youtube.com/watch?v=tvkcOmfXQuE',
  'https://www.youtube.com/watch?v=e_esmWeX2Oc',
  'https://www.youtube.com/watch?v=HTV4E4ornUA',
  'https://www.youtube.com/watch?v=BvcoNwATUW4',
  'https://www.youtube.com/watch?v=ASHd6cEdKRs',
  'https://www.youtube.com/watch?v=Gg5F3Py8un4'
];

export default function SimplePlayerTest() {
  const [currentUrl, setCurrentUrl] = useState(testUrls[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">簡化播放器測試</h1>
      
      {/* URL 選擇器 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">選擇測試 URL:</h2>
        <div className="space-y-2">
          {testUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentUrl(url);
                setError(null);
                setPlayerReady(false);
                setIsPlaying(false);
              }}
              className={`block w-full text-left p-2 rounded ${
                currentUrl === url 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {url}
            </button>
          ))}
        </div>
      </div>

      {/* 狀態顯示 */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">播放器狀態:</h3>
        <div className="space-y-1 text-sm">
          <div>當前 URL: {currentUrl}</div>
          <div>播放狀態: {isPlaying ? '播放中' : '暫停'}</div>
          <div>播放器就緒: {playerReady ? '是' : '否'}</div>
          <div>錯誤狀態: {error ? error.toString() : '無'}</div>
        </div>
      </div>

      {/* 播放器 */}
      <div className="mb-6">
        <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
          <ReactPlayer
            className="absolute top-0 left-0"
            url={currentUrl}
            width="100%"
            height="100%"
            playing={isPlaying}
            controls={true}
            onReady={() => {
              console.log('播放器就緒:', currentUrl);
              setPlayerReady(true);
              setError(null);
            }}
            onPlay={() => {
              console.log('開始播放:', currentUrl);
              setIsPlaying(true);
            }}
            onPause={() => {
              console.log('暫停播放:', currentUrl);
              setIsPlaying(false);
            }}
            onError={(error) => {
              console.error('播放錯誤:', error, '當前URL:', currentUrl);
              setError(error);
            }}
            onBuffer={() => {
              console.log('緩衝中:', currentUrl);
            }}
            onBufferEnd={() => {
              console.log('緩衝結束:', currentUrl);
            }}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 0,
                  rel: 0,
                  modestbranding: 1
                }
              }
            }}
          />
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? '暫停' : '播放'}
        </button>
        
        <button
          onClick={() => {
            setError(null);
            setPlayerReady(false);
            setIsPlaying(false);
            // 強制重新載入
            const temp = currentUrl;
            setCurrentUrl('');
            setTimeout(() => setCurrentUrl(temp), 100);
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          重新載入
        </button>
      </div>

      {/* 錯誤詳情 */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold text-red-800 mb-2">錯誤詳情:</h3>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';

const VimeoPlayer = ({
  videoId,
  width = 640,
  height = 360,
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  responsive = true,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  className = '',
  style = {},
  ...props
}) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    // 清理之前的播放器實例
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    try {
      // 創建新的 Vimeo Player 實例
      const player = new Player(containerRef.current, {
        id: videoId,
        width: responsive ? '100%' : width,
        height: responsive ? '100%' : height,
        autoplay: autoplay,
        muted: muted,
        loop: loop,
        controls: controls,
        responsive: responsive,
        // 使用環境變數中的 Client ID（如果有的話）
        ...(import.meta.env.VITE_VIMEO_CLIENT_ID && {
          app_id: import.meta.env.VITE_VIMEO_CLIENT_ID
        })
      });

      playerRef.current = player;

      // 設置事件監聽器
      player.ready().then(() => {
        setIsLoading(false);
        setError(null);
        if (onReady) {
          onReady(player);
        }
      }).catch((err) => {
        console.error('Vimeo Player 初始化錯誤:', err);
        setError(err.message || '影片載入失敗');
        setIsLoading(false);
        if (onError) {
          onError(err);
        }
      });

      // 播放事件
      if (onPlay) {
        player.on('play', onPlay);
      }

      // 暫停事件
      if (onPause) {
        player.on('pause', onPause);
      }

      // 結束事件
      if (onEnded) {
        player.on('ended', onEnded);
      }

      // 時間更新事件
      if (onTimeUpdate) {
        player.on('timeupdate', onTimeUpdate);
      }

      // 錯誤事件
      player.on('error', (err) => {
        console.error('Vimeo Player 播放錯誤:', err);
        setError(err.message || '播放過程中發生錯誤');
        if (onError) {
          onError(err);
        }
      });

    } catch (err) {
      console.error('創建 Vimeo Player 失敗:', err);
      setError(err.message || '無法創建播放器');
      setIsLoading(false);
      if (onError) {
        onError(err);
      }
    }

    // 清理函數
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, width, height, autoplay, muted, loop, controls, responsive]);

  // 提供播放器控制方法
  const play = () => playerRef.current?.play();
  const pause = () => playerRef.current?.pause();
  const getCurrentTime = () => playerRef.current?.getCurrentTime();
  const setCurrentTime = (time) => playerRef.current?.setCurrentTime(time);
  const getDuration = () => playerRef.current?.getDuration();
  const getVolume = () => playerRef.current?.getVolume();
  const setVolume = (volume) => playerRef.current?.setVolume(volume);

  // 將控制方法暴露給父組件
  React.useImperativeHandle(props.ref, () => ({
    play,
    pause,
    getCurrentTime,
    setCurrentTime,
    getDuration,
    getVolume,
    setVolume,
    player: playerRef.current
  }));

  if (error) {
    return (
      <div 
        className={`vimeo-player-error ${className}`}
        style={{
          width: responsive ? '100%' : width,
          height: responsive ? '100%' : height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          color: '#ef4444',
          fontSize: '14px',
          padding: '20px',
          textAlign: 'center',
          ...style
        }}
      >
        <div>
          <div style={{ marginBottom: '8px' }}>⚠️ 影片載入失敗</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`vimeo-player-container ${className}`}
      style={{
        width: responsive ? '100%' : width,
        height: responsive ? '100%' : height,
        position: 'relative',
        ...style
      }}
    >
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            zIndex: 1
          }}
        >
          <div style={{ color: '#6b7280', fontSize: '14px' }}>載入中...</div>
        </div>
      )}
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default VimeoPlayer;
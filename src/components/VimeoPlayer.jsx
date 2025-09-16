import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import Player from '@vimeo/player';

const VimeoPlayer = React.forwardRef(({
  videoId,
  width = '100%',
  height = '100%',
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  responsive = false,
  userInteracted = false, // 新增：接收父組件的用戶互動狀態
  onReady,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  className = '',
  style = {},
  ...props
}, ref) => {
  // 🔍 調試：追蹤組件生命週期
  console.log('🔍 VimeoPlayer 組件渲染 - videoId:', videoId, '時間戳:', Date.now());
  
  // 🔍 調試：追蹤組件掛載和卸載
  useEffect(() => {
    console.log('🔍 VimeoPlayer 組件掛載 - videoId:', videoId);
    return () => {
      console.log('🔍 VimeoPlayer 組件卸載 - videoId:', videoId);
    };
  }, []);
  
  // 🔍 調試：追蹤 videoId 變化
  useEffect(() => {
    console.log('🔍 VimeoPlayer videoId 變化:', videoId);
  }, [videoId]);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackHealth, setPlaybackHealth] = useState('unknown');
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [userHasInteracted, setUserHasInteracted] = useState(userInteracted); // 使用父組件傳入的狀態
  const maxRetries = 3;
  
  // 保存原始的 console.error 函數
  const originalConsoleErrorRef = useRef(console.error);
  const healthCheckInterval = React.useRef(null);
  
  // 用於記錄影片即將結束時的全螢幕狀態和防止重複觸發的變量
  // 將這些變量提升到組件級別，以便在 changeVideo 時能夠重置
  const wasFullscreenBeforeEndRef = React.useRef(false);
  const hasTriggeredEndRef = React.useRef(false);

  // 監聽父組件傳入的 userInteracted 變化
  useEffect(() => {
    setUserHasInteracted(userInteracted);
    console.log('👆 更新用戶互動狀態:', userInteracted);
  }, [userInteracted]);

  // 移除「開始播放」按鈕處理函數

  // 暴露給父組件的方法 - 支持全螢幕狀態恢復
  const changeVideo = React.useCallback(async (newVideoId) => {
    console.log('🔄 changeVideo 被調用 - 從', videoId, '切換到', newVideoId);
    if (!playerRef.current || !newVideoId) return false;
    
    try {
      // 檢查當前是否處於全螢幕模式
      const wasInFullscreen = document.fullscreenElement !== null;
      console.log('🖥️ 切換影片時的全螢幕狀態:', wasInFullscreen);
      
      // 如果當前處於全螢幕模式，為容器設置恢復標記
      if (wasInFullscreen) {
        const parentContainer = containerRef.current?.closest('.unified-video-container');
        if (parentContainer) {
          parentContainer.dataset.shouldRestoreFullscreen = 'true';
          console.log('🖥️ changeVideo: 已設置全螢幕恢復標記');
        }
      }
      
      // 重置結束事件相關的狀態變量
      wasFullscreenBeforeEndRef.current = false;
      hasTriggeredEndRef.current = false;
      setShowPlayButton(true); // 重置播放按鈕狀態
      setUserHasInteracted(false); // 重置用戶互動狀態
      console.log('🔄 重置結束事件狀態變量');
      
      // 使用 loadVideo 方法切換影片，保持播放器實例
      await playerRef.current.loadVideo(newVideoId);
      console.log('🔄 影片切換成功 - 新videoId:', newVideoId);
      
      // 調用 onReady 回調
      if (onReady) {
        onReady(playerRef.current);
      }
      
      return true;
    } catch (error) {
      console.error('🔄 影片切換失敗:', error);
      return false;
    }
  }, [videoId, onReady]);

  // 播放器健康檢查函數
  const startHealthCheck = React.useCallback((player) => {
    // 清除之前的檢查
    if (healthCheckInterval.current) {
      clearInterval(healthCheckInterval.current);
    }
    
    console.log('🏥 啟動播放器健康檢查');
    setPlaybackHealth('healthy');
    
    // 每5秒檢查一次播放器狀態
    healthCheckInterval.current = setInterval(async () => {
      if (!player || !playerRef.current) {
        console.warn('🏥 健康檢查：播放器實例不存在');
        setPlaybackHealth('error');
        return;
      }
      
      try {
        // 檢查播放器是否還能響應API調用
        const duration = await player.getDuration();
        const currentTime = await player.getCurrentTime();
        
        if (duration > 0) {
          setPlaybackHealth('healthy');
          console.log('🏥 播放器健康檢查：正常 - 時長:', duration.toFixed(2), '當前時間:', currentTime.toFixed(2));
        } else {
          console.warn('🏥 播放器健康檢查：警告 - 無法獲取影片時長');
          setPlaybackHealth('warning');
        }
      } catch (error) {
        console.error('🏥 播放器健康檢查：錯誤 -', error);
        setPlaybackHealth('error');
        
        // 如果連續檢查失敗，嘗試重新初始化
        if (retryCount < maxRetries) {
          console.log('🏥 播放器健康檢查失敗，嘗試重新初始化');
          setRetryCount(prev => prev + 1);
        }
      }
    }, 5000);
  }, [retryCount, maxRetries]);

  const initializePlayer = React.useCallback(async () => {
    if (!videoId || !containerRef.current) return;

    console.log('🔍 initializePlayer 被調用 - videoId:', videoId, '時間戳:', Date.now());
    setIsLoading(true);
    setError(null);

    // 檢查是否處於全螢幕模式
    const wasInFullscreen = document.fullscreenElement !== null;
    console.log('🖥️ 初始化播放器時的全螢幕狀態:', wasInFullscreen);
    console.log('🔍 當前播放器實例狀態:', {
      hasPlayer: !!playerRef.current,
      playerType: playerRef.current?.constructor?.name,
      containerExists: !!containerRef.current
    });

    // 清理之前的播放器實例
    if (playerRef.current) {
      console.log('🔍 開始銷毀舊播放器實例 - videoId:', videoId);
      try {
        // 如果當前處於全螢幕模式，先記錄狀態
        let shouldMaintainFullscreen = false;
        try {
          shouldMaintainFullscreen = await playerRef.current.getFullscreen();
          console.log('🖥️ 銷毀前的全螢幕狀態:', shouldMaintainFullscreen);
          console.log('🔍 全螢幕狀態檢查完成 - videoId:', videoId);
        } catch (e) {
          console.warn('⚠️ 無法獲取全螢幕狀態，可能播放器已卸載:', e.message);
          // 使用 DOM API 作為備用方案
          shouldMaintainFullscreen = document.fullscreenElement !== null;
          console.log('🖥️ 使用 DOM API 檢測全螢幕狀態:', shouldMaintainFullscreen);
        }
        
        playerRef.current.destroy();
        console.log('🖥️ 舊播放器已銷毀 - videoId:', videoId);
        console.log('🔍 播放器銷毀完成，準備創建新實例');
        
        // 如果之前處於全螢幕，設置標記以便新播放器恢復
        if (shouldMaintainFullscreen || wasInFullscreen) {
          console.log('🖥️ 標記需要恢復全螢幕模式 - videoId:', videoId);
          containerRef.current.dataset.shouldRestoreFullscreen = 'true';
        }
      } catch (e) {
        console.warn('清理播放器時發生錯誤:', e);
      }
      playerRef.current = null;
      console.log('🔍 播放器引用已清空 - videoId:', videoId);
    }

    try {
      // 添加延遲以避免快速重試
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }

      // 創建新的 Vimeo Player 實例
      console.log('🔍 開始創建新播放器實例 - videoId:', videoId);
      // 驗證 videoId 是純數字
      const numericVideoId = videoId.toString().replace(/\D/g, '');
      if (!numericVideoId) {
        throw new Error(`無效的 Vimeo 影片 ID: ${videoId}`);
      }
      console.log('🔍 videoId 驗證通過:', numericVideoId);
      
      const playerOptions = {
        id: numericVideoId,
        width: width,
        height: height,
        autoplay: autoplay && userHasInteracted, // 只有在用戶交互後才允許自動播放
        muted: muted, // 使用傳入的 muted 參數，而不是強制靜音
        loop: loop,
        controls: controls,
        responsive: responsive,
        // Vercel 生產環境優化配置
        dnt: import.meta.env.PROD, // 生產環境啟用 Do Not Track
        transparent: false,
        // 網絡和性能優化
        quality: 'auto',
        speed: true, // 允許播放速度控制
        // UI 優化 - 簡化界面提升性能
        title: false,
        byline: false,
        portrait: false,
        // 功能配置
        pip: true, // 允許畫中畫模式
        keyboard: true, // 允許鍵盤控制
        playsinline: true, // 修復全螢幕播放問題
        // Vercel 環境兼容性配置
        autopause: false, // 防止在 Vercel 環境中自動暫停
        background: false, // 確保正常播放模式
        // 網絡優化
        preload: 'metadata' // 只預載元數據，減少初始加載時間
      };
      
      console.log('VimeoPlayer - 播放器配置:', playerOptions);

      // 在開發環境中添加額外的配置
      if (import.meta.env.DEV) {
        console.log('開發環境 - Vimeo Player 配置:', {
          videoId,
          clientId: import.meta.env.VITE_VIMEO_CLIENT_ID,
          currentDomain: window.location.hostname,
          currentOrigin: window.location.origin
        });
        
        // 開發環境特殊設定（參數已在主配置中設定）
        console.log('📱 HTTPS 兼容參數已啟用，支援全螢幕播放');
      }

      // 驗證容器元素是否有效
      if (!containerRef.current || !containerRef.current.isConnected) {
        throw new Error('容器元素無效或已從 DOM 中移除');
      }
      
      console.log('🔍 容器元素驗證通過:', {
        element: containerRef.current,
        tagName: containerRef.current.tagName,
        isConnected: containerRef.current.isConnected,
        parentNode: !!containerRef.current.parentNode
      });

      const player = new Player(containerRef.current, playerOptions);

      playerRef.current = player;
      console.log('🔍 新播放器實例創建成功 - videoId:', videoId, '實例:', player);
      // 添加全局錯誤捕獲，防止 Vimeo SDK 內部錯誤
      const handleVimeoSDKError = (error) => {
        // 🔧 修復：安全的錯誤檢查，防止 undefined.includes() 錯誤
        const isUndefinedPropertiesError = error && 
          typeof error === 'string' && 
          typeof error.includes === 'function' && 
          error.includes('Cannot read properties of undefined');
          
        if (isUndefinedPropertiesError) {
          console.warn('🛡️ 捕獲到 Vimeo SDK 內部錯誤，已安全處理:', error);
          return;
        }
        originalConsoleErrorRef.current.apply(console, arguments);
      };
      
      // 臨時覆蓋 console.error 來捕獲 SDK 錯誤
      console.error = handleVimeoSDKError;

      // 設置事件監聽器
      player.ready().then(async () => {
        console.log('🎬 Vimeo Player 已準備就绪');
        console.log('🎬 播放器實例:', player);
        console.log('🎬 影片 ID:', videoId);
        
        // 獲取播放器初始音量狀態
        try {
          const initialVolume = await player.getVolume();
          console.log('🔊 播放器初始音量:', initialVolume);
          console.log('🔊 傳入的muted屬性:', muted);
        } catch (err) {
          console.warn('⚠️ 無法獲取初始音量:', err);
        }
        
        setIsLoading(false);
        setError(null);
        
        // 統一的音頻狀態設置邏輯
        try {
          console.log('🔊 設置播放器音頻狀態 - muted:', muted, 'userHasInteracted:', userHasInteracted);
          
          // 首先設置靜音狀態
          await player.setMuted(muted);
          
          if (muted) {
            // 靜音模式：確保音量為0
            await player.setVolume(0);
            console.log('🔇 播放器設置為靜音狀態，音量: 0');
          } else {
            // 非靜音模式：設置合適的音量
            await player.setVolume(0.7);
            console.log('🔊 播放器設置為非靜音狀態，音量: 0.7');
          }
          
          // 驗證設置結果
          const finalVolume = await player.getVolume();
          const finalMuted = await player.getMuted();
          console.log('🔊 最終音頻狀態 - 音量:', finalVolume, '靜音:', finalMuted);
          
          // 如果允許自動播放且用戶已交互，嘗試開始播放
          if (autoplay && userHasInteracted) {
            console.log('👆 檢測到自動播放條件滿足，準備啟動播放');
            
            try {
              await player.play();
              console.log('▶️ 自動播放成功啟動');
            } catch (playError) {
                // 🔧 修復：安全的錯誤訊息處理，防止 undefined.includes() 錯誤
                let errorMessage = '未知錯誤';
                try {
                  if (typeof playError === 'string') {
                    errorMessage = playError;
                  } else if (playError && typeof playError.message === 'string') {
                    errorMessage = playError.message;
                  } else if (playError && typeof playError.toString === 'function') {
                    errorMessage = playError.toString();
                  }
                } catch (e) {
                  console.warn('⚠️ 錯誤訊息處理失敗:', e);
                  errorMessage = '錯誤訊息處理失敗';
                }
                
                console.warn('⚠️ 自動播放失敗，需要用戶手動啟動:', errorMessage);
                
                // 🔧 修復：確保錯誤處理不會影響音頻狀態恢復
                try {
                  // 重新確認音頻狀態，確保用戶偏好得到尊重
                  console.log('🔊 錯誤處理中：重新確認音頻狀態 - muted:', muted);
                  await player.setMuted(muted);
                  
                  if (muted) {
                    await player.setVolume(0);
                    console.log('🔇 錯誤處理中：確保靜音狀態');
                  } else {
                    await player.setVolume(0.7);
                    console.log('🔊 錯誤處理中：確保非靜音狀態，音量: 0.7');
                  }
                  
                  // Vercel環境特殊處理：檢查localStorage中的用戶偏好
                  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel')) {
                    const savedMuted = localStorage.getItem('coursePlayerMuted');
                    if (savedMuted) {
                      try {
                        const userPreferredMuted = JSON.parse(savedMuted);
                        console.log('🔧 Vercel環境：從localStorage恢復音頻偏好:', userPreferredMuted);
                        await player.setMuted(userPreferredMuted);
                        if (!userPreferredMuted) {
                          await player.setVolume(0.7);
                        }
                        console.log('✅ Vercel環境：音頻偏好恢復成功');
                      } catch (e) {
                        console.warn('⚠️ Vercel環境：localStorage音頻偏好解析失敗:', e);
                      }
                    }
                  }
                } catch (audioRecoveryError) {
                  console.warn('⚠️ 錯誤處理中的音頻狀態恢復失敗:', audioRecoveryError);
                }
                
                // 🔧 修復：安全的字符串檢查，防止 undefined.includes() 錯誤
                const isUserActivationError = errorMessage && 
                  typeof errorMessage === 'string' && 
                  errorMessage.toLowerCase().includes('user activation');
                  
                if (isUserActivationError) {
                    console.log('🔇 由於瀏覽器政策，需要用戶互動才能播放');
                } else {
                    console.log('🔇 自動播放失敗，暫停播放器');
                    await player.pause();
                }
            }
          } else {
            console.log('⏸️ 播放器初始化為暫停狀態');
          }
        } catch (audioError) {
          console.warn('⚠️ 音頻設置失敗:', audioError.message);
          
          // 🔧 修復：音頻設置失敗時的恢復機制
          try {
            console.log('🔧 音頻設置失敗，嘗試恢復機制');
            
            // Vercel環境特殊處理：強制從localStorage恢復用戶偏好
          if (typeof window !== 'undefined' && window.location.hostname.includes('vercel')) {
            console.log('🔧 Vercel環境：執行音頻偏好強制恢復');
            
            const savedMuted = localStorage.getItem('coursePlayerMuted');
            const savedVolume = localStorage.getItem('coursePlayerVolume');
            
            if (savedMuted !== null) {
              try {
                const userPreferredMuted = JSON.parse(savedMuted);
                console.log('🔧 Vercel環境：恢復用戶靜音偏好:', userPreferredMuted);
                
                // 使用延遲確保播放器準備就緒
                setTimeout(async () => {
                  try {
                    await player.setMuted(userPreferredMuted);
                    
                    if (userPreferredMuted) {
                      await player.setVolume(0);
                      console.log('🔇 Vercel環境：強制恢復靜音狀態');
                    } else {
                      const volume = savedVolume ? parseFloat(savedVolume) : 0.7;
                      await player.setVolume(volume);
                      console.log('🔊 Vercel環境：強制恢復非靜音狀態，音量:', volume);
                    }
                    
                    console.log('✅ Vercel環境：音頻偏好強制恢復成功');
                  } catch (e) {
                    console.warn('⚠️ Vercel環境：延遲音頻恢復失敗:', e);
                  }
                }, 100);
              } catch (e) {
                console.warn('⚠️ Vercel環境：localStorage偏好解析失敗:', e);
              }
            } else {
              // 沒有保存的偏好，使用傳入的muted參數
              console.log('🔧 Vercel環境：使用默認音頻狀態 - muted:', muted);
              setTimeout(async () => {
                try {
                  await player.setMuted(muted);
                  await player.setVolume(muted ? 0 : 0.7);
                  console.log('✅ Vercel環境：默認音頻狀態設置成功');
                } catch (e) {
                  console.warn('⚠️ Vercel環境：默認音頻狀態設置失敗:', e);
                }
              }, 100);
            }
          } else {
            // 非Vercel環境的標準恢復邏輯
            console.log('🔧 標準環境：執行音頻狀態恢復');
            setTimeout(async () => {
              try {
                await player.setMuted(muted);
                await player.setVolume(muted ? 0 : 0.7);
                console.log('✅ 標準環境：音頻狀態恢復成功');
              } catch (e) {
                console.warn('⚠️ 標準環境：音頻狀態恢復失敗:', e);
              }
            }, 100);
          }
          } catch (recoveryError) {
            console.warn('⚠️ 音頻恢復機制執行失敗:', recoveryError);
          }
        }
        
        // 調用 onReady 回調（在音量設置之後）
        // 檢查是否需要恢復全螢幕模式（檢查父容器的標記）
        const parentContainer = containerRef.current?.closest('.unified-video-container');
        const shouldRestoreFullscreen = parentContainer?.dataset.shouldRestoreFullscreen === 'true';
        console.log('🖥️ 全螢幕恢復檢查 - 影片ID:', videoId);
        console.log('🖥️ 父容器:', parentContainer);
        console.log('🖥️ shouldRestoreFullscreen標記:', shouldRestoreFullscreen);
        if (shouldRestoreFullscreen) {
          console.log('🖥️ ✅ 檢測到需要恢復全螢幕模式 - 影片ID:', videoId);
          console.log('🖥️ 父容器詳情:', parentContainer);
          
          // 清除標記
          delete parentContainer.dataset.shouldRestoreFullscreen;
          
          // 立即嘗試進入全螢幕模式（無縫切換）
          console.log('🖥️ 立即嘗試進入全螢幕模式');
          
          // 統一使用較長的延遲時間，確保所有影片都能正確處理全螢幕切換
          const delayTime = 500; // 增加延遲時間，確保 Vercel 環境穩定
          console.log('🖥️ 使用延遲時間:', delayTime, 'ms - 影片ID:', videoId);
          
          setTimeout(async () => {
            console.log('🖥️ 開始嘗試requestFullscreen - 影片ID:', videoId);
            
            if (!document.fullscreenEnabled) {
              console.warn('🖥️ 瀏覽器不支持全螢幕API - 影片ID:', videoId);
              return;
            }
            
            if (document.fullscreenElement) {
              console.log('🖥️ 已經在全螢幕模式中 - 影片ID:', videoId);
              return;
            }
            
            // 嘗試通過父容器進入全螢幕，而不是直接通過播放器
            const fullscreenTarget = parentContainer || containerRef.current;
            if (fullscreenTarget && fullscreenTarget.requestFullscreen) {
              try {
                await fullscreenTarget.requestFullscreen();
                console.log('✅ 成功進入容器全螢幕模式 - 影片ID:', videoId);
                
                // 全螢幕後確保音頻和播放狀態正確
                setTimeout(async () => {
                  try {
                    // 🔧 修復：全螢幕時強制恢復音頻，無論初始狀態
                    console.log('🔊 全螢幕模式下強制恢復音頻');
                    await player.setMuted(false);
                    const vol = await player.getVolume();
                    if (vol === 0) {
                      await player.setVolume(0.7); // 設置為70%音量
                    }
                    
                    await player.play();
                    console.log('▶️ 全螢幕模式下開始播放 - 影片ID:', videoId);
                  } catch (playError) {
                    console.warn('⚠️ 全螢幕模式下播放失敗:', playError.message);
                  }
                }, 200);
              } catch (error) {
                console.warn('⚠️ 容器全螢幕失敗 - 影片ID:', videoId, '錯誤:', error.message);
                // 如果容器全螢幕失敗，嘗試播放器全螢幕
                try {
                  await player.requestFullscreen();
                  console.log('✅ 成功進入播放器全螢幕模式 - 影片ID:', videoId);
                  if (!muted) {
                    await player.setMuted(false);
                    await player.setVolume(1);
                  }
                  await player.play();
                  console.log('▶️ 播放器全螢幕模式下開始播放 - 影片ID:', videoId);
                } catch (playerError) {
                  console.warn('⚠️ 播放器全螢幕也失敗 - 影片ID:', videoId, '錯誤:', playerError.message);
                  try {
                    await player.play();
                  } catch (playError) {
                    console.warn('普通播放失敗:', playError.message);
                  }
                }
              }
            } else {
              console.warn('⚠️ 無法找到有效的全螢幕目標元素');
              try {
                await player.play();
              } catch (playError) {
                console.warn('自動播放失敗:', playError.message);
              }
            }
          }, delayTime);
        }
        
        // 直接設置iframe樣式以確保統一外觀
        setTimeout(() => {
          const iframe = containerRef.current?.querySelector('iframe');
          if (iframe) {
            iframe.style.border = 'none';
            iframe.style.outline = 'none';
            iframe.style.boxShadow = 'none';
            iframe.style.margin = '0';
            iframe.style.padding = '0';
            iframe.style.display = 'block';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.objectFit = 'cover';
            iframe.style.objectPosition = 'center';
          }
        }, 100);
        
        // 在播放器準備就绪後註冊事件监听器
        // 全螢幕状态变化事件 - 改進狀態管理
        player.on('fullscreenchange', async (data) => {
          console.log('🖥️ === 全螢幕狀態變化調試 ===');
          console.log('全螢幕狀態:', data.fullscreen);
          
          if (data.fullscreen) {
            setTimeout(async () => {
              try {
                // 詳細狀態檢查
                const paused = await player.getPaused();
                const currentMuted = await player.getMuted();
                const currentVolume = await player.getVolume();
                const duration = await player.getDuration();
                
                console.log('🔍 進入全螢幕時的完整狀態:', {
                  paused,
                  vimeoMuted: currentMuted,
                  vimeoVolume: currentVolume,
                  propsMuted: muted,
                  duration,
                  autoplay,
                  userInteracted
                });
                
                // 記錄瀏覽器信息
                console.log('🌐 瀏覽器信息:', {
                  userAgent: navigator.userAgent,
                  autoplayPolicy: 'unknown', // 瀏覽器不直接暴露此信息
                  fullscreenElement: !!document.fullscreenElement
                });
                
                // 不做任何音量修改，只記錄
                console.log('⏸️ 暫不修改音量，僅觀察行為');
                
              } catch (error) {
                console.error('❌ 全螢幕狀態檢查失敗:', error);
              }
            }, 300);
          }
        });
        
        // 结束事件
        console.log('🔧 VimeoPlayer 初始化 - onEnded 回調是否存在:', !!onEnded);
        if (onEnded) {
          console.log('✅ 注册 Vimeo Player ended 事件监听器');
          
          // 统一的结束处理函数 - 严格验证 videoId
          const handleVideoEnd = (source = 'ended') => {
            if (hasTriggeredEndRef.current) {
              console.log('🚫 影片结束已处理，跳过重复触发 - 来源:', source);
              return;
            }
            
            hasTriggeredEndRef.current = true;
            console.log('🎯 影片结束处理 - 来源:', source);
            
            console.log('📞 调用 onEnded 回調函数');
            onEnded();
          };
          
          // 注册正常的 ended 事件（非全螢幕模式下仍会触发）
          player.on('ended', () => {
            console.log('🎯 Vimeo Player ended 事件被触发');
            handleVideoEnd('ended');
          });
          
          // 添加播放进度监听，处理 Vimeo Player 在某些情况下 ended 事件不触发的的事件
          player.on('timeupdate', async (data) => {
            const progress = (data.seconds / data.duration) * 100;
            
            // 當影片進度達到 99.9% 時，主動觸發結束事件作為備用方案
            // 這是為了解決 Vimeo Player 在某些情況下 ended 事件不觸發的已知問題
            // 調整閾值從 99.5% 到 99.9%，避免過早觸發
            if (progress >= 99.9 && !hasTriggeredEndRef.current) {
              console.log('🎬 影片即將結束，主動觸發結束事件 - 進度:', progress.toFixed(2) + '%');
              handleVideoEnd('timeupdate');
            }
          });
          
          // 監聽播放狀態變化
          player.on('play', () => {
            console.log('▶️ Vimeo Player 开始播放');
          });
          
          player.on('pause', () => {
            console.log('⏸️ Vimeo Player 暫停播放');
          });
        } else {
          console.log('❌ onEnded 回調函數未提供，跳過事件註冊');
        }
        
        // 播放事件
        if (onPlay) {
          player.on('play', onPlay);
        }

        // 暫停事件
        if (onPause) {
          player.on('pause', onPause);
        }
        
        // 時間更新事件
        if (onTimeUpdate) {
          player.on('timeupdate', onTimeUpdate);
        }

        // 錯誤事件 - 增強錯誤處理
        player.on('error', (err) => {
          console.error('Vimeo Player 播放錯誤:', err);
          console.error('錯誤詳情:', {
            name: err.name,
            message: err.message,
            method: err.method,
            videoId: videoId,
            timestamp: new Date().toISOString()
          });
          
          // 針對 PlaybackError 進行特殊處理
          if (err.name === 'PlaybackError') {
            console.log('🔄 檢測到 PlaybackError，嘗試重新初始化播放器');
            
            // 延遲重試，避免頻繁重試
            setTimeout(() => {
              if (retryCount < maxRetries) {
                console.log(`🔄 PlaybackError 重試 (${retryCount + 1}/${maxRetries})`);
                setRetryCount(prev => prev + 1);
                
                // 重新初始化整個播放器而不是僅僅重新載入影片
                // 這樣可以確保播放器處於乾淨的狀態
                console.log('🔄 重新初始化播放器以修復 PlaybackError');
              } else {
                console.error('❌ PlaybackError 重試次數已達上限');
                setError(`播放錯誤: ${err.message || '影片播放失敗，請稍後再試'}`);
              }
            }, 1000);
          } else {
            // 其他類型的錯誤
            setError(err.message || '播放過程中發生錯誤');
          }
          
          if (onError) {
            onError(err);
          }
        });
        
        // 改進自動播放邏輯，使用父組件傳入的 autoplay 狀態
        if (autoplay) {
          console.log('🚀 檢測到 autoplay=true（來自父組件），嘗試主動播放影片');
          
          // 添加延遲以確保播放器完全初始化
          setTimeout(async () => {
            try {
              // 父組件已經管理用戶交互狀態，直接嘗試播放
              console.log('🚀 父組件已確認用戶交互，開始播放');
              await player.play();
              console.log('✅ 影片自動播放成功');
              setPlaybackHealth('healthy');
              setUserHasInteracted(true); // 同步內部狀態
            } catch (error) {
              console.warn('⚠️ 自動播放失敗，可能受到瀏覽器政策限制:', error);
              console.warn('💡 用戶需要手動點擊播放按鈕');
              setPlaybackHealth('warning');
              
              // 如果自動播放失敗，確保播放器處於暫停狀態
              try {
                const paused = await player.getPaused();
                if (!paused) {
                  await player.pause();
                  console.log('🔄 自動播放失敗後設置為暫停狀態');
                }
              } catch (pauseError) {
                console.warn('⚠️ 設置暫停狀態失敗:', pauseError);
              }
            }
          }, 500);
        }
        
        // 啟動播放器健康檢查
        startHealthCheck(player);
        
        if (onReady) {
          onReady(player);
        }
      }).catch((err) => {
        console.error('Vimeo Player 初始化錯誤:', err);
        const errorMessage = err.message || '影片載入失敗';
        
        // 如果是網路錯誤或權限錯誤，嘗試重試
        if (retryCount < maxRetries && errorMessage && typeof errorMessage === 'string' && (
          errorMessage.includes('network') ||
          errorMessage.includes('403') ||
          errorMessage.includes('401') ||
          errorMessage.includes('timeout')
        )) {
          console.log(`重試載入影片 (${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          return;
        }
        
        setError(errorMessage);
        setIsLoading(false);
        if (onError) {
          onError(err);
        }
      });

      // 所有事件監聽器現在都在 player.ready() 內部註冊

    } catch (err) {
      console.error('創建 Vimeo Player 失敗:', err);
      const errorMessage = err.message || '無法創建播放器';
      
      // Vercel 環境特殊錯誤處理
      const isNetworkError = err.message?.includes('network') || 
                            err.message?.includes('fetch') ||
                            err.message?.includes('CORS') ||
                            err.name === 'NetworkError';
      
      const isPermissionError = err.message?.includes('permission') ||
                               err.message?.includes('autoplay') ||
                               err.message?.includes('policy');
      
      // 針對不同錯誤類型採用不同重試策略
      if (retryCount < maxRetries) {
        if (isNetworkError) {
          console.log(`🌐 網絡錯誤，延遲重試 (${retryCount + 1}/${maxRetries})`);
          // 網絡錯誤使用指數退避重試
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, Math.pow(2, retryCount) * 1000);
          return;
        } else if (isPermissionError) {
          console.log(`🔒 權限錯誤，重置用戶交互狀態後重試 (${retryCount + 1}/${maxRetries})`);
          setUserHasInteracted(false);
          setRetryCount(prev => prev + 1);
          return;
        } else {
          console.log(`🔄 一般錯誤重試 (${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          return;
        }
      }
      
      // 所有重試都失敗後的處理
      console.error('🚨 播放器初始化最終失敗，已達最大重試次數');
      setError(`播放器初始化失敗: ${errorMessage}`);
      setIsLoading(false);
      if (onError) {
        onError(err);
      }
    }
  }, [videoId, width, height, autoplay, loop, controls, responsive, retryCount]);

  // 每次 videoId 變化時立即重置狀態
  useEffect(() => {
    hasTriggeredEndRef.current = false;
    wasFullscreenBeforeEndRef.current = false;
    console.log('🔄 videoId 變化，重置所有狀態變量');
    
    // 嚴格驗證 videoId
    if (!videoId || typeof videoId !== 'string' || videoId.trim() === '') {
      console.log('VimeoPlayer - videoId 無效:', { videoId, type: typeof videoId });
      setError('影片 ID 無效');
      return;
    }
    
    if (!containerRef.current) {
      console.log('VimeoPlayer - 容器元素不存在');
      return;
    }
    
    console.log('VimeoPlayer - 開始初始化，videoId:', videoId);
    initializePlayer();

    // 清理函數
    return () => {
      // 恢復原始的 console.error
      if (typeof originalConsoleErrorRef.current === 'function') {
        console.error = originalConsoleErrorRef.current;
      }
      
      // 停止健康檢查
      if (healthCheckInterval.current) {
        clearInterval(healthCheckInterval.current);
        healthCheckInterval.current = null;
      }
      
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('清理播放器時發生錯誤:', e);
        }
        playerRef.current = null;
      }
    };
  }, [initializePlayer]);

    // 當 retryCount 改變時重新初始化
    useEffect(() => {
      if (retryCount > 0) {
        initializePlayer();
      }
    }, [retryCount, initializePlayer]);

    // 單獨處理 muted 屬性變化，避免重新創建播放器
    useEffect(() => {
      if (playerRef.current) {
        console.log('🔊 VimeoPlayer - muted屬性變化:', muted);
        
        // 統一的音頻狀態設置邏輯
        playerRef.current.setMuted(muted).then(async () => {
          if (muted) {
            await playerRef.current.setVolume(0);
            console.log('🔇 VimeoPlayer - 已設置靜音狀態');
          } else {
            await playerRef.current.setVolume(0.7);
            console.log('🔊 VimeoPlayer - 已取消靜音，恢復音量: 0.7');
          }
          
          // 驗證最終狀態
          const finalVolume = await playerRef.current.getVolume();
          const finalMuted = await playerRef.current.getMuted();
          console.log('🔊 VimeoPlayer - 最終音頻狀態 - 音量:', finalVolume, '靜音:', finalMuted);
        }).catch(e => {
          console.warn('⚠️ VimeoPlayer - 音頻狀態設置失敗:', e);
        });
      }
    }, [muted]);

    // HTTPS 音頻處理 - 解決線上環境音頻問題
    useEffect(() => {
      if (!playerRef.current) return;
      
      const isHTTPS = window.location.protocol === 'https:';
      console.log('🔊 VimeoPlayer - 環境檢測:', isHTTPS ? 'HTTPS' : 'HTTP');
      
      if (isHTTPS) {
        const handleFirstInteraction = async () => {
          try {
            // 檢查localStorage中的靜音設置，而不是當前的muted狀態
            const savedMuted = localStorage.getItem('coursePlayerMuted');
            const shouldBeMuted = savedMuted ? JSON.parse(savedMuted) : false;
            
            console.log('🔊 VimeoPlayer - HTTPS 用戶交互檢測:', {
              currentMuted: muted,
              savedMuted: shouldBeMuted,
              shouldEnableAudio: !shouldBeMuted
            });
            
            if (!shouldBeMuted && playerRef.current) {
              await playerRef.current.setMuted(false);
              await playerRef.current.setVolume(0.7);
              console.log('🔊 VimeoPlayer - HTTPS 環境：用戶交互後成功啟用音頻');
              
              // 通知父組件更新靜音狀態
              if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('vimeoAudioEnabled', {
                  detail: { muted: false }
                }));
              }
            } else {
              console.log('🔇 VimeoPlayer - HTTPS 環境：根據用戶設置保持靜音');
            }
          } catch (error) {
            console.warn('⚠️ VimeoPlayer - HTTPS 音頻啟用失敗:', error);
          }
        };
        
        // 添加多種交互事件監聽
        document.addEventListener('click', handleFirstInteraction, { once: true });
        document.addEventListener('touchstart', handleFirstInteraction, { once: true });
        document.addEventListener('keydown', handleFirstInteraction, { once: true });
        
        return () => {
          document.removeEventListener('click', handleFirstInteraction);
          document.removeEventListener('touchstart', handleFirstInteraction);
          document.removeEventListener('keydown', handleFirstInteraction);
        };
      }
    }, [muted]);

    // 全屏模式音頻修復
    useEffect(() => {
      const handleFullscreenChange = async () => {
        if (!playerRef.current) return;
        
        const isFullscreen = !!document.fullscreenElement;
        console.log('🖥️ VimeoPlayer - 全屏狀態變化:', isFullscreen);
        
        if (isFullscreen && !muted) {
          // 進入全屏時確保音頻正常
          try {
            await playerRef.current.setMuted(false);
            await playerRef.current.setVolume(0.7);
            console.log('🖥️ VimeoPlayer - 全屏模式：音頻已啟用');
          } catch (error) {
            console.warn('⚠️ VimeoPlayer - 全屏音頻設置失敗:', error);
          }
        }
      };
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [muted]);

    // 提供播放器控制方法
    const play = () => playerRef.current?.play();
    const pause = () => playerRef.current?.pause();
    const getCurrentTime = () => playerRef.current?.getCurrentTime();
    const setCurrentTime = (time) => playerRef.current?.setCurrentTime(time);
    const getDuration = () => playerRef.current?.getDuration();
    const getVolume = () => playerRef.current?.getVolume();
    const setVolume = (volume) => playerRef.current?.setVolume(volume);

  // 將控制方法暴露給父組件
  useImperativeHandle(ref, () => ({
      play,
      pause,
      getCurrentTime,
      setCurrentTime,
      getDuration,
      getVolume,
      setVolume,
      changeVideo,
      getPlayer: () => playerRef.current,
      player: playerRef.current
  }));

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    initializePlayer();
  };

  // 獲取健康狀態指示器
  const getHealthIndicator = () => {
    switch (playbackHealth) {
      case 'healthy': return '🟢';
      case 'warning': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

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
            <div style={{ marginBottom: '8px' }}>
              ⚠️ 播放器錯誤 {getHealthIndicator()}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
              {error}
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '8px' }}>
              健康狀態: {playbackHealth} | 重試次數: {retryCount}/{maxRetries}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>
              播放器遇到了問題。我們將盡快恢復其正常運行。
            </div>
            <button
              onClick={handleRetry}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              重新載入
            </button>
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
        {/* 健康狀態指示器 */}
        {!isLoading && !error && (
          <div 
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              zIndex: 10,
              fontSize: '12px',
              opacity: 0.7,
              transition: 'opacity 0.3s'
            }}
            title={`播放器健康狀態: ${playbackHealth}`}
          >
            {getHealthIndicator()}
          </div>
        )}
        
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
            <div style={{ color: '#6b7280', fontSize: '14px' }}>載入中... {getHealthIndicator()}</div>
          </div>
        )}
        <div 
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '200px',
            backgroundColor: 'transparent',
          }}
        />
        
        {/* 移除「開始播放」按鈕覆蓋層 */}
      </div>
    );
});

// HTTPS 音頻處理 - 解決線上環境音頻問題
VimeoPlayer.displayName = 'VimeoPlayer';

// 使用 React.memo 優化性能，避免不必要的重新渲染
export default React.memo(VimeoPlayer, (prevProps, nextProps) => {
  // 只有當關鍵 props 發生變化時才重新渲染
  return (
    prevProps.videoId === nextProps.videoId &&
    prevProps.autoplay === nextProps.autoplay &&
    prevProps.muted === nextProps.muted &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.userInteracted === nextProps.userInteracted
  );
});
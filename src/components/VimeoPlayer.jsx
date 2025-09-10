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
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const maxRetries = 3;
  
  // 保存原始的 console.error 函數
  const originalConsoleErrorRef = useRef(console.error);
  const healthCheckInterval = React.useRef(null);
  
  // 用於記錄影片即將結束時的全螢幕狀態和防止重複觸發的變量
  // 將這些變量提升到組件級別，以便在 changeVideo 時能夠重置
  const wasFullscreenBeforeEndRef = React.useRef(false);
  const hasTriggeredEndRef = React.useRef(false);

  // 處理用戶點擊開始播放按鈕
  const handleStartPlay = React.useCallback(async () => {
    if (!playerRef.current) return;
    
    try {
      console.log('🎬 用戶點擊開始播放按鈕');
      setUserHasInteracted(true);
      setShowPlayButton(false);
      
      // 確保音量設置正確（非靜音）
      if (!muted) {
        await playerRef.current.setVolume(1);
        console.log('🔊 設置音量為最大');
      }
      
      // 開始播放
      await playerRef.current.play();
      console.log('▶️ 開始播放影片');
      
      // 延遲一下再進入全屏，確保播放已開始
      setTimeout(async () => {
        try {
          // 檢查是否支持全屏
          if (!document.fullscreenEnabled) {
            console.warn('🖥️ 瀏覽器不支持全屏API');
            return;
          }
          
          // 嘗試進入全屏
          const fullscreenTarget = containerRef.current?.closest('.unified-video-container') || containerRef.current;
          if (fullscreenTarget && fullscreenTarget.requestFullscreen) {
            await fullscreenTarget.requestFullscreen();
            console.log('🖥️ 成功進入全屏模式');
          } else {
            // 如果容器全屏失敗，嘗試播放器全屏
            await playerRef.current.requestFullscreen();
            console.log('🖥️ 成功進入播放器全屏模式');
          }
        } catch (fullscreenError) {
          console.warn('⚠️ 全屏失敗，但影片會繼續播放:', fullscreenError.message);
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ 開始播放失敗:', error);
      setShowPlayButton(true); // 如果失敗，重新顯示按鈕
    }
  }, [muted]);

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
        autoplay: autoplay,
        muted: muted,
        loop: loop,
        controls: controls,
        responsive: responsive,
        // 開發環境相關設定
        dnt: false, // 允許追蹤以支持開發環境
        transparent: false,
        // 添加錯誤處理相關配置
        quality: 'auto',
        // HTTPS 兼容參數 - 解決 Vercel 部署環境全螢幕問題
        title: false,
        byline: false,
        portrait: false,
        pip: true, // 允許畫中畫模式
        keyboard: true, // 允許鍵盤控制
        // 修改 playsinline 設置
        playsinline: true // 修復全螢幕播放問題
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
        if (error && typeof error === 'string' && error.includes('Cannot read properties of undefined')) {
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
        
        // 先確保音量設置正確應用（Vimeo播放器有時會忽略初始化時的muted參數）
        if (muted) {
          console.log('🔇 VimeoPlayer - 確保靜音設置生效');
          try {
            await player.setVolume(0);
            const verifyVolume = await player.getVolume();
            console.log('🔇 靜音設置後驗證音量:', verifyVolume);
          } catch (e) {
            console.warn('⚠️ 設置靜音失敗:', e);
          }
        } else {
          // 非靜音模式下，確保音量不為0
          console.log('🔊 VimeoPlayer - 確保非靜音設置生效');
          try {
            const currentVolume = await player.getVolume();
            console.log('🔊 當前音量:', currentVolume);
            if (currentVolume === 0) {
              console.log('🔊 檢測到音量為0，設置為正常音量');
              await player.setVolume(1);
              const verifyVolume = await player.getVolume();
              console.log('🔊 音量設置後驗證:', verifyVolume);
            }
          } catch (e) {
            console.warn('⚠️ 設置音量失敗:', e);
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
          const delayTime = 300; // 統一使用300ms延遲，確保播放器完全初始化
          console.log('🖥️ 使用延遲時間:', delayTime, 'ms - 影片ID:', videoId);
          
          setTimeout(() => {
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
              fullscreenTarget.requestFullscreen().then(() => {
                console.log('✅ 成功進入容器全螢幕模式 - 影片ID:', videoId);
                // 延遲一下再開始播放，確保全螢幕切換完成
                setTimeout(() => {
                  player.play().then(() => {
                    console.log('▶️ 全螢幕模式下開始播放 - 影片ID:', videoId);
                  }).catch(playError => {
                    console.warn('⚠️ 全螢幕模式下自動播放失敗:', playError);
                  });
                }, 100);
              }).catch((error) => {
                console.warn('⚠️ 容器全螢幕失敗 - 影片ID:', videoId, '錯誤:', error.message);
                // 如果容器全螢幕失敗，嘗試播放器全螢幕
                player.requestFullscreen().then(() => {
                  console.log('✅ 成功進入播放器全螢幕模式 - 影片ID:', videoId);
                  return player.play();
                }).then(() => {
                  console.log('▶️ 播放器全螢幕模式下開始播放 - 影片ID:', videoId);
                }).catch((playerError) => {
                  console.warn('⚠️ 播放器全螢幕也失敗 - 影片ID:', videoId, '錯誤:', playerError.message);
                  player.play().catch(playError => console.warn('普通播放失敗:', playError));
                });
              });
            } else {
              console.warn('⚠️ 無法找到有效的全螢幕目標元素');
              player.play().catch(playError => console.warn('自動播放失敗:', playError));
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
        // 全螢幕状态变化事件
        // 全螢幕状态变化事件
        player.on('fullscreenchange', async (data) => {
          console.log('🖥️ 全螢幕状态变化:', data.fullscreen);
          setIsFullscreen(data.fullscreen);
          
          // 進入全螢幕時確保播放狀態和音量正確
          if (data.fullscreen) {
            try {
              // 检查当前播放状态
              const paused = await player.getPaused();
              console.log('🖥️ 全螢幕模式 - 当前播放状态:', paused ? '暂停' : '播放');
              
              // 如果影片被暂停，尝试恢复播放
              if (paused) {
                console.log('🖥️ 全螢幕模式 - 恢复播放');
                await player.play();
              }
              
              // 确保音量设置正确
              if (!muted) {
                const currentVolume = await player.getVolume();
                console.log('🖥️ 全螢幕模式 - 当前音量:', currentVolume);
                if (currentVolume === 0) {
                  console.log('🖥️ 全螢幕模式 - 恢复音量');
                  await player.setVolume(1);
                }
              }
            } catch (error) {
              console.warn('⚠️ 全螢幕状态恢复失败:', error);
            }
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
        
        // 如果設置了自動播放，嘗試主動播放
        if (autoplay) {
          console.log('🚀 檢測到 autoplay=true，嘗試主動播放影片');
          
          // 添加延遲以確保播放器完全初始化
          setTimeout(() => {
            player.play().then(() => {
              console.log('✅ 影片自動播放成功');
              setPlaybackHealth('healthy');
            }).catch((error) => {
              console.warn('⚠️ 自動播放失敗，可能受到瀏覽器政策限制:', error);
              console.warn('💡 用戶需要手動點擊播放按鈕');
              setPlaybackHealth('warning');
            });
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
      
      // 如果是網路錯誤，嘗試重試
      if (retryCount < maxRetries) {
        console.log(`重試創建播放器 (${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        return;
      }
      
      setError(errorMessage);
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
        if (muted) {
          playerRef.current.setVolume(0).then(() => {
            console.log('🔇 VimeoPlayer - 已設置靜音');
          }).catch(e => {
            console.warn('⚠️ VimeoPlayer - 設置靜音失敗:', e);
          });
        } else {
          // 當取消靜音時，需要恢復音量
          // 但我們需要從父組件獲取正確的音量值
          console.log('🔊 VimeoPlayer - 取消靜音，但音量恢復由CoursePlayer管理');
          // 這裡不直接設置音量，讓CoursePlayer的handlePlayerReady處理
        }
      }
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
            height: '100%'
          }}
        />
        
        {/* 優雅的開始播放按鈕覆蓋層 */}
        {showPlayButton && !isLoading && !error && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 20,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={handleStartPlay}
          >
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
                maxWidth: '280px',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
              }}
            >
              {/* 播放圖標 */}
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="white"
                  style={{ marginLeft: '2px' }}
                >
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              
              {/* 標題文字 */}
              <h3 
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}
              >
                開始播放
              </h3>
              
              {/* 描述文字 */}
              <p 
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.4',
                  margin: '0',
                  marginBottom: '16px'
                }}
              >
                點擊開始全屏播放體驗
                <br />
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  🔊 支援音頻播放
                </span>
              </p>
              
              {/* 提示文字 */}
              <div 
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <span>🖥️</span>
                <span>自動進入全屏模式</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
});

// 使用 React.memo 優化性能，避免不必要的重新渲染
export default React.memo(VimeoPlayer, (prevProps, nextProps) => {
  // 只有當關鍵 props 發生變化時才重新渲染
  return (
    prevProps.videoId === nextProps.videoId &&
    prevProps.autoplay === nextProps.autoplay &&
    prevProps.muted === nextProps.muted &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height
  );
});
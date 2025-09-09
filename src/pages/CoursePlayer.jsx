import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import VimeoPlayer from '../components/VimeoPlayer';
import Player from '@vimeo/player';

// 輔助函數：從 Vimeo URL 中提取影片 ID
const extractVimeoId = (url) => {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};

// 課程數據（重構為平台無關格式）
// 所有影片已轉換為Vimeo嵌入格式
const mockCourses = [
  { id: "1", title: "1. 調頻", options: [
      { id: "1-1", title: "調頻影片 1", duration: "3分15秒", description: "啟動脈輪：直達昆達里尼瑜伽中【黃金鏈接與保護咒】的力量 | 調頻與宇宙的無限連結秘笈", video: { url: "https://vimeo.com/1110248772", platform: "vimeo" } }
  ] },
  { id: "2", title: "2. 熱身（呼吸/動作）", options: [
      { id: "2-1", title: "拜日式熱身3遍", duration: "4分28秒", description: "拜日式口令12式能增強心肺功能、促進血液循環、伸展脊椎、按摩內臟、幫助消化", video: { url: "https://vimeo.com/1110249619", platform: "vimeo" } },
      { id: "2-2", title: "熱身影片 2", duration: "20分0秒", description: "20 分鐘熱身", video: { url: "https://vimeo.com/1110249891", platform: "vimeo" } }
  ] },
  { id: "3", title: "3. 體式動作序列/身體奎亞", options: [
      { id: "3-1", title: "太陽奎亞", duration: "38分0秒", description: "7個超簡單動作啟動「太陽能量」！呼吸冥想聲音全包含｜凍齡體態+超強行動力", video: { url: "https://vimeo.com/1110249646", platform: "vimeo" } },
      { id: "3-2", title: "體式動作影片 2", duration: "30分0秒", description: "30 分鐘體式動作", video: { url: "https://vimeo.com/1110249732", platform: "vimeo" } }
  ] },
  { id: "4", title: "4. 放鬆休息", options: [
      { id: "4-1", title: "放鬆影片 1", duration: "10分56秒", description: "全身放鬆引導", video: { url: "https://vimeo.com/1110249732", platform: "vimeo" } },
      { id: "4-2", title: "放鬆影片 2", duration: "20分0秒", description: "20 分鐘放鬆練習", video: { url: "https://vimeo.com/1110249794", platform: "vimeo" } }
  ] },
  { id: "5", title: "5. 冥想（呼吸/唱誦）", options: [
      { id: "5-1", title: "克爾坦奎亞SaTaNaMa唱誦", duration: "18分48秒", description: "大師說即使其他都失傳了，就做這個冥想：能帶給心靈完全平衡、保持警覺，改善、塑造感官和洞察力，讓你知所未知、見所未見、聞未聞｜【Kirtan Kriya】昆達里尼音樂", video: { url: "https://vimeo.com/1110249794", platform: "vimeo" } },
      { id: "5-2", title: "冥想影片 2", duration: "25分0秒", description: "25 分鐘冥想", video: { url: "https://vimeo.com/1110249891", platform: "vimeo" } },
      { id: "5-3", title: "冥想影片 3", duration: "30分0秒", description: "30 分鐘冥想", video: { url: "https://vimeo.com/1110249732", platform: "vimeo" } },
      { id: "5-4", title: "冥想影片 4", duration: "35分0秒", description: "35 分鐘冥想", video: { url: "https://vimeo.com/1110249646", platform: "vimeo" } },
      { id: "5-5", title: "冥想影片 5", duration: "40分0秒", description: "40 分鐘冥想", video: { url: "https://vimeo.com/1110249619", platform: "vimeo" } },
      { id: "5-6", title: "冥想影片 6", duration: "45分0秒", description: "45 分鐘冥想", video: { url: "https://vimeo.com/1110248772", platform: "vimeo" } },
      { id: "5-7", title: "冥想影片 7", duration: "50分0秒", description: "50 分鐘冥想", video: { url: "https://vimeo.com/1110249794", platform: "vimeo" } },
      { id: "5-8", title: "冥想影片 8", duration: "55分0秒", description: "55 分鐘冥想", video: { url: "https://vimeo.com/1110249891", platform: "vimeo" } },
      { id: "5-9", title: "冥想影片 9", duration: "1時0分0秒", description: "60 分鐘冥想", video: { url: "https://vimeo.com/1110249732", platform: "vimeo" } },
      { id: "5-10", title: "冥想影片 10", duration: "1時5分0秒", description: "65 分鐘冥想", video: { url: "https://vimeo.com/1110249646", platform: "vimeo" } }
  ] },
  { id: "6", title: "6. 結束祈禱", options: [
      { id: "6-1", title: "結束唱誦Long Time Sun（英文版）", duration: "2分28秒", description: "結尾儀式透過唱誦《永恆的陽光》與Yogi Bhajan連結祈禱", video: { url: "https://vimeo.com/1110249891", platform: "vimeo" } }
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
  const [userInteracted, setUserInteracted] = useState(true); // 直接啟用自動播放
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('private');
  const [noteType, setNoteType] = useState('experience');
  const [completedVideos, setCompletedVideos] = useState([]);
  
  // 音量狀態管理
  const [currentVolume, setCurrentVolume] = useState(() => {
    // 從localStorage恢復音量設置，默認70%
    const savedVolume = localStorage.getItem('vimeo-player-volume');
    return savedVolume ? parseFloat(savedVolume) : 0.7;
  });
  const [isMuted, setIsMuted] = useState(() => {
    // 從localStorage恢復靜音設置，默認不靜音
    const savedMuted = localStorage.getItem('vimeo-player-muted');
    return savedMuted === 'true';
  });
  const vimeoPlayerRef = useRef(null); // VimeoPlayer的引用

  // 全螢幕容器相關狀態
  const [isContainerFullscreen, setIsContainerFullscreen] = useState(false);
  const fullscreenContainerRef = useRef(null);
  
  // 拖拽按鈕相關狀態
  const [buttonPosition, setButtonPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // 全局拖拽事件處理
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setButtonPosition({
          x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y))
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

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
              // 先清理 URL 中的多餘參數
              const sanitizedUrl = sanitizeUrl(option.video.url);
              
              // 對 Vimeo 影片進行 URL 格式統一處理
              let normalizedUrl = sanitizedUrl;
              if (option.video.platform === 'vimeo') {
                normalizedUrl = normalizeVimeoUrl(sanitizedUrl);
                console.log('Vimeo URL 標準化:', option.video.url, '->', normalizedUrl);
              }
              
              // 檢查是否為有效的 Vimeo URL
              const canPlay = option.video.platform === 'vimeo' && extractVimeoId(normalizedUrl) !== null;
              
              playlistData.push({
                ...option,
                categoryTitle: course.title,
                video: {
                  ...option.video,
                  url: normalizedUrl // 使用標準化後的 URL
                },
                isPlayable: canPlay // 添加可播放標記
              });
              
              if (!canPlay) {
                console.warn('不支援的影片來源:', normalizedUrl);
                invalidVideos.push({
                  id: option.id,
                  title: option.title,
                  reason: 'Invalid Vimeo URL'
                });
              }
            } else {
              console.warn('不支援的影片來源:', option.video?.url);
              // 即使URL無效，也將影片加入播放列表但標記為不可播放
              playlistData.push({
                ...option,
                categoryTitle: course.title,
                video: {
                  ...option.video,
                  url: option.video?.url || '' // 保留原始URL
                },
                isPlayable: false // 標記為不可播放
              });
              
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



  // 清理 URL 中的多餘參數
  const sanitizeUrl = (url) => {
    if (!url) return '';
    // 對於 Vimeo URL，保持完整性，不要截斷
    if (url.includes('vimeo.com')) {
      return url.trim();
    }
    // 對於其他 URL，可以清理參數
    return url.split('&')[0].trim();
  };

  // 切換靜音狀態的函數
  const toggleMute = async () => {
    if (vimeoPlayerRef.current) {
      try {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        localStorage.setItem('vimeo-player-muted', newMutedState.toString());
        
        if (newMutedState) {
          // 靜音：設置音量為0
          await vimeoPlayerRef.current.setVolume(0);
          console.log('🔇 已設置靜音');
        } else {
          // 取消靜音：恢復之前的音量
          await vimeoPlayerRef.current.setVolume(currentVolume);
          console.log('🔊 已取消靜音，恢復音量:', currentVolume);
        }
      } catch (error) {
        console.error('❌ 切換靜音狀態失敗:', error);
      }
    }
  };

  // 統一處理 Vimeo URL 格式
  const normalizeVimeoUrl = (url) => {
    if (!url) return '';
    
    // 先清理多餘參數
    const cleanUrl = sanitizeUrl(url);
    
    // 如果已經是完整的 Vimeo URL，直接返回
    if (cleanUrl.includes('vimeo.com')) return cleanUrl;
    
    // 如果只是數字 ID，轉換為完整 URL
    if (/^\d+$/.test(cleanUrl.trim())) {
      return `https://vimeo.com/${cleanUrl.trim()}`;
    }
    
    // 其他情況直接返回清理後的 URL
    return cleanUrl;
  };

  // 解析時長字串為總秒數
  const parseDurationToSeconds = (durationStr) => {
    if (!durationStr) return 0;
    
    let totalSeconds = 0;
    
    // 匹配時、分、秒
    const hourMatch = durationStr.match(/(\d+)時/);
    const minuteMatch = durationStr.match(/(\d+)分/);
    const secondMatch = durationStr.match(/(\d+)秒/);
    
    if (hourMatch) totalSeconds += parseInt(hourMatch[1]) * 3600;
    if (minuteMatch) totalSeconds += parseInt(minuteMatch[1]) * 60;
    if (secondMatch) totalSeconds += parseInt(secondMatch[1]);
    
    return totalSeconds;
  };

  
  // 統一的 URL 檢查和標準化函數
  const checkAndNormalizeUrl = (video) => {
    if (!video || !video.url || video.url.trim() === '') {
      return { isValid: false, normalizedUrl: '', reason: 'Empty or missing video URL' };
    }
    
    // 先清理 URL 中的多餘參數
    const sanitizedUrl = sanitizeUrl(video.url);
    let normalizedUrl = sanitizedUrl;
    
    // 對 Vimeo 影片進行 URL 格式統一處理
    if (video.platform === 'vimeo') {
      normalizedUrl = normalizeVimeoUrl(sanitizedUrl);
      console.log('Vimeo URL 標準化:', video.url, '->', normalizedUrl);
    }
    
    // 檢查是否為有效的 Vimeo URL
    const isValid = video.platform === 'vimeo' && extractVimeoId(normalizedUrl) !== null;
    console.log('=== 檢查播放器支持 ===');
    console.log('原始 URL:', video.url);
    console.log('清理後 URL:', sanitizedUrl);
    console.log('標準化 URL:', normalizedUrl);
    console.log('平台:', video.platform);
    console.log('是否有效:', isValid);
    
    return {
      isValid: isValid,
      normalizedUrl: normalizedUrl,
      reason: isValid ? '' : 'Invalid Vimeo URL'
    };
  };

  // 檢查是否支持該URL（保留向後兼容）
  const checkPlayerSupport = (url, platform) => {
    const result = checkAndNormalizeUrl({ url, platform });
    return result.isValid;
  };

  // 檢查當前影片URL支持情況
  useEffect(() => {
    if (playlist[currentVideoIndex] && playlist[currentVideoIndex].video?.url) {
      checkPlayerSupport(currentVideo.video.url, currentVideo.video.platform);
    }
  }, [currentVideoIndex, playlist]);

  // 保存當前播放器的音量設置
  const saveCurrentVolume = useCallback(async () => {
    if (vimeoPlayerRef.current && vimeoPlayerRef.current.getVolume) {
      try {
        const volume = await vimeoPlayerRef.current.getVolume();
        console.log('🔊 保存當前音量:', volume);
        setCurrentVolume(volume);
        
        // 持久化音量設置到localStorage
        localStorage.setItem('vimeo-player-volume', volume.toString());
        
        // 只有當音量大於0時才更新靜音狀態為false
        // 避免將Vimeo播放器的初始音量0誤判為用戶主動靜音
        if (volume > 0) {
          setIsMuted(false);
          localStorage.setItem('vimeo-player-muted', 'false');
          console.log('🔊 檢測到有聲音，設置為非靜音狀態並持久化');
        }
        console.log('🔇 當前靜音狀態保持為:', isMuted);
      } catch (error) {
        console.warn('⚠️ 獲取音量失敗:', error);
      }
    }
  }, [vimeoPlayerRef, isMuted]);

  // 使用 useMemo 優化當前影片的計算
  const currentVideo = useMemo(() => {
    return playlist[currentVideoIndex] || null;
  }, [playlist, currentVideoIndex]);

  // 恢復音量設置的輔助函數
  const restoreVolume = useCallback(async (player) => {
    console.log('🔊 當前音量狀態:', { currentVolume, isMuted });
    try {
      if (isMuted) {
        await player.setVolume(0);
        console.log('🔇 已設置為靜音模式');
      } else if (currentVolume !== null) {
        await player.setVolume(currentVolume);
        console.log('🔊 已恢復音量:', currentVolume);
      }
      return true;
    } catch (error) {
      console.warn('⚠️ 音量設置失敗:', error);
      return false;
    }
  }, [currentVolume, isMuted]);

  // 處理播放器準備就緒事件
  const handlePlayerReady = useCallback(async (player) => {
    console.log('🎬 播放器準備就緒');
    
    try {
      // 恢復音量設置
      await restoreVolume(player);
      
      // 強制設置用戶互動狀態
      setUserInteracted(true);
      
      // 添加延遲確保播放器完全準備好
      setTimeout(async () => {
        if (userInteracted) {
          try {
            console.log('🚀 主動觸發自動播放');
            await player.play();
            console.log('✅ 自動播放成功');
          } catch (error) {
            console.warn('⚠️ 自動播放失敗，需要用戶互動:', error);
          }
        }
      }, 100);
      
    } catch (error) {
      console.error('播放器準備就緒處理失敗:', error);
    }
  }, [restoreVolume, userInteracted]);

  // 播放下一個影片（自動跳過無法播放的影片）
  const playNext = useCallback(async (maintainFullscreen = false) => {
    console.log('🎵 playNext 函數被調用');
    console.log('🖥️ 是否需要維持全螢幕:', maintainFullscreen);
    console.log('當前影片索引:', currentVideoIndex);
    console.log('播放列表總長度:', playlist.length);
    console.log('🔊 播放下一個影片前 - 當前音量狀態:', { currentVolume, isMuted });
    
    // 在切換影片前保存當前音量
    await saveCurrentVolume();
    console.log('🔊 保存音量後 - 音量狀態:', { currentVolume, isMuted });
    
    let nextIndex = currentVideoIndex + 1;
    console.log('嘗試播放索引:', nextIndex);
    
    // 循環尋找下一個可播放的影片
    while (nextIndex < playlist.length) {
      const nextVideo = playlist[nextIndex];
      console.log('檢查影片:', nextVideo?.title, '索引:', nextIndex);
      
      const urlCheck = checkAndNormalizeUrl(nextVideo?.video);
      console.log('URL 檢查結果:', urlCheck);
      
      if (urlCheck.isValid) {
        console.log('✅ 找到可播放影片，切換到索引:', nextIndex);
        console.log('🔊 切換影片時的音量狀態:', { currentVolume, isMuted });
        
        // 🔧 統一使用容器級切換策略，確保自動播放功能正常
        console.log('🎬 使用統一的容器級切換策略');
        
        // 如果需要維持全螢幕模式，設置恢復標記
        if (maintainFullscreen && fullscreenContainerRef.current) {
          fullscreenContainerRef.current.dataset.shouldRestoreFullscreen = 'true';
          console.log('🖥️ 已設置全螢幕恢復標記');
        }
        
        // 統一的容器級切換：直接更新索引，觸發 React 重新渲染
        // 這確保了 VimeoPlayer 組件完全重新初始化，避免狀態殘留問題
        setCurrentVideoIndex(nextIndex);
        setUserInteracted(true); // 確保自動播放權限
        
        console.log('✅ 容器級切換完成 - 新索引:', nextIndex);
        return; // 成功切換，退出函數
      }
      
      console.warn(`跳過無法播放的影片: ${nextVideo?.title} (${urlCheck.reason})`);
      nextIndex++; // 繼續尋找下一個影片
    }
    
    // 沒有找到可播放的影片
    console.log('❌ 播放列表已結束或無可播放影片');
    alert('播放列表已結束或無可播放影片');
  }, [currentVideoIndex, playlist, currentVolume, isMuted, isContainerFullscreen, fullscreenContainerRef, saveCurrentVolume, checkAndNormalizeUrl]);

  // 播放上一個影片（自動跳過無法播放的影片）
  const playPrevious = () => {
    let prevIndex = currentVideoIndex - 1;
    
    // 循環尋找上一個可播放的影片
    while (prevIndex >= 0) {
      const prevVideo = playlist[prevIndex];
      const urlCheck = checkAndNormalizeUrl(prevVideo?.video);
      
      if (urlCheck.isValid) {
        setCurrentVideoIndex(prevIndex);
        setUserInteracted(true);
        return; // 找到可播放影片，退出函數
      }
      
      console.warn(`跳過無法播放的影片: ${prevVideo?.title} (${urlCheck.reason})`);
      prevIndex--; // 繼續尋找上一個影片
    }
    
    // 沒有找到可播放的影片
    alert('已到達播放列表開頭或無可播放影片');
  };

  // 跳轉到指定影片
  const jumpToVideo = (index) => {
    const video = playlist[index];
    const urlCheck = checkAndNormalizeUrl(video?.video);
    
    if (urlCheck.isValid) {
      setCurrentVideoIndex(index);
      setUserInteracted(true);
    } else {
      alert('此影片目前無法播放');
    }
  };

  // 全螢幕容器控制函數
  const enterContainerFullscreen = async () => {
    if (fullscreenContainerRef.current && !isContainerFullscreen) {
      try {
        await fullscreenContainerRef.current.requestFullscreen();
        console.log('🖥️ 進入容器全螢幕模式');
      } catch (error) {
        console.error('❌ 進入全螢幕失敗:', error);
      }
    }
  };

  const exitContainerFullscreen = async () => {
    if (document.fullscreenElement && isContainerFullscreen) {
      try {
        await document.exitFullscreen();
        console.log('🖥️ 退出容器全螢幕模式');
      } catch (error) {
        console.error('❌ 退出全螢幕失敗:', error);
      }
    }
  };

  // 監聽全螢幕狀態變化和鍵盤事件
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement === fullscreenContainerRef.current;
      setIsContainerFullscreen(isFullscreen);
      console.log('🖥️ 全螢幕狀態變化:', isFullscreen);
    };

    const handleKeyDown = (event) => {
      // ESC 鍵退出全螢幕
      if (event.key === 'Escape' && isContainerFullscreen) {
        exitContainerFullscreen();
      }
      // F 鍵切換全螢幕
      if (event.key === 'f' || event.key === 'F') {
        if (isContainerFullscreen) {
          exitContainerFullscreen();
        } else {
          enterContainerFullscreen();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isContainerFullscreen]);

  // 自動標記影片完成並播放下一個（當影片播放結束時觸發）
  const markVideoCompleted = useCallback((eventData = {}) => {
    console.log('🎬 markVideoCompleted 被調用');
    console.log('🖥️ 事件數據:', eventData);
    console.log('當前影片索引:', currentVideoIndex);
    console.log('播放列表長度:', playlist.length);
    console.log('播放列表:', playlist);
    
    console.log('當前影片:', currentVideo);
    console.log('已完成影片列表:', completedVideos);
    
    // 檢查是否處於容器全螢幕模式
    const wasContainerFullscreen = isContainerFullscreen;
    console.log('🖥️ 影片結束時容器是否為全螢幕模式:', wasContainerFullscreen);
    
    if (currentVideo && currentVideo.id && !completedVideos.includes(currentVideo.id)) {
      console.log('✅ 開始標記影片完成:', currentVideo.title);
      
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
      
      // 自動播放下一個影片（無需彈窗確認）
      if (currentVideoIndex < playlist.length - 1) {
        console.log('🚀 準備自動播放下一個影片，1秒後執行');
        console.log('下一個影片索引將是:', currentVideoIndex + 1);
        console.log('用戶互動狀態:', userInteracted);
        console.log('瀏覽器自動播放政策檢查...');
        
        setTimeout(() => {
          console.log('⏭️ 執行 playNext()');
          console.log('setTimeout 執行時的當前索引:', currentVideoIndex);
          console.log('setTimeout 執行時的播放列表長度:', playlist.length);
          console.log('🖥️ 傳遞容器全螢幕狀態給 playNext:', wasContainerFullscreen);
          playNext(wasContainerFullscreen);
        }, 1000); // 1秒後自動播放下一個影片
      } else {
        console.log('📋 已到達播放列表末尾，不自動播放');
      }
    } else {
      console.log('⚠️ 影片已完成或無效，跳過標記');
      console.log('影片是否存在:', !!currentVideo);
      console.log('影片是否已完成:', (currentVideo && currentVideo.id) ? completedVideos.includes(currentVideo.id) : 'N/A');
    }
  }, [currentVideoIndex, playlist, completedVideos, isContainerFullscreen, userInteracted, playNext]);

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
        playNext(false); // 手動保存心得時不維持全螢幕
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
        playNext(false); // 手動跳過心得時不維持全螢幕
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
              <li>• 選擇的影片沒有有效的Vimeo連結</li>
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

  // 安全檢查：如果 currentVideo 不存在，顯示錯誤
  if (!currentVideo) {
    console.error('CoursePlayer - currentVideo is undefined:', {
      currentVideoIndex,
      playlistLength: playlist.length,
      playlist
    });
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ 影片載入錯誤</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <p className="text-gray-600 mb-4">當前影片索引: {currentVideoIndex}</p>
            <p className="text-gray-600 mb-4">播放列表長度: {playlist.length}</p>
            <p className="text-sm text-gray-500">請重新整理頁面或返回課程列表。</p>
          </div>
          <Link to="/course-list" className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition">
            返回課程列表
          </Link>
        </div>
      </div>
    );
  }
  
  // 計算總時長（正確的加總邏輯）
  const totalDurationSeconds = playlist.reduce((sum, video) => {
    return sum + parseDurationToSeconds(video.duration);
  }, 0);
  
  // 將總秒數轉換為時分秒格式
  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}時`;
    if (minutes > 0) result += `${minutes}分`;
    if (seconds > 0) result += `${seconds}秒`;
    
    return result || '0秒';
  };
  
  const totalDuration = formatDuration(totalDurationSeconds);
  
  // 調試信息
  console.log('=== CoursePlayer Debug Info ===');
  console.log('CoursePlayer - Current video index:', currentVideoIndex);
  console.log('CoursePlayer - Current video:', currentVideo);
  console.log('CoursePlayer - Video URL:', currentVideo?.video?.url);
  console.log('CoursePlayer - Playlist length:', playlist.length);
  console.log('CoursePlayer - Full playlist:', playlist);
  console.log('================================');

  return (
    <>
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
                  <p>以下影片因不支援的來源或無效連結而被跳過：</p>
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
              

              
              {/* VimeoPlayer 播放器 - 容器級全螢幕控制 */}
              <div 
                ref={fullscreenContainerRef}
                className="unified-video-container relative bg-black"
                style={{
                  width: isContainerFullscreen ? '100vw' : 'auto',
                  height: isContainerFullscreen ? '100vh' : 'auto',
                  position: isContainerFullscreen ? 'fixed' : 'relative',
                  top: isContainerFullscreen ? '0' : 'auto',
                  left: isContainerFullscreen ? '0' : 'auto',
                  zIndex: isContainerFullscreen ? '9999' : 'auto',
                  display: 'flex',
                  flexDirection: isContainerFullscreen ? 'column' : 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // 確保全螢幕時影片完全置中，但不隱藏控制按鈕
                  ...(isContainerFullscreen && {
                    padding: '20px',
                    margin: '0'
                  })
                }}
              >

                {currentVideo.video?.url ? (
                  <VimeoPlayer
                    ref={vimeoPlayerRef}
                    videoId={extractVimeoId(currentVideo.video.url)}
                    width={isContainerFullscreen ? '100%' : 400}
                    height={isContainerFullscreen ? '100%' : 225}
                    controls={true}
                    autoplay={userInteracted}
                    muted={isMuted}
                    responsive={isContainerFullscreen}
                    onEnded={markVideoCompleted}
                    onReady={handlePlayerReady}
                    key="vimeo-player-stable"
                    style={isContainerFullscreen ? {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%'
                    } : {}}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl text-gray-400 mb-4">🎥</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">影片即將上線</h3>
                      <p className="text-gray-500">此影片內容正在準備中，敬請期待</p>
                    </div>
                  </div>
                )}
                
                {/* 全屏模式下的控制按鈕 - 固定在螢幕右上角 */}
                {isContainerFullscreen && (
                  <div 
                    className="fixed flex items-center gap-3 cursor-move" 
                    style={{ 
                      zIndex: 10000,
                      left: `${buttonPosition.x}px`,
                      top: `${buttonPosition.y}px`,
                      userSelect: 'none'
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                      setDragOffset({
                        x: e.clientX - buttonPosition.x,
                        y: e.clientY - buttonPosition.y
                      });
                    }}
                  >
                    <button
                      onClick={exitContainerFullscreen}
                      className="px-6 py-3 bg-yellow-200/90 text-gray-800 text-lg font-semibold rounded-xl hover:bg-yellow-300/90 transition-colors duration-200"
                      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                      title="退出全螢幕 (ESC) - 可拖拽移動"
                    >
                      退出全螢幕
                    </button>
                  </div>
                )}
              </div>
              
              {/* 測試按鈕 - 手動觸發 markVideoCompleted - 移到容器外避免被 overflow:hidden 裁切 */}
              {currentVideo.video?.url && (
                <div>
                  <button 
                    onClick={markVideoCompleted}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mx-auto block"
                  >
                    🧪 測試自動播放功能
                  </button>
                  
                  {/* 🔍 調試按鈕：測試容器全螢幕切換 */}
                  <button 
                    onClick={() => {
                      console.log('🔍 手動觸發容器全螢幕切換測試');
                      console.log('🔍 當前影片索引:', currentVideoIndex);
                      console.log('🔍 播放列表長度:', playlist.length);
                      console.log('🔍 容器全螢幕狀態:', isContainerFullscreen);
                      if (currentVideoIndex < playlist.length - 1) {
                        console.log('🔍 模擬容器全螢幕模式下的影片結束');
                        markVideoCompleted();
                      }
                    }}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mx-auto block"
                  >
                    🔍 測試容器全螢幕切換
                  </button>
                </div>
              )}
              
              {/* 播放控制 */}
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() => {
                      setUserInteracted(true);
                      playPrevious();
                    }}
                    disabled={currentVideoIndex === 0}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← 上一個
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">
                      {currentVideoIndex + 1} / {playlist.length}
                    </span>
                    
                    {/* 全螢幕控制按鈕 */}
                    {!isContainerFullscreen ? (
                      <button
                        onClick={enterContainerFullscreen}
                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                        title="進入全螢幕"
                      >
                        全螢幕
                      </button>
                    ) : (
                      <button
                        onClick={exitContainerFullscreen}
                        className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                        title="退出全螢幕 (ESC)"
                      >
                        退出全螢幕
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setUserInteracted(true);
                      playNext(false); // 手動點擊時不維持全螢幕
                    }}
                    disabled={currentVideoIndex === playlist.length - 1}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一個 →
                  </button>
                </div>
                
                {/* 顯示完成狀態 */}
                {completedVideos.includes(currentVideo.id) && (
                  <div className="flex justify-center">
                    <div className="px-4 py-2 bg-green-500 text-white rounded">
                      ✓ 已完成
                    </div>
                  </div>
                )}
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
                    className={`p-3 border-b transition ${
                      index === currentVideoIndex 
                        ? 'bg-yellow-50 border-l-4 border-l-yellow-500' 
                        : video.isPlayable 
                          ? 'cursor-pointer hover:bg-gray-50' 
                          : 'cursor-not-allowed bg-gray-50 opacity-60'
                    }`}
                    onClick={() => {
                      if (video.isPlayable) {
                        setUserInteracted(true);
                        setIsPlaying(true);
                        jumpToVideo(index);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${index === currentVideoIndex ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">
                          {video.categoryTitle}
                        </p>
                        <p className={`text-sm font-medium truncate ${index === currentVideoIndex ? 'text-yellow-700' : 'text-gray-800'}`}>
                          {video.title}
                          <span className="text-red-500 text-xs ml-2">
                            {invalidVideos.find(v => v.id === video.id) ? '⚠️不可播放' : ''}
                          </span>
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

      {/* 測試按鈕 - 極其明顯的樣式來確認渲染問題 */}
        {(isContainerFullscreen || document.fullscreenElement) && (
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: 99999,
              background: 'rgba(255, 0, 255, 0.3)', // 紫色半透明覆蓋整個螢幕
              border: '10px solid lime' // 綠色邊框
            }}
          >
            <button
              onClick={() => {
                console.log('🔘 測試按鈕被點擊');
                console.log('🔘 isContainerFullscreen:', isContainerFullscreen);
                console.log('🔘 document.fullscreenElement:', document.fullscreenElement);
                exitContainerFullscreen();
              }}
              className="fixed top-4 right-4 pointer-events-auto"
              title="退出全螢幕 (ESC)"
              style={{
                zIndex: 100000,
                background: 'yellow',
                color: 'black',
                padding: '20px',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '5px solid red',
                borderRadius: '10px',
                boxShadow: '0 0 50px rgba(255, 255, 0, 1)'
              }}
            >
              ✕ 測試按鈕
            </button>
          </div>
        )}

        {/* 強制顯示測試 - 無條件渲染 */}
        <div
          className="fixed top-4 left-4"
          style={{
            zIndex: 100001,
            background: 'orange',
            color: 'white',
            padding: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: '3px solid blue',
            borderRadius: '5px'
          }}
        >
          強制顯示測試
        </div>
      
      {/* 調試資訊 - 僅在開發環境顯示 */}
       {process.env.NODE_ENV === 'development' && (
         <div 
           className="fixed top-20 right-4 bg-yellow-500 text-black p-2 rounded text-xs"
           style={{ zIndex: 10001 }} // 確保高於全螢幕容器
         >
           <div>isContainerFullscreen: {isContainerFullscreen.toString()}</div>
           <div>fullscreenElement: {document.fullscreenElement ? 'true' : 'false'}</div>
         </div>
       )}

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


    </>
  );
}
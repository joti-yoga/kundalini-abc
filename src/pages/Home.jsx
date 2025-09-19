import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  // 檢查訪客模式狀態
  useEffect(() => {
    const guestMode = localStorage.getItem('isGuestMode') === 'true';
    setIsGuestMode(guestMode);
  }, []);

  // 動態檢測屏幕寬度
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 獲取響應式橫幅高度
  const getBannerHeight = () => {
    if (window.innerWidth >= 1024) {
      return '180px'; // 電腦版：從300px縮小到180px
    } else if (window.innerWidth >= 768) {
      return '150px'; // 平板版：150px
    } else {
      return '150px'; // 手機版：從200px縮小到120px，再調整為150px
    }
  };

  const goToCourse = () => {
    navigate('/course-list');
  };

  const goToCalendar = () => {
    navigate('/practice-calendar');
  };

  const goToCommunity = () => {
    navigate('/community');
  };

  const goToVimeoTest = () => {
    navigate('/vimeo-test');
  };

  const goBack = () => {
    window.history.back();
  };

  const goToLogin = () => {
    navigate('/entry');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('isGuestMode');
      // 保持在當前頁面，不需要導航
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  const handleBannerLoad = () => {
    setBannerLoaded(true);
  };

  const handleBannerError = () => {
    setBannerError(true);
  };

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* 響應式橫幅圖片 */}
      <div className="relative w-full overflow-hidden">
        {/* 橫幅圖片容器 */}
        <div 
          className="relative w-full"
          style={{
            height: getBannerHeight()
          }}
        >
          {!bannerError ? (
            <>
              {/* 載入佔位符 */}
              {!bannerLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-yellow-200 animate-pulse flex items-center justify-center">
                  <div className="text-yellow-600 text-lg font-medium">
                    載入中...
                  </div>
                </div>
              )}
              
              {/* 實際橫幅圖片 */}
              <img
                src="/images/banner.png"
                alt="Joti's Kundalini ABC Yoga 橫幅"
                className={`w-full h-full object-contain transition-opacity duration-500 ${
                  bannerLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleBannerLoad}
                onError={handleBannerError}
                loading="eager"
              />
            </>
          ) : (
            /* 錯誤回退 */
            <div className="w-full h-full bg-gradient-to-r from-yellow-200 via-purple-200 to-yellow-300 flex items-center justify-center">
              <div className="text-center px-4">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-700 mb-2">
                  Joti's Kundalini ABC Yoga
                </h1>
                <p className="text-lg md:text-xl text-gray-600">
                  昆達里尼 ABC 瑜伽
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* 右上角按鈕組 - 浮動在橫幅上方 */}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <div className="flex gap-2">
            <button
              onClick={goBack}
              className="bg-white/90 hover:bg-white text-gray-700 px-3 py-2 rounded-lg shadow-lg border text-sm font-medium transition-all backdrop-blur-sm"
              title="回上一頁"
            >
              ← 回上一頁
            </button>
            
            {!user && !isGuestMode && (
              <button
                onClick={goToLogin}
                className="bg-blue-500/90 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-all backdrop-blur-sm"
                title="登入頁面"
              >
                登入
              </button>
            )}
          </div>
          
          {(user || isGuestMode) && (
            <button
              onClick={handleLogout}
              className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-all backdrop-blur-sm"
              title="登出"
            >
              登出
            </button>
          )}
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="p-6">
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
                  <strong>訪客模式：</strong>您目前以訪客身份瀏覽，影片觀看限制為前1分鐘。
                  <Link to="/entry" className="underline hover:text-orange-800 ml-2">
                    立即註冊享受完整體驗
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h2 className="text-2xl font-medium" style={{ color: '#999700' }}>
            Hi, {isGuestMode ? '訪客' : (user?.displayName || '帥哥/美女')}，歡迎來到 Joti's昆達里尼ABC瑜伽
          </h2>
        </div>

        <div 
          className="w-full p-8 min-h-[60vh] md:min-h-0"
          style={{
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isDesktop ? '8rem' : '4rem'
          }}
        >
          <button
            onClick={goToCourse}
            className="bg-yellow-400 text-white px-16 py-8 rounded-xl shadow hover:bg-yellow-500 transition text-4xl font-bold min-w-[300px] min-h-[120px]"
          >
            進入課程
          </button>
          <button
            onClick={goToCalendar}
            className="bg-yellow-400 text-white px-16 py-8 rounded-xl shadow hover:bg-yellow-500 transition text-4xl font-bold min-w-[300px] min-h-[120px]"
          >
            練習日曆
          </button>
          <button
            onClick={goToCommunity}
            className="bg-yellow-400 text-white px-16 py-8 rounded-xl shadow hover:bg-yellow-500 transition text-4xl font-bold min-w-[300px] min-h-[120px]"
          >
            社群互動
          </button>
        </div>

        {/* 開發環境測試按鈕 */}
        {import.meta.env.DEV && (
          <div className="mt-8 text-center">
            <button
              onClick={goToVimeoTest}
              className="bg-red-500 text-white px-6 py-3 rounded-lg shadow hover:bg-red-600 transition text-lg font-medium"
            >
              🔧 Vimeo 播放器測試 (開發模式)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
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

  const goToCourse = () => {
    navigate('/course-list');
  };

  const goToCalendar = () => {
    navigate('/practice-calendar');
  };

  const goToCommunity = () => {
    navigate('/community');
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

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      {/* 右上角按鈕組 */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <button
          onClick={goBack}
          className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-md border text-sm font-medium transition-colors"
          title="回上一頁"
        >
          ← 回上一頁
        </button>
        
        {!user && !isGuestMode && (
          <button
            onClick={goToLogin}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-colors"
            title="登入頁面"
          >
            登入
          </button>
        )}
        
        {(user || isGuestMode) && (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-colors"
            title="登出"
          >
            登出
          </button>
        )}
      </div>
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
        <h2 className="text-2xl font-medium mb-4" style={{ color: '#999700' }}>
          Hi, {isGuestMode ? '訪客' : (user?.displayName || '帥哥/美女')}
        </h2>
        <h1 className="text-3xl font-semibold" style={{ color: '#999700' }}>歡迎來到 Joti's昆達里尼ABC瑜伽</h1>
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
    </div>
  );
}
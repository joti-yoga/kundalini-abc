// src/pages/Community.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Community() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // 載入用戶資料
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('獲取用戶資料失敗:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // 登出功能
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/entry');
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Fixed Top Banner */}
      <div className="fixed top-0 left-0 right-0 w-full z-50 shadow-md" style={{ backgroundColor: '#fef3c7' }}>
        <div className="w-full px-6 py-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center">
            <h1 className="text-2xl font-bold" style={{ color: '#999700' }}>
              Joti's昆達里尼ABC瑜伽
            </h1>
            
            <div className="flex items-center" style={{gap: '16px'}}>
              <span className="text-sm" style={{ color: '#999700' }}>
                Hi, {user ? (userData?.displayName || user.email) : '訪客'}
              </span>
              
              <Link 
                 to="/home" 
                 className="text-sm px-3 py-1 rounded transition" 
                 style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
               >
                 回主選單
               </Link>
              <Link 
                to="/course-list"
                className="text-sm px-3 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                課程列表
              </Link>
              <Link 
                to="/practice-calendar" 
                className="text-sm px-3 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                練習日曆
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm px-3 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                登出
              </button>
            </div>
          </div>
          
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="mb-3">
              <h1 className="text-xl font-bold" style={{ color: '#999700' }}>
                Joti's昆達里尼ABC瑜伽
              </h1>
            </div>
            
            <div className="flex justify-end items-center" style={{gap: '8px'}}>
              <span className="text-xs mr-2" style={{ color: '#999700' }}>
                Hi, {user ? (userData?.displayName || user.email) : '訪客'}
              </span>
              
              <Link 
                 to="/home" 
                 className="text-xs px-2 py-1 rounded transition" 
                 style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
               >
                 回主選單
               </Link>
              <Link 
                to="/course-list" 
                className="text-xs px-2 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                課程列表
              </Link>
              <Link 
                to="/practice-calendar" 
                className="text-xs px-2 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                練習日曆
              </Link>
              <button 
                onClick={handleLogout}
                className="text-xs px-2 py-1 rounded transition" 
                style={{ color: '#999700', backgroundColor: 'rgba(153, 151, 0, 0.1)' }}
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center" style={{ paddingTop: '120px', minHeight: 'calc(100vh - 120px)' }}>
        <h2 className="text-2xl font-semibold text-gray-700">社群互動</h2>
        <p className="text-gray-500">在這裡，你可以與其他會員互動，討論、分享心得。</p>
        {/* 可以在這裡添加社交功能，像是留言板、討論區或聊天室等 */}
      </div>
    </div>
  );
}
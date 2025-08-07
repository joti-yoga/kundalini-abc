import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, setDoc, serverTimestamp, Timestamp, getDoc } from 'firebase/firestore'

function Entry() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // 處理 Google 登入重定向結果
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result) {
          const user = result.user
          
          // 檢查用戶是否已存在於Firestore
          const userDocRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (!userDoc.exists()) {
            // 新用戶，創建用戶資料
            const trialEnds = Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
            
            await setDoc(userDocRef, {
              displayName: user.displayName,
              email: user.email,
              createdAt: serverTimestamp(),
              isPaid: false,
              trialEnds: trialEnds,
            })
            
            // 新用戶跳轉到註冊成功頁面
            navigate('/register-success')
          } else {
            // 現有用戶直接跳轉到首頁
            navigate('/home')
          }
        }
      } catch (error) {
        console.error('處理重定向結果失敗：', error)
        alert('Google登入失敗：' + error.message)
      }
    }

    handleRedirectResult()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // 先嘗試登入
      await signInWithEmailAndPassword(auth, email, password)
      // 登入成功，跳轉到首頁
      navigate('/home')
    } catch (loginError) {
      // 登入失敗，檢查是否為用戶不存在的錯誤
      if (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/invalid-credential') {
        // 用戶不存在，進行註冊
        try {
          if (!name.trim()) {
            alert('請輸入姓名以完成註冊')
            setIsLoading(false)
            return
          }
          
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          const user = userCredential.user

          await updateProfile(user, {
            displayName: name,
          })

          // 計算試用結束日（3 天後）
          const trialEnds = Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))

          // 寫入 Firestore 的 /users/{uid}
          await setDoc(doc(db, 'users', user.uid), {
            displayName: name,
            email: user.email,
            createdAt: serverTimestamp(),
            isPaid: false,
            trialEnds: trialEnds,
          })

          navigate('/register-success')
        } catch (registerError) {
          alert('註冊失敗：' + registerError.message)
        }
      } else {
        // 其他登入錯誤（如密碼錯誤）
        alert('登入失敗：' + loginError.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const provider = new GoogleAuthProvider()
    
    try {
      // 檢測是否為手機設備
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
      
      if (isMobile) {
        // 手機設備使用重定向方式
        await signInWithRedirect(auth, provider)
        // 重定向後的處理在 useEffect 中完成
      } else {
        // 桌面設備使用彈出視窗方式
        const result = await signInWithPopup(auth, provider)
        const user = result.user
        
        // 檢查用戶是否已存在於Firestore
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        
        if (!userDoc.exists()) {
          // 新用戶，創建用戶資料
          const trialEnds = Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
          
          await setDoc(userDocRef, {
            displayName: user.displayName,
            email: user.email,
            createdAt: serverTimestamp(),
            isPaid: false,
            trialEnds: trialEnds,
          })
          
          // 新用戶跳轉到註冊成功頁面
          navigate('/register-success')
        } else {
          // 現有用戶直接跳轉到首頁
          navigate('/home')
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Google登入失敗：', error)
      alert('Google登入失敗：' + error.message)
      setIsLoading(false)
    }
  }

  const handleGuestMode = () => {
    // 設置訪客模式標記到 localStorage
    localStorage.setItem('isGuestMode', 'true')
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      {/* 歡迎提示視窗 */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="rounded-lg p-12 shadow-xl border-2 border-yellow-600" style={{backgroundColor: '#fef3c7', width: '800px', maxWidth: '90vw', minHeight: '400px'}}>
            <h2 className="text-xl font-bold mb-10 text-center" style={{ color: '#999700' }}>
              歡迎來到 Joti's昆達里尼ABC瑜伽
            </h2>
            <div className="mb-12 text-lg text-center" style={{color: '#999700', fontFamily: 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif'}}>
              <div className="leading-loose" style={{marginBottom: '2rem'}}>
                 <span>•訪客登入僅能觀看影片前1分鐘</span>
               </div>
               <div className="leading-loose" style={{marginBottom: '2rem'}}>
                 <span>•註冊用戶可享即刻起3日免費試用</span>
               </div>
               <div className="leading-loose">
                 <span>•註冊用戶付費升級會員可享全部影片完整觀看～</span>
               </div>
              <div className="h-8"></div>
                <div className="h-8"></div>
              </div>
              <div style={{height: '120px'}}></div>
              <div className="flex justify-center">
                 <button
                   onClick={() => setShowWelcomeModal(false)}
                   className="bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition duration-200 font-bold"
                   style={{
                     fontSize: '1.25rem',
                     padding: '1rem 2rem',
                     minWidth: '200px'
                   }}
                 >
                   我知道了！
                 </button>
               </div>
          </div>
        </div>
      )}

      {/* 標題區域 */}
      <div className="text-center mb-12">
         <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#999700' }}>
           Joti's昆達里尼ABC瑜伽
         </h1>
         <p className="text-lg mb-4" style={{ color: '#999700' }}>
           Asana . Breath . Chant
         </p>
         <p className="text-base mb-8" style={{ color: '#999700' }}>
           開啟屬於你的身心靈轉化之旅
         </p>
       </div>

      {/* 表單區域 */}
      <div className={`w-full max-w-sm mb-12 ${showWelcomeModal ? 'opacity-75' : ''}`} style={{maxWidth: isDesktop ? '320px' : '384px', margin: '0 auto'}}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="姓名（新用戶註冊時需要）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-400 rounded focus:outline-none focus:border-gray-600"
            style={{padding: '0.5rem 1.5rem', fontSize: '1.125rem', minHeight: '1.75rem'}}
            disabled={false}
          />
          <input
            type="email"
            placeholder="E-mail郵箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-400 rounded focus:outline-none focus:border-gray-600"
            style={{padding: '0.5rem 1.5rem', fontSize: '1.125rem', minHeight: '1.75rem'}}
            required
            disabled={false}
          />
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-400 rounded focus:outline-none focus:border-gray-600"
            style={{padding: '0.5rem 1.5rem', fontSize: '1.125rem', minHeight: '1.75rem'}}
            required
            disabled={showWelcomeModal}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-200 text-gray-800 border border-gray-400 rounded hover:bg-gray-300 transition duration-200 font-medium mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{padding: '1rem 2rem', fontSize: '1.125rem', minHeight: '3.5rem'}}
          >
            {isLoading ? '處理中...' : '註冊/登入'}
          </button>
        </form>
      </div>

      {/* 第三方登入選項 */}
      <div className={`w-full max-w-sm space-y-4 mt-8 ${showWelcomeModal ? 'opacity-75' : ''}`} style={{maxWidth: isDesktop ? '320px' : '384px', margin: '0 auto'}}>
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-gray-200 border border-gray-400 text-gray-800 rounded hover:bg-gray-300 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed relative z-50 flex items-center justify-center gap-3"
          style={{padding: '1rem 2rem', fontSize: '1.125rem', minHeight: '3.5rem'}}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <button 
          onClick={handleGuestMode}
          disabled={false}
          className="w-full bg-gray-200 border border-gray-400 text-gray-800 rounded hover:bg-gray-300 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed relative z-50"
          style={{padding: '1rem 2rem', fontSize: '1.125rem', minHeight: '3.5rem'}}
        >
          訪客
        </button>
      </div>
    </div>
  )
}

export default Entry
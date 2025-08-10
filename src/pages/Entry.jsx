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
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // 檢查未完成的Google登入流程和網路狀態
  useEffect(() => {
    // 檢查是否有未完成的Google登入嘗試
    const checkPendingAuth = () => {
      const authAttempt = localStorage.getItem('googleAuthAttempt')
      const authTimestamp = localStorage.getItem('googleAuthTimestamp')
      
      if (authAttempt === 'true' && authTimestamp) {
        const timestamp = parseInt(authTimestamp)
        const now = Date.now()
        const timeDiff = now - timestamp
        
        // 如果超過5分鐘，清除過期的登入嘗試
        if (timeDiff > 5 * 60 * 1000) {
          localStorage.removeItem('googleAuthAttempt')
          localStorage.removeItem('googleAuthTimestamp')
          console.warn('清除過期的Google登入嘗試')
        } else {
          // 顯示正在處理的狀態
          setIsProcessingRedirect(true)
        }
      }
    }
    
    // 網路狀態變化監聽
    const handleOnline = () => {
      console.log('網路連接已恢復')
    }
    
    const handleOffline = () => {
      console.warn('網路連接已斷開')
      // 如果正在處理登入，顯示提示
      if (isLoading || isProcessingRedirect) {
        alert('網路連接已斷開，請檢查網路後重試')
        setIsLoading(false)
        setIsProcessingRedirect(false)
      }
    }
    
    checkPendingAuth()
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isLoading, isProcessingRedirect])

  // 處理 Google 登入重定向結果
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        setIsProcessingRedirect(true)
        
        // 添加重試機制
        let retryCount = 0
        const maxRetries = 3
        let result = null
        
        while (retryCount < maxRetries && !result) {
          try {
            result = await getRedirectResult(auth)
            break
          } catch (retryError) {
            retryCount++
            console.warn(`重定向結果獲取失敗，重試 ${retryCount}/${maxRetries}:`, retryError)
            if (retryCount < maxRetries) {
              // 等待1秒後重試
              await new Promise(resolve => setTimeout(resolve, 1000))
            } else {
              throw retryError
            }
          }
        }
        
        if (result) {
          const user = result.user
          
          // 保存登入狀態到localStorage，防止狀態丟失
          localStorage.setItem('googleAuthInProgress', 'true')
          localStorage.setItem('googleAuthUser', JSON.stringify({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email
          }))
          
          // 檢查用戶是否已存在於Firestore
          const userDocRef = doc(db, 'users', user.uid)
          let userDoc
          
          // 添加Firestore查詢重試機制
          let firestoreRetryCount = 0
          while (firestoreRetryCount < maxRetries) {
            try {
              userDoc = await getDoc(userDocRef)
              break
            } catch (firestoreError) {
              firestoreRetryCount++
              console.warn(`Firestore查詢失敗，重試 ${firestoreRetryCount}/${maxRetries}:`, firestoreError)
              if (firestoreRetryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000))
              } else {
                throw firestoreError
              }
            }
          }
          
          if (!userDoc.exists()) {
            // 新用戶，創建用戶資料
            const trialEnds = Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
            
            // 添加用戶創建重試機制
            let createUserRetryCount = 0
            while (createUserRetryCount < maxRetries) {
              try {
                await setDoc(userDocRef, {
                  displayName: user.displayName,
                  email: user.email,
                  createdAt: serverTimestamp(),
                  isPaid: false,
                  trialEnds: trialEnds,
                })
                break
              } catch (createError) {
                createUserRetryCount++
                console.warn(`用戶創建失敗，重試 ${createUserRetryCount}/${maxRetries}:`, createError)
                if (createUserRetryCount < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 1000))
                } else {
                  throw createError
                }
              }
            }
            
            // 清除臨時狀態並跳轉
            localStorage.removeItem('googleAuthInProgress')
            localStorage.removeItem('googleAuthUser')
            localStorage.removeItem('isGuestMode')
            navigate('/register-success')
          } else {
            // 現有用戶直接跳轉到首頁
            localStorage.removeItem('googleAuthInProgress')
            localStorage.removeItem('googleAuthUser')
            localStorage.removeItem('isGuestMode')
            navigate('/home')
          }
        } else {
          // 檢查是否有未完成的Google登入流程
          const authInProgress = localStorage.getItem('googleAuthInProgress')
          if (authInProgress === 'true') {
            // 清除未完成的登入狀態
            localStorage.removeItem('googleAuthInProgress')
            localStorage.removeItem('googleAuthUser')
            console.warn('檢測到未完成的Google登入流程，已清除相關狀態')
          }
        }
      } catch (error) {
        console.error('處理重定向結果失敗：', error)
        
        // 清除可能的殘留狀態
        localStorage.removeItem('googleAuthInProgress')
        localStorage.removeItem('googleAuthUser')
        
        // 根據錯誤類型提供不同的提示
        let errorMessage = 'Google登入失敗'
        if (error.code === 'auth/network-request-failed') {
          errorMessage = '網路連接失敗，請檢查網路連接後重試'
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = '請求過於頻繁，請稍後再試'
        } else if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = '登入已取消'
        } else if (error.message) {
          errorMessage += '：' + error.message
        }
        
        alert(errorMessage)
      } finally {
        setIsProcessingRedirect(false)
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
      // 登入成功，清除訪客模式並跳轉到首頁
      localStorage.removeItem('isGuestMode')
      setIsLoading(false)
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

          // 清除訪客模式並跳轉到註冊成功頁面
          localStorage.removeItem('isGuestMode')
          setIsLoading(false)
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
    // 檢查網路連接狀態
    if (!navigator.onLine) {
      alert('請檢查網路連接後重試')
      return
    }
    
    // 檢測特殊瀏覽器環境
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent)
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    
    if (isWeChat) {
      alert('請在外部瀏覽器中開啟此頁面以使用Google登入')
      return
    }
    
    const provider = new GoogleAuthProvider()
    // 設置提示語言為繁體中文
    provider.setCustomParameters({
      'hl': 'zh-TW'
    })
    
    try {
      // 檢測是否為手機設備
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
      
      if (isMobile) {
        // 手機設備使用重定向方式
        setIsLoading(true)
        
        // 保存重定向前的狀態
        localStorage.setItem('googleAuthAttempt', 'true')
        localStorage.setItem('googleAuthTimestamp', Date.now().toString())
        
        // 短暫延遲讓用戶看到loading狀態和提示
        await new Promise(resolve => setTimeout(resolve, 500))
        
        try {
          await signInWithRedirect(auth, provider)
          // 重定向後的處理在 useEffect 中完成
        } catch (redirectError) {
          // 清除重定向狀態
          localStorage.removeItem('googleAuthAttempt')
          localStorage.removeItem('googleAuthTimestamp')
          throw redirectError
        }
      } else {
        // 桌面設備使用彈出視窗方式
        setIsLoading(true)
        
        let result
        let retryCount = 0
        const maxRetries = 2
        
        // 添加重試機制
        while (retryCount <= maxRetries) {
          try {
            result = await signInWithPopup(auth, provider)
            break
          } catch (popupError) {
            retryCount++
            
            if (popupError.code === 'auth/popup-blocked') {
              alert('彈出視窗被阻擋，請允許彈出視窗或重新整理頁面後重試')
              break
            } else if (popupError.code === 'auth/cancelled-popup-request' || popupError.code === 'auth/popup-closed-by-user') {
              // 用戶取消登入，不顯示錯誤
              setIsLoading(false)
              return
            } else if (retryCount <= maxRetries && (popupError.code === 'auth/network-request-failed' || popupError.code === 'auth/internal-error')) {
              console.warn(`彈出視窗登入失敗，重試 ${retryCount}/${maxRetries}:`, popupError)
              // 等待1秒後重試
              await new Promise(resolve => setTimeout(resolve, 1000))
            } else {
              throw popupError
            }
          }
        }
        
        if (!result) {
          setIsLoading(false)
          return
        }
        
        const user = result.user
        
        // 檢查用戶是否已存在於Firestore（添加重試機制）
        const userDocRef = doc(db, 'users', user.uid)
        let userDoc
        let firestoreRetryCount = 0
        const maxFirestoreRetries = 3
        
        while (firestoreRetryCount < maxFirestoreRetries) {
          try {
            userDoc = await getDoc(userDocRef)
            break
          } catch (firestoreError) {
            firestoreRetryCount++
            console.warn(`Firestore查詢失敗，重試 ${firestoreRetryCount}/${maxFirestoreRetries}:`, firestoreError)
            if (firestoreRetryCount < maxFirestoreRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000))
            } else {
              throw firestoreError
            }
          }
        }
        
        if (!userDoc.exists()) {
          // 新用戶，創建用戶資料
          const trialEnds = Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
          
          // 添加用戶創建重試機制
          let createUserRetryCount = 0
          while (createUserRetryCount < maxFirestoreRetries) {
            try {
              await setDoc(userDocRef, {
                displayName: user.displayName,
                email: user.email,
                createdAt: serverTimestamp(),
                isPaid: false,
                trialEnds: trialEnds,
              })
              break
            } catch (createError) {
              createUserRetryCount++
              console.warn(`用戶創建失敗，重試 ${createUserRetryCount}/${maxFirestoreRetries}:`, createError)
              if (createUserRetryCount < maxFirestoreRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000))
              } else {
                throw createError
              }
            }
          }
          
          // 新用戶跳轉到註冊成功頁面，清除訪客模式
          localStorage.removeItem('isGuestMode')
          navigate('/register-success')
        } else {
          // 現有用戶直接跳轉到首頁，清除訪客模式
          localStorage.removeItem('isGuestMode')
          navigate('/home')
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Google登入失敗：', error)
      
      // 清除可能的殘留狀態
      localStorage.removeItem('googleAuthAttempt')
      localStorage.removeItem('googleAuthTimestamp')
      
      // 根據錯誤類型提供不同的提示
      let errorMessage = 'Google登入失敗'
      if (error.code === 'auth/network-request-failed') {
        errorMessage = '網路連接失敗，請檢查網路連接後重試'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = '請求過於頻繁，請稍後再試'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = '彈出視窗被阻擋，請允許彈出視窗後重試'
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = '網域未授權，請聯繫管理員'
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google登入功能未啟用，請聯繫管理員'
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // 用戶取消登入，不顯示錯誤
        setIsLoading(false)
        return
      } else if (error.message) {
        errorMessage += '：' + error.message
      }
      
      alert(errorMessage)
      
      // 重置loading狀態
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
           <div className="rounded-lg p-8 md:p-12 shadow-xl border-2 border-yellow-600" style={{backgroundColor: '#fef3c7', width: '85vw', height: '70vh', maxWidth: '600px', minHeight: '500px'}}>
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-12 md:mb-16 text-center" style={{ color: '#999700' }}>
                  <span className="block md:inline">歡迎來到</span>
                  <span className="block md:inline">Joti's昆達里尼ABC瑜伽</span>
                </h2>
                <div className="text-lg md:text-xl text-center" style={{color: '#999700', fontFamily: 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif'}}>
                  <div className="leading-loose mb-6 md:mb-8">
                     <span>•「訪客登入」僅能觀看影片前1分鐘</span>
                   </div>
                   <div className="leading-loose mb-6 md:mb-8">
                     <span>•「註冊用戶」可享即刻起3日免費試用</span>
                   </div>
                   <div className="leading-loose">
                     <span>•註冊用戶「付費升級會員」可享全部影片完整觀看</span>
                   </div>
                </div>
              </div>
              <div className="flex justify-center" style={{marginTop: '-1rem', marginBottom: '2rem'}}>
                 <button
                   onClick={() => setShowWelcomeModal(false)}
                   className="bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition duration-200 font-bold shadow-none"
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
      <div className={`w-full max-w-sm mb-4 ${showWelcomeModal ? 'opacity-75' : ''}`} style={{maxWidth: isDesktop ? '420px' : '320px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="姓名（新用戶註冊時需要）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-400 rounded focus:outline-none focus:border-gray-600"
            style={{padding: '1rem 2rem', fontSize: '1.125rem', minHeight: '1.75rem', width: isDesktop ? '420px' : '320px'}}
            disabled={false}
          />
          <input
            type="email"
            placeholder="E-mail郵箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-400 rounded focus:outline-none focus:border-gray-600"
            style={{padding: '1rem 2rem', fontSize: '1.125rem', minHeight: '1.75rem', width: isDesktop ? '420px' : '320px'}}
            required
            disabled={false}
          />
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-400 rounded focus:outline-none focus:border-gray-600"
            style={{padding: '1rem 2rem', fontSize: '1.125rem', minHeight: '1.75rem', width: isDesktop ? '420px' : '320px'}}
            required
            disabled={showWelcomeModal}
          />
          <button
            type="submit"
            disabled={isLoading || isProcessingRedirect}
            className="w-full bg-gray-200 text-gray-800 border border-gray-400 rounded hover:bg-gray-300 transition duration-200 font-medium mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{padding: '1rem 2rem', fontSize: '1.125rem', minHeight: '3.5rem'}}
          >
            {isProcessingRedirect ? '正在處理Google登入...' : isLoading ? '處理中...' : '註冊/登入'}
          </button>
        </form>
      </div>

      {/* 第三方登入選項 */}
      <div className={`w-full max-w-sm flex gap-4 ${showWelcomeModal ? 'opacity-75' : ''}`} style={{maxWidth: isDesktop ? '420px' : '320px', margin: '0 auto', marginTop: '6rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading || isProcessingRedirect}
          className="flex-1 bg-gray-200 border border-gray-400 text-gray-800 rounded-full hover:bg-gray-300 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed relative z-50 flex items-center justify-center gap-2"
          style={{padding: '1rem 1rem', fontSize: '1rem', minHeight: '3.5rem'}}
        >
          {isProcessingRedirect ? (
            '正在處理Google登入...'
          ) : isLoading ? (
            '連接Google中...'
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </>
          )}
        </button>

        <button 
          onClick={handleGuestMode}
          disabled={false}
          className="flex-1 bg-gray-200 border border-gray-400 text-gray-800 rounded-full hover:bg-gray-300 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed relative z-50"
          style={{padding: '1rem 1rem', fontSize: '1rem', minHeight: '3.5rem'}}
        >
          訪客
        </button>
      </div>
    </div>
  )
}

export default Entry
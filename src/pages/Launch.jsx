import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Launch() {
  const navigate = useNavigate()

  // ⏳ 3 秒後導向 /intro
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/intro')
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-white to-yellow-50">
      <img
        src="/icon-192.png"
        alt="App Logo"
        className="w-24 h-24 mb-6 animate-fadeInSlow drop-shadow-lg"
      />

      <h1 className="text-4xl font-light tracking-wide animate-fadeIn" style={{ color: '#FFF777' }}>
        Joti's昆達里尼ABC瑜伽
      </h1>

      <p className="text-lg mt-6 text-center px-6 leading-relaxed font-light animate-fadeIn delay-500" style={{ color: '#FFFFFF', textShadow: '0 0 8px #FFF777, 0 0 15px #999700' }}>
        喚醒你內在的光<br />
        讓愛與覺知隨冥想綻放 ✨
      </p>
    </div>
  )
}

export default Launch
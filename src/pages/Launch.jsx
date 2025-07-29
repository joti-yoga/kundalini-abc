import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Launch() {
  const navigate = useNavigate()

  // useEffect(() => {
  //  const timer = setTimeout(() => {
  //    navigate('/intro')
  //  }, 3000)
  //  return () => clearTimeout(timer)
  //}, [navigate])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-white to-yellow-50">
      <img
        src="/icon-192.png"
        alt="App Logo"
        className="w-24 h-24 mb-4 animate-fadeIn"
      />
      <h1 className="text-2xl font-semibold text-gray-700 animate-fadeIn">
        Joti's 昆達里尼 ABC 瑜伽
      </h1>
      <p className="text-sm text-gray-500 mt-2 animate-fadeIn delay-200">
        喚醒你內在的光 ✨
      </p>
    </div>
  )
}

export default Launch
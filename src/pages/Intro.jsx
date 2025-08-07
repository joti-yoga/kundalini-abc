import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

function Intro() {
  const navigate = useNavigate()

  // ✅ 自動跳轉至 /entry（4 秒後）
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/entry')
    }, 5250)
    return () => clearTimeout(timer)
  }, [navigate])

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,              // ✅ 啟用自動播放
    autoplaySpeed: 1750,         // ✅ 每 1.75 秒切換
    pauseOnHover: false,         // 滑鼠移上不暫停（可依需求調整）
  }

  return (
    <div className="flex flex-col items-center h-screen bg-yellow-50 px-4 py-6">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto flex-1 flex flex-col justify-center">
        {/* 按鈕區塊 - 移至圖片上方 */}
        <div className="mb-6 flex justify-center relative">
          <button
            onClick={() => navigate('/entry')}
            className="bg-yellow-400 text-white px-6 py-2 rounded-full shadow hover:bg-yellow-500 transition"
          >
            跳過 →
          </button>
        </div>
        <Slider {...settings}>
          <div>
            <img
              src="/images/intro/stone.jpg"
              alt="靜心穩固"
              className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto object-contain rounded-xl shadow-md mx-auto max-h-[50vh]"
            />
            <p className="mt-4 text-center text-sm" style={{color: '#999700'}}>自由拼組訂製你的課程</p>
          </div>
          <div>
            <img
              src="/images/intro/calendar.jpg"
              alt="練習日曆"
              className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto object-contain rounded-xl shadow-md mx-auto max-h-[50vh]"
            />
            <p className="mt-4 text-center text-sm" style={{color: '#999700'}}>完整紀錄你的練習日曆</p>
          </div>
          <div>
            <img
              src="/images/intro/touch.jpg"
              alt="線上連結"
              className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto object-contain rounded-xl shadow-md mx-auto max-h-[50vh]"
            />
            <p className="mt-4 text-center text-sm" style={{color: '#999700'}}>與老師和社群即時連結</p>
          </div>
        </Slider>
      </div>
    </div>
  )
}

export default Intro
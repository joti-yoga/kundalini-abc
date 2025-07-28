import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const images = ["/images/intro/stone.jpg", "/images/intro/calendar.jpg", "/images/intro/touch.jpg"];

export default function Intro() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/entry");
    }, 9000); // 預設瀏覽約 9 秒後跳轉
    return () => clearTimeout(timer);
  }, [navigate]);

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 600,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-4/5 max-w-md">
        <Slider {...settings}>
          {images.map((src, idx) => (
            <div key={idx}>
              <img src={src} alt={`slide-${idx}`} className="rounded-2xl shadow-xl" />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
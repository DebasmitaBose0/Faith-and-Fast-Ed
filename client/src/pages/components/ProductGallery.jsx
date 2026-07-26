import React, { useState } from 'react';
import Swiper from 'swiper';
import 'swiper/css';

export default function ProductGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(images?.[0] || '');
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        className="relative overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg cursor-zoom-in"
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <img 
          src={selectedImage} 
          alt="Product details" 
          className="w-full h-[400px] object-cover"
        />
        {showZoom && (
          <div 
            className="absolute inset-0 pointer-events-none bg-no-repeat bg-cover hidden md:block"
            style={{
              backgroundImage: `url(${selectedImage})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              transform: 'scale(1.5)'
            }}
          />
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {images?.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Thumbnail ${i}`}
            onClick={() => setSelectedImage(img)}
            className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${selectedImage === img ? 'border-yellow-400' : 'border-transparent'}`}
          />
        ))}
      </div>
    </div>
  );
}
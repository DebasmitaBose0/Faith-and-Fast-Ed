import { useCallback, useEffect, useState } from 'react';
import b1 from '../../assets/slider/1.png';
import b2 from '../../assets/slider/2.png';
import b3 from '../../assets/slider/3.png';
import b4 from '../../assets/slider/4.png';
import b5 from '../../assets/slider/5.png';
import { FaAngleRight, FaAngleLeft } from 'react-icons/fa6';
import { motion } from 'framer-motion';

const BannerProduct = () => {
  const [currentImage, setCurrentImage] = useState(0);

  const desktopImages = [b1, b2, b3, b4, b5];
  const mobileImages = [b1, b2, b3, b4, b5];

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % desktopImages.length);
  }, [desktopImages.length]);

  const prevImage = useCallback(() => {
    setCurrentImage(
      (prev) => (prev - 1 + desktopImages.length) % desktopImages.length
    );
  }, [desktopImages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextImage]);

  return (
    <div className="container mx-auto px-4 rounded mt-5">
      <div className="h-72 md:h-96 w-full bg-slate-200 relative rounded-lg overflow-hidden shadow-lg">
        <div className="absolute z-10 h-full w-full flex items-center justify-between px-2">
          <button
            onClick={prevImage}
            className="bg-white dark:bg-black text-black dark:text-white shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 p-4 rounded-full transition-all transform hover:scale-110 hover:shadow-2xl"
            aria-label="Previous Image"
          >
            <FaAngleLeft size={24} />
          </button>
          <button
            onClick={nextImage}
            className="bg-white dark:bg-black text-black dark:text-white shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 p-4 rounded-full transition-all transform hover:scale-110 hover:shadow-2xl"
            aria-label="Next Image"
          >
            <FaAngleRight size={24} />
          </button>
        </div>

        <div className="hidden md:flex h-full w-full overflow-hidden">
          {desktopImages.map((imageUrl, index) => (
            <motion.div
              className={`w-full h-full rounded-lg min-w-full min-h-full transition-all image-slide`}
              key={imageUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentImage === index ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: 'easeInOut',
              }}
              style={{ transform: `translateX(-${currentImage * 100}%)` }}
            >
              <img
                src={imageUrl}
                className="w-full h-full object-fit rounded-lg"
                alt={`Banner ${index + 1}`}
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>

        <div className="flex h-full w-full overflow-hidden md:hidden">
          {mobileImages.map((imageUrl, index) => (
            <motion.div
              className={`w-full h-full min-w-full min-h-full transition-all image-slide`}
              key={imageUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentImage === index ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: 'easeInOut',
              }}
              style={{ transform: `translateX(-${currentImage * 100}%)` }}
            >
              <img
                src={imageUrl}
                className="w-full h-full object-fit rounded-lg"
                alt={`Banner ${index + 1}`}
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerProduct;

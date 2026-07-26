import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LazyImage = ({ src, alt, className = '', skeletonClassName = '', objectFit = 'object-cover' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton loader while the image is loading or if it fails */}
      {(!isLoaded || hasError) && (
        <div
          className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse ${skeletonClassName}`}
        ></div>
      )}

      {/* Actual image */}
      {!hasError && (
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full h-full ${objectFit} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

export default LazyImage;

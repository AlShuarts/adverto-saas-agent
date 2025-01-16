import { useState, useEffect } from "react";
import { SlideShowImage } from "./SlideShowImage";

type SlideShowCompositionProps = {
  images: string[];
};

export const SlideShowComposition = ({ images }: SlideShowCompositionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Changed from 3000 to 5000 for slower transitions

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div style={{ flex: 1, backgroundColor: 'black', position: 'relative', width: '100%', height: '100%' }}>
      {images.map((image, index) => (
        <SlideShowImage
          key={index}
          src={image}
          index={index}
          currentIndex={currentIndex}
        />
      ))}
    </div>
  );
};
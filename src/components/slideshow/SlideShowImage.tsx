type SlideShowImageProps = {
  src: string;
  index: number;
  currentIndex: number;
  isPlaying: boolean;
};

export const SlideShowImage = ({ src, index, currentIndex, isPlaying }: SlideShowImageProps) => {
  return (
    <div
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        opacity: index === currentIndex ? 1 : 0,
        transition: 'opacity 1.5s ease-in-out',
        willChange: 'opacity',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      <img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          maxWidth: '100%',
          maxHeight: '100%',
          imageRendering: '-webkit-optimize-contrast',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          willChange: 'transform',
        }}
        className={isPlaying ? "animate-float" : ""}
        alt={`Slide ${index + 1}`}
        loading="eager"
        decoding="sync"
        onError={(e) => {
          console.error(`Error loading image ${index + 1}:`, src, e);
          e.currentTarget.style.display = 'none';
        }}
        onLoad={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.visibility = 'visible';
          console.log(`Image ${index + 1} loaded successfully:`, {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          });
        }}
      />
    </div>
  );
};
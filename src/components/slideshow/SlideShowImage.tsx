type SlideShowImageProps = {
  src: string;
  index: number;
  currentIndex: number;
};

export const SlideShowImage = ({ src, index, currentIndex }: SlideShowImageProps) => {
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
        backgroundColor: 'white',
        opacity: index === currentIndex ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
      }}
    >
      <img
        src={src}
        style={{
          maxWidth: '90%',
          maxHeight: '90%',
          objectFit: 'contain',
        }}
        alt={`Slide ${index + 1}`}
        onError={(e) => {
          console.error(`Error loading image ${index + 1}:`, src, e);
          e.currentTarget.style.display = 'none';
        }}
        onLoad={(e) => {
          console.log(`Image ${index + 1} loaded successfully:`, {
            naturalWidth: (e.target as HTMLImageElement).naturalWidth,
            naturalHeight: (e.target as HTMLImageElement).naturalHeight,
          });
        }}
      />
    </div>
  );
};
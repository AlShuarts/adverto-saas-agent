type SlideShowImageProps = {
  src: string;
  index: number;
  currentIndex: number;
  isPlaying: boolean;
};

export const SlideShowImage = ({ src, index, currentIndex, isPlaying }: SlideShowImageProps) => {
  // Convertir l'URL en haute qualité si c'est une URL Centris
  const getHighQualityUrl = (url: string) => {
    try {
      if (url.includes('centris.ca/media') || url.includes('media.ashx')) {
        const urlObj = new URL(url);
        const id = urlObj.searchParams.get('id');
        if (id && id.length === 32) {
          return `https://mspublic.centris.ca/media.ashx?id=${id}&t=pi&sm=h&w=1920&h=1080`;
        }
        
        const matches = url.match(/[A-F0-9]{32}/i);
        if (matches && matches[0]) {
          return `https://mspublic.centris.ca/media.ashx?id=${matches[0]}&t=pi&sm=h&w=1920&h=1080`;
        }
      }
      return url;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return url;
    }
  };

  const highQualityUrl = getHighQualityUrl(src);

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
        src={highQualityUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          maxWidth: '100%',
          maxHeight: '100%',
          imageRendering: 'high-quality',
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
          console.error(`Error loading image ${index + 1}:`, highQualityUrl, e);
          e.currentTarget.style.display = 'none';
        }}
        onLoad={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.visibility = 'visible';
          console.log(`Image ${index + 1} loaded successfully:`, {
            url: highQualityUrl,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          });
        }}
      />
    </div>
  );
};
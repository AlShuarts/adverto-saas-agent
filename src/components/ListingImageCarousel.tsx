import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ListingImageCarouselProps = {
  images: string[];
};

export const ListingImageCarousel = ({ images }: ListingImageCarouselProps) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">Aucune image</span>
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="aspect-video relative overflow-hidden">
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="object-cover w-full h-full"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
        <>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </>
      )}
    </Carousel>
  );
};
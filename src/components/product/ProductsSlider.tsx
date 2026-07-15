import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FeaturedProductsSliderProps {
  products: Product[];
}

export default function ProductsSlider({
  products,
}: FeaturedProductsSliderProps) {
  return (
    <div className="relative">
      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-4 pr-2 md:pl-6 md:pr-2 basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/3 2xl:basis-1/5"
            >
              <ProductCard product={product} size="sm" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
          <CarouselPrevious className="pointer-events-auto -left-7 md:-left-7" />
          <CarouselNext className="pointer-events-auto -right-7 md:-right-7" />
        </div>
      </Carousel>
    </div>
  );
}

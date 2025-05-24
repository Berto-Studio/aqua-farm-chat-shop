
import { useState } from "react";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

interface FeaturedProductsSliderProps {
  products: Product[];
}

export default function FeaturedProductsSlider({ products }: FeaturedProductsSliderProps) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">Top Rated Products</h2>
        <Badge variant="secondary">Rating 4.8+</Badge>
      </div>
      
      <div className="relative px-12">
        <Carousel className="w-full">
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <ProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <CarouselPrevious className="-left-6 bg-white shadow-lg border-2 hover:bg-gray-50" />
        <CarouselNext className="-right-6 bg-white shadow-lg border-2 hover:bg-gray-50" />
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useFeaturedProducts } from "@/hooks/useFeaturedProducts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  serviceIconMap,
  serviceTierKeys,
  type FarmService,
} from "@/lib/services";
import type { Product } from "@/types/product";
import { useFarmServices } from "@/hooks/useServices";
import CTA from "@/components/global/cta";

const HeroCarouselItems = [
  {
    title: "Premium Catfish",
    description:
      "High-quality catfish fingerlings and mature fish for your farm",
    image: "/catfishbg.webp",
    link: "/products?category=Fish",
    color: "from-shopBlack/80 to-shopBlack",
  },
  {
    title: "Healthy Tilapia",
    description: "Farm-raised tilapia for optimal growth and yield",
    image: "/tilapiabg.jpg",
    link: "/products?category=Fish",
    color: "from-shopBlack/80 to-shopBlack",
  },
];

const shuffleProducts = (products: Product[]) => {
  const shuffled = [...products];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

const getStartingPrice = (service: FarmService) =>
  Math.min(...serviceTierKeys.map((tier) => service.pricing[tier].price));

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const getProductImageSource = (product: Product) =>
  product.image_url ||
  (typeof product.image === "string" ? product.image : "") ||
  "/placeholder.svg";

const getProductHref = (product: Product) =>
  product.id !== undefined && product.id !== null
    ? `/products/${product.id}`
    : "/products";

const getDiscountedPrice = (product: Product) =>
  product.discount_percentage
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price;

const tankSetupProductsRoute = "/products?category=Farm%20Equipment";
const youtubeChannelUrl = "https://www.youtube.com/";

export default function Index() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: featuredProductsData = [], isLoading } = useFeaturedProducts({
    per_page: 10,
  });
  const {
    data: services = [],
    isLoading: isLoadingServices,
    error,
  } = useFarmServices();
  const servicesError =
    error instanceof Error
      ? error.message
      : error
        ? "Unable to load services"
        : null;
  const featuredProducts = useMemo(
    () => shuffleProducts(featuredProductsData).slice(0, 3),
    [featuredProductsData],
  );
  const showcasedServices = services.slice(0, 3);
  const spotlightProduct = featuredProducts[0];
  const supportingProducts = featuredProducts.slice(1);

  return (
    <div>
      {/* Hero Carousel */}
      <Carousel className="w-full">
        <CarouselContent>
          {HeroCarouselItems.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-70`}
                ></div>
                <div className="absolute inset-0 flex flex-col justify-center items-start p-16 md:p-26 lg:p-40 text-white max-w-3xl">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">
                    {item.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-6">{item.description}</p>
                  <Button asChild size="lg">
                    <Link to={item.link}>Shop Now</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>

      {/* Category Cards */}
      <section className="py-12 container">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/products?category=Fish" className="group">
            <Card className="overflow-hidden h-60 relative transition-transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <img
                src="/catfishbg.webp"
                alt="Catfish"
                className="w-full h-full object-cover"
              />
              <CardContent className="absolute inset-0 flex flex-col justify-center items-center text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Fish</h3>
                <p className="text-lg text-center">
                  Premium catfish and tilapia fingerlings and mature fish
                </p>
                <Button variant="secondary" className="mt-4">
                  View Products
                </Button>
              </CardContent>
            </Card>
          </Link>
          <Link to="/products?category=Live%20Stock" className="group">
            <Card className="overflow-hidden h-60 relative transition-transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-blue-900 opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <img
                src="/live-stock-bg.jpg"
                alt="Live Stock"
                className="w-full h-full object-cover"
              />
              <CardContent className="absolute inset-0 flex flex-col justify-center items-center text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Live Stock
                </h3>
                <p className="text-lg text-center">
                  High-quality meat for consumption
                </p>
                <Button variant="secondary" className="mt-4">
                  View Products
                </Button>
              </CardContent>
            </Card>
          </Link>
          {/* <Link to="/products?category=Vegetables" className="group">
            <Card className="overflow-hidden h-60 relative transition-transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/80 to-gray-500/80 opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <img
                src="/vegitables-fruits-bg.jpg"
                alt="vegetables and fruits"
                className="w-full h-full object-cover"
              />
              <CardContent className="absolute inset-0 flex flex-col justify-center items-center text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Vegetables
                </h3>
                <p className="text-lg text-center">
                  Nutritious vegetables available
                </p>
                <Button variant="secondary" className="mt-4">
                  View Products
                </Button>
              </CardContent>
            </Card>
          </Link> */}
          {/* <Link to="/products?category=Fruits" className="group">
            <Card className="overflow-hidden h-60 relative transition-transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-shopBlack/80 to-shopBlack opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <img
                src="/fruits.jpg"
                alt="fruits"
                className="w-full h-full object-cover"
              />
              <CardContent className="absolute inset-0 flex flex-col justify-center items-center text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Fruits</h3>
                <p className="text-lg text-center">Juicy fruits available</p>
                <Button variant="secondary" className="mt-4">
                  View Products
                </Button>
              </CardContent>
            </Card>
          </Link> */}
          <Link to="/products?category=Farm%20Equipment" className="group">
            <Card className="overflow-hidden h-60 relative transition-transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-700/80 to-amber-900 opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <img
                src="/waterpump.webp"
                alt="Farm equipment"
                className="w-full h-full object-cover"
              />
              <CardContent className="absolute inset-0 flex flex-col justify-center items-center text-white">
                <h3 className="text-2xl md:text-3xl font-bold text-center mb-2">
                  Farm Equipment
                </h3>
                <p className="text-lg text-center">Farm tools</p>
                <Button variant="secondary" className="mt-4">
                  View Products
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-black py-16 md:px-6">
        <div className="container">
          <div className="relative overflow-hidden py-8 text-white md:px-10 md:py-10">
            <div className="relative">
              <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                    Farm-fresh picks built to move fast.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 md:text-base">
                    A sharper spotlight on the products customers keep reaching
                    for, from healthy stock to practical farm essentials.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="rounded-full px-6"
                  >
                    <Link to="/products">View All Products</Link>
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                  <Skeleton className="h-[420px] rounded-[28px] bg-white/10" />
                  <div className="grid gap-6">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="h-[198px] rounded-[28px] bg-white/10"
                      />
                    ))}
                  </div>
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                  {spotlightProduct ? (
                    <Link
                      to={getProductHref(spotlightProduct)}
                      className="group relative isolate overflow-hidden rounded-[28px] border border-white/10"
                    >
                      <img
                        src={getProductImageSource(spotlightProduct)}
                        alt={spotlightProduct.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/50 to-black/95" />
                      <div className="relative flex h-full min-h-[420px] flex-col justify-between p-6 md:p-8">
                        <div className="flex flex-wrap gap-3">
                          <Badge className="border-0 bg-white text-black hover:bg-white">
                            Spotlight Product
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-white/20 bg-white/10 text-white"
                          >
                            {spotlightProduct.category}
                          </Badge>
                          {spotlightProduct.discount_percentage ? (
                            <Badge className="border-0 bg-amber-400 text-black hover:bg-amber-400">
                              Save {spotlightProduct.discount_percentage}%
                            </Badge>
                          ) : null}
                        </div>

                        <div className="max-w-xl">
                          <h3 className="text-2xl font-semibold leading-tight md:text-4xl">
                            {spotlightProduct.title}
                          </h3>
                          <p className="mt-4 max-w-lg text-sm leading-7 text-white/75 md:text-base line-clamp-3">
                            {spotlightProduct.description}
                          </p>
                        </div>

                        <div className="flex flex-col gap-5 border-t border-white/10 pt-5 md:flex-row md:items-end md:justify-between">
                          <div className="flex flex-wrap gap-3 text-sm text-white/75">
                            <span className="rounded-full bg-white/10 px-3 py-1.5">
                              Qty: {spotlightProduct.quantity}
                            </span>
                            <span className="rounded-full bg-white/10 px-3 py-1.5">
                              Unit: {spotlightProduct.weight_per_unit}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5">
                              <Star className="mr-1.5 h-4 w-4 fill-current text-amber-300" />
                              {spotlightProduct.rating?.toFixed(1) || "4.0"}
                            </span>
                          </div>

                          <div className="flex items-end justify-between gap-4 md:block">
                            <div>
                              {spotlightProduct.discount_percentage ? (
                                <p className="text-sm text-white/50 line-through">
                                  {formatCurrency(spotlightProduct.price)}
                                </p>
                              ) : null}
                              <p className="text-2xl font-semibold">
                                {formatCurrency(
                                  getDiscountedPrice(spotlightProduct),
                                )}
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
                              Explore product
                              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : null}

                  <div className="grid gap-6">
                    {supportingProducts.map((product, index) => (
                      <Link
                        key={String(product.id ?? product.title)}
                        to={getProductHref(product)}
                        className="group grid overflow-hidden rounded-[28px] border border-white/10 bg-white/95 text-black shadow-[0_20px_50px_-30px_rgba(0,0,0,0.65)] transition-transform duration-300 hover:-translate-y-1 md:grid-cols-[300px_1fr] xl:grid-cols-[200px_1fr]"
                      >
                        <div className="relative min-h-[180px] overflow-hidden">
                          <img
                            src={getProductImageSource(product)}
                            alt={product.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute left-4 top-4">
                            <Badge className="border-0 bg-black text-white hover:bg-black">
                              #{index + 2}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between p-5">
                          <div>
                            <div className="mb-3 flex flex-wrap gap-2">
                              <Badge
                                variant="outline"
                                className="border-black/15 bg-black/5"
                              >
                                {product.category}
                              </Badge>
                              {product.discount_percentage ? (
                                <Badge className="border-0 bg-amber-100 text-amber-900 hover:bg-amber-100">
                                  -{product.discount_percentage}% off
                                </Badge>
                              ) : null}
                            </div>
                            <h3 className="text-xl font-semibold">
                              {product.title}
                            </h3>
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-black/70">
                              {product.description}
                            </p>
                          </div>

                          <div className="mt-5 flex items-end justify-between gap-4">
                            <div>
                              {product.discount_percentage ? (
                                <p className="text-sm text-black/40 line-through">
                                  {formatCurrency(product.price)}
                                </p>
                              ) : null}
                              <p className="text-xl font-semibold">
                                {formatCurrency(getDiscountedPrice(product))}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="inline-flex items-center text-sm font-medium text-black/75">
                                <Star className="mr-1.5 h-4 w-4 fill-current text-amber-500" />
                                {product.rating?.toFixed(1) || "4.0"}
                              </p>
                              <p className="mt-1 text-sm font-medium text-black">
                                View details
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-12 text-center">
                  <p className="text-white/80">
                    No featured products available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 container">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Professional Services
        </h2>
        {isLoadingServices ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="space-y-4 pt-6">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-1/2 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
                  <Skeleton className="h-5 w-1/3 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : servicesError ? (
          <div className="mb-8 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {servicesError}
          </div>
        ) : showcasedServices.length === 0 ? (
          <div className="mb-8 rounded-lg border bg-card p-10 text-center text-muted-foreground">
            No services are available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {showcasedServices.map((service) => {
              const IconComponent = serviceIconMap[service.icon];

              return (
                <Card
                  key={String(service.id ?? service.title)}
                  className="text-center"
                >
                  <CardContent className="flex h-full flex-col pt-6">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 flex-1">
                      {service.description}
                    </p>
                    <Button asChild variant="outline" className="mx-auto mt-4">
                      <Link to="/services">View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <Button asChild size="lg">
            <Link to="/services">View All Services</Link>
          </Button>
        </div>
      </section>

      {/* Tank Setup Section */}
      <section className="py-6 md:py-10">
        <div className="grid overflow-hidden bg-[#eef7f2]  lg:min-h-[700px] lg:max-h-[700px] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[260px] sm:min-h-[320px] lg:min-h-full">
            <img
              src="/waterpump.webp"
              alt="Tank setup equipment and water flow system"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#052724]/80 via-[#052724]/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-6 sm:rounded-3xl sm:p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/75">
                Tank Setup Essentials
              </p>
              <p className="mt-2 text-lg font-semibold leading-snug sm:text-xl md:text-2xl">
                Start with reliable pumps, flow support, and farm equipment.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-5 sm:p-8 md:p-10 lg:p-12">
            <Badge className="w-fit border-0 bg-[#0d5c54] text-white hover:bg-[#0d5c54]">
              Tank Setup
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#062b28] sm:text-3xl md:text-4xl">
              Build a cleaner, smarter tank setup.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#062b28]/75 sm:text-base sm:leading-7">
              Browse our farm equipment collection for the gear that supports
              tank installation, water movement, and everyday aquaculture
              maintenance.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-[#062b28]">
                  Water flow support
                </p>
                <p className="mt-1 text-sm text-[#062b28]/65">
                  Equipment for circulation, pumping, and daily upkeep.
                </p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-[#062b28]">
                  Tank-ready essentials
                </p>
                <p className="mt-1 text-sm text-[#062b28]/65">
                  Explore the tools used around practical fish tank setups.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-[#062b28] px-6 text-white hover:bg-[#041f1d] sm:w-auto"
              >
                <Link to={tankSetupProductsRoute}>
                  View Tank Setup Products
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-full border-[#062b28]/20 bg-white text-[#062b28] hover:bg-white sm:w-auto"
              >
                <Link to="/products?category=Farm%20Equipment">
                  Browse Farm Equipment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Section */}
      {/* <section className="container pb-12 pt-2">
        <div className="relative overflow-hidden rounded-[32px] bg-[#111111] px-8 py-10 text-white shadow-[0_24px_70px_-40px_rgba(0,0,0,0.75)] md:px-10 md:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.28),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.14),_transparent_22%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <Badge className="border-0 bg-red-600 text-white hover:bg-red-600">
                YouTube Community
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Join our YouTube channel for fish farming tips and updates.
              </h2>
              <p className="mt-4 text-base leading-7 text-white/70">
                Watch setup ideas, farm progress, practical aquaculture advice,
                and product highlights that help new and growing farmers learn
                faster.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/70">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Tank setup guidance
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Product walkthroughs
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Weekly farm updates
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm">
                <p className="text-sm uppercase tracking-[0.22em] text-white/50">
                  Stay Connected
                </p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-white/75">
                  Subscribe to keep up with new lessons, practical demos, and
                  equipment-focused content from the farm.
                </p>
              </div>

              <Button
                asChild
                size="lg"
                className="rounded-full bg-red-600 px-6 text-white hover:bg-red-700"
              >
                <a href={youtubeChannelUrl} target="_blank" rel="noreferrer">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Join Our YouTube Channel
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section> */}

      {/* Benefits Section */}
      <section className="py-12 container">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Why Choose FishFarm?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                Premium Quality
              </h3>
              <p className="text-muted-foreground text-center">
                Our fish are farm-raised in controlled environments to ensure
                the highest quality and health standards.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                Fast Delivery
              </h3>
              <p className="text-muted-foreground text-center">
                We ensure quick and safe delivery to maintain the health and
                vitality of your fish.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                Expert Support
              </h3>
              <p className="text-muted-foreground text-center">
                Our team of experts is always available to provide advice and
                support for your farming needs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-secondary">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "How are the fish delivered?",
                answer:
                  "Our fish are carefully packaged in oxygenated bags with water and shipped in insulated containers to maintain proper temperature during transit. We use expedited shipping to ensure they arrive in excellent condition.",
              },
              {
                question:
                  "What's the difference between young and mature fish?",
                answer:
                  "Young fish (fingerlings) are smaller and still growing, ideal for stocking ponds or tanks for further growth. Mature fish are fully grown and ready for immediate harvest or breeding purposes.",
              },
              {
                question: "Do you provide guidance for new fish farmers?",
                answer:
                  "Yes! We offer comprehensive guides for new farmers, and our customer support team includes aquaculture experts who can provide advice on setup, feeding, and maintenance of your fish stock.",
              },
              {
                question: "What is your return policy?",
                answer:
                  "Due to the live nature of our products, we cannot accept returns. However, we do offer a guarantee on arrival condition. If your fish arrive in poor health, contact us immediately with photos for potential replacement or refund.",
              },
            ].map((faq, index) => (
              <Card key={index} className="transition-all duration-200">
                <CardContent className="p-4">
                  <button
                    onClick={() =>
                      setExpanded(
                        expanded === `faq-${index}` ? null : `faq-${index}`,
                      )
                    }
                    className="flex justify-between items-center w-full text-left font-medium"
                  >
                    <span>{faq.question}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform ${
                        expanded === `faq-${index}` ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {expanded === `faq-${index}` && (
                    <div className="mt-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTA
        title="Ready to Start Your Fish Farm?"
        description="Get premium quality catfish and tilapia for your farming needs."
        primaryText="Shop Now"
        primaryLink="/products"
        secondaryText="Contact Us"
        secondaryLink="/contact"
      />
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import FeaturedProductsSlider from "@/components/product/FeaturedProductsSlider";
import { getFeaturedProducts } from "@/data/products";

const HeroCarouselItems = [
  {
    title: "Premium Catfish",
    description:
      "High-quality catfish fingerlings and mature fish for your farm",
    image: "/catfishbg.webp",
    link: "/products/catfish",
    color: "from-shopBlack/80 to-shopBlack",
  },
  {
    title: "Healthy Tilapia",
    description: "Farm-raised tilapia for optimal growth and yield",
    image: "/tilapiabg.jpg",
    link: "/products/tilapia",
    color: "from-shopBlack/80 to-shopBlack",
  },
];

export default function Index() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const featuredProducts = getFeaturedProducts();

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/products/catfish" className="group">
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
          <Link to="/products/catfish" className="group">
            <Card className="overflow-hidden h-60 relative transition-transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-blue-900 opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <img
                src="/live-stock-bg.jpg"
                alt="Fish"
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
          <Link to="/products/tilapia" className="group">
            <Card className="overflow-hidden h-60 relative transition-transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-shopBlack/80 to-shopBlack opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <img
                src="/vegitables-fruits-bg.jpg"
                alt="vegitables and fruits"
                className="w-full h-full object-cover"
              />
              <CardContent className="absolute inset-0 flex flex-col justify-center items-center text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Vegitables & Fruits
                </h3>
                <p className="text-lg text-center">
                  Nutritious Vegitables and fruits available
                </p>
                <Button variant="secondary" className="mt-4">
                  View Products
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-secondary md:px-10">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Featured Products
          </h2>
          <FeaturedProductsSlider products={featuredProducts} />
          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <Link to="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 container">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Professional Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Farm Consultation</h3>
              <p className="text-muted-foreground mb-4">
                Expert guidance for setting up and optimizing your fish farm
                operations with professional assessment and ongoing support.
              </p>
              <p className="font-bold text-primary">Starting at $299</p>
            </CardContent>
          </Card>

          <Card className="text-center">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Hatchery Operations
              </h3>
              <p className="text-muted-foreground mb-4">
                Complete hatchery setup and management services for sustainable
                fish production with equipment and training.
              </p>
              <p className="font-bold text-primary">Starting at $1,999</p>
            </CardContent>
          </Card>

          <Card className="text-center">
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
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Training Programs</h3>
              <p className="text-muted-foreground mb-4">
                Hands-on training programs to master catfish fingerling
                production with certification and ongoing support.
              </p>
              <p className="font-bold text-primary">Starting at $599</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button asChild size="lg">
            <Link to="/services">View All Services</Link>
          </Button>
        </div>
      </section>

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
                        expanded === `faq-${index}` ? null : `faq-${index}`
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

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="container">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Ready to Start Your Fish Farm?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Get premium quality catfish and tilapia for your farming needs. We
            provide expert advice and ongoing support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/products">Shop Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

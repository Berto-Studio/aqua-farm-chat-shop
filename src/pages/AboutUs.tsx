
import { Card, CardContent } from "@/components/ui/card";
import { Fish, Truck, GraduationCap, Users } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About FishFarm</h1>
          <p className="text-xl text-muted-foreground">
            Sustainable aquaculture solutions for a better tomorrow
          </p>
        </div>

        <div className="mb-16">
          <div className="aspect-video overflow-hidden rounded-lg mb-8">
            <img 
              src="https://images.unsplash.com/photo-1628863353691-0051c2d0cffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
              alt="FishFarm facility" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="mb-4">
              Founded in 2015, FishFarm was born out of a passion for sustainable aquaculture and a vision to revolutionize the industry. What started as a small family operation has grown into one of the region's leading suppliers of high-quality catfish and tilapia fingerlings and adults.
            </p>
            <p className="mb-4">
              Our journey began when our founder, Michael Rivers, a marine biologist with over 15 years of experience, identified a gap in the market for ethically raised, healthy fish stock. With an initial investment and a small team of dedicated experts, we established our first hatchery with a focus on quality over quantity.
            </p>
            <p>
              Today, FishFarm spans over 50 acres of land with state-of-the-art facilities, producing millions of fingerlings annually while maintaining our commitment to sustainability, quality, and customer satisfaction.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              At FishFarm, our mission is to provide sustainable, high-quality fish stock to farmers while employing environmentally responsible practices. We are committed to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Producing healthy, disease-resistant fish</li>
              <li>Minimizing our environmental footprint</li>
              <li>Supporting local communities through employment and education</li>
              <li>Advancing aquaculture technology through continuous research</li>
              <li>Providing exceptional service to our customers</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-700 mb-4">
              We envision a future where sustainable aquaculture plays a vital role in global food security. Our vision includes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Becoming the industry leader in fish breeding technology</li>
              <li>Expanding our operations while maintaining our environmental standards</li>
              <li>Developing new, more efficient farming methods</li>
              <li>Educating the next generation of aquaculture professionals</li>
              <li>Creating a network of sustainable fish farms across the country</li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-primary/10 p-4 rounded-full inline-flex items-center justify-center mb-4">
                  <Fish className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Quality Assurance</h3>
                <p className="text-muted-foreground">
                  Rigorous testing and selection for healthy, robust fish stock.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-primary/10 p-4 rounded-full inline-flex items-center justify-center mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Reliable Delivery</h3>
                <p className="text-muted-foreground">
                  Specialized transport systems to ensure fish arrive in optimal condition.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-primary/10 p-4 rounded-full inline-flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Expert Support</h3>
                <p className="text-muted-foreground">
                  Ongoing technical assistance from our team of aquaculture specialists.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-primary/10 p-4 rounded-full inline-flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Community Focus</h3>
                <p className="text-muted-foreground">
                  Supporting local economies and sustainable farming practices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: "Michael Rivers", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
              { name: "Dr. Sarah Chen", role: "Research Director", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
              { name: "David Rodriguez", role: "Operations Manager", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
              { name: "Lisa Okonkwo", role: "Aquaculture Specialist", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="mb-3 aspect-square overflow-hidden rounded-full mx-auto w-32 h-32">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Contact Us</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Get In Touch</h3>
                  <div className="space-y-4">
                    <p><strong>Address:</strong> 123 Aqua Lane, Fishville, FL 12345</p>
                    <p><strong>Phone:</strong> (555) 123-4567</p>
                    <p><strong>Email:</strong> info@fishfarm.com</p>
                    <p><strong>Hours:</strong> Monday to Friday, 8am to 5pm</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4">Location</h3>
                  <div className="bg-muted h-52 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Map integration would be here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

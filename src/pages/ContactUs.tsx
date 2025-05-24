import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";

export default function ContactUs() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description:
        "Thank you for your message. We will get back to you shortly!",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
    setOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions or need assistance? Reach out to our friendly team and
          we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Our Location</h3>
          <p className="text-muted-foreground">
            123 Farmway Drive
            <br />
            Lagos, Nigeria
          </p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Phone className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Phone</h3>
          <p className="text-muted-foreground">
            +234 123 456 7890
            <br />
            +234 987 654 3210
          </p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Email</h3>
          <p className="text-muted-foreground">
            info@fishfarm.com
            <br />
            support@fishfarm.com
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="mb-6 text-muted-foreground">
            We'd love to hear from you! Whether you have a question about our
            products, need advice on fish farming, or want to place a bulk
            order, our team is ready to help.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold">Business Hours</h4>
                <p className="text-muted-foreground">
                  Monday - Friday: 8am - 6pm
                </p>
                <p className="text-muted-foreground">Saturday: 9am - 4pm</p>
                <p className="text-muted-foreground">Sunday: Closed</p>
              </div>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Send a Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Send us a message</DialogTitle>
                <DialogDescription>
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this regarding?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message here..."
                      rows={4}
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit">Send Message</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg overflow-hidden h-[400px] shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.7890423757426!2d3.379206375772833!3d6.5437706930378515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8cf3fae871f1%3A0x33fc1ca3c387acc2!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1684318269400!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Fish Farm Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

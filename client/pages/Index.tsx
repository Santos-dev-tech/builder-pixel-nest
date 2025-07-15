import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Camera,
  Heart,
  Award,
  Users,
  Calendar,
  ChevronDown,
} from "lucide-react";

export default function Index() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&h=600&fit=crop",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const services = [
    {
      title: "Portrait Photography",
      description: "Beautiful, timeless portraits that capture your essence",
      price: "Starting at $150",
      icon: <Camera className="h-6 w-6" />,
    },
    {
      title: "Event Photography",
      description: "Weddings, parties, and special moments preserved forever",
      price: "Starting at $500",
      icon: <Heart className="h-6 w-6" />,
    },
    {
      title: "Commercial Shoots",
      description: "Professional photography for your business needs",
      price: "Starting at $300",
      icon: <Award className="h-6 w-6" />,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Bride",
      text: "Carly captured our wedding day perfectly. Every photo tells our love story beautifully.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Business Owner",
      text: "Professional, creative, and delivered exactly what we needed for our brand.",
      rating: 5,
    },
    {
      name: "Emily Davis",
      role: "Family Client",
      text: "Amazing experience! Carly made us feel comfortable and the photos are stunning.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-rose-600" />
              <span className="ml-2 text-xl font-bold text-slate-800">
                Carly
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a
                href="#home"
                className="text-slate-700 hover:text-rose-600 transition-colors"
              >
                Home
              </a>
              <a
                href="#about"
                className="text-slate-700 hover:text-rose-600 transition-colors"
              >
                About
              </a>
              <a
                href="#services"
                className="text-slate-700 hover:text-rose-600 transition-colors"
              >
                Services
              </a>
              <a
                href="#portfolio"
                className="text-slate-700 hover:text-rose-600 transition-colors"
              >
                Portfolio
              </a>
              <a
                href="#contact"
                className="text-slate-700 hover:text-rose-600 transition-colors"
              >
                Contact
              </a>
            </div>
            <Button className="bg-rose-600 hover:bg-rose-700">Book Now</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroImages[currentImageIndex]}
            alt="Photography"
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Capturing Life's
            <span className="text-rose-400 block">Beautiful Moments</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Professional photographer specializing in portraits, events, and
            commercial photography. Let's create something beautiful together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
              View Portfolio
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-slate-800"
            >
              Get In Touch
            </Button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <ChevronDown className="h-6 w-6" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                Hi, I'm Carly
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                With over 8 years of experience in photography, I specialize in
                capturing authentic moments that tell your unique story. My
                passion lies in creating timeless images that you'll treasure
                forever.
              </p>
              <p className="text-lg text-slate-600 mb-8">
                Whether it's your wedding day, a family portrait, or commercial
                project, I bring creativity, professionalism, and a keen eye for
                detail to every shoot.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600 mb-2">
                    500+
                  </div>
                  <div className="text-sm text-slate-600">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600 mb-2">
                    200+
                  </div>
                  <div className="text-sm text-slate-600">Events Captured</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600 mb-2">8</div>
                  <div className="text-sm text-slate-600">Years Experience</div>
                </div>
              </div>
              <Button className="bg-rose-600 hover:bg-rose-700">
                Learn More About Me
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=600&h=700&fit=crop"
                alt="Carly"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">5.0 Rating</span>
                </div>
                <p className="text-sm text-slate-600">Based on 150+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              My Services
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Professional photography services tailored to capture your most
              important moments with style and creativity.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="text-rose-600">{service.icon}</div>
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{service.description}</p>
                  <Badge variant="secondary" className="mb-4">
                    {service.price}
                  </Badge>
                  <Button className="w-full bg-rose-600 hover:bg-rose-700">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section id="portfolio" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Recent Work
            </h2>
            <p className="text-lg text-slate-600">
              A glimpse into some of my favorite captures
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=400&fit=crop",
            ].map((src, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-lg aspect-square"
              >
                <img
                  src={src}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="ghost" className="text-white">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
              View Full Portfolio
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              What Clients Say
            </h2>
            <p className="text-lg text-slate-600">
              Don't just take my word for it
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold text-slate-800">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Let's Create Something Beautiful
            </h2>
            <p className="text-lg text-slate-300">
              Ready to capture your special moments? Get in touch!
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-8">Get In Touch</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-rose-400" />
                  <div>
                    <div className="font-semibold">Studio Location</div>
                    <div className="text-slate-300">
                      123 Photography Lane, Creative District
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-rose-400" />
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div className="text-slate-300">(555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-rose-400" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-slate-300">hello@carlyphoto.com</div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <div className="font-semibold mb-4">Follow Me</div>
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-rose-400"
                  >
                    <Instagram className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-rose-400"
                  >
                    <Facebook className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-rose-400"
                  >
                    <Twitter className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-slate-700 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-6">Send a Message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="bg-slate-600 border border-slate-500 rounded-md px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="bg-slate-600 border border-slate-500 rounded-md px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-slate-600 border border-slate-500 rounded-md px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <textarea
                  placeholder="Tell me about your project..."
                  rows={4}
                  className="w-full bg-slate-600 border border-slate-500 rounded-md px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                ></textarea>
                <Button className="w-full bg-rose-600 hover:bg-rose-700">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Camera className="h-6 w-6 text-rose-400" />
              <span className="ml-2 text-lg font-semibold">Carly</span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2024 Carly Photography. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

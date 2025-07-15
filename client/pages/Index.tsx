import { useEffect, useState } from "react";
import {
  ProductService,
  CartService,
  type Product,
} from "@/lib/productService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Search,
  Menu,
  Heart,
  Star,
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  User,
  Shirt,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
    updateCartCount();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [featured, all] = await Promise.all([
        ProductService.getFeaturedProducts(),
        ProductService.getAllProducts(),
      ]);
      setFeaturedProducts(featured);
      setAllProducts(all);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartCount = () => {
    setCartItemsCount(CartService.getCartItemsCount());
  };

  const addToCart = (
    product: Product,
    size: string = "M",
    color: string = "Black",
  ) => {
    CartService.addToCart({
      productId: product.id!,
      product,
      size,
      color,
      quantity: 1,
    });
    updateCartCount();
  };

  const categories = ProductService.getCategories();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <Shirt className="h-8 w-8 text-orange-500" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                StyleCo
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="nav-link">
                Home
              </a>
              <a href="#products" className="nav-link">
                Shop
              </a>
              <a href="#categories" className="nav-link">
                Categories
              </a>
              <a href="#about" className="nav-link">
                About
              </a>
              <a href="#contact" className="nav-link">
                Contact
              </a>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ml-2 bg-transparent outline-none text-sm"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>
              <Link to="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartItemsCount}
                  </Badge>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop"
            alt="Fashion"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto container-padding">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 fade-in-up">
              Discover Your
              <span className="text-gradient block">Perfect Style</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 fade-in-up">
              Shop the latest fashion trends with our curated collection of
              premium clothing for every occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 fade-in-up">
              <Button size="lg" className="btn-primary">
                Shop Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                View Lookbook
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid md:grid-cols-3 gap-8 stagger-animation">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free delivery on orders over $50</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Your payment information is safe</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our diverse range of clothing categories to find exactly
              what you're looking for.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <div key={category} className="text-center group cursor-pointer">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-100 transition-colors">
                  <Shirt className="h-8 w-8 text-gray-600 group-hover:text-orange-500" />
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-orange-500 transition-colors">
                  {category}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Discover our hand-picked selection of trending items
            </p>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-card animate-pulse">
                  <div className="aspect-product bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="product-card group">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="product-image"
                    />
                    {product.salePrice && (
                      <Badge className="badge-sale">Sale</Badge>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        className="bg-white text-gray-900 hover:bg-gray-100"
                        onClick={() => addToCart(product)}
                      >
                        Quick Add
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {product.salePrice ? (
                          <>
                            <span className="font-bold text-orange-500">
                              ${product.salePrice}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ${product.price}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-900">
                            ${product.price}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.8</span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4 btn-primary"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="btn-outline">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay in Style</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new
            arrivals, sales, and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
            <Button className="btn-secondary">Subscribe</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shirt className="h-8 w-8 text-orange-500" />
                <span className="ml-2 text-xl font-bold">StyleCo</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your destination for premium fashion and style.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Best Sellers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sale
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Gift Cards
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Customer Care</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StyleCo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

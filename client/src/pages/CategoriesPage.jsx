import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Cpu, Shirt, Headphones, Watch, Gem, Home } from "lucide-react";
import { Button } from "../components/ui/button";

const categories = [
  {
    name: "Electronics",
    description: "Supercomputing rigs, performance laptops, premium smartphones, and neural processing units.",
    productCount: 42,
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
    icon: Cpu,
  },
  {
    name: "Fashion",
    description: "Cyberpunk street style, structural outerwear, premium performance techwear, and high-traction sneakers.",
    productCount: 56,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
    icon: Shirt,
  },
  {
    name: "Audio",
    description: "Neural active noise-cancelling headphones, high-resolution monitors, and intelligent studio microphones.",
    productCount: 38,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    icon: Headphones,
  },
  {
    name: "Wearables",
    description: "Intelligent biometric rings, high-fidelity fitness smartwatches, and augmented vision glasses.",
    productCount: 24,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80",
    icon: Watch,
  },
  {
    name: "Accessories",
    description: "Premium leather goods, high-durability backpacks, modular cases, and high-security ledger vaults.",
    productCount: 32,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    icon: Gem,
  },
  {
    name: "Furniture & Home",
    description: "Ergonomic command consoles, motorized sit-stand desks, premium orthopedic task chairs, and smart light bars.",
    productCount: 28,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    icon: Home,
  },
];

const CategoriesPage = () => {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="pt-6 sm:pt-10 pb-16 bg-[#000000]"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#e1dcc9] bg-[#1f150c] border border-[#412d15] px-4 py-1.5 rounded-full mb-4 font-oswald shadow-glow-bronze">
            Browse Categories
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-wider text-white mb-3 font-anton uppercase">
            Shop by <span className="text-[#e1dcc9]">Category</span>
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm leading-relaxed">
            Explore curated collections across every category — find exactly
            what you need on VendorHub.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, idx) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <Link
                to={`/explore?category=${encodeURIComponent(category.name)}`}
                className="group block"
              >
                <div
                  onMouseMove={handleMouseMove}
                  className="relative bg-[#1f150c] border border-[#412d15]/80 rounded-[28px] overflow-hidden shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-300 spotlight-card"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f150c] via-[#1f150c]/20 to-transparent" />

                    <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-[#e1dcc9] border border-white/10 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md z-10">
                      {category.productCount} drops
                    </span>

                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <h3 className="text-2xl font-black text-white mb-1 font-anton uppercase tracking-wider">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 relative z-10 bg-[#1f150c]">
                    <p className="text-xs text-white/60 leading-relaxed font-light line-clamp-2 mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center text-xs font-bold text-[#e1dcc9] uppercase tracking-widest font-oswald group-hover:gap-2 transition-all duration-200">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center mt-14"
        >
          <Link to="/explore">
            <Button variant="outline" size="lg" className="rounded-full px-8 border-[#412d15] text-[#e1dcc9] hover:bg-[#e1dcc9] hover:text-black hover:border-[#e1dcc9] transition-all duration-300 font-bold uppercase tracking-widest text-xs font-oswald">
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CategoriesPage;

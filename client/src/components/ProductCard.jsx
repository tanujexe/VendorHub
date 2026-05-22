import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { updateWishlist } from "../redux/slices/authSlice";
import api from "../services/api";
import { Button } from "./ui/button";

const fallbackImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80";

const getImageUrl = (image) => {
  if (!image) return fallbackImage;
  if (typeof image === "string") return image;
  return image.url || fallbackImage;
};

const normalizeProduct = (product = {}) => {
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || product.discountedPrice || 0);
  const category = product.category?.name || product.category || product.subcategory || "VendorHub";

  return {
    ...product,
    _id: product._id || product.id || "preview",
    title: product.title || product.name || "Premium Product",
    description: product.description || "A premium VendorHub drop crafted with cinematic detail.",
    price,
    originalPrice: originalPrice > price ? originalPrice : 0,
    rating: Number(product.averageRating || product.rating || 4.8),
    numReviews: Number(product.numReviews || product.reviews?.length || 0),
    category,
    image: getImageUrl(product.images?.[0]),
  };
};

const ProductCard = ({ product, index = 0 }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const item = useMemo(() => normalizeProduct(product), [product]);
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  useEffect(() => {
    const wishlistIds = new Set(
      (user?.wishlist || []).map((entry) =>
        typeof entry === "string" ? entry : entry?._id?.toString()
      )
    );
    setIsWishlisted(wishlistIds.has(item._id?.toString()));
  }, [user, item._id]);

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(addToCart({ ...item, name: item.title, quantity: 1 }));
  };

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      return navigate("/login");
    }

    try {
      setLoading(true);
      const response = await api.post(`/auth/wishlist/${item._id}`);
      const wishlist = response.data?.data?.wishlist || [];
      const wishlistIds = new Set(
        (wishlist || []).map((entry) =>
          typeof entry === "string" ? entry : entry?._id?.toString()
        )
      );
      const isSaved = wishlistIds.has(item._id?.toString());
      setIsWishlisted(isSaved);
      dispatch(updateWishlist(wishlist));
      localStorage.setItem("user", JSON.stringify({ ...user, wishlist }));
    } catch (error) {
      console.error("Wishlist update failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.045, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link to={`/product/${item._id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl border border-[#412d15]/70 bg-[#1f150c]/42 shadow-premium transition duration-500 hover:-translate-y-1 hover:border-[#e1dcc9]/25 hover:shadow-premium-hover md:rounded-[28px]">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#1f150c] md:aspect-[4/5] md:rounded-t-[28px]">
            {!imageLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.045] ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/24 to-transparent opacity-90 md:opacity-70" />

            <div className="absolute left-3 top-3 z-10 flex gap-2">
              <span className="rounded-full border border-[#e1dcc9]/25 bg-black/62 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#e1dcc9] backdrop-blur-md">
                New
              </span>
              {discount > 0 && (
                <span className="rounded-full border border-[#e1dcc9]/25 bg-[#412d15]/78 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#e1dcc9] backdrop-blur-md">
                  Sale
                </span>
              )}
            </div>

            <button
              onClick={handleWishlist}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-[#e1dcc9]/12 bg-black/58 text-[#e1dcc9]/75 backdrop-blur-md transition hover:border-[#e1dcc9]/35 hover:text-[#e1dcc9] active:scale-95"
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-[#e1dcc9] text-[#e1dcc9]" : ""}`} />
            </button>

            <div className="absolute inset-x-0 bottom-0 z-10 p-3 md:hidden">
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.22em] text-[#e1dcc9]/58">
                {item.category}
              </p>
              <h3 className="line-clamp-2 text-sm font-black uppercase leading-tight tracking-[0.06em] text-[#e1dcc9]">
                {item.title}
              </h3>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="text-sm font-black text-[#e1dcc9]">${item.price.toFixed(2)}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#e1dcc9]/72">
                  <Star className="h-3 w-3 fill-[#e1dcc9] text-[#e1dcc9]" />
                  {item.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 hidden translate-y-3 p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="premium"
                  className="flex-1 rounded-full py-4 text-[10px] font-black uppercase tracking-[0.18em]"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 rounded-full border-[#e1dcc9]/15 bg-black/75 p-0 text-[#e1dcc9] hover:bg-[#e1dcc9] hover:text-black"
                  aria-label="Quick view"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden p-5 md:block">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#e1dcc9]/55">
              {item.category}
            </p>
            <h3 className="mt-2 line-clamp-1 text-xl font-black uppercase leading-tight tracking-[0.08em] text-[#e1dcc9] transition group-hover:text-white">
              {item.title}
            </h3>
            <p className="mt-2 min-h-[38px] line-clamp-2 text-xs leading-relaxed text-[#e1dcc9]/58">
              {item.description}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-[#412d15]/55 pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-black text-[#e1dcc9]">${item.price.toFixed(2)}</span>
                {item.originalPrice > 0 && (
                  <span className="text-xs text-[#e1dcc9]/38 line-through">
                    ${item.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-[#e1dcc9]/78">
                <Star className="h-3.5 w-3.5 fill-[#e1dcc9] text-[#e1dcc9]" />
                {item.rating.toFixed(1)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full rounded-full border-[#412d15] text-[10px] font-black uppercase tracking-[0.2em] text-[#e1dcc9] hover:border-[#e1dcc9] hover:bg-[#e1dcc9] hover:text-black"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default ProductCard;

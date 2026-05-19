import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Minus, Plus, ShoppingBag, Star, ChevronLeft, ChevronRight, Maximize2, XCircle } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import products from "../../data/products";

function ProductModal({ product, onClose, onProductClick }) {
  const { addToCart } = useCartStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { t, i18n } = useTranslation();

  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [selectedFullImage, setSelectedFullImage] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  
  const timeoutRef = useRef(null);

  if (!product) return null;

  const isInWishlist = wishlist.some((item) => item.id === product.id);
  const productName = product.nomi?.[i18n.language] || product.nomi?.uz || product.nomi;
  const productDesc = product.desc?.[i18n.language] || product.desc?.uz || product.desc;
  const productSpecs = product.specs?.[i18n.language] || product.specs?.uz || [];

  const allImages = [product.img, ...(product.imgs || [])].filter(Boolean);
  const hasMultipleImages = allImages.length > 1;

  const related = products.filter((p) => p.brand === product.brand && p.id !== product.id).slice(0, 4);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const openFullscreen = (img) => {
    setSelectedFullImage(img);
    setIsFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
    setSelectedFullImage(null);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsHovering(false), 100);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast.success(`${quantity} ${t("added_to_cart")}`);
    setQuantity(1);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-6xl rounded-3xl overflow-hidden max-h-[95vh] overflow-y-auto shadow-2xl"
          >
            <div className="relative p-6 md:p-8">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-30 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-100 shadow-md transition-all"
              >
                <X size={22} />
              </motion.button>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div 
                    className="relative bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl h-80 md:h-[450px] overflow-hidden"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div 
                      className="w-full h-full cursor-pointer"
                      onClick={() => openFullscreen(allImages[currentImageIndex])}
                    >
                      <motion.img
                        key={currentImageIndex}
                        src={allImages[currentImageIndex]}
                        alt={productName}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openFullscreen(allImages[currentImageIndex])}
                      className="absolute bottom-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-md transition-all"
                    >
                      <Maximize2 size={18} />
                    </motion.button>
                    
                    {hasMultipleImages && (
                      <>
                        <motion.button
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: isHovering ? 1 : 0, x: isHovering ? 0 : -20 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-md transition-all"
                        >
                          <ChevronLeft size={20} />
                        </motion.button>
                        <motion.button
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: isHovering ? 1 : 0, x: isHovering ? 0 : 20 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-md transition-all"
                        >
                          <ChevronRight size={20} />
                        </motion.button>
                      </>
                    )}
                    
                    {hasMultipleImages && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full"
                      >
                        {currentImageIndex + 1} / {allImages.length}
                      </motion.div>
                    )}
                  </div>

                  {hasMultipleImages && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide justify-center"
                    >
                      {allImages.map((img, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                            currentImageIndex === idx
                              ? "border-blue-600 shadow-lg scale-105"
                              : "border-transparent hover:border-slate-300"
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", damping: 25, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="text-blue-600 text-sm font-bold bg-blue-100 px-3 py-1 rounded-full"
                    >
                      {product.brand?.toUpperCase()}
                    </motion.span>
                    {product.rating && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.25 }}
                        className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full"
                      >
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{product.rating}</span>
                      </motion.div>
                    )}
                  </div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-3xl font-bold"
                  >
                    {productName}
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-3xl md:text-4xl font-black mt-4"
                  >
                    {product.narxi.toLocaleString()} <span className="text-base font-normal">so'm</span>
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-600 mt-4 leading-relaxed text-sm md:text-base"
                  >
                    {productDesc}
                  </motion.p>

                  {productSpecs.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 }}
                      className="mt-6"
                    >
                      <h3 className="font-semibold text-base md:text-lg mb-3">{t("product_features")}</h3>
                      <ul className="space-y-2">
                        {productSpecs.map((spec, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + idx * 0.05 }}
                            className="flex items-center gap-2 text-sm"
                          >
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", delay: 0.55 + idx * 0.05 }}
                              className="text-green-500"
                            >
                              ✓
                            </motion.span>
                            {spec}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6"
                  >
                    <p className="font-medium text-sm mb-2">{t("quantity")}</p>
                    <div className="flex items-center gap-3 bg-slate-100 rounded-2xl p-1 w-fit">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-50"
                      >
                        <Minus size={16} />
                      </motion.button>
                      <motion.span
                        key={quantity}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="w-10 text-center font-bold text-lg"
                      >
                        {quantity}
                      </motion.span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-50"
                      >
                        <Plus size={16} />
                      </motion.button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                  
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-3 mt-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                    >
                      <ShoppingBag size={18} /> {t("add_to_cart")} ({quantity})
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleWishlist(product)}
                      className={`px-5 rounded-2xl border-2 transition-all ${
                        isInWishlist ? "border-red-500 bg-red-50 text-red-500" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Heart size={22} className={isInWishlist ? "fill-red-500" : ""} />
                    </motion.button>
                  </motion.div>
                </motion.div>
              </div>

              {related.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.95 }}
                  className="mt-10 pt-6 border-t"
                >
                  <h3 className="text-xl font-bold mb-5">{t("brand_products")}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {related.map((item, idx) => {
                      const name = item.nomi?.[i18n.language] || item.nomi?.uz || item.nomi;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1 + idx * 0.05 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          onClick={() => {
                            onClose();
                            setTimeout(() => onProductClick(item), 200);
                          }}
                          className="cursor-pointer group"
                        >
                          <div className="bg-slate-100 rounded-2xl h-28 overflow-hidden">
                            <motion.img
                              whileHover={{ scale: 1.1 }}
                              src={item.img}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-medium mt-2 line-clamp-1">{name}</p>
                          <p className="text-blue-600 font-bold text-sm">{item.narxi.toLocaleString()} so'm</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isFullscreenOpen && selectedFullImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] bg-black/95 flex items-center justify-center"
            onClick={closeFullscreen}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-all"
            >
              <XCircle size={28} />
            </motion.button>
            
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              src={selectedFullImage}
              alt={productName}
              className="max-w-[95vw] max-h-[95vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProductModal;
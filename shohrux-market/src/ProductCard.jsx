import { motion } from 'framer-motion';

function ProductCard({ product }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} // Boshida ko'rinmas va biroz pastda
      animate={{ opacity: 1, y: 0 }}   // Keyin tepaga silliq chiqadi
      transition={{ duration: 0.5 }}   // 0.5 soniya davom etadi
      whileHover={{ scale: 1.05 }}     // Sichqoncha ustiga kelsa, biroz kattalashadi
      className="border p-4 rounded-xl shadow-md bg-white"
    >
      <img src={product.image} alt="" className="rounded-lg" />
      <h3 className="mt-2 font-semibold">{product.name}</h3>
      {/* ... boshqa kodlar ... */}
    </motion.div>
  );
}
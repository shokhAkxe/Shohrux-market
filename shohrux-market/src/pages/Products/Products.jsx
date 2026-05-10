import React, { useState } from "react";
import products from "../../data/products";
import ProductCard from "../../components/product/ProductCard";
import { Search } from "lucide-react";

const Products = ({ onProductClick }) => {
  const [query, setQuery] = useState("");
  const filtered = products.filter(p => p.nomi.uz.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="container-custom py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Barcha Mahsulotlar</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Qidirish..." 
            className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
        ))}
      </div>
    </div>
  );
};

export default Products;
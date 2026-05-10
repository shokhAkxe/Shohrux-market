import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/products/ProductCard";
import products from "../data/products";

function ProductsPage({ onProductClick }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const categories = [
    { value: "all", label: t("all") },
    { value: "phone", label: t("phone") },
    { value: "laptop", label: t("laptop") },
    { value: "tablet", label: t("tablet") },
    { value: "accessory", label: t("accessory") },
  ];

  const brands = [...new Set(products.map(p => p.brand))];

  const [selectedBrand, setSelectedBrand] = useState("all");

  const filtered = products
    .filter((p) => {
      const matchSearch =
        p.nomi.uz.toLowerCase().includes(search.toLowerCase()) ||
        p.nomi.en.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "all" || p.cat === selectedCategory;
      const matchBrand = selectedBrand === "all" || p.brand === selectedBrand;
      return matchSearch && matchCat && matchBrand;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.narxi - b.narxi;
      if (sortBy === "price-high") return b.narxi - a.narxi;
      if (sortBy === "name") return a.nomi.uz.localeCompare(b.nomi.uz);
      return 0;
    });

  return (
    <div className="pt-16">
      <div className="bg-blue-600 text-white py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">{t("all_products") || "Barcha mahsulotlar"}</h1>
        <p className="mt-2 opacity-80">{filtered.length} ta mahsulot topildi</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="md:w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Qidiruv</h3>
              <input
                type="text"
                placeholder="Mahsulot qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">Kategoriya</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedCategory === cat.value
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Brend</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedBrand("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    selectedBrand === "all"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  Barchasi
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedBrand === brand
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    {brand.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-500">{filtered.length} ta mahsulot</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl border bg-white text-sm"
              >
                <option value="default">{t("default")}</option>
                <option value="price-low">Narxi: Arzondan qimmatga</option>
                <option value="price-high">Narxi: Qimmatdan arzonga</option>
                <option value="name">Nomi bo'yicha</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
                ))}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-400">Hech narsa topilmadi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/products/ProductCard";
import products from "../data/products";

function HomePage({ onProductClick }) {
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

  const filtered = products
    .filter((p) => {
      const matchSearch =
        p.nomi.uz.toLowerCase().includes(search.toLowerCase()) ||
        p.nomi.en.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "all" || p.cat === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.narxi - b.narxi;
      if (sortBy === "price-high") return b.narxi - a.narxi;
      if (sortBy === "name") return a.nomi.uz.localeCompare(b.nomi.uz);
      return 0;
    });

  return (
    <div>
      <header className="pt-16 pb-12 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t("welcome")}
        </h1>
        <div className="max-w-xl mx-auto mt-6 px-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-4 py-4 rounded-2xl border shadow-lg focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </header>

      <div className="sticky top-16 z-40 bg-white/95 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-xl">
                {filtered.length} {t("products_found")}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl border bg-white text-sm"
              >
                <option value="default">{t("default")}</option>
                <option value="price-low">{t("price_low")}</option>
                <option value="price-high">{t("price_high")}</option>
                <option value="name">{t("name_sort")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
            ))}
          </AnimatePresence>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400">{t("no_results")}</p>
            <button onClick={() => setSearch("")} className="mt-2 text-blue-600 text-sm">
              {t("try_another_keyword")}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
import React, { useState, useEffect } from "react"; // useEffect qo'shdik
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/products/ProductCard";
import products from "../data/products"; // Eski mahsulotlar
import { fetchMoviesAsProducts } from "../api/tmdb";

function HomePage({ onProductClick }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  
  // 1. API dan keladigan mahsulotlar uchun state
  const [apiProducts, setApiProducts] = useState([]);

  // 2. Sahifa yuklanganda API dan ma'lumot olish
  useEffect(() => {
    const getApiData = async () => {
      const movies = await fetchMoviesAsProducts();
      setApiProducts(movies);
    };
    getApiData();
  }, []);

  // 3. Ikkala mahsulotlar ro'yxatini birlashtirish
  const allProducts = [...products, ...apiProducts];

const categories = [
    { value: "all", label: t("all") },
    { value: "phone", label: t("phone") },
    { value: "laptop", label: t("laptop") },
    { value: "movie", label: t("movie") }, // t("movie") qildik, endi tarjima faylidan oladi
  ];

  // 4. Filtrlashni endi barcha mahsulotlar (allProducts) ustida bajaramiz
  const filtered = allProducts
    .filter((p) => {
      const matchSearch =
        p.nomi.uz.toLowerCase().includes(search.toLowerCase()) ||
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="pt-16 pb-12 text-center bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          {t("welcome")}
        </h1>
        <div className="max-w-xl mx-auto mt-6 px-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-4 py-4 rounded-2xl border shadow-lg focus:border-blue-500 outline-none bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
            />
          </div>
        </div>
      </header>

      <div className="sticky top-16 z-40 bg-white/95 dark:bg-slate-800/95 border-b dark:border-slate-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? "bg-blue-600 text-white dark:bg-blue-500"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-xl">
                {filtered.length} {t("products_found")}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
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
            <p className="text-slate-400 dark:text-slate-500">{t("no_results")}</p>
            <button onClick={() => setSearch("")} className="mt-2 text-blue-600 dark:text-blue-400 text-sm">
              {t("try_another_keyword")}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
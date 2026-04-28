// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  uz: {
    translation: {
      "welcome": "Kelajak texnologiyalari bir qadam masofada.",
      "search_placeholder": "Nima qidiramiz? (masalan: noutbuk)",
      "stock": "Zaxirada mavjud",
      "cart": "Savatcha",
      "buy": "Sotib olish",
      "clear": "Tozalash",
      "empty_cart": "Savatcha bo'sh",
      "total": "Jami",
      "phone": "TELEFON",
      "laptop": "NOUTBUK",
      "accessory": "AKSESSUAR"
    }
  },
  en: {
    translation: {
      "welcome": "Future technologies are just one step away.",
      "search_placeholder": "Search... (e.g. laptop)",
      "stock": "In stock",
      "cart": "Your Cart",
      "buy": "Checkout",
      "clear": "Clear Cart",
      "empty_cart": "Cart is empty",
      "total": "Total",
      "phone": "PHONE",
      "laptop": "LAPTOP",
      "accessory": "ACCESSORY"
    }
  },
  ru: {
    translation: {
      "welcome": "Технологии будущего в одном шаге от вас.",
      "search_placeholder": "Что ищем? (например: ноутбук)",
      "stock": "В наличии",
      "cart": "Корзина",
      "buy": "Купить",
      "clear": "Очистить",
      "empty_cart": "Корзина пуста",
      "total": "Итого",
      "phone": "ТЕЛЕФОН",
      "laptop": "НОУТБУК",
      "accessory": "АКСЕССУАР"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "uz",
  fallbackLng: "uz",
  interpolation: { escapeValue: false }
});

export default i18n;
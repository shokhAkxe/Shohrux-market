const products = [
  // APPLE iPHONE (1-6)
  { 
    id: 1, brand: "apple", cat: "phone", narxi: 16990000, 
    img: "/images/iphone16pro.jpg", 
    imgs: ["/images/iphone16pro1.jpg", "/images/iphone16pro2.jpg", "/images/iphone16pro3.jpg"],
    nomi: { uz: "iPhone 16 Pro", en: "iPhone 16 Pro", ru: "iPhone 16 Pro" }, 
    desc: { uz: "A18 Pro chipli eng kuchli iPhone. Titan korpus va 48MP kamera.", en: "The most powerful iPhone with A18 Pro chip", ru: "Самый мощный iPhone с чипом A18 Pro" }, 
    specs: { uz: ["A18 Pro chip", "48MP kamera", "8GB RAM", "120Hz ProMotion"], en: ["A18 Pro chip", "48MP camera", "8GB RAM", "120Hz ProMotion"], ru: ["Чип A18 Pro", "48MP камера", "8GB RAM", "120Hz ProMotion"] }, 
    rating: 4.9 
  },
  { 
    id: 2, brand: "apple", cat: "phone", narxi: 14990000, 
    img: "/images/iphone 15 pro.jpg", 
    imgs: ["/images/iphone15pro1.jpg", "/images/iphone15pro2.jpg"],
    nomi: { uz: "iPhone 15 Pro Max", en: "iPhone 15 Pro Max", ru: "iPhone 15 Pro Max" }, 
    desc: { uz: "A17 Pro chipli kuchli telefon. Titan korpus.", en: "Powerful phone with A17 Pro chip", ru: "Мощный телефон с чипом A17 Pro" }, 
    specs: { uz: ["A17 Pro chip", "48MP kamera", "8GB RAM"], en: ["A17 Pro chip", "48MP camera", "8GB RAM"], ru: ["Чип A17 Pro", "48MP камера", "8GB RAM"] }, 
    rating: 4.8 
  },
  { 
    id: 3, brand: "apple", cat: "phone", narxi: 11990000, 
    img: "/images/iphone15.jpg", 
    imgs: ["/images/iphone151.jpg", "/images/iphone152.jpg"],
    nomi: { uz: "iPhone 15", en: "iPhone 15", ru: "iPhone 15" }, 
    desc: { uz: "Dynamic Island va kuchli kamera", en: "Dynamic Island and powerful camera", ru: "Dynamic Island и мощная камера" }, 
    specs: { uz: ["A16 chip", "48MP kamera", "6GB RAM"], en: ["A16 chip", "48MP camera", "6GB RAM"], ru: ["Чип A16", "48MP камера", "6GB RAM"] }, 
    rating: 4.7 
  },
  { 
    id: 4, brand: "apple", cat: "phone", narxi: 8990000, 
    img: "/images/iphone14.jpg", 
    imgs: ["/images/iphone141.jpg", "/images/iphone142.jpg"],
    nomi: { uz: "iPhone 14", en: "iPhone 14", ru: "iPhone 14" }, 
    desc: { uz: "Ishonchli va sifatli", en: "Reliable and quality", ru: "Надежный и качественный" }, 
    specs: { uz: ["A15 chip", "12MP kamera", "6GB RAM"], en: ["A15 chip", "12MP camera", "6GB RAM"], ru: ["Чип A15", "12MP камера", "6GB RAM"] }, 
    rating: 4.6 
  },
  { 
    id: 5, brand: "apple", cat: "phone", narxi: 6990000, 
    img: "/images/iphone13.jpg", 
    imgs: ["/images/iphone131.jpg","/images/iphone132.jpg"],
    nomi: { uz: "iPhone 13", en: "iPhone 13", ru: "iPhone 13" }, 
    desc: { uz: "Eng yaxshi arzon flagship", en: "Best budget flagship", ru: "Лучший бюджетный флагман" }, 
    specs: { uz: ["A15 chip", "12MP kamera", "4GB RAM"], en: ["A15 chip", "12MP camera", "4GB RAM"], ru: ["Чип A15", "12MP камера", "4GB RAM"] }, 
    rating: 4.5 
  },

  // SAMSUNG GALAXY (6-11)
  { 
    id: 6, brand: "samsung", cat: "phone", narxi: 15990000, 
    img: "/images/25ultra.jpg", 
    imgs: ["/images/s25ultra.jpg", "/images/s25ultra2.jpg", "/images/s25ultra3.jpg"],
    nomi: { uz: "Galaxy S25 Ultra", en: "Galaxy S25 Ultra", ru: "Galaxy S25 Ultra" }, 
    desc: { uz: "Galaxy AI bilan jihozlangan eng kuchli flagship", en: "Equipped with Galaxy AI", ru: "Оснащен Galaxy AI" }, 
    specs: { uz: ["Snapdragon 8 Elite", "200MP kamera", "S Pen", "5000mAh"], en: ["Snapdragon 8 Elite", "200MP camera", "S Pen", "5000mAh"], ru: ["Snapdragon 8 Elite", "200MP камера", "S Pen", "5000mAh"] }, 
    rating: 4.9 
  },
  { 
    id: 7, brand: "samsung", cat: "phone", narxi: 13990000, 
    img: "/images/samsung s 24 ultra.jpg", 
    imgs: ["/images/24ultra.jpg", "/images/24ultra2.jpg"],
    nomi: { uz: "Galaxy S24 Ultra", en: "Galaxy S24 Ultra", ru: "Galaxy S24 Ultra" }, 
    desc: { uz: "AI funksiyalar bilan jihozlangan", en: "With AI features", ru: "С AI функциями" }, 
    specs: { uz: ["Snapdragon 8 Gen 3", "200MP kamera", "S Pen"], en: ["Snapdragon 8 Gen 3", "200MP camera", "S Pen"], ru: ["Snapdragon 8 Gen 3", "200MP камера", "S Pen"] }, 
    rating: 4.8 
  },
  { 
    id: 8, brand: "samsung", cat: "phone", narxi: 10990000, 
    img: "/images/24plus.jpg", 
    imgs: ["/images/24plus1.jpg","/images/24plus2.jpg"],
    nomi: { uz: "Galaxy S24+", en: "Galaxy S24+", ru: "Galaxy S24+" }, 
    desc: { uz: "Katta ekran va kuchli batareya", en: "Big screen and powerful battery", ru: "Большой экран и мощная батарея" }, 
    specs: { uz: ["Snapdragon 8 Gen 3", "4900mAh", "QHD+ ekran"], en: ["Snapdragon 8 Gen 3", "4900mAh", "QHD+ display"], ru: ["Snapdragon 8 Gen 3", "4900mAh", "QHD+ дисплей"] }, 
    rating: 4.7 
  },
  { 
    id: 9, brand: "samsung", cat: "phone", narxi: 8990000, 
    img: "/images/s24.jpg", 
    imgs: ["/images/242.jpg","/images/24.jpg","/images/241.jpg"],
    nomi: { uz: "Galaxy S24", en: "Galaxy S24", ru: "Galaxy S24" }, 
    desc: { uz: "Kompakt flagship", en: "Compact flagship", ru: "Компактный флагман" }, 
    specs: { uz: ["Snapdragon 8 Gen 3", "4000mAh", "Dynamic AMOLED"], en: ["Snapdragon 8 Gen 3", "4000mAh", "Dynamic AMOLED"], ru: ["Snapdragon 8 Gen 3", "4000mAh", "Dynamic AMOLED"] }, 
    rating: 4.6 
  },
  { 
    id: 10, brand: "samsung", cat: "phone", narxi: 5490000, 
    img: "/images/a55.jpg", 
    imgs: ["/images/a551.jpg","/images/55.jpg","images/551.jpg"],
    nomi: { uz: "Galaxy A55", en: "Galaxy A55", ru: "Galaxy A55" }, 
    desc: { uz: "O'rta segment eng yaxshisi", en: "Best in mid-range", ru: "Лучший в среднем сегменте" }, 
    specs: { uz: ["Exynos 1480", "AMOLED", "5000mAh"], en: ["Exynos 1480", "AMOLED", "5000mAh"], ru: ["Exynos 1480", "AMOLED", "5000mAh"] }, 
    rating: 4.5 
  },
  { 
    id: 11, brand: "samsung", cat: "phone", narxi: 3990000, 
    img: "/images/a35.jpg", 
    imgs: ["/images/a351.jpg","/images/35.jpg","/images/351.jpg"],
    nomi: { uz: "Galaxy A35", en: "Galaxy A35", ru: "Galaxy A35" }, 
    desc: { uz: "Arzon va sifatli", en: "Affordable and quality", ru: "Доступный и качественный" }, 
    specs: { uz: ["Exynos 1380", "Super AMOLED", "5000mAh"], en: ["Exynos 1380", "Super AMOLED", "5000mAh"], ru: ["Exynos 1380", "Super AMOLED", "5000mAh"] }, 
    rating: 4.4 
  },

  // XIAOMI (12-15)
  { 
    id: 12, brand: "xiaomi", cat: "phone", narxi: 8990000, 
    img: "/images/xiaomi14tpro.jpg", 
    imgs: ["/images/14tpro.jpg", "/images/14pro.jpg","/images/14pro1.jpg"],
    nomi: { uz: "Xiaomi 14T Pro", en: "Xiaomi 14T Pro", ru: "Xiaomi 14T Pro" }, 
    desc: { uz: "Leica kamera bilan jihozlangan", en: "With Leica camera", ru: "С камерой Leica" }, 
    specs: { uz: ["Dimensity 9300+", "50MP Leica", "120W quvvat"], en: ["Dimensity 9300+", "50MP Leica", "120W charging"], ru: ["Dimensity 9300+", "50MP Leica", "120W зарядка"] }, 
    rating: 4.8 
  },
  { 
    id: 13, brand: "xiaomi", cat: "phone", narxi: 7990000, 
    img: "/images/14.jpg", 
    imgs: ["/images/xiaomi14.jpg","/images/141.jpg","/images/142.jpg"],
    nomi: { uz: "Xiaomi 14", en: "Xiaomi 14", ru: "Xiaomi 14" }, 
    desc: { uz: "Kuchli flagship", en: "Powerful flagship", ru: "Мощный флагман" }, 
    specs: { uz: ["Snapdragon 8 Gen 3", "50MP", "90W quvvat"], en: ["Snapdragon 8 Gen 3", "50MP", "90W charging"], ru: ["Snapdragon 8 Gen 3", "50MP", "90W зарядка"] }, 
    rating: 4.7 
  },
  { 
    id: 14, brand: "xiaomi", cat: "phone", narxi: 4990000, 
    img: "/images/x6.jpg", 
    imgs: ["/images/pocox6.jpg","/images/x61.jpg","/images/x62.jpg"],
    nomi: { uz: "Poco X6 Pro", en: "Poco X6 Pro", ru: "Poco X6 Pro" }, 
    desc: { uz: "Gaming telefon", en: "Gaming phone", ru: "Игровой телефон" }, 
    specs: { uz: ["Dimensity 8300", "120Hz", "67W quvvat"], en: ["Dimensity 8300", "120Hz", "67W charging"], ru: ["Dimensity 8300", "120Hz", "67W зарядка"] }, 
    rating: 4.6 
  },

  // GOOGLE PIXEL (15-16)
  { 
    id: 15, brand: "google", cat: "phone", narxi: 11990000, 
    img: "/images/pixel9pro.jpg", 
    imgs: ["/images/9pro.jpg", "/images/9pro1.jpg","/images/9pro2.jpg"],
    nomi: { uz: "Pixel 9 Pro", en: "Pixel 9 Pro", ru: "Pixel 9 Pro" }, 
    desc: { uz: "Eng yaxshi kamera va AI funksiyalar", en: "Best camera and AI features", ru: "Лучшая камера и AI функции" }, 
    specs: { uz: ["Tensor G4", "AI kamera", "48MP"], en: ["Tensor G4", "AI camera", "48MP"], ru: ["Tensor G4", "AI камера", "48MP"] }, 
    rating: 4.9 
  },
  { 
    id: 16, brand: "google", cat: "phone", narxi: 9990000, 
    img: "/images/Pixel 8 Pro.jpg", 
    imgs: ["/images/8pro.jpg","/images/8pro1.jpg","/images/8pro2.jpg"],
    nomi: { uz: "Pixel 8 Pro", en: "Pixel 8 Pro", ru: "Pixel 8 Pro" }, 
    desc: { uz: "AI funksiyalar bilan", en: "With AI features", ru: "С AI функциями" }, 
    specs: { uz: ["Tensor G3", "AI kamera", "50MP"], en: ["Tensor G3", "AI camera", "50MP"], ru: ["Tensor G3", "AI камера", "50MP"] }, 
    rating: 4.8 
  },

  // ONEPLUS (17-18)
  { 
    id: 17, brand: "oneplus", cat: "phone", narxi: 9490000, 
    img: "/images/oneplus12.jpg", 
    imgs: ["/images/12.jpg", "/images/121.jpg","/images/122.jpg"],
    nomi: { uz: "OnePlus 12", en: "OnePlus 12", ru: "OnePlus 12" }, 
    desc: { uz: "Tez va silliq", en: "Fast and smooth", ru: "Быстрый и плавный" }, 
    specs: { uz: ["Snapdragon 8 Gen 3", "100W quvvat", "16GB RAM"], en: ["Snapdragon 8 Gen 3", "100W charging", "16GB RAM"], ru: ["Snapdragon 8 Gen 3", "100W зарядка", "16GB RAM"] }, 
    rating: 4.8 
  },
  { 
    id: 18, brand: "oneplus", cat: "phone", narxi: 7490000, 
    img: "/images/oneplus12r.jpg", 
    imgs: ["/images/12r.jpg","/images/12r1.jpg","/images/12r2.jpg"],
    nomi: { uz: "OnePlus 12R", en: "OnePlus 12R", ru: "OnePlus 12R" }, 
    desc: { uz: "Kuchli va arzon", en: "Powerful and affordable", ru: "Мощный и доступный" }, 
    specs: { uz: ["Snapdragon 8 Gen 2", "5500mAh", "100W quvvat"], en: ["Snapdragon 8 Gen 2", "5500mAh", "100W charging"], ru: ["Snapdragon 8 Gen 2", "5500mAh", "100W зарядка"] }, 
    rating: 4.7 
  },

  // NOTHING (19)
  { 
    id: 19, brand: "nothing", cat: "phone", narxi: 6990000, 
    img: "/images/nothing2.jpg", 
    imgs: ["/images/1.jpg", "/images/2.jpg","/images/3.jpg"],
    nomi: { uz: "Nothing Phone 2", en: "Nothing Phone 2", ru: "Nothing Phone 2" }, 
    desc: { uz: "Glyph interfeysi bilan", en: "With Glyph interface", ru: "С Glyph интерфейсом" }, 
    specs: { uz: ["Snapdragon 8+ Gen 1", "Glyph lights", "4700mAh"], en: ["Snapdragon 8+ Gen 1", "Glyph lights", "4700mAh"], ru: ["Snapdragon 8+ Gen 1", "Glyph lights", "4700mAh"] }, 
    rating: 4.7 
  },

  // LAPTOPS (20-30)
  { 
    id: 20, brand: "apple", cat: "laptop", narxi: 28990000, 
    img: "/images/macbookm4pro.jpg", 
    imgs: ["/images/m4pro.jpg", "/images/4pro.jpg","/images/4.jpg"],
    nomi: { uz: "MacBook Pro 16 M4 Pro", en: "MacBook Pro 16 M4 Pro", ru: "MacBook Pro 16 M4 Pro" }, 
    desc: { uz: "Professional ish uchun eng kuchli noutbuk", en: "The most powerful laptop for professional work", ru: "Самый мощный ноутбук для профессиональной работы" }, 
    specs: { uz: ["M4 Pro chip", "32GB RAM", "1TB SSD", "16.2 inch Liquid Retina XDR"], en: ["M4 Pro chip", "32GB RAM", "1TB SSD", "16.2 inch Liquid Retina XDR"], ru: ["M4 Pro chip", "32GB RAM", "1TB SSD", "16.2 inch Liquid Retina XDR"] }, 
    rating: 4.9 
  },
  { 
    id: 21, brand: "apple", cat: "laptop", narxi: 19990000, 
    img: "/images/macbuk m3 pro.jpg", 
    imgs: ["/images/mac3.jpg","/images/mac.jpg","/images/mac1.jpg"],
    nomi: { uz: "MacBook Air M3", en: "MacBook Air M3", ru: "MacBook Air M3" }, 
    desc: { uz: "Yengil va kuchli", en: "Light and powerful", ru: "Легкий и мощный" }, 
    specs: { uz: ["M3 chip", "16GB RAM", "512GB SSD", "13.6 inch Liquid Retina"], en: ["M3 chip", "16GB RAM", "512GB SSD", "13.6 inch Liquid Retina"], ru: ["M3 chip", "16GB RAM", "512GB SSD", "13.6 inch Liquid Retina"] }, 
    rating: 4.8 
  },
  { 
    id: 22, brand: "dell", cat: "laptop", narxi: 24990000, 
    img: "/images/dellxps14.jpg", 
    imgs: ["/images/dell14.jpg","/images/dell 14.jpg","/images/dell.jpg"],
    nomi: { uz: "Dell XPS 14", en: "Dell XPS 14", ru: "Dell XPS 14" }, 
    desc: { uz: "Premium dizayn va kuchli unumdorlik", en: "Premium design and high performance", ru: "Премиум дизайн и высокая производительность" }, 
    specs: { uz: ["Intel Core Ultra 7", "32GB RAM", "OLED touch display", "1TB SSD"], en: ["Intel Core Ultra 7", "32GB RAM", "OLED touch display", "1TB SSD"], ru: ["Intel Core Ultra 7", "32GB RAM", "OLED touch display", "1TB SSD"] }, 
    rating: 4.8 
  },
  { 
    id: 23, brand: "dell", cat: "laptop", narxi: 18990000, 
    img: "/images/dellxps13.jpg", 
    imgs: ["/images/dell13.jpg","/images/dell 13.jpg","/images/xps13.jpg"],
    nomi: { uz: "Dell XPS 13", en: "Dell XPS 13", ru: "Dell XPS 13" }, 
    desc: { uz: "Kompyakt va kuchli", en: "Compact and powerful", ru: "Компактный и мощный" }, 
    specs: { uz: ["Intel Core Ultra 5", "16GB RAM", "512GB SSD"], en: ["Intel Core Ultra 5", "16GB RAM", "512GB SSD"], ru: ["Intel Core Ultra 5", "16GB RAM", "512GB SSD"] }, 
    rating: 4.7 
  },
  { 
    id: 24, brand: "hp", cat: "laptop", narxi: 11990000, 
    img: "/images/hpvictus.jpg", 
    imgs: ["/images/hpv.jpg", "/images/hpv2.jpg","/images/hpv3.jpg"],
    nomi: { uz: "HP Victus 16", en: "HP Victus 16", ru: "HP Victus 16" }, 
    desc: { uz: "Gaming noutbuk", en: "Gaming laptop", ru: "Игровой ноутбук" }, 
    specs: { uz: ["RTX 4060", "Intel Core i7", "16GB RAM", "144Hz display"], en: ["RTX 4060", "Intel Core i7", "16GB RAM", "144Hz display"], ru: ["RTX 4060", "Intel Core i7", "16GB RAM", "144Hz display"] }, 
    rating: 4.7 
  },
  { 
    id: 25, brand: "hp", cat: "laptop", narxi: 8990000, 
    img: "/images/hppavilion.jpg", 
    imgs: ["/images/hpp.jpg","/images/hpp1.jpg","/images/hpp2.jpg"],
    nomi: { uz: "HP Pavilion 15", en: "HP Pavilion 15", ru: "HP Pavilion 15" }, 
    desc: { uz: "Har kunlik ish uchun ideal", en: "Ideal for daily work", ru: "Идеален для повседневной работы" }, 
    specs: { uz: ["Intel Core i5", "8GB RAM", "512GB SSD", "15.6 inch FHD"], en: ["Intel Core i5", "8GB RAM", "512GB SSD", "15.6 inch FHD"], ru: ["Intel Core i5", "8GB RAM", "512GB SSD", "15.6 inch FHD"] }, 
    rating: 4.5 
  },
  { 
    id: 26, brand: "asus", cat: "laptop", narxi: 22990000, 
    img: "/images/asusrog.jpg", 
    imgs: ["/images/asus.jpg", "/images/rog.jpg","/images/rog1.jpg"],
    nomi: { uz: "ASUS ROG Zephyrus", en: "ASUS ROG Zephyrus", ru: "ASUS ROG Zephyrus" }, 
    desc: { uz: "O'yinchilar uchun eng kuchli gaming noutbuk", en: "The most powerful gaming laptop for gamers", ru: "Самый мощный игровой ноутбук для геймеров" }, 
    specs: { uz: ["RTX 4080", "Intel Core i9", "32GB RAM", "240Hz display"], en: ["RTX 4080", "Intel Core i9", "32GB RAM", "240Hz display"], ru: ["RTX 4080", "Intel Core i9", "32GB RAM", "240Hz display"] }, 
    rating: 4.9 
  },
  { 
    id: 27, brand: "asus", cat: "laptop", narxi: 16990000, 
    img: "/images/asustuf.jpg", 
    imgs: ["/images/asust.jpg","/images/tuf.jpg","/images/atuf.jpg"],
    nomi: { uz: "ASUS TUF Gaming", en: "ASUS TUF Gaming", ru: "ASUS TUF Gaming" }, 
    desc: { uz: "Bardoshli gaming noutbuk", en: "Durable gaming laptop", ru: "Прочный игровой ноутбук" }, 
    specs: { uz: ["RTX 4060", "Intel Core i7", "16GB RAM", "144Hz display"], en: ["RTX 4060", "Intel Core i7", "16GB RAM", "144Hz display"], ru: ["RTX 4060", "Intel Core i7", "16GB RAM", "144Hz display"] }, 
    rating: 4.8 
  },
  { 
    id: 28, brand: "msi", cat: "laptop", narxi: 28990000, 
    img: "/images/msige78.jpg", 
    imgs: ["/images/msi.jpg","/images/msi1.jpg","/images/msi2.jpg"],
    nomi: { uz: "MSI GE78 HX", en: "MSI GE78 HX", ru: "MSI GE78 HX" }, 
    desc: { uz: "Ultra gaming noutbuk", en: "Ultra gaming laptop", ru: "Ультра игровой ноутбук" }, 
    specs: { uz: ["RTX 4090", "Intel Core i9", "64GB RAM", "240Hz display"], en: ["RTX 4090", "Intel Core i9", "64GB RAM", "240Hz display"], ru: ["RTX 4090", "Intel Core i9", "64GB RAM", "240Hz display"] }, 
    rating: 4.9 
  },
];

export default products;
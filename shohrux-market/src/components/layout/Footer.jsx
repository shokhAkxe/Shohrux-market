import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Send, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react";

function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { path: "/", label: "Bosh sahifa" },
    { path: "/products", label: "Mahsulotlar" },
    { path: "/wishlist", label: "Yoqtirilganlar" },
    { path: "/cart", label: "Savat" },
    { path: "/about", label: "Biz haqimizda" },
    { path: "/contact", label: "Kontakt" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", color: "hover:text-blue-600" },
    { icon: Instagram, href: "https://instagram.com", color: "hover:text-pink-600" },
    { icon: Send, href: "https://t.me", color: "hover:text-blue-500" },
    { icon: Youtube, href: "https://youtube.com", color: "hover:text-red-600" },
  ];

  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              SHOHRUX MARKET
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Eng yangi va sifatli texnologiyalar siz uchun. Tez yetkazib berish, original mahsulotlar.
            </p>
            <div className="flex gap-3 sm:gap-4 mt-4">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-slate-400 transition ${social.color}`}
                >
                  <social.icon size={18} className="sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Menyu</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-slate-400 hover:text-white transition text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Bog'lanish</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center gap-2 sm:gap-3 text-slate-400 text-sm">
                <MapPin size={14} className="sm:w-4 sm:h-4" /> Toshkent sh., Chilonzor tumani
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-slate-400 text-sm">
                <Phone size={14} className="sm:w-4 sm:h-4" /> +998 99 123 45 67
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-slate-400 text-sm">
                <Mail size={14} className="sm:w-4 sm:h-4" /> info@shohruxmarket.uz
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-slate-400 text-sm">
                <Clock size={14} className="sm:w-4 sm:h-4" /> Dush - Shan: 09:00 - 21:00
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Yangiliklar</h4>
            <p className="text-slate-400 text-sm mb-3">
              Yangi mahsulotlar va aksiyalardan xabardor bo'ling
            </p>
            <div className="flex flex-col sm:flex-row">
              <input
                type="email"
                placeholder="Email manzilingiz"
                className="w-full px-3 sm:px-4 py-2 rounded-lg sm:rounded-l-xl sm:rounded-r-none bg-slate-800 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 rounded-lg sm:rounded-r-xl sm:rounded-l-none text-sm font-medium hover:bg-blue-700 transition mt-2 sm:mt-0">
                Obuna
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-slate-500 text-xs sm:text-sm">
          <p>&copy; 2024 SHOHRUX MARKET. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
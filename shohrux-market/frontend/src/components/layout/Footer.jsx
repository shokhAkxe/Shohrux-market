import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Send, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react";

function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { path: "/", label: t("Home") },
    { path: "/products", label: t("Products") },
    { path: "/wishlist", label: t("Wishlist") },
    { path: "/cart", label: t("cart") }, 
    { path: "/contact", label: t("Contact") },
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
              {t("footer_desc")}
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
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">{t("menu")}</h4>
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
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">{t("contact")}</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3 text-slate-400 text-sm">
                <MapPin size={14} className="sm:w-4 sm:h-4 mt-1 flex-shrink-0" /> 
                {t("address_text")}
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-slate-400 text-sm">
                <Phone size={14} className="sm:w-4 sm:h-4 flex-shrink-0" /> +998 99 123 45 67
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-slate-400 text-sm">
                <Mail size={14} className="sm:w-4 sm:h-4 flex-shrink-0" /> info@shohruxmarket.uz
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-slate-400 text-sm">
                <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" /> {t("work_hours")}
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">{t("news_title")}</h4>
            <p className="text-slate-400 text-sm mb-3">
              {t("news_desc")}
            </p>
            <div className="flex flex-col sm:flex-row">
              <input
                type="email"
                placeholder={t("email_placeholder")}
                className="w-full px-3 sm:px-4 py-2 rounded-lg sm:rounded-l-xl sm:rounded-r-none bg-slate-800 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 rounded-lg sm:rounded-r-xl sm:rounded-l-none text-sm font-medium hover:bg-blue-700 transition mt-2 sm:mt-0">
                {t("subscribe")}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-slate-500 text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} SHOHRUX MARKET. {t("all_rights")}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Youtube, Headphones, MessageCircle, Globe, Shield } from "lucide-react";
import toast from "react-hot-toast";

function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(t("FillAllFields") || "Iltimos, barcha maydonlarni to'ldiring");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success(t("MessageSentSuccess") || "Xabaringiz yuborildi! Tez orada javob beramiz.");
      setForm({ name: "", email: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  const contacts = [
    { icon: MapPin, title: t("AddressLabel"), info: t("AddressValue"), color: "text-red-500", bg: "bg-red-50" },
    { icon: Phone, title: t("PhoneLabel"), info: "+998 99 123 45 67", color: "text-green-500", bg: "bg-green-50" },
    { icon: Mail, title: t("EmailLabel"), info: "info@shohruxmarket.uz", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Clock, title: t("WorkingHours"), info: t("WorkingDays"), color: "text-orange-500", bg: "bg-orange-50" },
  ];

  const supportChannels = [
    { icon: Headphones, title: t("SupportShortTitle"), desc: t("SupportShortDesc"), color: "bg-purple-500", link: "tel:+998991234567" },
    { icon: MessageCircle, title: t("TelegramSupport"), desc: "@shohrux_market_support", color: "bg-blue-500", link: "https://t.me/shohrux_market_support" },
    { icon: Globe, title: t("OnlineChat"), desc: t("LiveChatDesc"), color: "bg-green-500", link: "#" },
    { icon: Shield, title: t("QualityAssurance"), desc: t("OriginalProducts"), color: "bg-indigo-500", link: "#" },
  ];

  const socials = [
    { icon: Facebook, name: "Facebook", link: "https://facebook.com", color: "text-blue-600" },
    { icon: Instagram, name: "Instagram", link: "https://instagram.com", color: "text-pink-600" },
    { icon: Send, name: "Telegram", link: "https://t.me", color: "text-blue-500" },
    { icon: Youtube, name: "YouTube", link: "https://youtube.com", color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{t("ContactTitle")}</h1>
          <p className="text-slate-500 text-sm sm:text-base">{t("ContactSubtitle")}</p>
        </div>

        {/* 24/7 Support Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 sm:p-6 mb-8 text-white text-center">
          <Headphones size={40} className="mx-auto mb-3" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{t("SupportTitle")}</h2>
          <p className="text-purple-100 text-sm sm:text-base">{t("SupportDesc")}</p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {supportChannels.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target={item.link.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="bg-white p-4 rounded-2xl text-center shadow-sm hover:shadow-md transition group"
            >
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition`}>
                <item.icon size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base">{item.title}</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">{item.desc}</p>
            </a>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            {contacts.map((item, idx) => (
              <div key={idx} className={`${item.bg} p-4 sm:p-5 rounded-2xl flex items-center gap-3 sm:gap-4 shadow-sm`}>
                <div className={`p-2 sm:p-3 ${item.bg} rounded-xl ${item.color}`}>
                  <item.icon size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">{item.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm">{item.info}</p>
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-sm sm:text-base mb-3">{t("SocialMedia")}</h3>
              <div className="flex gap-3 sm:gap-4">
                {socials.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
                  >
                    <social.icon size={18} className="sm:w-5 sm:h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("SendMessage")}</h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder={t("full_name") || "Ismingiz"}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 sm:p-3.5 border rounded-xl focus:outline-none focus:border-blue-500 text-sm sm:text-base"
              />
              <input
                type="email"
                placeholder={t("email") || "Email manzilingiz"}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-3 sm:p-3.5 border rounded-xl focus:outline-none focus:border-blue-500 text-sm sm:text-base"
              />
              <textarea
                placeholder={t("your_message") || "Xabaringiz..."}
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full p-3 sm:p-3.5 border rounded-xl focus:outline-none focus:border-blue-500 resize-none text-sm sm:text-base"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition text-sm sm:text-base"
              >
                {loading ? t("Sending") || "Yuborilmoqda..." : <><Send size={16} className="sm:w-5 sm:h-5" /> {t("SendMessage")}</>}
              </button>
            </form>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl h-48 sm:h-56 md:h-64 flex items-center justify-center">
          <p className="text-slate-400 text-sm sm:text-base">📍 {t("GoogleMaps")}</p>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
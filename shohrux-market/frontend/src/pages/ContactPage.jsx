import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  MapPin, Phone, Mail, Clock, Send, Facebook, 
  Instagram, Youtube, Headphones, MessageCircle, 
  Globe, Shield 
} from "lucide-react";
import toast from "react-hot-toast";
import emailjs from '@emailjs/browser';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import api from '../api/axios'; 

function ContactPage() {
  const { t } = useTranslation();
  const mapContainer = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

 // 1. MapLibre 3D Xarita Sozlamalari
  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      // MapTiler API Key joylandi
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=mo1aSv9HWSJu96PmFRWj`, 
      center: [60.632210, 41.570248], // Yangi koordinatalar [Lng, Lat] tartibida
      zoom: 16, // Atrof yaxshi ko'rinishi uchun yaqinlashtirildi
      pitch: 45, 
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    new maplibregl.Marker({ color: "#2563eb" })
      .setLngLat([60.632210, 41.570248]) // Marker koordinatasi ham [Lng, Lat]
      .setPopup(new maplibregl.Popup().setHTML("<h3 style='color: #1e40af; font-weight: bold;'>Shohrux Market</h3><p>Urganch shahri, Al-Xorazmiy ko'chasi</p>"))
      .addTo(map);

    return () => map.remove();
  }, []);
  // 2. EmailJS (Service & Template ID) va Backend integratsiyasi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(t("FillAllFields") || "Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    setLoading(true);
    
    // EmailJS uchun parametrlar
    const templateParams = {
      from_name: form.name,
      from_email: form.email,
      message: form.message,
      to_email: 'sotimboyevshoxrux3@gmail.com',
    };

    try {
      // A. EmailJS orqali yuborish
      await emailjs.send(
        'service_siuxu3o', 
        'template_0h7x8tb', 
        templateParams, 
        'nJLXihLc8zNcddooc'
      );

      // B. Backend (Prisma) bazasiga saqlash
      await api.post('/messages', {
        full_name: form.name,
        email: form.email,
        message: form.message
      });

      toast.success(t("MessageSentSuccess") || "Xabaringiz muvaffaqiyatli yuborildi!");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Yuborishda xatolik:", error);
      toast.error("Xatolik yuz berdi. Internetni tekshiring yoki keyinroq urunib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const contacts = [
    { icon: MapPin, title: t("AddressLabel"), info: t("AddressValue"), color: "text-red-500", bg: "bg-red-50" },
    { icon: Phone, title: t("PhoneLabel"), info: "+998 99 123 45 67", color: "text-green-500", bg: "bg-green-50" },
    { icon: Mail, title: t("EmailLabel"), info: "info@shohruxmarket.uz", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Clock, title: t("WorkingHours"), info: t("WorkingDays"), color: "text-orange-500", bg: "bg-orange-50" },
  ];

  const supportChannels = [
    { icon: Headphones, title: t("SupportShortTitle"), desc: t("SupportShortDesc"), color: "bg-purple-500", link: "https://t.me/shohrux_98_68" },
    { icon: MessageCircle, title: t("TelegramSupport"), desc: "@shohrux_market", color: "bg-blue-500", link: "https://t.me/shohrux_98_68" },
    { icon: Globe, title: t("OnlineChat"), desc: t("LiveChatDesc"), color: "bg-green-500", link: "https://t.me/shohrux_98_68" },
    { icon: Shield, title: t("QualityAssurance"), desc: t("OriginalProducts"), color: "bg-indigo-500", link: "#" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        
        {/* Sarlavha */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4">{t("ContactTitle")}</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">{t("ContactSubtitle")}</p>
        </div>

        {/* Support Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportChannels.map((item, idx) => (
            <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-3xl text-center shadow-sm hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-blue-100">
              <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition`}>
                <item.icon size={30} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-800">{item.title}</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">{item.desc}</p>
            </a>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Chap tomon: Kontaktlar */}
          <div className="space-y-4">
            {contacts.map((item, idx) => (
              <div key={idx} className={`${item.bg} p-6 rounded-3xl flex items-center gap-5 shadow-sm border border-white/50`}>
                <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-700">
                  <item.icon size={26} className={item.color} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                  <p className="text-slate-600 font-medium">{item.info}</p>
                </div>
              </div>
            ))}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Globe size={20} className="text-blue-600" /> {t("SocialMedia")}
              </h3>
              <div className="flex gap-4">
  {[
    { Icon: Facebook,  url: "https://facebook.com/profile.php?id=100078583968841" },   // O'zingizning havolangizni yozing
    { Icon: Instagram, url: "https://instagram.com/shohrux_sotimboyev" },  // O'zingizning havolangizni yozing
    { Icon: Send,      url: "https://t.me/shohrux_98_68" },   // Telegram havola (Send ikonasi uchun)
    { Icon: Youtube,   url: "https://youtube.com/@ShohruxSotimboyev-d9h6k" }    // O'zingizning havolangizni yozing
  ].map(({ Icon, url }, idx) => (
    <a 
      key={idx} 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
    >
      <Icon size={22} />
    </a>
  ))}
</div>
            </div>
          </div>

          {/* O'ng tomon: Form */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
            <h2 className="text-2xl font-black text-slate-900 mb-6">{t("SendMessage")}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">{t("full_name")}</label>
                <input
                  type="text"
                  placeholder="..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">{t("email")}</label>
                <input
                  type="email"
                  placeholder="...@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">{t("your_message")}</label>
                <textarea
                  placeholder="..."
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-blue-500/10 focus:border-blue-500 outline-none resize-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-200 disabled:bg-slate-300 disabled:shadow-none"
              >
                {loading ? (
                  <span className="animate-pulse">{t("Sending")}...</span>
                ) : (
                  <> {t("SendMessage")} <Send size={22} /> </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 3D Xarita Bo'limi */}
        <div className="mt-12 group">
           <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <MapPin className="text-blue-600" /> {t("GoogleMaps")}
              </h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">3D INTERACTIVE</span>
           </div>
           <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group-hover:border-blue-50 transition-all duration-500">
              <div ref={mapContainer} className="h-[450px] w-full" />
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.05)]" />
           </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
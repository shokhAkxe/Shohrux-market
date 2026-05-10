import React from "react";
import { Shield, Truck, CreditCard, Headphones, Award, Users, Zap, Star } from "lucide-react";

function AboutPage() {
  const features = [
    { icon: Truck, title: "Tez yetkazib berish", desc: "1-2 kun ichida yetkazib beramiz", color: "bg-blue-500" },
    { icon: Shield, title: "Sifat kafolati", desc: "Barcha mahsulotlar original", color: "bg-green-500" },
    { icon: CreditCard, title: "Xavfsiz to'lov", desc: "Visa, Mastercard, Payme, Click", color: "bg-purple-500" },
    { icon: Headphones, title: "24/7 Qo'llab-quvvatlash", desc: "Har doim yordamga tayyormiz", color: "bg-orange-500" },
    { icon: Award, title: "Eng yaxshi narxlar", desc: "Bozordagi eng past narxlar", color: "bg-red-500" },
    { icon: Users, title: "10000+ mijozlar", desc: "Ishonchli hamkorlar", color: "bg-indigo-500" },
  ];

  const stats = [
    { value: "2024", label: "Tashkil etilgan", icon: Zap },
    { value: "10,000+", label: "Mijozlar", icon: Users },
    { value: "50+", label: "Brendlar", icon: Star },
    { value: "100%", label: "Sifat kafolati", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">SHOHRUX MARKET</h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Eng yangi va sifatli texnologiyalar siz uchun
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12 md:py-16">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Bizning maqsadimiz</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            SHOHRUX MARKET - bu zamonaviy texnologiyalarni eng qulay narxlarda taqdim etuvchi
            onlayn do'kon. Biz mijozlarimizga faqat original va sifatli mahsulotlarni taklif qilamiz.
            Tez yetkazib berish va a'lo darajadagi xizmat ko'rsatish - bizning asosiy ustuvorliklarimiz.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-10 sm:mb-12">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition group">
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                <feature.icon size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <stat.icon size={28} className="text-blue-400 mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-400 text-xs sm:text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
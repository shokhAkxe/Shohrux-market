import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Mail, Phone, Calendar, CheckCircle2, X, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Messages = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => { fetchMessages(); }, []);

    const fetchMessages = async () => {
        try { const res = await api.get('/messages'); setMessages(res.data); } catch(e) {}
    };

    const markAsRead = async (id) => {
        await api.put(`/messages/${id}/read`);
        fetchMessages();
        setSelected(null);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black tracking-tight dark:text-white">{t('messages') || 'Mijozlar Murojaatlari'}</h1>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {messages.map(msg => (
                    <div key={msg.id} className={`p-6 rounded-3xl border transition-all duration-300 relative group cursor-pointer ${msg.is_read ? 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800' : 'bg-gradient-to-br from-white to-indigo-50 dark:from-[#0F172A] border-indigo-200 shadow-lg'}`} onClick={() => setSelected(msg)}>
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${msg.is_read ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white'}`}>
                                    {msg.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white leading-tight">{msg.full_name}</h3>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-1 uppercase tracking-tighter">
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(msg.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!msg.is_read && <span className="bg-indigo-500 w-2.5 h-2.5 rounded-full"></span>}
                                <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all"><Eye size={18}/></button>
                            </div>
                        </div>
                        <p className="mt-4 text-slate-700 dark:text-slate-300 font-medium line-clamp-2">{msg.text}</p>
                    </div>
                ))}
            </div>

            {/* Xabarni to'liq o'qish uchun Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
                    <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-3xl p-8 relative shadow-2xl border dark:border-slate-800 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelected(null)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400"><X size={20}/></button>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl">{selected.full_name.charAt(0)}</div>
                            <div><h2 className="text-xl font-black dark:text-white">{selected.full_name}</h2><p className="text-sm text-indigo-500 font-bold">{selected.phone}</p></div>
                        </div>
                        <div className="p-5 bg-slate-50 dark:bg-[#1E293B] rounded-2xl mb-6 border dark:border-slate-800 h-48 overflow-y-auto">
                            <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{selected.text}</p>
                        </div>
                        <div className="flex gap-3">
                            {!selected.is_read && <button onClick={() => markAsRead(selected.id)} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"><CheckCircle2 size={18}/> O'qildi</button>}
                            <button onClick={() => setSelected(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-white py-4 rounded-xl font-bold">Yopish</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Messages;
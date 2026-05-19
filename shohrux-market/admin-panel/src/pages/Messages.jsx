import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Mail, Phone, Calendar, CheckCircle2, User, Eye, X, MessageSquare } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useTranslation } from 'react-i18next'; // i18next yoki o'zingizning hook

const Messages = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);

    // Scroll lock for modal
    useScrollLock(!!selectedMessage);

    useEffect(() => { fetchMessages(); }, []);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/messages');
            setMessages(res.data);
        } catch(e) {}
    };

    const markAsRead = async (id) => {
        await api.put(`/messages/${id}/read`);
        fetchMessages();
        setSelectedMessage(null);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black tracking-tight mb-8 dark:text-white">{t('messages_title')}</h1>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {messages.map(msg => (
                    <div key={msg.id} className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group cursor-pointer hover:shadow-lg ${msg.is_read ? 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800' : 'bg-gradient-to-br from-white to-indigo-50 dark:from-[#0F172A] dark:to-indigo-950/20 border-indigo-200 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/5'}`} onClick={() => setSelectedMessage(msg)}>
                        {!msg.is_read && <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500 transform rotate-45 translate-x-8 -translate-y-8 z-0"></div>}
                        
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${msg.is_read ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : 'bg-indigo-600 text-white shadow-md'}`}>
                                    {msg.full_name ? msg.full_name.charAt(0) : t('msg_anonymous').charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight dark:text-white">{msg.full_name || t('msg_anonymous')}</h3>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-1">
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(msg.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                {!msg.is_read && (
                                    <button onClick={(e) => { e.stopPropagation(); markAsRead(msg.id); }} className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 bg-white dark:bg-[#0F172A] rounded-full p-1 shadow-sm transition-transform hover:scale-110" title={t('btn_read')}>
                                        <CheckCircle2 size={28}/>
                                    </button>
                                )}
                                <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Eye size={18}/>
                                </button>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                <Phone size={16} className="text-slate-400"/> {msg.phone || t('val_not_provided')}
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium truncate">
                                <Mail size={16} className="text-slate-400"/> {msg.email || t('val_not_provided')}
                            </div>
                        </div>

                        <div className="mt-4 p-5 bg-slate-50 dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-800 relative">
                            <span className="absolute -top-3 left-4 px-2 bg-slate-50 dark:bg-[#1E293B] text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('lbl_message_text')}</span>
                            <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium line-clamp-2">
                                {msg.text}
                            </p>
                        </div>
                    </div>
                ))}
                
                {messages.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-500">
                        {t('messages_not_found')}
                    </div>
                )}
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedMessage(null)}>
                    <div className="bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[#0F172A] p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
                                <MessageSquare size={20} className="text-indigo-500"/> {t('msg_details_title')}
                            </h2>
                            <button onClick={() => setSelectedMessage(null)} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Mijoz ma'lumotlari */}
                            <div className="p-5 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><User size={14}/> {t('lbl_msg_customer_info')}</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{t('cust_name')}:</span>
                                        <span className="font-bold dark:text-white">{selectedMessage.full_name || t('val_not_provided')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1"><Phone size={14}/> {t('cust_phone')}:</span>
                                        <span className="font-bold dark:text-white">{selectedMessage.phone || t('val_not_provided')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1"><Mail size={14}/> Email:</span>
                                        <span className="font-bold dark:text-white">{selectedMessage.email || t('val_not_provided')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1"><Calendar size={14}/> {t('lbl_date')}:</span>
                                        <span className="font-bold dark:text-white">{new Date(selectedMessage.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Xabar matni */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><MessageSquare size={14}/> {t('lbl_message_text')}</p>
                                <div className="p-5 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                                        {selectedMessage.text || t('val_not_provided')}
                                    </p>
                                </div>
                            </div>

                            {/* Amallar */}
                            <div className="flex gap-3 pt-4">
                                {!selectedMessage.is_read && (
                                    <button 
                                        onClick={() => markAsRead(selectedMessage.id)}
                                        className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors"
                                    >
                                        <CheckCircle2 size={18}/> {t('btn_read')}
                                    </button>
                                )}
                                <button 
                                    onClick={() => setSelectedMessage(null)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-white py-4 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {t('btn_close')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
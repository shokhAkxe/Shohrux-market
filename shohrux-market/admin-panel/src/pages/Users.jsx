import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Users, Search, Shield, ShieldOff, Trash2,
    Mail, Phone, MapPin, Calendar, X, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const UsersPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    // Dinamik rollar konfiguratsiyasi (i18n bilan)
    const roleConfig = {
        ADMIN:       { label: t('role_admin', 'Admin'),       color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' },
        SUPER_ADMIN: { label: t('role_super_admin', 'Super Admin'), color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' },
        USER:        { label: t('role_user', 'Foydalanuvchi'), color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
    };

    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        let result = users;
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(u =>
                u.full_name?.toLowerCase().includes(s) ||
                u.email?.toLowerCase().includes(s) ||
                u.phone?.includes(s)
            );
        }
        if (roleFilter !== 'ALL') result = result.filter(u => u.role === roleFilter);
        setFiltered(result);
    }, [search, roleFilter, users]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
            setFiltered(res.data);
        } catch (e) {
            toast.error(t('toast_users_fetch_error', 'Foydalanuvchilarni yuklashda xatolik'));
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (user) => {
        const newRole = user.role === 'USER' ? 'ADMIN' : 'USER';
        const label = newRole === 'ADMIN' ? t('role_admin', 'Admin') : t('role_user', 'Foydalanuvchi');
        if (!window.confirm(`${user.full_name} ${t('confirm_change_role', 'ni')} ${label} ${t('confirm_make', 'qilasizmi?')}`)) return;
        try {
            await api.put(`/users/${user.id}`, { role: newRole });
            toast.success(`${t('toast_role_updated', 'Rol yangilandi:')} ${label}`);
            fetchUsers();
            if (selectedUser?.id === user.id) setSelectedUser({ ...selectedUser, role: newRole });
        } catch {
            toast.error(t('toast_role_update_error', 'Rolni yangilashda xatolik'));
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm(t('confirm_delete_user', "Foydalanuvchini o'chirasizmi? Bu amalni qaytarib bo'lmaydi!"))) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success(t('toast_user_deleted', "Foydalanuvchi o'chirildi"));
            setSelectedUser(null);
            fetchUsers();
        } catch {
            toast.error(t('toast_delete_error', "O'chirishda xatolik"));
        }
    };

    const counts = {
        ALL: users.length,
        USER: users.filter(u => u.role === 'USER').length,
        ADMIN: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight dark:text-white">{t('users_title', 'Foydalanuvchilar')}</h1>
                    <p className="text-slate-400 text-sm mt-1">{t('total_registered', 'Jami')} {users.length} {t('ta_registered_count', "ta ro'yxatdan o'tgan")}</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm w-full sm:w-72">
                    <Search size={18} className="text-slate-400 flex-shrink-0"/>
                    <input
                        placeholder={t('search_users_placeholder', 'Ism, email yoki tel...')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent outline-none w-full text-sm dark:text-white placeholder-slate-400"
                    />
                    {search && <button onClick={() => setSearch('')}><X size={16} className="text-slate-400"/></button>}
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {[
                    ['ALL', t('tab_all_users', 'Barchasi'), counts.ALL], 
                    ['USER', t('tab_only_users', 'Foydalanuvchilar'), counts.USER], 
                    ['ADMIN', t('tab_admins', 'Adminlar'), counts.ADMIN]
                ].map(([val, label, count]) => (
                    <button
                        key={val}
                        onClick={() => setRoleFilter(val)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                            roleFilter === val
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                : 'bg-white dark:bg-[#0F172A] text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                    >
                        {label} ({count || 0})
                    </button>
                ))}
            </div>

            {/* Jadval */}
            <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">#</th>
                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">{t('th_user', 'Foydalanuvchi')}</th>
                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">{t('th_tel', 'Tel')}</th>
                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">{t('th_date_joined', 'Sana')}</th>
                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">{t('th_role', 'Rol')}</th>
                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-4">{t('th_actions', 'Amal')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u, i) => {
                                const rc = roleConfig[u.role] || roleConfig.USER;
                                return (
                                    <tr
                                        key={u.id}
                                        onClick={() => setSelectedUser(u)}
                                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 text-sm text-slate-400">{i + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                                    {u.picture
                                                        ? <img src={u.picture} alt="" className="w-9 h-9 rounded-xl object-cover"/>
                                                        : u.full_name?.charAt(0).toUpperCase()
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{u.full_name}</p>
                                                    <p className="text-xs text-slate-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                                            {u.phone || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                                            {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${rc.color}`}>
                                                {rc.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => toggleRole(u)}
                                                    title={u.role === 'USER' ? t('hint_make_admin', 'Admin qilish') : t('hint_make_user', 'Foydalanuvchi qilish')}
                                                    className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-500 transition-colors"
                                                >
                                                    {u.role === 'USER' ? <Shield size={17}/> : <ShieldOff size={17}/>}
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(u.id)}
                                                    title={t('hint_delete', "O'chirish")}
                                                    className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={17}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="py-20 text-center text-slate-400">
                            <Users size={40} className="mx-auto mb-3 opacity-30"/>
                            <p>{t('users_not_found', 'Foydalanuvchilar topilmadi')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full">
                            <X size={20}/>
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-3xl mx-auto overflow-hidden">
                                {selectedUser.picture
                                    ? <img src={selectedUser.picture} alt="" className="w-full h-full object-cover"/>
                                    : selectedUser.full_name?.charAt(0).toUpperCase()
                                }
                            </div>
                            <h2 className="text-2xl font-black mt-4 dark:text-white">{selectedUser.full_name}</h2>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${roleConfig[selectedUser.role]?.color}`}>
                                {roleConfig[selectedUser.role]?.label}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {[
                                { icon: <Mail size={16}/>, label: 'Email', val: selectedUser.email },
                                { icon: <Phone size={16}/>, label: t('lbl_phone', 'Telefon'), val: selectedUser.phone || t('val_not_provided', 'Kiritilmagan') },
                                { icon: <MapPin size={16}/>, label: t('lbl_address', 'Manzil'), val: selectedUser.address || t('val_not_provided', 'Kiritilmagan') },
                                { icon: <Calendar size={16}/>, label: t('lbl_joined_date', "Qo'shilgan"), val: new Date(selectedUser.createdAt).toLocaleString('uz-UZ') },
                            ].map(({ icon, label, val }) => (
                                <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#1e293b] rounded-xl">
                                    <span className="text-slate-400">{icon}</span>
                                    <div>
                                        <p className="text-xs text-slate-400">{label}</p>
                                        <p className="font-semibold text-sm dark:text-white">{val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { toggleRole(selectedUser); }}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors"
                            >
                                {selectedUser.role === 'USER' ? `🛡 ${t('btn_make_admin', 'Admin qilish')}` : `👤 ${t('btn_make_user', 'User qilish')}`}
                            </button>
                            <button
                                onClick={() => deleteUser(selectedUser.id)}
                                className="py-3 px-5 bg-rose-100 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-200 rounded-xl font-bold transition-colors"
                                title={t('hint_delete', "O'chirish")}
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
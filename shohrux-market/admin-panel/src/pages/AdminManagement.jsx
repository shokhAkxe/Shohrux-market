import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, Edit2, Trash2, X, Eye, EyeOff, ShieldCheck, Edit } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import Button from '../components/Button';
import { useTranslation } from 'react-i18next';

const AdminManagement = () => {
    const { t } = useTranslation();
    const [admins, setAdmins] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ full_name: '', login: '', password: '', role: 'ADMIN' });

    // Scroll lock for modal
    useScrollLock(isModalOpen);

    useEffect(() => { fetchAdmins(); }, []);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/users');
            setAdmins(res.data.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'));
        } catch (error) {
            console.error("Adminlarni yuklashda xatolik", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editMode) {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await api.put(`/users/${currentId}`, updateData);
            } else {
                await api.post('/auth/register', formData);
            }
            setIsModalOpen(false);
            fetchAdmins();
        } catch (error) {
            alert(t('error_occurred'));
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (admin) => {
        setEditMode(true);
        setCurrentId(admin.id);
        setFormData({ full_name: admin.full_name, login: admin.login || admin.email, password: '', role: admin.role });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditMode(false);
        setFormData({ full_name: '', login: '', password: '', role: 'ADMIN' });
        setIsModalOpen(true);
    };

    const deleteAdmin = async (id) => {
        if (window.confirm(t('confirm_delete_admin'))) {
            await api.delete(`/users/${id}`);
            fetchAdmins();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black tracking-tight">{t('admin_management_title')}</h1>
                <Button onClick={openAddModal} icon={UserPlus}>{t('add_new_admin')}</Button>
            </div>

            <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="text-emerald-500"/> {t('active_admins_list')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {admins.map(admin => (
                        <div key={admin.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-lg">
                                    {admin.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white leading-tight">{admin.full_name}</p>
                                    <p className="text-[11px] text-slate-500 font-semibold mt-1">{admin.login || admin.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => openEditModal(admin)} icon={Edit} className="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10" />
                                <Button variant="ghost" size="sm" onClick={() => deleteAdmin(admin.id)} icon={Trash2} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in zoom-in-95 duration-200">
                        {/* X tugmasi - oddiy button, o'ng tarafda */}
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)} 
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <h2 className="text-2xl font-black mb-6 pr-8">{editMode ? t('edit_admin') : t('add_new_admin')}</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('full_name')}</label>
                                <input type="text" className="w-full p-4 bg-slate-50 dark:bg-[#1E293B] rounded-xl outline-none focus:ring-2 ring-indigo-500 transition-all dark:text-white" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('login')}</label>
                                <input type="text" className="w-full p-4 bg-slate-50 dark:bg-[#1E293B] rounded-xl outline-none focus:ring-2 ring-indigo-500 transition-all dark:text-white" value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{editMode ? t('new_password_optional') : t('password')}</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder={editMode ? "*******" : t('enter_password')} 
                                        className="w-full p-4 bg-slate-50 dark:bg-[#1E293B] rounded-xl outline-none focus:ring-2 ring-indigo-500 transition-all dark:text-white pr-12" 
                                        value={formData.password} 
                                        onChange={e => setFormData({...formData, password: e.target.value})} 
                                        required={!editMode} 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full py-4 mt-4" loading={loading}>
                                {editMode ? t('save') : t('add')}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
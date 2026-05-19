import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // axios instance
import { Plus, Edit3, Trash2, X, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useTranslation } from 'react-i18next'; // 👈 i18n ulandi
import Button from '../components/Button';

const Products = () => {
    const { t } = useTranslation(); // 👈 Tarjima funksiyasi
    const [products, setProducts] = useState([]);
    const [staticProducts, setStaticProducts] = useState([]);
    const [isModal, setIsModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isStaticProduct, setIsStaticProduct] = useState(false);
    
    // Scroll lock for modal
    useScrollLock(isModal);
    
    // Form holati - Backend Prisma modeliga moslangan
    const [formData, setFormData] = useState({
        brand: '',
        category: 'phone',
        price: '',
        nomi: { uz: '', en: '', ru: '' },
        description: { uz: '', en: '', ru: '' }
    });

    useEffect(() => { 
        fetchProducts(); 
        fetchStaticProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch(e) { console.error("Xatolik:", e); }
    };

    const fetchStaticProducts = async () => {
        try {
            // Fetch static products from frontend data
            const res = await fetch('/src/data/products.js');
            const text = await res.text();
            // Extract products array from the file
            const match = text.match(/const products = (\[[\s\S]*?\]);/);
            if (match) {
                const productsData = eval(match[1]);
                setStaticProducts(productsData.map(p => ({
                    ...p,
                    isStatic: true,
                    name_uz: p.nomi?.uz,
                    name_en: p.nomi?.en,
                    name_ru: p.nomi?.ru,
                    desc_uz: p.desc?.uz,
                    desc_en: p.desc?.en,
                    desc_ru: p.desc?.ru,
                    image_url: p.img,
                    category: p.cat
                })));
            }
        } catch(e) { 
            console.error("Static mahsulotlarni yuklashda xatolik:", e);
            // Fallback: use hardcoded sample data if fetch fails
            setStaticProducts([]);
        }
    };

    // Yangi mahsulot qo'shish oynasini ochish
    const openAdd = () => {
        setEditId(null); // Tahrirlash rejimini o'chirish
        setFiles([]); // Fayllarni tozalash
        setFormData({ // Formani reset qilish
            brand: '',
            category: 'phone',
            price: '',
            nomi: { uz: '', en: '', ru: '' },
            description: { uz: '', en: '', ru: '' }
        });
        setIsModal(true);
    };

    // Tahrirlash oynasini ochish
    const openEdit = (p) => {
        if (String(p.id).startsWith('tmdb-')) {
            alert(t('tmdb_edit_error', 'TMDB mahsulotlarini tahrirlash imkoniyati yo\'q!'));
            return;
        }

        setEditId(p.id);
        setFormData({
            brand: p.brand || '',
            category: p.category || p.cat || 'phone',
            price: p.price || p.narxi || '',
            nomi: { 
                uz: p.name_uz || p.nomi?.uz || '', 
                en: p.name_en || p.nomi?.en || '', 
                ru: p.name_ru || p.nomi?.ru || '' 
            },
            description: { 
                uz: p.desc_uz || p.description?.uz || p.desc?.uz || '', 
                en: p.desc_en || p.description?.en || p.desc?.en || '', 
                ru: p.desc_ru || p.description?.ru || p.desc?.ru || '' 
            }
        });
        setIsModal(true);
    };

    const deleteProd = async (id, isStatic = false) => {
        if (String(id).startsWith('tmdb-')) {
            alert(t('tmdb_delete_error', 'Bu mahsulot TMDB dan olingan. Uni o\'chirib bo\'lmaydi!'));
            return;
        }

        if (isStatic) {
            alert(t('static_delete_error', 'Static mahsulotlarni o\'chirib bo\'lmaydi! Frontend data faylidan o\'chirishingiz kerak.'));
            return;
        }

        if (window.confirm(t('confirm_delete', 'Rostdan ham o\'chirasizmi?'))) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (e) { 
                console.error(e);
                alert(t('delete_error', 'O\'chirishda xatolik yuz berdi')); 
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('brand', formData.brand);
        data.append('price', formData.price);
        data.append('category', formData.category);
        data.append('name_uz', formData.nomi.uz);
        data.append('name_en', formData.nomi.en);
        data.append('name_ru', formData.nomi.ru);
        data.append('desc_uz', formData.description.uz);
        data.append('desc_en', formData.description.en || "");
        data.append('desc_ru', formData.description.ru || "");

        if (files.length > 0) {
            files.forEach(f => data.append('images', f));
        }

        try {
            if (editId) {
                await api.put(`/products/${editId}`, data);
            } else {
                await api.post('/products', data);
            }
            setIsModal(false);
            fetchProducts();
            setFiles([]);
        } catch(error) {
            console.error(error);
            alert(t('save_error', 'Saqlashda xatolik yuz berdi'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight dark:text-white">{t('products', 'Mahsulotlar')}</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {t('total_products', 'Jami')} {products.length + staticProducts.length} {t('ta_product', 'ta mahsulot')}
                    </p>
                </div>
                <Button onClick={openAdd} icon={Plus}>{t('add_product', 'Mahsulot qo\'shish')}</Button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-[#1E293B] text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="p-5">{t('th_product', 'Mahsulot')}</th>
                                <th className="p-5">{t('th_category_brand', 'Kategoriya & Brand')}</th>
                                <th className="p-5">{t('th_price', 'Narx')}</th>
                                <th className="p-5 text-right">{t('th_actions', 'Amallar')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {products.length > 0 || staticProducts.length > 0 ? (
                                <>
                                    {/* Backend Products */}
                                    {products.map(p => (
                                        <tr key={`backend-${p.id}`} className="hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-colors group">
                                            <td className="p-5 flex items-center gap-4">
                                                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} className="w-full h-full object-cover" alt={p.name_uz}/>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Plus/></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{p.name_uz}</span>
                                                    <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{t('status_backend', 'Backend')}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                                    {p.category} / {p.brand}
                                                </span>
                                            </td>
                                            <td className="p-5 text-indigo-600 dark:text-indigo-400 font-black tracking-tight">
                                                {Number(p.price).toLocaleString()} UZS
                                            </td>
                                            <td className="p-5">
                                                <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} icon={Edit3} className="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10" />
                                                    <Button variant="ghost" size="sm" onClick={() => deleteProd(p.id, false)} icon={Trash2} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Static Products */}
                                    {staticProducts.map(p => (
                                        <tr key={`static-${p.id}`} className="hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-colors group bg-slate-50/50 dark:bg-slate-800/30">
                                            <td className="p-5 flex items-center gap-4">
                                                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} className="w-full h-full object-cover" alt={p.name_uz}/>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Plus/></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{p.name_uz}</span>
                                                    <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{t('status_static', 'Static')}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                                    {p.category} / {p.brand}
                                                </span>
                                            </td>
                                            <td className="p-5 text-indigo-600 dark:text-indigo-400 font-black tracking-tight">
                                                {Number(p.narxi || p.price).toLocaleString()} UZS
                                            </td>
                                            <td className="p-5">
                                                <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} icon={Edit3} className="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10" title={t('title_move_to_backend', 'Static mahsulotni backend\'ga ko\'chirish')} />
                                                    <Button variant="ghost" size="sm" onClick={() => deleteProd(p.id, true)} icon={Trash2} className="text-slate-400 cursor-not-allowed" title={t('title_cannot_delete_static', 'Static mahsulotni o\'chirib bo\'lmaydi')} disabled />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-slate-400">{t('no_products_yet', 'Hozircha mahsulotlar yo\'q')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#0F172A] w-full max-w-4xl rounded-3xl p-6 md:p-10 shadow-2xl relative my-8 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-8">
                            <h2 className="text-2xl font-black dark:text-white">
                                {editId ? t('edit_product', 'Mahsulotni Tahrirlash') : t('add_product_title', 'Yangi Mahsulot Qo\'shish')}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => setIsModal(false)} icon={X} className="text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full" />
                        </div>
                        
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('lbl_category_brand', 'Kategoriya & Brand')}</label>
                                    <div className="flex gap-4">
                                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-1/2 p-4 bg-slate-50 dark:bg-[#1E293B] rounded-xl outline-none focus:ring-2 ring-indigo-500 dark:text-white border border-transparent dark:border-slate-700">
                                            <option value="phone">{t('opt_phone', 'Telefon')}</option>
                                            <option value="laptop">{t('opt_laptop', 'Noutbuk')}</option>
                                            <option value="accessory">{t('opt_accessory', 'Aksessuar')}</option>
                                            <option value="smartwatch">{t('opt_smartwatch', 'Smart Soat')}</option>
                                        </select>
                                        <input type="text" placeholder={t('placeholder_brand', 'Brand')} value={formData.brand} className="w-1/2 p-4 bg-slate-50 dark:bg-[#1E293B] rounded-xl outline-none focus:ring-2 ring-indigo-500 dark:text-white border border-transparent dark:border-slate-700" onChange={e => setFormData({...formData, brand: e.target.value})} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('lbl_name_3_lang', 'Nomi (3 tilda)')}</label>
                                    <div className="space-y-3">
                                        <input type="text" placeholder={t('placeholder_name_uz', 'O\'zbekcha nomi')} value={formData.nomi.uz} className="w-full p-4 bg-slate-50 dark:bg-[#1E293B] rounded-xl outline-none focus:ring-2 ring-indigo-500 dark:text-white border border-transparent dark:border-slate-700" onChange={e => setFormData({...formData, nomi: {...formData.nomi, uz: e.target.value}})} required />
                                        <input type="text" placeholder={t('placeholder_name_en', 'English name')} value={formData.nomi.en} className="w-full p-4 bg-slate-50 dark:bg-[#1E293B] rounded-xl outline-none focus:ring-2 ring-indigo-500 dark:text-white border border-transparent dark:border-slate-700" onChange={e => setFormData({...formData, nomi: {...formData.nomi, en: e.target.value}})} />
                                        <input type="text" placeholder={t('placeholder_name_ru', 'Русское название')} value={formData.nomi.ru} className="w-full p-4 bg-slate-50 dark:bg-[#1E293B] rounded-xl outline-none focus:ring-2 ring-indigo-500 dark:text-white border border-transparent dark:border-slate-700" onChange={e => setFormData({...formData, nomi: {...formData.nomi, ru: e.target.value}})} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-5 flex flex-col">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('lbl_price', 'Narxi (UZS)')}</label>
                                    <input type="number" placeholder="0" value={formData.price} className="w-full p-4 bg-slate-50 dark:bg-[#1E293B] rounded-xl font-black text-indigo-600 dark:text-indigo-400 text-xl outline-none focus:ring-2 ring-indigo-500 border border-transparent dark:border-slate-700" onChange={e => setFormData({...formData, price: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">{t('lbl_description_uz', 'Tavsif (UZ)')}</label>
                                    <textarea placeholder={t('placeholder_description_uz', 'Mahsulot haqida ma\'lumot...')} value={formData.description.uz} className="w-full p-4 bg-slate-50 dark:bg-[#1E293B] rounded-xl h-24 outline-none resize-none focus:ring-2 ring-indigo-500 dark:text-white border border-transparent dark:border-slate-700" onChange={e => setFormData({...formData, description: {...formData.description, uz: e.target.value}})}></textarea>
                                </div>
                                <div className="flex-1 min-h-[120px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center relative group hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-[#1E293B]/50 cursor-pointer p-4">
                                    <UploadCloud className="text-slate-400 group-hover:text-indigo-500 transition-colors mb-2" size={32} />
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 text-center">
                                        {files.length > 0 ? `${files.length} ${t('images_selected', 'ta rasm tanlandi')}` : t('select_images', 'Rasmlarni tanlang')}
                                    </p>
                                    <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFiles(Array.from(e.target.files))} accept="image/*" />
                                </div>
                                <Button type="submit" loading={loading} className="w-full py-4 mt-auto" icon={CheckCircle}>
                                    {editId ? t('btn_save_changes', 'O\'garishlarni Saqlash') : t('btn_create_product', 'Mahsulotni Yaratish')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAdmin } from '../context/AdminContext';
import { Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    // Email o'rniga username (login) ishlatamiz
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Parolni ko'rsatish holati
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAdmin();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // ASOSIY: Backend bilan ishlash qismi
        try {
            // Render backend-ga haqiqiy so'rov yuboramiz
            const res = await api.post('/auth/login', { username, password });
            
            // Backend-dan kelgan foydalanuvchi va haqiqiy tokenni olamiz
            const { user, token } = res.data;

            if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
                // Haqiqiy user va tokenni context-ga (va localStorage-ga) saqlaymiz
                login(user, token);
                navigate('/admin');
            } else {
                setError("Sizda admin huquqlari yo'q!");
            }
        } catch (err) {
            // Backend-dan kelgan aniq xatolik xabarini ko'rsatamiz
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "Login yoki parol noto'g'ri!";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#0B1120] relative overflow-hidden">
            {/* Background bezaklari */}
            <div className="absolute w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -top-40 -left-20 pointer-events-none"></div>
            <div className="absolute w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] bottom-0 right-0 pointer-events-none"></div>
            
            <div className="w-full max-w-md p-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] shadow-2xl z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-600 mx-auto rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-indigo-500/30 mb-6">S</div>
                    <h1 className="text-3xl font-black text-white tracking-tight">SH-Market</h1>
                    <p className="text-slate-400 mt-2 text-sm">Boshqaruv tizimiga xush kelibsiz</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/50 rounded-2xl text-rose-400 text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Login (Username) maydoni */}
                    <div className="relative group">
                        <User className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Login (masalan: admin)" 
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                        />
                    </div>

                    {/* Parol maydoni (Ko'rish funksiyasi bilan) */}
                    <div className="relative group">
                        <Lock className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Parol" 
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>Tizimga kirish <ArrowRight size={20}/></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
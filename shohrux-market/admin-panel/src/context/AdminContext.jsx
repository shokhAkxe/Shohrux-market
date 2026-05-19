import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n from '../i18n';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'uz');
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('admin_user')) || null);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('lang', lang);
        i18n.changeLanguage(lang);
    }, [lang]);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        localStorage.setItem('admin_token', token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
    };

    return (
        <AdminContext.Provider value={{ darkMode, setDarkMode, lang, setLang, user, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
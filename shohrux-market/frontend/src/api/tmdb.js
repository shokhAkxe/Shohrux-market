import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY; 
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const MY_API_URL = import.meta.env.VITE_API_URL; 

export const fetchMoviesAsProducts = async () => {
    try {
        // 1. O'zimizning backenddan mahsulotlarni olamiz
        let myProducts = [];
        try {
            const myRes = await axios.get(`${MY_API_URL}/products`);
            myProducts = myRes.data.map(p => ({
                id: p.id,
                brand: p.brand,
                cat: p.category,
                narxi: p.price,
                img: p.image_url || "https://via.placeholder.com/500",
                imgs: p.gallery?.length > 0 ? p.gallery : [p.image_url],
                nomi: { uz: p.name_uz, en: p.name_en, ru: p.name_ru },
                desc: { uz: p.desc_uz, en: p.desc_en, ru: p.desc_ru },
                rating: p.rating || 0,
                isLocal: true // O'zimizniki ekanligini bilish uchun
            }));
        } catch (e) {
            console.error("Lokal API xatosi (bazada mahsulot yo'q bo'lishi mumkin):", e);
        }

        // 2. TMDB dan kinolarni olamiz
        const tmdbRes = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: { api_key: TMDB_API_KEY, language: 'uz-UZ', page: 1 }
        });

        const tmdbProducts = tmdbRes.data.results.map(movie => ({
            id: `tmdb-${movie.id}`,
            brand: "TMDB",
            cat: "movie",
            narxi: 45000, // Kinolar uchun fiksirlangan narx
            img: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            imgs: [`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`],
            nomi: { uz: movie.title, en: movie.title, ru: movie.title },
            desc: { uz: movie.overview, en: movie.overview, ru: movie.overview },
            rating: movie.vote_average,
            isLocal: false
        }));

        // 3. Ikkalasini birlashtiramiz (O'zimizniki har doim birinchi tursin)
        return [...myProducts, ...tmdbProducts];

    } catch (error) {
        console.error("Umumiy xatolik:", error);
        return [];
    }
};
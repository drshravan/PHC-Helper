import { useState, useEffect } from 'react';

const FAV_KEY = 'phc_favorites';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem(FAV_KEY);
        if (stored) {
            try {
                setFavorites(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse favorites", e);
            }
        }
    }, []);

    const saveFavorites = (favs) => {
        setFavorites(favs);
        localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    };

    const isFavorite = (path) => {
        return favorites.some(f => f.path === path);
    };

    /**
     * Toggles a favorite item.
     * @param {Object} item - { title, icon, path, color }
     */
    const toggleFavorite = (item) => {
        if (isFavorite(item.path)) {
            const newFavs = favorites.filter(f => f.path !== item.path);
            saveFavorites(newFavs);
        } else {
            const newFavs = [...favorites, item];
            saveFavorites(newFavs);
        }
    };

    return { favorites, isFavorite, toggleFavorite };
};

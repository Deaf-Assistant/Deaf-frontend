import { useState, useEffect, useCallback } from 'react';
import { favoritesApi } from '@/lib/fav_api';
import { useAuth } from '@/hooks/useAuth';

interface UseFavoriteOptions {
    onToggle?: (isFavorited: boolean) => void;
    onError?: (error: Error) => void;
}

export function useFavorite(vocabularyId: string, options?: UseFavoriteOptions) {
    const { isAuthenticated } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Check favorite status on mount
    useEffect(() => {
        const checkStatus = async () => {
            if (!isAuthenticated || !vocabularyId) {
                setInitialLoading(false);
                return;
            }

            try {
                const status = await favoritesApi.isFavorited(vocabularyId);
                setIsFavorited(status);
            } catch (error) {
                console.error('Failed to check favorite status:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        checkStatus();
    }, [vocabularyId, isAuthenticated]);

    // Toggle favorite
    const toggleFavorite = useCallback(async () => {
        if (!isAuthenticated) {
            const error = new Error('กรุณาเข้าสู่ระบบก่อน');
            options?.onError?.(error);
            return;
        }

        try {
            setLoading(true);
            const newStatus = await favoritesApi.toggleFavorite(vocabularyId);
            setIsFavorited(newStatus);
            options?.onToggle?.(newStatus);
        } catch (error: any) {
            console.error('Failed to toggle favorite:', error);
            options?.onError?.(error);
        } finally {
            setLoading(false);
        }
    }, [vocabularyId, isAuthenticated, options]);

    // Add to favorites
    const addFavorite = useCallback(async () => {
        if (!isAuthenticated) {
            const error = new Error('กรุณาเข้าสู่ระบบก่อน');
            options?.onError?.(error);
            return;
        }

        try {
            setLoading(true);
            await favoritesApi.addFavorite(vocabularyId);
            setIsFavorited(true);
            options?.onToggle?.(true);
        } catch (error: any) {
            console.error('Failed to add favorite:', error);
            options?.onError?.(error);
        } finally {
            setLoading(false);
        }
    }, [vocabularyId, isAuthenticated, options]);

    // Remove from favorites
    const removeFavorite = useCallback(async () => {
        if (!isAuthenticated) {
            const error = new Error('กรุณาเข้าสู่ระบบก่อน');
            options?.onError?.(error);
            return;
        }

        try {
            setLoading(true);
            await favoritesApi.removeFavorite(vocabularyId);
            setIsFavorited(false);
            options?.onToggle?.(false);
        } catch (error: any) {
            console.error('Failed to remove favorite:', error);
            options?.onError?.(error);
        } finally {
            setLoading(false);
        }
    }, [vocabularyId, isAuthenticated, options]);

    return {
        isFavorited,
        loading,
        initialLoading,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        isAuthenticated,
    };
}

export default useFavorite;
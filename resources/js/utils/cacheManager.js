/**
 * Global Cache Manager
 * Manages caching with TTL (Time To Live) support
 */

const CACHE_PREFIX = "ims_cache_";
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default TTL

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
export const getCachedData = (key) => {
    try {
        const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
        if (!cached) return null;

        const { data, timestamp, ttl } = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is expired
        if (ttl && (now - timestamp) > ttl) {
            // Cache expired, remove it
            localStorage.removeItem(`${CACHE_PREFIX}${key}`);
            return null;
        }

        return data;
    } catch (err) {
        console.error("Error getting cached data:", err);
        return null;
    }
};

/**
 * Set cached data
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 */
export const setCachedData = (key, data, ttl = DEFAULT_TTL) => {
    try {
        const cacheObject = {
            data,
            timestamp: Date.now(),
            ttl,
        };
        localStorage.setItem(
            `${CACHE_PREFIX}${key}`,
            JSON.stringify(cacheObject)
        );
    } catch (err) {
        console.error("Error setting cached data:", err);
        // If storage is full, clear old caches
        if (err.name === "QuotaExceededError") {
            clearExpiredCaches();
        }
    }
};

/**
 * Clear specific cache
 * @param {string} key - Cache key to clear
 */
export const clearCache = (key) => {
    try {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (err) {
        console.error("Error clearing cache:", err);
    }
};

/**
 * Clear all expired caches
 */
export const clearExpiredCaches = () => {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
            if (key.startsWith(CACHE_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const { timestamp, ttl } = JSON.parse(cached);
                        const now = Date.now();
                        if (ttl && (now - timestamp) > ttl) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch (err) {
                    // If can't parse, remove it
                    localStorage.removeItem(key);
                }
            }
        });
    } catch (err) {
        console.error("Error clearing expired caches:", err);
    }
};

/**
 * Clear all caches
 */
export const clearAllCaches = () => {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (err) {
        console.error("Error clearing all caches:", err);
    }
};

/**
 * Get cache info (for debugging)
 * @param {string} key - Cache key
 * @returns {object|null} - Cache info or null
 */
export const getCacheInfo = (key) => {
    try {
        const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
        if (!cached) return null;

        const { timestamp, ttl } = JSON.parse(cached);
        const now = Date.now();
        const age = now - timestamp;
        const isExpired = ttl && age > ttl;
        const expiresIn = ttl ? Math.max(0, ttl - age) : null;

        return {
            exists: true,
            timestamp,
            age,
            ttl,
            isExpired,
            expiresIn,
        };
    } catch (err) {
        console.error("Error getting cache info:", err);
        return null;
    }
};

// Clear expired caches on module load
if (typeof window !== "undefined") {
    clearExpiredCaches();
}


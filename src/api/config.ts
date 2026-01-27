const getApiBaseUrl = () => {
    let url = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080';

    // Force HTTPS for Railway deployments
    if (url.includes('railway.app') && url.startsWith('http://')) {
        url = url.replace('http://', 'https://');
    }

    // Ensure protocol is present
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }

    return url;
};

export const API_BASE_URL = getApiBaseUrl();

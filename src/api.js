const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = rawApiBaseUrl && !/^https?:\/\//i.test(rawApiBaseUrl)
  ? `https://${rawApiBaseUrl}`
  : rawApiBaseUrl;

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  return `${API_BASE_URL.replace(/\/$/, '')}${normalizedPath}`;
};

/**
 * Helper utility to resolve asset URLs (products, brands, etc.)
 * Ensures that relative paths or upload paths are properly resolved against the backend server,
 * and fixes common typos like /upload/ -> /uploads/ based on Spring Boot ResourceHandler configuration.
 */
export const getAssetUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string') return '';
  
  let clean = url.trim();
  if (!clean) return '';

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  let backendOrigin = 'http://localhost:8080';
  try {
    if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
      backendOrigin = new URL(apiBase).origin;
    }
  } catch {
    backendOrigin = 'http://localhost:8080';
  }

  // If already an absolute HTTP/HTTPS or data URL
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    // Fix common typo: /upload/ -> /uploads/ on localhost backend
    // Spring Boot WebConfig registers: registry.addResourceHandler("/uploads/**")
    if (clean.includes('/upload/') && !clean.includes('/uploads/')) {
      clean = clean.replace('/upload/', '/uploads/');
    }
    // If backend localhost URL without /uploads/ or /api/
    // e.g. http://localhost:8080/sample.png -> http://localhost:8080/uploads/sample.png
    else if (
      clean.startsWith(backendOrigin + '/') &&
      !clean.startsWith(backendOrigin + '/uploads/') &&
      !clean.startsWith(backendOrigin + '/api/')
    ) {
      clean = clean.replace(backendOrigin + '/', `${backendOrigin}/uploads/`);
    }
    return clean;
  }

  // If relative path: normalize leading slash
  if (!clean.startsWith('/')) {
    clean = `/${clean}`;
  }

  // Fix /upload/ -> /uploads/
  if (clean.startsWith('/upload/')) {
    clean = clean.replace('/upload/', '/uploads/');
  } else if (!clean.startsWith('/uploads/')) {
    clean = `/uploads${clean}`;
  }

  return `${backendOrigin}${clean}`;
};

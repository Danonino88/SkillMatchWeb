const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';
const UPLOADS_BASE = process.env.REACT_APP_UPLOADS_BASE_URL || 'http://localhost:4000/uploads';
const AUTH_BASE = `${API_BASE}/auth`;

const buildFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  const cleanPath = String(path)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^uploads\//, '');

  return `${UPLOADS_BASE}/${cleanPath}`;
};

export { API_BASE, AUTH_BASE, UPLOADS_BASE, buildFileUrl };

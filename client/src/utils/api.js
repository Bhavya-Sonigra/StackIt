const API_BASE_URL = 'http://localhost:5000/api';

export const api = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = localStorage.getItem('accessToken');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const defaultOptions = {
    credentials: 'include',
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  };

  let response;
  try {
    response = await fetch(url, { ...defaultOptions, ...options });
  } catch (err) {
    console.error('Network error:', err);
    throw new Error('Network error: Could not reach API');
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
      throw new Error('Unauthorized');
    }

    let data = {};
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }
    throw new Error(data.message || 'Something went wrong');
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return {};
};

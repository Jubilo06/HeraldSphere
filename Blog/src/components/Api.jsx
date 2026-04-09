import axios from 'axios';

const baseURL = 'http://localhost:5014';
console.log(`[API Config] Running in ${import.meta.env.PROD ? 'Production' : 'Development'} mode.`);
console.log(`[API Config] Base URL set to: ${baseURL}`);
const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,  // Longer for mobile
    withCredentials: true,  // Cross-origin cookies
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'  // Triggers preflight properly
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;  
      console.log("Axios Interceptor: Token found, adding to headers.");
      console.log("Axios Interceptor: Authorization Header:", config.headers.Authorization);
    } else {
      console.warn("Axios Interceptor: No token found in localStorage.");
    }
    const fullUrl = new URL(config.url, config.baseURL || window.location.origin).href;
    
    console.log('API Request Details:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: fullUrl,
      origin: window.location.origin,
      withCredentials: config.withCredentials
    });
    return config;
  },error => {
    console.error('Request Setup Error:', error);
    return Promise.reject(error);
  }
);
  api.interceptors.response.use(
    response => {
      console.log('API Success:', response.status, response.config.url);
      return response;
    },
    error => {
      const fullUrl = error.config ? new URL(error.config.url, error.config.baseURL || window.location.origin).href : 'Unknown';
      console.error('API Failure Details:', {
        code: error.code,
        message: error.message,
        status: error.response?.status || 'No Response',
        url: error.config?.url,
        fullURL: fullUrl
      });
      return Promise.reject(error);
    }
  );
export default api;
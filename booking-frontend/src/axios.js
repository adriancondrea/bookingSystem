import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api'
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('userToken');
  config.headers.Authorization =  token ? `Bearer ${token}` : '';
  return config;
});

export default axiosInstance;

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://q-generator.com/',
  // 필요하다면 withCredentials, timeout 등 추가 설정 가능
});

export default axiosInstance;

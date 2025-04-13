/* 'use server';
import axios from "axios";
import { cookies } from "next/headers";

const axiosServer = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true,
});

axiosServer.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Вызываем refresh, который установит новые куки
        const refreshToken = cookies().get('refreshToken')?.value;
        await axios.post("http://localhost:3001/refresh/server", {refreshToken}, { withCredentials: true });

        // Повторяем запрос после обновления токена
        return axios.request(error.config);
      } catch (refreshError) {
        console.error("Refresh Token Error:", refreshError);
        // Обрабатываем ошибку, например, перенаправляем на логин
      }
    }

    return Promise.reject(error);
  }
);

export default axiosServer;
 */
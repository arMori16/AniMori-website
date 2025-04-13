
import axios from "axios";
import Cookies from "js-cookie";


axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.withCredentials = true;
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          // Attempt to refresh token
          const tokens = await axios.post('/refresh',refreshToken,{
            headers:{
                'Authorization':`Bearer ${refreshToken}`
            }
          });
          const fifteenMinutes = 15 * 60 * 1000;
          const expirationDate = new Date(Date.now() + fifteenMinutes);
          Cookies.set('accessToken', tokens.data.access_token, { expires: expirationDate }); // 15 minutes
          Cookies.set('refreshToken', tokens.data.refresh_token, { expires: 28 }); // 28 days
          
          // Retry the failed request with the new access token
          error.config.headers['Authorization'] = `Bearer ${tokens.data.access_token}`;
          return axios(error.config);
        } catch (refreshError) {
          console.error('Token refresh failed', refreshError);
          return Promise.reject(refreshError);
          // Optionally redirect user to login or handle token expiration
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axios;

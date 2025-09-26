import axios from "axios";
import Cookies from "js-cookie";

const sgerpCfeAPI = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
});

sgerpCfeAPI.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

sgerpCfeAPI.interceptors.response.use(
    (response) => {
        const newToken = response.headers["Set-Authorization"];
        if (newToken) {
            Cookies.set("token", newToken, { expires: 1 });
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default sgerpCfeAPI;

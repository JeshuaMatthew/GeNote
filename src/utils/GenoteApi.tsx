import axios from "axios";

const GenoteApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export const setAuthTokenOnGenoteApi = (token : string | undefined) => {
    if (token) {
       GenoteApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
       delete GenoteApi.defaults.headers.common['Authorization'];
    }
}


export default GenoteApi;
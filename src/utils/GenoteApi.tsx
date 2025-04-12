import axios from "axios";

const GenoteApi = axios.create({
    baseURL: "http://localhost:8000/",
});

export const setAuthTokenOnGenoteApi = (token: string | undefined) => {
    if (token) {
       GenoteApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
       delete GenoteApi.defaults.headers.common['Authorization'];
    }
}

export default GenoteApi;
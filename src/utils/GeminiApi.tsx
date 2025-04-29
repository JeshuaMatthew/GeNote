import axios from "axios";

const GeminiApi = axios.create({
    // its a free key
    baseURL: import.meta.env.VITE_GEMINI_API_URL
})

export default GeminiApi;
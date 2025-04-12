import axios from "axios";

const GeminiApi = axios.create({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBrt-dseBghh8D3JaJfGM8C02sLcQGfYL0"
})

export default GeminiApi;
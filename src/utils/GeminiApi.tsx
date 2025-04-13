import axios from "axios";

const GeminiApi = axios.create({
    // its a free key
    baseURL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCFVCTwTgkZA5GsOFdz_3oH7AyIAt9d0og"
})

export default GeminiApi;
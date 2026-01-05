import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 5000, // 5 seconds max
});
import { api } from "@/hooks/axiosInstance";


export const sendHealthRequest = async ()=>{
    try {
        const res = await api.get("/health");
        console.log(res);
        return res.status === 200;
    } catch (error) {
        console.error("Health check failed", error);
        return false;
    }  
}
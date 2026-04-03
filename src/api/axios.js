import axios from "axios";

const api = axios.create({
  baseURL: "https://gkk-4vk8.onrender.com/api"
});

export default api;
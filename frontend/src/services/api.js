
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getEmails = async (status = "") => {
  const response = await api.get("/emails", {
    params: status ? { status } : {},
  });

  return response.data;
};

export const scheduleEmail = async (emailData) => {
  const response = await api.post("/emails/schedule", emailData);
  return response.data;
};

export default api;

import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const api = axios.create({ baseURL: BASE });

export const getSesi = () => api.get("/sesi").then(r => r.data);
export const getRingkasan = (sesi) => api.get("/ringkasan", { params: { sesi } }).then(r => r.data);
export const getKursusSemester = (sem, sesi) => api.get(`/semester/${sem}/kursus`, { params: { sesi } }).then(r => r.data);
export const getCloSemester = (sem, sesi, kelas) => api.get(`/semester/${sem}/clo`, { params: { sesi, kelas } }).then(r => r.data);
export const getPloSemester = (sem, sesi, kelas) => api.get(`/semester/${sem}/plo`, { params: { sesi, kelas } }).then(r => r.data);
export const getKursusDetail = (kod, sesi, kelas) => api.get(`/kursus/${encodeURIComponent(kod)}`, { params: { sesi, kelas } }).then(r => r.data);
export const getPloTrend = (sesi) => api.get("/program/plo-trend", { params: { sesi } }).then(r => r.data);
export const getCqi = (sesi, sem) => api.get("/cqi", { params: { sesi, sem } }).then(r => r.data);
export const uploadLampiranE = (file) => {
  const fd = new FormData(); fd.append("file", file);
  return api.post("/upload/lampiran-e", fd).then(r => r.data);
};
export const uploadLampiranF = (file) => {
  const fd = new FormData(); fd.append("file", file);
  return api.post("/upload/lampiran-f", fd).then(r => r.data);
};

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Utama from "./pages/Utama";
import Semester from "./pages/Semester";
import KursusDetail from "./pages/KursusDetail";
import PLO from "./pages/PLO";
import CQI from "./pages/CQI";
import Upload from "./pages/Upload";
import { getSesi } from "./lib/api";

export default function App() {
  const [sesi, setSesi] = useState("I : 2026/2027");
  const [sesiList, setSesiList] = useState([]);

  useEffect(() => {
    getSesi()
      .then(list => {
        setSesiList(list);
        if (list.length > 0 && !list.includes(sesi)) setSesi(list[0]);
      })
      .catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <Layout sesi={sesi} setSesi={setSesi} sesiList={sesiList}>
        <Routes>
          <Route path="/" element={<Utama sesi={sesi} />} />
          <Route path="/semester" element={<Semester sesi={sesi} />} />
          <Route path="/kursus/:kod" element={<KursusDetail sesi={sesi} />} />
          <Route path="/plo" element={<PLO sesi={sesi} />} />
          <Route path="/cqi" element={<CQI sesi={sesi} />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

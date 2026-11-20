import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKursusSemester, getCloSemester } from "../lib/api";
import { barColor, statusColor, statusLabel } from "../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LabelList
} from "recharts";

const SEM_TABS = [
  { sem: 1, label: "Semester 1" },
  { sem: 2, label: "Semester 2" },
  { sem: 3, label: "Semester 3" },
  { sem: 4, label: "Semester 4" },
];

const KELAS_3 = ["Purata", "SKKSTM3A", "SKKSTM3B"];

export default function Semester({ sesi }) {
  const [activeSem, setActiveSem] = useState(1);
  const [toggle3, setToggle3] = useState("Purata");
  const [kursusData, setKursusData] = useState([]);
  const [cloData, setCloData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const kelas = activeSem === 3 && toggle3 !== "Purata" ? toggle3 : undefined;
    Promise.all([
      getKursusSemester(activeSem, sesi),
      getCloSemester(activeSem, sesi, kelas),
    ])
      .then(([k, c]) => { setKursusData(k); setCloData(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeSem, sesi, toggle3]);

  // Kumpulkan CLO mengikut kursus untuk chart
  const chartData = buildChartData(cloData);

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-bold text-gray-800">Pencapaian CLO Mengikut Semester</h1>

      {/* Tab Semester */}
      <div className="flex gap-2 flex-wrap">
        {SEM_TABS.map(({ sem, label }) => (
          <button
            key={sem}
            onClick={() => { setActiveSem(sem); setToggle3("Purata"); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSem === sem
                ? "bg-blue-700 text-white"
                : "bg-white border text-gray-600 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Toggle Kelas — Semester 3 sahaja */}
      {activeSem === 3 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Paparan:</span>
          {KELAS_3.map(k => (
            <button
              key={k}
              onClick={() => setToggle3(k)}
              className={`px-3 py-1 rounded text-sm border transition-colors ${
                toggle3 === k
                  ? "bg-blue-100 border-blue-400 text-blue-700 font-medium"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {k === "Purata" ? "Purata" : k}
            </button>
          ))}
        </div>
      )}

      {loading && <div className="text-gray-400 text-sm">Memuatkan...</div>}

      {/* Bar Chart CLO per kursus */}
      {!loading && chartData.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold mb-4">
            % Pencapaian CLO — Semester {activeSem}
            {activeSem === 3 && <span className="ml-2 text-sm text-gray-500">({toggle3})</span>}
          </h2>
          <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 36 + 60)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 50, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={200} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <ReferenceLine x={80} stroke="#ef4444" strokeDasharray="4 4" />
              <Bar dataKey="capai_pct" name="% Capai" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.capai_pct)} />
                ))}
                <LabelList dataKey="capai_pct" position="right" formatter={v => `${v}%`} style={{ fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block"/>≥ 80% Tercapai</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400 inline-block"/>70–79% Hampir</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block"/>&lt; 70% Tidak Tercapai</span>
          </div>
        </div>
      )}

      {/* Jadual Kursus */}
      {!loading && kursusData.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kursus</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Klasifikasi</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Jumlah CLO</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">CLO Tidak Tercapai</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {kursusData.map(k => (
                <tr key={k.kod} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{k.nama}</div>
                    <div className="text-xs text-gray-400">{k.kod}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{k.klasifikasi}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{k.jumlah_clo}</td>
                  <td className="px-4 py-3 text-center">
                    {k.clo_tidak_tercapai > 0
                      ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">{k.clo_tidak_tercapai}</span>
                      : <span className="text-green-600 text-xs">✓ Semua tercapai</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/kursus/${encodeURIComponent(k.kod)}`)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Lihat Butiran →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && kursusData.length === 0 && (
        <EmptyState sem={activeSem} />
      )}
    </div>
  );
}

function buildChartData(cloData) {
  return cloData.map(c => ({
    label: `${c.nama_kursus?.length > 25 ? c.nama_kursus.slice(0, 25) + "…" : c.nama_kursus} ${c.nombor_clo}`,
    capai_pct: c.capai_pct != null ? Math.round(c.capai_pct * 10) / 10 : null,
    sasaran_pct: c.sasaran_pct,
  }));
}

function EmptyState({ sem }) {
  return (
    <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
      <div className="text-4xl mb-3">📂</div>
      <div>Tiada data untuk Semester {sem}.</div>
      <div className="text-sm mt-1">Sila upload Lampiran E dan F terlebih dahulu.</div>
    </div>
  );
}

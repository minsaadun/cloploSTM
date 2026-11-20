import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getKursusDetail } from "../lib/api";
import { barColor, statusColor, statusLabel } from "../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LabelList
} from "recharts";

const TOGGLE = ["Purata", "SKKSTM3A", "SKKSTM3B"];

export default function KursusDetail({ sesi }) {
  const { kod } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [toggle, setToggle] = useState("Purata");
  const [loading, setLoading] = useState(true);

  const decodedKod = decodeURIComponent(kod);

  useEffect(() => {
    setLoading(true);
    getKursusDetail(decodedKod, sesi)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [decodedKod, sesi]);

  if (loading) return <div className="p-10 text-center text-gray-400">Memuatkan...</div>;
  if (!data) return <div className="p-10 text-center text-gray-400">Data tidak dijumpai.</div>;

  const isTwoKelas = data.kelas_list.length >= 2;
  const showToggle = isTwoKelas;

  // Pilih data mengikut toggle
  const cloRows = toggle === "Purata"
    ? data.purata
    : (data.per_kelas[toggle] || []);

  const chartData = cloRows.map(c => ({
    label: c.nombor_clo,
    capai_pct: c.capai_pct != null ? Math.round(c.capai_pct * 10) / 10 : null,
    sasaran_pct: c.sasaran_pct || 80,
  }));

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate("/semester")} className="hover:text-blue-600">Semester</button>
        <span>/</span>
        <span className="text-gray-800 font-medium">{data.nama}</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-800">{data.nama}</h1>
        <div className="text-sm text-gray-500 mt-1">
          {data.kod} · Semester {data.semester} · {data.klasifikasi}
        </div>
      </div>

      {/* Toggle kelas — hanya jika 2 kelas */}
      {showToggle && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Paparan:</span>
          {TOGGLE.filter(t => t === "Purata" || data.kelas_list.includes(t)).map(t => (
            <button
              key={t}
              onClick={() => setToggle(t)}
              className={`px-3 py-1 rounded text-sm border transition-colors ${
                toggle === t
                  ? "bg-blue-100 border-blue-400 text-blue-700 font-medium"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Bar Chart CLO */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold mb-4">
            Pencapaian CLO
            {showToggle && <span className="ml-2 text-sm text-gray-500">({toggle})</span>}
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ left: 10, right: 60, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4"
                label={{ value: "Sasaran 80%", position: "right", fontSize: 11 }} />
              <Bar dataKey="capai_pct" name="% Capai" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.capai_pct)} />
                ))}
                <LabelList dataKey="capai_pct" position="top" formatter={v => `${v}%`} style={{ fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Jadual CLO terperinci */}
      {cloRows.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">CLO</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Penyataan</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Sasaran %</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Capai %</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cloRows.map((c, i) => (
                <tr key={i} className={c.capai_pct < 80 ? "bg-red-50" : ""}>
                  <td className="px-4 py-3 font-mono font-medium text-blue-700">{c.nombor_clo}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs">{c.penyataan}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{c.sasaran_pct || 80}%</td>
                  <td className="px-4 py-3 text-center font-semibold">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColor(c.capai_pct)}`}>
                      {c.capai_pct != null ? `${c.capai_pct}%` : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {c.capai_pct >= 80
                      ? <span className="text-green-600">✓ Tercapai</span>
                      : <span className="text-red-600">✗ Tidak Tercapai</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Perbandingan kelas A vs B jika ada 2 kelas */}
      {isTwoKelas && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold mb-4">Perbandingan Kelas</h2>
          <div className="overflow-x-auto">
            <table className="text-sm w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">CLO</th>
                  {data.kelas_list.map(kl => (
                    <th key={kl} className="text-center px-4 py-2 font-medium text-gray-600">{kl}</th>
                  ))}
                  <th className="text-center px-4 py-2 font-medium text-gray-600">Purata</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(data.purata || []).map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-mono text-blue-700">{p.nombor_clo}</td>
                    {data.kelas_list.map(kl => {
                      const r = (data.per_kelas[kl] || []).find(x => x.nombor_clo === p.nombor_clo);
                      return (
                        <td key={kl} className="px-4 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs ${statusColor(r?.capai_pct)}`}>
                            {r?.capai_pct != null ? `${r.capai_pct}%` : "-"}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 text-center font-semibold">
                      <span className={`px-2 py-0.5 rounded text-xs ${statusColor(p.capai_pct)}`}>
                        {p.capai_pct != null ? `${Math.round(p.capai_pct * 10) / 10}%` : "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

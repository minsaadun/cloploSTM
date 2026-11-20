import { useEffect, useState } from "react";
import { getPloSemester, getPloTrend } from "../lib/api";
import { sortPlo, barColor, statusColor } from "../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
  LineChart, Line, Legend
} from "recharts";

const SEM_TABS = [1, 2, 3, 4];
const KELAS_3 = ["Purata", "SKKSTM3A", "SKKSTM3B"];
const SEM_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];

export default function PLO({ sesi }) {
  const [activeSem, setActiveSem] = useState(1);
  const [toggle3, setToggle3] = useState("Purata");
  const [ploData, setPloData] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const kelas = activeSem === 3 && toggle3 !== "Purata" ? toggle3 : undefined;
    Promise.all([
      getPloSemester(activeSem, sesi, kelas),
      getPloTrend(sesi),
    ])
      .then(([p, t]) => { setPloData(sortPlo(p)); setTrend(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeSem, sesi, toggle3]);

  // Trend: susun data per PLO merentas semester
  const trendByPlo = buildTrendByPlo(trend);

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-bold text-gray-800">Pencapaian PLO</h1>

      {/* Tab Semester */}
      <div className="flex gap-2 flex-wrap">
        {SEM_TABS.map(sem => (
          <button
            key={sem}
            onClick={() => { setActiveSem(sem); setToggle3("Purata"); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSem === sem
                ? "bg-blue-700 text-white"
                : "bg-white border text-gray-600 hover:bg-gray-100"
            }`}
          >
            Semester {sem}
          </button>
        ))}
      </div>

      {/* Toggle Sem 3 */}
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
              {k}
            </button>
          ))}
        </div>
      )}

      {loading && <div className="text-gray-400 text-sm">Memuatkan...</div>}

      {/* Bar Chart PLO */}
      {!loading && ploData.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold mb-4">
            Pencapaian PLO — Semester {activeSem}
            {activeSem === 3 && <span className="ml-2 text-sm text-gray-500">({toggle3})</span>}
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ploData} margin={{ left: 10, right: 60, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="plo_id" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4"
                label={{ value: "80%", position: "right", fontSize: 11 }} />
              <Bar dataKey="capai_pct" name="% Capai" radius={[4, 4, 0, 0]}>
                {ploData.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.capai_pct)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Jadual PLO */}
      {!loading && ploData.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-20">PLO</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Penyataan</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Sasaran %</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Capai %</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ploData.map((p, i) => (
                <tr key={i} className={p.capai_pct < 80 ? "bg-red-50" : ""}>
                  <td className="px-4 py-3 font-mono font-semibold text-blue-700">{p.plo_id}</td>
                  <td className="px-4 py-3 text-gray-700 text-xs max-w-sm">{p.penyataan || "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{p.sasaran_pct || 80}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      p.capai_pct >= 80 ? "bg-green-100 text-green-700" :
                      p.capai_pct >= 70 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {p.capai_pct != null ? `${p.capai_pct}%` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {p.capai_pct >= 80
                      ? <span className="text-green-600">✓ Tercapai</span>
                      : <span className="text-red-600">✗ Tidak Tercapai</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Line Chart Trend PLO */}
      {trendByPlo.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold mb-4">Trend PLO Merentas Semester</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={[1, 2, 3, 4].map(s => buildSemPoint(trend, s))} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sem" tickFormatter={s => `Sem ${s}`} tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => v != null ? `${v}%` : "—"} labelFormatter={s => `Semester ${s}`} />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4" />
              <Legend />
              {trendByPlo.map((plo, i) => (
                <Line key={plo} type="monotone" dataKey={plo}
                  stroke={SEM_COLORS[i % SEM_COLORS.length]}
                  dot={{ r: 4 }} strokeWidth={2} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && ploData.length === 0 && (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <div>Tiada data PLO untuk Semester {activeSem}.</div>
          <div className="text-sm mt-1">Sila upload Lampiran F terlebih dahulu.</div>
        </div>
      )}
    </div>
  );
}

function buildTrendByPlo(trend) {
  const plos = [...new Set(trend.map(r => r.plo_id))];
  return plos.sort((a, b) => parseInt(a.replace("PLO", "")) - parseInt(b.replace("PLO", "")));
}

function buildSemPoint(trend, sem) {
  const point = { sem };
  trend.filter(r => r.semester === sem).forEach(r => { point[r.plo_id] = r.capai_pct; });
  return point;
}

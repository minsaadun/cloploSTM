import { useEffect, useState } from "react";
import { getRingkasan, getPloTrend } from "../lib/api";
import { sortPlo, statusColor } from "../lib/utils";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine
} from "recharts";

export default function Utama({ sesi }) {
  const [ringkasan, setRingkasan] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getRingkasan(sesi), getPloTrend(sesi)])
      .then(([r, t]) => { setRingkasan(r); setTrend(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sesi]);

  // Susun data radar: semua PLO merentas semua semester
  const radarData = buildRadarData(trend);

  if (loading) return <PageLoad />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-800">
        Dashboard Pencapaian CLO & PLO
        <span className="ml-2 text-sm font-normal text-gray-500">Sesi {sesi}</span>
      </h1>

      {/* Kad Ringkasan */}
      {ringkasan && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KadRingkasan label="Jumlah Kursus" value={ringkasan.total_kursus} color="blue" />
          <KadRingkasan label="CLO Tercapai" value={ringkasan.clo_tercapai} color="green" />
          <KadRingkasan
            label="CLO Tidak Tercapai"
            value={ringkasan.clo_tidak_tercapai}
            color={ringkasan.clo_tidak_tercapai > 0 ? "red" : "green"}
            note={ringkasan.clo_tidak_tercapai > 0 ? "Perlukan CQI" : ""}
          />
          <KadRingkasan
            label="PLO Tidak Tercapai"
            value={ringkasan.plo_tidak_tercapai}
            color={ringkasan.plo_tidak_tercapai > 0 ? "red" : "green"}
          />
        </div>
      )}

      {/* Radar Chart PLO Program */}
      {radarData.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold mb-4">Profil Pencapaian PLO Program</h2>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="plo" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              {[1, 2, 3, 4].map(sem => (
                <Radar key={sem} name={`Sem ${sem}`} dataKey={`sem${sem}`}
                  stroke={semColor(sem)} fill={semColor(sem)} fillOpacity={0.1} />
              ))}
              <Tooltip formatter={(v) => v != null ? `${v}%` : "-"} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Amaran CLO/PLO */}
      {ringkasan && ringkasan.clo_tidak_tercapai > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="font-semibold text-red-700">
            ⚠️ {ringkasan.clo_tidak_tercapai} CLO memerlukan CQI
          </div>
          <div className="text-sm text-red-600 mt-1">
            Pergi ke halaman <strong>CQI</strong> untuk melihat butiran dan cadangan penambahbaikan.
          </div>
        </div>
      )}

      {/* Bar Chart PLO trend ringkasan */}
      {trend.length > 0 && (
        <PLOTrendBar trend={trend} />
      )}
    </div>
  );
}

// ── Sub-komponen ──────────────────────────────────────────────

function KadRingkasan({ label, value, color, note }) {
  const colors = {
    blue:  "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    red:   "bg-red-50 border-red-200 text-red-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.blue}`}>
      <div className="text-2xl font-bold">{value ?? "-"}</div>
      <div className="text-sm mt-1 font-medium">{label}</div>
      {note && <div className="text-xs mt-1 opacity-70">{note}</div>}
    </div>
  );
}

function PLOTrendBar({ trend }) {
  // Kumpulkan: { plo_id, sem1, sem2, sem3, sem4 }
  const map = {};
  trend.forEach(r => {
    if (!map[r.plo_id]) map[r.plo_id] = { plo: r.plo_id };
    map[r.plo_id][`sem${r.semester}`] = r.capai_pct;
  });
  const data = sortPlo(Object.values(map), "plo");

  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="text-base font-semibold mb-4">Trend PLO Merentas Semester</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="plo" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
          <Tooltip formatter={(v) => v != null ? `${v}%` : "-"} />
          <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "80%", position: "right", fontSize: 11 }} />
          <Legend />
          {[1, 2, 3, 4].map(sem => (
            <Bar key={sem} dataKey={`sem${sem}`} name={`Sem ${sem}`} fill={semColor(sem)} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function buildRadarData(trend) {
  const map = {};
  trend.forEach(r => {
    if (!map[r.plo_id]) map[r.plo_id] = { plo: r.plo_id };
    map[r.plo_id][`sem${r.semester}`] = r.capai_pct;
  });
  return sortPlo(Object.values(map), "plo");
}

function semColor(sem) {
  return ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"][sem - 1] || "#9ca3af";
}

function PageLoad() {
  return <div className="p-10 text-center text-gray-400">Memuatkan...</div>;
}

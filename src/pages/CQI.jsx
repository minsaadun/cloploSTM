import { useEffect, useState } from "react";
import { getCqi } from "../lib/api";

const SEM_FILTER = [
  { value: "", label: "Semua Semester" },
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "3", label: "Semester 3" },
  { value: "4", label: "Semester 4" },
];

export default function CQI({ sesi }) {
  const [data, setData] = useState([]);
  const [semFilter, setSemFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    getCqi(sesi, semFilter || undefined)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [sesi, semFilter]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Cadangan Penambahbaikan Kualiti (CQI)</h1>
          <p className="text-sm text-gray-500 mt-1">CLO yang tidak mencapai sasaran 80% dan memerlukan tindakan.</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Tapis:</span>
        {SEM_FILTER.map(f => (
          <button
            key={f.value}
            onClick={() => setSemFilter(f.value)}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              semFilter === f.value
                ? "bg-blue-100 border-blue-400 text-blue-700 font-medium"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-gray-400 text-sm">Memuatkan...</div>}

      {/* Tiada CQI */}
      {!loading && data.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-2">✅</div>
          <div className="font-semibold text-green-700">Tiada CLO yang tidak tercapai</div>
          <div className="text-sm text-green-600 mt-1">Semua CLO telah mencapai sasaran 80%.</div>
        </div>
      )}

      {/* Jadual CQI */}
      {!loading && data.length > 0 && (
        <>
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="text-red-700 font-semibold">⚠️ {data.length} CLO tidak tercapai</span>
            <span className="text-red-600 text-sm ml-2">— Klik baris untuk lihat butiran CQI</span>
          </div>

          <div className="space-y-3">
            {data.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border overflow-hidden">
                {/* Header baris */}
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div className="flex items-center gap-4">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-mono font-semibold">
                      Sem {item.semester}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">{item.nama_kursus}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.nama_kelas} · {item.nombor_clo}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-xs text-gray-400">Capai</div>
                      <div className="font-bold text-red-600">{item.capai_pct}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Jurang</div>
                      <div className="font-bold text-orange-600">-{item.jurang}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Sasaran CQI</div>
                      <div className="font-bold text-blue-600">{item.sasaran_sesi_akan_datang}%</div>
                    </div>
                    <span className="text-gray-400 text-lg">{expanded === i ? "▲" : "▼"}</span>
                  </div>
                </button>

                {/* Detail CQI */}
                {expanded === i && (
                  <div className="border-t px-5 py-4 bg-gray-50 space-y-4 text-sm">
                    {/* Penyataan CLO */}
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-medium mb-1">Penyataan CLO</div>
                      <div className="text-gray-700">{item.penyataan_clo || "—"}</div>
                    </div>

                    {/* Punca */}
                    {item.punca && (
                      <div>
                        <div className="text-xs text-gray-400 uppercase font-medium mb-1">Punca Ketidakcapaian</div>
                        <div className="bg-orange-50 border border-orange-200 rounded p-3 text-orange-800">
                          {item.punca}
                        </div>
                      </div>
                    )}

                    {/* Cadangan */}
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-medium mb-2">Cadangan Penambahbaikan</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <CadanganKad label="Penyampaian PdP" isi={item.cadangan_pdp} />
                        <CadanganKad label="Pentaksiran" isi={item.cadangan_pentaksiran} />
                        <CadanganKad label="Bahan PdP" isi={item.cadangan_bahan} />
                        <CadanganKad label="Kurikulum" isi={item.cadangan_kurikulum} />
                      </div>
                    </div>

                    {/* Sasaran sesi akan datang */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-800 text-xs">
                      <strong>Sasaran Sesi Akan Datang:</strong> {item.sasaran_sesi_akan_datang}%
                      {" "}(peningkatan minimum {Math.max(0, item.sasaran_sesi_akan_datang - item.capai_pct).toFixed(1)}% diperlukan)
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CadanganKad({ label, isi }) {
  return (
    <div className="bg-white border rounded p-3">
      <div className="text-xs font-semibold text-blue-700 mb-1">{label}</div>
      <div className="text-gray-600 text-xs">{isi || <span className="text-gray-400 italic">Tiada cadangan khusus</span>}</div>
    </div>
  );
}

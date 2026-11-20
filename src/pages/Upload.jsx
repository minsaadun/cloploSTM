import { useState, useRef } from "react";
import { uploadLampiranE, uploadLampiranF } from "../lib/api";

export default function Upload() {
  const [jenis, setJenis] = useState("E");
  const [status, setStatus] = useState(null); // null | "uploading" | { ok, msg } | { error, msg }
  const [results, setResults] = useState([]);
  const inputRef = useRef();

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setStatus("uploading");
    setResults([]);

    const uploadFn = jenis === "E" ? uploadLampiranE : uploadLampiranF;
    const newResults = [];

    for (const file of files) {
      try {
        const res = await uploadFn(file);
        newResults.push({ file: file.name, ok: true, data: res });
      } catch (err) {
        const msg = err.response?.data?.detail || err.message || "Ralat tidak diketahui";
        newResults.push({ file: file.name, ok: false, msg });
      }
    }

    setResults(newResults);
    setStatus("done");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles([...e.dataTransfer.files].filter(f => f.name.endsWith(".pdf")));
  };

  const handleChange = (e) => handleFiles([...e.target.files]);

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800">Upload Lampiran PDF</h1>
      <p className="text-sm text-gray-500">
        Upload fail PDF Lampiran E atau Lampiran F dari sistem pemarkahan.
        Data akan diekstrak dan disimpan secara automatik.
      </p>

      {/* Pilih Jenis */}
      <div className="bg-white rounded-xl border p-5 space-y-3">
        <div className="font-medium text-gray-700">Jenis Lampiran</div>
        <div className="flex gap-3">
          {[
            { val: "E", label: "Lampiran E", desc: "Laporan per kursus (CLO/PLO/Refleksi)" },
            { val: "F", label: "Lampiran F", desc: "Jadual analisis CLO/PLO per kelas" },
          ].map(({ val, label, desc }) => (
            <button
              key={val}
              onClick={() => { setJenis(val); setStatus(null); setResults([]); }}
              className={`flex-1 rounded-lg border-2 p-4 text-left transition-colors ${
                jenis === val
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-semibold text-gray-800">{label}</div>
              <div className="text-xs text-gray-500 mt-1">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Kawasan Drop */}
      <div
        className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-4xl mb-3">📄</div>
        <div className="font-medium text-gray-700">Seret fail PDF ke sini</div>
        <div className="text-sm text-gray-400 mt-1">atau klik untuk pilih fail</div>
        <div className="text-xs text-gray-400 mt-2">Boleh pilih beberapa fail sekaligus (Lampiran {jenis})</div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {/* Status uploading */}
      {status === "uploading" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 text-sm">
          ⏳ Sedang memproses fail PDF...
        </div>
      )}

      {/* Keputusan */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="font-medium text-gray-700">Keputusan Upload</div>
          {results.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 text-sm ${
                r.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{r.ok ? "✅" : "❌"}</span>
                <div>
                  <div className="font-medium text-gray-800">{r.file}</div>
                  {r.ok && r.data && (
                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                      {r.data.kursus && <div>Kursus: <strong>{r.data.kursus}</strong></div>}
                      {r.data.kelas && <div>Kelas: <strong>{r.data.kelas}</strong></div>}
                      {r.data.sesi && <div>Sesi: {r.data.sesi}</div>}
                      {r.data.clo_tidak_tercapai?.length > 0 && (
                        <div className="text-red-600">
                          CLO tidak tercapai: {r.data.clo_tidak_tercapai.join(", ")}
                        </div>
                      )}
                      {r.data.plo_tidak_tercapai?.length > 0 && (
                        <div className="text-orange-600">
                          PLO tidak tercapai: {r.data.plo_tidak_tercapai.join(", ")}
                        </div>
                      )}
                      {(r.data.clo_tidak_tercapai?.length === 0 && r.data.plo_tidak_tercapai?.length === 0) && (
                        <div className="text-green-600">Semua CLO/PLO tercapai ✓</div>
                      )}
                    </div>
                  )}
                  {!r.ok && (
                    <div className="text-red-600 text-xs mt-1">{r.msg}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Panduan */}
      <div className="bg-gray-50 rounded-xl border p-4 text-xs text-gray-500 space-y-1">
        <div className="font-medium text-gray-600 mb-2">Panduan Upload</div>
        <div>• <strong>Lampiran E</strong>: Satu fail PDF per kursus per kelas (contoh: math.pdf, cyber_a.pdf, cyber_b.pdf)</div>
        <div>• <strong>Lampiran F</strong>: Satu fail PDF per kelas per semester (contoh: stm1.pdf, stm3a.pdf, stm3b.pdf)</div>
        <div>• Upload Lampiran E dahulu, kemudian Lampiran F</div>
        <div>• Format PDF mesti dari sistem pemarkahan CCMS</div>
      </div>
    </div>
  );
}

import { NavLink, useLocation } from "react-router-dom";

const nav = [
  { to: "/",         label: "🏠 Utama" },
  { to: "/semester", label: "📚 Semester" },
  { to: "/plo",      label: "🎯 PLO" },
  { to: "/cqi",      label: "📋 CQI" },
  { to: "/upload",   label: "📤 Upload" },
];

export default function Layout({ children, sesi, setSesi, sesiList }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-900 text-white flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-blue-700">
          <div className="text-xs text-blue-300 font-medium uppercase tracking-wider">Kolej Komuniti Gerik</div>
          <div className="mt-1 text-sm font-semibold leading-tight">Dashboard CLO & PLO</div>
          <div className="mt-1 text-xs text-blue-300">Sijil Teknologi Maklumat</div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
                  isActive ? "bg-blue-700 text-white" : "text-blue-200 hover:bg-blue-800 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Pemilih Sesi */}
        <div className="px-4 py-4 border-t border-blue-700">
          <label className="text-xs text-blue-300 block mb-1">Sesi</label>
          <select
            value={sesi}
            onChange={e => setSesi(e.target.value)}
            className="w-full text-xs bg-blue-800 text-white border border-blue-600 rounded px-2 py-1"
          >
            {sesiList.length === 0
              ? <option>I : 2026/2027</option>
              : sesiList.map(s => <option key={s}>{s}</option>)
            }
          </select>
        </div>
      </aside>

      {/* Kandungan */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}

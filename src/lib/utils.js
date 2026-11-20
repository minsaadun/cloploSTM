/** Warna badge berdasarkan % pencapaian */
export function statusColor(pct) {
  if (pct == null) return "bg-gray-100 text-gray-500";
  if (pct >= 80) return "bg-green-100 text-green-700";
  if (pct >= 70) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

/** Warna bar chart */
export function barColor(pct) {
  if (pct == null) return "#9ca3af";
  if (pct >= 80) return "#22c55e";
  if (pct >= 70) return "#eab308";
  return "#ef4444";
}

/** Label status */
export function statusLabel(pct) {
  if (pct == null) return "-";
  if (pct >= 80) return "Tercapai";
  return "Tidak Tercapai";
}

/** Susun PLO mengikut nombor */
export function sortPlo(arr, key = "plo_id") {
  return [...arr].sort((a, b) => {
    const na = parseInt(a[key].replace("PLO", ""));
    const nb = parseInt(b[key].replace("PLO", ""));
    return na - nb;
  });
}

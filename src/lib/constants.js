export const MODE_LABELS = {
  hafazan_baru: "Hafazan Baru",
  murajaah: "Murajaah",
  tilawah: "Tilawah",
  iqra: "Iqra'",
  amoktha_khatam: "Amoktha Khatam",
};

export const MODE_LIST = [
  { id: "hafazan_baru", label: "Hafazan Baru" },
  { id: "murajaah", label: "Murajaah" },
  { id: "tilawah", label: "Tilawah" },
  { id: "iqra", label: "Iqra'" },
  { id: "amoktha_khatam", label: "Amoktha Khatam" },
];

export const JUZUK_LIST = Array.from({ length: 30 }, (_, i) => `Juzuk ${i + 1}`);
export const SPECIAL_SURAH = ["Surah Ar-Rahman", "Surah As-Sajdah", "Surah Yasin", "Surah Al-Waqiah"];
export const IQRA_LEVELS = ["IQRA 1", "IQRA 2", "IQRA 3", "IQRA 4", "IQRA 5", "IQRA 6"];

export const KEPUTUSAN_COLORS = {
  mumtaz: { label: "MUMTAZ", bg: "#10b981", text: "#fff" },
  jayyid: { label: "JAYYID", bg: "#f59e0b", text: "#fff" },
  daif: { label: "DAIF", bg: "#ef4444", text: "#fff" },
  gagal_hantar: { label: "GAGAL HANTAR", bg: "#64748b", text: "#fff" },
  tidak_hadir: { label: "TIDAK HADIR", bg: "#475569", text: "#fff" },
};

export const formatDateTime = (d) => {
  const date = d ? new Date(d) : new Date();
  return date.toLocaleString("ms-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const todayISO = () => new Date().toISOString().split("T")[0];

export const currentMonthISO = () => new Date().toISOString().slice(0, 7);

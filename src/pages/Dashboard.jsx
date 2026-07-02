import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";
import { FileDown, TrendingUp, Trophy, Users, AlertTriangle, Database, FileSpreadsheet, FileArchive, Loader2, BookOpen, MapPin } from "lucide-react";
import api, { isGuest } from "../lib/api";
import { currentMonthISO } from "../lib/constants";
import { exportElementToPDF } from "../lib/pdf";
import { toast } from "sonner";

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonthISO());
  const [top, setTop] = useState({ hafazan_baru: [], murajaah: [] });
  const [halaqahs, setHalaqahs] = useState([]);
  const [overall, setOverall] = useState({ hantar: 0, tidak_hantar: 0, tidak_hadir: 0, total: 0 });
  const [weak, setWeak] = useState({ kerap_gagal: [], kerap_tidak_hadir: [], kerap_daif: [] });
  const [kemajuan, setKemajuan] = useState([]);
  const [jejak, setJejak] = useState(null);
  const [summary, setSummary] = useState(null);
  const [downloading, setDownloading] = useState("");

  const loadSummary = async () => {
    if (isGuest()) return;
    try {
      const { data } = await api.get("/backup/summary");
      setSummary(data);
    } catch { /* ignore */ }
  };

  const loadKemajuan = async () => {
    try {
      const { data } = await api.get("/analytics/kemajuan-hafazan");
      setKemajuan(data);
    } catch { /* ignore */ }
  };

  const loadJejak = async () => {
    try {
      const { data } = await api.get("/analytics/jejak-hafazan");
      setJejak(data);
    } catch { /* ignore */ }
  };

  const downloadBackup = async (format) => {
    setDownloading(format);
    try {
      const { data, headers } = await api.get(`/backup/${format}`, { responseType: "blob" });
      const cd = headers["content-disposition"] || "";
      const match = cd.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `e-huffaz-backup.${format === "excel" ? "xlsx" : "zip"}`;
      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Backup ${format === "excel" ? "Excel" : "ZIP"} berjaya dimuat turun`);
    } catch {
      toast.error("Gagal muat turun backup");
    } finally {
      setDownloading("");
    }
  };

  const load = async () => {
    const [a, b, c, d] = await Promise.all([
      api.get("/analytics/top-students", { params: { month } }),
      api.get("/analytics/top-halaqahs", { params: { month } }),
      api.get("/analytics/overall", { params: { month } }),
      api.get("/analytics/weak-students", { params: { month } }),
    ]);
    setTop(a.data); setHalaqahs(b.data); setOverall(c.data); setWeak(d.data);
  };

  useEffect(() => { load(); }, [month]); // eslint-disable-line
  useEffect(() => { loadSummary(); loadKemajuan(); loadJejak(); }, []);

  const overallData = [
    { name: "Hantar", value: overall.hantar, fill: "#10b981" },
    { name: "Tidak Hantar", value: overall.tidak_hantar, fill: "#ef4444" },
    { name: "Tidak Hadir", value: overall.tidak_hadir, fill: "#f59e0b" },
  ];
  const total = overall.total || 1;
  const pct = (v) => ((v / total) * 100).toFixed(1);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-emerald-900">DASHBOARD e-HUFFAZ</h1>
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" data-testid="dashboard-month" />
      </div>

      <Tabs defaultValue="jejak" className="space-y-4">
        <TabsList className="bg-emerald-50 flex flex-wrap h-auto">
          <TabsTrigger value="jejak" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white" data-testid="tab-jejak">Jejak Hafazan</TabsTrigger>
          <TabsTrigger value="kemajuan" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white" data-testid="tab-kemajuan">Kemajuan Hafazan</TabsTrigger>
          <TabsTrigger value="cemerlang" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white" data-testid="tab-cemerlang">Pelajar Cemerlang</TabsTrigger>
          <TabsTrigger value="halaqah" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white" data-testid="tab-halaqah">Halaqah Cemerlang</TabsTrigger>
          <TabsTrigger value="keseluruhan" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white" data-testid="tab-keseluruhan">Keseluruhan</TabsTrigger>
          <TabsTrigger value="lemah" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white" data-testid="tab-lemah">Pelajar Lemah</TabsTrigger>
          {!isGuest() && (
            <TabsTrigger value="backup" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white" data-testid="tab-backup">Backup & Eksport</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="jejak">
          <Card><CardContent className="p-6" id="jejak-pdf">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-emerald-900">
                <MapPin className="h-5 w-5" />
                <h2 className="text-xl font-bold">Jejak Hafazan</h2>
              </div>
              <Button size="sm" variant="outline" onClick={() => exportElementToPDF("jejak-pdf", `jejak-hafazan.pdf`)} data-testid="pdf-jejak-btn">
                <FileDown className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Road map kedudukan terkini pelajar — diambil dari "Hafazan Terkini" Profil Pelajar
              {jejak && <> · <strong>{jejak.total_pelajar_tracked}</strong> pelajar dijejaki</>}
            </p>
            {!jejak ? (
              <p className="text-sm text-muted-foreground italic text-center py-6">Memuatkan...</p>
            ) : (() => {
              const PER_ROW = 6;
              const stages = jejak.stages;
              const rows = [];
              for (let i = 0; i < stages.length; i += PER_ROW) {
                rows.push(stages.slice(i, i + PER_ROW));
              }
              return (
                <div className="space-y-2" data-testid="jejak-zigzag">
                  {rows.map((row, ri) => {
                    const reversed = ri % 2 === 1;
                    const display = reversed ? [...row].reverse() : row;
                    return (
                      <div key={ri}>
                        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 items-stretch`}>
                          {display.map((s, ci) => {
                            const hasStudents = s.count > 0;
                            const isStart = s.stage === "IQRA";
                            const isEnd = s.stage === "TAMAT";
                            // Visual logical index in display for arrows
                            const isLastInRow = ci === display.length - 1;
                            return (
                              <div key={s.stage} className="relative" data-testid={`jejak-stage-${s.stage}`}>
                                <div className={`rounded-lg p-2 h-full min-h-[70px] transition-all ${
                                  hasStudents
                                    ? "bg-gradient-to-br from-amber-100 to-emerald-100 border-2 border-amber-400 shadow-md"
                                    : isStart
                                      ? "bg-emerald-700 text-white border-2 border-emerald-900"
                                      : isEnd
                                        ? "bg-gradient-to-br from-amber-600 to-yellow-500 text-white border-2 border-amber-700"
                                        : "bg-slate-50 border border-slate-200"
                                }`}>
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <h4 className={`font-bold text-xs leading-tight ${
                                      isStart || isEnd ? "text-white" :
                                      hasStudents ? "text-emerald-900" : "text-slate-500"
                                    }`}>
                                      {isStart && "🚀 "}
                                      {isEnd && "🏁 "}
                                      {s.label}
                                    </h4>
                                    {hasStudents && (
                                      <span className="bg-amber-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{s.count}</span>
                                    )}
                                  </div>
                                  {hasStudents ? (
                                    <div className="flex flex-col gap-1">
                                      {s.students.slice(0, 3).map((st) => (
                                        <span
                                          key={st.student_id + st.halaqah_id}
                                          className="text-[10px] bg-white border border-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded truncate"
                                          title={`${st.nama} · ${st.halaqah_nama} · ${st.tarikh}`}
                                          data-testid={`jejak-student-${st.student_id}`}
                                        >
                                          {st.nama.split(" ").slice(0, 2).join(" ")}
                                        </span>
                                      ))}
                                      {s.students.length > 3 && (
                                        <span className="text-[10px] text-amber-700 italic">+{s.students.length - 3} lagi</span>
                                      )}
                                    </div>
                                  ) : (
                                    !isStart && !isEnd && <p className="text-[10px] text-slate-400 italic">kosong</p>
                                  )}
                                </div>
                                {/* Horizontal arrow connector (not on last item of row) */}
                                {!isLastInRow && (
                                  <div className={`hidden md:flex absolute top-1/2 -translate-y-1/2 items-center justify-center text-amber-600 ${reversed ? "-left-2.5" : "-right-2.5"}`}>
                                    <span className="text-lg">{reversed ? "◀" : "▶"}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {/* Down arrow connecting to next row */}
                        {ri < rows.length - 1 && (
                          <div className={`hidden md:flex my-1 ${reversed ? "justify-start pl-3" : "justify-end pr-3"}`}>
                            <div className="text-amber-600 text-xl leading-none">▼</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="kemajuan">
          <Card><CardContent className="p-6" id="kemajuan-pdf">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-900"><BookOpen className="h-5 w-5" /><h2 className="text-xl font-bold">Kemajuan Hafazan</h2></div>
              <Button size="sm" variant="outline" onClick={() => exportElementToPDF("kemajuan-pdf", `kemajuan-hafazan.pdf`)} data-testid="pdf-kemajuan-btn">
                <FileDown className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Ranking semua pelajar dari semua halaqah berdasarkan jumlah juzuk hafazan (data dari Profil Pelajar)
            </p>
            {kemajuan.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-8" data-testid="kemajuan-empty">
                Tiada data — sila isi Profil Pelajar untuk pelajar yang berkenaan.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-emerald-50">
                    <tr>
                      <th className="p-2 text-left w-16">Rank</th>
                      <th className="p-2 text-left">Nama Pelajar</th>
                      <th className="p-2 text-left">Halaqah</th>
                      <th className="p-2 text-center">Jumlah Juzuk</th>
                      <th className="p-2 text-center">Jumlah Surah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kemajuan.map((s, i) => {
                      const rankBadge =
                        i === 0 ? "bg-yellow-500" :
                        i === 1 ? "bg-slate-400" :
                        i === 2 ? "bg-amber-700" : "bg-emerald-700";
                      return (
                        <tr key={s.student_id + s.halaqah_id} className="border-b hover:bg-emerald-50/50" data-testid={`kemajuan-row-${s.student_id}`}>
                          <td className="p-2"><Badge className={rankBadge}>#{i + 1}</Badge></td>
                          <td className="p-2 font-medium text-emerald-900">{s.nama}</td>
                          <td className="p-2 text-xs text-amber-800 italic">{s.halaqah_nama}</td>
                          <td className="p-2 text-center font-bold text-emerald-800">
                            {s.jumlah_juzuk} <span className="text-xs font-normal text-muted-foreground">juzuk</span>
                          </td>
                          <td className="p-2 text-center text-amber-800">
                            {s.jumlah_surah > 0 ? <>{s.jumlah_surah} <span className="text-xs font-normal text-muted-foreground">surah</span></> : <span className="text-slate-400">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="cemerlang">
          <Card><CardContent className="p-6" id="cemerlang-pdf">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-900"><Trophy className="h-5 w-5" /><h2 className="text-xl font-bold">Analisis Pelajar Cemerlang</h2></div>
              <Button size="sm" variant="outline" onClick={() => exportElementToPDF("cemerlang-pdf", `pelajar-cemerlang-${month}.pdf`)} data-testid="pdf-cemerlang-btn">
                <FileDown className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-emerald-800">Tertinggi Hafazan Baru <span className="text-xs font-normal text-muted-foreground">(jumlah baris)</span></h3>
                {top.hafazan_baru.length === 0 ? <p className="text-sm text-muted-foreground italic">Tiada data</p> : top.hafazan_baru.map((s, i) => (
                  <div key={s.student_id + s.halaqah_id} className="flex justify-between items-center py-2 border-b">
                    <span className="flex gap-2 items-center"><Badge className="bg-emerald-700">#{i + 1}</Badge>{s.nama}</span>
                    <Badge variant="outline" className="font-bold">{s.total_baris} baris</Badge>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-emerald-800">Tertinggi Murajaah <span className="text-xs font-normal text-muted-foreground">(jumlah muka surat)</span></h3>
                {top.murajaah.length === 0 ? <p className="text-sm text-muted-foreground italic">Tiada data</p> : top.murajaah.map((s, i) => (
                  <div key={s.student_id + s.halaqah_id} className="flex justify-between items-center py-2 border-b">
                    <span className="flex gap-2 items-center"><Badge className="bg-amber-700">#{i + 1}</Badge>{s.nama}</span>
                    <Badge variant="outline" className="font-bold">{s.total_muka_surat} m/s</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="halaqah">
          <Card><CardContent className="p-6" id="halaqah-pdf">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-900"><Users className="h-5 w-5" /><h2 className="text-xl font-bold">Analisis Halaqah Cemerlang</h2></div>
              <Button size="sm" variant="outline" onClick={() => exportElementToPDF("halaqah-pdf", `halaqah-cemerlang-${month}.pdf`)} data-testid="pdf-halaqah-btn">
                <FileDown className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="p-2 text-left">Rank</th>
                    <th className="p-2 text-left">Halaqah</th>
                    <th className="p-2 text-center">Hafazan<br/><span className="text-xs font-normal text-muted-foreground">(baris)</span></th>
                    <th className="p-2 text-center">Murajaah<br/><span className="text-xs font-normal text-muted-foreground">(m/s)</span></th>
                    <th className="p-2 text-center">Iqra<br/><span className="text-xs font-normal text-muted-foreground">(kali)</span></th>
                    <th className="p-2 text-center text-emerald-600">Mumtaz</th>
                    <th className="p-2 text-center text-amber-600">Jayyid</th>
                    <th className="p-2 text-center text-red-600">Daif</th>
                    <th className="p-2 text-center">Jumlah Rekod</th>
                  </tr>
                </thead>
                <tbody>
                  {halaqahs.map((h, i) => (
                    <tr key={h.halaqah_id} className="border-b" data-testid={`halaqah-row-${h.halaqah_id}`}>
                      <td className="p-2"><Badge>#{i + 1}</Badge></td>
                      <td className="p-2 font-medium">{h.name}</td>
                      <td className="p-2 text-center font-bold text-emerald-800">{h.hafazan_baru_baris}</td>
                      <td className="p-2 text-center font-bold text-amber-800">{h.murajaah_muka_surat}</td>
                      <td className="p-2 text-center">{h.iqra}</td>
                      <td className="p-2 text-center text-emerald-700 font-semibold">{h.mumtaz}</td>
                      <td className="p-2 text-center text-amber-700 font-semibold">{h.jayyid}</td>
                      <td className="p-2 text-center text-red-700 font-semibold">{h.daif}</td>
                      <td className="p-2 text-center font-bold">{h.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="keseluruhan">
          <Card><CardContent className="p-6" id="keseluruhan-pdf">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-900"><TrendingUp className="h-5 w-5" /><h2 className="text-xl font-bold">Analisis Pencapaian Keseluruhan</h2></div>
              <Button size="sm" variant="outline" onClick={() => exportElementToPDF("keseluruhan-pdf", `keseluruhan-${month}.pdf`)} data-testid="pdf-keseluruhan-btn">
                <FileDown className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <Card className="bg-emerald-50 border-emerald-200"><CardContent className="p-4"><p className="text-xs uppercase text-emerald-700">Hantar</p><p className="text-3xl font-bold text-emerald-800">{overall.hantar}</p><p className="text-xs text-emerald-600">{pct(overall.hantar)}%</p></CardContent></Card>
              <Card className="bg-red-50 border-red-200"><CardContent className="p-4"><p className="text-xs uppercase text-red-700">Tidak Hantar</p><p className="text-3xl font-bold text-red-800">{overall.tidak_hantar}</p><p className="text-xs text-red-600">{pct(overall.tidak_hantar)}%</p></CardContent></Card>
              <Card className="bg-amber-50 border-amber-200"><CardContent className="p-4"><p className="text-xs uppercase text-amber-700">Tidak Hadir</p><p className="text-3xl font-bold text-amber-800">{overall.tidak_hadir}</p><p className="text-xs text-amber-600">{pct(overall.tidak_hadir)}%</p></CardContent></Card>
            </div>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={overallData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {overallData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="lemah">
          <Card><CardContent className="p-6" id="lemah-pdf">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-900"><AlertTriangle className="h-5 w-5" /><h2 className="text-xl font-bold">Analisis Pelajar Lemah</h2></div>
              <Button size="sm" variant="outline" onClick={() => exportElementToPDF("lemah-pdf", `pelajar-lemah-${month}.pdf`)} data-testid="pdf-lemah-btn">
                <FileDown className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Kerap Gagal Hantar", data: weak.kerap_gagal, key: "gagal_hantar", color: "text-red-700" },
                { title: "Kerap Tidak Hadir", data: weak.kerap_tidak_hadir, key: "tidak_hadir", color: "text-amber-700" },
                { title: "Kerap Dapat Daif", data: weak.kerap_daif, key: "daif", color: "text-orange-700" },
              ].map((sec) => (
                <div key={sec.title}>
                  <h3 className={`font-semibold mb-2 ${sec.color}`}>{sec.title}</h3>
                  {sec.data.length === 0 ? <p className="text-xs text-muted-foreground italic">Tiada</p> : sec.data.filter((s) => s[sec.key] > 0).map((s) => (
                    <div key={s.student_id + s.halaqah_id} className="flex justify-between items-center py-1 border-b text-sm">
                      <span>{s.nama}</span>
                      <Badge variant="outline" className={sec.color}>{s[sec.key]}</Badge>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card><CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 text-emerald-900">
              <Database className="h-5 w-5" />
              <h2 className="text-xl font-bold">Backup & Eksport Data</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Muat turun salinan penuh semua data dari pangkalan data untuk simpanan atau import ke Google Sheet.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mb-6" data-testid="backup-summary">
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <p className="text-xs uppercase text-amber-700">Jumlah Memo Buletin</p>
                  <p className="text-3xl font-bold text-amber-800">{summary?.buletin ?? "—"}</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4">
                  <p className="text-xs uppercase text-emerald-700">Jumlah Rekod Tasmi'</p>
                  <p className="text-3xl font-bold text-emerald-800">{summary?.tasmi_records ?? "—"}</p>
                </CardContent>
              </Card>
              <Card className="bg-teal-50 border-teal-200">
                <CardContent className="p-4">
                  <p className="text-xs uppercase text-teal-700">Pelajar Tambahan (DB)</p>
                  <p className="text-3xl font-bold text-teal-800">{summary?.extra_students ?? "—"}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                onClick={() => downloadBackup("excel")}
                disabled={downloading === "excel"}
                className="h-auto py-4 bg-blue-700 hover:bg-blue-800 btn-shine flex flex-col items-start gap-1"
                data-testid="backup-excel-btn"
              >
                <div className="flex items-center gap-2 w-full">
                  {downloading === "excel" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSpreadsheet className="h-5 w-5" />}
                  <span className="font-bold">Muat Turun Excel (.xlsx)</span>
                </div>
                <span className="text-xs opacity-90 font-normal">Satu fail dengan 3 sheet: Buletin, Rekod Tasmi', Pelajar Tambahan</span>
              </Button>

              <Button
                onClick={() => downloadBackup("zip")}
                disabled={downloading === "zip"}
                className="h-auto py-4 bg-emerald-700 hover:bg-emerald-800 btn-shine flex flex-col items-start gap-1"
                data-testid="backup-zip-btn"
              >
                <div className="flex items-center gap-2 w-full">
                  {downloading === "zip" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileArchive className="h-5 w-5" />}
                  <span className="font-bold">Muat Turun ZIP (3 CSV)</span>
                </div>
                <span className="text-xs opacity-90 font-normal">Fail ZIP mengandungi buletin.csv, tasmi_records.csv, extra_students.csv</span>
              </Button>
            </div>

            <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm">
              <p className="font-semibold text-amber-900 mb-1">📌 Cara import ke Google Sheet:</p>
              <ol className="list-decimal list-inside text-amber-800 space-y-0.5 text-xs">
                <li>Buka Google Sheet anda</li>
                <li>Pilih menu <strong>File → Import</strong></li>
                <li>Upload fail .xlsx atau salah satu CSV dari ZIP</li>
                <li>Pilih "Replace spreadsheet" atau "Insert new sheet"</li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground mt-4 italic">
              Nota: Senarai pelajar asal dari Google Sheet tidak termasuk dalam backup ini kerana ia sudah ada di Google Sheet anda.
            </p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "../components/ui/dialog";
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from "../components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "../components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "../components/ui/select";
import {
  ArrowLeft, Plus, Loader2, Save, Trash2, FileDown, Calendar, Users
} from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import {
  JUZUK_LIST, SPECIAL_SURAH, IQRA_LEVELS, MODE_LIST, MODE_LABELS,
  KEPUTUSAN_COLORS, todayISO, currentMonthISO
} from "../lib/constants";
import { exportCSV, exportElementToPDF } from "../lib/pdf";

const HafazanForm = ({ mode, halaqahId, student, onSaved }) => {
  const isHafazan = mode === "hafazan_baru";
  const isIqra = mode === "iqra";
  const [isWeekly, setIsWeekly] = useState(false);
  const [tarikh, setTarikh] = useState(todayISO());
  const [juzukSurah, setJuzukSurah] = useState("");
  const [iqraLevel, setIqraLevel] = useState("");
  const [mukaSurat, setMukaSurat] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [keputusan, setKeputusan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);

  const jumlahLabel = isHafazan ? "Jumlah Baris" : "Jumlah Muka Surat";
  const jumlahType = isHafazan ? "baris" : "muka_surat";

  // Calculate end date (start + 4 days = 5 days total)
  const computeEndDate = (start) => {
    if (!start) return "";
    const d = new Date(start);
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  };
  const tarikhAkhir = isWeekly ? computeEndDate(tarikh) : null;

  const formatDateMS = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const submit = async () => {
    if (!tarikh) { toast.warning("Sila pilih tarikh"); return; }
    if (isWeekly) {
      if (isIqra && !iqraLevel) { toast.warning("Sila pilih IQRA"); return; }
      if (!isIqra && !juzukSurah) { toast.warning("Sila pilih Juzuk/Surah"); return; }
      if (!jumlah) { toast.warning("Sila isi jumlah"); return; }
    } else {
      if (!keputusan) { toast.warning("Sila pilih keputusan"); return; }
      if (["mumtaz", "jayyid", "daif"].includes(keputusan)) {
        if (isIqra && !iqraLevel) { toast.warning("Sila pilih IQRA"); return; }
        if (!isIqra && !juzukSurah) { toast.warning("Sila pilih Juzuk/Surah"); return; }
        if (!jumlah) { toast.warning("Sila isi jumlah"); return; }
      }
    }
    setSaving(true);
    try {
      await api.post("/tasmi", {
        halaqah_id: halaqahId,
        student_id: student.id,
        student_nama: student.nama,
        tarikh,
        tarikh_akhir: tarikhAkhir,
        is_weekly: isWeekly,
        mod: mode,
        juzuk_surah: juzukSurah || null,
        iqra_level: iqraLevel || null,
        muka_surat: mukaSurat || null,
        jumlah: jumlah || null,
        jumlah_type: jumlahType,
        keputusan: isWeekly ? null : keputusan,
        catatan: catatan || null,
      });
      toast.success(
        isWeekly
          ? `Rekod mingguan (${formatDateMS(tarikh)} - ${formatDateMS(tarikhAkhir)}) berjaya disimpan`
          : `Rekod ${tarikh} berjaya disimpan`
      );
      setJuzukSurah(""); setIqraLevel(""); setMukaSurat(""); setJumlah(""); setKeputusan(""); setCatatan("");
      onSaved && onSaved();
    } catch {
      toast.error("Gagal simpan rekod");
    } finally { setSaving(false); }
  };

  const ResultBtn = ({ value, label }) => {
    const c = KEPUTUSAN_COLORS[value];
    return (
      <button
        type="button"
        onClick={() => setKeputusan(value)}
        className={`px-4 py-2 rounded-lg font-semibold text-sm btn-hover ${keputusan === value ? "ring-4 ring-emerald-300" : "opacity-80"}`}
        style={{ background: c.bg, color: c.text }}
        data-testid={`result-${value}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      {/* Toggle Rekod Mingguan */}
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3 flex items-center justify-between flex-wrap gap-2" data-testid="weekly-toggle-section">
        <div>
          <p className="font-semibold text-amber-900 text-sm">Rekod Mingguan (5 hari sekaligus)</p>
          <p className="text-xs text-amber-700">Aktifkan untuk rekod ringkasan 5 hari berturut-turut tanpa keputusan tasmi'</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer" data-testid="weekly-toggle">
          <input
            type="checkbox"
            checked={isWeekly}
            onChange={(e) => { setIsWeekly(e.target.checked); setKeputusan(""); }}
            className="sr-only peer"
            data-testid="weekly-toggle-input"
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-700"></div>
          <span className="ml-2 text-sm font-medium text-amber-900">{isWeekly ? "AKTIF" : "OFF"}</span>
        </label>
      </div>

      <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-3 flex items-center gap-3 flex-wrap" data-testid="tarikh-section">
        <Label htmlFor="tarikh-input" className="text-emerald-900 font-semibold whitespace-nowrap mb-0">
          {isWeekly ? "Tarikh Awal Minggu:" : "Tarikh Tasmi':"}
        </Label>
        <Input
          id="tarikh-input"
          type="date"
          value={tarikh}
          onChange={(e) => setTarikh(e.target.value)}
          max={isWeekly ? undefined : todayISO()}
          className="w-44 bg-white"
          data-testid="tarikh-input"
        />
        {isWeekly && tarikhAkhir && (
          <span className="text-sm font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded-md">
            → Hingga {formatDateMS(tarikhAkhir)} (5 hari)
          </span>
        )}
        {!isWeekly && (
          <>
            <button
              type="button"
              onClick={() => setTarikh(todayISO())}
              className="text-xs text-emerald-700 underline hover:text-emerald-900"
              data-testid="tarikh-hari-ini-btn"
            >
              Set ke hari ini
            </button>
            {tarikh !== todayISO() && (
              <span className="text-xs text-amber-700 italic">
                ⚠️ Anda sedang rekod untuk tarikh lalu
              </span>
            )}
          </>
        )}
      </div>

      {!isIqra ? (
        <>
          <div>
            <Label className="text-emerald-900 font-semibold">Pilih Juzuk / Surah</Label>
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
                {JUZUK_LIST.slice(0, 12).map((j) => (
                  <button key={j} type="button" onClick={() => setJuzukSurah(j)} className={`px-2 py-1.5 rounded text-xs font-medium border ${juzukSurah === j ? "bg-emerald-800 text-white border-emerald-800" : "bg-white border-emerald-200 hover:bg-emerald-50"}`} data-testid={`juzuk-${j}`}>
                    {j.replace("Juzuk ", "J")}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
                {JUZUK_LIST.slice(12, 24).map((j) => (
                  <button key={j} type="button" onClick={() => setJuzukSurah(j)} className={`px-2 py-1.5 rounded text-xs font-medium border ${juzukSurah === j ? "bg-emerald-800 text-white border-emerald-800" : "bg-white border-emerald-200 hover:bg-emerald-50"}`}>
                    {j.replace("Juzuk ", "J")}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                {[...JUZUK_LIST.slice(24, 30), ...SPECIAL_SURAH].map((j) => (
                  <button key={j} type="button" onClick={() => setJuzukSurah(j)} className={`px-2 py-1.5 rounded text-xs font-medium border ${juzukSurah === j ? "bg-emerald-800 text-white border-emerald-800" : "bg-white border-emerald-200 hover:bg-emerald-50"}`}>
                    {j.startsWith("Juzuk") ? j.replace("Juzuk ", "J") : j.replace("Surah ", "")}
                  </button>
                ))}
              </div>
            </div>
            {juzukSurah && <p className="text-xs text-emerald-700 mt-1">Dipilih: <strong>{juzukSurah}</strong></p>}
          </div>
        </>
      ) : (
        <div>
          <Label className="text-emerald-900 font-semibold">Pilih IQRA</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {IQRA_LEVELS.map((l) => (
              <button key={l} type="button" onClick={() => setIqraLevel(l)} className={`px-4 py-3 rounded-lg font-semibold border ${iqraLevel === l ? "bg-emerald-800 text-white border-emerald-800" : "bg-white border-emerald-200 hover:bg-emerald-50"}`} data-testid={`iqra-${l}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Muka Surat <span className="text-xs text-muted-foreground font-normal">(pilihan)</span></Label>
          <Input value={mukaSurat} onChange={(e) => setMukaSurat(e.target.value)} placeholder="Cth: 25" data-testid="muka-surat" />
        </div>
        <div>
          <Label>{isIqra ? "Jumlah Muka Surat" : jumlahLabel}</Label>
          <Input value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="Cth: 5" data-testid="jumlah" />
        </div>
      </div>

      <div>
        <Label className="text-emerald-900 font-semibold">Keputusan Tasmi'</Label>
        {isWeekly ? (
          <p className="text-sm text-muted-foreground italic mt-2 px-3 py-2 bg-slate-50 rounded border border-slate-200">
            ℹ️ Tidak diperlukan untuk rekod mingguan
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 mt-2">
            <ResultBtn value="mumtaz" label="MUMTAZ" />
            <ResultBtn value="jayyid" label="JAYYID" />
            <ResultBtn value="daif" label="DAIF" />
            <ResultBtn value="gagal_hantar" label="GAGAL HANTAR" />
            <ResultBtn value="tidak_hadir" label="TIDAK HADIR" />
          </div>
        )}
      </div>

      <div>
        <Label>Catatan (pilihan)</Label>
        <Textarea rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} data-testid="catatan" />
      </div>

      <Button onClick={submit} disabled={saving} className="w-full bg-emerald-800 hover:bg-emerald-900 btn-shine" data-testid="simpan-rekod-btn">
        {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Sedang memproses...</> : <><Save className="h-4 w-4 mr-1" /> {isWeekly ? "SIMPAN REKOD MINGGUAN" : "SIMPAN REKOD"}</>}
      </Button>
    </div>
  );
};

const HistoryPanel = ({ halaqahId, student }) => {
  const [mode, setMode] = useState("hafazan_baru");
  const [month, setMonth] = useState(currentMonthISO());
  const [records, setRecords] = useState([]);

  const load = async () => {
    const { data } = await api.get("/tasmi", {
      params: { halaqah_id: halaqahId, student_id: student.id, mod: mode, month }
    });
    setRecords(data);
  };

  useEffect(() => { load(); }, [mode, month, student.id]); // eslint-disable-line

  const del = async (id) => {
    if (!window.confirm("Padam rekod?")) return;
    await api.delete(`/tasmi/${id}`);
    toast.success("Rekod dipadam");
    load();
  };

  return (
    <div id="history-panel" className="mt-6">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <h3 className="font-semibold text-emerald-900 text-lg">SEJARAH TASMI' — {student.nama}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(records, `sejarah-${student.nama}.csv`)} data-testid="export-csv-btn">
            <FileDown className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportElementToPDF("history-panel", `sejarah-${student.nama}.pdf`)} data-testid="export-pdf-btn">
            <FileDown className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mb-3 flex-wrap">
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MODE_LIST.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />
      </div>
      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarikh</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Juzuk/Surah</TableHead>
              <TableHead>M/S</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Keputusan</TableHead>
              <TableHead>Catatan</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Tiada rekod</TableCell></TableRow>
            ) : records.map((r) => {
              const fmt = (iso) => { if (!iso) return ""; const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; };
              return (
                <TableRow key={r.id} data-testid={`history-row-${r.id}`}>
                  <TableCell className="font-medium">
                    {r.is_weekly ? (
                      <span>{fmt(r.tarikh)} <span className="text-amber-700">–</span> {fmt(r.tarikh_akhir)}</span>
                    ) : (
                      fmt(r.tarikh)
                    )}
                  </TableCell>
                  <TableCell>
                    {r.is_weekly ? (
                      <Badge className="bg-amber-600 hover:bg-amber-700">Mingguan</Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-300 text-emerald-800">Harian</Badge>
                    )}
                  </TableCell>
                  <TableCell>{r.juzuk_surah || r.iqra_level || "-"}</TableCell>
                  <TableCell>{r.muka_surat || "-"}</TableCell>
                  <TableCell>{r.jumlah || "-"}</TableCell>
                  <TableCell>
                    {r.keputusan ? (
                      <Badge style={{ background: KEPUTUSAN_COLORS[r.keputusan]?.bg, color: "#fff" }}>
                        {KEPUTUSAN_COLORS[r.keputusan]?.label}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{r.catatan || "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => del(r.id)} className="h-7 w-7 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default function RekodHarian() {
  const [halaqahs, setHalaqahs] = useState([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newStudent, setNewStudent] = useState("");
  const [mode, setMode] = useState("hafazan_baru");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    api.get("/halaqahs").then((r) => setHalaqahs(r.data));
  }, []);

  const loadStudents = async (hid) => {
    setLoadingStudents(true);
    try {
      const { data } = await api.get(`/halaqahs/${hid}/students`);
      setStudents(data);
    } finally { setLoadingStudents(false); }
  };

  const selectHalaqah = (h) => {
    setSelectedHalaqah(h);
    setSelectedStudent(null);
    loadStudents(h.id);
  };

  const addStudent = async () => {
    if (!newStudent.trim()) return;
    await api.post(`/halaqahs/${selectedHalaqah.id}/students`, { nama: newStudent });
    toast.success("Pelajar ditambah");
    setNewStudent(""); setAddOpen(false);
    loadStudents(selectedHalaqah.id);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">REKOD HARIAN</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Calendar className="h-4 w-4" /> {new Date().toLocaleDateString("ms-MY", { dateStyle: "full" })}
          </p>
        </div>
        {selectedHalaqah && (
          <Button variant="outline" onClick={() => { setSelectedHalaqah(null); setSelectedStudent(null); }} data-testid="back-halaqah-btn">
            <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Senarai Halaqah
          </Button>
        )}
      </div>

      {!selectedHalaqah ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="halaqah-list">
          {halaqahs.map((h) => (
            <Card key={h.id} className="card-hover cursor-pointer border-emerald-200" onClick={() => selectHalaqah(h)} data-testid={`halaqah-${h.id}`}>
              <CardContent className="p-6 flex flex-col gap-2">
                <Users className="h-8 w-8 text-emerald-700" />
                <h3 className="font-bold text-emerald-900">{h.name}</h3>
                <p className="text-xs text-amber-700 italic">Guru: {h.teacher}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !selectedStudent ? (
        <>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-bold text-emerald-900">{selectedHalaqah.name}</h2>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-700 hover:bg-amber-800" data-testid="add-student-btn">
                  <Plus className="h-4 w-4 mr-1" /> Tambah Pelajar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Tambah Pelajar</DialogTitle></DialogHeader>
                <Input value={newStudent} onChange={(e) => setNewStudent(e.target.value)} placeholder="Nama pelajar" data-testid="new-student-input" />
                <DialogFooter>
                  <Button onClick={addStudent} className="bg-emerald-800 hover:bg-emerald-900" data-testid="save-student-btn">Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {loadingStudents ? (
            <p className="text-muted-foreground"><Loader2 className="inline h-4 w-4 animate-spin mr-1" /> Memuatkan pelajar...</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="students-list">
              {students.length === 0 ? <p className="text-muted-foreground col-span-full">Tiada pelajar. Sila tambah.</p> : students.map((s) => (
                <Card key={s.id} className="card-hover cursor-pointer border-emerald-200" onClick={() => setSelectedStudent(s)} data-testid={`student-${s.id}`}>
                  <CardContent className="p-4">
                    <p className="font-semibold text-emerald-900">{s.nama}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-emerald-900">{selectedStudent.nama}</h2>
              <p className="text-xs text-muted-foreground">{selectedHalaqah.name}</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedStudent(null)} data-testid="back-student-btn">
              <ArrowLeft className="h-4 w-4 mr-1" /> Pilih Pelajar Lain
            </Button>
          </div>

          <Card className="mb-6 border-emerald-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-emerald-900 mb-3">REKOD TASMI'</h3>
              <Tabs value={mode} onValueChange={setMode}>
                <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto bg-emerald-50 p-1">
                  {MODE_LIST.map((m) => (
                    <TabsTrigger key={m.id} value={m.id} className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white" data-testid={`mode-${m.id}`}>
                      {m.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {MODE_LIST.map((m) => (
                  <TabsContent key={m.id} value={m.id} className="mt-4">
                    <HafazanForm
                      mode={m.id}
                      halaqahId={selectedHalaqah.id}
                      student={selectedStudent}
                      onSaved={() => setReloadKey((k) => k + 1)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <HistoryPanel key={reloadKey} halaqahId={selectedHalaqah.id} student={selectedStudent} />
        </>
      )}
    </Layout>
  );
}

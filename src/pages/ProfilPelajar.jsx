import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft, Users, UserCircle, BookOpen, Trophy, Save, Loader2, FileDown
} from "lucide-react";
import { toast } from "sonner";
import api, { isGuest } from "../lib/api";
import { JUZUK_LIST, SPECIAL_SURAH } from "../lib/constants";
import { exportElementToPDF } from "../lib/pdf";

const ProfileDetail = ({ halaqah, student, onBack }) => {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get("/student-profile/full", {
      params: { student_id: student.id, halaqah_id: halaqah.id }
    });
    setData(data);
    setSelected(data.selected_juzuk_surah || []);
  };

  useEffect(() => { load(); }, [student.id]); // eslint-disable-line

  const toggle = (item) => {
    setSelected((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/student-profile", {
        student_id: student.id,
        halaqah_id: halaqah.id,
        nama: student.nama,
        selected_juzuk_surah: selected,
      });
      toast.success("Profil pelajar disimpan");
      load();
    } catch {
      toast.error("Gagal simpan");
    } finally { setSaving(false); }
  };

  const jumlahJuzuk = selected.filter((s) => s.startsWith("Juzuk")).length;
  const jumlahSurah = selected.filter((s) => !s.startsWith("Juzuk")).length;

  const JuzukBtn = ({ item, short }) => (
    <button
      type="button"
      onClick={() => toggle(item)}
      className={`px-2 py-1.5 rounded text-xs font-medium border transition-all ${
        selected.includes(item)
          ? "bg-emerald-800 text-white border-emerald-800 shadow-md"
          : "bg-white border-emerald-200 hover:bg-emerald-50"
      }`}
      data-testid={`profile-juzuk-${item}`}
    >
      {short}
    </button>
  );

  return (
    <div id="profile-pdf" className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-50 to-amber-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-emerald-800 flex items-center justify-center text-white">
              <UserCircle className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-emerald-900">{student.nama}</h2>
              <p className="text-sm text-amber-800 italic">{halaqah.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Jumlah Hafazan</p>
              <p className="text-3xl font-bold text-emerald-800" data-testid="profile-jumlah">
                {jumlahJuzuk} <span className="text-base font-normal">juzuk</span>
                {jumlahSurah > 0 && <> & {jumlahSurah} <span className="text-base font-normal">surah</span></>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Juzuk Hafazan */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-700" />
              <h3 className="text-lg font-bold text-emerald-900">1. JUMLAH JUZUK HAFAZAN</h3>
            </div>
            <Button onClick={save} disabled={saving} className="bg-emerald-800 hover:bg-emerald-900" data-testid="save-profile-btn">
              {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Menyimpan...</> : <><Save className="h-4 w-4 mr-1" /> Simpan</>}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Klik kotak juzuk/surah yang telah dihafal — jumlah akan dikira automatik.</p>

          <div className="space-y-2">
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
              {JUZUK_LIST.slice(0, 12).map((j) => <JuzukBtn key={j} item={j} short={j.replace("Juzuk ", "J")} />)}
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
              {JUZUK_LIST.slice(12, 24).map((j) => <JuzukBtn key={j} item={j} short={j.replace("Juzuk ", "J")} />)}
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
              {[...JUZUK_LIST.slice(24, 30), ...SPECIAL_SURAH].map((j) => (
                <JuzukBtn key={j} item={j} short={j.startsWith("Juzuk") ? j.replace("Juzuk ", "J") : j.replace("Surah ", "")} />
              ))}
            </div>
          </div>

          {selected.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded border border-emerald-200">
              <p className="text-xs text-emerald-700 mb-1">Dipilih ({selected.length}):</p>
              <div className="flex flex-wrap gap-1">
                {selected.map((s) => <Badge key={s} className="bg-emerald-700">{s}</Badge>)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Hafazan Terkini */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-amber-700" />
            <h3 className="text-lg font-bold text-emerald-900">2. HAFAZAN TERKINI</h3>
          </div>
          {!data?.hafazan_terkini ? (
            <p className="text-sm text-muted-foreground italic" data-testid="hafazan-terkini-empty">Tiada maklumat</p>
          ) : (
            <div className="grid grid-cols-3 gap-4" data-testid="hafazan-terkini-data">
              <div className="p-3 bg-emerald-50 rounded">
                <p className="text-xs text-emerald-700 uppercase">Juzuk / Surah</p>
                <p className="text-lg font-bold text-emerald-900">{data.hafazan_terkini.juzuk_surah || "-"}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded">
                <p className="text-xs text-amber-700 uppercase">Muka Surat</p>
                <p className="text-lg font-bold text-amber-900">{data.hafazan_terkini.muka_surat || "-"}</p>
              </div>
              <div className="p-3 bg-teal-50 rounded">
                <p className="text-xs text-teal-700 uppercase">Tarikh Terakhir</p>
                <p className="text-lg font-bold text-teal-900">{data.hafazan_terkini.tarikh}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3 & 4: Rankings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-amber-700" />
            <h3 className="text-lg font-bold text-emerald-900">3 & 4. RANKING PELAJAR CEMERLANG</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Berdasarkan analisis keseluruhan dari Dashboard e-HUFFAZ</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200">
              <p className="text-xs uppercase text-emerald-700">Ranking Hafazan Baru</p>
              {data?.ranking_hafazan ? (
                <>
                  <p className="text-4xl font-bold text-emerald-800 mt-2" data-testid="ranking-hafazan">
                    #{data.ranking_hafazan}
                    <span className="text-base font-normal text-emerald-700"> / {data.total_pelajar_hafazan}</span>
                  </p>
                  <p className="text-sm text-emerald-700 mt-1">Jumlah: <strong>{data.total_baris_hafazan} baris</strong></p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-2" data-testid="ranking-hafazan-empty">Tiada data — pelajar belum ada rekod hafazan baru</p>
              )}
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200">
              <p className="text-xs uppercase text-amber-700">Ranking Murajaah</p>
              {data?.ranking_murajaah ? (
                <>
                  <p className="text-4xl font-bold text-amber-800 mt-2" data-testid="ranking-murajaah">
                    #{data.ranking_murajaah}
                    <span className="text-base font-normal text-amber-700"> / {data.total_pelajar_murajaah}</span>
                  </p>
                  <p className="text-sm text-amber-700 mt-1">Jumlah: <strong>{data.total_muka_surat_murajaah} muka surat</strong></p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-2" data-testid="ranking-murajaah-empty">Tiada data — pelajar belum ada rekod murajaah</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function ProfilPelajar() {
  const [halaqahs, setHalaqahs] = useState([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => { api.get("/halaqahs").then((r) => setHalaqahs(r.data)); }, []);

  const selectHalaqah = async (h) => {
    setSelectedHalaqah(h);
    setLoadingStudents(true);
    try {
      const { data } = await api.get(`/student-profile/halaqah/${h.id}`);
      // Map to student shape used by ProfileDetail (needs id + nama)
      setStudents(data.map((s) => ({ ...s, id: s.student_id })));
    } finally { setLoadingStudents(false); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">PROFIL PELAJAR</h1>
          <p className="text-sm text-muted-foreground">Maklumat hafazan & ranking pelajar</p>
        </div>
        <div className="flex gap-2">
          {selectedStudent && (
            <Button onClick={() => exportElementToPDF("profile-pdf", `profil-${selectedStudent.nama}.pdf`)} className="bg-emerald-800 hover:bg-emerald-900" data-testid="profile-pdf-btn">
              <FileDown className="h-4 w-4 mr-1" /> PDF
            </Button>
          )}
          {(selectedHalaqah || selectedStudent) && (
            <Button variant="outline" onClick={() => selectedStudent ? setSelectedStudent(null) : setSelectedHalaqah(null)} data-testid="profile-back-btn">
              <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
            </Button>
          )}
        </div>
      </div>

      {!selectedHalaqah ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="profile-halaqah-list">
          {halaqahs.map((h) => (
            <Card key={h.id} className="card-hover cursor-pointer border-emerald-200" onClick={() => selectHalaqah(h)} data-testid={`profile-h-${h.id}`}>
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-emerald-700 mb-2" />
                <h3 className="font-bold text-emerald-900">{h.name}</h3>
                <p className="text-xs text-amber-700 italic">Guru: {h.teacher}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !selectedStudent ? (
        <>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-emerald-900">{selectedHalaqah.name}</h2>
              <p className="text-xs text-muted-foreground">Klik kad pelajar untuk edit profil terperinci</p>
            </div>
            <Badge variant="outline" className="border-emerald-300 text-emerald-800">{students.length} pelajar</Badge>
          </div>
          {loadingStudents ? (
            <p className="text-muted-foreground"><Loader2 className="inline h-4 w-4 animate-spin mr-1" /> Memuatkan pelajar & profil...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="profile-students-list">
              {students.length === 0 ? (
                <p className="text-muted-foreground col-span-full">Tiada pelajar.</p>
              ) : students.map((s) => (
                <Card
                  key={s.id}
                  className={`card-hover border-emerald-200 ${isGuest() ? "" : "cursor-pointer hover:border-emerald-500"}`}
                  onClick={() => { if (!isGuest()) setSelectedStudent(s); }}
                  data-testid={`profile-student-${s.id}`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <UserCircle className="h-7 w-7 text-emerald-700 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-emerald-900 text-sm leading-tight truncate" title={s.nama}>{s.nama}</p>
                      </div>
                    </div>

                    {/* Jumlah Hafazan */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Jumlah Hafazan:</span>
                      <span className="font-bold text-emerald-800" data-testid={`summary-jumlah-${s.id}`}>
                        {s.jumlah_juzuk > 0 || s.jumlah_surah > 0
                          ? <>{s.jumlah_juzuk} juzuk{s.jumlah_surah > 0 ? ` & ${s.jumlah_surah} surah` : ""}</>
                          : <span className="text-slate-400 italic font-normal">Belum diisi</span>}
                      </span>
                    </div>

                    {/* Hafazan Terkini */}
                    <div className="text-xs">
                      <p className="text-muted-foreground mb-1">Hafazan Terkini:</p>
                      {s.hafazan_terkini ? (
                        <div className="bg-emerald-50 rounded px-2 py-1.5 border border-emerald-100">
                          <p className="font-semibold text-emerald-900">{s.hafazan_terkini.juzuk_surah || "-"}</p>
                          <p className="text-muted-foreground">M/S: {s.hafazan_terkini.muka_surat || "-"} · {s.hafazan_terkini.tarikh}</p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Tiada maklumat</p>
                      )}
                    </div>

                    {/* Rankings */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-emerald-50 rounded px-2 py-1.5 border border-emerald-100">
                        <p className="text-emerald-700 text-[10px] uppercase">Rank Hafazan</p>
                        {s.ranking_hafazan ? (
                          <p className="font-bold text-emerald-800">#{s.ranking_hafazan} <span className="text-[10px] font-normal text-emerald-600">({s.total_baris} baris)</span></p>
                        ) : (
                          <p className="text-slate-400 italic">—</p>
                        )}
                      </div>
                      <div className="bg-amber-50 rounded px-2 py-1.5 border border-amber-100">
                        <p className="text-amber-700 text-[10px] uppercase">Rank Murajaah</p>
                        {s.ranking_murajaah ? (
                          <p className="font-bold text-amber-800">#{s.ranking_murajaah} <span className="text-[10px] font-normal text-amber-600">({s.total_muka_surat} m/s)</span></p>
                        ) : (
                          <p className="text-slate-400 italic">—</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <ProfileDetail halaqah={selectedHalaqah} student={selectedStudent} onBack={() => setSelectedStudent(null)} />
      )}
    </Layout>
  );
}

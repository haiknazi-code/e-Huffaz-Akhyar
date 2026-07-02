import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "../components/ui/dialog";
import { ClipboardList, BarChart3, FileText, TrendingUp, Plus, Trash2, AlertCircle, Megaphone, Loader2, UserCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import api, { isGuest } from "../lib/api";
import { todayISO, formatDateTime } from "../lib/constants";

export default function Home() {
  const [buletin, setBuletin] = useState([]);
  const [pending, setPending] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ tajuk: "", memo: "", penghantar: "", tarikh: todayISO() });

  const loadAll = async () => {
    try {
      const [b, p] = await Promise.all([api.get("/buletin"), api.get("/analytics/pending-halaqahs")]);
      setBuletin(b.data);
      setPending(p.data);
    } catch (e) {
      toast.error("Gagal memuat data");
    }
  };

  useEffect(() => { loadAll(); }, []);

  const submitMemo = async (e) => {
    e.preventDefault();
    if (!form.tajuk || !form.memo || !form.penghantar) {
      toast.warning("Sila isi semua medan");
      return;
    }
    setLoading(true);
    try {
      await api.post("/buletin", form);
      toast.success("Memo berjaya ditambah");
      setForm({ tajuk: "", memo: "", penghantar: "", tarikh: todayISO() });
      setOpen(false);
      loadAll();
    } catch {
      toast.error("Gagal hantar memo");
    } finally { setLoading(false); }
  };

  const deleteMemo = async (id) => {
    if (!window.confirm("Padam memo ini secara kekal?")) return;
    try {
      await api.delete(`/buletin/${id}`);
      toast.success("Memo dipadam");
      loadAll();
    } catch { toast.error("Gagal padam"); }
  };

  const mainButtons = [
    { to: "/rekod-harian", label: "REKOD HARIAN", icon: ClipboardList, color: "from-emerald-700 to-emerald-900", desc: "Input rekod tasmi' pelajar", teacherOnly: true },
    { to: "/dashboard", label: "DASHBOARD e-HUFFAZ", icon: BarChart3, color: "from-amber-700 to-amber-900", desc: "Analisis pencapaian" },
    { to: "/laporan", label: "LAPORAN HALAQAH", icon: FileText, color: "from-teal-700 to-emerald-800", desc: "Laporan bulanan", teacherOnly: true },
    { to: "/prestasi", label: "PRESTASI PELAJAR", icon: TrendingUp, color: "from-orange-700 to-amber-800", desc: "Graf prestasi", teacherOnly: true },
    { to: "/profil", label: "PROFIL PELAJAR", icon: UserCircle, color: "from-rose-700 to-rose-900", desc: "Maklumat hafazan pelajar" },
  ];
  const visibleButtons = isGuest() ? mainButtons.filter((b) => !b.teacherOnly) : mainButtons;
  const guest = isGuest();

  return (
    <Layout>
      {/* Hero */}
      <section className="text-center mb-10" data-testid="home-hero">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-900 tracking-tight">
          e-HUFFAZ AL-AKHYAR
        </h1>
        <p className="mt-2 text-base sm:text-lg font-bold italic text-amber-700">
          SISTEM REKOD HARIAN TAHFIZ
        </p>
        <p className="mt-3 text-sm text-muted-foreground">{formatDateTime()}</p>
      </section>

      {/* Guest Banner */}
      {guest && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 p-3 flex items-center gap-3" data-testid="guest-banner">
          <Eye className="h-5 w-5 text-amber-700 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900 text-sm">Mode Tetamu — Paparan Sahaja</p>
            <p className="text-xs text-amber-800">Anda hanya boleh lihat Dashboard e-HUFFAZ dan paparan keseluruhan Profil Pelajar. Tindakan menulis/edit telah dilumpuhkan.</p>
          </div>
        </div>
      )}

      {/* Buletin Utama */}
      <Card className="mb-10 border-amber-200 border-2 shadow-md" data-testid="buletin-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-amber-700" />
              <h2 className="text-2xl font-bold text-emerald-900">BULETIN UTAMA</h2>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-700 hover:bg-amber-800 btn-shine" data-testid="add-memo-btn" disabled={guest} style={guest ? { display: "none" } : {}}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah Memo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Memo Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitMemo} className="space-y-3">
                  <div>
                    <Label>Tajuk *</Label>
                    <Input value={form.tajuk} onChange={(e) => setForm({ ...form, tajuk: e.target.value })} data-testid="memo-tajuk" />
                  </div>
                  <div>
                    <Label>Memo *</Label>
                    <Textarea rows={4} value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} data-testid="memo-isi" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Penghantar *</Label>
                      <Input value={form.penghantar} onChange={(e) => setForm({ ...form, penghantar: e.target.value })} data-testid="memo-penghantar" />
                    </div>
                    <div>
                      <Label>Tarikh</Label>
                      <Input type="date" value={form.tarikh} onChange={(e) => setForm({ ...form, tarikh: e.target.value })} data-testid="memo-tarikh" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading} className="bg-emerald-800 hover:bg-emerald-900" data-testid="memo-submit-btn">
                      {loading ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Sedang memproses...</> : "HANTAR"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {buletin.length === 0 ? (
            <p className="text-sm text-muted-foreground italic" data-testid="buletin-empty">Tiada memo buat masa ini.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {buletin.map((m) => (
                <div key={m.id} className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 card-hover" data-testid={`memo-${m.id}`}>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-emerald-900">{m.tajuk}</h4>
                    <Button variant="ghost" size="icon" onClick={() => deleteMemo(m.id)} className="h-7 w-7 text-red-600" data-testid={`delete-memo-${m.id}`} disabled={guest} style={guest ? { display: "none" } : {}}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{m.memo}</p>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>— {m.penghantar}</span>
                    <span>{m.tarikh}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Buttons - Bento Grid */}
      <section className={`grid sm:grid-cols-2 ${visibleButtons.length >= 4 ? "lg:grid-cols-5" : "lg:grid-cols-2"} gap-4 mb-10`} data-testid="main-buttons">
        {visibleButtons.map((b) => {
          const Icon = b.icon;
          return (
            <Link to={b.to} key={b.to} data-testid={`btn-${b.to.replace("/", "")}`}>
              <Card className={`card-hover btn-shine bg-gradient-to-br ${b.color} text-white border-0 h-full`}>
                <CardContent className="p-6 flex flex-col gap-3 h-full">
                  <Icon className="h-10 w-10" />
                  <h3 className="text-lg font-bold leading-tight">{b.label}</h3>
                  <p className="text-xs opacity-90 mt-auto">{b.desc}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      {/* Status Box */}
      {!guest && (
      <Card className="border-emerald-200" data-testid="status-box">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-amber-700" />
            <h3 className="text-xl font-bold text-emerald-900">STATUS REKOD HARIAN PELAJAR</h3>
          </div>
          {!pending ? (
            <p className="text-sm text-muted-foreground">Memuatkan...</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">Tarikh: {pending.tarikh}</p>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="text-base px-3 py-1 border-amber-300 text-amber-800 bg-amber-50" data-testid="pending-count">
                  {pending.jumlah_belum} / {pending.jumlah_total} halaqah belum isi rekod
                </Badge>
              </div>
              {pending.pending.length === 0 ? (
                <p className="text-sm text-emerald-700 font-medium">Semua halaqah telah menghantar rekod hari ini.</p>
              ) : (
                <div className="flex flex-wrap gap-2" data-testid="pending-list">
                  {pending.pending.map((h) => (
                    <Badge key={h.id} className="bg-red-100 text-red-800 hover:bg-red-200 border border-red-200">
                      {h.name}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      )}
    </Layout>
  );
}

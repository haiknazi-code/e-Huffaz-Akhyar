import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { FileDown, FileText } from "lucide-react";
import api from "../lib/api";
import { currentMonthISO, todayISO } from "../lib/constants";
import { exportElementToPDF } from "../lib/pdf";

export default function LaporanHalaqah() {
  const [halaqahs, setHalaqahs] = useState([]);
  const [halaqahId, setHalaqahId] = useState("");
  const [month, setMonth] = useState(currentMonthISO());
  const [report, setReport] = useState(null);
  const [ulasan, setUlasan] = useState("");
  const [disediakan, setDisediakan] = useState("");
  const [tarikhLaporan, setTarikhLaporan] = useState(todayISO());

  useEffect(() => {
    api.get("/halaqahs").then((r) => { setHalaqahs(r.data); if (r.data.length) setHalaqahId(r.data[0].id); });
  }, []);

  const load = async () => {
    if (!halaqahId || !month) return;
    const { data } = await api.get("/analytics/halaqah-report", { params: { halaqah_id: halaqahId, month } });
    setReport(data);
  };

  useEffect(() => { load(); }, [halaqahId, month]); // eslint-disable-line

  const selected = halaqahs.find((h) => h.id === halaqahId);
  const s = report?.summary;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">LAPORAN HALAQAH</h1>
          <p className="text-sm text-muted-foreground">Laporan bulanan rekod tasmi'</p>
        </div>
      </div>

      <Card className="mb-4"><CardContent className="p-4 grid sm:grid-cols-3 gap-3">
        <div>
          <Label>Halaqah</Label>
          <Select value={halaqahId} onValueChange={setHalaqahId}>
            <SelectTrigger data-testid="laporan-halaqah-select"><SelectValue /></SelectTrigger>
            <SelectContent>{halaqahs.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Bulan</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} data-testid="laporan-month" />
        </div>
        <div className="flex items-end">
          <Button onClick={() => exportElementToPDF("laporan-pdf", `laporan-${halaqahId}-${month}.pdf`)} className="w-full bg-emerald-800 hover:bg-emerald-900" data-testid="laporan-pdf-btn">
            <FileDown className="h-4 w-4 mr-1" /> Generate PDF
          </Button>
        </div>
      </CardContent></Card>

      <Card id="laporan-pdf" className="p-2 bg-white">
        <CardContent className="p-6">
          <div className="text-center border-b border-emerald-200 pb-4 mb-4">
            <div className="flex justify-center items-center gap-3 mb-2">
              <img src="https://i.ibb.co/rGPPBysc/LOGO-SMIAA-TERKINI3.png" alt="logo" className="h-16 w-16" />
              <div>
                <h2 className="text-xl font-bold text-emerald-900">SEKOLAH MENENGAH ISLAM AL-AKHYAR</h2>
                <p className="text-xs italic text-amber-700">We Aim For The Best</p>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mt-3 flex items-center justify-center gap-2"><FileText className="h-6 w-6" /> LAPORAN HALAQAH BULANAN</h3>
            <p className="text-sm">{selected?.name} — {month}</p>
          </div>

          {s && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Hafazan Baru", value: s.hafazan_baru, color: "bg-emerald-50 text-emerald-800" },
                  { label: "Murajaah", value: s.murajaah, color: "bg-teal-50 text-teal-800" },
                  { label: "Amoktha Khatam", value: s.amoktha_khatam, color: "bg-blue-50 text-blue-800" },
                  { label: "Tilawah", value: s.tilawah, color: "bg-indigo-50 text-indigo-800" },
                  { label: "Iqra'", value: s.iqra, color: "bg-purple-50 text-purple-800" },
                  { label: "Jumlah Rekod", value: s.total, color: "bg-amber-50 text-amber-800" },
                ].map((x) => (
                  <div key={x.label} className={`rounded-lg p-4 border ${x.color}`}>
                    <p className="text-xs uppercase">{x.label}</p>
                    <p className="text-2xl font-bold">{x.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                <div className="rounded-lg p-3 bg-emerald-100 text-center"><p className="text-xs">Mumtaz</p><p className="text-xl font-bold text-emerald-800">{s.mumtaz}</p></div>
                <div className="rounded-lg p-3 bg-amber-100 text-center"><p className="text-xs">Jayyid</p><p className="text-xl font-bold text-amber-800">{s.jayyid}</p></div>
                <div className="rounded-lg p-3 bg-red-100 text-center"><p className="text-xs">Daif</p><p className="text-xl font-bold text-red-800">{s.daif}</p></div>
                <div className="rounded-lg p-3 bg-slate-100 text-center"><p className="text-xs">Gagal Hantar</p><p className="text-xl font-bold text-slate-800">{s.gagal_hantar}</p></div>
                <div className="rounded-lg p-3 bg-slate-200 text-center"><p className="text-xs">Tidak Hadir</p><p className="text-xl font-bold text-slate-800">{s.tidak_hadir}</p></div>
              </div>
            </>
          )}

          <div className="mb-4">
            <Label className="text-emerald-900 font-semibold">Ulasan Guru</Label>
            <Textarea rows={4} value={ulasan} onChange={(e) => setUlasan(e.target.value)} placeholder="Tulis ulasan..." data-testid="laporan-ulasan" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Disediakan Oleh</Label>
              <Input value={disediakan} onChange={(e) => setDisediakan(e.target.value)} placeholder="Nama guru" data-testid="laporan-disediakan" />
            </div>
            <div>
              <Label>Tarikh Laporan</Label>
              <Input type="date" value={tarikhLaporan} onChange={(e) => setTarikhLaporan(e.target.value)} data-testid="laporan-tarikh" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

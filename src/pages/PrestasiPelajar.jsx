import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, FileDown, Users, Calendar } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import api from "../lib/api";
import { exportElementToPDF } from "../lib/pdf";
import { currentMonthISO } from "../lib/constants";

export default function PrestasiPelajar() {
  const [halaqahs, setHalaqahs] = useState([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [month, setMonth] = useState(currentMonthISO());

  useEffect(() => { api.get("/halaqahs").then((r) => setHalaqahs(r.data)); }, []);

  const loadPerformance = async (halaqahId, m) => {
    const { data } = await api.get("/analytics/student-performance", { params: { halaqah_id: halaqahId, month: m } });
    setPerformance(data);
  };

  const select = async (h) => {
    setSelectedHalaqah(h);
    await loadPerformance(h.id, month);
  };

  // Reload when month changes
  useEffect(() => {
    if (selectedHalaqah) loadPerformance(selectedHalaqah.id, month);
    // eslint-disable-next-line
  }, [month]);

  const monthLabel = (() => {
    if (!month) return "";
    const [y, m] = month.split("-");
    const names = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
    return `${names[parseInt(m, 10) - 1]} ${y}`;
  })();

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">PRESTASI PELAJAR</h1>
          <p className="text-sm text-muted-foreground">Graf harian Hafazan Baru & Murajaah</p>
        </div>
        {selectedHalaqah && (
          <div className="flex gap-2 flex-wrap items-end">
            <div>
              <Label className="text-xs">Bulan</Label>
              <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44 bg-white" data-testid="prestasi-month-input" />
            </div>
            <Button variant="outline" onClick={() => setSelectedHalaqah(null)} data-testid="prestasi-back-btn">
              <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
            </Button>
            <Button onClick={() => exportElementToPDF("prestasi-pdf", `prestasi-${selectedHalaqah.id}-${month}.pdf`)} className="bg-emerald-800 hover:bg-emerald-900" data-testid="prestasi-pdf-btn">
              <FileDown className="h-4 w-4 mr-1" /> Generate PDF
            </Button>
          </div>
        )}
      </div>

      {!selectedHalaqah ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="prestasi-halaqah-list">
          {halaqahs.map((h) => (
            <Card key={h.id} className="card-hover cursor-pointer border-emerald-200" onClick={() => select(h)} data-testid={`prestasi-h-${h.id}`}>
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-emerald-700 mb-2" />
                <h3 className="font-bold text-emerald-900">{h.name}</h3>
                <p className="text-xs text-amber-700 italic">Guru: {h.teacher}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div id="prestasi-pdf" className="space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-emerald-900">{selectedHalaqah.name}</h2>
            <p className="text-sm text-amber-700 font-semibold flex items-center justify-center gap-1 mt-1">
              <Calendar className="h-4 w-4" /> Bulan {monthLabel}
            </p>
          </div>
          {performance.length === 0 || performance.every((s) => s.daily.length === 0) ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground italic">Tiada data rekod untuk halaqah ini bagi bulan {monthLabel}.</CardContent></Card>
          ) : performance.filter((s) => s.daily.length > 0).map((s) => (
            <Card key={s.student_id} data-testid={`prestasi-s-${s.student_id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                  <h3 className="font-bold text-emerald-900">{s.nama}</h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Hafazan: {s.total_baris} baris
                    </span>
                    <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-semibold">
                      Murajaah: {s.total_muka_surat} m/s
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-700">
                      Hari rekod: {s.daily.length}
                    </span>
                  </div>
                </div>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <LineChart data={s.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tarikh" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="hafazan_baru" name="Hafazan Baru (baris)" stroke="#166534" strokeWidth={2} />
                      <Line type="monotone" dataKey="murajaah" name="Murajaah (muka surat)" stroke="#b45309" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

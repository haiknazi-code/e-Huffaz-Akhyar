import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import api from "../lib/api";
import { BookOpen, Loader2, UserCog, Eye } from "lucide-react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { password });
      localStorage.setItem("ehuffaz_token", data.token);
      localStorage.setItem("ehuffaz_role", "teacher");
      toast.success("Berjaya log masuk sebagai Guru");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Gagal log masuk");
    } finally {
      setLoading(false);
    }
  };

  const onGuest = async () => {
    setGuestLoading(true);
    try {
      const { data } = await api.post("/auth/guest");
      localStorage.setItem("ehuffaz_token", data.token);
      localStorage.setItem("ehuffaz_role", "guest");
      toast.success("Selamat datang, Tetamu");
      navigate("/");
    } catch {
      toast.error("Gagal masuk sebagai tetamu");
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: "linear-gradient(135deg, #6e0a14 0%, #8b1538 45%, #6e0a14 80%, #c9a227 100%)"
      }}
    >
      {/* Decorative pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,215,0,0.6) 1px, transparent 0)",
          backgroundSize: "28px 28px"
        }}
      ></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <img
            src="https://i.ibb.co/rGPPBysc/LOGO-SMIAA-TERKINI3.png"
            alt="Logo"
            className="h-24 w-24 mx-auto mb-3 drop-shadow-2xl"
          />
          <h1 className="text-4xl font-extrabold text-amber-100 tracking-tight" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            e-HUFFAZ AL-AKHYAR
          </h1>
          <p className="text-sm font-bold italic text-amber-300 mt-1">SISTEM REKOD HARIAN TAHFIZ</p>
          <p className="text-xs text-amber-100/80 mt-2 tracking-wider">SEKOLAH MENENGAH ISLAM AL-AKHYAR</p>
        </div>

        <Card className="border-amber-400/30 shadow-2xl backdrop-blur-sm bg-white/95">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 text-rose-900">
              <UserCog className="h-5 w-5" />
              <h2 className="font-bold text-lg">Log Masuk Guru</h2>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <Label htmlFor="password">Kata Laluan</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata laluan"
                  required
                  data-testid="login-password-input"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-shine font-bold"
                style={{ background: "linear-gradient(135deg, #6e0a14 0%, #8b1538 100%)", color: "#fff" }}
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang memproses...</>
                ) : (
                  "MASUK SEBAGAI GURU"
                )}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-amber-300/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-amber-700 font-semibold uppercase tracking-widest">atau</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={onGuest}
              disabled={guestLoading}
              variant="outline"
              className="w-full font-bold border-2 border-amber-600 text-amber-900 hover:bg-amber-50"
              data-testid="login-guest-btn"
            >
              {guestLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang memproses...</>
              ) : (
                <><Eye className="mr-2 h-4 w-4" /> MASUK SEBAGAI TETAMU</>
              )}
            </Button>

            <p className="text-[11px] text-center text-muted-foreground mt-4 leading-relaxed">
              <BookOpen className="inline h-3 w-3 mr-1" />
              Tetamu hanya boleh lihat Dashboard & paparan keseluruhan pelajar
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-amber-100/70 mt-4 italic">
          "We Aim For The Best"
        </p>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { LogOut, Clock, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { isGuest } from "../lib/api";

export const Header = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const logout = () => {
    localStorage.removeItem("ehuffaz_token");
    localStorage.removeItem("ehuffaz_role");
    navigate("/login");
  };

  const timeStr = now.toLocaleString("ms-MY", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header
      className="sticky top-0 z-50 header-gradient sticky-header text-white shadow-lg"
      data-testid="app-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group" data-testid="header-logo-link">
          <img
            src="https://i.ibb.co/rGPPBysc/LOGO-SMIAA-TERKINI3.png"
            alt="Logo SMIAA"
            className="h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-md transition-transform group-hover:scale-105"
          />
          <div className="leading-tight">
            <h1 className="text-base sm:text-xl font-bold tracking-wide">
              SEKOLAH MENENGAH ISLAM AL-AKHYAR
            </h1>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-amber-100/90">
              We Aim For The Best
            </p>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-3 text-amber-50/90 text-sm">
          <Clock className="h-4 w-4" />
          <span data-testid="header-clock">{timeStr}</span>
          {isGuest() && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 ml-2" data-testid="header-guest-badge">
              <Eye className="h-3 w-3 mr-1" /> TETAMU
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-white hover:bg-white/15 hover:text-white"
          data-testid="logout-btn"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Log Keluar
        </Button>
      </div>
    </header>
  );
};

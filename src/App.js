import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import RekodHarian from "./pages/RekodHarian";
import Dashboard from "./pages/Dashboard";
import LaporanHalaqah from "./pages/LaporanHalaqah";
import PrestasiPelajar from "./pages/PrestasiPelajar";
import ProfilPelajar from "./pages/ProfilPelajar";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ duration: 3000 }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/rekod-harian" element={<ProtectedRoute teacherOnly><RekodHarian /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/laporan" element={<ProtectedRoute teacherOnly><LaporanHalaqah /></ProtectedRoute>} />
          <Route path="/prestasi" element={<ProtectedRoute teacherOnly><PrestasiPelajar /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><ProfilPelajar /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

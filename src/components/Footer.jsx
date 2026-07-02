export const Footer = () => {
  return (
    <footer className="mt-12 header-gradient text-white" data-testid="app-footer">
      <div className="max-w-7xl mx-auto px-6 py-5 text-center">
        <p
          className="font-arabic text-xl sm:text-2xl leading-snug text-amber-100"
          dir="rtl"
          data-testid="footer-arabic"
        >
          خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ
        </p>
        <p className="mt-1 text-xs italic text-amber-50/90">
          "Sebaik-baik kamu adalah orang yang mempelajari Al-Quran dan mengajarkannya"
        </p>
        <div className="mt-3 pt-2 border-t border-white/20 text-[11px] text-amber-50/90">
          <p className="font-semibold tracking-wide">e-HUFFAZ AL-AKHYAR &nbsp;·&nbsp; © 2026 SEKOLAH MENENGAH ISLAM AL-AKHYAR</p>
        </div>
      </div>
    </footer>
  );
};

import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col pattern-bg">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 fade-up">
        {children}
      </main>
      <Footer />
    </div>
  );
};

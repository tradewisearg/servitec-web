import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import InstagramButton from "./InstagramAppButton";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <InstagramButton />
        <WhatsAppButton />
      </div>
    </div>
  );
};

export default Layout;

import "./globals.css";
import "./fanta.css";
import Head from "./head";
import AuthProvider from "@/context/AuthContext";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Nota | Easy Breezy Notetaking",
  description:
    "Build your archive of easily navigated and indexed notes with Nota",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head />
      <AuthProvider>
        <body>
          <div id="app">
            {children}
            <Footer />
          </div>
          <div id="portal"></div>
        </body>
      </AuthProvider>
    </html>
  );
}

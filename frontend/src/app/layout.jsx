import './globals.css';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = {
  title: 'WebGIS Karhutla Kalimantan (Next.js + Django GraphQL)',
  description: 'Sistem Pemantauan dan Analitik Kebakaran Hutan dan Lahan Kalimantan berbasis WebGIS OGC, Next.js, dan Django GraphQL',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className="font-sans bg-slate-950 text-slate-800 antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}

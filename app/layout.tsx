import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Breach AI — клиническая практика', description: 'Учебный ветеринарный симулятор: от анамнеза до клинического решения.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="ru"><body>{children}</body></html>; }

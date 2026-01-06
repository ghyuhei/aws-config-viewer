import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AWS Config Viewer - リソース横断検索',
  description: 'AWS Config を使用して複数アカウントのEC2インスタンスとVPCを横断検索',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

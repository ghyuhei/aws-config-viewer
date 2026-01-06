import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AWS Config Viewer',
  description: 'View EC2 and VPC resources across AWS accounts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

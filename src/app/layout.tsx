import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AWS Config Viewer',
  description: 'Search EC2 instances and VPCs across multiple AWS accounts using AWS Config',
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

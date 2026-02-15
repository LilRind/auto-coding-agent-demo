import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Spring FES Video",
  description: "故事转视频生成平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased bg-gray-900 text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

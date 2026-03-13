import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeoMaking - AI 동영상 생성",
  description: "Google Veo 3.1을 이용한 AI 동영상 생성 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-900 text-white min-h-screen">{children}</body>
    </html>
  );
}

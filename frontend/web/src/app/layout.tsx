import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jharkhand Innovation Platform | Grassroots Problems to University R&D",
  description:
    "An AI-orchestrated pipeline turning citizen challenges into multidisciplinary university research projects with startup prototyping and industry CSR funding across all 24 districts.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700,800,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[#fbfcfd] text-[#090e1a]">
        {children}
      </body>
    </html>
  );
}


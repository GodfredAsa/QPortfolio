import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteMenu from "./components/SiteMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Quick Portfolio",
  description:
    "Build and update your online portfolio: profile, story, skills, and links.",
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteMenu />
        <div className="min-h-0 flex-1">{children}</div>
      </body>
    </html>
  );
}

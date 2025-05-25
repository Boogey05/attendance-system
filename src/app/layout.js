import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { library, config } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import CookiesProviderWrapper from './CookiesProviderWrapper';

// Disable auto-replacement of <i> tags to prevent hydration mismatch
config.autoReplaceSvg = false;

// Add all solid icons to the library
library.add(fas);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "College Attendance System",
  description: "A system to manage student and faculty attendance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CookiesProviderWrapper>{children}</CookiesProviderWrapper>
      </body>
    </html>
  );
}
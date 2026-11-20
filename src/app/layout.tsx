import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const spaceGrotesk = localFont({
  src: "../../public/fonts/space-grotesk-bold.ttf",
  weight: "700",
  variable: "--font-space",
  display: "swap",
});
const dmSans = localFont({
  src: [
    { path: "../../public/fonts/dm-sans-regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/dm-sans-bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MemeMatch — You vs. the meme.",
  description: "Your face. Their meme. Let's see who wins. Recreate meme expressions with your camera and see how closely you match.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

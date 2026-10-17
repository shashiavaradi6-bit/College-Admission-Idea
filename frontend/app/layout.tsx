import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Campus Compass | Find your next move", description: "Explore Indian colleges and compare historical admission information." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }

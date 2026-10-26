import type { ReactNode } from "react";
import "./styles.css";
export const metadata = { title: "PSM V4", description: "Market-first intelligence dashboard" };
export default function RootLayout({children}:{children:ReactNode}) { return <html lang="en"><body>{children}</body></html>; }

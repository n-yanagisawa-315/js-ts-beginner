import { M_PLUS_Rounded_1c, Noto_Serif_JP, Source_Code_Pro } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const serif = Noto_Serif_JP({
  variable: "--font-mincho",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const rounded = M_PLUS_Rounded_1c({
  variable: "--font-jp",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const code = Source_Code_Pro({
  variable: "--font-code",
  weight: ["400", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JS / TS / Node しくみ講座",
  description:
    "JavaScript、TypeScript、Node.js の仕組みを、図とコードで見てから演習する講座",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${serif.variable} ${rounded.variable} ${code.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-desk">{children}</body>
    </html>
  );
}

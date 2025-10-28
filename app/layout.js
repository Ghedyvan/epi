import "./globals.css";
import {Providers} from "./providers";

export const metadata = {
  title: "Zipon - Gestão de EPIs",
  description: "Controle de estoque, entregas e conformidade de EPIs",
  manifest: "/manifest.json",
  // themeColor: "#2563eb",
};

export default function RootLayout({children}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
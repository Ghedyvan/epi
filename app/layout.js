import "./globals.css";
import {Providers} from "./providers";

export const metadata = {
  title: "PWA Gestão de EPIs",
  description: "Progressive Web App para controle de estoque, entregas e conformidade de EPIs mesmo offline.",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
};

export default function RootLayout({children}) {
  return (
    <html lang="pt-br" className='light'>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
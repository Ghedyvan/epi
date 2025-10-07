import "./globals.css";
import {Providers} from "./providers";

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
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gama 3D — Filamentos para impressão 3D",
  description: "Cores, tipos e preços de filamentos para impressão 3D. Monte seu pedido e envie pelo WhatsApp.",
};

// Aplica o tema salvo antes da pintura, evitando "piscar" ao carregar
const temaScript = `try{var t=localStorage.getItem("tema");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

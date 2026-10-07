import Image from "next/image";
import { getFilamentos } from "@/lib/filamentos";
import { TabelaFilamentos } from "./TabelaFilamentos";
import { ThemeToggle } from "./ThemeToggle";
import logo from "@/public/logo.webp";
import logoDark from "@/public/logo-dark.webp";

// Regenera a página periodicamente (ISR), útil com Google Sheets
export const revalidate = 300;

export default async function Home() {
  const filamentos = await getFilamentos();

  return (
    <main className="container">
      <div className="topo">
        <div>
          <Image src={logo} alt="Gama 3D" className="logo logo-claro" loading="eager" sizes="(max-width: 680px) 50vw, 340px" />
          <Image src={logoDark} alt="Gama 3D" className="logo logo-escuro" loading="eager" sizes="(max-width: 680px) 50vw, 340px" />
        </div>
        <ThemeToggle />
      </div>

      <header className="hero">
        <span className="eyebrow">Tabela de preços</span>
        <h1>Filamentos para impressão 3D</h1>
        <p>Selecione os filamentos, ajuste as quantidades e envie o pedido pelo WhatsApp.</p>
      </header>

      <TabelaFilamentos filamentos={filamentos} whatsapp={process.env.WHATSAPP_NUMBER} />

      <footer className="footer">Preços sujeitos a alteração sem aviso prévio.</footer>
    </main>
  );
}

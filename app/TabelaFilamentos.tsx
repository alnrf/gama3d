"use client";

import { useMemo, useState } from "react";
import type { Filamento } from "@/lib/filamentos";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const idOf = (f: Filamento) => `${f.tipo}|${f.cor}|${f.peso}`;

type Props = { filamentos: Filamento[]; whatsapp?: string };

export function TabelaFilamentos({ filamentos, whatsapp }: Props) {
  const tipos = useMemo(() => [...new Set(filamentos.map((f) => f.tipo))], [filamentos]);
  const [ativo, setAtivo] = useState(tipos[0] ?? "");
  // id → quantidade. A seleção é mantida ao trocar de aba.
  const [pedido, setPedido] = useState<Record<string, number>>({});

  const porId = useMemo(() => new Map(filamentos.map((f) => [idOf(f), f])), [filamentos]);
  const itens = Object.entries(pedido)
    .map(([id, qtd]) => ({ f: porId.get(id)!, qtd }))
    .filter((i) => i.f);
  const totalItens = itens.reduce((s, i) => s + i.qtd, 0);
  const totalValor = itens.reduce((s, i) => s + i.qtd * i.f.preco, 0);
  const selecionadosPorTipo = (t: string) => itens.filter((i) => i.f.tipo === t).length;

  const alternar = (id: string) =>
    setPedido((p) => {
      const n = { ...p };
      if (n[id]) delete n[id];
      else n[id] = 1;
      return n;
    });

  const mudarQtd = (id: string, delta: number) =>
    setPedido((p) => {
      const q = (p[id] ?? 0) + delta;
      const n = { ...p };
      if (q <= 0) delete n[id];
      else n[id] = Math.min(q, 99);
      return n;
    });

  const enviar = () => {
    const linhas = itens.map(
      ({ f, qtd }) => `• ${qtd}x ${f.tipo} ${f.cor}${f.peso ? ` (${f.peso})` : ""}: ${brl.format(f.preco * qtd)}`,
    );
    const texto = [
      "Olá! Gostaria de fazer um pedido:",
      "",
      ...linhas,
      "",
      `*Total: ${brl.format(totalValor)}*`,
    ].join("\n");
    const numero = (whatsapp ?? "").replace(/\D/g, "");
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!tipos.length) return <p className="vazio">Nenhum filamento cadastrado.</p>;

  const lista = filamentos.filter((f) => f.tipo === ativo);

  return (
    <section className={totalItens ? "com-barra" : ""}>
      <div className="tabs" role="tablist" aria-label="Tipos de filamento">
        {tipos.map((t) => {
          const sel = selecionadosPorTipo(t);
          return (
            <button
              key={t}
              role="tab"
              aria-selected={t === ativo}
              className={t === ativo ? "tab ativo" : "tab"}
              onClick={() => setAtivo(t)}
            >
              {t}
              <span className="contagem">{sel ? `${sel} ✓` : filamentos.filter((f) => f.tipo === t).length}</span>
            </button>
          );
        })}
      </div>

      <div className="tabela-wrap" role="tabpanel">
        <table className="tabela">
          <thead>
            <tr>
              <th className="col-check" aria-label="Selecionar" />
              <th>Cor</th>
              <th className="col-peso">Peso</th>
              <th className="direita">Preço</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((f) => {
              const id = idOf(f);
              const qtd = pedido[id] ?? 0;
              const marcado = qtd > 0;
              return (
                <tr
                  key={id}
                  className={[f.disponivel ? "" : "indisponivel", marcado ? "selecionado" : ""].join(" ")}
                  onClick={() => f.disponivel && alternar(id)}
                >
                  <td className="col-check">
                    <input
                      type="checkbox"
                      checked={marcado}
                      disabled={!f.disponivel}
                      onChange={() => alternar(id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Selecionar ${f.tipo} ${f.cor}`}
                    />
                  </td>
                  <td>
                    <span className="cor">
                      <span className="amostra" style={{ background: f.hex }} aria-hidden />
                      {f.cor}
                      {!f.disponivel && <span className="badge">Esgotado</span>}
                    </span>
                    {marcado && (
                      <div className="qtd" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => mudarQtd(id, -1)} aria-label="Diminuir">−</button>
                        <span aria-live="polite">{qtd}</span>
                        <button onClick={() => mudarQtd(id, 1)} aria-label="Aumentar">+</button>
                      </div>
                    )}
                  </td>
                  <td className="muted col-peso">{f.peso}</td>
                  <td className="direita preco">{brl.format(f.preco)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalItens > 0 && (
        <div className="barra-pedido" role="region" aria-label="Resumo do pedido">
          <div className="resumo">
            <strong>{totalItens} {totalItens === 1 ? "rolo" : "rolos"}</strong>
            <span>{brl.format(totalValor)}</span>
          </div>
          <button className="limpar" onClick={() => setPedido({})}>Limpar</button>
          <button className="whats" onClick={enviar} disabled={!whatsapp}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
            </svg>
            Enviar pedido
          </button>
        </div>
      )}
    </section>
  );
}

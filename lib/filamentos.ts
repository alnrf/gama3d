import { readFile } from "node:fs/promises";
import path from "node:path";

export type Filamento = {
  tipo: string;
  cor: string;
  hex: string;
  preco: number;
  peso: string;
  disponivel: boolean;
};

/**
 * Fonte dos dados:
 * - Se SHEET_CSV_URL estiver definida (Google Sheets → Arquivo → Compartilhar →
 *   Publicar na Web → CSV), lê de lá.
 * - Caso contrário, lê data/filamentos.csv do próprio repositório.
 */
export async function getFilamentos(): Promise<Filamento[]> {
  const url = process.env.SHEET_CSV_URL;
  let raw: string;

  if (url) {
    // Revalida a cada 5 min: editou a planilha, o site atualiza sozinho.
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Falha ao ler planilha: ${res.status}`);
    raw = await res.text();
  } else {
    raw = await readFile(path.join(process.cwd(), "data", "filamentos.csv"), "utf-8");
  }

  return parseCsv(raw);
}

function parseCsv(raw: string): Filamento[] {
  const lines = raw.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Aceita ; (Excel PT-BR) ou , (Google Sheets)
  const sep = lines[0].includes(";") ? ";" : ",";
  const header = splitLine(lines[0], sep).map((h) => normalize(h));
  const idx = (name: string) => header.indexOf(name);

  return lines.slice(1).map((line) => {
    const c = splitLine(line, sep);
    const get = (name: string) => (idx(name) >= 0 ? (c[idx(name)] ?? "").trim() : "");
    const disp = normalize(get("disponivel"));
    return {
      tipo: get("tipo"),
      cor: get("cor"),
      hex: get("hex") || "#cccccc",
      preco: parsePreco(get("preco")),
      peso: get("peso"),
      disponivel: disp === "" || ["sim", "s", "true", "1", "yes", "x"].includes(disp),
    };
  }).filter((f) => f.tipo && f.cor);
}

// Separa respeitando aspas ("Azul, claro")
function splitLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === sep && !quoted) {
      out.push(cur); cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function normalize(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// "R$ 1.299,90" | "89,90" | "89.90" → número
function parsePreco(s: string): number {
  let v = s.replace(/[^\d,.-]/g, "");
  if (v.includes(",")) v = v.replace(/\./g, "").replace(",", ".");
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

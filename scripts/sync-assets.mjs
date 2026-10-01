// Copia as imagens-mestre aprovadas do acervo do projeto para site/src/assets/.
// Cópia byte a byte (sem recompressão): a geração das versões web (AVIF/WebP/JPEG,
// vários tamanhos) é feita pelo Astro no build. Rode quando entrar peça nova ou
// trocar uma master:  npm run sync:assets
//
// Só funciona com o acervo do projeto ao lado do site (../Otimizadas, ../brand).
// O build NÃO depende deste script: src/assets/ é versionado junto com o site.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projeto = path.resolve(site, '..');
const assets = path.join(site, 'src', 'assets');

// id da peça (src/data/pecas.json) → master em Otimizadas/
// (as masters têm extensão .png mas são JPEG 1024×1024; aqui ganham a extensão correta)
function masterDaPeca(id) {
  if (id === 'peca-leopardo') return 'Otimizadas/vaso_leopardo_tropical_liatelier.png';
  const m = id.match(/^peca-(\d+)-(\d+)$/);
  if (!m) throw new Error(`id de peça fora do padrão: ${id}`);
  const [pasta, foto] = [Number(m[1]), Number(m[2])];
  return `Otimizadas/${pasta}/foto_peca_referencia_${pasta}_${foto}_liatelier.png`;
}

const { pecas } = JSON.parse(fs.readFileSync(path.join(site, 'src', 'data', 'pecas.json'), 'utf8'));
const itens = [
  { origem: 'brand/logo/logo-liatelier-1024.png', destino: 'logo-liatelier.png' },
  { origem: 'foto lia estilizada.jpeg', destino: 'retrato-lia.jpg' },
  ...pecas.map((p) => ({ origem: masterDaPeca(p.id), destino: `pecas/${p.id}.jpg` })),
];

const manifesto = [];
let copiados = 0;
for (const { origem, destino } of itens) {
  const de = path.join(projeto, origem);
  const para = path.join(assets, destino);
  if (!fs.existsSync(de)) {
    console.error(`FALTA a master: ${origem}`);
    process.exitCode = 1;
    continue;
  }
  const dados = fs.readFileSync(de);
  const sha256 = createHash('sha256').update(dados).digest('hex');
  if (!fs.existsSync(para) || !dados.equals(fs.readFileSync(para))) {
    fs.mkdirSync(path.dirname(para), { recursive: true });
    fs.writeFileSync(para, dados);
    copiados++;
  }
  manifesto.push({ arquivo: destino, origem, sha256 });
}

// rastreabilidade: de qual arquivo do acervo veio cada imagem do site
fs.writeFileSync(path.join(assets, 'origens.json'), JSON.stringify(manifesto, null, 2) + '\n');
console.log(`${itens.length} imagens conferidas, ${copiados} copiadas/atualizadas → src/assets/`);

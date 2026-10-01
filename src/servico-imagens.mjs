// Serviço de imagens do site: o sharp padrão do Astro + nitidez após o redimensionamento.
// Sem a nitidez, as versões web ficavam visivelmente mais moles que as masters (medido em
// 2026-10-01 contra o build v8). Parâmetros escolhidos por comparação lado a lado em
// pintura fina (peca-10-2): mais que isso cria halo no filete; menos, perde o traço.
import sharp from 'sharp';
import servicoSharp from 'astro/assets/services/sharp';

const NITIDEZ_REDUZIDA = { sigma: 0.8, m1: 0.6, m2: 2 };   // versões menores que a master
const NITIDEZ_INTEIRA = { sigma: 1.0, m1: 0.8, m2: 2.5 };  // master inteira (herói, lightbox): o navegador ainda amplia
const CODIFICADOR = {
  webp: { smartSubsample: true, effort: 5 },               // preserva borda de cor (o WebP comum borra o filete)
  jpeg: { mozjpeg: true, chromaSubsampling: '4:4:4' },
  png: {},
};

export default {
  ...servicoSharp,
  async transform(entrada, transform, config) {
    const formato = transform.format === 'jpg' ? 'jpeg' : transform.format;
    // fora do caso comum (foto → webp/jpeg/png com largura definida), vale o serviço padrão
    if (!transform.width || !(formato in CODIFICADOR)) {
      return servicoSharp.transform(entrada, transform, config);
    }

    const imagem = sharp(entrada, { failOn: 'none' }).rotate();
    const { width: larguraMaster } = await imagem.metadata();
    const largura = Math.round(transform.width);
    imagem.resize({
      width: largura,
      height: transform.height ? Math.round(transform.height) : undefined,
      kernel: 'lanczos3',
      withoutEnlargement: true,
    });
    imagem.sharpen(largura < larguraMaster ? NITIDEZ_REDUZIDA : NITIDEZ_INTEIRA);

    const qualidade = Number(transform.quality);
    imagem[formato]({ ...CODIFICADOR[formato], ...(Number.isFinite(qualidade) ? { quality: qualidade } : {}) });
    const { data, info } = await imagem.toBuffer({ resolveWithObject: true });
    return { data, format: info.format };
  },
};

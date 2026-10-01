import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const pecas = defineCollection({
  loader: file('src/data/pecas.json', { parser: (t) => JSON.parse(t).pecas }),
  schema: ({ image }) => z.object({
    ordem: z.number().int().positive(),      // posição na grade do portfólio
    home: z.number().int().min(1).max(6).optional(),     // vitrine da home
    mosaico: z.number().int().min(1).max(6).optional(),  // mosaico de abertura do portfólio
    foto: image(),                           // master em src/assets/pecas/ (caminho relativo ao JSON)
    alt: z.string().min(10),
    legenda: z.string(),
  }),
});

export const collections = { pecas };

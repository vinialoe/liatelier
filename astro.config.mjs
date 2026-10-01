import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://liatelier.com.br', // confirmar domínio no deploy
  trailingSlash: 'never',
  integrations: [sitemap()],
  image: {
    service: { entrypoint: './src/servico-imagens.mjs' }, // sharp + nitidez pós-redimensionamento
  },
});

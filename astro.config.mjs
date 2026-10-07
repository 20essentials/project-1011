// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  build: {
    assets: 'static'
  },

  fonts: [
    {
      provider: fontProviders.local(),
      name: 'ArtDeco',
      cssVariable: '--font-art-deco',
      options: {
        variants: [
          { src: ['./src/assets/fonts/art-deco.woff'], weight: 300, style: 'normal' }
        ]
      }
    },
    {
      provider: fontProviders.local(),
      name: 'GtaBold',
      cssVariable: '--font-gta-bold',
      options: {
        variants: [
          { src: ['./src/assets/fonts/gta-bold.woff'], weight: 700, style: 'normal' }
        ]
      }
    },
    {
      provider: fontProviders.local(),
      name: 'GtaRegular',
      cssVariable: '--font-gta-regular',
      options: {
        variants: [
          { src: ['./src/assets/fonts/gta-regular.woff'], weight: 500, style: 'normal' }
        ]
      }
    },
    {
      provider: fontProviders.local(),
      name: 'GtaNarrow',
      cssVariable: '--font-gta-narrow',
      options: {
        variants: [
          { src: ['./src/assets/fonts/gta-narrow.woff'], weight: 400, style: 'normal' }
        ]
      }
    }
  ],
  base: import.meta.env.DEV ? undefined : '/project-1011/',
  site: import.meta.env.DEV
    ? 'http://localhost:4321/'
    : 'https://20essentials.github.io/project-1011/',

  integrations: [react()]
});

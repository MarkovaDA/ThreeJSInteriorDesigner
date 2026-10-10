import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { furnitureCatalogPlugin } from './vite-plugin-furniture-catalog';

// https://vite.dev/config/
export default defineConfig({
  base: '/ThreeJSInteriorDesigner/',
  plugins: [react(), furnitureCatalogPlugin()],
});

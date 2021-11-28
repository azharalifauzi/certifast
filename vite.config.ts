import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import tsconfigPaths from 'vite-tsconfig-paths';
import { injectHtml } from 'vite-plugin-html';
import { loadEnv } from 'vite';
import svgr from '@honkhonk/vite-plugin-svgr';
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // @ts-ignore
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      reactRefresh(),
      tsconfigPaths(),
      svgr(),
      injectHtml({
        injectData: {
          gtag_id: env.VITE_GTAG_ID,
        },
      }),
    ],
  };
});

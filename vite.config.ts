import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import tsconfigPaths from 'vite-tsconfig-paths';
import { injectHtml } from 'vite-plugin-html';
import { loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // @ts-ignore
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      reactRefresh(),
      tsconfigPaths(),
      injectHtml({
        injectData: {
          gtag_id: env.VITE_GTAG_ID,
        },
      }),
    ],
  };
});

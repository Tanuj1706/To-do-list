import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawUrl = env.VITE_SUPABASE_URL || 'https://tpxxphbvjmcivkgpijvl.supabase.co';
  let supabaseHost = 'tpxxphbvjmcivkgpijvl.supabase.co';
  try {
    supabaseHost = new URL(rawUrl).hostname;
  } catch {
    // fallback
  }

  // Cloudflare Supabase IP bypassing ACT Fibernet DNS sinkhole
  const cloudflareSupabaseIp = '172.64.149.246';

  const agent = new https.Agent({
    servername: supabaseHost
  });

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      proxy: {
        '/supabase-proxy': {
          target: `https://${cloudflareSupabaseIp}`,
          changeOrigin: true,
          secure: true,
          agent: agent,
          rewrite: (path) => path.replace(/^\/supabase-proxy/, ''),
          headers: {
            Host: supabaseHost
          }
        }
      }
    }
  };
});

import { defineConfig, loadEnv, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const API_PROXY_TIMEOUT_MS = 30000;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_APP_API_URL;
  const socketUrl = env.VITE_SOCKET_URL || apiUrl;
  const useDevProxy = env.VITE_USE_DEV_PROXY === "true";

  const createProxyOptions = (target: string): ProxyOptions => ({
    target,
    changeOrigin: true,
    secure: false,
    ws: true,
    timeout: API_PROXY_TIMEOUT_MS,
    proxyTimeout: API_PROXY_TIMEOUT_MS,
  });

  const getProxyTarget = (url?: string) => {
    if (!url) return undefined;

    try {
      return new URL(url).origin;
    } catch {
      return undefined;
    }
  };

  const buildDevProxy = () => {
    const proxyConfig: Record<string, ProxyOptions> = {};
    const apiTarget = getProxyTarget(apiUrl);
    const socketTarget = getProxyTarget(socketUrl);

    if (apiUrl && apiTarget) {
      const parsed = new URL(apiUrl);
      const firstPathSegment = parsed.pathname.split("/").filter(Boolean)[0];
      const proxyPrefix = firstPathSegment ? `/${firstPathSegment}` : "/api";

      proxyConfig[proxyPrefix] = createProxyOptions(apiTarget);
    }

    if (socketTarget) {
      proxyConfig["/socket.io"] = createProxyOptions(socketTarget);
    }

    return Object.keys(proxyConfig).length ? proxyConfig : undefined;
  };

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: mode === "development" && useDevProxy ? buildDevProxy() : undefined,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

import { defineConfig, loadEnv, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const createProxyOptions = (target: string): ProxyOptions => ({
    target,
    changeOrigin: true,
    secure: false,
    ws: true,
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
    const apiUrl = env.VITE_APP_API_URL;
    const proxyConfig: Record<string, ProxyOptions> = {};
    const apiTarget = getProxyTarget(apiUrl);
    const socketTarget = getProxyTarget(env.VITE_SOCKET_URL || apiUrl);

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
      proxy: mode === "development" ? buildDevProxy() : undefined,
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

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const buildDevProxy = () => {
    const apiUrl = env.VITE_APP_API_URL;
    if (!apiUrl) return undefined;

    try {
      const parsed = new URL(apiUrl);
      const firstPathSegment = parsed.pathname.split("/").filter(Boolean)[0];
      const proxyPrefix = firstPathSegment ? `/${firstPathSegment}` : "/api";

      return {
        [proxyPrefix]: {
          target: parsed.origin,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      };
    } catch {
      // Relative URLs do not need proxy target parsing.
      return undefined;
    }
  };

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: mode === "development" ? buildDevProxy() : undefined,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

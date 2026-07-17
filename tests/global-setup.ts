import { build, preview } from "vite";

export default async function globalSetup() {
  await build({
    mode: "test",
    logLevel: "silent",
    // Mantém os controles de fixture disponíveis sem carregar as variáveis
    // comerciais/SEO do preview publicado.
    define: {
      "import.meta.env.DEV": "true",
      "import.meta.env.PROD": "false",
    },
  });
  const server = await preview({
    preview: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: true,
    },
    logLevel: "silent",
  });

  return async () => {
    await server.close();
  };
}

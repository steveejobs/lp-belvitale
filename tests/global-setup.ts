import { createServer } from "vite";

export default async function globalSetup() {
  process.env.VITE_QUIZ_PUBLICATION_STATUS = "approved";
  process.env.VITE_CANONICAL_URL = "https://example.test/";
  const server = await createServer({
    server: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: true,
    },
  });
  await server.listen();

  return async () => {
    await server.close();
  };
}

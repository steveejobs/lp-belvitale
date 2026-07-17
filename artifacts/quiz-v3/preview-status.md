# Preview do quiz Belvitale v3

- URL: https://lp-belvitale-j43y9ggaj-bandeirargabriel-6963s-projects.vercel.app/quiz
- Resultado: https://lp-belvitale-j43y9ggaj-bandeirargabriel-6963s-projects.vercel.app/quiz/resultado
- Tipo de deploy: **Preview**, sem promoção para produção.
- Build remoto: concluído com TypeScript e Vite.
- `/quiz`: HTTP 200 validado pela autenticação do CLI; HTML específico do quiz, sem bootstrap da homepage.
- `/quiz/resultado`: HTTP 200 validado pela autenticação do CLI; recuperação sem estado e `noindex` presentes.

O projeto aplica Vercel Authentication aos previews. A URL redireciona visitantes sem acesso ao login da Vercel; a proteção não foi removida nem contornada. As gravações e capturas locais do mesmo build estão nas pastas `videos/` e `screenshots/`.

export type QuizRoutePath = "quiz" | "result";

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function getQuizRoutePath(pathname: string): QuizRoutePath | null {
  const normalized = normalizePathname(pathname);
  if (normalized === "/quiz") return "quiz";
  if (normalized === "/quiz/resultado") return "result";
  return null;
}

export function isQuizPath(pathname: string): boolean {
  return getQuizRoutePath(pathname) !== null;
}

export function getQuizUrl(path: QuizRoutePath): string {
  return path === "result" ? "/quiz/resultado" : "/quiz";
}

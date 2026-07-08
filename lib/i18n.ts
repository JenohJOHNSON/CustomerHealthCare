export type Lang = "en" | "fr";

type SearchParams = Promise<{
  lang?: string | string[];
}>;

export type LangPageProps = {
  searchParams?: SearchParams;
};

export function parseLang(value: string | string[] | undefined): Lang {
  const lang = Array.isArray(value) ? value[0] : value;
  return lang === "fr" ? "fr" : "en";
}

export async function getPageLang(searchParams?: SearchParams): Promise<Lang> {
  const params = await searchParams;
  return parseLang(params?.lang);
}

export function hrefWithLang(path: string, lang: Lang, hash?: string) {
  const separator = path.includes("?") ? "&" : "?";
  const anchor = hash ? `#${hash}` : "";
  return `${path}${separator}lang=${lang}${anchor}`;
}

export function localeFor(lang: Lang) {
  return lang === "fr" ? "fr-FR" : "en-US";
}

export const $ = <T extends Element = HTMLElement>(el: string): T =>
  document.querySelector<T>(el) as T;

export const $$ = <T extends Element = HTMLElement>(el: string): T[] => [
  ...document.querySelectorAll<T>(el)
];

export const baseUrl = (path: string) => {
  return new URL(path.replace(/^\/+/, ''), import.meta.env.SITE).toString();
};

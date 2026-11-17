export const $ = <T extends Element = HTMLElement>(el: string): T =>
  document.querySelector<T>(el) as T

export const baseUrl = (path: string) =>
  new URL(path.replace(/^\/+/, ''), import.meta.env.SITE).toString()

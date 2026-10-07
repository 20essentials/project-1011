# mask-size del hero dejó de animarse (Chrome 2026 vs GSAP)

**Fecha:** 07 de octubre de 2026
**Archivo afectado:** `src/components/hero-1/hero.astro`
**Estado:** resuelto

## Síntoma

Al hacer scroll, la máscara del logo (`mask-size`) ya no hacía el zoom de
`4000vmax → 15vmax`. En su lugar, el hero se colapsaba casi a 0 al empezar a
scrollear y después crecía hasta el logo final de `15vmax`.

En el DOM se veía esto al inicio del scroll:

```html
<div class="super-container-mask" style="mask-size: 66734.5px auto;"></div>
```

mientras la regla CSS seguía intacta:

```css
.super-container-mask {
  mask-size: 4000vmax;
}
```

## Diagnóstico

Comparando los commits `bb2d731` (2025-07-19) y `2cd55f1` (2026-10-07):

- `hero.astro` no cambió en CSS ni en JS (solo rutas de imports renombradas).
- `gsap` sigue en `3.13.0` exacto en ambos commits.
- El CSS de la máscara aplica correctamente (`getComputedStyle` devolvía
  `66734.5px auto`, es decir `4000vmax` resuelto).

Es decir, el código era el mismo: lo que cambió fue el **navegador**.

### Causa raíz

La CSSWG resolvió (2025) que `mask-size` siempre se serialice con **dos
valores** (WPT actualizado en enero 2026:
`test_valid_value("mask-size", "1px", "1px auto")`). Chrome implementó el
cambio entre 2025 y 2026:

| Año  | `getComputedStyle(el).maskSize` |
|------|----------------------------------|
| 2025 | `"66734.5px"`                    |
| 2026 | `"66734.5px auto"`               |

GSAP, al crear el tween con `.to($el, { maskSize: '15vmax' })`, lee el valor
computado como inicio y toma como "unidad" todo lo que va después del número:

- 2025: unidad = `"px"` → convierte `66734.5px → 4000vmax` correctamente →
  anima `4000 → 15vmax`. **Funcionaba.**
- 2026: unidad = `"px auto"` (inválida) → `_convertToUnit` intenta medir con
  `height: 100px auto`, la asignación se ignora silenciosamente, mide `0` →
  el start del tween queda en **0** → anima `0 → 15vmax`. **Roto.**

Verificado con Chrome headless + puppeteer enganchando los setters de
`CSSStyleDeclaration`: GSAP leía `"64000px auto"` (en viewport 1600px) y
escribía `0.0666vmax → 0.83vmax → 2.6vmax → … → 15vmax` en vez de
`4000 → … → 15vmax`.

El `style="mask-size: 66734.5px auto;"` visible al inicio del scroll es solo
GSAP escribiendo el string crudo del start en progress 0: eso es normal y no
era el bug.

## Solución

Declarar el valor inicial de forma explícita con `fromTo` para que GSAP no
tenga que leer el valor computado ni convertir unidades (unidad de inicio =
unidad final = `vmax`, no hay conversión):

```js
tl.fromTo(
  $superContainerMask,
  { maskSize: '4000vmax' },
  { maskSize: '15vmax', duration: 1 },
  0.1
)
```

## Verificación

Recorrido de scroll con Chrome headless sobre el dev server:

```
pos 0.00 → mask-size: 4000vmax
pos 0.05 → mask-size: 3533.73vmax
pos 0.08 → mask-size: 2853.66vmax
pos 0.12 → mask-size: 2057.93vmax
pos 0.20 → mask-size: 858.226vmax
pos 0.40 → mask-size: 15vmax  (y opacidad fade correcto)
```

## Notas

- No hace falta `<style is:global>` en `hero.astro`: el `<style>` con scoping
  de Astro aplica correctamente (probado: `mask-image`, `mask-size` y `height`
  se resuelven bien). Se dejó `<style>` simple.
- Otros tweens con unidades (`--width-gradient`, `scale`, `opacity`) no se
  ven afectados: o usan variables CSS (donde GSAP no pasa por
  `_convertToUnit`) o transform.
- Regla general: evitar `.to()` sobre propiedades CSS cuyo valor computado el
  navegador pueda serializar de forma ambigua (dos componentes); usar
  `fromTo` con el start explícito.

# LUMA — camillasluma.com (build One Shot)

Cliente de Jungle Growth. LUMA vende camillas eléctricas premium y
equipamiento médico estético en Argentina. Público: médicos y dueños de
centros de estética (perfil "Paula"). Contactos cliente: Marcelo y Micaela Galer.

## Plan maestro
El plano de obra completo está en `docs/luma-reestructuracion-web.md`.
LEÉLO antes de ejecutar cualquier fase. Seguí el orden de la sección 12
(Orden de ejecución). No improvises fuera de ese plan.

## Reglas de oro (no negociables)
- NO INVENTES los placeholders. Dejalos visibles como `{{...}}` o
  `⚠️ A CONFIRMAR` hasta que el cliente los confirme:
  {{GARANTIA}}, {{EMAIL_DOMINIO}}, {{IG_HANDLE}}, {{CART_GOLD_PRECIO}},
  {{CART_GOLD_IMG}}, {{ONE_IMG}}, {{SHOWROOM_CP_PALERMO}},
  {{SHOWROOM_CP_BELGRANO}}, {{HEX_OFICIALES}}.
- GARANTÍA: hay conflicto ("1 año" vs "1 año sillas / 2 años motores").
  No escribas plazos definitivos. Usá {{GARANTIA}}.
- PRECIOS: mostralos como "consultar / a partir de" (venta por cotización).
  No publiques cifras sin confirmar vigencia.
- NUNCA schema `Review` / `AggregateRating` sobre testimonios placeholder.
  Riesgo de penalización. Solo con reseñas reales.
- Todo en VOSEO. Sin "Contáctanos" / "Completá" mezclados.
- Un solo H1 por página.

## Convenciones técnicas
- Salida estática: HTML/CSS/JS. Sin CMS ni theme.
- Header, footer y bloques = componentes/partials compartidos.
  UNA fuente de verdad, no copiar en 14 páginas.
- `lang="es-AR"`. Imágenes → WebP, con alt real, lazy, width/height.

## Marca
- Navy `#0A2956` es el color madre (hex a confirmar → {{HEX_OFICIALES}}).
- Poppins (cuerpo, Google Fonts). Behind the Nineties (títulos, MAYÚSCULAS
  — licencia web a confirmar; si no está, definí fallback).

## Flujo de trabajo
- Antes de escribir código en una fase, MOSTRAME el plan y esperá mi OK.
- Trabajamos UNA fase por vez. No encadenes fases sin que yo revise.
- Al terminar una fase, listame qué quedó como {{PLACEHOLDER}} / ⚠️ pendiente.

## Comandos
<!-- completar una vez definido el stack (build / preview / validación) -->
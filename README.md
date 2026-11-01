# Charadas

Juego de charadas para el navegador del móvil: te pones el teléfono en la frente,
tus amigos te dan pistas y respondes inclinando la cabeza.

- **Inclinar hacia abajo** (pantalla hacia el suelo) → ✅ Correcto
- **Inclinar hacia arriba** (pantalla hacia el techo) → ⏭ Pasar

Sin dependencias ni compilación: HTML, CSS y JavaScript puro.

## Funciones

- 9 categorías (Animales, Películas, Profesiones, Comida, Acciones, Objetos, Lugares,
  Deportes, Personajes) + **Mezcla** + **Tus palabras** (lista propia guardada en el teléfono).
- Rondas de 30, 60, 90 o 120 segundos.
- Arranca solo cuando el teléfono está derecho en la frente, con cuenta regresiva 3‑2‑1.
- Sonidos y vibración al acertar/pasar, tic‑tac en los últimos 5 segundos.
- Pantalla completa y bloqueo en horizontal (Android), pantalla siempre encendida.
- Resumen final con las palabras acertadas y pasadas.
- Sin sensor (computadora): botones en pantalla o flechas ↓ / ↑ del teclado.

## Jugar

El sensor de movimiento del navegador **solo funciona en HTTPS**, así que hay que publicarlo:

**GitHub Pages:** en el repositorio, *Settings → Pages → Build and deployment →
Deploy from a branch → `main` / `(root)`*. En un minuto queda en
`https://<usuario>.github.io/<repositorio>/`.

En iPhone, Safari pide permiso para usar el movimiento la primera vez: hay que aceptarlo.
Para pantalla completa en iPhone, usa *Compartir → Agregar a inicio* y abre el juego desde ese ícono.

Para probar en la computadora: `python3 -m http.server` y abre `http://localhost:8000`.

## Cómo detecta la inclinación

Con el evento `deviceorientation` se calcula `cos(beta) · cos(gamma)`: cuánto mira la pantalla
hacia el techo (+1) o hacia el suelo (−1). Con el teléfono derecho en la frente vale ~0.

- Pasa de **−0,6** (~37°) → correcto; de **+0,6** → pasar.
- Antes del siguiente gesto hay que volver a la posición vertical (|valor| < 0,35), así un mismo
  movimiento no cuenta dos veces.

Funciona igual en horizontal o vertical y en iOS o Android. Los umbrales están al inicio de `app.js`.

## Agregar palabras o categorías

Edita `words.js`: cada categoría tiene `id`, `name`, `emoji`, `color` y la lista `words`.

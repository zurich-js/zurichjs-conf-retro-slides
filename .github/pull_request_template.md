## What

<!-- One or two plain sentences. What changed, on which slides or venue views. -->

## Why

<!-- One sentence. -->

## Screenshots

<!-- REQUIRED (CI fails without one). Drag images here. Before and after for changed slides.
     Make them with: pnpm shot "http://localhost:5181/?still&slide=<id>" out.png  (add &flat for 2D) -->

## Recording

<!-- REQUIRED (CI fails without one). Drag an .mp4 here showing the addition in motion.
     Make it with: pnpm record "http://localhost:5181/?slide=<id>" out.mp4 --keys "ArrowRight:3000" -->

## Checks

- [ ] `pnpm build` passes
- [ ] Changed slides checked in `?flat&still` and in 3D

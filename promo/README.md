# Promo videos

`creator-invite/index.html`: 30 s vertical (1080x1920) video inviting creators. Every frame is drawn by
`window.renderAt(t)` (GSAP timeline + Three.js), so the video renders frame by frame with exact timing.

```bash
# from the repo root
python3 -m http.server 4400 --bind 127.0.0.1 &          # serves the page plus node_modules (three, gsap)
node promo/tools/render.mjs http://127.0.0.1:4400/promo/creator-invite/index.html /tmp/frames 30
ffmpeg -framerate 30 -i /tmp/frames/%05d.jpg -c:v libx264 -profile:v high -crf 18 -pix_fmt yuv420p \
  -movflags +faststart promo/creator-invite/CreatorsClub-Invite-Creators-1080x1920.mp4
```

`render.mjs` drives headless Chrome through Playwright (edit the `createRequire` path to wherever Playwright is
installed). Rendered videos (*.mp4) are not committed.

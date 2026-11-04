# Drop

A landing page concept for a small transfer product: you send a meme, a file, a
link or a note to a handle, and it waits in one inbox.

Interface only. There is no backend, no accounts, no uploads and no payments.
The hero demo, the inbox rows and the FAQ are static or scripted for the page.

## Files

- `index.html` the built page, single file, no network requests
- `src/style.css` styles
- `src/index.template.html` markup
- `src/build.py` inlines the CSS, the Switzer weights, the two photos and the icons
- `src/icons/` Phosphor SVGs
- `src/Switzer-*.woff2` typefaces
- `src/photo-*.jpg` the two photographs

## Rebuild

```sh
cd src && python3 build.py
```

Built with plain HTML, CSS and a little vanilla JS. Type is Switzer, icons are
Phosphor.

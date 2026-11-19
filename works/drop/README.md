# Drop

A landing page concept for a small transfer product: you send a meme, a file, a
link or a note to a handle, and it waits in one inbox.

Interface only. There is no backend, no accounts, no uploads and no payments.
The hero composer, the delivery strip, the inbox rows and the FAQ are static or
scripted for the page.

## Files

- `index.html` the page - one file, no network requests
- `src/build.py` checks the page and refuses to ship if anything would be
  loaded remotely
- `src/Switzer-*.woff2` the typeface, already inlined into the page
- `src/photo-*.jpg` the two photographs, already inlined into the page

## Rebuild

```sh
cd src && python3 build.py
```

The page is edited in place at `index.html`; `build.py` is the guard that runs
before shipping it.

Plain HTML, CSS and a little vanilla JS. Type is Switzer, icons are Phosphor.

## Colour

Black and white with two colours, each with one job.

- **Deep Ultramarine `#1d2ba6`** is every surface that used to be black: the
  hero drop strip, the feature band, the honesty panel, the open FAQ row, the
  footer.
- **Sun Yellow `#ffc61a`** is the only action colour: primary buttons, the
  step numerals, the FAQ sign, the "New" tag. It always carries ink, never
  white - ink on yellow is 12.6:1.
- **Mist `#e8ebfa`** is the cool tinted paper behind cards.

Everything else is ink on white. The composition is symmetric: every section
header is centred, every card sits in an equal column with equal padding. No
borders, no shadows, no gradients.

# Jawsi Popsicle

Personal hobby accountability site built with Jekyll and hosted on GitHub Pages. Tracks hobbies: dance, cooking, art, gym, videography.

## Tech Stack

- Jekyll (>= 3.5, < 5.0) with local Minima 3.0.0.dev (vendored via gemspec, not the gem)
- Plugins: jekyll-feed (~> 0.9), jekyll-seo-tag (~> 2.1)
- SASS for styles

## Directory Layout

```
_config.yml          — site config (title, description, plugins)
_layouts/
  base.html          — root layout (head, header, footer)
  home.html          — homepage: split layout (greeting + hobby nav)
  page.html          — generic pages
  post.html          — blog posts
_includes/           — partials (head, header, footer, social icons)
_sass/
  _homepage.scss     — homepage split-layout styles
  _base.scss         — base/reset styles
assets/css/style.scss — SASS entry point (imports _homepage, _base)
_posts/              — blog posts (sample content from minima)
index.md             — homepage (uses home layout)
about.md             — about page
script/              — dev scripts (bootstrap, build, server, cibuild)
minima.gemspec       — theme packaged as a local gem
```

## Development

```sh
script/bootstrap   # install dependencies
script/server      # serve locally with live reload
script/build       # production build
script/cibuild     # CI build
```

## Architecture

- **Layout chain**: `base.html` -> `home.html` / `page.html` / `post.html`
- **Homepage**: split layout with left greeting (title + description) and right navbar linking to hobby section pages
- **Hobby sections**: dance, cooking, art, gym, videography — pages not yet created
- **Styles**: SASS pipeline via `assets/css/style.scss` importing partials from `_sass/`

## Current State

- Homepage has custom split layout with greeting and hobby navigation
- Hobby section pages (`/dance`, `/cooking`, `/art`, `/gym`, `/videography`) are linked but not yet created
- Contains sample blog posts from minima theme
- Social media usernames in `_config.yml` are still defaults (jekyllrb/jekyll)

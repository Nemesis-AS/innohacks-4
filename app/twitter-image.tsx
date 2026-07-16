// X falls back to og:image when twitter:image is absent, but several other scrapers
// (and X's own card validator) don't — so the same card is published under both tags.
export { default, alt, size, contentType } from "./opengraph-image";

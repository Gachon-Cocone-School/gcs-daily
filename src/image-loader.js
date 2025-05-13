export default function customImageLoader({ src, width, quality }) {
  // Just return the URL as-is for client-side loading
  return src;
}

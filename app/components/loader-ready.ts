// Hand-off between the Loader (in layout) and content that should hold its
// intro until the loading overlay is fully gone. The loader calls
// markLoaderReady() once; subscribers added before/after that all fire.
let ready = false;
const subs = new Set<() => void>();

export function markLoaderReady() {
  if (ready) return;
  ready = true;
  subs.forEach((fn) => fn());
  subs.clear();
}

// Returns an unsubscribe fn. Fires immediately if the loader is already done.
export function onLoaderReady(fn: () => void): () => void {
  if (ready) {
    fn();
    return () => {};
  }
  subs.add(fn);
  return () => subs.delete(fn);
}

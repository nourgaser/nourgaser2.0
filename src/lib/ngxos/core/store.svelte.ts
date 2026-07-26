// Svelte 5 runes state, importable from plain TS via the `.svelte.ts` extension.
export const ngx = $state({
  poweredOn: false,
  theme: 'default',
  mode: 'normal' as 'normal' | 'hints' | 'terminal',
  // `x`/`y`/`width`/`height` are `null` until the user drags/resizes the
  // window — `null` means "use the default top-right CSS placement/size".
  terminal: {
    open: false,
    minimized: false,
    x: null as number | null,
    y: null as number | null,
    width: null as number | null,
    height: null as number | null,
  },
  focusedSectionId: null as string | null,
  reducedMotion: false,
  route: '/',
});

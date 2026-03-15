<script lang="ts">
  import { onMount } from 'svelte';

  export let rootSelector = 'main[data-project-page="true"]';

  const PROJECT_PATH_PATTERN = /^\/portfolio\/[^/]+\/?$/;

  let mounted = false;
  let activeRequest: AbortController | null = null;

  function isModifiedClick(event: MouseEvent) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  }

  function applyRootAttributes(currentRoot: HTMLElement, nextRoot: HTMLElement) {
    const nextAttributeNames = new Set(Array.from(nextRoot.attributes).map((attribute) => attribute.name));

    for (const attribute of Array.from(currentRoot.attributes)) {
      if (!nextAttributeNames.has(attribute.name)) {
        currentRoot.removeAttribute(attribute.name);
      }
    }

    for (const attribute of Array.from(nextRoot.attributes)) {
      currentRoot.setAttribute(attribute.name, attribute.value);
    }
  }

  function updateDocumentMetadata(nextDocument: Document) {
    if (nextDocument.title) {
      document.title = nextDocument.title;
    }

    const nextDescription = nextDocument.querySelector('meta[name="description"]');
    const currentDescription = document.querySelector('meta[name="description"]');

    if (nextDescription instanceof HTMLMetaElement && currentDescription instanceof HTMLMetaElement) {
      currentDescription.content = nextDescription.content;
    }
  }

  async function navigateTo(targetHref: string, historyMode: 'push' | 'replace' = 'push') {
    const currentRoot = document.querySelector(rootSelector);

    if (!(currentRoot instanceof HTMLElement)) {
      window.location.assign(targetHref);
      return;
    }

    const targetUrl = new URL(targetHref, window.location.href);

    if (!PROJECT_PATH_PATTERN.test(targetUrl.pathname)) {
      window.location.assign(targetUrl.toString());
      return;
    }

    activeRequest?.abort();
    const controller = new AbortController();
    activeRequest = controller;

    currentRoot.setAttribute('aria-busy', 'true');
    currentRoot.setAttribute('data-project-loading', 'true');

    try {
      const response = await fetch(targetUrl.pathname, {
        signal: controller.signal,
        headers: {
          'X-Requested-With': 'portfolio-project-enhancer',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load ${targetUrl.pathname}`);
      }

      const nextHtml = await response.text();

      if (controller.signal.aborted) {
        return;
      }

      const nextDocument = new DOMParser().parseFromString(nextHtml, 'text/html');
      const nextRoot = nextDocument.querySelector(rootSelector);

      if (!(nextRoot instanceof HTMLElement)) {
        throw new Error(`Missing ${rootSelector} in fetched document`);
      }

      currentRoot.innerHTML = nextRoot.innerHTML;
      applyRootAttributes(currentRoot, nextRoot);
      updateDocumentMetadata(nextDocument);

      if (historyMode === 'push') {
        history.pushState({ portfolioPath: targetUrl.pathname }, '', targetUrl.pathname);
      } else {
        history.replaceState({ portfolioPath: targetUrl.pathname }, '', targetUrl.pathname);
      }

    } catch (error) {
      if (!controller.signal.aborted) {
        window.location.assign(targetUrl.toString());
      }
    } finally {
      if (activeRequest === controller) {
        activeRequest = null;
      }

      currentRoot.removeAttribute('aria-busy');
      currentRoot.removeAttribute('data-project-loading');
    }
  }

  onMount(() => {
    if (mounted) {
      return;
    }

    mounted = true;
    const root = document.querySelector(rootSelector);

    if (!(root instanceof HTMLElement)) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest('a[data-project-switch="true"]');

      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const targetUrl = new URL(link.href, window.location.href);

      if (targetUrl.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      void navigateTo(targetUrl.toString(), 'push');
    };

    const handlePopState = () => {
      const currentUrl = new URL(window.location.href);

      if (!PROJECT_PATH_PATTERN.test(currentUrl.pathname)) {
        return;
      }

      void navigateTo(currentUrl.toString(), 'replace');
    };

    root.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      activeRequest?.abort();
      root.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
    };
  });
</script>

<div hidden aria-hidden="true"></div>

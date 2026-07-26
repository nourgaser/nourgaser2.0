<script lang="ts">
  import { onMount } from 'svelte';

  export let rootSelector = 'main[data-project-page="true"]';

  const PROJECT_PATH_PATTERN = /^\/portfolio\/[^/]+\/?$/;

  let mounted = false;
  let activeRequest: AbortController | null = null;

  function isModifiedClick(event: MouseEvent) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  }

  function getMediaElement(container: ParentNode) {
    const media = container.querySelector('img, video');

    return media instanceof HTMLImageElement || media instanceof HTMLVideoElement ? media : null;
  }

  function prepareAsMainMedia(media: HTMLImageElement | HTMLVideoElement) {
    if (media instanceof HTMLVideoElement) {
      media.setAttribute('controls', '');
      media.removeAttribute('muted');
      media.preload = 'metadata';
      media.pause();
      return;
    }

    media.loading = 'eager';
  }

  function getMediaKey(media: HTMLImageElement | HTMLVideoElement) {
    if (media instanceof HTMLImageElement) {
      return `image:${media.currentSrc || media.getAttribute('src') || ''}`;
    }

    const source = media.querySelector('source');
    const sourcePath = source instanceof HTMLSourceElement
      ? source.getAttribute('src') || ''
      : media.currentSrc || '';

    return `video:${sourcePath}`;
  }

  function setSelectedThumb(showcase: HTMLElement, selectedButton: HTMLButtonElement) {
    const thumbButtons = Array.from(
      showcase.querySelectorAll('button[data-gallery-thumb="true"]')
    ).filter((item): item is HTMLButtonElement => item instanceof HTMLButtonElement);

    thumbButtons.forEach((button) => {
      const isSelected = button === selectedButton;
      button.classList.toggle('showcase-thumb-button--selected', isSelected);
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  }

  function getThumbButtons(showcase: HTMLElement) {
    return Array.from(showcase.querySelectorAll('button[data-gallery-thumb="true"]')).filter(
      (item): item is HTMLButtonElement => item instanceof HTMLButtonElement
    );
  }

  function stepGalleryMedia(showcase: HTMLElement, direction: 1 | -1) {
    const thumbButtons = getThumbButtons(showcase);

    if (thumbButtons.length < 2) {
      return;
    }

    const currentIndex = thumbButtons.findIndex((button) =>
      button.classList.contains('showcase-thumb-button--selected')
    );

    const nextIndex = (currentIndex + direction + thumbButtons.length) % thumbButtons.length;
    const nextButton = thumbButtons[nextIndex];

    selectGalleryMedia(nextButton);
    nextButton.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }

  function isEditableTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
  }

  function selectGalleryMedia(thumbButton: HTMLButtonElement) {
    const showcase = thumbButton.closest('.project-showcase');

    if (!(showcase instanceof HTMLElement)) {
      return;
    }

    const mainContainer = showcase.querySelector('[data-gallery-main]');

    if (!(mainContainer instanceof HTMLElement)) {
      return;
    }

    const index = Number(thumbButton.dataset.galleryThumbIndex ?? '0');

    const allMediaItems = mainContainer.querySelectorAll('[data-gallery-media]');
    allMediaItems.forEach((item) => {
      if (item instanceof HTMLElement) {
        item.hidden = true;
        const video = item.querySelector('video');
        if (video instanceof HTMLVideoElement) {
          video.pause();
        }
      }
    });

    const targetItem = mainContainer.querySelector(`[data-gallery-media="${index}"]`);
    if (targetItem instanceof HTMLElement) {
      targetItem.hidden = false;
      const media = targetItem.querySelector('img, video');
      if (media instanceof HTMLImageElement || media instanceof HTMLVideoElement) {
        prepareAsMainMedia(media);
      }
    }

    setSelectedThumb(showcase, thumbButton);
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

      const galleryThumb = target.closest('button[data-gallery-thumb="true"]');

      if (galleryThumb instanceof HTMLButtonElement) {
        event.preventDefault();
        selectGalleryMedia(galleryThumb);
        return;
      }

      const galleryNav = target.closest('button[data-gallery-nav]');

      if (galleryNav instanceof HTMLButtonElement) {
        const showcase = galleryNav.closest('.project-showcase');

        if (showcase instanceof HTMLElement) {
          event.preventDefault();
          stepGalleryMedia(showcase, galleryNav.dataset.galleryNav === 'next' ? 1 : -1);
        }

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

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const showcase = root.querySelector('.project-showcase');

      if (!(showcase instanceof HTMLElement)) {
        return;
      }

      event.preventDefault();
      stepGalleryMedia(showcase, event.key === 'ArrowRight' ? 1 : -1);
    };

    root.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      activeRequest?.abort();
      root.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div hidden aria-hidden="true"></div>

---
description: "Use when writing any UI code for nourgaser.com, including CSS, layout HTML, and visual components. Enforces the core design principles of the project: a collision between a handcrafted personal website and a futuristic runtime layer (ngxos). Consult the Figma design and in-repo screenshots for exact visual guidance."
name: "UI Design Principles"
applyTo: "src/styles/**/*.css, src/components/**/*.astro, src/components/**/*.svelte"
---
# UI Design Guidelines

### nourgaser.com + ngxos

This document defines the **core UI rules** for the project.

The design intentionally contains **two distinct visual systems**:

1. **Base Website (Portfolio Layer)**
2. **ngxos Runtime Layer**

Both systems are already defined visually in the **Figma design and repository screenshots**.
Those assets are the **source of truth** for appearance.

This document defines the **principles behind the design**, so implementations remain consistent.

---

# Core Premise

The site represents a **collision between two technological eras**.

**Base Website**

* handcrafted
* rigid
* slightly old-web
* personal
* document-like

**ngxos Runtime**

* smooth
* rounded
* luminous
* system-like
* futuristic

Visual narrative:

> A strange personal website exists, and a futuristic runtime (ngxos) activates and begins controlling it.

The two layers must **remain visually distinct**.

---

# Shape Rules

## Base Website

The base website uses **hard geometry**.

Rules:

* **No rounded corners**
* rectangular containers
* straight borders
* rigid layout blocks

Applies to:

* sections
* cards
* blog entries
* portfolio panels
* image frames

The base site should feel **structural and authored**, not productized.

---

## ngxos

ngxos introduces **curved system UI**.

Rules:

* rounded corners allowed
* smooth window shapes
* layered system panels

Applies to:

* terminal window
* runtime UI
* overlays
* system indicators

Rule of thumb:

**Rounded corners belong to ngxos, not the website.**

---

# Borders

## Base Website

Borders define structure.

Characteristics:

* thin
* sharp
* static
* subtle

No glow or animation.

---

## ngxos

Borders indicate **system activation**.

Characteristics:

* neon outlines
* glow
* motion
* focus highlights

ngxos may add animated borders to base containers when powered on.

The base container shape must **not change**.

---

# Color Behavior

## Base Website

Palette should feel **environmental and atmospheric**.

Typical tones:

* black
* deep blue
* dark violet
* muted magenta

Mood:

* cosmic
* cinematic
* slightly old-web

Bright accents should be rare.

---

## ngxos

Palette becomes **energetic and electronic**.

Typical tones:

* neon cyan
* electric blue
* violet
* magenta

These colors represent **runtime energy**.

They appear during:

* activation
* focus
* command interaction
* keyboard navigation

---

# Motion

## Base Website

Motion should be minimal.

Allowed:

* small hover changes
* simple fades

Avoid continuous animation.

The base site should feel **stable and quiet**.

---

## ngxos

Motion belongs to the runtime layer.

Examples:

* terminal opening
* border activation
* command feedback
* system transitions

ngxos motion signals **system activity**.

---

# Interaction

## Base Website

Normal browsing must always work:

* scrolling
* clicking links
* reading blog posts
* navigating pages

The site must remain fully usable **without ngxos**.

---

## ngxos

ngxos introduces **power-user interaction**:

* terminal commands
* keyboard navigation
* runtime controls

ngxos enhances the site but must never replace standard navigation.

---

# Layering Model

Visual hierarchy:

1. **Background world**

   * landscapes
   * atmospheric imagery

2. **Website structure**

   * sections
   * blog content
   * portfolio blocks

3. **Website overlays**

   * dark translucent panels
   * text overlays

4. **ngxos runtime**

   * terminal
   * neon borders
   * system UI

ngxos must always feel like a **layer on top of the site**, not embedded inside it.

---

# Typography

## Base Website

Typography should feel **authored and personal**.

Usage:

* custom font for branding and headings
* readable font for body text and blog content

Avoid overly corporate typography.

---

## ngxos

Typography should feel **system-like**.

Use:

* monospaced terminal-style text
* compact system messaging

Base typography expresses authorship.
ngxos typography expresses operation.

---

# Accessibility, Readability, and Semantics

Accessibility and content structure are **critical requirements**, not optional enhancements.

The base website must always maintain:

* **semantic HTML structure**
* proper heading hierarchy
* accessible navigation
* readable typography
* usable layout without JavaScript

Requirements:

* correct use of semantic elements (`header`, `nav`, `main`, `section`, `article`, `footer`)
* proper heading structure for screen readers
* logical reading order
* keyboard navigation support
* compatibility with screen readers
* support for browser **reading mode**
* high-contrast readable text
* respect for `prefers-reduced-motion`

The site must remain compatible with:

* SEO indexing
* RSS/Atom feeds
* static rendering
* assistive technologies

ngxos must **enhance** the interface but must never interfere with:

* content readability
* screen readers
* semantic structure
* search indexing

---

# Design Restraint

Visual effects should be used selectively.

Rules:

* not every element glows
* not every border animates
* motion should signal meaningful system states

---

# Final Principle

The portfolio should look like **an old personal sci-fi website**.

ngxos should look like **a futuristic runtime that powers it up without erasing its original form**.

Refer to the **Figma design and repository screenshots** for the exact visual interpretation.

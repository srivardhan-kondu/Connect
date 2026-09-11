"use client";

import { useEffect } from "react";
import IconSprite from "@/components/IconSprite";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Vision from "@/components/Vision";
import Ideas from "@/components/Ideas";
import WhyConnect from "@/components/WhyConnect";
import Impact from "@/components/Impact";
import Ahead from "@/components/Ahead";
import Join from "@/components/Join";
import SiteFooter from "@/components/SiteFooter";
import Toast from "@/components/Toast";
import PrivacyView from "@/components/PrivacyView";
import TermsView from "@/components/TermsView";
import ChatWidget from "@/components/chat/ChatWidget";
import { CONFIG } from "@/lib/config";
import { SITE } from "@/lib/site";

/**
 * This page ports the original static site's behaviour (nav, SPA-style hash
 * routing between home/privacy/terms, scroll reveals, waitlist form) almost
 * verbatim from its vanilla-JS IIFE, operating on the DOM the same way the
 * original did. The markup above is rendered once by React and never
 * re-rendered in response to this effect, so the two models never fight
 * over the same attributes.
 */
export default function HomePage() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function $<T extends Element = HTMLElement>(s: string, el: ParentNode = document) {
      return el.querySelector(s) as T | null;
    }
    function $$<T extends Element = HTMLElement>(s: string, el: ParentNode = document) {
      return [...el.querySelectorAll(s)] as T[];
    }

    const cleanups: Array<() => void> = [];

    /* ---------- Config wiring ---------- */
    $$<HTMLAnchorElement>(".js-contact").forEach((a) => {
      a.href = "mailto:" + CONFIG.contactEmail;
      if (a.textContent === "our contact address") a.textContent = CONFIG.contactEmail;
    });
    const linkedinLink = $<HTMLAnchorElement>("#linkedin-link");
    if (linkedinLink) linkedinLink.href = CONFIG.linkedinUrl;
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* ---------- Toast ---------- */
    const toast = $("#toast")!;
    let toastTimer: ReturnType<typeof setTimeout>;
    function showToast(msg: string) {
      toast.textContent = msg;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
    }

    /* ---------- Navigation: solid state, mobile menu, active link ---------- */
    const nav = $("#nav")!;
    const menuBtn = $<HTMLButtonElement>(".menu-btn")!;
    const menu = $("#mobile-menu")!;

    function setMenu(open: boolean) {
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
      updateNav();
    }
    function onMenuBtnClick() {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    }
    menuBtn.addEventListener("click", onMenuBtnClick);
    cleanups.push(() => menuBtn.removeEventListener("click", onMenuBtnClick));

    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape" && !menu.hidden) {
        setMenu(false);
        menuBtn.focus();
      }
    }
    document.addEventListener("keydown", onKeydown);
    cleanups.push(() => document.removeEventListener("keydown", onKeydown));

    function onResize() {
      if (window.innerWidth > 1000 && !menu.hidden) setMenu(false);
    }
    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));

    let currentView: "home" | "privacy" | "terms" = "home";
    function updateNav() {
      const solid = currentView !== "home" || window.scrollY > 24 || !menu.hidden;
      nav.classList.toggle("is-solid", solid);
    }
    window.addEventListener("scroll", updateNav, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", updateNav));

    const navLinks = $$<HTMLAnchorElement>(".nav-links a[data-section]");
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) =>
            a.classList.toggle("is-active", a.dataset.section === entry.target.id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    $$("main[data-view='home'] section").forEach((s) => sectionObserver.observe(s));
    cleanups.push(() => sectionObserver.disconnect());

    /* ---------- SPA router ---------- */
    const views: Record<"home" | "privacy" | "terms", HTMLElement> = {
      home: $("main[data-view='home']")!,
      privacy: $("main[data-view='privacy']")!,
      terms: $("main[data-view='terms']")!,
    };
    const titles: Record<"home" | "privacy" | "terms", string> = {
      home: SITE.title,
      privacy: "Privacy Policy | CONNECT",
      terms: "Terms of Use | CONNECT",
    };
    let pendingFocus = false;
    let routedHash: string | null = null;

    function route() {
      const hash = location.hash;
      routedHash = hash;
      let name: "home" | "privacy" | "terms" = "home";
      let target: string | null = null;
      if (hash === "#/privacy") name = "privacy";
      else if (hash === "#/terms") name = "terms";
      else if (hash.length > 1) target = decodeURIComponent(hash.slice(1));

      const changed = name !== currentView;
      (Object.entries(views) as [keyof typeof views, HTMLElement][]).forEach(
        ([k, el]) => (el.hidden = k !== name)
      );
      currentView = name;
      document.title = titles[name];
      updateNav();

      if (name !== "home") {
        navLinks.forEach((a) => a.classList.remove("is-active"));
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        $("h1", views[name])?.focus({ preventScroll: true });
        return;
      }
      const el = target && document.getElementById(target);
      if (el) {
        requestAnimationFrame(() =>
          el.scrollIntoView({
            behavior: changed || reduced ? "instant" : "smooth",
            block: "start",
          })
        );
      } else if (changed) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
      if (pendingFocus) {
        pendingFocus = false;
        setTimeout(
          () => {
            const f = $<HTMLInputElement>("#f-name");
            const form = $<HTMLFormElement>("#waitlist-form");
            if (f && form && !form.hidden) f.focus({ preventScroll: true });
          },
          reduced ? 0 : 550
        );
      }
    }

    function onDocumentClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
      if (!a) return;
      if (a.classList.contains("skip")) {
        e.preventDefault();
        const h = $("h1", views[currentView]);
        if (h) {
          if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
          h.focus();
        }
        return;
      }
      const href = a.getAttribute("href")!;
      if (href === "#") return;
      e.preventDefault();
      if (!menu.hidden) setMenu(false);
      if (a.hasAttribute("data-focus-form")) pendingFocus = true;
      if (a.dataset.intent) {
        const intentInput = $<HTMLInputElement>("#waitlist-form input[name='intent']");
        if (intentInput) intentInput.value = a.dataset.intent;
      }
      if (location.hash !== href) history.pushState(null, "", href);
      route();
    }
    document.addEventListener("click", onDocumentClick);
    cleanups.push(() => document.removeEventListener("click", onDocumentClick));

    // Re-route only when the fragment changed. The chat assistant adds
    // same-URL history entries while it's full-screen (so Back closes it);
    // popping those must not re-scroll or re-focus the page. This also stops
    // a Back between two hashes routing twice (popstate, then hashchange).
    function onHistoryChange() {
      if (location.hash !== routedHash) route();
    }
    window.addEventListener("popstate", onHistoryChange);
    cleanups.push(() => window.removeEventListener("popstate", onHistoryChange));
    window.addEventListener("hashchange", onHistoryChange);
    cleanups.push(() => window.removeEventListener("hashchange", onHistoryChange));

    /* ---------- Scroll reveals (few, purposeful) ---------- */
    const revealObservers: IntersectionObserver[] = [];
    if (!reduced && "IntersectionObserver" in window) {
      const once = (els: Element[], cls: string, opts?: IntersectionObserverInit) => {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add(cls);
              io.unobserve(en.target);
            }
          });
        }, opts);
        els.forEach((el) => io.observe(el));
        revealObservers.push(io);
      };
      once($$(".quad"), "in", { threshold: 0.2 });
      once($$(".why-grid"), "in", { threshold: 0.15 });
      once($$(".they li"), "lit", { rootMargin: "0px 0px -38% 0px" });
    } else {
      $$(".quad,.why-grid").forEach((el) => el.classList.add("in"));
      $$(".they li").forEach((el) => el.classList.add("lit"));
    }
    cleanups.push(() => revealObservers.forEach((io) => io.disconnect()));

    /* ---------- Waitlist form ---------- */
    const form = $<HTMLFormElement>("#waitlist-form")!;
    const btn = $<HTMLButtonElement>("#submit-btn")!;
    const alertBox = $("#form-alert")!;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const rules: Record<string, (v: string) => string> = {
      name: (v) => (v.trim() ? "" : "Enter your name."),
      email: (v) =>
        !v.trim()
          ? "Enter your email address."
          : emailRe.test(v.trim())
            ? ""
            : "Enter a valid email address, like name@example.com.",
      country: (v) => (v ? "" : "Select your country."),
    };
    function setError(field: string, msg: string) {
      const input = form.elements.namedItem(field) as HTMLInputElement | HTMLSelectElement;
      const wrap = input.closest(".field")!;
      const err = $("#e-" + field)!;
      wrap.classList.toggle("has-error", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      err.textContent = msg;
      err.hidden = !msg;
    }
    const fieldCleanups: Array<() => void> = [];
    Object.keys(rules).forEach((f) => {
      const input = form.elements.namedItem(f) as HTMLInputElement | HTMLSelectElement;
      const evt = input.tagName === "SELECT" ? "change" : "blur";
      const onEvt = () => {
        if (input.value || input.closest(".has-error")) setError(f, rules[f](input.value));
      };
      const onInput = () => {
        if (input.closest(".has-error")) setError(f, rules[f](input.value));
      };
      input.addEventListener(evt, onEvt);
      input.addEventListener("input", onInput);
      fieldCleanups.push(() => {
        input.removeEventListener(evt, onEvt);
        input.removeEventListener("input", onInput);
      });
    });
    cleanups.push(() => fieldCleanups.forEach((fn) => fn()));

    async function onSubmit(e: Event) {
      e.preventDefault();
      alertBox.hidden = true;
      let firstBad: HTMLInputElement | HTMLSelectElement | null = null;
      Object.keys(rules).forEach((f) => {
        const input = form.elements.namedItem(f) as HTMLInputElement | HTMLSelectElement;
        const msg = rules[f](input.value);
        setError(f, msg);
        if (msg && !firstBad) firstBad = input;
      });
      if (firstBad) {
        (firstBad as HTMLInputElement | HTMLSelectElement).focus();
        return;
      }

      const nameInput = form.elements.namedItem("name") as HTMLInputElement;
      const emailInput = form.elements.namedItem("email") as HTMLInputElement;
      const orgInput = form.elements.namedItem("organization") as HTMLInputElement;
      const countryInput = form.elements.namedItem("country") as HTMLSelectElement;
      const intentInput = form.elements.namedItem("intent") as HTMLInputElement;

      const data = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        organization: orgInput.value.trim(),
        country: countryInput.value,
        intent: intentInput.value,
        submittedAt: new Date().toISOString(),
      };
      btn.disabled = true;
      btn.textContent = "Joining…";
      try {
        if (CONFIG.waitlistEndpoint) {
          const res = await fetch(CONFIG.waitlistEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error("HTTP " + res.status);
        } else {
          await new Promise((r) => setTimeout(r, 700)); // demo mode
        }
        const first = data.name.split(/\s+/)[0];
        $("#success-title")!.textContent = "You've joined CONNECT, " + first + ".";
        $("#success-text")!.textContent =
          "We'll send updates and early access news to " + data.email + ".";
        form.hidden = true;
        const s = $("#success")!;
        s.hidden = false;
        s.focus({ preventScroll: true });
      } catch {
        alertBox.textContent =
          "We couldn't add you to the waitlist. Check your connection and try again.";
        alertBox.hidden = false;
      } finally {
        btn.disabled = false;
        btn.textContent = "Join CONNECT";
      }
    }
    form.addEventListener("submit", onSubmit);
    cleanups.push(() => form.removeEventListener("submit", onSubmit));

    const shareBtn = $<HTMLButtonElement>("#share-btn")!;
    async function onShare() {
      const url = location.href.split("#")[0];
      const shareData = {
        title: "CONNECT",
        text: "Connect People. Create Opportunities. Grow Communities. Join the CONNECT waitlist.",
        url,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch {
          /* user cancelled the share sheet */
        }
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link copied");
      } catch {
        showToast("Copy this link: " + url);
      }
    }
    shareBtn.addEventListener("click", onShare);
    cleanups.push(() => shareBtn.removeEventListener("click", onShare));

    // Initial route (deep links such as #/privacy or #join)
    route();

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <IconSprite />

      <SiteHeader />

      {/* =========================== HOME VIEW =========================== */}
      <main id="main" data-view="home">
        <Hero />
        <Vision />
        <Ideas />
        <WhyConnect />
        <Impact />
        <Ahead />
        <Join />
      </main>

      {/* =========================== PRIVACY VIEW =========================== */}
      <PrivacyView />

      {/* =========================== TERMS VIEW =========================== */}
      <TermsView />

      <SiteFooter />

      <Toast />

      <ChatWidget />
    </>
  );
}

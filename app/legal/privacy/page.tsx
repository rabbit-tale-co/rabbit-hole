'use client';

import Link from 'next/link';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TypographyP } from '@/components/ui/typography/p';
import { TypographyList } from '@/components/ui/typography/list';
import { SITE, CONTACT_EMAIL, COMPANY, ADDRESS, EFFECTIVE_PRIVACY, PRIVACY_SECTIONS, PRIVACY_CONTENT, ListItem } from '@/app/legal/data';
import { OutlineShield } from '@/components/icons/Icons';

// constants moved to app/legal/data

function smoothScrollTo(href: string, e?: React.MouseEvent<HTMLAnchorElement>) {
  if (!href || !href.startsWith('#')) return;
  e?.preventDefault();
  const id = href.slice(1);
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', href);
  }
}

export default function PrivacyPage() {
  const effectiveDate = useMemo(() => new Date(EFFECTIVE_PRIVACY), []);
  const effectiveHuman = useMemo(() => effectiveDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' }), [effectiveDate]);
  const [activeSection, setActiveSection] = useState<string>('intro');
  const sectionIds = useMemo(() => PRIVACY_SECTIONS.map((s) => s.id), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { root: null, rootMargin: '-30% 0px -60% 0px', threshold: [0, 1] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);
  return (
    <div className="mx-auto max-w-6xl py-10">
      {/* hero */}
      <header className="rounded-2xl ring-1 ring-border bg-background p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full ring-1 ring-border px-3 py-1 text-xs text-muted-foreground">
              <OutlineShield className="size-3.5" />
              Legal • Privacy Policy
            </div>
            <h1 className="text-left text-2xl font-bold">Privacy Policy</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Effective {effectiveHuman}</Badge>
              <Badge>WIP</Badge>
            </div>
          </div>
        </div>
      </header>

      <Separator className="my-8" />

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* toc */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-2">
            <TypographyP className="text-xs font-medium text-muted-foreground">On this page</TypographyP>
            <ul className="mt-2 space-y-1.5 pr-2">
              {PRIVACY_SECTIONS.map((s) => (
                <li key={s.id}>
                  <Button variant={activeSection === s.id ? 'default' : 'ghost'} size="sm" asChild>
                    <Link
                      href={`#${s.id}`}
                      onClick={(e) => smoothScrollTo(`#${s.id}`, e)}
                      className="block rounded px-2 py-1 text-sm text-muted-foreground whitespace-normal break-words"
                    >
                      {s.title}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* content */}
        <main className="space-y-8">
          {PRIVACY_CONTENT.map((section) => (
            <Section key={section.id} id={section.id} title={section.title}>
              {section.blocks.map((block, i) =>
                block.type === 'p' ? (
                  <TypographyP key={i}>{renderInline(block.text)}</TypographyP>
                ) : (
                  <RenderList key={i} items={block.items} />
                )
              )}
            </Section>
          ))}
        </main>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="group flex items-center gap-2 mt-2 text-lg font-semibold">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function RenderList({ items }: { items: (string | { text: string; items: ListItem[] })[] }) {
  return (
    <TypographyList>
      {items.map((item, idx) => {
        if (typeof item === 'string') {
          return <li key={idx}>{renderInline(item, true)}</li>;
        }
        return (
          <li key={idx}>
            {renderInline(item.text, true)}
            {item.items?.length ? <RenderList items={item.items} /> : null}
          </li>
        );
      })}
    </TypographyList>
  );
}

// Simple inline renderer: replaces placeholders and converts [label](href) links.
function renderInline(text: string, boldBeforeColon: boolean = false): React.ReactNode {
  const replaced = text
    .replaceAll('{SITE}', SITE)
    .replaceAll('{COMPANY}', COMPANY)
    .replaceAll('{ADDRESS}', ADDRESS)
    .replaceAll('{CONTACT_EMAIL}', CONTACT_EMAIL);

  const parseItalic = (input: string): React.ReactNode => {
    const elements: React.ReactNode[] = [];
    const regex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      if (match.index > lastIndex) elements.push(<span key={`it-text-${elements.length}`}>{input.slice(lastIndex, match.index)}</span>);
      elements.push(<em key={`it-${elements.length}`}>{match[1]}</em>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < input.length) elements.push(<span key={`it-text-${elements.length}`}>{input.slice(lastIndex)}</span>);
    return <>{elements}</>;
  };

  const parseBold = (input: string): React.ReactNode => {
    const elements: React.ReactNode[] = [];
    const regex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      if (match.index > lastIndex) elements.push(<span key={`text-${elements.length}`}>{parseItalic(input.slice(lastIndex, match.index))}</span>);
      elements.push(<strong key={`bold-${elements.length}`}>{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < input.length) elements.push(<span key={`text-${elements.length}`}>{parseItalic(input.slice(lastIndex))}</span>);
    return <>{elements}</>;
  };

  const parseLinks = (input: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      if (match.index > lastIndex) parts.push(<span key={`t-${parts.length}`}>{parseBold(input.slice(lastIndex, match.index))}</span>);
      const label = match[1]
        .replaceAll('{SITE}', SITE)
        .replaceAll('{COMPANY}', COMPANY)
        .replaceAll('{ADDRESS}', ADDRESS)
        .replaceAll('{CONTACT_EMAIL}', CONTACT_EMAIL)
        .replaceAll('CONTACT_EMAIL', CONTACT_EMAIL);
      const href = match[2]
        .replaceAll('{SITE}', SITE)
        .replaceAll('{COMPANY}', COMPANY)
        .replaceAll('{ADDRESS}', ADDRESS)
        .replaceAll('{CONTACT_EMAIL}', CONTACT_EMAIL);
      parts.push(
        <Link key={parts.length} className="underline underline-offset-4" href={href} onClick={(e) => smoothScrollTo(href, e)}>
          {parseBold(label)}
        </Link>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < input.length) parts.push(<span key={`t-${parts.length}`}>{parseBold(input.slice(lastIndex))}</span>);
    return <>{parts}</>;
  };

  if (boldBeforeColon) {
    const idx = replaced.indexOf(': ');
    if (idx > 0) {
      const label = replaced.slice(0, idx);
      const rest = replaced.slice(idx);
      return (
        <>
          <strong>{label}</strong>
          {parseLinks(rest)}
        </>
      );
    }
  }

  return parseLinks(replaced);
}

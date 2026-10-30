'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { asset } from '../data/product';
import { sections } from '../data/navigation';

export function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    headerRef.current?.querySelector<HTMLAnchorElement>('nav a')?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent | FocusEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 901px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [open]);

  return (
    <header className="header" ref={headerRef}>
      <a href="#inicio" aria-label="BIA 360, inicio" onClick={() => setOpen(false)}>
        <img className="logo" src={asset('/images/logo.png')} alt="BIA 360" />
      </a>
      <nav id="main-navigation" className={open ? 'is-open' : ''} aria-label="Principal">
        {sections.map(section => (
          <a key={section.id} href={`#${section.id}`} onClick={() => setOpen(false)}>
            {section.label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <a 
          href="/login" 
          className="text-xs font-semibold text-[#eee3f7] hover:text-[#de74f6] px-3 py-1.5 transition-colors hidden sm:inline-block"
        >
          Entrar
        </a>
        <a className="button small" href="#planos" onClick={() => setOpen(false)}>
          Ver planos <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}

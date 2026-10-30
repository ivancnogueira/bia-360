'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';
import { useTheme } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';

export type TransitionVariant =
  | 'circle'
  | 'diamond'
  | 'square';

export interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'button'> {
  duration?: number;
  variant?: TransitionVariant;
  fromCenter?: boolean;
}

function getThemeTransitionClipPaths(
  variant: TransitionVariant,
  cx: number,
  cy: number,
  maxRadius: number,
  viewportWidth: number,
  viewportHeight: number
): [string, string] {
  const toX = (x: number) => `${(x / viewportWidth) * 100}%`;
  const toY = (y: number) => `${(y / viewportHeight) * 100}%`;
  const point = (x: number, y: number) => `${toX(x)} ${toY(y)}`;
  const toRadius = (r: number) =>
    `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`;

  switch (variant) {
    case 'circle':
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ];
    case 'diamond': {
      const R = maxRadius * Math.SQRT2;
      const end = [
        point(cx, cy - R),
        point(cx + R, cy),
        point(cx, cy + R),
        point(cx - R, cy),
      ].join(', ');
      return [`polygon(${point(cx, cy)}, ${point(cx, cy)}, ${point(cx, cy)}, ${point(cx, cy)})`, `polygon(${end})`];
    }
    case 'square':
    default:
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ];
  }
}

export const AnimatedThemeToggler = ({
  className,
  duration = 450,
  variant = 'circle',
  fromCenter = false,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { setTheme, isDark } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);
  const activeAnimRef = useRef<Animation | null>(null);

  const cancelAnim = useCallback(() => {
    activeAnimRef.current?.cancel();
    activeAnimRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cancelAnim();
      const root = document.documentElement;
      if (root.dataset.magicuiThemeVt !== 'active') return;
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty('--magicui-theme-toggle-vt-duration');
      root.style.removeProperty('--magicui-theme-vt-clip-from');
    };
  }, [cancelAnim]);

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current;
    if (
      !button ||
      isTransitioningRef.current ||
      document.documentElement.dataset.magicuiThemeVt === 'active'
    ) {
      return;
    }

    const nextTheme: 'light' | 'dark' = isDark ? 'light' : 'dark';

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x: number;
    let y: number;
    if (fromCenter) {
      x = viewportWidth / 2;
      y = viewportHeight / 2;
    } else {
      const { top, left, width, height } = button.getBoundingClientRect();
      x = left + width / 2;
      y = top + height / 2;
    }

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    const applyTheme = () => {
      setTheme(nextTheme);
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(nextTheme);
    };

    // Fallback se View Transitions API não for suportada pelo browser
    const docWithVT = document as any;
    if (typeof docWithVT.startViewTransition !== 'function') {
      applyTheme();
      return;
    }

    const clipPath = getThemeTransitionClipPaths(
      variant,
      x,
      y,
      maxRadius,
      viewportWidth,
      viewportHeight
    );

    const root = document.documentElement;
    root.dataset.magicuiThemeVt = 'active';
    root.style.setProperty('--magicui-theme-toggle-vt-duration', `${duration}ms`);
    root.style.setProperty('--magicui-theme-vt-clip-from', clipPath[0]);

    const cleanup = () => {
      isTransitioningRef.current = false;
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty('--magicui-theme-toggle-vt-duration');
      root.style.removeProperty('--magicui-theme-vt-clip-from');
      cancelAnim();
    };

    isTransitioningRef.current = true;
    const transition = docWithVT.startViewTransition(() => {
      flushSync(applyTheme);
    });

    if (typeof transition?.finished?.finally === 'function') {
      transition.finished.finally(cleanup).catch(() => {});
    } else {
      cleanup();
    }

    const ready = transition?.ready;
    if (ready && typeof ready.then === 'function') {
      ready
        .then(() => {
          const anim = document.documentElement.animate(
            { clipPath },
            {
              duration,
              easing: 'ease-in-out',
              fill: 'forwards',
              pseudoElement: '::view-transition-new(root)',
            }
          );
          activeAnimRef.current = anim;
        })
        .catch(() => {});
    }
  }, [variant, fromCenter, duration, isDark, setTheme, cancelAnim]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/80 backdrop-blur-sm text-foreground shadow-sm transition-all duration-200 hover:bg-muted hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer',
        className
      )}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
      {...props}
    >
      <Sun
        className={cn(
          'h-4 w-4 text-amber-500 transition-all duration-300',
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : 'absolute -rotate-90 scale-0 opacity-0 pointer-events-none'
        )}
      />
      <Moon
        className={cn(
          'h-4 w-4 text-slate-700 dark:text-slate-200 transition-all duration-300',
          isDark
            ? 'absolute rotate-90 scale-0 opacity-0 pointer-events-none'
            : 'rotate-0 scale-100 opacity-100'
        )}
      />
      <span className="sr-only">
        {isDark ? 'Modo Claro' : 'Modo Escuro'}
      </span>
    </button>
  );
};


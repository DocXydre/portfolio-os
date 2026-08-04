import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';

/* ------------------------------------------------------------------
   Écran de veille "Bulles" de Windows 7.
   Se déclenche après 30 s sans activité, disparaît au moindre geste.
   Bulles translucides irisées qui flottent et rebondissent sur les bords.
   ------------------------------------------------------------------ */

const IDLE_MS = 10_000;

interface Bubble {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
  popDelay?: number; // décalage avant l'éclatement (ms), pour un effet en vague
}

const POP_MS = 360; // durée de l'éclatement d'une bulle

@Component({
  selector: 'app-screensaver',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (active()) {
      <canvas #cv class="saver"></canvas>
    }
  `,
  styles: [`
    .saver {
      position: fixed;
      inset: 0;
      z-index: 2000000;
      width: 100vw;
      height: 100vh;
      background: transparent;
      cursor: none;
    }
  `],
})
export class Screensaver implements OnInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('cv');

  protected readonly active = signal(false);

  private lastActivity = Date.now();
  private idleTimer?: ReturnType<typeof setInterval>;
  private raf = 0;
  private bubbles: Bubble[] = [];
  private removeResize?: () => void;
  private bursting = false;
  private burstStart = 0;
  private viewW = 0;
  private readonly reduceMotion =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly onActivity = (): void => {
    this.lastActivity = Date.now();
    // À la première activité, les bulles éclatent (en décalé) au lieu de couper net.
    if (this.active() && !this.bursting) {
      if (this.reduceMotion) this.hardStop();
      else this.beginBurst();
    }
  };

  constructor() {
    // Dès que le canvas apparaît (activation), on lance l'animation.
    effect(() => {
      const el = this.canvas()?.nativeElement;
      if (el) this.zone.runOutsideAngular(() => this.start(el));
    });
  }

  ngOnInit(): void {
    const opts = { passive: true } as const;
    for (const ev of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const) {
      window.addEventListener(ev, this.onActivity, opts);
    }
    // Vérification légère chaque seconde plutôt qu'un reset à chaque geste.
    this.zone.runOutsideAngular(() => {
      this.idleTimer = setInterval(() => {
        if (!this.active() && Date.now() - this.lastActivity >= IDLE_MS) {
          this.zone.run(() => this.active.set(true));
        }
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    for (const ev of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const) {
      window.removeEventListener(ev, this.onActivity);
    }
    if (this.idleTimer) clearInterval(this.idleTimer);
    cancelAnimationFrame(this.raf);
  }

  // Déclenche l'éclatement : chaque bulle explose avec un décalage selon sa
  // position (vague de gauche à droite). L'animation continue dans la boucle.
  private beginBurst(): void {
    this.bursting = true;
    this.burstStart = performance.now();
    const w = this.viewW || window.innerWidth;
    for (const b of this.bubbles) {
      b.popDelay = (b.x / w) * 300 + Math.random() * 120;
    }
  }

  private hardStop(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.bursting = false;
    this.removeResize?.();
    this.removeResize = undefined;
    this.zone.run(() => this.active.set(false));
  }

  private start(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = window.innerWidth;
    let H = window.innerHeight;
    const resize = (): void => {
      W = window.innerWidth;
      H = window.innerHeight;
      this.viewW = W;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    this.removeResize = () => window.removeEventListener('resize', resize);

    const target = this.targetCount(W, H);
    this.bubbles = this.reduceMotion ? this.spawnStatic(W, H, target) : [];
    this.bursting = false;
    let lastSpawn = 0;

    const draw = (t: number): void => {
      // Apparition progressive : les bulles descendent une à une depuis le haut.
      if (!this.bursting && !this.reduceMotion && this.bubbles.length < target && t - lastSpawn > 150) {
        this.bubbles.push(this.spawnTop(W));
        lastSpawn = t;
      }

      ctx.clearRect(0, 0, W, H);

      if (this.bursting) {
        let alive = false;
        for (const b of this.bubbles) {
          const local = t - this.burstStart - (b.popDelay ?? 0);
          if (local < 0) {
            b.x += b.vx; b.y += b.vy; // continue de flotter avant d'éclater
            this.paint(ctx, b);
            alive = true;
          } else if (local < POP_MS) {
            this.paintPop(ctx, b, local / POP_MS);
            alive = true;
          }
        }
        if (!alive) { this.hardStop(); return; }
        this.raf = requestAnimationFrame(draw);
        return;
      }

      for (const b of this.bubbles) {
        if (!this.reduceMotion) {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x - b.r < 0 && b.vx < 0) b.vx *= -1;
          if (b.x + b.r > W && b.vx > 0) b.vx *= -1;
          if (b.y + b.r > H && b.vy > 0) b.vy *= -1;
          if (b.y - b.r < 0 && b.vy < 0) b.vy *= -1;
        }
        this.paint(ctx, b);
      }
      this.raf = requestAnimationFrame(draw);
    };
    this.raf = requestAnimationFrame(draw);
  }

  // Plus de bulles sur grand écran (densité plus élevée, plafond relevé).
  private targetCount(W: number, H: number): number {
    return Math.max(28, Math.min(110, Math.round((W * H) / 22_000)));
  }

  // Bulle qui entre par le haut, hors écran, en descendant.
  private spawnTop(W: number): Bubble {
    const r = 16 + Math.random() * 40;
    return {
      x: r + Math.random() * (W - 2 * r),
      y: -r - Math.random() * 60,
      r,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.35 + Math.random() * 0.75,
      hue: Math.random() * 360,
    };
  }

  // Répartition figée (utilisée si l'utilisateur réduit les animations).
  private spawnStatic(W: number, H: number, count: number): Bubble[] {
    const out: Bubble[] = [];
    for (let i = 0; i < count; i++) {
      const r = 16 + Math.random() * 40;
      out.push({
        x: r + Math.random() * (W - 2 * r),
        y: r + Math.random() * (H - 2 * r),
        r, vx: 0, vy: 0, hue: Math.random() * 360,
      });
    }
    return out;
  }

  private paint(ctx: CanvasRenderingContext2D, b: Bubble): void {
    // Corps vitreux : dégradé radial décalé pour un effet de sphère.
    const g = ctx.createRadialGradient(
      b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1,
      b.x, b.y, b.r,
    );
    g.addColorStop(0, 'rgba(255,255,255,0.35)');
    g.addColorStop(0.5, `hsla(${b.hue}, 75%, 75%, 0.10)`);
    g.addColorStop(0.85, `hsla(${b.hue}, 85%, 62%, 0.26)`);
    g.addColorStop(1, `hsla(${(b.hue + 40) % 360}, 90%, 68%, 0.42)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    // Liseré irisé, un peu marqué pour ressortir sur le fond d'écran.
    ctx.strokeStyle = 'rgba(255,255,255,0.38)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Reflet lumineux.
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.arc(b.x - b.r * 0.34, b.y - b.r * 0.34, b.r * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }

  // Éclatement : la bulle enfle, s'estompe, et laisse un anneau qui se dilate.
  private paintPop(ctx: CanvasRenderingContext2D, b: Bubble, p: number): void {
    const ease = 1 - (1 - p) * (1 - p); // out-quad
    const fade = 1 - p;

    // Halo/corps qui gonfle et disparaît.
    const rr = b.r * (1 + 0.55 * ease);
    const g = ctx.createRadialGradient(b.x, b.y, b.r * 0.2, b.x, b.y, rr);
    g.addColorStop(0, `hsla(${b.hue}, 80%, 80%, ${0.22 * fade})`);
    g.addColorStop(1, `hsla(${(b.hue + 40) % 360}, 90%, 68%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, rr, 0, Math.PI * 2);
    ctx.fill();

    // Anneau irisé qui se dilate.
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * (1 + 0.75 * ease), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${0.55 * fade})`;
    ctx.lineWidth = 2.5 * fade + 0.5;
    ctx.stroke();
  }
}

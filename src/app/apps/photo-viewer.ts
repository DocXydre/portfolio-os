import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  input,
  signal,
  untracked,
} from '@angular/core';

/* Visionneuse d'images, façon "Aperçu des images" de XP.
   Galerie + index de départ. Navigation : boutons de la barre, flèches
   clavier (←/→) sur PC, et glissement (swipe) au doigt sur mobile. */

@Component({
  selector: 'app-photo-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="viewer">
      <div class="stage" (pointerdown)="onDown($event)" (pointerup)="onUp($event)">
        <img [src]="current()" [alt]="caption()" draggable="false" />
      </div>

      <div class="bar">
        <button class="nav" (click)="prev()" [disabled]="images().length < 2" title="Précédente">‹</button>
        <span class="caption">{{ caption() }}</span>
        <span class="counter">{{ index() + 1 }} / {{ images().length }}</span>
        <button class="nav" (click)="next()" [disabled]="images().length < 2" title="Suivante">›</button>
      </div>
    </div>
  `,
  styles: [`
    .viewer { display: flex; flex-direction: column; height: 100%; background: #5c5c5c; }
    .stage {
      flex: 1; display: flex; align-items: center; justify-content: center;
      overflow: hidden; padding: 8px; touch-action: pan-y;
    }
    .stage img { max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 2px 12px rgba(0,0,0,0.5); -webkit-user-drag: none; }

    .bar {
      display: flex; align-items: center; gap: 10px;
      padding: 5px 8px;
      background: linear-gradient(to bottom, #f4f2ee, #d8d4cc);
      border-top: 1px solid #fff;
    }
    .caption { flex: 1; font-size: 12px; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .counter { font-size: 11px; color: #444; }
    .nav {
      min-width: 30px; height: 24px; font-size: 18px; line-height: 1; cursor: pointer;
    }
    .nav:disabled { opacity: 0.4; cursor: default; }
  `],
})
export class PhotoViewer implements OnInit, OnDestroy {
  readonly images = input.required<string[]>();
  readonly captions = input<string[]>([]);
  readonly startIndex = input<number>(0);

  private readonly _i = signal(0);
  protected readonly index = computed(() => {
    const n = this.images().length;
    if (n === 0) return 0;
    return ((this._i() % n) + n) % n;
  });

  protected readonly current = computed(() => this.images()[this.index()] ?? '');
  protected readonly caption = computed(() => this.captions()[this.index()] ?? '');

  private downX: number | null = null;

  constructor() {
    // Se (re)positionne quand on ouvre une nouvelle image, même viewer déjà ouvert.
    effect(() => {
      const s = this.startIndex();
      untracked(() => this._i.set(s));
    });
  }

  private readonly onKey = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowLeft') this.prev();
    else if (e.key === 'ArrowRight') this.next();
  };

  ngOnInit(): void {
    window.addEventListener('keydown', this.onKey);
  }
  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onKey);
  }

  onDown(e: PointerEvent): void {
    this.downX = e.clientX;
  }
  onUp(e: PointerEvent): void {
    if (this.downX === null) return;
    const dx = e.clientX - this.downX;
    this.downX = null;
    if (Math.abs(dx) > 40) (dx < 0 ? this.next() : this.prev());
  }

  prev(): void { this._i.update((v) => v - 1); }
  next(): void { this._i.update((v) => v + 1); }
}

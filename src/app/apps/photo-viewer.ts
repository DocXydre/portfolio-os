import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/* Visionneuse d'images, façon "Aperçu des images et télécopies" de XP.
   Reçoit la galerie du dossier + l'index de départ, permet précédent/suivant. */

@Component({
  selector: 'app-photo-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="viewer">
      <div class="stage">
        <img [src]="current()" [alt]="caption()" />
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
      overflow: hidden; padding: 8px;
    }
    .stage img { max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 2px 12px rgba(0,0,0,0.5); }

    .bar {
      display: flex; align-items: center; gap: 10px;
      padding: 5px 8px;
      background: linear-gradient(to bottom, #f4f2ee, #d8d4cc);
      border-top: 1px solid #fff;
    }
    .caption { flex: 1; font-size: 12px; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .counter { font-size: 11px; color: #444; }
    .nav {
      width: 30px; height: 24px; font-size: 18px; line-height: 1;
      cursor: pointer;
    }
    .nav:disabled { opacity: 0.4; cursor: default; }
  `],
})
export class PhotoViewer {
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

  constructor() {
    // Position de départ transmise par l'explorateur.
    queueMicrotask(() => this._i.set(this.startIndex()));
  }

  prev(): void { this._i.update((v) => v - 1); }
  next(): void { this._i.update((v) => v + 1); }
}

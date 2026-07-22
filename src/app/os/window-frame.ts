import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { AppWindow } from '../core/models';
import { WindowService } from '../core/window.service';

/* ------------------------------------------------------------------
   Châssis XP générique. Ne connaît rien du contenu qu'il affiche :
   celui-ci est projeté via <ng-content>.
   Drag & resize en pointer events (compatibles tactile), déplacement
   en transform pendant le geste, commit dans le signal au relâchement.
   ------------------------------------------------------------------ */

@Component({
  selector: 'app-window-frame',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #frame
      class="window win-frame"
      [class.active]="isActive()"
      [class.maximized]="win().maximized"
      [style.left.px]="win().x"
      [style.top.px]="win().y"
      [style.width.px]="win().maximized ? null : win().width"
      [style.height.px]="win().maximized ? null : win().height"
      [style.z-index]="win().z"
      (pointerdown)="wm.focus(win().id)"
    >
      <div
        class="title-bar"
        [class.inactive]="!isActive()"
        (pointerdown)="startDrag($event)"
        (dblclick)="wm.toggleMaximize(win().id)"
      >
        <div class="title-bar-text">
          <img class="ico" [src]="'icons/' + win().icon + '.png'" alt="" />{{ win().title }}
        </div>
        <div class="title-bar-controls">
          <button aria-label="Minimize" (pointerdown)="$event.stopPropagation()" (click)="wm.toggleMinimize(win().id)"></button>
          <button [attr.aria-label]="win().maximized ? 'Restore' : 'Maximize'" (pointerdown)="$event.stopPropagation()" (click)="wm.toggleMaximize(win().id)"></button>
          <button aria-label="Close" (pointerdown)="$event.stopPropagation()" (click)="wm.close(win().id)"></button>
        </div>
      </div>

      <div class="window-body win-body">
        <ng-content />
      </div>

      @if (!win().maximized) {
        <div class="resize-handle" (pointerdown)="startResize($event)"></div>
      }
    </div>
  `,
  styles: [`
    :host { display: contents; }

    .win-frame {
      position: absolute;
      display: flex;
      flex-direction: column;
      min-width: 280px;
      min-height: 160px;
      box-shadow: 2px 3px 14px rgba(0, 0, 0, 0.35);
    }
    .win-frame.maximized {
      left: 0 !important;
      top: 0 !important;
      width: 100vw !important;
      height: calc(100vh - var(--taskbar-h)) !important;
    }

    /* On surcharge la barre de titre XP.css avec nos tokens de marque. */
    .title-bar {
      background: var(--title-grad);
      touch-action: none;
      cursor: default;
    }
    .title-bar.inactive { background: var(--title-inactive); }

    .window-body {
      flex: 1 1 auto;
      margin: 0;
      overflow: auto;
      background: #fff;
    }

    .ico {
      width: 15px;
      height: 15px;
      margin-right: 5px;
      vertical-align: -3px;
    }

    .resize-handle {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 16px;
      height: 16px;
      cursor: nwse-resize;
      touch-action: none;
    }
  `],
})
export class WindowFrame {
  readonly win = input.required<AppWindow>();
  protected readonly wm = inject(WindowService);

  private readonly frame = viewChild.required<ElementRef<HTMLDivElement>>('frame');
  protected readonly isActive = computed(() => this.wm.active()?.id === this.win().id);

  private drag: { pointerId: number; startX: number; startY: number; originX: number; originY: number } | null = null;
  private rz: { pointerId: number; startX: number; startY: number; w: number; h: number } | null = null;

  startDrag(ev: PointerEvent): void {
    if (this.win().maximized) return;
    ev.preventDefault();
    this.wm.focus(this.win().id);
    const el = this.frame().nativeElement;
    el.setPointerCapture(ev.pointerId);
    this.drag = {
      pointerId: ev.pointerId,
      startX: ev.clientX,
      startY: ev.clientY,
      originX: this.win().x,
      originY: this.win().y,
    };
    el.addEventListener('pointermove', this.onDragMove);
    el.addEventListener('pointerup', this.onDragEnd);
  }

  // Pendant le geste : on translate le nœud sans passer par le signal (0 re-render).
  private onDragMove = (ev: PointerEvent): void => {
    if (!this.drag || ev.pointerId !== this.drag.pointerId) return;
    const dx = ev.clientX - this.drag.startX;
    const dy = ev.clientY - this.drag.startY;
    this.frame().nativeElement.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };

  // Au relâchement : on commit la position finale dans l'état, puis on nettoie.
  private onDragEnd = (ev: PointerEvent): void => {
    if (!this.drag || ev.pointerId !== this.drag.pointerId) return;
    const dx = ev.clientX - this.drag.startX;
    const dy = ev.clientY - this.drag.startY;
    const el = this.frame().nativeElement;
    el.style.transform = '';
    el.removeEventListener('pointermove', this.onDragMove);
    el.removeEventListener('pointerup', this.onDragEnd);
    const y = Math.max(0, this.drag.originY + dy); // pas au-dessus du bord haut
    this.wm.move(this.win().id, this.drag.originX + dx, y);
    this.drag = null;
  };

  startResize(ev: PointerEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    const el = this.frame().nativeElement;
    el.setPointerCapture(ev.pointerId);
    this.rz = {
      pointerId: ev.pointerId,
      startX: ev.clientX,
      startY: ev.clientY,
      w: this.win().width,
      h: this.win().height,
    };
    el.addEventListener('pointermove', this.onResizeMove);
    el.addEventListener('pointerup', this.onResizeEnd);
  }

  private onResizeMove = (ev: PointerEvent): void => {
    if (!this.rz || ev.pointerId !== this.rz.pointerId) return;
    const w = Math.max(280, this.rz.w + (ev.clientX - this.rz.startX));
    const h = Math.max(160, this.rz.h + (ev.clientY - this.rz.startY));
    const el = this.frame().nativeElement;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
  };

  private onResizeEnd = (ev: PointerEvent): void => {
    if (!this.rz || ev.pointerId !== this.rz.pointerId) return;
    const w = Math.max(280, this.rz.w + (ev.clientX - this.rz.startX));
    const h = Math.max(160, this.rz.h + (ev.clientY - this.rz.startY));
    const el = this.frame().nativeElement;
    el.removeEventListener('pointermove', this.onResizeMove);
    el.removeEventListener('pointerup', this.onResizeEnd);
    this.wm.resize(this.win().id, w, h);
    this.rz = null;
  };
}

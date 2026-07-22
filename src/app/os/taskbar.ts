import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { WindowService } from '../core/window.service';
import { StartMenu } from './start-menu';

/* Barre des tâches : bouton Démarrer + un bouton par fenêtre ouverte
   (branché sur le signal, aucun bouton en dur) + horloge. */

@Component({
  selector: 'app-taskbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StartMenu],
  template: `
    @if (startOpen()) {
      <div class="backdrop" (pointerdown)="setStart(false)"></div>
      <app-start-menu (close)="setStart(false)" />
    }

    <nav class="taskbar">
      <button class="start" [class.on]="startOpen()" (pointerdown)="toggleStart($event)">
        <img class="flag" src="icons/winflag.png" alt="" /> démarrer
      </button>

      <div class="tasks">
        @for (w of wm.windows(); track w.id) {
          <button
            class="task"
            [class.active]="isActive(w.id) && !w.minimized"
            (click)="wm.taskbarClick(w.id)"
            [title]="w.title"
          >
            <img class="dot" [src]="'icons/' + w.icon + '.png'" alt="" />
            <span class="tname">{{ w.title }}</span>
          </button>
        }
      </div>

      <div class="tray">
        <span class="clock">{{ clock() }}</span>
      </div>
    </nav>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; z-index: 99998; }
    :host ::ng-deep app-start-menu { z-index: 99999; }

    .taskbar {
      position: fixed; left: 0; right: 0; bottom: 0;
      height: var(--taskbar-h);
      display: flex; align-items: stretch;
      background: var(--taskbar-grad);
      border-top: 1px solid #4d90f0;
      z-index: 100000;
    }

    .start {
      display: flex; align-items: center; gap: 7px;
      padding: 0 22px 0 12px;
      background: var(--start-grad);
      color: #fff; font-style: italic; font-weight: bold; font-size: 15px;
      border: none; border-radius: 0 12px 12px 0;
      box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.5);
      cursor: pointer; letter-spacing: 0.3px;
    }
    .start.on { box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.4); }
    .flag { width: 20px; height: 20px; }

    .tasks {
      flex: 1; display: flex; align-items: center; gap: 4px;
      padding: 0 6px; overflow: hidden;
    }
    .task {
      display: flex; align-items: center; gap: 6px;
      min-width: 130px; max-width: 170px; height: 24px;
      padding: 0 8px;
      background: linear-gradient(to bottom, #4d90f0, #2f6fed);
      color: #fff; border: 1px solid #1b3fa0; border-radius: 3px;
      font: inherit; cursor: pointer; text-align: left;
    }
    .task.active {
      background: linear-gradient(to bottom, #1f52c4, #2f6fed);
      box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.4);
    }
    .task .dot { width: 16px; height: 16px; flex: 0 0 auto; }
    .tname { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .tray {
      display: flex; align-items: center;
      padding: 0 12px; background: var(--tray-bg);
      border-left: 1px solid #1b56b8;
      box-shadow: inset 1px 0 2px rgba(0, 0, 0, 0.25);
    }
    .clock { color: #fff; font-size: 12px; }
  `],
})
export class Taskbar implements OnInit, OnDestroy {
  protected readonly wm = inject(WindowService);
  protected readonly startOpen = signal(false);
  protected readonly clock = signal('');
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.tick();
    this.timer = setInterval(() => this.tick(), 15000);
  }
  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private tick(): void {
    this.clock.set(
      new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    );
  }

  isActive(id: string): boolean {
    return this.wm.active()?.id === id;
  }

  toggleStart(ev: Event): void {
    ev.stopPropagation();
    this.startOpen.update((v) => !v);
  }
  setStart(v: boolean): void {
    this.startOpen.set(v);
  }
}

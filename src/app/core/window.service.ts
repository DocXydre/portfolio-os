import { Injectable, computed, signal } from '@angular/core';
import { AppWindow, WindowData, WindowType } from './models';

/* ------------------------------------------------------------------
   Source de vérité unique pour toutes les fenêtres.
   Desktop, taskbar et menu Démarrer lisent le même signal.
   Aucune manipulation directe du DOM : tout passe par cet état.
   ------------------------------------------------------------------ */

let uid = 0;
const nextId = () => `w${++uid}`;

interface OpenOptions {
  type: WindowType;
  title: string;
  icon: string;
  width?: number;
  height?: number;
  data?: WindowData;
  /** Clé de déduplication : rouvrir la même chose refocalise au lieu de dupliquer. */
  key?: string;
}

@Injectable({ providedIn: 'root' })
export class WindowService {
  private readonly _windows = signal<AppWindow[]>([]);
  readonly windows = this._windows.asReadonly();

  /** Fenêtre au premier plan (z max, non minimisée). */
  readonly active = computed<AppWindow | null>(() => {
    const visible = this._windows().filter((w) => !w.minimized);
    if (visible.length === 0) return null;
    return visible.reduce((a, b) => (a.z > b.z ? a : b));
  });

  private topZ = 0;
  private readonly keyed = new Map<string, string>(); // key -> window id

  open(opts: OpenOptions): string {
    // Déduplication : si une fenêtre avec cette clé existe, on la refocalise
    // et on lui transmet la nouvelle charge utile (ex. explorateur qui navigue).
    if (opts.key && this.keyed.has(opts.key)) {
      const id = this.keyed.get(opts.key)!;
      if (this._windows().some((w) => w.id === id)) {
        if (opts.data) this.patch(id, { data: opts.data, title: opts.title, icon: opts.icon });
        this.restore(id);
        this.focus(id);
        return id;
      }
      this.keyed.delete(opts.key);
    }

    const id = nextId();
    const width = opts.width ?? 640;
    const height = opts.height ?? 460;
    const count = this._windows().length;
    const offset = (count % 8) * 26; // cascade

    const win: AppWindow = {
      id,
      type: opts.type,
      title: opts.title,
      icon: opts.icon,
      x: 90 + offset,
      y: 70 + offset,
      width,
      height,
      minimized: false,
      maximized: false,
      z: ++this.topZ,
      data: opts.data,
    };

    this._windows.update((ws) => [...ws, win]);
    if (opts.key) this.keyed.set(opts.key, id);
    return id;
  }

  close(id: string): void {
    this._windows.update((ws) => ws.filter((w) => w.id !== id));
    for (const [k, v] of this.keyed) if (v === id) this.keyed.delete(k);
  }

  focus(id: string): void {
    const z = ++this.topZ;
    this.patch(id, { z });
  }

  toggleMinimize(id: string): void {
    const w = this.get(id);
    if (!w) return;
    this.patch(id, { minimized: !w.minimized });
    if (w.minimized) this.focus(id); // était minimisée -> on la remonte
  }

  private restore(id: string): void {
    this.patch(id, { minimized: false });
  }

  toggleMaximize(id: string): void {
    const w = this.get(id);
    if (!w) return;
    this.patch(id, { maximized: !w.maximized });
    this.focus(id);
  }

  move(id: string, x: number, y: number): void {
    this.patch(id, { x, y });
  }

  resize(id: string, width: number, height: number): void {
    this.patch(id, { width, height });
  }

  /** Renomme une fenêtre (l'explorateur suit sa navigation). */
  setTitle(id: string, title: string, icon?: string): void {
    this.patch(id, icon ? { title, icon } : { title });
  }

  /** Clic sur un bouton de taskbar : refocalise ou minimise si déjà active. */
  taskbarClick(id: string): void {
    const w = this.get(id);
    if (!w) return;
    if (w.minimized) {
      this.restore(id);
      this.focus(id);
    } else if (this.active()?.id === id) {
      this.patch(id, { minimized: true });
    } else {
      this.focus(id);
    }
  }

  private get(id: string): AppWindow | undefined {
    return this._windows().find((w) => w.id === id);
  }

  private patch(id: string, partial: Partial<AppWindow>): void {
    this._windows.update((ws) =>
      ws.map((w) => (w.id === id ? { ...w, ...partial } : w)),
    );
  }
}

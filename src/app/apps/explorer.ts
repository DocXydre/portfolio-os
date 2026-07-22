import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { FsFile, FsFolder, FsNode } from '../core/models';
import { WindowService } from '../core/window.service';
import {
  COMPUTER_ID,
  DESKTOP_ID,
  MY_DOCS_ID,
  MY_PICTURES_ID,
  FS_ROOT,
  getNode,
  getParentId,
  isFolder,
  trail,
} from '../data/filesystem';

interface Group {
  label: string;
  items: FsNode[];
}

/* ------------------------------------------------------------------
   Explorateur de fichiers façon Windows XP.
   Volet gauche : soit le volet de tâches (Autres emplacements + Détails),
   soit l'arbre des dossiers (bouton "Dossiers"). Contenu à droite groupé
   par sections. Toute la navigation se fait dans cette seule fenêtre.
   ------------------------------------------------------------------ */

@Component({
  selector: 'app-explorer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <div class="explorer">
      <!-- Barre d'outils -->
      <div class="toolbar">
        <button class="tb nav" [disabled]="!canBack()" (click)="goBack()">‹ Précédente</button>
        <button class="tb nav" [disabled]="!canForward()" (click)="goForward()">Suivante ›</button>
        <button class="tb ico-btn" [disabled]="!parentId()" (click)="goUp()" title="Dossier parent">⭱</button>
        <span class="tb-sep"></span>
        <button class="tb" [class.on]="showTree()" (click)="toggleTree()">📁 Dossiers</button>
      </div>

      <!-- Barre d'adresse -->
      <div class="address-bar">
        <span class="addr-label">Adresse</span>
        <div class="addr-box">
          <img class="addr-ico" [src]="'icons/' + (currentNode()?.icon ?? 'folder') + '.png'" alt="" />
          @for (f of trailFolders(); track f.id; let last = $last) {
            <button class="crumb" (click)="navigate(f.id)">{{ f.name }}</button>
            @if (!last) { <span class="sep">▸</span> }
          }
        </div>
      </div>

      <div class="body">
        <!-- Volet gauche -->
        <aside class="pane">
          @if (showTree()) {
            <div class="tree-head">Dossiers</div>
            <div class="tree-body">
              <ng-container [ngTemplateOutlet]="nodeTpl" [ngTemplateOutletContext]="{ $implicit: root, depth: 0 }" />
            </div>
          } @else {
            @if (otherPlaces().length) {
              <div class="panel">
                <div class="panel-head"><span>Autres emplacements</span><span class="chev">≪</span></div>
                <div class="panel-body links">
                  @for (p of otherPlaces(); track p.id) {
                    <button class="link" (click)="navigate(p.id)">
                      <img [src]="'icons/' + p.icon + '.png'" alt="" />
                      <span>{{ p.name }}</span>
                    </button>
                  }
                </div>
              </div>
            }
            <div class="panel">
              <div class="panel-head"><span>Détails</span><span class="chev">≪</span></div>
              <div class="panel-body details">
                <p class="d-name">{{ detail().name }}</p>
                <p class="d-type">{{ detail().type }}</p>
                @if (detail().extra) { <p class="d-extra">{{ detail().extra }}</p> }
              </div>
            </div>
          }
        </aside>

        <!-- Contenu -->
        <section class="content" (click)="selected.set(null)">
          @for (g of groups(); track g.label) {
            @if (g.label) { <h2 class="group-head">{{ g.label }}</h2> }
            <div class="grid">
              @for (n of g.items; track n.id) {
                <button
                  class="item"
                  (click)="onSelect(n.id, $event)"
                  (dblclick)="onOpen(n)"
                  [class.sel]="selected() === n.id"
                >
                  @if (n.kind === 'file' && n.open === 'photo' && n.imageSrc) {
                    <img class="thumb photo" [src]="n.imageSrc" alt="" loading="lazy" />
                  } @else {
                    <img class="thumb" [src]="'icons/' + n.icon + '.png'" alt="" />
                  }
                  <span class="label">{{ n.name }}</span>
                </button>
              }
            </div>
          }
          @if (isEmpty()) { <p class="empty">Ce dossier est vide.</p> }
        </section>
      </div>
    </div>

    <!-- Gabarit récursif de l'arbre -->
    <ng-template #nodeTpl let-n let-depth="depth">
      <div class="row" [class.active]="currentId() === n.id" [style.padding-left.px]="6 + depth * 14" (click)="navigate(n.id)">
        @if (hasFolders(n)) {
          <button class="twist" (click)="toggle(n.id, $event)">{{ expanded().has(n.id) ? '−' : '+' }}</button>
        } @else {
          <span class="twist-spacer"></span>
        }
        <img class="row-ico" [src]="'icons/' + n.icon + '.png'" alt="" />
        <span class="row-name">{{ n.name }}</span>
      </div>
      @if (expanded().has(n.id)) {
        @for (c of subFolders(n); track c.id) {
          <ng-container [ngTemplateOutlet]="nodeTpl" [ngTemplateOutletContext]="{ $implicit: c, depth: depth + 1 }" />
        }
      }
    </ng-template>
  `,
  styles: [`
    .explorer { display: flex; flex-direction: column; height: 100%; background: #fff; }

    /* Toolbar */
    .toolbar {
      display: flex; align-items: center; gap: 4px;
      padding: 4px 6px;
      background: linear-gradient(to bottom, #f9f8f6, #e7e3da);
      border-bottom: 1px solid #c8c3b6;
    }
    .tb {
      font: inherit; font-size: 11px; padding: 3px 9px;
      background: none; border: 1px solid transparent; border-radius: 3px; cursor: pointer;
    }
    .tb:hover:not(:disabled) { border-color: #a9c3ef; background: #eaf1fd; }
    .tb.on { border-color: #7fa8e6; background: #dbe8fb; }
    .tb:disabled { opacity: 0.4; cursor: default; }
    .tb.nav { font-weight: bold; }
    .ico-btn { padding: 3px 7px; }
    .tb-sep { width: 1px; height: 20px; background: #c8c3b6; margin: 0 3px; }

    /* Address bar */
    .address-bar {
      display: flex; align-items: center; gap: 6px;
      padding: 3px 8px; border-bottom: 1px solid #c8c3b6; background: #fff;
    }
    .addr-label { color: #555; font-size: 11px; }
    .addr-box {
      flex: 1; display: flex; align-items: center; flex-wrap: wrap; gap: 2px;
      border: 1px solid #a9a496; border-radius: 2px; padding: 2px 6px; min-height: 22px;
    }
    .addr-ico { width: 16px; height: 16px; margin-right: 4px; }
    .crumb { background: none; border: none; font: inherit; font-size: 11px; color: #103a8e; cursor: pointer; padding: 1px 3px; border-radius: 2px; }
    .crumb:hover { background: #dce8fb; text-decoration: underline; }
    .sep { color: #888; font-size: 10px; }

    .body { flex: 1; display: flex; overflow: hidden; }

    /* Volet gauche */
    .pane {
      width: 200px; flex: 0 0 200px; overflow: auto;
      background: linear-gradient(to bottom, #6d8fd6 0%, #5b7fd0 30%, #7a9ce0 100%);
      padding: 8px;
    }

    /* Panneaux de tâches (Autres emplacements / Détails) */
    .panel { margin-bottom: 12px; background: transparent; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .panel-head {
      display: flex; align-items: center; justify-content: space-between;
      background: linear-gradient(to right, #3f6bd6, #6d97e8);
      color: #fff; font-weight: bold; font-size: 11px; padding: 4px 8px;
    }
    .chev {
      width: 15px; height: 15px; border-radius: 50%;
      background: rgba(255,255,255,0.25); text-align: center; line-height: 15px; font-size: 9px;
    }
    .panel-body { background: linear-gradient(to bottom, #d3e0f7, #c2d4f2); padding: 8px; }
    .links { display: flex; flex-direction: column; gap: 4px; }
    .link {
      display: flex; align-items: center; gap: 7px; width: 100%; text-align: left;
      background: none; border: none; font: inherit; font-size: 11px; color: #1a3f8f;
      cursor: pointer; padding: 2px 3px; border-radius: 2px;
    }
    .link img { width: 20px; height: 20px; }
    .link:hover span { text-decoration: underline; color: #0a2a6e; }
    .details p { margin: 0 0 3px; font-size: 11px; color: #1a2f5c; }
    .details .d-name { font-weight: bold; }
    .details .d-type { color: #45568a; }
    .details .d-extra { color: #45568a; }

    /* Arbre */
    .tree-head {
      background: linear-gradient(to bottom, #4d82df, #2f6fed);
      color: #fff; font-weight: bold; padding: 4px 8px; font-size: 11px; border-radius: 4px 4px 0 0;
    }
    .tree-body { background: #fff; border-radius: 0 0 4px 4px; padding: 4px 0; min-height: 60px; }
    .row { display: flex; align-items: center; gap: 3px; padding: 2px 6px; cursor: pointer; font-size: 12px; white-space: nowrap; }
    .row:hover { background: #eaf1fd; }
    .row.active { background: #316ac5; color: #fff; }
    .twist { width: 15px; height: 15px; line-height: 12px; text-align: center; font-size: 12px; border: 1px solid #7f9db9; background: #fff; cursor: pointer; padding: 0; flex: 0 0 auto; }
    .twist-spacer { width: 15px; flex: 0 0 auto; }
    .row-ico { width: 16px; height: 16px; flex: 0 0 auto; }
    .row-name { overflow: hidden; text-overflow: ellipsis; }

    /* Contenu */
    .content { flex: 1; padding: 12px 16px; overflow: auto; background: #fff; }
    .group-head {
      font-size: 13px; font-weight: bold; color: #16336e; margin: 4px 0 2px;
      padding-bottom: 3px;
      border-bottom: 1px solid; border-image: linear-gradient(to right, #16336e, #fff) 1;
    }
    .grid { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 4px; padding: 8px 0 14px; }
    .item {
      width: 120px; min-height: 60px;
      display: flex; align-items: center; gap: 8px;
      padding: 6px; background: none; border: 1px solid transparent; border-radius: 3px;
      cursor: pointer; font: inherit; text-align: left;
    }
    .item:hover { background: rgba(49,106,197,0.10); }
    .item.sel { background: rgba(49,106,197,0.20); border-color: rgba(49,106,197,0.4); }
    .thumb { width: 32px; height: 32px; object-fit: contain; flex: 0 0 auto; }
    .thumb.photo { width: 40px; height: 34px; object-fit: cover; border: 1px solid #9db0cf; background: #fff; padding: 1px; }
    .label { font-size: 11px; line-height: 1.2; word-break: break-word; }
    .empty { color: #777; padding: 16px; }
  `],
})
export class Explorer {
  readonly winId = input.required<string>();
  readonly startId = input.required<string>();

  private readonly wm = inject(WindowService);
  protected readonly root: FsFolder = FS_ROOT;

  protected readonly currentId = signal<string>(DESKTOP_ID);
  private readonly back = signal<string[]>([]);
  private readonly forward = signal<string[]>([]);
  protected readonly expanded = signal<Set<string>>(new Set([DESKTOP_ID, COMPUTER_ID]));
  protected readonly selected = signal<string | null>(null);
  protected readonly showTree = signal(false);

  protected readonly canBack = computed(() => this.back().length > 0);
  protected readonly canForward = computed(() => this.forward().length > 0);
  protected readonly parentId = computed(() => getParentId(this.currentId()));
  protected readonly trailFolders = computed(() => trail(this.currentId()));
  protected readonly currentNode = computed<FsFolder | undefined>(() => {
    const n = getNode(this.currentId());
    return isFolder(n) ? n : undefined;
  });
  private readonly children = computed<FsNode[]>(() => this.currentNode()?.children ?? []);

  /** Contenu groupé en sections (façon "Poste de travail" XP). */
  protected readonly groups = computed<Group[]>(() => {
    if (this.currentId() === COMPUTER_ID) {
      const stored = [getNode(MY_DOCS_ID), getNode(MY_PICTURES_ID)].filter(
        (n): n is FsNode => !!n,
      );
      return [
        { label: 'Fichiers stockés sur cet ordinateur', items: stored },
        { label: 'Projets', items: this.children() },
      ];
    }
    return [{ label: '', items: this.children() }];
  });

  protected readonly isEmpty = computed(() => this.groups().every((g) => g.items.length === 0));

  /** Liens "Autres emplacements". */
  protected readonly otherPlaces = computed(() => {
    const cur = this.currentId();
    const candidates = [this.parentId(), COMPUTER_ID, MY_DOCS_ID, MY_PICTURES_ID, DESKTOP_ID];
    const seen = new Set<string>([cur]);
    const out: { id: string; name: string; icon: string }[] = [];
    for (const id of candidates) {
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const n = getNode(id);
      if (isFolder(n)) out.push({ id: n.id, name: n.name, icon: n.icon });
    }
    return out;
  });

  /** Panneau "Détails" : élément sélectionné, sinon dossier courant. */
  protected readonly detail = computed<{ name: string; type: string; extra?: string }>(() => {
    const sel = this.selected();
    if (sel) {
      const n = getNode(sel);
      if (n) {
        if (n.kind === 'folder') {
          return { name: n.name, type: 'Dossier de fichiers', extra: `${n.children.length} élément(s)` };
        }
        return { name: n.name, type: this.fileType(n) };
      }
    }
    const c = this.currentNode();
    if (!c) return { name: '', type: '' };
    return { name: c.name, type: 'Dossier de fichiers', extra: `${c.children.length} élément(s)` };
  });

  constructor() {
    effect(() => {
      const target = this.startId();
      untracked(() => this.navigate(target));
    });
  }

  private fileType(f: FsFile): string {
    switch (f.open) {
      case 'project': return 'Fiche projet';
      case 'photo': return 'Image';
      case 'pdf': return 'Document PDF';
      case 'about': return 'Contact';
      default: return 'Fichier';
    }
  }

  hasFolders(n: FsNode): boolean {
    return n.kind === 'folder' && n.children.some((c) => c.kind === 'folder');
  }
  subFolders(n: FsNode): FsFolder[] {
    return n.kind === 'folder' ? (n.children.filter((c) => c.kind === 'folder') as FsFolder[]) : [];
  }

  toggleTree(): void {
    this.showTree.update((v) => !v);
  }

  toggle(id: string, ev: Event): void {
    ev.stopPropagation();
    this.expanded.update((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  onSelect(id: string, ev: Event): void {
    ev.stopPropagation();
    this.selected.set(id);
  }

  navigate(id: string): void {
    const node = getNode(id);
    if (!isFolder(node)) return;
    const cur = this.currentId();
    if (cur === id) return;
    if (cur) {
      this.back.update((b) => [...b, cur]);
      this.forward.set([]);
    }
    this.applyCurrent(id);
  }

  goBack(): void {
    const b = this.back();
    if (b.length === 0) return;
    const prev = b[b.length - 1];
    this.back.set(b.slice(0, -1));
    this.forward.update((f) => [this.currentId(), ...f]);
    this.applyCurrent(prev);
  }

  goForward(): void {
    const f = this.forward();
    if (f.length === 0) return;
    const nextId = f[0];
    this.forward.set(f.slice(1));
    this.back.update((b) => [...b, this.currentId()]);
    this.applyCurrent(nextId);
  }

  goUp(): void {
    const p = this.parentId();
    if (p) this.navigate(p);
  }

  private applyCurrent(id: string): void {
    const node = getNode(id);
    if (!isFolder(node)) return;
    this.currentId.set(id);
    this.expandAncestors(id);
    this.selected.set(null);
    this.wm.setTitle(this.winId(), node.name, node.icon);
  }

  private expandAncestors(id: string): void {
    this.expanded.update((s) => {
      const next = new Set(s);
      let cur: string | null = getParentId(id);
      while (cur) {
        next.add(cur);
        cur = getParentId(cur);
      }
      return next;
    });
  }

  onOpen(n: FsNode): void {
    if (n.kind === 'folder') {
      this.navigate(n.id);
      return;
    }
    this.openFile(n);
  }

  private openFile(f: FsFile): void {
    if (f.open === 'project' && f.projectId) {
      this.wm.open({
        type: 'project', title: f.name.replace(/\.txt$/, ''), icon: 'text',
        width: 660, height: 520, data: { projectId: f.projectId }, key: `project:${f.projectId}`,
      });
    } else if (f.open === 'pdf' && f.pdfSrc) {
      this.wm.open({
        type: 'pdf', title: f.name, icon: 'pdf',
        width: 640, height: 640, data: { pdfSrc: f.pdfSrc }, key: `pdf:${f.id}`,
      });
    } else if (f.open === 'about') {
      this.wm.open({ type: 'about', title: 'À propos de moi', icon: 'user', width: 480, height: 420, key: 'about' });
    } else if (f.open === 'photo') {
      const photos = this.children().filter(
        (c): c is FsFile => c.kind === 'file' && c.open === 'photo',
      );
      const images = photos.map((p) => p.imageSrc!).filter(Boolean);
      const captions = photos.map((p) => p.caption ?? '');
      const index = Math.max(0, photos.findIndex((p) => p.id === f.id));
      this.wm.open({
        type: 'photo', title: f.name, icon: 'photo',
        width: 720, height: 560, data: { images, captions, imageIndex: index }, key: 'photo-viewer',
      });
    }
  }
}

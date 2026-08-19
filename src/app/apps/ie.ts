import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/* Internet Explorer d'époque (décor Windows XP) et iframe chargeant le
   site réel. Les projets web hébergés s'affichent en direct dans l'OS,
   sans modification de leur code. Le navigateur dispose d'une page
   d'accueil listant les deux sites et gère une navigation complète
   (précédent / suivant). */

interface Bookmark {
  label: string;
  desc: string;
  url: string;
}

const HOME = 'about:accueil';

const SITES: Bookmark[] = [
  {
    label: 'Loves me… loves me not',
    desc: 'Mini-jeu recréé dans une interface Nintendo DS (HTML / CSS / JS).',
    url: 'https://lovesme.thomasmathis.me/',
  },
  {
    label: 'EuroPark',
    desc: 'Application de gestion de parkings en Europe (TypeScript / Hono).',
    url: 'https://europark.thomasmathis.me',
  },
];

@Component({
  selector: 'app-ie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ie">
      <!-- Barre de menus -->
      <div class="menubar">
        <span class="m">File</span><span class="m">Edit</span><span class="m">View</span>
        <span class="m">Favorites</span><span class="m">Tools</span><span class="m">Help</span>
      </div>

      <!-- Barre d'outils -->
      <div class="toolbar">
        <button class="nav back" [disabled]="!canBack()" (click)="goBack()" title="Précédente">
          <img class="tbico" src="icons/ie-back.png" alt="" /> Back
        </button>
        <button class="nav fwd" [disabled]="!canFwd()" (click)="goFwd()" title="Suivante">
          <img class="tbico" src="icons/ie-forward.png" alt="" />
        </button>
        <span class="sep"></span>
        <button class="ico" (click)="reload()" title="Arrêter"><img class="tbico" src="icons/ie-stop.png" alt="" /></button>
        <button class="ico" (click)="reload()" title="Actualiser"><img class="tbico" src="icons/ie-refresh.png" alt="" /></button>
        <button class="ico" (click)="goHome()" title="Page de démarrage"><img class="tbico" src="icons/ie-home.png" alt="" /></button>
        <span class="sep"></span>
        <button class="tb wide" (click)="goHome()" title="Rechercher"><img class="tbico" src="icons/ie-search.png" alt="" /> Search</button>
        <button class="tb wide" (click)="goHome()" title="Favoris">
          <img class="favimg" src="icons/star.png" alt="" /> Favorites
        </button>
      </div>

      <!-- Barre d'adresse -->
      <div class="address">
        <span class="lbl">Address</span>
        <div class="box">
          <img src="icons/ie.png" alt="" />
          <input
            #addr
            class="url"
            type="text"
            [value]="display()"
            (keydown.enter)="go(addr.value)"
            spellcheck="false"
          />
          <span class="caret">▾</span>
        </div>
        <button class="go" (click)="go(addr.value)">
          <span class="goar">➜</span> Go
        </button>
        <span class="links">Links <span class="chev">»</span></span>
      </div>

      <!-- Contenu -->
      <div class="viewport">
        @if (isHome()) {
          <!-- Page de démarrage : vue dossier XP, même style que le Poste de travail -->
          <div class="startpage">
            <aside class="hp-pane">
              <div class="panel">
                <div class="panel-head"><span>Mes projets en ligne</span><span class="chev">≪</span></div>
                <div class="panel-body">
                  <p class="p-intro">Choisissez un site à ouvrir dans Internet Explorer.</p>
                </div>
              </div>
              <div class="panel">
                <div class="panel-head"><span>Détails</span><span class="chev">≪</span></div>
                <div class="panel-body details">
                  <p class="d-name">Projets web hébergés</p>
                  <p class="d-type">2 sites en ligne</p>
                </div>
              </div>
            </aside>

            <section class="hp-content">
              <h2 class="group-head">Projets en ligne</h2>
              <div class="grid">
                @for (s of sites; track s.url) {
                  <button class="item" (click)="go(s.url)">
                    <img class="thumb" src="icons/ie.png" alt="" />
                    <span class="txt">
                      <span class="i-name">{{ s.label }}</span>
                      <span class="i-desc">{{ s.desc }}</span>
                    </span>
                  </button>
                }
              </div>
            </section>
          </div>
        } @else {
          @if (loading()) { <div class="loading">Ouverture de {{ current() }} …</div> }
          <iframe
            [src]="safe()"
            title="Site"
            (load)="loading.set(false)"
            referrerpolicy="no-referrer"
            allow="autoplay; fullscreen"
          ></iframe>
        }
      </div>

      <!-- Barre d'état -->
      <div class="statusbar">
        <span>{{ isHome() ? 'Terminé' : (loading() ? 'Ouverture…' : 'Terminé') }}</span>
        <span class="zone"><img src="icons/ie.png" alt="" /> Internet</span>
      </div>
    </div>
  `,
  styles: [`
    .ie { display: flex; flex-direction: column; height: 100%; background: #fff; font-size: 12px; font-family: Tahoma, sans-serif; }

    /* Menu */
    .menubar { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; padding: 2px 8px; background: #f6f5ee; border-bottom: 1px solid #d6d2c6; }
    .menubar .m { color: #111; }
    .menubar .m:first-letter { text-decoration: underline; }

    /* Toolbar */
    .toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; row-gap: 3px; padding: 3px 6px;
      background: linear-gradient(to bottom, #fbfbf7 0%, #e9e6db 100%); border-bottom: 1px solid #cfcabd; }
    .toolbar .sep { width: 1px; height: 14px; background: #cfcabd; margin: 0 4px; }
    .tbico { width: 14px; height: 14px; flex: 0 0 auto; }

    /* Boutons dimensionnés à la taille du logo + un petit padding. */
    .nav { display: inline-flex; align-items: center; gap: 4px; height: 18px; padding: 0 5px;
      border: 1px solid transparent; border-radius: 3px; background: none; font: inherit; color: #0a0a0a; cursor: pointer; }
    .nav:hover:not(:disabled) { border-color: #a9c3ef; background: #eaf1fd; }
    .nav:disabled { color: #9a988f; cursor: default; }
    .nav:disabled .tbico { filter: grayscale(1); opacity: .45; }

    /* Boutons icône carrés, juste le logo + 2px de padding */
    .ico { width: 18px; height: 18px; padding: 0; flex: 0 0 auto;
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid transparent; border-radius: 3px; background: none; cursor: pointer; }
    .ico:hover { border-color: #a9c3ef; background: #eaf1fd; }

    .tb { display: inline-flex; align-items: center; gap: 4px; height: 18px; padding: 0 5px;
      border: 1px solid transparent; border-radius: 3px; background: none; font: inherit; color: #0a0a0a; cursor: pointer; }
    .tb:hover { border-color: #a9c3ef; background: #eaf1fd; }
    .tb .favimg { width: 13px; height: 13px; }

    /* Address */
    .address { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; row-gap: 4px; padding: 3px 8px;
      background: #f6f5ee; border-top: 1px solid #fff; border-bottom: 1px solid #d6d2c6; }
    .address .lbl { color: #6a6a5f; }
    .address .box { flex: 1 1 150px; min-width: 120px; display: flex; align-items: center; gap: 5px; background: #fff;
      border: 1px solid #7f9db9; border-radius: 2px; padding: 1px 4px; box-shadow: inset 1px 1px 1px rgba(0,0,0,.12); overflow: hidden; }
    .address .box img { width: 16px; height: 16px; flex: 0 0 auto; }
    .address .url { flex: 1; border: none; outline: none; font: inherit; color: #111; background: none; min-width: 0; }
    .address .caret { color: #6a6a5f; font-size: 10px; padding: 0 2px; border-left: 1px solid #cfcabd; }
    .address .go { display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px;
      border: 1px solid #6f8f5f; border-radius: 3px; color: #1a4d13; cursor: pointer;
      background: linear-gradient(to bottom, #eafbe3, #bfe8ab); }
    .address .go .goar { color: #2f8d2f; font-weight: bold; }
    .address .go:hover { background: linear-gradient(to bottom, #f2fded, #b0e298); }
    .address .links { color: #6a6a5f; padding-left: 4px; white-space: nowrap; }
    .address .links .chev { color: #2b6bc6; font-weight: bold; }

    /* Viewport */
    .viewport { position: relative; flex: 1; overflow: hidden; background: #fff; }
    .viewport iframe { width: 100%; height: 100%; border: none; display: block; }
    .loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #555; background: #fff; z-index: 1; }

    /* Page de démarrage — même style que le Poste de travail (explorateur XP) */
    .startpage { display: flex; height: 100%; overflow: hidden; background: #fff; }

    .hp-pane {
      width: 200px; flex: 0 0 200px; overflow: auto; padding: 8px;
      background: linear-gradient(to bottom, #6d8fd6 0%, #5b7fd0 30%, #7a9ce0 100%);
    }
    .panel { margin-bottom: 12px; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .panel-head { display: flex; align-items: center; justify-content: space-between;
      background: linear-gradient(to right, #3f6bd6, #6d97e8);
      color: #fff; font-weight: bold; font-size: 11px; padding: 4px 8px; }
    .chev { width: 15px; height: 15px; border-radius: 50%;
      background: rgba(255,255,255,0.25); text-align: center; line-height: 15px; font-size: 9px; }
    .panel-body { background: linear-gradient(to bottom, #d3e0f7, #c2d4f2); padding: 8px; }
    .p-intro { margin: 0; font-size: 11px; color: #1a3f8f; }
    .details p { margin: 0 0 3px; font-size: 11px; color: #1a2f5c; }
    .details .d-name { font-weight: bold; }
    .details .d-type { color: #45568a; }

    .hp-content { flex: 1; padding: 12px 16px; overflow: auto; background: #fff; }
    .group-head { font-size: 13px; font-weight: bold; color: #16336e; margin: 4px 0 2px; padding-bottom: 3px;
      border-bottom: 1px solid; border-image: linear-gradient(to right, #16336e, #fff) 1; }
    .grid { display: flex; flex-direction: column; gap: 4px; padding: 8px 0 14px; }
    .item { display: flex; align-items: center; gap: 10px; width: 100%; max-width: 460px; text-align: left;
      padding: 8px; background: none; border: 1px solid transparent; border-radius: 3px; cursor: pointer; font: inherit; }
    .item:hover { background: rgba(49,106,197,0.10); }
    .item .thumb { width: 32px; height: 32px; flex: 0 0 auto; }
    .item .txt { display: flex; flex-direction: column; }
    .item .i-name { font-size: 12px; font-weight: bold; color: #1c4da1; }
    .item .i-desc { font-size: 11px; color: #333; }

    /* Status */
    .statusbar { display: flex; justify-content: space-between; align-items: center; padding: 2px 8px;
      background: #f6f5ee; border-top: 1px solid #d6d2c6; color: #444; }
    .statusbar .zone { display: inline-flex; align-items: center; gap: 5px; border-left: 1px solid #cfcabd; padding-left: 10px; }
    .statusbar .zone img { width: 13px; height: 13px; }

    /* Mobile : chrome plus fin pour laisser la place au site. */
    @media (max-width: 640px) {
      .ie { font-size: 11px; }
      .menubar { gap: 9px; padding: 1px 6px; }
      .toolbar { padding: 1px 4px; gap: 1px; }
      .nav, .tb { height: 18px; padding: 0 4px; }
      .ico { width: 18px; height: 18px; }
      .tbico { width: 14px; height: 14px; }
      .address { padding: 2px 6px; }
      .address .go { padding: 1px 7px; }
      .address .links { display: none; }   /* décoratif : masqué pour gagner de la place */
    }
  `],
})
export class Ie {
  /** URL de départ, optionnelle. Absente = page de démarrage. */
  readonly url = input<string>('');
  private readonly san = inject(DomSanitizer);

  protected readonly sites = SITES;
  protected readonly loading = signal(true);

  protected readonly current = signal<string>(HOME);
  private synced = false;

  private readonly backStack = signal<string[]>([]);
  private readonly fwdStack = signal<string[]>([]);
  protected readonly canBack = computed(() => this.backStack().length > 0);
  protected readonly canFwd = computed(() => this.fwdStack().length > 0);

  private readonly bust = signal(0);

  protected readonly isHome = computed(() => this.current() === HOME);
  protected readonly display = computed(() =>
    this.current() === HOME ? 'about:accueil' : this.current(),
  );
  protected readonly safe = computed<SafeResourceUrl>(() => {
    this.bust();
    return this.san.bypassSecurityTrustResourceUrl(this.current());
  });

  constructor() {
    // Aligne la page courante sur l'URL de départ une seule fois (après binding).
    effect(() => {
      const u = this.url();
      if (!this.synced) {
        this.synced = true;
        this.current.set(u || HOME);
      }
    });
  }

  go(raw: string): void {
    const target = (raw || '').trim();
    if (!target || target === this.current()) return;
    this.backStack.update((s) => [...s, this.current()]);
    this.fwdStack.set([]);
    this.loading.set(true);
    this.current.set(target);
  }

  goHome(): void {
    this.go(HOME);
  }

  goBack(): void {
    const stack = this.backStack();
    if (!stack.length) return;
    const prev = stack[stack.length - 1];
    this.backStack.set(stack.slice(0, -1));
    this.fwdStack.update((s) => [this.current(), ...s]);
    this.loading.set(true);
    this.current.set(prev);
  }

  goFwd(): void {
    const stack = this.fwdStack();
    if (!stack.length) return;
    const next = stack[0];
    this.fwdStack.set(stack.slice(1));
    this.backStack.update((s) => [...s, this.current()]);
    this.loading.set(true);
    this.current.set(next);
  }

  reload(): void {
    if (this.isHome()) return;
    this.loading.set(true);
    this.bust.update((v) => v + 1);
  }
}

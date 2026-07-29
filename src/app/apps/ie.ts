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

/* Internet Explorer d'époque (décor Windows XP) + une iframe qui charge le
   vrai site. Les projets web hébergés s'affichent en live dans l'OS, sans
   qu'on touche à leur code. Le navigateur a sa propre page d'accueil qui
   propose les deux sites, et gère une vraie navigation (précédent / suivant). */

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
        <img class="brand" src="icons/ie.png" alt="" />
      </div>

      <!-- Barre d'outils -->
      <div class="toolbar">
        <button class="nav back" [disabled]="!canBack()" (click)="goBack()" title="Précédente">
          <span class="ar">◄</span> Back
        </button>
        <button class="nav fwd" [disabled]="!canFwd()" (click)="goFwd()" title="Suivante">
          <span class="ar">►</span>
        </button>
        <span class="sep"></span>
        <button class="tb stop" (click)="reload()" title="Arrêter"><span class="x">✕</span></button>
        <button class="tb refresh" (click)="reload()" title="Actualiser"><span class="rf">⟳</span></button>
        <button class="tb home" (click)="goHome()" title="Page de démarrage"><span class="hm">⌂</span></button>
        <span class="sep"></span>
        <button class="tb wide" (click)="goHome()" title="Rechercher"><span class="mag">🔍</span> Search</button>
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
          <!-- Page de démarrage : les deux sites -->
          <div class="startpage">
            <header class="hp-head">
              <img src="icons/ie.png" alt="" />
              <div>
                <h1>Mes projets en ligne</h1>
                <p>Choisissez un site à ouvrir dans Internet Explorer.</p>
              </div>
            </header>
            <ul class="hp-sites">
              @for (s of sites; track s.url) {
                <li>
                  <a (click)="go(s.url)">
                    <span class="hp-title">{{ s.label }}</span>
                    <span class="hp-desc">{{ s.desc }}</span>
                    <span class="hp-url">{{ s.url }}</span>
                  </a>
                </li>
              }
            </ul>
          </div>
        } @else {
          @if (loading()) { <div class="loading">Ouverture de {{ current() }} …</div> }
          <iframe
            [src]="safe()"
            title="Site"
            (load)="loading.set(false)"
            referrerpolicy="no-referrer"
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
    .menubar { display: flex; align-items: center; gap: 14px; padding: 2px 8px; background: #f6f5ee; border-bottom: 1px solid #d6d2c6; }
    .menubar .m { color: #111; }
    .menubar .m:first-letter { text-decoration: underline; }
    .menubar .brand { width: 22px; height: 22px; margin-left: auto; }

    /* Toolbar */
    .toolbar { display: flex; align-items: center; gap: 4px; padding: 4px 6px;
      background: linear-gradient(to bottom, #fbfbf7 0%, #e9e6db 100%); border-bottom: 1px solid #cfcabd; }
    .toolbar .sep { width: 1px; height: 20px; background: #cfcabd; margin: 0 3px; }

    .nav { display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 9px;
      border: 1px solid transparent; border-radius: 3px; background: none; font: inherit; color: #0a0a0a; cursor: pointer; }
    .nav .ar { display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px;
      border-radius: 50%; color: #fff; font-size: 9px;
      background: radial-gradient(circle at 40% 30%, #86e08a, #2f9d3a 70%, #217a2b);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.4); }
    .nav.fwd { padding: 0 7px; }
    .nav:hover:not(:disabled) { border-color: #a9c3ef; background: #eaf1fd; }
    .nav:disabled { color: #9a988f; cursor: default; }
    .nav:disabled .ar { background: radial-gradient(circle at 40% 30%, #cfcfcf, #9c9c9c 70%); }

    .tb { display: inline-flex; align-items: center; gap: 4px; height: 24px; padding: 0 6px;
      border: 1px solid transparent; border-radius: 3px; background: none; font: inherit; color: #0a0a0a; cursor: pointer; }
    .tb:hover { border-color: #a9c3ef; background: #eaf1fd; }
    .tb .x { color: #c62b2b; font-weight: bold; }
    .tb .rf { color: #2f7d34; font-size: 15px; font-weight: bold; }
    .tb .hm { color: #2b6bc6; font-size: 15px; }
    .tb .mag { font-size: 12px; filter: grayscale(.2); }
    .tb .favimg { width: 15px; height: 15px; }

    /* Address */
    .address { display: flex; align-items: center; gap: 6px; padding: 3px 8px;
      background: #f6f5ee; border-top: 1px solid #fff; border-bottom: 1px solid #d6d2c6; }
    .address .lbl { color: #6a6a5f; }
    .address .box { flex: 1; display: flex; align-items: center; gap: 5px; background: #fff;
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

    /* Page de démarrage */
    .startpage { height: 100%; overflow: auto; padding: 22px 26px; background: #fff; color: #1a1a1a; }
    .hp-head { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #e2e0d5; padding-bottom: 14px; margin-bottom: 16px; }
    .hp-head img { width: 40px; height: 40px; }
    .hp-head h1 { margin: 0; font-size: 18px; color: #1c4da1; }
    .hp-head p { margin: 3px 0 0; color: #555; font-size: 12px; }
    .hp-sites { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
    .hp-sites a { display: block; cursor: pointer; border: 1px solid #cdd8ea; border-radius: 6px;
      padding: 12px 14px; text-decoration: none; background: linear-gradient(to bottom, #fbfcff, #eef3fc); transition: box-shadow .15s, border-color .15s; }
    .hp-sites a:hover { border-color: #2f6fed; box-shadow: 0 2px 10px rgba(49,106,197,.25); }
    .hp-title { display: block; font-size: 14px; font-weight: bold; color: #1c4da1; }
    .hp-desc { display: block; color: #333; margin: 3px 0; }
    .hp-url { display: block; color: #2f8d2f; font-size: 11px; }

    /* Status */
    .statusbar { display: flex; justify-content: space-between; align-items: center; padding: 2px 8px;
      background: #f6f5ee; border-top: 1px solid #d6d2c6; color: #444; }
    .statusbar .zone { display: inline-flex; align-items: center; gap: 5px; border-left: 1px solid #cfcabd; padding-left: 10px; }
    .statusbar .zone img { width: 13px; height: 13px; }
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

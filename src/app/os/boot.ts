import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  signal,
} from '@angular/core';

/* ------------------------------------------------------------------
   Séquence de démarrage, en trois temps :
   1. BIOS / POST — écran noir, log de boot personnalisé (OS-WINDOWS-TM)
   2. Chargement — logo "Windows TM" + barre de progression façon XP
   3. Bienvenue — écran d'accueil bleu, puis fondu vers le bureau.
   Cliquer ou appuyer sur une touche passe la séquence.
   ------------------------------------------------------------------ */

type Phase = 'bios' | 'loading' | 'welcome' | 'done';

const BIOS_LINES = [
  'TM BIOS (C) 2026  Thomas Mathis Systems, Inc.',
  'Award Modular BIOS v6.0  —  OS-WINDOWS-TM',
  '',
  'Main Processor  : Développeur Front-End @ 3.9 GHz',
  'Memory Testing  : 65536K  OK',
  '',
  'Detecting drives ...',
  '  Primary Master   : /dev/projets',
  '  Primary Slave    : /dev/competences',
  '',
  'Detecting IDE devices ...',
  '  HTML  CSS  JavaScript  TypeScript  Angular      [ OK ]',
  '  WordPress  PHP  Java  Python  Docker  Figma     [ OK ]',
  '',
  'Initializing portfolio subsystem ............... done',
  'Mounting /home/thomas .......................... done',
  '',
  'Starting OS-WINDOWS-TM .........................',
];

@Component({
  selector: 'app-boot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (phase() !== 'done') {
      <div class="boot" [class.fade]="fading()" (click)="skip()">
        <span class="sr">Démarrage du portfolio de Thomas Mathis</span>

        @switch (phase()) {
          @case ('bios') {
            <pre class="bios">@for (l of shownLines(); track $index) {{{ l }}
}<span class="cursor">_</span></pre>
          }

          @case ('loading') {
            <div class="xp">
              <div class="brand">
                <img class="flag" src="icons/winflag.png" alt="" />
                <div class="wordmark"><span>Windows</span><b>TM</b></div>
              </div>
              <div class="edition">Thomas Mathis Edition</div>
              <div class="well"><div class="blocks"><i></i><i></i><i></i></div></div>
              <div class="copy">Portfolio de Thomas Mathis · 2026</div>
            </div>
          }

          @case ('welcome') {
            <div class="welcome">
              <div class="bar top"></div>
              <div class="hello">
                <img class="ava" src="icons/profile.png" alt="" />
                <div class="txt"><span class="big">Bienvenue</span><span class="sub">Thomas Mathis</span></div>
              </div>
              <div class="bar bottom"></div>
            </div>
          }
        }

        <div class="skip">Cliquer pour passer</div>
      </div>
    }
  `,
  styles: [`
    .boot {
      position: fixed; inset: 0; z-index: 3000000;
      background: #000; color: #d6d6d6;
      display: flex; align-items: center; justify-content: center;
      opacity: 1; transition: opacity 0.5s ease;
      overflow: hidden; cursor: pointer;
    }
    .boot.fade { opacity: 0; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    .skip {
      position: absolute; bottom: 14px; right: 18px;
      font: 11px/1 Tahoma, sans-serif; color: rgba(255,255,255,0.5);
    }

    /* --- BIOS : calé dans le coin haut-gauche, comme un vrai POST --- */
    .bios {
      position: absolute; top: 0; left: 0;
      margin: 0; padding: 18px 22px;
      font-family: 'Lucida Console', 'Courier New', monospace;
      font-size: 14px; line-height: 1.5;
      color: #cfcfcf; white-space: pre-wrap;
    }
    .cursor { animation: blink 1s steps(1) infinite; color: #cfcfcf; }
    @keyframes blink { 50% { opacity: 0; } }

    /* --- Chargement Windows TM --- */
    .xp { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .flag { width: 46px; height: 46px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6)); }
    .wordmark { font-family: 'Franklin Gothic Medium', Tahoma, sans-serif; }
    .wordmark span { font-size: 40px; font-style: italic; color: #f5f5f5; }
    .wordmark b {
      font-size: 40px; font-style: italic; margin-left: 6px;
      background: linear-gradient(90deg, #e84a3a, #4caf3f 33%, #2f6fed 66%, #f4c430);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .edition { color: #cfd6e6; font: italic 14px Tahoma, sans-serif; margin-bottom: 26px; }
    .well {
      width: 150px; height: 16px; border-radius: 9px;
      border: 1px solid #2b4a7a; background: #0a1220;
      overflow: hidden; position: relative;
      box-shadow: inset 0 0 6px rgba(0,0,0,0.8);
    }
    .blocks { position: absolute; top: 2px; left: 0; display: flex; gap: 4px; animation: slide 2s linear infinite; }
    .blocks i {
      width: 12px; height: 10px; border-radius: 2px;
      background: linear-gradient(to bottom, #8fd0ff, #2f6fed);
      box-shadow: 0 0 4px #4d90f0;
    }
    @keyframes slide { 0% { transform: translateX(-56px); } 100% { transform: translateX(150px); } }
    .copy { color: #8b93a5; font: 11px Tahoma, sans-serif; margin-top: 34px; }

    /* --- Bienvenue --- */
    .welcome {
      position: absolute; inset: 0;
      background: linear-gradient(125deg, #5a7ede 0%, #4a6cc8 45%, #3f5ec0 100%);
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .bar { height: 70px; }
    .bar.top { background: linear-gradient(to bottom, rgba(255,255,255,0.28), transparent); border-bottom: 1px solid rgba(255,255,255,0.5); }
    .bar.bottom { background: linear-gradient(to top, rgba(255,255,255,0.28), transparent); border-top: 1px solid rgba(255,255,255,0.5); }
    .hello {
      flex: 1; display: flex; align-items: center; gap: 22px;
      padding-left: 12%;
    }
    .ava { width: 84px; height: 84px; border-radius: 8px; border: 3px solid #fff; object-fit: cover; box-shadow: 0 3px 10px rgba(0,0,0,0.35); }
    .txt { display: flex; flex-direction: column; }
    .big { color: #fff; font: 300 46px 'Segoe UI', Tahoma, sans-serif; text-shadow: 0 2px 6px rgba(0,0,0,0.3); }
    .sub { color: #eaf1ff; font: 16px Tahoma, sans-serif; margin-top: 2px; }

    @media (max-width: 640px) {
      .bios { font-size: 11px; padding: 16px; }
      .wordmark span, .wordmark b { font-size: 30px; }
      .big { font-size: 34px; }
      .hello { padding-left: 8%; gap: 16px; }
      .ava { width: 64px; height: 64px; }
    }
  `],
})
export class Boot implements OnInit, OnDestroy {
  protected readonly phase = signal<Phase>('bios');
  protected readonly fading = signal(false);
  private readonly biosCount = signal(0);
  protected readonly shownLines = computed(() => BIOS_LINES.slice(0, this.biosCount()));

  private readonly reduce =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly timers: ReturnType<typeof setTimeout>[] = [];
  private biosTimer?: ReturnType<typeof setInterval>;

  private readonly onKey = (): void => this.skip();

  ngOnInit(): void {
    window.addEventListener('keydown', this.onKey, { once: true });

    if (this.reduce) {
      this.biosCount.set(BIOS_LINES.length);
      this.after(600, () => this.toLoading());
      return;
    }

    const step = 150;
    this.biosTimer = setInterval(() => {
      const n = this.biosCount() + 1;
      this.biosCount.set(n);
      if (n >= BIOS_LINES.length) {
        clearInterval(this.biosTimer);
        this.after(600, () => this.toLoading());
      }
    }, step);
  }

  ngOnDestroy(): void {
    this.clearAll();
    window.removeEventListener('keydown', this.onKey);
  }

  private toLoading(): void {
    this.phase.set('loading');
    this.after(this.reduce ? 700 : 3000, () => this.toWelcome());
  }
  private toWelcome(): void {
    this.phase.set('welcome');
    this.after(this.reduce ? 600 : 1700, () => this.finish());
  }
  private finish(): void {
    this.fading.set(true);
    this.after(520, () => this.phase.set('done'));
  }

  skip(): void {
    if (this.phase() === 'done' || this.fading()) return;
    this.clearAll();
    this.finish();
  }

  private after(ms: number, fn: () => void): void {
    this.timers.push(setTimeout(fn, ms));
  }
  private clearAll(): void {
    if (this.biosTimer) clearInterval(this.biosTimer);
    for (const t of this.timers) clearTimeout(t);
    this.timers.length = 0;
  }
}

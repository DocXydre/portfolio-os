import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { WindowService } from './core/window.service';
import { Desktop } from './os/desktop';
import { Taskbar } from './os/taskbar';
import { WindowFrame } from './os/window-frame';
import { Screensaver } from './os/screensaver';
import { Boot } from './os/boot';
import { Explorer } from './apps/explorer';
import { ProjectViewer } from './apps/project-viewer';
import { PdfViewer } from './apps/pdf-viewer';
import { PhotoViewer } from './apps/photo-viewer';
import { Ie } from './apps/ie';

/* Racine de l'OS : le bureau, la couche des fenêtres (une boucle sur le
   signal), la taskbar. Le contenu de chaque fenêtre est choisi par @switch. */

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Desktop, Taskbar, WindowFrame, Explorer, ProjectViewer, PdfViewer, PhotoViewer, Ie, Screensaver, Boot],
  template: `
    <div class="desktop" (pointerdown)="onDesktopClick($event)">
      <img class="wallpaper" src="wallpaper/wallpaper.webp" alt="" />
      <app-desktop />

      @for (w of wm.windows(); track w.id) {
        @if (!w.minimized) {
          <app-window-frame [win]="w">
            @switch (w.type) {
              @case ('explorer') {
                <app-explorer [winId]="w.id" [startId]="w.data!.nodeId!" />
              }
              @case ('project') {
                <app-project-viewer [projectId]="w.data!.projectId!" />
              }
              @case ('pdf') {
                <app-pdf-viewer [src]="w.data!.pdfSrc!" />
              }
              @case ('browser') {
                <app-ie [url]="w.data!.url!" />
              }
              @case ('photo') {
                <app-photo-viewer
                  [images]="w.data!.images!"
                  [captions]="w.data!.captions ?? []"
                  [startIndex]="w.data!.imageIndex ?? 0"
                />
              }
              @case ('about') {
                <div class="about">
                  <h1>À propos du portfolio</h1>
                  <p class="role">Un portfolio qui se prend pour un OS</p>
                  <p>
                    Ce site est conçu comme un système d'exploitation inspiré de Windows XP.
                    Le bureau, les fenêtres déplaçables, l'explorateur de fichiers, la visionneuse
                    de photos et l'écran de veille à bulles sont tous des composants faits main.
                  </p>
                  <p>
                    Côté technique : <b>Angular 20</b> en composants standalone et signals, sans
                    framework d'interface — juste du SCSS et <b>XP.css</b> pour retrouver l'esprit
                    Luna. Le tout est déployé automatiquement sur GitHub Pages.
                  </p>
                  <p>
                    J'ai développé ce portfolio avec l'aide de <b>Claude</b>, l'assistant IA
                    d'Anthropic, comme binôme de programmation — de l'architecture jusqu'aux
                    finitions.
                  </p>
                  <p class="hint">Astuce : tout n'est pas visible au premier coup d'œil. Fouinez un peu…</p>
                </div>
              }
              @case ('me') {
                <div class="about me">
                  <div class="me-head">
                    <img class="me-ava" src="icons/profile.png" alt="" />
                    <div>
                      <h1>Thomas Mathis</h1>
                      <p class="role">Développeur polyvalent · étudiant MIAGE · en recherche d'alternance</p>
                    </div>
                  </div>
                  <p>
                    Salut, moi c'est Thomas. Étudiant en MIAGE à l'Université de Lorraine et
                    développeur plutôt touche-à-tout, je cherche une <b>alternance</b> où je pourrai
                    autant coder que résoudre des problèmes concrets.
                  </p>
                  <p>
                    Front, back, un peu des deux : j'ai bossé aussi bien sur des interfaces (Angular,
                    intégration soignée) que côté serveur (WordPress, PHP, Java, Python…). Ce qui me
                    motive, c'est apprendre vite et livrer des choses qui marchent pour de vrai.
                  </p>
                  <p>
                    J'aime comprendre ce qui se passe <b>sous le capot</b>, matériel compris : depuis
                    le collège je monte mes propres PC, et je suis un peu le référent informatique de
                    mon entourage. D'ailleurs, ce portfolio ne tourne pas n'importe où — je l'héberge
                    moi-même sur un vieux PC de 2008 que j'ai remis en route et que j'administre de A à Z.
                  </p>
                  <p>
                    En dehors du code, je suis parti <b>un mois seul au Japon</b>, un pays qui me fait
                    rêver depuis petit, en quête d'aventure. Ça se ressent sûrement dans l'ambiance de
                    ce portfolio.
                  </p>
                  <p>
                    Si mon profil vous parle, écrivez-moi — je serais ravi d'échanger.
                  </p>
                  <p class="contact">
                    <a href="mailto:tmathis.dev&#64;gmail.com">Email</a> ·
                    <a href="https://github.com/DocXydre" target="_blank" rel="noopener">GitHub</a> ·
                    <a href="https://www.linkedin.com/in/mathisthomas/" target="_blank" rel="noopener">LinkedIn</a>
                  </p>
                </div>
              }
            }
          </app-window-frame>
        }
      }

      <app-taskbar />
      <app-screensaver />
      <app-boot />
    </div>
  `,
  styles: [`
    .wallpaper {
      position: absolute; inset: 0;
      width: 100%; height: 100%; object-fit: cover;
      z-index: 0; pointer-events: none; user-select: none;
    }
    .about { padding: 20px 24px; line-height: 1.6; overflow: auto; height: 100%; }
    .about h1 { margin: 0; color: var(--accent-deep); font-size: 20px; }
    .about .role { margin: 2px 0 14px; color: #555; font-weight: bold; }
    .about p { margin: 0 0 12px; }
    .about b { color: var(--accent-deep); }
    .about .hint { color: #777; font-style: italic; font-size: 12px; }
    .about .contact a { color: var(--accent); font-weight: bold; }
    .me-head { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
    .me-ava { width: 60px; height: 60px; border-radius: 8px; border: 2px solid var(--accent); object-fit: cover; }
    .me-head h1 { font-size: 19px; }
  `],
})
export class App {
  protected readonly wm = inject(WindowService);


  onDesktopClick(_ev: PointerEvent): void {
    // Réservé : désélection des icônes du bureau (à venir).
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    const active = this.wm.active();
    if (active) this.wm.close(active.id);
  }
}

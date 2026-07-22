import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { WindowService } from './core/window.service';
import { Desktop } from './os/desktop';
import { Taskbar } from './os/taskbar';
import { WindowFrame } from './os/window-frame';
import { Screensaver } from './os/screensaver';
import { Explorer } from './apps/explorer';
import { ProjectViewer } from './apps/project-viewer';
import { PdfViewer } from './apps/pdf-viewer';
import { PhotoViewer } from './apps/photo-viewer';

/* Racine de l'OS : le bureau, la couche des fenêtres (une boucle sur le
   signal), la taskbar. Le contenu de chaque fenêtre est choisi par @switch. */

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Desktop, Taskbar, WindowFrame, Explorer, ProjectViewer, PdfViewer, PhotoViewer, Screensaver],
  template: `
    <div class="desktop" (pointerdown)="onDesktopClick($event)">
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
              @case ('photo') {
                <app-photo-viewer
                  [images]="w.data!.images!"
                  [captions]="w.data!.captions ?? []"
                  [startIndex]="w.data!.imageIndex ?? 0"
                />
              }
              @case ('about') {
                <div class="about">
                  <h1>Thomas Mathis</h1>
                  <p class="role">Développeur web · MIAGE</p>
                  <p>
                    Bienvenue sur mon portfolio interactif. Chaque dossier du bureau
                    regroupe mes projets par contexte : alternance &amp; stage, projets
                    personnels, et projets académiques.
                  </p>
                  <p>Double-cliquez sur un dossier pour explorer, puis sur un projet pour l'ouvrir.</p>
                  <p class="contact">
                    <a href="mailto:tmathis.dev&#64;gmail.com">tmathis.dev&#64;gmail.com</a> ·
                    <a href="https://github.com/DocXydre" target="_blank" rel="noopener">GitHub</a>
                  </p>
                </div>
              }
            }
          </app-window-frame>
        }
      }

      <app-taskbar />
      <app-screensaver />
    </div>
  `,
  styles: [`
    .about { padding: 20px 24px; line-height: 1.6; }
    .about h1 { margin: 0; color: var(--accent-deep); font-size: 20px; }
    .about .role { margin: 2px 0 14px; color: #555; font-weight: bold; }
    .about p { margin: 0 0 12px; }
    .about .contact a { color: var(--accent); font-weight: bold; }
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

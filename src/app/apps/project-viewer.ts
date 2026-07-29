import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Project } from '../core/models';
import { WindowService } from '../core/window.service';
import { projectById } from '../data/projects';

/* Fiche d'un projet. Structure façon "vue dossier XP" : volet bleu de
   métadonnées à gauche, contenu à droite. Images et lien sont affichés
   seulement s'ils existent — la fiche reste complète sans eux. */

@Component({
  selector: 'app-project-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (project(); as p) {
      <div class="viewer">
        <aside class="meta">
          <div class="meta-head">Détails</div>
          <dl>
            <dt>Contexte</dt><dd>{{ p.context }}</dd>
            <dt>Rôle</dt><dd>{{ p.role }}</dd>
            <dt>Année</dt><dd>{{ p.year }}</dd>
          </dl>
          <div class="meta-head">Stack technique</div>
          <ul class="chips">
            @for (t of p.stack; track t) { <li>{{ t }}</li> }
          </ul>

          @if (p.link || p.repo || p.figma) {
            <div class="meta-head">Liens</div>
            <div class="links">
              @if (p.link) { <a [href]="p.link" target="_blank" rel="noopener">Voir la démo →</a> }
              @if (p.repo) { <a [href]="p.repo" target="_blank" rel="noopener">Code source →</a> }
              @if (p.figma) { <a [href]="p.figma" target="_blank" rel="noopener">Maquette Figma →</a> }
            </div>
          } @else {
            <p class="nolink">Projet non public / usage local</p>
          }
        </aside>

        <section class="content">
          <h1>{{ p.name }}</h1>

          @if (p.demoUrl) {
            <button class="ie-btn" (click)="openDemo(p)">
              <img src="icons/ie.png" alt="" /> Ouvrir la démo dans Internet Explorer
            </button>
          }

          @for (para of p.description; track $index) {
            <p>{{ para }}</p>
          }

          @if (p.images.length) {
            <p class="shots-hint">Cliquez sur une image pour l'agrandir</p>
            <div class="shots">
              @for (src of p.images; track src; let i = $index) {
                <img [src]="src" [alt]="p.name" loading="lazy" (click)="openImage(p, i)" />
              }
            </div>
          }
        </section>
      </div>
    } @else {
      <div class="missing">Projet introuvable.</div>
    }
  `,
  styles: [`
    .viewer { display: flex; height: 100%; background: #fff; }

    .meta {
      width: 200px; flex: 0 0 200px;
      background: linear-gradient(to bottom, #7aa3e8 0%, #4d82df 100%);
      color: #fff; padding: 10px; overflow: auto;
    }
    .meta-head {
      font-weight: bold; margin: 10px 0 5px;
      padding-bottom: 3px; border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    }
    .meta-head:first-child { margin-top: 0; }
    dl { margin: 0; }
    dt { font-weight: bold; opacity: 0.85; margin-top: 6px; }
    dd { margin: 1px 0 0; }

    .chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px; }
    .chips li {
      background: rgba(255, 255, 255, 0.22);
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 3px; padding: 2px 6px; font-size: 11px;
    }
    .links { display: flex; flex-direction: column; gap: 4px; }
    .links a { color: #fff; font-weight: bold; }
    .nolink { opacity: 0.8; font-style: italic; margin-top: 6px; }

    .content { flex: 1; padding: 18px 22px; overflow: auto; line-height: 1.6; color: #1a1a1a; }
    .content h1 { font-size: 17px; color: var(--accent-deep); margin: 0 0 12px; }
    .content p { margin: 0 0 12px; }

    .ie-btn {
      display: inline-flex; align-items: center; gap: 8px;
      margin: 0 0 14px; padding: 7px 12px; font: inherit; font-size: 12px;
      cursor: pointer; border: 1px solid #7f9db9; border-radius: 4px;
      background: linear-gradient(to bottom, #fff, #e8eefb); color: var(--accent-deep); font-weight: bold;
    }
    .ie-btn:hover { background: linear-gradient(to bottom, #fff, #dbe8fb); box-shadow: 0 1px 4px rgba(49,106,197,0.3); }
    .ie-btn img { width: 18px; height: 18px; }

    .shots-hint { color: #667; font-size: 11px; font-style: italic; margin: 6px 0 4px; }
    .shots { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
    .shots img {
      max-width: 100%; border: 1px solid #9db0cf; border-radius: 3px;
      cursor: zoom-in; transition: box-shadow 0.15s, transform 0.15s;
    }
    .shots img:hover { box-shadow: 0 2px 10px rgba(49,106,197,0.4); }

    .missing { padding: 20px; }
  `],
})
export class ProjectViewer {
  readonly projectId = input.required<string>();
  private readonly wm = inject(WindowService);
  protected readonly project = computed<Project | undefined>(() => projectById(this.projectId()));

  openImage(p: Project, index: number): void {
    this.wm.open({
      type: 'photo',
      title: p.name,
      icon: 'photo',
      width: 820,
      height: 620,
      data: {
        images: p.images,
        captions: p.images.map(() => p.name),
        imageIndex: index,
      },
      key: 'photo-viewer',
    });
  }

  openDemo(p: Project): void {
    if (!p.demoUrl) return;
    this.wm.open({
      type: 'browser',
      title: 'Internet Explorer',
      icon: 'ie',
      width: 900,
      height: 640,
      data: { url: p.demoUrl },
      key: `ie:${p.id}`,
    });
  }
}

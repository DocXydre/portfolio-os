import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Project } from '../core/models';
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

          @if (p.link || p.repo) {
            <div class="meta-head">Liens</div>
            <div class="links">
              @if (p.link) { <a [href]="p.link" target="_blank" rel="noopener">Voir la démo →</a> }
              @if (p.repo) { <a [href]="p.repo" target="_blank" rel="noopener">Code source →</a> }
            </div>
          } @else {
            <p class="nolink">Projet non public / usage local</p>
          }
        </aside>

        <section class="content">
          <h1>{{ p.name }}</h1>
          @for (para of p.description; track $index) {
            <p>{{ para }}</p>
          }

          @if (p.images.length) {
            <div class="shots">
              @for (src of p.images; track src) {
                <img [src]="src" [alt]="p.name" loading="lazy" />
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

    .shots { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
    .shots img { max-width: 100%; border: 1px solid #9db0cf; border-radius: 3px; }

    .missing { padding: 20px; }
  `],
})
export class ProjectViewer {
  readonly projectId = input.required<string>();
  protected readonly project = computed<Project | undefined>(() => projectById(this.projectId()));
}

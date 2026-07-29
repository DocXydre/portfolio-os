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
                <app-ie [url]="w.data?.url ?? ''" />
              }
              @case ('photo') {
                <app-photo-viewer
                  [images]="w.data!.images!"
                  [captions]="w.data!.captions ?? []"
                  [startIndex]="w.data!.imageIndex ?? 0"
                />
              }
              @case ('about') {
                <div class="about doc">
                  <h1>À propos du portfolio</h1>
                  <p class="role">Comment ce site est fait</p>

                  <h2>Le concept</h2>
                  <p>
                    Ce portfolio est un système d'exploitation façon <b>Windows XP</b>, entièrement
                    recréé dans le navigateur : bureau, fenêtres déplaçables, barre des tâches, menu
                    Démarrer, explorateur de fichiers, visionneuse de photos, lecteur PDF… tout est
                    fait main. J'en reprends les codes (le thème « Luna ») sans copier au pixel près :
                    c'est une version personnalisée, pas une reproduction exacte.
                  </p>
                  <p>Trois raisons à ce choix :</p>
                  <ul>
                    <li><b>Sortir du portfolio générique.</b> Plutôt qu'une page qui défile, un
                      environnement à explorer — plus marquant et mémorable pour un recruteur.</li>
                    <li><b>Une référence personnelle.</b> Windows XP est le premier ordinateur que
                      j'ai utilisé ; c'est un clin d'œil à mes débuts en informatique.</li>
                    <li><b>L'ergonomie.</b> La métaphore du bureau et des fichiers est simple et
                      intuitive : ranger mes projets en dossiers donne envie de fouiner plutôt que de
                      lire une liste.</li>
                  </ul>

                  <h2>Sous le capot</h2>
                  <p>
                    L'application est développée en <b>Angular 22</b> (composants standalone et
                    <i>signals</i>), sans framework d'interface : juste du SCSS et <b>XP.css</b> pour
                    l'esprit Luna. Les fenêtres, le gestionnaire de fenêtres, le système de fichiers
                    virtuel, l'écran de veille à bulles et la séquence de démarrage sont tous des
                    composants maison.
                  </p>

                  <h2>L'hébergement</h2>
                  <p>
                    Ce site ne tourne pas chez un hébergeur classique : je l'héberge <b>moi-même</b>,
                    sur un PC de 2008 que j'ai remis en route et que j'administre de A à Z. C'est la
                    partie dont je suis le plus fier.
                  </p>
                  <ul>
                    <li><b>La machine :</b> un vieux PC (processeur Intel Atom, 2 Go de RAM) sous
                      <b>Debian</b>, transformé en serveur.</li>
                    <li><b>Serveur web :</b> <b>Caddy</b>, avec HTTPS automatique (certificats Let's
                      Encrypt) et un vrai domaine, <b>thomasmathis.me</b>.</li>
                    <li><b>Réseau :</b> la box étant en CGNAT, j'ai demandé une IPv4 « full-stack »
                      pour être joignable depuis l'extérieur, avec réservation DHCP, pare-feu (ufw) et
                      fail2ban.</li>
                    <li><b>Accès distant sécurisé :</b> <b>Tailscale</b> (VPN) pour administrer et
                      déployer le serveur d'où que je sois, sans exposer SSH sur Internet.</li>
                    <li><b>Déploiement automatique :</b> un simple <code>git push</code> déclenche
                      GitHub Actions, qui compile puis envoie la nouvelle version sur le serveur via
                      Tailscale (avec un miroir sur GitHub Pages).</li>
                    <li><b>Une contrainte assumée :</b> le CPU de 2008 ne fait pas tourner les
                      runtimes récents (Bun, Node moderne). Certains projets dynamiques sont donc
                      pré-rendus en statique pour rester hébergeables sur cette machine.</li>
                  </ul>

                  <h2>Un binôme IA</h2>
                  <p>
                    J'ai développé ce portfolio avec l'aide de <b>Claude</b> (l'assistant IA
                    d'Anthropic) comme binôme de programmation, de l'architecture jusqu'aux finitions.
                  </p>

                  <p class="hint">Astuce : tout n'est pas visible au premier coup d'œil. Fouinez un peu…</p>
                </div>
              }
              @case ('me') {
                <div class="about me">
                  <div class="me-head">
                    <div>
                      <h1>Thomas Mathis</h1>
                      <p class="role">Développeur polyvalent · étudiant MIAGE · en recherche d'alternance</p>
                    </div>
                  </div>

                  <div class="me-layout">
                    <figure class="me-photo">
                      <img src="me-portrait.webp" alt="Thomas Mathis à Montmartre, Paris" />
                    </figure>

                    <div class="me-text">
                      <p>
                        Bonjour, et bienvenue sur mon profil ! Étudiant en MIAGE à l'Université de
                        Lorraine et développeur polyvalent, je suis à la recherche d'une <b>alternance</b>
                        où je pourrai autant coder que participer à la conduite d'un projet.
                      </p>
                      <p>
                        Je suis à l'aise aussi bien sur le front (Angular, intégration soignée) que côté
                        serveur (WordPress, PHP, Java, Python…), avec une exigence : livrer des choses qui
                        marchent pour de vrai. J'ai aussi une vraie fibre <b>gestion de projet</b> — j'ai
                        piloté une équipe en méthode <b>Scrum</b> (sprints, répartition des tâches sur
                        <b>Jira</b>) — et cette double casquette technique / organisation me tient à cœur.
                      </p>
                      <p>
                        J'aime comprendre ce qui se passe <b>sous le capot</b> : de l'assembleur (le
                        langage BETA) à l'architecture des ordinateurs, en passant par les dernières
                        nouveautés techno que je suis de près. Depuis le collège, je monte mes propres PC
                        et je suis un peu le référent informatique de mon entourage. D'ailleurs, ce
                        portfolio ne tourne pas n'importe où : je l'héberge moi-même sur un vieux PC de
                        2008 que j'ai remis en route et que j'administre de A à Z.
                      </p>
                      <p>
                        En dehors du code, je suis avant tout <b>très curieux</b> : j'aime apprendre,
                        découvrir, voir des films — tout ce qui nourrit ma culture. C'est cette curiosité
                        qui me pousse à voyager, et qui m'a mené <b>un mois seul au Japon</b>, en quête
                        d'aventure et d'un pays qui me fait rêver depuis petit.
                      </p>
                      <p>
                        Si mon profil vous parle, n'hésitez pas à me contacter — je serais ravi d'échanger.
                      </p>
                    </div>
                  </div>

                  <p class="contact">
                    <a href="mailto:tmathis.dev&#64;gmail.com"><img class="logo" src="icons/mail.svg" alt="" /> Email</a>
                    <a href="https://github.com/DocXydre" target="_blank" rel="noopener"><img class="logo" src="icons/github.svg" alt="" /> GitHub</a>
                    <a href="https://www.linkedin.com/in/mathisthomas/" target="_blank" rel="noopener"><img class="logo" src="icons/linkedin.svg" alt="" /> LinkedIn</a>
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

    /* Fiche documentaire à sections (À propos du portfolio) */
    .about.doc h2 {
      font-size: 14px; color: var(--accent-deep); margin: 18px 0 6px;
      padding-bottom: 3px; border-bottom: 1px solid #dbe2ef;
    }
    .about.doc ul { margin: 4px 0 12px; padding-left: 20px; }
    .about.doc li { margin: 0 0 6px; }
    .about.doc code {
      font-family: Consolas, "Courier New", monospace; font-size: 12px;
      background: #eef1f7; border: 1px solid #dbe0ea; border-radius: 3px; padding: 0 4px;
    }

    .me-head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
    .me-ava { width: 60px; height: 60px; border-radius: 8px; border: 2px solid var(--accent); object-fit: cover; }
    .me-head h1 { font-size: 19px; }

    /* Disposition : grande photo à gauche, texte à droite */
    .me-layout { display: flex; gap: 18px; align-items: flex-start; }
    .me-photo { margin: 0; flex: 0 0 230px; }
    .me-photo img {
      width: 100%; border-radius: 8px; display: block;
      border: 1px solid #b9c6de; box-shadow: 0 3px 12px rgba(20,40,80,0.22);
    }
    .me-text { flex: 1; min-width: 0; }
    .me-text p:last-child { margin-bottom: 0; }

    .about .contact { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 16px;
      padding-top: 12px; border-top: 1px solid #e2e6ef; }
    .about .contact a { display: inline-flex; align-items: center; gap: 7px;
      color: var(--accent); font-weight: bold; text-decoration: none; }
    .about .contact a:hover { text-decoration: underline; }
    .about .contact .logo { width: 18px; height: 18px; }

    /* Écrans étroits : la photo repasse au-dessus du texte */
    @media (max-width: 560px) {
      .me-layout { flex-direction: column; }
      .me-photo { flex: none; width: 60%; max-width: 240px; align-self: center; }
    }
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

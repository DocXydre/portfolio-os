import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FolderId } from '../core/models';
import { WindowService } from '../core/window.service';
import { categoryNodeId } from '../data/filesystem';
import { FOLDERS } from '../data/projects';

/* Menu Démarrer deux colonnes, bandeau utilisateur en haut. */

@Component({
  selector: 'app-start-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="menu" (pointerdown)="$event.stopPropagation()">
      <header class="user">
        <img class="avatar" src="icons/profile.png" alt="Thomas Mathis" />
        <span class="name">Thomas Mathis</span>
      </header>

      <div class="cols">
        <ul class="col left">
          <li><button (click)="about()">
            <img src="icons/about.png" alt="" />
            <span><b>À propos de moi</b><small>CV & parcours</small></span>
          </button></li>
          <li class="sep"></li>
          @for (f of folders; track f.id) {
            <li><button (click)="folder(f)">
              <img [src]="'icons/' + f.icon + '.png'" alt="" />
              <span>{{ f.name }}</span>
            </button></li>
          }
        </ul>
        <ul class="col right">
          <li><a href="mailto:tmathis.dev@gmail.com">Me contacter</a></li>
          <li><a href="https://github.com/DocXydre" target="_blank" rel="noopener">GitHub</a></li>
        </ul>
      </div>

      <footer class="foot">
        <button class="logoff" (click)="close.emit()">Fermer le menu</button>
      </footer>
    </div>
  `,
  styles: [`
    .menu {
      position: fixed; left: 2px; bottom: var(--taskbar-h);
      z-index: 99999;
      width: 340px;
      border: 1px solid #0b3aa8; border-bottom: none;
      border-radius: 8px 8px 0 0; overflow: hidden;
      box-shadow: 3px -3px 16px rgba(0, 0, 0, 0.4);
      font-size: 12px;
    }
    .user {
      display: flex; align-items: center; gap: 8px;
      background: var(--title-grad); color: #fff;
      padding: 8px 10px; font-weight: bold;
    }
    .avatar {
      width: 40px; height: 40px; border-radius: 4px;
      border: 2px solid #fff; object-fit: cover;
    }
    .cols { display: flex; background: #fff; }
    .col { list-style: none; margin: 0; padding: 6px; }
    .left { flex: 1; border-right: 1px solid #d3e0f5; }
    .right { width: 128px; background: linear-gradient(to bottom, #e5edfb, #d5e2f7); }
    .col li { margin: 0; }
    .sep { border-top: 1px solid #d3e0f5; margin: 5px 2px; }

    .col button, .col a {
      display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
      background: none; border: none; border-radius: 3px;
      padding: 6px 8px; font: inherit; color: #0a0a0a;
      cursor: pointer; text-decoration: none;
    }
    .col button img { width: 24px; height: 24px; flex: 0 0 auto; }
    .col b { display: block; }
    .col small { color: #555; }
    .col button:hover, .col a:hover { background: #2f6fed; color: #fff; }
    .col button:hover small { color: #e8f0ff; }

    .foot {
      background: var(--title-grad);
      padding: 5px 8px; display: flex; justify-content: flex-end;
    }
    .logoff {
      background: none; border: none; color: #fff; font: inherit;
      cursor: pointer; padding: 3px 6px; border-radius: 3px;
    }
    .logoff:hover { background: rgba(255, 255, 255, 0.2); }
  `],
})
export class StartMenu {
  readonly close = output<void>();
  private readonly wm = inject(WindowService);
  protected readonly folders = FOLDERS;

  folder(f: { id: FolderId; name: string; icon: string }): void {
    this.wm.open({ type: 'explorer', title: f.name, icon: 'folder', width: 720, height: 480, data: { nodeId: categoryNodeId(f.id) }, key: 'explorer' });
    this.close.emit();
  }
  about(): void {
    this.wm.open({ type: 'about', title: 'À propos de moi', icon: 'about', width: 480, height: 420, key: 'about' });
    this.close.emit();
  }
}

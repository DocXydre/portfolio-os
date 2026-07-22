import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FolderId } from '../core/models';
import { WindowService } from '../core/window.service';
import { COMPUTER_ID, CV_FILE, MY_PICTURES_ID, categoryNodeId } from '../data/filesystem';
import { FOLDERS } from '../data/projects';

/* Icônes du bureau : les 3 dossiers de catégories, Poste de travail, et
   À propos. Tout ouvre le même explorateur, positionné au bon endroit. */

@Component({
  selector: 'app-desktop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="icons">
      <button class="icon" (dblclick)="openComputer()">
        <img class="glyph" src="icons/computer.png" alt="" />
        <span class="cap">Poste de travail</span>
      </button>

      @for (f of folders; track f.id) {
        <button class="icon" (dblclick)="openFolder(f.id)">
          <img class="glyph" src="icons/folder.png" alt="" />
          <span class="cap">{{ f.name }}</span>
        </button>
      }

      <button class="icon" (dblclick)="openImages()">
        <img class="glyph" src="icons/folder-pics.png" alt="" />
        <span class="cap">Mes images</span>
      </button>

      <button class="icon" (dblclick)="openCv()">
        <img class="glyph" src="icons/pdf.png" alt="" />
        <span class="cap">CV.pdf</span>
      </button>

      <button class="icon" (dblclick)="openAbout()">
        <img class="glyph" src="icons/about.png" alt="" />
        <span class="cap">À propos de moi</span>
      </button>
    </div>
  `,
  styles: [`
    .icons {
      position: absolute; top: 18px; left: 16px;
      display: flex; flex-direction: column; flex-wrap: wrap;
      gap: 18px; max-height: calc(100vh - var(--taskbar-h) - 36px);
    }
    .icon {
      width: 104px;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      background: none; border: 1px solid transparent; border-radius: 3px;
      padding: 8px 4px; cursor: pointer; font: inherit;
    }
    .icon:hover { background: rgba(0, 60, 160, 0.28); border-color: rgba(255, 255, 255, 0.25); }
    .icon:focus-visible { outline: 1px dotted #fff; background: rgba(0, 60, 160, 0.4); }

    .glyph {
      width: 52px; height: 52px;
      image-rendering: -webkit-optimize-contrast;
      filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6));
    }
    .cap {
      color: #fff; font-size: 12px; text-align: center; line-height: 1.3;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95);
      word-break: break-word;
    }
  `],
})
export class Desktop {
  private readonly wm = inject(WindowService);
  protected readonly folders = FOLDERS;

  private openExplorer(nodeId: string, title: string, icon: string): void {
    this.wm.open({
      type: 'explorer',
      title,
      icon,
      width: 720,
      height: 480,
      data: { nodeId },
      key: 'explorer',
    });
  }

  openComputer(): void {
    this.openExplorer(COMPUTER_ID, 'Poste de travail', 'computer');
  }
  openImages(): void {
    this.openExplorer(MY_PICTURES_ID, 'Mes images', 'folder-pics');
  }
  openFolder(id: FolderId): void {
    const f = FOLDERS.find((x) => x.id === id)!;
    this.openExplorer(categoryNodeId(id), f.name, 'folder');
  }
  openCv(): void {
    this.wm.open({
      type: 'pdf', title: CV_FILE.name, icon: 'pdf',
      width: 640, height: 640, data: { pdfSrc: CV_FILE.pdfSrc }, key: 'pdf:cv',
    });
  }
  openAbout(): void {
    this.wm.open({ type: 'about', title: 'À propos de moi', icon: 'about', width: 480, height: 420, key: 'about' });
  }
}

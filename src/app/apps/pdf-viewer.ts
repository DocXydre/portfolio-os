import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/* Affiche un PDF (le CV) dans la fenêtre, avec un lien de téléchargement.
   Le PDF est un asset same-origin ; on marque l'URL comme sûre pour l'iframe. */

@Component({
  selector: 'app-pdf-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pdf">
      <div class="bar">
        <span class="name">{{ fileName() }}</span>
        <a class="dl" [href]="src()" download>Télécharger</a>
      </div>
      <iframe class="frame" [src]="safe()" title="Aperçu du PDF"></iframe>
    </div>
  `,
  styles: [`
    .pdf { display: flex; flex-direction: column; height: 100%; background: #525659; }
    .bar {
      display: flex; align-items: center; gap: 10px;
      padding: 5px 8px;
      background: linear-gradient(to bottom, #f4f2ee, #d8d4cc);
      border-bottom: 1px solid #b7b2a6;
    }
    .name { flex: 1; font-size: 12px; color: #1a1a1a; }
    .dl {
      font-size: 11px; color: #103a8e; text-decoration: none;
      padding: 3px 10px; border: 1px solid #a9a496; border-radius: 3px;
      background: linear-gradient(to bottom, #fff, #eceae3);
    }
    .dl:hover { text-decoration: underline; }
    .frame { flex: 1; width: 100%; border: none; }
  `],
})
export class PdfViewer {
  readonly src = input.required<string>();
  private readonly san = inject(DomSanitizer);

  protected readonly safe = computed<SafeResourceUrl>(() =>
    this.san.bypassSecurityTrustResourceUrl(this.src()),
  );
  protected readonly fileName = computed(() => this.src().split('/').pop() ?? 'Document.pdf');
}

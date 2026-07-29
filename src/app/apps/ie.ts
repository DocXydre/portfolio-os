import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/* Internet Explorer : décor d'époque + une iframe qui charge le vrai site.
   Les projets web hébergés s'affichent ainsi en live dans l'OS, sans qu'on
   touche à leur code (c'est le serveur qui autorise l'affichage en iframe). */

@Component({
  selector: 'app-ie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ie">
      <!-- Barre de menus factice -->
      <div class="menubar">
        <span>Fichier</span><span>Edition</span><span>Affichage</span>
        <span>Favoris</span><span>Outils</span><span>?</span>
        <img class="brand" src="icons/ie.png" alt="" />
      </div>

      <!-- Barre d'outils -->
      <div class="toolbar">
        <button class="tb" title="Précédente" disabled>‹</button>
        <button class="tb" title="Suivante" disabled>›</button>
        <button class="tb" title="Actualiser" (click)="reload()">⟳</button>
        <button class="tb" title="Ouvrir dans un onglet" (click)="openExternal()">⤢</button>
      </div>

      <!-- Barre d'adresse -->
      <div class="address">
        <span class="lbl">Adresse</span>
        <div class="box"><img src="icons/ie.png" alt="" /><span class="url">{{ url() }}</span></div>
        <button class="go" (click)="reload()">Entrée</button>
      </div>

      <!-- Le vrai site -->
      <div class="viewport">
        @if (loading()) { <div class="loading">Chargement de {{ url() }} …</div> }
        <iframe
          [src]="safe()"
          title="Site"
          (load)="loading.set(false)"
          referrerpolicy="no-referrer"
        ></iframe>
      </div>

      <!-- Barre d'état -->
      <div class="statusbar"><span>{{ loading() ? 'Ouverture…' : 'Terminé' }}</span><span class="zone">Internet</span></div>
    </div>
  `,
  styles: [`
    .ie { display: flex; flex-direction: column; height: 100%; background: #fff; font-size: 12px; }

    .menubar { display: flex; align-items: center; gap: 12px; padding: 2px 8px; background: #f1efe8; border-bottom: 1px solid #d6d2c6; }
    .menubar span { color: #222; }
    .menubar .brand { width: 22px; height: 22px; margin-left: auto; }

    .toolbar { display: flex; gap: 3px; padding: 3px 6px; background: linear-gradient(to bottom, #fdfdfd, #e9e6dd); border-bottom: 1px solid #cfcabd; }
    .tb { width: 26px; height: 22px; font-size: 15px; line-height: 1; border: 1px solid transparent; background: none; border-radius: 3px; cursor: pointer; }
    .tb:hover:not(:disabled) { border-color: #a9c3ef; background: #eaf1fd; }
    .tb:disabled { opacity: 0.4; cursor: default; }

    .address { display: flex; align-items: center; gap: 6px; padding: 3px 8px; background: #f1efe8; border-bottom: 1px solid #d6d2c6; }
    .address .lbl { color: #555; }
    .address .box { flex: 1; display: flex; align-items: center; gap: 5px; background: #fff; border: 1px solid #7f9db9; border-radius: 2px; padding: 2px 6px; overflow: hidden; }
    .address .box img { width: 16px; height: 16px; flex: 0 0 auto; }
    .address .url { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .address .go { padding: 3px 10px; border: 1px solid #a9a496; border-radius: 3px; background: linear-gradient(to bottom, #fff, #eceae3); cursor: pointer; }

    .viewport { position: relative; flex: 1; overflow: hidden; background: #fff; }
    .viewport iframe { width: 100%; height: 100%; border: none; display: block; }
    .loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #555; background: #fff; z-index: 1; }

    .statusbar { display: flex; justify-content: space-between; padding: 2px 8px; background: #f1efe8; border-top: 1px solid #d6d2c6; color: #444; }
    .statusbar .zone { border-left: 1px solid #cfcabd; padding-left: 10px; }
  `],
})
export class Ie {
  readonly url = input.required<string>();
  private readonly san = inject(DomSanitizer);

  protected readonly loading = signal(true);
  private readonly bust = signal(0);
  protected readonly safe = computed<SafeResourceUrl>(() => {
    this.bust(); // dépend du compteur pour forcer le rechargement
    return this.san.bypassSecurityTrustResourceUrl(this.url());
  });

  reload(): void {
    this.loading.set(true);
    this.bust.update((v) => v + 1);
  }
  openExternal(): void {
    window.open(this.url(), '_blank', 'noopener');
  }
}

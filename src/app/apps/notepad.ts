import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DOCS } from '../data/docs';

/* Bloc-notes : affiche un document texte en lecture seule, façon Notepad XP. */

@Component({
  selector: 'app-notepad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<pre class="pad">{{ body() }}</pre>`,
  styles: [`
    .pad {
      margin: 0;
      height: 100%;
      padding: 10px 12px;
      background: #fff;
      font-family: 'Lucida Console', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      color: #000;
      white-space: pre-wrap;
      word-break: break-word;
      overflow: auto;
    }
  `],
})
export class Notepad {
  readonly docId = input.required<string>();
  protected readonly body = computed(() => DOCS[this.docId()]?.body ?? '(document introuvable)');
}

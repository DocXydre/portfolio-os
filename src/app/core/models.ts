/* Modèles partagés de l'OS. */

export type FolderId = 'stage' | 'perso' | 'ecole';

export type WindowType = 'explorer' | 'project' | 'about' | 'pdf' | 'photo';

/** Charge utile d'une fenêtre selon son type. */
export interface WindowData {
  /** explorer : nœud du système de fichiers à afficher au départ. */
  nodeId?: string;
  /** project : id du projet. */
  projectId?: string;
  /** pdf : chemin du document. */
  pdfSrc?: string;
  /** photo : galerie et position courante. */
  images?: string[];
  captions?: string[];
  imageIndex?: number;
}

/** Une fenêtre ouverte à l'écran. Tout l'état visuel tient ici. */
export interface AppWindow {
  id: string;
  type: WindowType;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  z: number;
  data?: WindowData;
}

/* ------------------------------------------------------------------
   Système de fichiers virtuel.
   ------------------------------------------------------------------ */

/** Un fichier : sait dans quelle fenêtre il s'ouvre. */
export interface FsFile {
  kind: 'file';
  id: string;
  name: string;
  icon: string;
  open: 'project' | 'photo' | 'pdf' | 'about';
  projectId?: string;
  pdfSrc?: string;
  imageSrc?: string;
  caption?: string;
}

export interface FsFolder {
  kind: 'folder';
  id: string;
  name: string;
  icon: string;
  children: FsNode[];
}

export type FsNode = FsFolder | FsFile;

/** Un dossier du bureau / de l'explorateur. */
export interface Folder {
  id: FolderId;
  name: string;
  icon: string;
}

/** Un projet du portfolio. images et link sont optionnels : la fiche
 *  doit rester présentable sans eux (cas fréquent : code non public). */
export interface Project {
  id: string;
  name: string;
  folder: FolderId;
  year: string;
  role: string;
  context: string;
  stack: string[];
  /** Résumé court affiché dans l'explorateur (une phrase). */
  summary: string;
  /** Corps de la fiche, un paragraphe par entrée. */
  description: string[];
  /** Captures d'écran (chemins dans /public). Vide si aucune. */
  images: string[];
  /** Démo en ligne, si elle existe. */
  link?: string;
  /** Repo public, si il existe. */
  repo?: string;
}

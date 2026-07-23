import { FsFile, FsFolder, FsNode } from '../core/models';
import { FOLDERS, PROJECTS, projectsInFolder } from './projects';

/* ------------------------------------------------------------------
   L'arbre du système de fichiers virtuel, orienté contenu.
   Construit à partir des projets, des photos et des documents.
   ------------------------------------------------------------------ */

interface Photo {
  id: string;
  name: string;
  src: string;
  caption: string;
}

// Galerie générée : dépose une photo dans public/photos/ nommée photo-N.jpg
// et ajuste PHOTO_COUNT. Rien d'autre à toucher.
const PHOTO_COUNT = 34;
const PHOTOS: Photo[] = Array.from({ length: PHOTO_COUNT }, (_, i) => ({
  id: `ph-${i + 1}`,
  name: `photo-${i + 1}.jpg`,
  src: `photos/photo-${i + 1}.jpg`,
  caption: '',
}));

const photoFile = (p: Photo): FsFile => ({
  kind: 'file',
  id: p.id,
  name: p.name,
  icon: 'photo',
  open: 'photo',
  imageSrc: p.src,
  caption: p.caption,
});

// scope garantit un id de nœud unique quand un projet apparaît à deux endroits
// (dans "Mes documents" et dans sa catégorie). projectId reste l'id réel.
const projectFile = (id: string, name: string, scope: string): FsFile => ({
  kind: 'file',
  id: `${scope}-proj-${id}`,
  name: `${name}.txt`,
  icon: 'text',
  open: 'project',
  projectId: id,
});

/** Le CV, désormais posé sur le bureau (voir desktop.ts). */
export const CV_FILE: FsFile = {
  kind: 'file',
  id: 'cv',
  name: 'CV.pdf',
  icon: 'pdf',
  open: 'pdf',
  pdfSrc: 'docs/CV_Thomas_Mathis.pdf',
};

/** Ids des nœuds notables (raccourcis "Autres emplacements", sections). */
export const DESKTOP_ID = 'desktop';
export const COMPUTER_ID = 'computer';
export const MY_DOCS_ID = 'my-docs';
export const MY_PICTURES_ID = 'my-pictures';

/** Id du nœud d'une catégorie de projets, à partir de son FolderId. */
export const categoryNodeId = (folderId: string): string => `cat-${folderId}`;

export const FS_ROOT: FsFolder = {
  kind: 'folder',
  id: 'desktop',
  name: 'Bureau',
  icon: 'folder',
  children: [
    {
      kind: 'folder',
      id: 'my-docs',
      name: 'Mes documents',
      icon: 'folder-docs',
      children: PROJECTS.map((p) => projectFile(p.id, p.name, 'docs')),
    },
    {
      kind: 'folder',
      id: 'my-pictures',
      name: 'Mes images',
      icon: 'folder-pics',
      children: PHOTOS.map(photoFile),
    },
    {
      kind: 'folder',
      id: COMPUTER_ID,
      name: 'Poste de travail',
      icon: 'computer',
      children: FOLDERS.map((f) => ({
        kind: 'folder' as const,
        id: categoryNodeId(f.id),
        name: f.name,
        icon: 'folder',
        children: projectsInFolder(f.id).map((p) => projectFile(p.id, p.name, `cat-${f.id}`)),
      })),
    },
  ],
};

/* --- Index pour retrouver un nœud et son parent en O(1) --- */

const byId = new Map<string, FsNode>();
const parentOf = new Map<string, string | null>();

(function index(node: FsNode, parent: string | null): void {
  byId.set(node.id, node);
  parentOf.set(node.id, parent);
  if (node.kind === 'folder') for (const c of node.children) index(c, node.id);
})(FS_ROOT, null);

export const getNode = (id: string): FsNode | undefined => byId.get(id);
export const getParentId = (id: string): string | null => parentOf.get(id) ?? null;

/** Chemin de la racine jusqu'au nœud (pour le fil d'Ariane). */
export function trail(id: string): FsFolder[] {
  const out: FsFolder[] = [];
  let cur: string | null = id;
  while (cur) {
    const n = byId.get(cur);
    if (n && n.kind === 'folder') out.unshift(n);
    cur = parentOf.get(cur) ?? null;
  }
  return out;
}

export const isFolder = (n: FsNode | undefined): n is FsFolder => !!n && n.kind === 'folder';

/* Documents texte ouverts dans le Notepad (dossier "Mes documents"). */

export interface TextDoc {
  title: string;
  body: string;
}

export const DOCS: Record<string, TextDoc> = {
  cv: {
    title: 'CV.txt',
    body: `THOMAS MATHIS
Développeur web — étudiant MIAGE

————————————————————————————————
PARCOURS
————————————————————————————————
• Licence MIASHS, parcours MIAGE — Université de Lorraine
• Alternance / stage en développement web — Alchimy Communication

————————————————————————————————
COMPÉTENCES
————————————————————————————————
Front-end   : HTML, CSS/SCSS, JavaScript, TypeScript, Angular
Back / CMS   : WordPress (ACF, Timber/Twig), PHP, Hono, Bun
Langages     : Java, Python, TypeScript
Outils       : Git, Jira, Docker, Figma, méthode Agile (Scrum)

————————————————————————————————
CONTACT
————————————————————————————————
Email  : tmathis.dev@gmail.com
GitHub : github.com/DocXydre

Astuce : ouvrez le dossier "Poste de travail" sur le bureau
pour parcourir mes projets classés par contexte.`,
  },
  contact: {
    title: 'Contact.txt',
    body: `ME CONTACTER
————————————————————————————————

Email    : tmathis.dev@gmail.com
GitHub   : https://github.com/DocXydre

N'hésitez pas à me joindre pour toute opportunité
ou pour échanger sur un projet.`,
  },
};

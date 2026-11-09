/* Documents texte ouverts dans le Notepad (dossier "Mes documents"). */

export interface TextDoc {
  title: string;
  body: string;
}

export const DOCS: Record<string, TextDoc> = {
  cv: {
    title: 'CV.txt',
    body: `THOMAS MATHIS
Étudiant en Master 1 MIAGE

————————————————————————————————
PARCOURS
————————————————————————————————
• Master 1 MIAGE, IDMC, Université de Lorraine (diplôme prévu en 2028)
• Licence MIASHS, parcours MIAGE (2026)
• Stage en développement web, Alchimy Communication
• McDonald's (2022 à 2026)

Recherche : stage à partir de juin 2027, en gestion et
conception de projet, idéalement autour des nouveaux outils IA.

————————————————————————————————
COMPÉTENCES
————————————————————————————————
Front-end   : HTML, CSS/SCSS, JavaScript, TypeScript, Angular
Back / CMS   : WordPress (ACF, Timber/Twig), PHP, Hono, Bun
Langages     : Java, Python, TypeScript
Mobile       : Swift, SwiftUI
IA           : API Claude et appel d'outils, serveur MCP, IA locale (Ollama)
Outils       : Git, GitLab CI/CD, Jira, Docker, Figma, méthode Agile (Scrum)

————————————————————————————————
CONTACT
————————————————————————————————
Email    : tmathis.dev@gmail.com
GitHub   : github.com/DocXydre
LinkedIn : linkedin.com/in/mathisthomas

Astuce : ouvrez le dossier "Poste de travail" sur le bureau
pour parcourir mes projets classés par contexte.`,
  },
  contact: {
    title: 'Contact.txt',
    body: `ME CONTACTER
————————————————————————————————

Email    : tmathis.dev@gmail.com
GitHub   : https://github.com/DocXydre
LinkedIn : https://www.linkedin.com/in/mathisthomas/

N'hésitez pas à me joindre pour toute opportunité
ou pour échanger sur un projet.`,
  },
};

// ==========================================================================
// CARET-GC — script.js
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  loadAdminData();
  populateHeroMatiereFilters();
  initHeroSearch();
  initHeroBackgroundRotation();
  initLibraryFilters();
  applyLibraryFilters();
  initRouter();
  initDocumentation();
  renderActualites();
  renderPromotionCardsHome();
  initAdmin();
  initCarousels();
});

/* ==========================================================================
   1. Menu mobile
   ========================================================================== */
function initMobileNav(){
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   1bis. Fond photo plein écran du hero (alternance douce entre 2 photos)
   ========================================================================== */
function initHeroBackgroundRotation(){
  const slides = document.querySelectorAll('.hero-bg-slide');
  if (slides.length < 2) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }, 6000);
}

/* ==========================================================================
   1ter. Carrousels horizontaux (Nos activités / Actualités — aperçu)
   Les flèches n'apparaissent que si le contenu dépasse réellement la
   largeur visible — pas de flèche inutile quand tout tient déjà à l'écran.
   ========================================================================== */
function initCarousels(){
  document.querySelectorAll('[data-carousel]').forEach(setupCarousel);
}

function setupCarousel(carousel){
  const track = carousel.querySelector('[data-carousel-track]');
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  if (!track || !prevBtn || !nextBtn) return;

  function updateArrows(){
    const canScroll = track.scrollWidth > track.clientWidth + 4;
    prevBtn.hidden = !canScroll || track.scrollLeft <= 4;
    nextBtn.hidden = !canScroll || track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
  }

  function scrollByOneCard(direction){
    const firstCard = track.querySelector(':scope > *');
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const amount = firstCard ? firstCard.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  prevBtn.addEventListener('click', () => scrollByOneCard(-1));
  nextBtn.addEventListener('click', () => scrollByOneCard(1));
  track.addEventListener('scroll', updateArrows);
  window.addEventListener('resize', updateArrows);

  updateArrows();
  // Filet de sécurité si le contenu est injecté juste après (ex. Actualités).
  setTimeout(updateArrows, 300);
}

/* ==========================================================================
   2. Routeur de vues
   ========================================================================== */
function initRouter(){
  document.querySelectorAll('[data-view-link]').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showView(link.dataset.viewLink);
    });
  });

  document.querySelectorAll('[data-promo-open-footer]').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showView('documentation');
      showDocMatieres(link.dataset.promoOpenFooter);
    });
  });
}

function showView(viewName){
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('is-active', v.dataset.view === viewName);
  });
  document.querySelectorAll('[data-view-link]').forEach(link => {
    link.classList.toggle('current', link.dataset.viewLink === viewName);
  });

  if (viewName === 'documentation'){
    showDocStep('promotions');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   3. Données officielles — maquette pédagogique EPAC (GC3 à GC5)
   ========================================================================== */
const PROMOTIONS_DATA = {
  GC3: { nom: 'GC3', annee: '3ème année', effectif: '70+', semestres: ['S5', 'S6'], photo: 'photogc3-2025-2026.jpg' },
  GC4: { nom: 'GC4', annee: '4ème année', effectif: '70+', semestres: ['S7', 'S8'], photo: 'photogc4-2025-2026.jpg' },
  GC5: { nom: 'GC5', annee: '5ème année', effectif: '70+', semestres: ['S9', 'S10'], photo: 'photogc5-2025-2026.jpg' }
};

// Matières par promotion et semestre, groupées par type d'unité :
// ucf = Unités de Connaissances Fondamentales
// uds = Unités de Découverte ou de Spécialité
// um  = Unités de Méthodologie
const MATIERES_DATA = {
  GC3: {
    S5: {
      ucf: [
        { code: 'MMC 1501', nom: 'Mécanique des Milieux Continus', description: 'Calcul tensoriel ; Introduction à la Mécanique des Milieux Continus', credits: 5, heures: 125, tags: ['structures', 'fondamental'] },
        { code: 'RMR 1502', nom: 'Résistance des Matériaux Renforcés', description: 'Résistance des matériaux renforcés', credits: 4, heures: 100, tags: ['structures', 'fondamental'] }
      ],
      uds: [
        { code: 'MAC 1503', nom: 'Matériaux de construction', description: 'Matériaux de construction', credits: 4, heures: 100, tags: ['matériaux', 'spécialité'] },
        { code: 'TOG 1504', nom: 'Topométrie générale', description: 'Topométrie générale', credits: 4, heures: 100, tags: ['topométrie', 'spécialité'] }
      ],
      um: [
        { code: 'MFA 1505', nom: 'Mécanique des fluides Appliquées et Atelier de dessin et CAO-DAO', description: 'Mécanique des fluides Appliquées ; Atelier de dessin et CAO-DAO', credits: 5, heures: 125, tags: ['méthodologie'] },
        { code: 'PGM 1506', nom: 'Procédés généraux de construction et Matériels de Construction', description: 'Procédés généraux de construction ; Matériels de construction', credits: 4, heures: 100, tags: ['méthodologie'] },
        { code: 'EGE 1507', nom: 'Economie Générale', description: 'Economie Générale', credits: 2, heures: 50, tags: ['gestion', 'méthodologie'] }
      ],
      ucg: [
        { code: 'ASI 1508', nom: 'Anglais Scientifique Initial', description: 'Anglais Scientifique Initial', credits: 2, heures: 50, tags: ['culture générale'] }
      ]
    },
    S6: {
      ucf: [
        { code: 'GEC 1601', nom: 'Hydraulique générale', description: 'Hydraulique en charge ; Hydraulique à surface libre', credits: 4, heures: 100, tags: ['hydraulique', 'fondamental'] },
        { code: 'GEC 1602', nom: 'Géophysique', description: 'Géophysique', credits: 3, heures: 75, tags: ['géotechnique', 'fondamental'] }
      ],
      uds: [
        { code: 'GEC 1603', nom: 'Mécanique des sols Initiale', description: 'Mécanique des sols Initiale', credits: 4, heures: 100, tags: ['géotechnique', 'spécialité'] },
        { code: 'GEC 1604', nom: 'Béton armé Initiale', description: 'Béton armé Initiale', credits: 4, heures: 100, tags: ['structures', 'spécialité'] },
        { code: 'GEC 1605', nom: 'Construction métallique Initiale', description: 'Construction métallique Initiale', credits: 4, heures: 100, tags: ['structures', 'spécialité'] },
        { code: 'GEC 1606', nom: 'Topométrie appliquée', description: 'Topométrie appliquée', credits: 3, heures: 75, tags: ['topométrie', 'spécialité'] }
      ],
      um: [
        { code: 'GEC 1607', nom: 'Hydrologie de l’Ingénieur', description: 'Hydrologie de l’Ingénieur', credits: 3, heures: 75, tags: ['hydraulique', 'méthodologie'] },
        { code: 'GEC 1608', nom: 'Pratique Industrielle', description: 'Stage en milieu industriel (camp topo) ; Cours séminaire (Plomberie, Electricité)', credits: 5, heures: 125, tags: ['pratique', 'stage'] }
      ],
      ucg: []
    }
  },
  GC4: {
    S7: {
      ucf: [],
      uds: [
        { code: 'MSD 1701', nom: 'Mécanique des solides déformables', description: 'Mécanique des solides déformables', credits: 3, heures: 75, tags: ['structures', 'spécialité'] },
        { code: 'GEC 1702', nom: 'Mécanique des sols Avancés', description: 'Mécanique des sols Avancés', credits: 3, heures: 75, tags: ['géotechnique', 'spécialité'] },
        { code: 'GEC 1703', nom: 'Béton armé Avancé', description: 'Béton armé Avancé', credits: 3, heures: 75, tags: ['structures', 'spécialité'] },
        { code: 'GEC 1704', nom: 'Construction métallique Avancée', description: 'Construction métallique Avancée', credits: 4, heures: 100, tags: ['structures', 'spécialité'] },
        { code: 'GEC 1705', nom: 'Hydraulique Appliquée', description: 'Assainissement pluvial ; Collecte et évacuation des eaux usées domestiques', credits: 4, heures: 100, tags: ['hydraulique', 'spécialité'] },
        { code: 'GEC 1706', nom: 'RDM Avancée', description: 'Structures hyperstatiques ; Dynamique des structures élastiques', credits: 4, heures: 100, tags: ['structures', 'spécialité'] },
        { code: 'GEC 1707', nom: 'Route Initiale et topométrie routière', description: 'Topométrie routière ; Route', credits: 4, heures: 100, tags: ['routes', 'spécialité'] }
      ],
      um: [
        { code: 'GEC 1708', nom: 'Economie Générale', description: 'Economie Générale', credits: 2, heures: 50, tags: ['gestion', 'méthodologie'] },
        { code: 'GEC 1709', nom: 'Analyse Economique et Financière', description: 'Analyse Economique et Financière', credits: 2, heures: 50, tags: ['gestion', 'méthodologie'] },
        { code: 'GEC 1710', nom: 'Anglais scientifique Approfondi', description: 'Anglais scientifique Approfondi', credits: 1, heures: 25, tags: ['méthodologie'] }
      ],
      ucg: []
    },
    S8: {
      ucf: [],
      uds: [
        { code: 'MSS 2201', nom: 'Modélisation des systèmes et simulation', description: 'Modélisation des systèmes et simulation', credits: 3, heures: 75, tags: ['modélisation', 'spécialité'] },
        { code: 'MSA 2202', nom: 'Mécanique des sols Approfondie', description: 'Mécanique des sols Approfondie', credits: 3, heures: 75, tags: ['géotechnique', 'spécialité'] },
        { code: 'COB 2203', nom: 'Construction en bois', description: 'Construction en bois', credits: 4, heures: 100, tags: ['structures', 'spécialité'] },
        { code: 'CAB 2204', nom: 'Construction Mixte Acier-Béton', description: 'Construction Mixte Acier-Béton', credits: 4, heures: 100, tags: ['structures', 'spécialité'] },
        { code: 'BEP 2205', nom: 'Béton précontraint', description: 'Béton précontraint', credits: 4, heures: 100, tags: ['structures', 'spécialité'] },
        { code: 'GTR 2206', nom: 'Géotechnique et Travaux routiers', description: 'Entretien, Réhabilitation des routes et sécurité routière ; Géotechnique routière', credits: 5, heures: 125, tags: ['routes', 'spécialité'] }
      ],
      um: [
        { code: 'IRE 2207', nom: 'Initiation à la recherche', description: 'Méthodologie de recherche ; Ecriture scientifique', credits: 3, heures: 75, tags: ['recherche', 'méthodologie'] },
        { code: 'MGE 2208', nom: 'Marketing et Gestion d’Entreprise', description: 'Marketing ; Création et Gestion d’Entreprise', credits: 4, heures: 100, tags: ['gestion', 'méthodologie'] }
      ],
      ucg: []
    }
  },
  GC5: {
    S9: {
      ucf: [],
      uds: [
        { code: 'GEC 1901', nom: 'Droits des Travaux publics', description: 'Marchés et Passation de marchés', credits: 3, heures: 75, tags: ['droit', 'spécialité'] },
        { code: 'GEC 1902', nom: 'Sortie pédagogique', description: 'Sortie pédagogique', credits: 3, heures: 75, tags: ['pratique', 'sortie'] },
        { code: 'GEC 1903', nom: 'Travaux Pratiques Spécialisés', description: 'Travaux pratiques spécialisés', credits: 4, heures: 100, tags: ['pratique', 'spécialité'] },
        { code: 'GEC 1904', nom: 'CAO-DAO Appliqué', description: 'CAO-DAO Appliqué', credits: 3, heures: 75, tags: ['dessin', 'spécialité'] },
        { code: 'GEC 1905', nom: 'Conception et Calcul de Ponts', description: 'Conception et calcul de ponts', credits: 4, heures: 100, tags: ['ponts', 'spécialité'] },
        { code: 'GEC 1906', nom: 'Projet de Construction (BA et CM)', description: 'Projet de construction béton armé et construction métallique', credits: 4, heures: 100, tags: ['projet', 'spécialité'] },
        { code: 'GEC 1907', nom: 'Métré et Estimation de Prix', description: 'Métré et estimation de prix', credits: 3, heures: 75, tags: ['économie', 'spécialité'] }
      ],
      um: [
        { code: 'GEC 1908', nom: 'Législation du travail', description: 'Législation du travail', credits: 1, heures: 25, tags: ['droit', 'méthodologie'] },
        { code: 'GEC 1909', nom: 'Management des projets', description: 'Management des projets', credits: 2, heures: 50, tags: ['gestion', 'méthodologie'] },
        { code: 'GEC 1910', nom: 'Entreprenariat et Leadership', description: 'Entreprenariat et Leadership', credits: 2, heures: 50, tags: ['gestion', 'méthodologie'] },
        { code: 'GEC 1911', nom: 'Anglais Spécialisé', description: 'Anglais Spécialisé', credits: 1, heures: 25, tags: ['méthodologie'] }
      ],
      ucg: []
    },
    S10: {
      ucf: [], uds: [], um: [],
      ucg: [
        { code: 'STG 2001', nom: 'Stage de fin de formation', description: 'Stage / mémoire de fin de formation (semestre 10)', credits: 30, heures: 0, tags: ['stage', 'mémoire'] }
      ]
    }
  }
};

const CATEGORIES_LABELS = {
  ucf: 'Unités de Connaissances Fondamentales',
  uds: 'Unités de Découverte ou de Spécialité',
  um: 'Unités de Méthodologie',
  ucg: 'Unités de Culture Générale'
};

// Épreuves disponibles par matière (clé = nom exact de la matière ci-dessus)
const EPREUVES_DATA = {
  'Béton armé Initiale': {
    '2025-2026': [
      { titre: 'Devoir 1 — Dimensionnement des sections', sousTitre: 'Sujet + corrigé type' }
    ],
    '2024-2025': [
      { titre: 'Devoir — Dimensionnement des sections', sousTitre: 'Sujet + corrigé type' },
      { titre: 'Examen semestriel — Béton armé Initiale', sousTitre: 'Sujet + barème' }
    ],
    '2023-2024': [
      { titre: 'Devoir — Flexion simple', sousTitre: 'Sujet + corrigé' }
    ]
  },
  'Béton armé Avancé': {
    '2024-2025': [
      { titre: 'Examen — Béton armé Avancé', sousTitre: 'Sujet + corrigé type' }
    ]
  },
  'Mécanique des sols Initiale': {
    '2025-2026': [
      { titre: 'Devoir 1 — Tassements et fondations', sousTitre: 'Sujet + corrigé' }
    ],
    '2024-2025': [
      { titre: 'Devoir — Tassements', sousTitre: 'Sujet + corrigé' },
      { titre: 'Examen — Mécanique des sols', sousTitre: 'Sujet uniquement' }
    ]
  },
  'Géotechnique et Travaux routiers': {
    '2024-2025': [
      { titre: 'Devoir — Dimensionnement de chaussée', sousTitre: 'Sujet + corrigé type' }
    ]
  },
  'Conception et Calcul de Ponts': {
    '2024-2025': [
      { titre: 'Devoir — Pont à poutres', sousTitre: 'Sujet + corrigé' }
    ]
  },
  'Hydraulique Appliquée': {
    '2023-2024': [
      { titre: 'Devoir — Réseaux d’assainissement', sousTitre: 'Sujet + barème' }
    ]
  },
  'Hydraulique générale': {
    '2025-2026': [
      { titre: 'Devoir 1 — Hydraulique en charge', sousTitre: 'Sujet + corrigé type' }
    ]
  },
  'Droits des Travaux publics': {
    '2023-2024': [
      { titre: 'Étude de cas — Passation de marchés', sousTitre: 'Sujet uniquement' }
    ]
  }
};

let docState = { promo: null, semestre: null, matiereNom: null };

/* ==========================================================================
   4. Cartes de promotion (accueil + étape 1 de Documentation)
   ========================================================================== */
function promoCardHTML(promoKey){
  const p = PROMOTIONS_DATA[promoKey];
  const media = p.photo
    ? `<div class="promo-card-media"><img src="${p.photo}" alt="Étudiants de la promotion ${p.nom}, Génie Civil — EPAC" loading="lazy"></div>`
    : '';
  return `
    <a href="#" class="matiere-card" data-doc-open="${promoKey}">
      ${media}
      <span class="matiere-card-niveau">${p.annee} <span class="promo-effectif">· ${p.effectif} étudiants</span></span>
      <h3>${p.nom}</h3>
      <p>Semestres ${p.semestres.join(' & ')}</p>
    </a>`;
}

function renderPromotionCardsHome(){
  const container = document.getElementById('promotion-cards-home');
  if (!container) return;
  container.innerHTML = Object.keys(PROMOTIONS_DATA).map(promoCardHTML).join('');
  container.querySelectorAll('[data-doc-open]').forEach(card => {
    card.addEventListener('click', (event) => {
      event.preventDefault();
      showView('documentation');
      showDocMatieres(card.dataset.docOpen);
    });
  });
}

function renderPromotionGrid(){
  const grid = document.getElementById('promotion-grid');
  if (!grid) return;
  grid.innerHTML = Object.entries(PROMOTIONS_DATA).map(([key, p]) => `
    <div class="domaine-card" data-domaine-id="${key}">
      <div class="domaine-card-top"></div>
      <div class="domaine-card-body">
        <span class="domaine-icon">${key}</span>
        <h3>${p.nom} — ${p.annee}</h3>
        <p class="domaine-card-desc">${p.effectif} étudiants · Semestres ${p.semestres.join(' & ')}</p>
        <span class="domaine-card-link">Explorer les matières →</span>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.domaine-card').forEach(card => {
    card.addEventListener('click', () => showDocMatieres(card.dataset.domaineId));
  });
}

/* ==========================================================================
   5. Documentation — navigation Promotion → Semestre → Matières → Épreuves
   ========================================================================== */
function initDocumentation(){
  renderPromotionGrid();

  document.getElementById('retour-aux-matieres')?.addEventListener('click', (event) => {
    event.preventDefault();
    showDocMatieres(docState.promo);
  });
}

function showDocStep(stepName){
  document.querySelectorAll('.doc-step').forEach(step => {
    step.classList.toggle('is-active', step.dataset.docStep === stepName);
  });
}

function showDocMatieres(promoKey){
  const promo = PROMOTIONS_DATA[promoKey];
  if (!promo) return;

  docState.promo = promoKey;
  docState.semestre = promo.semestres[0];

  document.getElementById('breadcrumb-promo').textContent = promo.nom;
  document.getElementById('promo-titre').textContent = `${promo.nom} — Documentation`;
  document.getElementById('promo-soustitre').textContent = `${promo.annee} du cycle ingénieur — ${promo.effectif} étudiants. Accédez aux matières par semestre.`;

  renderSemestreToggle();
  renderMatiereGrid();
  showDocStep('matieres');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderSemestreToggle(){
  const toggle = document.getElementById('semestre-toggle');
  const promo = PROMOTIONS_DATA[docState.promo];
  if (!toggle || !promo) return;

  toggle.innerHTML = promo.semestres.map((s, i) => `
    <button type="button" class="semestre-btn ${i === 0 ? 'is-active' : ''}" data-semestre="${s}">
      Semestre ${s.replace('S', '')}
    </button>`).join('');

  toggle.querySelectorAll('.semestre-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      docState.semestre = btn.dataset.semestre;
      toggle.querySelectorAll('.semestre-btn').forEach(b => b.classList.toggle('is-active', b === btn));
      renderMatiereGrid();
    });
  });
}

function renderMatiereGrid(){
  const container = document.getElementById('matiere-grid');
  const data = MATIERES_DATA[docState.promo]?.[docState.semestre];
  if (!container || !data) return;

  const categories = ['ucf', 'uds', 'um', 'ucg'];
  const blocs = categories.map(catKey => {
    const items = data[catKey] || [];
    if (!items.length) return '';

    const cards = items.map(m => `
      <div class="matiere-off-card" data-matiere-nom="${m.nom}">
        <div class="matiere-off-header">
          <span class="matiere-off-code">${m.code}</span>
          <span class="matiere-off-credits">${m.credits} crédits</span>
          <span class="matiere-off-heures">${m.heures}h</span>
        </div>
        <h4 class="matiere-off-nom">${m.nom}</h4>
        <p class="matiere-off-desc">${m.description}</p>
        <div class="matiere-off-tags">${m.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <div class="matiere-off-actions">
          <button type="button" class="btn-sm" data-action="epreuves">Voir les épreuves</button>
          <button type="button" class="btn-sm btn-sm-primary" data-action="epreuves">Télécharger</button>
        </div>
      </div>`).join('');

    return `
      <div class="categorie-matiere">
        <h3 class="categorie-title">${CATEGORIES_LABELS[catKey]}</h3>
        <div class="matiere-items">${cards}</div>
      </div>`;
  }).join('');

  container.innerHTML = blocs.trim() || `<p class="matieres-vide">Aucune matière renseignée pour ce semestre.</p>`;

  container.querySelectorAll('.matiere-off-card').forEach(card => {
    card.querySelectorAll('[data-action="epreuves"]').forEach(btn => {
      btn.addEventListener('click', () => showDocEpreuves(card.dataset.matiereNom));
    });
  });
}

function showDocEpreuves(matiereNom){
  const promo = PROMOTIONS_DATA[docState.promo];
  docState.matiereNom = matiereNom;

  document.getElementById('breadcrumb-promo-2').textContent = promo.nom;
  document.getElementById('breadcrumb-matiere').textContent = matiereNom;
  document.getElementById('matiere-titre').textContent = matiereNom;
  document.getElementById('matiere-soustitre').textContent = `${promo.nom} · Semestre ${docState.semestre.replace('S', '')} · Génie Civil — EPAC`;

  const container = document.getElementById('epreuves-container');
  const epreuvesParAnnee = EPREUVES_DATA[matiereNom];

  if (!epreuvesParAnnee){
    container.innerHTML = `<p class="epreuves-vide">Aucune épreuve disponible pour le moment pour cette matière. Revenez bientôt !</p>`;
  } else {
    const annees = Object.keys(epreuvesParAnnee).sort().reverse();
    container.innerHTML = annees.map(annee => {
      const docs = epreuvesParAnnee[annee];
      const rows = docs.map(doc => `
        <div class="document-row">
          <div>
            <span class="titre">${doc.titre}</span>
            <span class="sous-titre">${doc.sousTitre}</span>
          </div>
          <a href="${doc.url || '#'}" class="document-dl" aria-label="Ouvrir le PDF — ${doc.titre}" target="_blank" rel="noopener">↓</a>
        </div>`).join('');

      return `
        <div class="annee-groupe">
          <div class="annee-groupe-head">
            <h4>${annee}</h4>
            <span class="annee-groupe-count">${docs.length} document${docs.length > 1 ? 's' : ''}</span>
          </div>
          <div class="document-grid">${rows}</div>
        </div>`;
    }).join('');
  }

  showDocStep('epreuves');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   6. Actualités (aperçu accueil + vue complète)
   ========================================================================== */
const ACTUALITES = [
  {
    badge: 'Annonce', couleur: 'bleu', date: 'Février 2026',
    titre: 'Lancement de la nouvelle plateforme de documentation',
    texte: 'CARET-GC met désormais à disposition l\u2019ensemble des épreuves passées des promotions GC3 à GC5 sur une plateforme accessible à tout moment.'
  }
];

function renderActualites(){
  const html = ACTUALITES.map(a => `
    <div class="actu-card ${a.couleur === 'rouge' ? 'actu-rouge' : a.couleur === 'verte' ? 'actu-verte' : ''}">
      <div class="actu-card-top"></div>
      <div class="actu-card-body">
        <div class="actu-meta">
          <span class="actu-badge">${a.badge}</span>
          <span class="actu-date">${a.date}</span>
        </div>
        <h3>${a.titre}</h3>
        <p>${a.texte}</p>
      </div>
    </div>`).join('');

  const preview = document.getElementById('actu-preview-grid');
  const full = document.getElementById('actu-full-grid');
  if (preview) preview.innerHTML = html;
  if (full) full.innerHTML = html;
}

/* ==========================================================================
   7. Recherche rapide du Hero (dynamique, générée depuis EPREUVES_DATA)
   ========================================================================== */

// Construit un index plat { titre, sousTitre, matiereNom, code, annee, url }
// à partir de EPREUVES_DATA + MATIERES_DATA (pour retrouver le code officiel).
function buildSearchIndex(){
  const codeByMatiere = {};
  Object.values(MATIERES_DATA).forEach(semestres => {
    Object.values(semestres).forEach(categories => {
      ['ucf', 'uds', 'um', 'ucg'].forEach(cat => {
        (categories[cat] || []).forEach(m => { codeByMatiere[m.nom] = m.code; });
      });
    });
  });

  const index = [];
  Object.entries(EPREUVES_DATA).forEach(([matiereNom, annees]) => {
    Object.entries(annees).forEach(([annee, docs]) => {
      docs.forEach(doc => {
        index.push({
          titre: doc.titre,
          sousTitre: doc.sousTitre,
          url: doc.url || '#',
          matiereNom,
          annee,
          code: codeByMatiere[matiereNom] || '—'
        });
      });
    });
  });
  return index;
}

// Raccourcis mis en avant sur l'accueil (un par grand domaine) — la liste
// complète des matières reste accessible via la recherche texte / Documentation.
const CHIPS_MATIERES_ACCUEIL = [
  'Béton armé Initiale',
  'Résistance des Matériaux Renforcés',
  'Hydraulique générale',
  'Géotechnique et Travaux routiers',
  'Conception et Calcul de Ponts',
  'Projet de Construction (BA et CM)'
];

function populateHeroMatiereFilters(){
  const noms = Array.from(new Set(
    Object.values(MATIERES_DATA).flatMap(semestres =>
      Object.values(semestres).flatMap(categories =>
        ['ucf', 'uds', 'um', 'ucg'].flatMap(cat => (categories[cat] || []).map(m => m.nom))
      )
    )
  )).sort();

  const chipRow = document.getElementById('matiere-chips');
  if (chipRow){
    const activeValue = chipRow.querySelector('.chip.is-active')?.dataset.matiere || 'Toutes les matières';
    const chipsNoms = CHIPS_MATIERES_ACCUEIL.filter(nom => noms.includes(nom));
    chipRow.innerHTML = '<button type="button" class="chip is-active" data-matiere="Toutes les matières">Toutes</button>' +
      chipsNoms.map(nom => `<button type="button" class="chip" data-matiere="${nom}">${nom}</button>`).join('');
    chipRow.querySelectorAll('.chip').forEach(chip => {
      chip.classList.toggle('is-active', chip.dataset.matiere === activeValue);
    });
  }
}

function initHeroSearch(){
  const form = document.querySelector('.search-card');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    applyLibraryFilters();
    document.getElementById('bibliotheque')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('q')?.addEventListener('input', () => applyLibraryFilters());
  document.getElementById('annee')?.addEventListener('change', () => applyLibraryFilters());
}

function initLibraryFilters(){
  const chipRow = document.getElementById('matiere-chips');
  if (!chipRow) return;

  chipRow.addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;

    chipRow.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');

    applyLibraryFilters(chip.dataset.matiere);
  });
}

// N'affiche des résultats QUE si une recherche/un filtre est actif — jamais
// de liste figée par défaut.
function applyLibraryFilters(chipMatiere){
  const body = document.getElementById('search-results-body');
  const noResults = document.getElementById('no-results');
  if (!body) return;

  const query = (document.getElementById('q')?.value || '').trim().toLowerCase();
  const matiere = chipMatiere || document.querySelector('#matiere-chips .chip.is-active')?.dataset.matiere || 'Toutes les matières';
  const annee = document.getElementById('annee')?.value || 'Toutes';

  const hasActiveFilter = query !== '' || matiere !== 'Toutes les matières' || annee !== 'Toutes';

  if (!hasActiveFilter){
    body.innerHTML = '';
    noResults.hidden = false;
    noResults.textContent = 'Tapez une matière, un mot-clé, ou choisissez un filtre ci-dessus pour voir les épreuves correspondantes.';
    return;
  }

  const index = buildSearchIndex();
  const results = index.filter(item => {
    const matchMatiere = matiere === 'Toutes les matières' || item.matiereNom === matiere;
    const matchAnnee = annee === 'Toutes' || item.annee === annee;
    const haystack = (item.titre + ' ' + item.matiereNom).toLowerCase();
    const matchQuery = query === '' || haystack.includes(query);
    return matchMatiere && matchAnnee && matchQuery;
  });

  if (results.length === 0){
    body.innerHTML = '';
    noResults.hidden = false;
    noResults.textContent = 'Aucune épreuve ne correspond à ces critères.';
    return;
  }

  noResults.hidden = true;
  body.innerHTML = results.map(r => `
    <div class="epreuve-row">
      <span class="code">${r.code}</span>
      <div class="titre">
        ${r.titre}
        <span class="sous-titre">${r.sousTitre}</span>
      </div>
      <span class="matiere-tag">${r.matiereNom}</span>
      <span class="session">${r.annee}</span>
      <div class="row-actions">
        <a href="${r.url}" class="dl-btn" target="_blank" rel="noopener" aria-label="Télécharger — ${r.titre}">PDF ↓</a>
      </div>
    </div>`).join('');
}

/* ==========================================================================
   8. Administration (démo — authentification et stockage locaux)
   ⚠️ Ceci n'est PAS une vraie sécurité : le mot de passe est visible dans le
   code source. Les modifications ne sont sauvegardées que dans CE navigateur
   (localStorage), pas partagées avec les autres visiteurs. À remplacer par
   un vrai backend (ex. Supabase) avant toute mise en ligne publique.
   ========================================================================== */
const ADMIN_PASSWORD = 'caret2025';
let editingMatiere = null; // { promo, semestre, categorie, index } | null
let editingEpreuve = null; // { matiereNom, annee, index } | null

function initAdmin(){
  const toggle = document.getElementById('admin-toggle');
  const panel = document.getElementById('admin-panel');
  const loginBox = document.getElementById('admin-login');
  const content = document.getElementById('admin-content');
  const passwordInput = document.getElementById('admin-password');
  const loginBtn = document.getElementById('admin-login-btn');
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
  });

  if (sessionStorage.getItem('caretgc_admin_session') === 'true'){
    loginBox.hidden = true;
    content.hidden = false;
    refreshAdminViews();
  }

  loginBtn.addEventListener('click', () => {
    if (passwordInput.value === ADMIN_PASSWORD){
      sessionStorage.setItem('caretgc_admin_session', 'true');
      loginBox.hidden = true;
      content.hidden = false;
      passwordInput.value = '';
      refreshAdminViews();
    } else {
      alert('Mot de passe incorrect. Contactez CARET-GC.');
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('caretgc_admin_session');
    loginBox.hidden = false;
    content.hidden = true;
  });

  document.getElementById('save-matiere-btn').addEventListener('click', saveMatiereFromForm);
  document.getElementById('cancel-matiere-edit-btn').addEventListener('click', resetMatiereForm);
  document.getElementById('save-epreuve-btn').addEventListener('click', saveEpreuveFromForm);
  document.getElementById('cancel-epreuve-edit-btn').addEventListener('click', resetEpreuveForm);
}

/* --- Persistance (localStorage) ------------------------------------------ */
function saveAdminData(){
  localStorage.setItem('caretgc_matieres', JSON.stringify(MATIERES_DATA));
  localStorage.setItem('caretgc_epreuves', JSON.stringify(EPREUVES_DATA));
}

function loadAdminData(){
  try {
    const savedMatieres = localStorage.getItem('caretgc_matieres');
    if (savedMatieres) Object.assign(MATIERES_DATA, JSON.parse(savedMatieres));

    const savedEpreuves = localStorage.getItem('caretgc_epreuves');
    if (savedEpreuves) Object.assign(EPREUVES_DATA, JSON.parse(savedEpreuves));
  } catch (err) {
    console.warn('Impossible de charger les données admin sauvegardées :', err);
  }
}

/* --- Rafraîchissement de toutes les vues concernées ----------------------- */
function refreshAdminViews(){
  renderAdminMatiereTable();
  renderAdminEpreuveTable();
  populateEpreuveMatiereSelect();
  populateHeroMatiereFilters();
  applyLibraryFilters();
  if (docState.promo && docState.semestre) renderMatiereGrid();
}

/* --- Matières : ajout / modification --------------------------------------*/
function saveMatiereFromForm(){
  const code = document.getElementById('new-code').value.trim();
  const nom = document.getElementById('new-nom').value.trim();
  const description = document.getElementById('new-description').value.trim();
  const promo = document.getElementById('new-promo').value;
  const semestre = document.getElementById('new-semestre').value;
  const categorie = document.getElementById('new-categorie').value;
  const credits = parseInt(document.getElementById('new-credits').value, 10) || 0;
  const heures = parseInt(document.getElementById('new-heures').value, 10) || 0;
  const tags = document.getElementById('new-tags').value.split(',').map(t => t.trim()).filter(Boolean);

  if (!code || !nom){
    alert('Le code et le nom de la matière sont obligatoires.');
    return;
  }

  if (!MATIERES_DATA[promo]) MATIERES_DATA[promo] = {};
  if (!MATIERES_DATA[promo][semestre]) MATIERES_DATA[promo][semestre] = { ucf: [], uds: [], um: [] };
  if (!MATIERES_DATA[promo][semestre][categorie]) MATIERES_DATA[promo][semestre][categorie] = [];

  const matiereObj = { code, nom, description, credits, heures, tags: tags.length ? tags : ['à définir'] };

  if (editingMatiere){
    // Si la matière a changé de promo/semestre/catégorie, on la retire de son ancien emplacement
    const old = editingMatiere;
    const sameSpot = old.promo === promo && old.semestre === semestre && old.categorie === categorie;
    if (sameSpot){
      MATIERES_DATA[promo][semestre][categorie][old.index] = matiereObj;
    } else {
      MATIERES_DATA[old.promo]?.[old.semestre]?.[old.categorie]?.splice(old.index, 1);
      MATIERES_DATA[promo][semestre][categorie].push(matiereObj);
    }
  } else {
    MATIERES_DATA[promo][semestre][categorie].push(matiereObj);
  }

  saveAdminData();
  resetMatiereForm();
  refreshAdminViews();
}

function resetMatiereForm(){
  editingMatiere = null;
  document.getElementById('new-code').value = '';
  document.getElementById('new-nom').value = '';
  document.getElementById('new-description').value = '';
  document.getElementById('new-credits').value = '';
  document.getElementById('new-heures').value = '';
  document.getElementById('new-tags').value = '';
  document.getElementById('matiere-form-title').textContent = '➕ Ajouter une matière';
  document.getElementById('save-matiere-btn').textContent = 'Ajouter la matière';
  document.getElementById('cancel-matiere-edit-btn').hidden = true;
}

function editMatiere(promo, semestre, categorie, index){
  const m = MATIERES_DATA[promo]?.[semestre]?.[categorie]?.[index];
  if (!m) return;

  editingMatiere = { promo, semestre, categorie, index };
  document.getElementById('new-code').value = m.code;
  document.getElementById('new-nom').value = m.nom;
  document.getElementById('new-description').value = m.description || '';
  document.getElementById('new-promo').value = promo;
  document.getElementById('new-semestre').value = semestre;
  document.getElementById('new-categorie').value = categorie;
  document.getElementById('new-credits').value = m.credits || '';
  document.getElementById('new-heures').value = m.heures || '';
  document.getElementById('new-tags').value = (m.tags || []).join(', ');

  document.getElementById('matiere-form-title').textContent = `✏️ Modifier — ${m.nom}`;
  document.getElementById('save-matiere-btn').textContent = 'Enregistrer les modifications';
  document.getElementById('cancel-matiere-edit-btn').hidden = false;
  document.getElementById('matiere-form-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deleteMatiere(promo, semestre, categorie, index){
  const m = MATIERES_DATA[promo]?.[semestre]?.[categorie]?.[index];
  if (!m) return;
  if (!confirm(`Supprimer la matière "${m.nom}" ?`)) return;

  MATIERES_DATA[promo][semestre][categorie].splice(index, 1);
  saveAdminData();
  refreshAdminViews();
}

function renderAdminMatiereTable(){
  const table = document.getElementById('admin-matiere-table');
  if (!table) return;

  const rows = [];
  Object.entries(MATIERES_DATA).forEach(([promo, semestres]) => {
    Object.entries(semestres).forEach(([semestre, categories]) => {
      ['ucf', 'uds', 'um', 'ucg'].forEach(cat => {
        (categories[cat] || []).forEach((m, index) => {
          rows.push({ promo, semestre, cat, index, m });
        });
      });
    });
  });

  const body = rows.length
    ? rows.map(({ promo, semestre, cat, index, m }) => `
        <tr>
          <td><strong>${m.code}</strong></td>
          <td>${m.nom}</td>
          <td>${promo}</td>
          <td>${semestre}</td>
          <td>${cat.toUpperCase()}</td>
          <td class="admin-row-actions">
            <button type="button" class="btn-sm" data-edit-matiere="${promo}|${semestre}|${cat}|${index}">Modifier</button>
            <button type="button" class="btn-sm btn-sm-primary" data-delete-matiere="${promo}|${semestre}|${cat}|${index}">Supprimer</button>
          </td>
        </tr>`).join('')
    : `<tr class="admin-empty-row"><td colspan="6">Aucune matière enregistrée.</td></tr>`;

  table.innerHTML = `
    <thead><tr><th>Code</th><th>Nom</th><th>Promo</th><th>Sem.</th><th>Cat.</th><th>Actions</th></tr></thead>
    <tbody>${body}</tbody>`;

  table.querySelectorAll('[data-edit-matiere]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [promo, semestre, cat, index] = btn.dataset.editMatiere.split('|');
      editMatiere(promo, semestre, cat, Number(index));
    });
  });
  table.querySelectorAll('[data-delete-matiere]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [promo, semestre, cat, index] = btn.dataset.deleteMatiere.split('|');
      deleteMatiere(promo, semestre, cat, Number(index));
    });
  });
}

/* --- Épreuves : ajout / modification --------------------------------------*/
function populateEpreuveMatiereSelect(){
  const select = document.getElementById('new-epreuve-matiere');
  if (!select) return;

  const noms = new Set();
  Object.values(MATIERES_DATA).forEach(semestres => {
    Object.values(semestres).forEach(categories => {
      ['ucf', 'uds', 'um', 'ucg'].forEach(cat => (categories[cat] || []).forEach(m => noms.add(m.nom)));
    });
  });

  const current = select.value;
  select.innerHTML = Array.from(noms).sort().map(nom => `<option value="${nom}">${nom}</option>`).join('');
  if (noms.has(current)) select.value = current;
}

function saveEpreuveFromForm(){
  const matiereNom = document.getElementById('new-epreuve-matiere').value;
  const annee = document.getElementById('new-epreuve-annee').value.trim();
  const titre = document.getElementById('new-epreuve-titre').value.trim();
  const sousTitre = document.getElementById('new-epreuve-type').value.trim() || 'Sujet uniquement';
  const url = document.getElementById('new-epreuve-url').value.trim() || '#';

  if (!matiereNom || !annee || !titre){
    alert('La matière, l\u2019année et le titre sont obligatoires.');
    return;
  }

  if (!EPREUVES_DATA[matiereNom]) EPREUVES_DATA[matiereNom] = {};
  if (!EPREUVES_DATA[matiereNom][annee]) EPREUVES_DATA[matiereNom][annee] = [];

  const epreuveObj = { titre, sousTitre, url };

  if (editingEpreuve){
    const old = editingEpreuve;
    const sameSpot = old.matiereNom === matiereNom && old.annee === annee;
    if (sameSpot){
      EPREUVES_DATA[matiereNom][annee][old.index] = epreuveObj;
    } else {
      EPREUVES_DATA[old.matiereNom]?.[old.annee]?.splice(old.index, 1);
      EPREUVES_DATA[matiereNom][annee].push(epreuveObj);
    }
  } else {
    EPREUVES_DATA[matiereNom][annee].push(epreuveObj);
  }

  saveAdminData();
  resetEpreuveForm();
  refreshAdminViews();
  if (docState.matiereNom === matiereNom) showDocEpreuves(matiereNom);
}

function resetEpreuveForm(){
  editingEpreuve = null;
  document.getElementById('new-epreuve-annee').value = '';
  document.getElementById('new-epreuve-titre').value = '';
  document.getElementById('new-epreuve-type').value = '';
  document.getElementById('new-epreuve-url').value = '';
  document.getElementById('epreuve-form-title').textContent = '➕ Ajouter une épreuve';
  document.getElementById('save-epreuve-btn').textContent = 'Ajouter l\u2019épreuve';
  document.getElementById('cancel-epreuve-edit-btn').hidden = true;
}

function editEpreuve(matiereNom, annee, index){
  const e = EPREUVES_DATA[matiereNom]?.[annee]?.[index];
  if (!e) return;

  editingEpreuve = { matiereNom, annee, index };
  document.getElementById('new-epreuve-matiere').value = matiereNom;
  document.getElementById('new-epreuve-annee').value = annee;
  document.getElementById('new-epreuve-titre').value = e.titre;
  document.getElementById('new-epreuve-type').value = e.sousTitre;
  document.getElementById('new-epreuve-url').value = e.url && e.url !== '#' ? e.url : '';

  document.getElementById('epreuve-form-title').textContent = `✏️ Modifier — ${e.titre}`;
  document.getElementById('save-epreuve-btn').textContent = 'Enregistrer les modifications';
  document.getElementById('cancel-epreuve-edit-btn').hidden = false;
  document.getElementById('epreuve-form-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deleteEpreuve(matiereNom, annee, index){
  const e = EPREUVES_DATA[matiereNom]?.[annee]?.[index];
  if (!e) return;
  if (!confirm(`Supprimer l\u2019épreuve "${e.titre}" ?`)) return;

  EPREUVES_DATA[matiereNom][annee].splice(index, 1);
  if (EPREUVES_DATA[matiereNom][annee].length === 0) delete EPREUVES_DATA[matiereNom][annee];
  saveAdminData();
  refreshAdminViews();
  if (docState.matiereNom === matiereNom) showDocEpreuves(matiereNom);
}

function renderAdminEpreuveTable(){
  const table = document.getElementById('admin-epreuve-table');
  if (!table) return;

  const rows = [];
  Object.entries(EPREUVES_DATA).forEach(([matiereNom, annees]) => {
    Object.entries(annees).forEach(([annee, docs]) => {
      docs.forEach((doc, index) => rows.push({ matiereNom, annee, index, doc }));
    });
  });

  const body = rows.length
    ? rows.map(({ matiereNom, annee, index, doc }) => `
        <tr>
          <td>${doc.titre}</td>
          <td>${matiereNom}</td>
          <td>${annee}</td>
          <td>${doc.sousTitre}</td>
          <td class="admin-row-actions">
            <button type="button" class="btn-sm" data-edit-epreuve="${matiereNom}|${annee}|${index}">Modifier</button>
            <button type="button" class="btn-sm btn-sm-primary" data-delete-epreuve="${matiereNom}|${annee}|${index}">Supprimer</button>
          </td>
        </tr>`).join('')
    : `<tr class="admin-empty-row"><td colspan="5">Aucune épreuve enregistrée.</td></tr>`;

  table.innerHTML = `
    <thead><tr><th>Titre</th><th>Matière</th><th>Année</th><th>Type</th><th>Actions</th></tr></thead>
    <tbody>${body}</tbody>`;

  table.querySelectorAll('[data-edit-epreuve]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [matiereNom, annee, index] = btn.dataset.editEpreuve.split('|');
      editEpreuve(matiereNom, annee, Number(index));
    });
  });
  table.querySelectorAll('[data-delete-epreuve]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [matiereNom, annee, index] = btn.dataset.deleteEpreuve.split('|');
      deleteEpreuve(matiereNom, annee, Number(index));
    });
  });
}

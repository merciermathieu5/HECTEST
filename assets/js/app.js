/* ============================================================
   HQC · 3e secondaire — Logique applicative
   Modèle : groupes question → sous-pièces cochables, cahier
   réordonnable par glisser-déposer, génération .docx côté client.
   ============================================================ */

(function () {
  'use strict';

  // ====== ÉTAT ======
  const state = {
    // Toutes les questions du catalogue (après filtrage)
    filteredQuestions: [],
    // Cahier en construction : tableau ordonné de pièces sélectionnées
    // chaque entrée : { kind: 'questionBody'|'reglette'|'document', questionId, pieceId, label }
    cahier: [],
    // Mode courant de prévisualisation ('cahier' | 'corrige')
    previewMode: 'cahier',
    // Terme de recherche courant (normalisé : minuscules, sans accents)
    searchTerm: '',
    // Générateur unifié : document à produire et disposition des documents
    docMode: 'cahier',      // 'cahier' | 'guide'
    layoutMode: 'std',      // 'std' (documents avec chaque question) | 'fin' (regroupés à la fin)
    // Périodes P1-P8 : { pg, value:'annee-niveau', years } — dérivées du select au démarrage
    periodes: [],
  };

  // ====== DOM ======
  const $ = (id) => document.getElementById(id);
  const el = {
    catalogList:      $('catalog-list'),
    catalogCount:     $('catalog-count'),
    cahierList:       $('cahier-list'),
    cahierCount:      $('cahier-count'),
    filterNiveau:     $('filter-niveau'),
    filterRealite:    $('filter-realite'),
    filterOp:         $('filter-operation'),
    filterCompetence: $('filter-competence'),
    resetFilters:     $('reset-filters'),
    searchInput:      $('search-input'),
    searchClear:      $('search-clear'),
    btnPreviewGo:     $('btn-preview-go'),
    btnDownloadGo:    $('btn-download-go'),
    btnClear:           $('btn-clear-cahier'),
    btnShuffle:         $('btn-shuffle-cahier'),
    loading:            $('loading-overlay'),
    loadingMsg:         $('loading-message'),
    previewOverlay:     $('preview-overlay'),
    previewContainer:   $('preview-container'),
    modalClose:         $('modal-close'),
    modalDownload:      $('modal-download'),
    modalTitle:         $('modal-title'),
  };

  // ====== INIT ======
  function init() {
    // Par défaut, toutes les réalités sociales sont repliées dans le catalogue
    DATA.realites_sociales.forEach(r => collapsedRealites.add(r.id));
    // Périodes P1-P8 dérivées des options du sélecteur (libellés d'années inclus)
    state.periodes = Array.from(el.filterNiveau.querySelectorAll('option'))
      .filter(o => o.value)
      .map(o => {
        const [annee, niveau] = o.value.split('-').map(Number);
        const pg = (annee - 3) * 4 + niveau;
        const years = (o.textContent.split('·')[1] || '').trim();
        return { pg, value: o.value, annee, niveau, years };
      });
    populateFilters();
    buildPeriodesRail();
    attachEventListeners();
    applyFilters();
    initSortable();
    renderCahier();
  }

  // Couleurs des réalités (index dans DATA.realites_sociales → palette boréale, voir style.css)
  const REALITE_HEX = ['2F4F3A', '2C5F7C', '5C5450', '9C3D2A', '8B7355', '6B8E4E', '4A5C6B', '7A4E7E', 'B08840', '7A3A4A'];
  function realiteIdxForPeriode(p) {
    return DATA.realites_sociales.findIndex(r => (r.annee || 3) === p.annee && r.niveau === p.niveau);
  }

  // ====== FRISE CHRONOLOGIQUE (navigation principale) ======
  // Bande P1→P8 avec années : légende des couleurs du catalogue ET filtre par période.
  // Cliquer une période filtre le catalogue (re-cliquer la période active retire le filtre).
  function buildPeriodesRail() {
    const rail = document.getElementById('periodes-rail');
    if (!rail) return;
    state.periodes.forEach(p => {
      const idx = realiteIdxForPeriode(p);
      const r = DATA.realites_sociales[idx];
      const seg = document.createElement('button');
      seg.type = 'button';
      seg.className = 'rail-seg';
      seg.dataset.periode = p.value;
      seg.style.setProperty('--seg-color', `var(--realite-color-${idx + 1})`);
      seg.innerHTML = `<span class="rail-p">P${p.pg}</span><span class="rail-years">${escapeHtml(p.years)}</span>`;
      if (r) seg.title = `P${p.pg} · ${p.years} — ${r.titre}`;
      seg.setAttribute('aria-label', `Filtrer le catalogue : P${p.pg}, ${p.years}${r ? ' — ' + r.titre : ''}`);
      seg.addEventListener('click', () => {
        el.filterNiveau.value = (el.filterNiveau.value === p.value) ? '' : p.value;
        applyFilters();
      });
      rail.appendChild(seg);
    });
  }
  function syncPeriodesRail() {
    const rail = document.getElementById('periodes-rail');
    if (!rail) return;
    const current = el.filterNiveau.value;
    rail.querySelectorAll('.rail-seg').forEach(seg => {
      const active = !!current && seg.dataset.periode === current;
      seg.classList.toggle('active', active);
      seg.setAttribute('aria-pressed', String(active));
    });
    rail.classList.toggle('has-active', !!current);
  }

  // ====== GÉNÉRATEUR UNIFIÉ (Document × Disposition) ======
  function syncGenerator() {
    document.querySelectorAll('.seg-btn[data-doc]').forEach(b => {
      const on = b.dataset.doc === state.docMode;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('.seg-btn[data-layout]').forEach(b => {
      const on = b.dataset.layout === state.layoutMode;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    if (el.btnDownloadGo) {
      el.btnDownloadGo.textContent = state.docMode === 'guide' ? '⬇ Télécharger le guide' : '⬇ Télécharger le cahier';
    }
  }

  function populateFilters() {
    // Affichage trié par annee puis par niveau (3e sec d'abord, puis 4e sec).
    const realitesParNiveau = DATA.realites_sociales.slice().sort((a, b) => (a.annee - b.annee) || (a.niveau - b.niveau));
    realitesParNiveau.forEach(r => {
      const o = document.createElement('option');
      o.value = r.id; o.textContent = r.titre;
      el.filterRealite.appendChild(o);
    });
    DATA.operations_intellectuelles.forEach(op => {
      const o = document.createElement('option');
      o.value = op; o.textContent = op;
      el.filterOp.appendChild(o);
    });
  }

  function attachEventListeners() {
    [el.filterNiveau, el.filterRealite, el.filterOp, el.filterCompetence].forEach(s =>
      s.addEventListener('change', applyFilters)
    );
    // Pilules de type (Toutes / Opérations / C1 / C2) → pilotent le select caché
    document.querySelectorAll('.pill-comp').forEach(p => {
      p.addEventListener('click', () => {
        el.filterCompetence.value = p.dataset.comp;
        applyFilters();
      });
    });
    // Générateur unifié
    document.querySelectorAll('.seg-btn[data-doc]').forEach(b =>
      b.addEventListener('click', () => { state.docMode = b.dataset.doc; syncGenerator(); }));
    document.querySelectorAll('.seg-btn[data-layout]').forEach(b =>
      b.addEventListener('click', () => { state.layoutMode = b.dataset.layout; syncGenerator(); }));
    el.btnPreviewGo.addEventListener('click', () =>
      previewCahier(state.docMode === 'guide', state.layoutMode === 'fin'));
    el.btnDownloadGo.addEventListener('click', () =>
      generateDocx(true, state.docMode === 'guide', state.layoutMode === 'fin'));
    syncGenerator();
    // Recherche : anti-rebond léger (le rendu complet du catalogue à chaque frappe
    // devient perceptible avec 400+ questions).
    let _searchTimer = null;
    el.searchInput.addEventListener('input', () => {
      el.searchClear.hidden = !el.searchInput.value;
      clearTimeout(_searchTimer);
      _searchTimer = setTimeout(applyFilters, 140);
    });
    el.searchClear.addEventListener('click', () => {
      el.searchInput.value = '';
      el.searchInput.focus();
      applyFilters();
    });
    el.resetFilters.addEventListener('click', () => {
      el.filterNiveau.value = '';
      el.filterRealite.value = '';
      el.filterOp.value = '';
      el.filterCompetence.value = '';
      el.searchInput.value = '';
      // Réinitialiser replie aussi toutes les réalités (retour à l'état initial)
      collapsedRealites.clear();
      DATA.realites_sociales.forEach(r => collapsedRealites.add(r.id));
      applyFilters();
    });
    el.btnClear.addEventListener('click', () => {
      state.cahier = [];
      renderCatalog();
      renderCahier();
    });
    el.btnShuffle.addEventListener('click', shuffleCahier);
    el.modalClose.addEventListener('click', closePreview);
    el.modalDownload.addEventListener('click', () => {
      const mode = state.previewMode;
      const isCorrige = mode === 'corrige' || mode === 'variante-corrige';
      const isVariant = mode === 'variante' || mode === 'variante-corrige';
      closePreview();
      generateDocx(true, isCorrige, isVariant);
    });
    el.previewOverlay.addEventListener('click', (e) => {
      if (e.target === el.previewOverlay) closePreview();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !el.previewOverlay.hidden) closePreview();
    });
  }

  // ====== FILTRES ======
  // ====== RECHERCHE PLEIN-TEXTE ======

  // Normalise pour une comparaison insensible à la casse et aux accents.
  function normalizeText(s) {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // Texte interrogeable d'une question : énoncé + puces + titres/textes/sources des documents.
  // Mémoïsé par id : le catalogue est immuable au chargement, et ce texte est recalculé
  // à chaque frappe de recherche pour les 400+ questions sans cache.
  const _searchTextCache = new Map();
  function questionSearchText(q) {
    const hit = _searchTextCache.get(q.id);
    if (hit !== undefined) return hit;
    const parts = [q.questionBody.prompt || ''];
    if (q.questionBody.bullets) parts.push(q.questionBody.bullets.join(' '));
    if (q.questionBody.instructions) parts.push(String(q.questionBody.instructions));
    (q.documents || []).forEach(d => {
      if (!d) return;
      if (d.title) parts.push(d.title);
      if (d.text) parts.push(d.text);
      if (d.sources) parts.push(d.sources.join(' '));
    });
    const txt = normalizeText(parts.join('  '));
    _searchTextCache.set(q.id, txt);
    return txt;
  }

  // Le terme apparaît-il dans l'énoncé (ou les puces) plutôt que seulement dans un document ?
  function termInPrompt(q, term) {
    const t = normalizeText((q.questionBody.prompt || '') + ' ' + ((q.questionBody.bullets || []).join(' ')));
    return t.includes(term);
  }

  // Surligne (insensible aux accents) les occurrences du terme dans le texte original, en échappant le HTML.
  function highlightMatches(original, term) {
    if (!term) return escapeHtml(original);
    let norm = '';
    const map = []; // map[k] = index dans `original` du k-ième caractère normalisé
    for (let i = 0; i < original.length; i++) {
      const nf = normalizeText(original[i]);
      for (let j = 0; j < nf.length; j++) { norm += nf[j]; map.push(i); }
    }
    const ranges = [];
    let from = 0, idx;
    while ((idx = norm.indexOf(term, from)) !== -1) {
      ranges.push([map[idx], map[idx + term.length - 1] + 1]);
      from = idx + term.length;
    }
    if (!ranges.length) return escapeHtml(original);
    let out = '', cur = 0;
    ranges.forEach(([s, e]) => {
      out += escapeHtml(original.slice(cur, s));
      out += '<mark class="search-hit">' + escapeHtml(original.slice(s, e)) + '</mark>';
      cur = e;
    });
    out += escapeHtml(original.slice(cur));
    return out;
  }

  function applyFilters() {
    const niv = el.filterNiveau.value;  // format "annee-niveau" (ex. "3-1", "4-2") ou "" pour toutes
    const rea = el.filterRealite.value;
    const op  = el.filterOp.value;
    const comp = el.filterCompetence.value;  // "" | "1" | "2"
    const term = normalizeText((el.searchInput.value || '').trim());
    state.searchTerm = term;
    el.searchClear.hidden = !el.searchInput.value;

    state.filteredQuestions = DATA.questions.filter(q => {
      if (niv) {
        const [filterAnnee, filterNiveau] = niv.split('-').map(Number);
        if (q.annee !== filterAnnee || q.niveau !== filterNiveau) return false;
      }
      if (rea && q.realite_sociale_id !== rea) return false;
      if (op  && q.operation !== op) return false;
      if (comp) {
        const cat = categoryOf(q);
        if (comp === 'oi' ? cat !== 'oi' : cat !== ('c' + comp)) return false;
      }
      if (term && !questionSearchText(q).includes(term)) return false;
      return true;
    });

    // Dépliage : la recherche et le filtre de réalité DÉPLIENT à l'affichage sans
    // écraser l'état de repli choisi par l'utilisateur (voir renderCatalog) ; on ne
    // mutile plus collapsedRealites ici, sinon changer un filtre repliait tout.

    const n = state.filteredQuestions.length;
    el.catalogCount.textContent = `${n} question${n > 1 ? 's' : ''}`;
    syncPeriodesRail();
    document.querySelectorAll('.pill-comp').forEach(p =>
      p.classList.toggle('active', p.dataset.comp === el.filterCompetence.value));
    renderCatalog();
  }

  // État global des groupes repliés (par realite_sociale_id) et des fiches dépliées (par question id)
  const collapsedRealites = new Set();
  const expandedQuestions = new Set();

  // ====== RENDU DU CATALOGUE ======
  // Rangées compactes par réalité sociale ; clic sur la rangée = fiche détaillée
  // (documents, réglette, période) ; bouton « + Ajouter » = sélection explicite.
  function renderCatalog() {
    el.catalogList.innerHTML = '';

    if (state.filteredQuestions.length === 0) {
      el.catalogList.innerHTML = '<div class="hint" style="text-align:center;padding:1.5rem;">Aucune question ne correspond aux filtres.</div>';
      return;
    }

    const realiteTitleById = {};
    const realiteIdxById = {};
    DATA.realites_sociales.forEach((r, i) => {
      realiteTitleById[r.id] = r.titre;
      realiteIdxById[r.id] = i;
    });
    const periodeForRealite = (r) => state.periodes.find(p => p.annee === (r.annee || 3) && p.niveau === r.niveau);

    // Grouper les questions filtrées par réalité sociale, triées par niveau
    const groupsMap = new Map();
    DATA.realites_sociales
      .slice()
      .sort((a, b) => (a.annee - b.annee) || (a.niveau - b.niveau))
      .forEach(r => groupsMap.set(r.id, []));
    state.filteredQuestions.forEach(q => {
      if (!groupsMap.has(q.realite_sociale_id)) groupsMap.set(q.realite_sociale_id, []);
      groupsMap.get(q.realite_sociale_id).push(q);
    });

    // Construire les groupes pour chaque réalité présente
    const periodeFilter = el.filterNiveau.value;
    groupsMap.forEach((questions, realiteId) => {
      if (questions.length === 0) return;
      const realiteIdx = realiteIdxById[realiteId] ?? 0;
      const realiteObj = DATA.realites_sociales.find(r => r.id === realiteId);
      const realiteTitle = realiteTitleById[realiteId] || 'Sans réalité';
      const periode = realiteObj ? periodeForRealite(realiteObj) : null;
      const periodeMatchesFilter = !!(periode && periode.value === periodeFilter);

      const groupEl = document.createElement('div');
      groupEl.className = 'realite-group';
      // État affiché : recherche active → tout déplié ; période filtrée → son groupe déplié ;
      // sinon on respecte l'état replié choisi par l'utilisateur.
      const isCollapsed = !state.searchTerm && !periodeMatchesFilter && collapsedRealites.has(realiteId);
      if (isCollapsed) groupEl.classList.add('collapsed');

      const nAdded = questions.filter(q => isQuestionUsed(q.id)).length;
      const headerEl = document.createElement('div');
      headerEl.className = 'realite-group-header';
      headerEl.setAttribute('data-realite-idx', String(realiteIdx));
      headerEl.setAttribute('role', 'button');
      headerEl.setAttribute('tabindex', '0');
      headerEl.setAttribute('aria-expanded', String(!isCollapsed));
      const allUsed = questions.every(q => isQuestionUsed(q.id));
      const toggleAllLabel = allUsed ? 'Tout retirer' : 'Tout ajouter';
      headerEl.innerHTML = `
        <span class="realite-toggle" aria-hidden="true">▼</span>
        ${periode ? `<span class="rg-periode">P${periode.pg}</span>` : ''}
        <span class="realite-group-title">${escapeHtml(realiteTitle)}${periode ? ` <span class="rg-years">· ${escapeHtml(periode.years)}</span>` : ''}</span>
        <span class="realite-group-count">${questions.length} question${questions.length > 1 ? 's' : ''}${nAdded ? ` <b class="rg-added">· ${nAdded} au cahier</b>` : ''}</span>
        <button type="button" class="realite-group-toggle-all" aria-label="${toggleAllLabel} pour cette réalité">${toggleAllLabel}</button>
      `;
      const toggleGroup = () => {
        if (state.searchTerm) return;   // pendant une recherche, tout reste déplié
        if (collapsedRealites.has(realiteId)) collapsedRealites.delete(realiteId);
        else collapsedRealites.add(realiteId);
        renderCatalog();
      };
      headerEl.addEventListener('click', (e) => {
        if (e.target.closest('.realite-group-toggle-all')) return;
        toggleGroup();
      });
      headerEl.addEventListener('keydown', (e) => {
        if (e.target.closest('.realite-group-toggle-all')) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(); }
      });
      // Bouton « Tout ajouter / retirer » : ne déclenche pas le repli du groupe
      const toggleAllBtn = headerEl.querySelector('.realite-group-toggle-all');
      toggleAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (allUsed) {
          questions.forEach(q => removeAllPiecesForQuestion(q.id));
        } else {
          questions.forEach(q => { if (!isQuestionUsed(q.id)) addAllPiecesForQuestion(q); });
        }
        renderCatalog();
        renderCahier();
      });
      groupEl.appendChild(headerEl);

      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'realite-group-cards';

      questions.forEach(q => {
        const used = isQuestionUsed(q.id);
        const expanded = expandedQuestions.has(q.id);
        const pointsTotal = computeQuestionPoints(q);
        const nDocs = (q.documents || []).filter(Boolean).length;

        const card = document.createElement('div');
        card.className = 'question-card';
        card.setAttribute('data-realite-idx', String(realiteIdx));
        if (used) card.classList.add('has-selection');
        if (expanded) card.classList.add('open');

        const promptHtml = state.searchTerm
          ? highlightMatches(q.questionBody.prompt, state.searchTerm)
          : escapeHtml(q.questionBody.prompt);

        card.innerHTML = `
          <div class="question-header" role="button" tabindex="0" aria-expanded="${expanded}">
            <span class="q-chevron" aria-hidden="true">›</span>
            <div class="q-content">
              <p class="q-prompt">${promptHtml}</p>
              <div class="q-meta">
                <span class="chip chip-type">${escapeHtml(questionTag(q))}</span>
                <span class="chip">#${q.numero}</span>
                ${nDocs ? `<span class="chip">${nDocs} doc${nDocs > 1 ? 's' : ''}</span>` : ''}
                ${pointsTotal > 0 ? `<span class="chip chip-pts">${pointsTotal} pts</span>` : ''}
                ${state.searchTerm && !termInPrompt(q, state.searchTerm) ? '<span class="q-doc-hit">🔍 trouvé dans un document</span>' : ''}
              </div>
            </div>
            <button type="button" class="q-add ${used ? 'added' : ''}" aria-label="${used ? 'Retirer la question du cahier' : 'Ajouter la question au cahier'}">${used ? '✓ Au cahier' : '+ Ajouter'}</button>
          </div>
          <div class="q-detail" ${expanded ? '' : 'hidden'}></div>
        `;

        // Fiche détaillée (remplie au premier dépliage, contenu statique)
        const detailEl = card.querySelector('.q-detail');
        const fillDetail = () => {
          if (detailEl.dataset.filled) return;
          detailEl.dataset.filled = '1';
          const docsList = (q.documents || []).filter(Boolean)
            .map(d => `<li>${escapeHtml(d.title)}</li>`).join('');
          const reglettes = (q.reglettes || []).filter(Boolean)
            .map(r => `${escapeHtml(r.label || 'Réglette')}${r.maxPoints ? ` — ${r.maxPoints} points` : ''}`).join(' · ');
          detailEl.innerHTML = `
            <div class="qd-grid">
              <div class="qd-block">
                <span class="qd-label">Évaluation</span>
                <span>${reglettes || '—'}</span>
              </div>
              ${docsList ? `
              <div class="qd-block">
                <span class="qd-label">Dossier documentaire</span>
                <ul class="qd-docs">${docsList}</ul>
              </div>` : ''}
            </div>
          `;
        };
        if (expanded) fillDetail();

        const header = card.querySelector('.question-header');
        const addBtn = card.querySelector('.q-add');

        const toggleExpand = () => {
          const isOpen = card.classList.toggle('open');
          if (isOpen) { expandedQuestions.add(q.id); fillDetail(); detailEl.hidden = false; }
          else { expandedQuestions.delete(q.id); detailEl.hidden = true; }
          header.setAttribute('aria-expanded', String(isOpen));
        };
        header.addEventListener('click', (e) => {
          if (e.target.closest('.q-add')) return;
          toggleExpand();
        });
        header.addEventListener('keydown', (e) => {
          if (e.target.closest('.q-add')) return;
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(); }
        });
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isQuestionUsed(q.id)) removeAllPiecesForQuestion(q.id);
          else addAllPiecesForQuestion(q);
          renderCatalog();
          renderCahier();
        });

        cardsContainer.appendChild(card);
      });

      groupEl.appendChild(cardsContainer);
      el.catalogList.appendChild(groupEl);
    });
  }

  // Total de points pour une question (somme des maxPoints de ses réglettes)
  function computeQuestionPoints(q) {
    return (q.reglettes || []).reduce((sum, r) => sum + (r.maxPoints || 0), 0);
  }

  // Total de points du cahier (somme des réglettes effectivement ajoutées)
  function computeCahierPoints() {
    let total = 0;
    state.cahier.forEach(p => {
      if (p.kind !== 'reglette') return;
      const q = DATA.questions.find(x => x.id === p.questionId);
      if (!q) return;
      const r = q.reglettes.find(x => x.id === p.pieceId);
      if (r && r.maxPoints) total += r.maxPoints;
    });
    return total;
  }

  // Points du cahier ventilés par catégorie (OI / C1 / C2) + total. Sert à la pondération
  // de la page couverture : une partie n'apparaît que si elle vaut > 0 point dans le cahier.
  function computeCahierPointsByCategory() {
    const acc = { oi: 0, c1: 0, c2: 0, total: 0 };
    state.cahier.forEach(p => {
      if (p.kind !== 'reglette') return;
      const q = DATA.questions.find(x => x.id === p.questionId);
      if (!q) return;
      const r = q.reglettes.find(x => x.id === p.pieceId);
      if (r && r.maxPoints) { acc[categoryOf(q)] += r.maxPoints; acc.total += r.maxPoints; }
    });
    return acc;
  }

  // ====== GESTION CAHIER ======
  function pieceKey(qId, kind, pieceId) {
    return `${qId}::${kind}::${pieceId || ''}`;
  }

  function isQuestionUsed(qId) {
    return state.cahier.some(p => p.questionId === qId);
  }

  function isQuestionFullySelected(qId) {
    const q = DATA.questions.find(x => x.id === qId);
    if (!q) return false;
    const required = 1 + q.reglettes.filter(Boolean).length + q.documents.filter(Boolean).length;
    const have = state.cahier.filter(p => p.questionId === qId).length;
    return have === required;
  }

  function addAllPiecesForQuestion(question) {
    // Add questionBody, then each réglette, then each document — only if not already in cahier
    addPiece(question, 'questionBody', null);
    question.reglettes.forEach(r => { if (r) addPiece(question, 'reglette', r.id); });
    question.documents.forEach(d => { if (d) addPiece(question, 'document', d.id); });
    sortCahier();
  }

  function addPiece(question, kind, pieceId) {
    const key = pieceKey(question.id, kind, pieceId);
    if (state.cahier.some(p => pieceKey(p.questionId, p.kind, p.pieceId) === key)) return;
    const entry = {
      questionId: question.id,
      kind,
      pieceId,
      label: makePieceLabel(question, kind, pieceId)
    };
    // Insérer après la dernière pièce de la même question (contiguïté)
    let lastIdx = -1;
    for (let i = state.cahier.length - 1; i >= 0; i--) {
      if (state.cahier[i].questionId === question.id) { lastIdx = i; break; }
    }
    if (lastIdx === -1) state.cahier.push(entry);
    else state.cahier.splice(lastIdx + 1, 0, entry);
    sortCahier();
  }

  // Trie les pièces de chaque groupe-question dans l'ordre canonique
  // (questionBody → réglettes → documents, selon l'ordre des données)
  // SANS modifier l'ordre des groupes-questions entre eux (préservé par le drag-and-drop)
  function sortCahier() {
    const groups = new Map();
    const groupOrder = [];
    state.cahier.forEach(p => {
      if (!groups.has(p.questionId)) { groups.set(p.questionId, []); groupOrder.push(p.questionId); }
      groups.get(p.questionId).push(p);
    });
    groups.forEach((pieces, qId) => {
      const q = DATA.questions.find(x => x.id === qId);
      if (!q) return;
      const orderMap = {};
      orderMap['questionBody::'] = 0;
      q.reglettes.forEach((r, i) => { if (r) orderMap[`reglette::${r.id}`] = 100 + i; });
      q.documents.forEach((d, i) => { if (d) orderMap[`document::${d.id}`] = 200 + i; });
      pieces.sort((a, b) => {
        const aKey = `${a.kind}::${a.pieceId || ''}`;
        const bKey = `${b.kind}::${b.pieceId || ''}`;
        return (orderMap[aKey] ?? 999) - (orderMap[bKey] ?? 999);
      });
    });
    state.cahier = groupOrder.flatMap(qId => groups.get(qId));
  }

  // Place les questions dans un ordre aléatoire (mélange les groupes-questions,
  // sans toucher à l'ordre interne des pièces ; le glisser-déposer reste possible ensuite).
  function shuffleCahier() {
    const groups = new Map();
    const order = [];
    state.cahier.forEach(p => {
      if (!groups.has(p.questionId)) { groups.set(p.questionId, []); order.push(p.questionId); }
      groups.get(p.questionId).push(p);
    });
    if (order.length < 2) return;
    // Fisher-Yates : on évite de laisser l'ordre identique si possible
    const original = order.join('|');
    let tries = 0;
    do {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    } while (order.join('|') === original && order.length > 1 && ++tries < 8);
    state.cahier = order.flatMap(qId => groups.get(qId));
    renderCahier();
  }

  function makePieceLabel(q, kind, pieceId) {
    const prefix = `[${questionTag(q)} #${q.numero}] `;
    if (kind === 'questionBody') return `${prefix}Énoncé + espace de réponse`;
    if (kind === 'reglette') {
      const r = q.reglettes.find(x => x.id === pieceId);
      return `${prefix}${r ? r.label : 'Réglette'}`;
    }
    if (kind === 'document') {
      const d = q.documents.find(x => x.id === pieceId);
      return `${prefix}${d ? d.label : 'Document'}`;
    }
    return prefix;
  }

  function removePiece(qId, kind, pieceId) {
    const key = pieceKey(qId, kind, pieceId);
    state.cahier = state.cahier.filter(p => pieceKey(p.questionId, p.kind, p.pieceId) !== key);
  }

  function removeAllPiecesForQuestion(qId) {
    state.cahier = state.cahier.filter(p => p.questionId !== qId);
  }

  // ====== RENDU CAHIER (par groupe-question) ======
  function renderCahier() {
    el.cahierList.innerHTML = '';
    el.cahierList.classList.toggle('empty', state.cahier.length === 0);

    // Grouper les pièces consécutives par questionId (l'invariant garanti par sortCahier)
    const groups = [];
    let current = null;
    state.cahier.forEach(p => {
      if (!current || current.questionId !== p.questionId) {
        current = { questionId: p.questionId, pieces: [] };
        groups.push(current);
      }
      current.pieces.push(p);
    });

    if (groups.length === 0) {
      el.cahierList.innerHTML = `
        <div class="cahier-empty">
          <span class="ce-icon" aria-hidden="true">📚</span>
          <p class="ce-title">Le cahier est vide</p>
          <ol class="ce-steps">
            <li>Choisis une période dans la frise (ou cherche un mot-clé)</li>
            <li>Ajoute des questions avec le bouton <b>+ Ajouter</b></li>
            <li>Réordonne-les ici, puis génère le cahier et son guide</li>
          </ol>
        </div>`;
    }

    groups.forEach((g, idx) => {
      const q = DATA.questions.find(x => x.id === g.questionId);
      if (!q) return;
      const pts = computeQuestionPoints(q);

      const card = document.createElement('div');
      card.className = 'cahier-group';
      card.dataset.qid = g.questionId;

      const header = document.createElement('header');
      header.className = 'cahier-group-header';
      header.innerHTML = `
        <span class="cahier-handle" aria-hidden="true" title="Glisser pour réordonner">⋮⋮</span>
        <span class="cahier-num" aria-label="Question ${idx + 1} du cahier">${idx + 1}</span>
        <div class="cahier-group-meta">
          <span class="cahier-group-title">${escapeHtml(questionTag(q))}</span>
          <span class="cahier-prompt" title="${escapeHtml(q.questionBody.prompt)}">${escapeHtml(q.questionBody.prompt)}</span>
        </div>
        <span class="cahier-pts">${pts} pts</span>
        <button class="cahier-group-remove" type="button" aria-label="Retirer la question">×</button>
      `;
      header.querySelector('.cahier-group-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        removeAllPiecesForQuestion(g.questionId);
        renderCatalog();
        renderCahier();
      });
      card.appendChild(header);

      el.cahierList.appendChild(card);
    });

    // Tableau de bord : total + ventilation par partie (telle qu'elle apparaîtra sur la couverture)
    const ponder = computeCahierPointsByCategory();
    const chips = [];
    if (ponder.oi > 0) chips.push(`<span class="dash-chip">Opérations <b>${ponder.oi}</b></span>`);
    if (ponder.c1 > 0) chips.push(`<span class="dash-chip">Compétence 1 <b>${ponder.c1}</b></span>`);
    if (ponder.c2 > 0) chips.push(`<span class="dash-chip">Compétence 2 <b>${ponder.c2}</b></span>`);
    el.cahierCount.innerHTML = `
      <div class="dash-main">
        <span class="dash-q"><b>${groups.length}</b> question${groups.length > 1 ? 's' : ''}</span>
        <span class="dash-sep" aria-hidden="true"></span>
        <span class="dash-pts"><b>${ponder.total}</b> points</span>
      </div>
      ${chips.length ? `<div class="dash-chips">${chips.join('')}</div>` : ''}
    `;

    const empty = state.cahier.length === 0;
    el.btnPreviewGo.disabled = empty;
    el.btnDownloadGo.disabled = empty;
    el.btnClear.disabled = empty;
    el.btnShuffle.disabled = groups.length < 2;
  }

  // ====== DRAG-AND-DROP (au niveau des groupes-questions) ======
  function initSortable() {
    Sortable.create(el.cahierList, {
      animation: 150,
      handle: '.cahier-group-header',
      draggable: '.cahier-group',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd: () => {
        // Reconstruire state.cahier en fonction de l'ordre du DOM (par groupe-question)
        const newCahier = [];
        el.cahierList.querySelectorAll('.cahier-group').forEach(card => {
          const qid = card.dataset.qid;
          state.cahier.filter(p => p.questionId === qid).forEach(p => newCahier.push(p));
        });
        state.cahier = newCahier;
        renderCahier();
      }
    });
  }

  // ====== GÉNÉRATION DU .DOCX ======
  // Construit le document docx-js + retourne le Blob.
  async function buildDocxBlob() {
    const {
      Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
      AlignmentType, BorderStyle, WidthType, ShadingType,
      VerticalAlign, HeadingLevel, LevelFormat, PageBreak, PageOrientation
    } = docx;

    const imageCache = await preloadImages();
    const builders = makeBuilders(docx, imageCache);

    // ---- Page couverture (toujours en premier) ----
    const coverElements = buildCoverPage(docx);

    // ---- Grouper les pièces du cahier par question (consécutivement) ----
    const groups = [];
    let cur = null;
    state.cahier.forEach(p => {
      if (!cur || cur.questionId !== p.questionId) {
        cur = { questionId: p.questionId, pieces: [] };
        groups.push(cur);
      }
      cur.pieces.push(p);
    });

    const NO_B = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const WRAPPER_NO_BORDERS = { top: NO_B, bottom: NO_B, left: NO_B, right: NO_B };

    const bodyChildren = [];
    bodyChildren.push(...coverElements);   // couverture (portrait)

    const _banners = sectionizeGroups(groups);
    let _prevComp = null;
    let _orient = 'portrait';   // la couverture est en portrait
    groups.forEach((g, idx) => {
      const q = DATA.questions.find(x => x.id === g.questionId);
      if (!q) return;

      // Numéro séquentiel : 1, 2, 3… dans l'ordre du cahier (et non l'ordre de l'opération)
      const seqNumero = idx + 1;
      const isC1 = categoryOf(q) === 'c1';

      // Séparation : changement d'orientation → saut de SECTION (paysage pour la C1),
      // sinon simple saut de page. (Sépare aussi de la couverture pour la 1re question.)
      const startOrient = isC1 ? 'landscape' : 'portrait';
      if (startOrient !== _orient) { bodyChildren.push({ __orient: startOrient }); _orient = startOrient; }
      else { bodyChildren.push(new Paragraph({ children: [new PageBreak()] })); }

      // Bandeau de section de compétence (au changement de compétence ; cahiers mixtes seulement)
      if (_banners) {
        const _c = categoryOf(q);
        if (_c !== _prevComp) { bodyChildren.push(sectionBanner(docx, _c)); _prevComp = _c; }
      }

      // Compétence 1 : schéma (page paysage) → saut de page → grille (page paysage),
      // puis le dossier documentaire repasse en portrait (rendu par le flux générique ci-dessous).
      if (isC1) {
        bodyChildren.push(...builders.buildQuestionBody(q, seqNumero));
        bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
        bodyChildren.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Grille d'évaluation", bold: true, size: 22, color: "2A2620" })] }));
        (q.reglettes || []).forEach(r => bodyChildren.push(...builders.buildReglette(r)));
        const _docP = g.pieces.filter(p => p.kind === 'document');
        if (_docP.length > 0) { bodyChildren.push({ __orient: 'portrait' }); _orient = 'portrait'; }
      }

      // Drapeau optionnel sur la question : `cantSplitAllDocs: true` regroupe
      // l'énoncé + la réglette + TOUS les documents dans un seul wrapper cantSplit.
      // Word ne pourra pas alors couper le bloc entre deux pages ; si la question
      // ne tient pas sur la page courante, elle bascule entièrement sur la suivante.
      // Utile pour les questions de type situer-avant-après à 4 docs où l'on veut
      // garder l'axe + les 4 docs visibles ensemble (sinon Word coupe entre paire 1
      // et paire 2 alors que tout aurait pu tenir).
      const cantSplitAll = q.cantSplitAllDocs === true;

      // Pièces "noyau" : énoncé + réglette → enveloppe non-coupable (sauf C1, déjà rendu ci-dessus)
      const corePieces = g.pieces.filter(p => p.kind === 'questionBody' || p.kind === 'reglette');
      const coreChildren = [];
      if (!isC1 && corePieces.length > 0) {
        corePieces.forEach(p => {
          if (p.kind === 'questionBody') {
            coreChildren.push(...builders.buildQuestionBody(q, seqNumero));
          } else if (p.kind === 'reglette') {
            const r = q.reglettes.find(x => x.id === p.pieceId);
            if (r) {
              coreChildren.push(new Paragraph({ children: [new TextRun({ text: "", size: 8 })], spacing: { before: 0, after: 80 } }));
              coreChildren.push(...builders.buildReglette(r));
            }
          }
        });
        // Paragraphe minuscule à la fin du wrapper : Word exige un paragraphe en fin de cellule,
        // et sans contrôle de notre part docx-js insère un paragraphe par défaut (size 22) qui
        // crée un espace blanc important entre le wrapper et le premier document.
        coreChildren.push(new Paragraph({ children: [new TextRun({ text: "", size: 4 })], spacing: { before: 0, after: 0 } }));
      }

      // En mode standard, le noyau a son propre wrapper cantSplit indépendant.
      // En mode cantSplitAllDocs, on diffère l'emballage pour englober aussi les docs.
      if (!isC1 && corePieces.length > 0 && !cantSplitAll) {
        // Enveloppe : 1 cellule sans bordure, cantSplit:true → impossible de couper entre pages
        bodyChildren.push(new Table({
          width: { size: 10500, type: WidthType.DXA },
          columnWidths: [10500],
          rows: [new TableRow({
            cantSplit: true,
            children: [new TableCell({
              width: { size: 10500, type: WidthType.DXA },
              borders: WRAPPER_NO_BORDERS,
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              children: coreChildren
            })]
          })]
        }));
      }

      // Documents : chacun dans son propre tableau cantSplit
      // Plus de saut de page forcé : Word emballe naturellement les documents
      // avec l'énoncé tant qu'il y a de la place. Les wrappers cantSplit empêchent
      // qu'un document soit coupé entre deux pages.
      const docPieces = g.pieces.filter(p => p.kind === 'document');

      // Stratégie d'emballage : grouper les docs consécutifs « étroits » par paires
      // pour les afficher côte à côte (2 colonnes). Doc « étroit » = image ≤ 7 cm OU texte seul
      // OU drapeau « pair: true » sur le doc (pour forcer le pairing même avec image plus grande).
      const isDocNarrow = (d) => !d.imageUrl || d.pair === true || (d.imageWidthCm || 12) <= 7;
      const slots = [];
      let dIdx = 0;
      while (dIdx < docPieces.length) {
        const d1 = q.documents.find(x => x.id === docPieces[dIdx].pieceId);
        if (!d1) { dIdx++; continue; }
        const d2 = dIdx + 1 < docPieces.length ? q.documents.find(x => x.id === docPieces[dIdx + 1].pieceId) : null;
        if (d2 && isDocNarrow(d1) && isDocNarrow(d2)) {
          slots.push({ kind: 'pair', docs: [d1, d2] });
          dIdx += 2;
        } else {
          slots.push({ kind: 'single', docs: [d1] });
          dIdx++;
        }
      }

      // En mode cantSplitAllDocs : on collecte toutes les pièces dans un seul tableau
      // englobant. Sinon, mode classique : chaque slot va dans son propre élément racine.
      const docsTarget = cantSplitAll ? coreChildren : bodyChildren;

      // Espace minimaliste entre l'énoncé/réglette et les documents
      // Police minuscule (size: 8 = 4pt) → hauteur de ligne réduite
      if (slots.length > 0) {
        docsTarget.push(new Paragraph({
          children: [new TextRun({ text: "", size: 8 })],
          spacing: { before: 0, after: 60 }
        }));
      }

      slots.forEach((slot, sIdx) => {
        if (sIdx > 0) {
          docsTarget.push(new Paragraph({
            children: [new TextRun({ text: "", size: 8 })],
            spacing: { before: 0, after: 60 }
          }));
        }
        if (slot.kind === 'single') {
          docsTarget.push(...builders.buildDocument(slot.docs[0]));
        } else {
          docsTarget.push(builders.buildPairedDocuments(slot.docs[0], slot.docs[1]));
        }
      });

      // En mode cantSplitAllDocs : on emballe maintenant le tout (noyau + docs) dans
      // un unique wrapper cantSplit, ajouté à bodyChildren.
      if (cantSplitAll && coreChildren.length > 0) {
        bodyChildren.push(new Table({
          width: { size: 10500, type: WidthType.DXA },
          columnWidths: [10500],
          rows: [new TableRow({
            cantSplit: true,
            children: [new TableCell({
              width: { size: 10500, type: WidthType.DXA },
              borders: WRAPPER_NO_BORDERS,
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              children: coreChildren
            })]
          })]
        }));
      }
    });

    const doc = new Document({
      creator: "HQC 3e secondaire",
      title: "Cahier de l'élève",
      styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
      sections: c1SplitSections(bodyChildren, undefined, { coverFirstPage: true })
    });

    return await Packer.toBlob(doc);
  }

  // ====== VARIANTE : CAHIER « DOCUMENTS À LA FIN » (test) ======
  // Structure : pour chaque question, énoncé → espace de réponse → réglette (sans documents
  // intercalés). TOUS les documents du cahier sont regroupés en fin de cahier et renumérotés
  // globalement 1, 2, 3, … L'espace est maximisé : aucune question ne démarre sur une page neuve
  // (les questions s'enchaînent), et les documents étroits sont appariés côte à côte.

  // Renumérote les renvois « document(s) <liste> » d'un texte selon une table local→global.
  // La regex ne capture que la liste de nombres collée à « document(s) » et s'arrête au 1er
  // token non-liste : les années entre parenthèses (« (1541) ») et autres nombres sont préservés.
  // Couvre aussi les « Document N » des espaces de réponse (rows, items, prefilled).
  function makeDocRenumberer(map) {
    return function (text) {
      if (typeof text !== 'string' || !text) return text;
      return text.replace(
        /(\bdocuments?\b\s+)(\d+(?:\s*(?:,\s*|\s+à\s+|\s+et\s+|\s+ou\s+)\d+)*)/gi,
        (m, head, list) => head + list.replace(/\d+/g, d => {
          const g = map[parseInt(d, 10)];
          return g != null ? String(g) : d;
        })
      );
    };
  }

  // Applique le renuméroteur récursivement à toutes les chaînes d'une valeur (clone immuable).
  function deepRenumber(value, ren) {
    if (typeof value === 'string') return ren(value);
    if (Array.isArray(value)) return value.map(v => deepRenumber(v, ren));
    if (value && typeof value === 'object') {
      const out = {};
      for (const k in value) out[k] = deepRenumber(value[k], ren);
      return out;
    }
    return value;
  }

  // Copie de la question avec énoncé + espace de réponse renumérotés (la question source intacte).
  function renumberQuestion(q, map) {
    const ren = makeDocRenumberer(map);
    const b = q.questionBody || {};
    return {
      ...q,
      questionBody: {
        ...b,
        prompt: ren(b.prompt),
        bullets: b.bullets ? b.bullets.map(ren) : b.bullets,
        instructions: b.instructions ? deepRenumber(b.instructions, ren) : b.instructions,
        responseSpace: b.responseSpace ? deepRenumber(b.responseSpace, ren) : b.responseSpace
      }
    };
  }

  // Numéro local d'un document : lu dans son titre (« Document 3 » → 3), sinon position dans q.documents.
  function localDocNumber(doc, fallbackIdx) {
    const m = doc && typeof doc.title === 'string' ? doc.title.match(/(\d+)/) : null;
    return m ? parseInt(m[1], 10) : (fallbackIdx + 1);
  }

  async function buildDocxBlobFlat() {
    const {
      Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
      BorderStyle, WidthType, PageBreak
    } = docx;

    const imageCache = await preloadImages();
    const builders = makeBuilders(docx, imageCache);

    const coverElements = buildCoverPage(docx);

    // Grouper les pièces du cahier par question (consécutivement)
    const groups = [];
    let cur = null;
    state.cahier.forEach(p => {
      if (!cur || cur.questionId !== p.questionId) {
        cur = { questionId: p.questionId, pieces: [] };
        groups.push(cur);
      }
      cur.pieces.push(p);
    });

    const NO_B = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const WRAPPER_NO_BORDERS = { top: NO_B, bottom: NO_B, left: NO_B, right: NO_B };

    const _banners = sectionizeGroups(groups);
    let _prevComp = null;
    let _orient = 'portrait';
    // ---- PASSE 1 : numérotation globale des documents + table local→global par question ----
    let globalDoc = 0;
    const endDocs = []; // { doc (titre renuméroté), narrow }
    const isDocNarrow = (d) => !d.imageUrl || d.pair === true || (d.imageWidthCm || 12) <= 7;
    groups.forEach(g => {
      const q = DATA.questions.find(x => x.id === g.questionId);
      g._map = {};
      if (!q) return;
      const presentIds = new Set(g.pieces.filter(p => p.kind === 'document').map(p => p.pieceId));
      q.documents.forEach((doc, idx) => {
        if (!presentIds.has(doc.id)) return;
        globalDoc++;
        const local = localDocNumber(doc, idx);
        g._map[local] = globalDoc;
        endDocs.push({ doc: { ...doc, title: `Document ${globalDoc}` }, narrow: isDocNarrow(doc) });
      });
    });

    const bodyChildren = [];
    bodyChildren.push(...coverElements);
    bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));

    // ---- PASSE 2 : énoncés (question → espace de réponse → réglette), AUCUN document intercalé ----
    groups.forEach((g, idx) => {
      const q0 = DATA.questions.find(x => x.id === g.questionId);
      if (!q0) return;
      const isC1 = categoryOf(q0) === 'c1';
      let _switched = false;
      const startOrient = isC1 ? 'landscape' : 'portrait';
      if (startOrient !== _orient) { bodyChildren.push({ __orient: startOrient }); _orient = startOrient; _switched = true; }
      if (_banners) {
        const _c = categoryOf(q0);
        if (_c !== _prevComp) {
          if (_prevComp !== null && !_switched) bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
          bodyChildren.push(sectionBanner(docx, _c));
          _prevComp = _c;
        }
      }
      const q = renumberQuestion(q0, g._map);
      const seqNumero = idx + 1;

      // Compétence 1 : schéma (page paysage) → saut de page → grille (page paysage). Les documents
      // rejoignent le dossier global (portrait) en fin de cahier, comme pour les autres questions.
      if (isC1) {
        bodyChildren.push(...builders.buildQuestionBody(q, seqNumero));
        bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
        bodyChildren.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Grille d'évaluation", bold: true, size: 22, color: "2A2620" })] }));
        (q.reglettes || []).forEach(r => bodyChildren.push(...builders.buildReglette(r)));
        bodyChildren.push({ __orient: 'portrait' }); _orient = 'portrait';
        return;
      }

      const corePieces = g.pieces.filter(p => p.kind === 'questionBody' || p.kind === 'reglette');
      const coreChildren = [];
      corePieces.forEach(p => {
        if (p.kind === 'questionBody') {
          coreChildren.push(...builders.buildQuestionBody(q, seqNumero));
        } else if (p.kind === 'reglette') {
          const r = q.reglettes.find(x => x.id === p.pieceId);
          if (r) {
            coreChildren.push(new Paragraph({ children: [new TextRun({ text: "", size: 8 })], spacing: { before: 0, after: 80 } }));
            coreChildren.push(...builders.buildReglette(r));
          }
        }
      });
      if (coreChildren.length === 0) return;
      coreChildren.push(new Paragraph({ children: [new TextRun({ text: "", size: 4 })], spacing: { before: 0, after: 0 } }));

      // Enveloppe cantSplit : la question ne se coupe pas entre deux pages.
      // PAS de saut de page forcé → les questions s'enchaînent pour densifier le cahier.
      bodyChildren.push(new Table({
        width: { size: 10500, type: WidthType.DXA },
        columnWidths: [10500],
        rows: [new TableRow({
          cantSplit: true,
          children: [new TableCell({
            width: { size: 10500, type: WidthType.DXA },
            borders: WRAPPER_NO_BORDERS,
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: coreChildren
          })]
        })]
      }));
      // Mince séparateur entre deux questions
      bodyChildren.push(new Paragraph({ children: [new TextRun({ text: "", size: 12 })], spacing: { before: 0, after: 120 } }));
    });

    // ---- DOCUMENTS REGROUPÉS À LA FIN (numérotés 1..N), appariés si étroits ----
    if (endDocs.length > 0) {
      bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
      bodyChildren.push(new Paragraph({
        children: [new TextRun({ text: "Documents", bold: true, size: 32, color: "8B3A2E" })],
        spacing: { after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "8B3A2E", space: 4 } }
      }));

      const slots = [];
      let i = 0;
      while (i < endDocs.length) {
        const a = endDocs[i];
        const b = (i + 1 < endDocs.length) ? endDocs[i + 1] : null;
        if (b && a.narrow && b.narrow) { slots.push([a.doc, b.doc]); i += 2; }
        else { slots.push([a.doc]); i += 1; }
      }
      slots.forEach((slot, sIdx) => {
        if (sIdx > 0) {
          bodyChildren.push(new Paragraph({ children: [new TextRun({ text: "", size: 8 })], spacing: { before: 0, after: 80 } }));
        }
        if (slot.length === 1) bodyChildren.push(...builders.buildDocument(slot[0]));
        else bodyChildren.push(builders.buildPairedDocuments(slot[0], slot[1]));
      });
    }

    const doc = new Document({
      creator: "HQC 3e secondaire",
      title: "Cahier de l'élève (variante — documents à la fin)",
      styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
      sections: c1SplitSections(bodyChildren, undefined, { coverFirstPage: true })
    });

    return await Packer.toBlob(doc);
  }

  // ====== GÉNÉRATION DU GUIDE DE L'ENSEIGNANT (corrigé) ======
  // Mise en page concise : pas de page couverture, pas de documents, pas d'espace de réponse vide.
  // Chaque question : titre + énoncé + corrigé surligné + réglette compacte.
  async function buildCorrigeBlob(flat) {
    const {
      Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
      AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign, PageBreak
    } = docx;

    const TEXT_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
    const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const ALL_BORDERS = { top: TEXT_BORDER, bottom: TEXT_BORDER, left: TEXT_BORDER, right: TEXT_BORDER };
    const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 };

    // Grouper les pièces par question (on conserve les pièces pour pouvoir, en mode variante,
    // compter les documents réellement présents — strictement la même logique que le cahier variante).
    const groups = [];
    let cur = null;
    state.cahier.forEach(p => {
      if (!cur || cur.questionId !== p.questionId) {
        cur = { questionId: p.questionId, pieces: [] };
        groups.push(cur);
      }
      cur.pieces.push(p);
    });

    // MODE VARIANTE : numérotation globale des documents, IDENTIQUE à buildDocxBlobFlat
    // (mêmes pièces-documents comptées, dans le même ordre) → les renvois du guide concordent
    // exactement avec le cahier variante. Le guide n'affiche pas les documents pour autant.
    if (flat) {
      let globalDoc = 0;
      groups.forEach(g => {
        const q = DATA.questions.find(x => x.id === g.questionId);
        g._map = {};
        if (!q) return;
        const presentIds = new Set((g.pieces || []).filter(p => p.kind === 'document').map(p => p.pieceId));
        q.documents.forEach((doc, i) => {
          if (!presentIds.has(doc.id)) return;
          globalDoc++;
          g._map[localDocNumber(doc, i)] = globalDoc;
        });
      });
    }

    const bodyChildren = [];

    // Déterminer le titre dynamique selon les questions sélectionnées (même logique que la couverture du cahier)
    const corrNiveaux = new Set();
    const corrRealites = new Set();
    const corrPeriodesGlobales = new Set();
    groups.forEach(g => {
      const q = DATA.questions.find(x => x.id === g.questionId);
      if (q) {
        corrNiveaux.add(q.niveau);
        corrRealites.add(q.realite_sociale_id);
        const annee = q.annee || 3;
        corrPeriodesGlobales.add((annee - 3) * 4 + q.niveau);
      }
    });
    const corrUniformNiveau = corrNiveaux.size === 1 ? [...corrNiveaux][0] : null;
    const corrUniformPeriodeGlobale = corrPeriodesGlobales.size === 1 ? [...corrPeriodesGlobales][0] : null;
    const corrUniformRealiteId = corrRealites.size === 1 ? [...corrRealites][0] : null;
    const corrUniformRealiteTitre = corrUniformRealiteId
      ? (DATA.realites_sociales.find(r => r.id === corrUniformRealiteId) || {}).titre
      : null;

    // Construire le sous-titre selon ce qui est sélectionné
    let subtitleText;
    if (corrUniformRealiteTitre && corrUniformPeriodeGlobale != null) {
      subtitleText = `${corrUniformRealiteTitre} · Période ${corrUniformPeriodeGlobale}`;
    } else if (corrUniformRealiteTitre) {
      subtitleText = corrUniformRealiteTitre;
    } else if (corrRealites.size > 1) {
      const titres = [...corrRealites]
        .map(id => (DATA.realites_sociales.find(r => r.id === id) || {}).titre)
        .filter(Boolean);
      subtitleText = titres.join(' · ');
    } else {
      subtitleText = '';
    }

    // Trier les groupes (OI → C1 → C2) AVANT la page titre, afin de connaître l'orientation de la
    // première section et d'y rattacher le titre. Sans cela, un guide commençant par une C1 (paysage)
    // émettait le titre en portrait, suivi d'un saut de section → page titre quasi vide en portrait,
    // puis le contenu C1 en paysage à la page suivante.
    const _banners = sectionizeGroups(groups);
    const _firstQ = groups.length ? DATA.questions.find(x => x.id === groups[0].questionId) : null;
    let _orient = (_firstQ && categoryOf(_firstQ) === 'c1') ? 'landscape' : 'portrait';
    if (_orient === 'landscape') bodyChildren.push({ __orient: 'landscape' });

    // Titre du guide (émis dans l'orientation de la première section)
    bodyChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text: "Histoire du Québec et du Canada", allCaps: true, bold: true, size: 17, color: "6E685C", characterSpacing: 26 })]
    }));
    bodyChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
      children: [new TextRun({ text: "Guide de l'enseignant", bold: true, size: 38, color: "2A2620", font: "Georgia" })]
    }));
    if (subtitleText) {
      bodyChildren.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: subtitleText, italics: true, size: 22, color: "6E685C" })]
      }));
    }
    bodyChildren.push(new Paragraph({
      spacing: { before: 0, after: 300 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "8B3A2E", space: 4 } },
      children: [new TextRun({ text: "" })]
    }));

    // ---- APERÇU DE L'ÉVALUATION ----
    // Vue de correction synthèse : pour chaque question, son type et sa pondération, puis le total.
    // L'enseignant voit la structure de l'évaluation avant les corrigés détaillés.
    {
      const ov = groups
        .map(g => DATA.questions.find(x => x.id === g.questionId))
        .filter(Boolean);
      if (ov.length > 1) {
        const OV_B = { style: BorderStyle.SINGLE, size: 4, color: "B8B1A2" };
        const OV_BORDERS = { top: OV_B, bottom: OV_B, left: OV_B, right: OV_B };
        const wNum = 900, wType = 5400, wPts = 1400;
        const cell = (txt, opts) => new TableCell({
          width: { size: opts.w, type: WidthType.DXA },
          borders: OV_BORDERS,
          shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 50, bottom: 50, left: 110, right: 110 },
          children: [new Paragraph({
            alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
            children: [new TextRun({ text: txt, bold: !!opts.bold, size: opts.size || 18, color: opts.color || "2A2620" })]
          })]
        });
        const rows = [new TableRow({
          tableHeader: true,
          children: [
            cell("No", { w: wNum, bold: true, center: true, fill: "F0EAD9" }),
            cell("Type de question", { w: wType, bold: true, fill: "F0EAD9" }),
            cell("Points", { w: wPts, bold: true, center: true, fill: "F0EAD9" })
          ]
        })];
        let totalPts = 0;
        ov.forEach((q, i) => {
          const pts = computeQuestionPoints(q);
          totalPts += pts;
          rows.push(new TableRow({
            children: [
              cell(String(i + 1), { w: wNum, center: true }),
              cell(questionTag(q), { w: wType }),
              cell(pts > 0 ? `/ ${pts}` : "—", { w: wPts, center: true })
            ]
          }));
        });
        rows.push(new TableRow({
          children: [
            cell("Total", { w: wNum + wType, bold: true, color: "8B3A2E" }),
            cell(`/ ${totalPts}`, { w: wPts, center: true, bold: true, color: "8B3A2E", size: 20 })
          ]
        }));
        // La cellule Total fusionne visuellement No+Type via columnSpan
        rows[rows.length - 1] = new TableRow({
          children: [
            new TableCell({
              width: { size: wNum + wType, type: WidthType.DXA },
              columnSpan: 2, borders: OV_BORDERS, verticalAlign: VerticalAlign.CENTER,
              shading: { fill: "F7F3EA", type: ShadingType.CLEAR, color: "auto" },
              margins: { top: 50, bottom: 50, left: 110, right: 110 },
              children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true, size: 19, color: "8B3A2E" })] })]
            }),
            new TableCell({
              width: { size: wPts, type: WidthType.DXA },
              borders: OV_BORDERS, verticalAlign: VerticalAlign.CENTER,
              shading: { fill: "F7F3EA", type: ShadingType.CLEAR, color: "auto" },
              margins: { top: 50, bottom: 50, left: 110, right: 110 },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `/ ${totalPts}`, bold: true, size: 20, color: "8B3A2E" })] })]
            })
          ]
        });
        bodyChildren.push(new Paragraph({
          spacing: { before: 0, after: 80 },
          children: [new TextRun({ text: "Aperçu de l'évaluation", allCaps: true, bold: true, size: 19, color: "6E685C", characterSpacing: 22 })]
        }));
        bodyChildren.push(new Table({
          width: { size: wNum + wType + wPts, type: WidthType.DXA },
          columnWidths: [wNum, wType, wPts],
          rows
        }));
        bodyChildren.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 160 } }));
      }
    }

    let _prevComp = null;
    groups.forEach((g, idx) => {
      const qRaw = DATA.questions.find(x => x.id === g.questionId);
      if (!qRaw) return;
      const isC1 = categoryOf(qRaw) === 'c1';
      // Orientation : la page corrigé C1 passe en paysage (saut de section) ; le reste reste portrait.
      let _switched = false;
      const startOrient = isC1 ? 'landscape' : 'portrait';
      if (startOrient !== _orient) { bodyChildren.push({ __orient: startOrient }); _orient = startOrient; _switched = true; }
      if (_banners) {
        const _c = categoryOf(qRaw);
        if (_c !== _prevComp) {
          if (_prevComp !== null && !_switched) bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
          bodyChildren.push(sectionBanner(docx, _c));
          _prevComp = _c;
        }
      }
      // En mode variante : renumérotation globale de l'énoncé, de l'espace de réponse ET du
      // corrigé (les corrigés du type ["Document 1","Document 3"] / {before:[…]} passent par
      // la même règle « Document N → Document N+décalage »).
      const q = flat
        ? (function () {
            const base = renumberQuestion(qRaw, g._map || {});
            return { ...base, corrige: deepRenumber(qRaw.corrige, makeDocRenumberer(g._map || {})) };
          })()
        : qRaw;
      const seqNumero = idx + 1;

      // Titre concis : "QUESTION N" (petites capitales, numéro burgundy)
      bodyChildren.push(new Paragraph({
        spacing: { before: 200, after: 60 },
        keepNext: true,
        children: [
          new TextRun({ text: "Question ", allCaps: true, bold: true, size: 24, color: "2A2620", characterSpacing: 22 }),
          new TextRun({ text: `${seqNumero}`, bold: true, size: 26, color: "8B3A2E" })
        ],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D9D4C8", space: 3 } }
      }));

      // Énoncé (prompt + bullets s'il y en a, sans les instructions de format)
      bodyChildren.push(new Paragraph({
        spacing: { after: 60 },
        keepNext: true,
        children: [new TextRun({ text: q.questionBody.prompt, size: 22 })]
      }));

      if (q.questionBody.bullets) {
        q.questionBody.bullets.forEach(b => {
          bodyChildren.push(new Paragraph({
            spacing: { after: 20 },
            children: [new TextRun({ text: "• " + b, size: 22 })],
            indent: { left: 360 }
          }));
        });
      }

      // Compétence 1 : schéma corrigé (page paysage) → saut de page → grille (page paysage)
      if (isC1) {
        bodyChildren.push(...buildCorrigeBlock(docx, q));
        bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
        bodyChildren.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Grille d'évaluation", bold: true, size: 22, color: "2A2620" })] }));
        (q.reglettes || []).forEach(r => bodyChildren.push(buildC1GridTable(docx, r)));
        return;
      }

      // Bloc CORRIGÉ — fond beige, bordure burgundy, texte rouge
      bodyChildren.push(...buildCorrigeBlock(docx, q));

      // Réglette compacte
      if (q.reglettes && q.reglettes.length > 0) {
        const r = q.reglettes[0];
        // Petite réglette avec une seule ligne de barème
        if (r.type === 'simple' && r.levels) {
          const totalW = 9000;
          const cellW = Math.floor(totalW / r.levels.length);
          const cells = r.levels.map(lvl => {
            // Isoler « (N sur M) » sur sa propre ligne en italique gris (même règle que la version cahier).
            const countMatch = lvl.condition.match(/\s*(\([^)]*sur[^)]*\))\s*\.?\s*$/i);
            const mainText = countMatch
              ? lvl.condition.slice(0, countMatch.index).replace(/\s+$/, '')
              : lvl.condition;
            const countText = countMatch ? countMatch[1] : null;
            const paragraphs = [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: lvl.points, bold: true, size: 16 })] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: countText ? 40 : 0 },
                children: [new TextRun({ text: mainText, size: 14 })]
              })
            ];
            if (countText) {
              paragraphs.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: countText, size: 14, color: "6E685C", italics: true })]
              }));
            }
            return new TableCell({
              width: { size: cellW, type: WidthType.DXA },
              borders: ALL_BORDERS,
              verticalAlign: VerticalAlign.CENTER,
              margins: CELL_MARGINS,
              children: paragraphs
            });
          });
          bodyChildren.push(new Table({
            width: { size: totalW, type: WidthType.DXA },
            columnWidths: r.levels.map(() => cellW),
            rows: [new TableRow({ children: cells })]
          }));
        } else if (r.type === 'complex') {
          // Pour la causalité : on liste seulement le max et le min de manière compacte
          bodyChildren.push(new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "Barème : ", bold: true, size: 16, color: "6E685C" }),
              new TextRun({ text: `${r.maxPoints} points (rubrique causalité détaillée)`, italics: true, size: 16, color: "6E685C" })
            ]
          }));
        } else if (r.type === 'c1-grid') {
          // Compétence 1 : grille /8 complète dans le guide
          bodyChildren.push(buildC1GridTable(docx, r));
        }
      }
    });

    const doc = new Document({
      creator: "HQC 3e secondaire — Guide de l'enseignant",
      title: "Guide de l'enseignant",
      styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
      sections: c1SplitSections(bodyChildren, { top: 900, right: 1080, bottom: 900, left: 1080 })
    });

    return await Packer.toBlob(doc);
  }

  // ====== COMPÉTENCE 1 — Rendu du schéma descriptif + de la grille /8 ======
  // Fonctions partagées par le cahier (buildQuestionBody / buildReglette) et le guide
  // (buildCorrigeBlock / réglette du corrigé). `d` = bibliothèque docx.

  // Organisateur graphique C1 : objet de la description + 2 mises en relation
  // (élément central + 2 satellites). filled=false → cahier (vide) ; filled=true → guide (corrigé rouge).
  function buildC1SchemaTable(d, rs, corrige, filled) {
    const { Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign, HeightRule } = d;
    const W = 14400, RED = "C00000", GRAY = "6E685C", DARK = "2A2620", PILL = "9A938A", ACCENT = "8B3A2E";
    const TB = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
    const ALL = { top: TB, bottom: TB, left: TB, right: TB };
    const NOB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const NONE = { top: NOB, bottom: NOB, left: NOB, right: NOB };
    const cor = filled ? corrige : { objet: {}, relations: [{ central: {}, satellites: [{}, {}] }, { central: {}, satellites: [{}, {}] }] };
    function pill(t) {
      return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 90 }, shading: { fill: PILL, type: ShadingType.CLEAR },
        children: [new TextRun({ text: t, bold: true, size: 19, color: "FFFFFF" })] });
    }
    function arrowCell(w, rowSpan) {
      return new TableCell({ width: { size: w, type: WidthType.DXA }, rowSpan, borders: NONE, verticalAlign: VerticalAlign.CENTER,
        margins: { top: 0, bottom: 0, left: 0, right: 0 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "→", bold: true, size: 40, color: ACCENT })] })] });
    }
    function emptyCell(w, rowSpan) {
      return new TableCell({ width: { size: w, type: WidthType.DXA }, rowSpan: rowSpan || 1, borders: NONE,
        margins: { top: 0, bottom: 0, left: 0, right: 0 }, children: [new Paragraph({ children: [new TextRun({ text: "", size: 2 })] })] });
    }
    function box({ header, label, answer, docRef, w, rowSpan, valign }) {
      const kids = [];
      if (header) kids.push(pill(header));
      kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: label, bold: true, size: 19, color: DARK })] }));
      if (filled) {
        kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: docRef ? 20 : 0 }, children: [new TextRun({ text: answer || "", bold: true, size: 21, color: RED })] }));
        if (docRef) kids.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: docRef, italics: true, size: 16, color: GRAY })] }));
      } else {
        kids.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: "", size: 28 })] }));
        kids.push(new Paragraph({ spacing: { before: 140, after: 40 }, children: [new TextRun({ text: "", size: 28 })] }));
      }
      return new TableCell({ width: { size: w, type: WidthType.DXA }, rowSpan: rowSpan || 1, borders: ALL,
        verticalAlign: valign || VerticalAlign.CENTER, margins: { top: 90, bottom: 90, left: 120, right: 120 }, children: kids });
    }
    const wObjet = 3000, wArr1 = 600, wCentral = 4200, wArr2 = 600, wSat = 6000;
    const objetCell = box({ header: "Objet de la description", label: rs.objet.label, answer: cor.objet.answer, w: wObjet, rowSpan: 7, valign: VerticalAlign.TOP });
    const central = (i) => box({ header: "Élément central", label: rs.relations[i].central.label, answer: cor.relations[i].central.answer, docRef: cor.relations[i].central.docRef, w: wCentral, rowSpan: 3, valign: VerticalAlign.TOP });
    const sat = (i, j) => box({ label: rs.relations[i].satellites[j].label, answer: cor.relations[i].satellites[j].answer, docRef: cor.relations[i].satellites[j].docRef, w: wSat });
    const thin = { value: 130, rule: HeightRule.ATLEAST };
    const sep  = { value: 340, rule: HeightRule.ATLEAST };
    const rows = [
      new TableRow({ children: [objetCell, arrowCell(wArr1, 3), central(0), arrowCell(wArr2, 1), sat(0, 0)] }),
      new TableRow({ height: thin, children: [emptyCell(wArr2), emptyCell(wSat)] }),
      new TableRow({ children: [arrowCell(wArr2, 1), sat(0, 1)] }),
      new TableRow({ height: sep,  children: [emptyCell(wArr1), emptyCell(wCentral), emptyCell(wArr2), emptyCell(wSat)] }),
      new TableRow({ children: [arrowCell(wArr1, 3), central(1), arrowCell(wArr2, 1), sat(1, 0)] }),
      new TableRow({ height: thin, children: [emptyCell(wArr2), emptyCell(wSat)] }),
      new TableRow({ children: [arrowCell(wArr2, 1), sat(1, 1)] })
    ];
    return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [wObjet, wArr1, wCentral, wArr2, wSat], rows });
  }

  // Grille d'évaluation /8 — version paysage agrandie.
  function buildC1GridTable(d, r) {
    const { Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } = d;
    const W = 14400;
    const TB = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
    const ALL = { top: TB, bottom: TB, left: TB, right: TB };
    function cell(text, o) {
      o = o || {};
      return new TableCell({ width: { size: o.w, type: WidthType.DXA }, columnSpan: o.span, rowSpan: o.rowSpan,
        borders: ALL, verticalAlign: VerticalAlign.CENTER, shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR } : undefined,
        margins: o.margins || { top: 50, bottom: 50, left: 110, right: 110 },
        children: [new Paragraph({ alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text, bold: !!o.bold, size: o.size || 18 })] })] });
    }
    const rows = [];
    rows.push(new TableRow({ children: [cell(r.objet.title, { w: W, span: 4, bold: true, center: true, fill: "DDD9D2", size: 19 })] }));
    const objTot = 900, objColW = Math.floor((W - objTot) / 3);
    const objCells = r.objet.levels.map((lv, i) => new TableCell({
      width: { size: i === 2 ? (W - objTot - 2 * objColW) : objColW, type: WidthType.DXA }, borders: ALL, verticalAlign: VerticalAlign.TOP,
      margins: { top: 60, bottom: 60, left: 110, right: 110 },
      children: [ new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: lv.condition, size: 18 })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: lv.points, bold: true, size: 18 })] }) ] }));
    objCells.push(cell("/2", { w: objTot, center: true, bold: true, size: 19 }));
    rows.push(new TableRow({ children: objCells }));
    rows.push(new TableRow({ children: [cell(r.relationTitle, { w: W, span: 4, bold: true, center: true, fill: "DDD9D2", size: 19 })] }));
    const cLabel = 2100, cPts = 1300, cTot = 900, cBranch = 3600, cCentral = W - cLabel - cBranch - cPts - cTot;
    const matrix = r.relationMatrix;
    const totalBranches = matrix.reduce((s, m) => s + m.branches.length, 0);
    r.relationLabels.forEach((relLabel) => {
      let first = true;
      matrix.forEach((m) => {
        m.branches.forEach((b, bi) => {
          const cells = [];
          if (first) { cells.push(cell(relLabel, { w: cLabel, rowSpan: totalBranches, bold: true, center: true, size: 18 })); first = false; }
          if (bi === 0) cells.push(cell(m.central, { w: cCentral, rowSpan: m.branches.length, size: 18 }));
          cells.push(cell(b.condition, { w: cBranch, size: 17 }));
          cells.push(cell(b.points, { w: cPts, center: true, size: 18 }));
          if (matrix[0] === m && matrix[0].branches[0] === b) cells.push(cell("/3", { w: cTot, center: true, bold: true, rowSpan: totalBranches, size: 19 }));
          rows.push(new TableRow({ children: cells }));
        });
      });
    });
    rows.push(new TableRow({ children: [cell("Total", { w: W - cTot, span: 3, bold: true, size: 19 }), cell("/8", { w: cTot, center: true, bold: true, size: 19 })] }));
    return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [cLabel, cCentral, cBranch, cPts, cTot], rows });
  }

  // ----- Orientation paysage des pages C1 (gérée par sections) -----
  function c1OrientProps(orient, portraitMargin) {
    const landMargin = { top: 720, right: 720, bottom: 720, left: 720 };   // paysage : marges serrées → contenu 14400
    const pMargin = portraitMargin || { top: 720, right: 720, bottom: 720, left: 720 };
    if (orient === 'landscape') {
      return { page: { size: { orientation: docx.PageOrientation.LANDSCAPE, width: 12240, height: 15840 }, margin: landMargin } };
    }
    return { page: { size: { width: 12240, height: 15840 }, margin: pMargin } };
  }
  // Découpe un tableau d'enfants (avec d'éventuels marqueurs {__orient}) en sections d'orientation.
  // Les cahiers/guides 100 % OI ne posent aucun marqueur → une seule section portrait (inchangé).
  // Chaque section reçoit un pied de page « Page N » (numérotation continue d'une section à
  // l'autre). opts.coverFirstPage : la première page de la première section est une couverture →
  // pied de page vide sur celle-ci (titlePage), numérotation visible à partir de la page 2.
  function c1SplitSections(children, portraitMargin, opts) {
    opts = opts || {};
    const mkFooter = () => new docx.Footer({
      children: [new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [new docx.TextRun({ children: ["Page ", docx.PageNumber.CURRENT], size: 16, color: "8A8273" })]
      })]
    });
    const mkEmptyFooter = () => new docx.Footer({
      children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "" })] })]
    });
    const out = [];
    let orient = 'portrait', kids = [];
    const flush = () => {
      if (!kids.length) return;
      const properties = c1OrientProps(orient, portraitMargin);
      const sec = { properties, footers: { default: mkFooter() }, children: kids };
      if (opts.coverFirstPage && out.length === 0) {
        sec.properties.titlePage = true;
        sec.footers.first = mkEmptyFooter();
      }
      out.push(sec);
    };
    for (const c of children) {
      if (c && c.__orient) { flush(); orient = c.__orient; kids = []; }
      else kids.push(c);
    }
    flush();
    if (out.length === 0) out.push({ properties: c1OrientProps('portrait', portraitMargin), children: [new docx.Paragraph({ children: [new docx.TextRun("(vide)")] })] });
    return out;
  }

  // Catégorie d'une question : 'oi' (opération intellectuelle), 'c1' (Compétence 1) ou 'c2' (Compétence 2).
  // Les 375 questions atomiques existantes n'ont pas de champ `competence` → 'oi'.
  function categoryOf(q) {
    if (q && q.competence === 1) return 'c1';
    if (q && q.competence === 2) return 'c2';
    return 'oi';
  }
  function categoryRank(c) { return c === 'oi' ? 0 : c === 'c1' ? 1 : 2; }   // ordre des sections : OI → C1 → C2
  function categoryBannerLabel(c) {
    if (c === 'c1') return "Compétence 1 — Caractériser une période";
    if (c === 'c2') return "Compétence 2 — Interpréter une réalité sociale";
    return "Opérations intellectuelles";
  }
  // Étiquette courte affichée dans le catalogue / le cahier (tag de la question).
  function questionTag(q) {
    const c = categoryOf(q);
    if (c === 'c1') return "Compétence 1";
    if (c === 'c2') return "Compétence 2";
    return q.operation;   // question d'OI : son opération intellectuelle
  }
  // Bandeau de section, inséré dans le cahier/guide quand plusieurs catégories cohabitent.
  function sectionBanner(d, cat) {
    const { Paragraph, TextRun, BorderStyle, ShadingType } = d;
    return new Paragraph({ spacing: { before: 0, after: 160 },
      shading: { fill: "8B3A2E", type: ShadingType.CLEAR },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "8B3A2E" } },
      children: [new TextRun({ text: categoryBannerLabel(cat), bold: true, size: 26, color: "FFFFFF" })] });
  }
  // Trie les groupes EN PLACE (OI → C1 → C2 ; ordre stable interne) et renvoie true si des
  // bandeaux de section doivent être émis : dès qu'une section C1 ou C2 est présente.
  // Un cahier 100 % OI reste sans bandeau (comportement existant inchangé).
  function sectionizeGroups(groups) {
    const cats = new Set(groups.map(g => categoryOf(DATA.questions.find(x => x.id === g.questionId))));
    if (!(cats.has('c1') || cats.has('c2'))) return false;
    groups.sort((a, b) => categoryRank(categoryOf(DATA.questions.find(x => x.id === a.questionId)))
                        - categoryRank(categoryOf(DATA.questions.find(x => x.id === b.questionId))));
    return true;
  }

  // ====== BLOC CORRIGÉ (rendu adaptatif selon le type de réponse) ======
  function buildCorrigeBlock(d, q) {
    const { Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } = d;
    const out = [];
    if (q.corrige === undefined || q.corrige === null) {
      out.push(new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({ text: "[Corrigé non disponible]", italics: true, color: "999999", size: 18 })]
      }));
      return out;
    }

    const rs = q.questionBody.responseSpace;
    // Compétence 1 : schéma rempli (réponses en rouge + renvois aux documents)
    if (rs && rs.type === 'c1-schema') {
      out.push(buildC1SchemaTable(d, rs, q.corrige, true));
      const disc = q.documentsADiscriminer || [];
      if (disc.length) {
        const fmt = disc.length <= 1 ? String(disc[0])
          : disc.slice(0, -1).join(', ') + ' et ' + disc[disc.length - 1];
        out.push(new Paragraph({
          spacing: { before: 160, after: 0 },
          children: [
            new TextRun({ text: "Documents à discriminer : ", bold: true, size: 20, color: "C00000" }),
            new TextRun({ text: fmt, size: 20, color: "C00000" })
          ]
        }));
      }
      return out;
    }
    const SHADING = { fill: "FDF6EC", type: ShadingType.CLEAR, color: "auto" };
    const ANSWER_BORDER = { style: BorderStyle.SINGLE, size: 6, color: "8B3A2E" };
    const ANSWER_BORDERS = { top: ANSWER_BORDER, bottom: ANSWER_BORDER, left: ANSWER_BORDER, right: ANSWER_BORDER };
    const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const ANSWER_CELL_MARGINS = { top: 120, bottom: 120, left: 160, right: 160 };

    // === Helpers d'affichage des réponses numériques ===
    // Quand les items à afficher sont tous de la forme "Document N" (N ∈ [1, 20]),
    // on les rend en chiffres entourés ①②③… en gros (60pt). Sinon, texte plat avec
    // séparateur " · ". Utilisé par chrono-ordering, before-after-axis et category-buckets.
    const docNum = (s) => {
      const m = /^Document (\d+)$/.exec(s || '');
      if (!m) return null;
      const n = parseInt(m[1], 10);
      return (n >= 1 && n <= 20) ? n : null;
    };
    const circledDigit = (n) => String.fromCodePoint(0x2460 + n - 1);  // ① = U+2460
    function buildAnswerLine(items, opts) {
      const arr = items || [];
      const nums = arr.map(docNum);
      const allNumeric = arr.length > 0 && nums.every(n => n !== null);
      const o = opts || {};
      if (allNumeric) {
        return new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: o.spacing || undefined,
          children: [new TextRun({
            text: nums.map(circledDigit).join(' '),
            size: 80, color: "8B3A2E"
          })]
        });
      }
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: o.spacing || undefined,
        children: [new TextRun({
          text: arr.length ? arr.join(' · ') : '—',
          bold: true, size: 22, color: "8B3A2E"
        })]
      });
    }

    // 1) Texte simple (réponse type "lines")
    if (typeof q.corrige === 'string') {
      out.push(new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [new TextRun({ text: "✓ Corrigé", bold: true, size: 18, color: "8B3A2E" })]
      }));
      out.push(new Table({
        width: { size: 9000, type: WidthType.DXA }, columnWidths: [9000],
        rows: [new TableRow({ cantSplit: true, children: [new TableCell({
          width: { size: 9000, type: WidthType.DXA },
          borders: ANSWER_BORDERS, shading: SHADING, margins: ANSWER_CELL_MARGINS,
          children: [
            new Paragraph({ children: [new TextRun({ text: q.corrige, size: 20 })] })
          ]
        })] })]
      }));
      return out;
    }

    // 2) Réponse "labeled-list" : tableau item / valeur
    if (rs && rs.type === 'labeled-list' && Array.isArray(q.corrige)) {
      const rows = (rs.items || []).map((item, i) => new TableRow({ children: [
        new TableCell({
          width: { size: 5400, type: WidthType.DXA }, borders: ANSWER_BORDERS, shading: SHADING,
          verticalAlign: VerticalAlign.CENTER, margins: ANSWER_CELL_MARGINS,
          children: [new Paragraph({ children: [new TextRun({ text: item, size: 20 })] })]
        }),
        new TableCell({
          width: { size: 3600, type: WidthType.DXA }, borders: ANSWER_BORDERS, shading: SHADING,
          verticalAlign: VerticalAlign.CENTER, margins: ANSWER_CELL_MARGINS,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: q.corrige[i] || '—', bold: true, size: 22, color: "8B3A2E" })] })]
        })
      ] }));
      out.push(new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: "✓ Corrigé", bold: true, size: 18, color: "8B3A2E" })] }));
      out.push(new Table({ width: { size: 9000, type: WidthType.DXA }, columnWidths: [5400, 3600], rows }));
      return out;
    }

    // 2b) Réponse "chrono-ordering" : N cases avec flèches, étiquettes au-dessus,
    //     réponses dans les cases (sans le libellé qui est désormais hors de la case).
    if (rs && rs.type === 'chrono-ordering' && Array.isArray(q.corrige)) {
      const items = rs.items || [];
      const n = items.length;
      const totalW = 9000;
      const arrowW = 450;
      const boxW = Math.floor((totalW - (n - 1) * arrowW) / n);
      const widths = [];
      const labelRow = [];
      const boxRow = [];
      items.forEach((label, i) => {
        widths.push(boxW);
        labelRow.push(new TableCell({
          width: { size: boxW, type: WidthType.DXA },
          borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
          verticalAlign: VerticalAlign.BOTTOM,
          margins: { top: 0, bottom: 60, left: 0, right: 0 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: label, size: 14, italics: true, color: "6E685C" })]
          })]
        }));
        boxRow.push(new TableCell({
          width: { size: boxW, type: WidthType.DXA },
          borders: ANSWER_BORDERS, shading: SHADING,
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 80, right: 80 },
          children: [buildAnswerLine([q.corrige[i]])]
        }));
        if (i < n - 1) {
          widths.push(arrowW);
          labelRow.push(new TableCell({
            width: { size: arrowW, type: WidthType.DXA },
            borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
            children: [new Paragraph({ children: [new TextRun({ text: "" })] })]
          }));
          boxRow.push(new TableCell({
            width: { size: arrowW, type: WidthType.DXA },
            borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "→", size: 32, bold: true })]
            })]
          }));
        }
      });
      out.push(new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: "✓ Corrigé", bold: true, size: 18, color: "8B3A2E" })] }));
      out.push(new Table({
        width: { size: totalW, type: WidthType.DXA },
        columnWidths: widths,
        rows: [
          new TableRow({ children: labelRow }),
          new TableRow({ height: { value: 800, rule: "atLeast" }, children: boxRow })
        ]
      }));
      return out;
    }

    // 2c) Réponse "before-after-axis" : axe à 3 boîtes (Antériorité ← pivot → Postériorité).
    //     Dans le corrigé, les boîtes latérales contiennent les documents corrects.
    //     q.corrige attendu : { before: [string, ...], after: [string, ...] }
    if (rs && rs.type === 'before-after-axis' && q.corrige && typeof q.corrige === 'object' && !Array.isArray(q.corrige)) {
      const beforeLabel = rs.beforeLabel || 'Antériorité (Avant)';
      const afterLabel  = rs.afterLabel  || 'Postériorité (Après)';
      const pivot       = rs.pivot       || '';
      const beforeItems = q.corrige.before || [];
      const afterItems  = q.corrige.after  || [];
      const totalW = 9000;
      const arrowW = 400;
      const sideW = Math.floor((totalW - 2 * arrowW) * 0.32);
      const centerW = totalW - 2 * sideW - 2 * arrowW;
      const widths = [sideW, arrowW, centerW, arrowW, sideW];
      const baCells = [
        new TableCell({
          width: { size: sideW, type: WidthType.DXA },
          borders: ANSWER_BORDERS, shading: SHADING,
          verticalAlign: VerticalAlign.TOP,
          margins: { top: 100, bottom: 100, left: 80, right: 80 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
              children: [new TextRun({ text: beforeLabel, bold: true, size: 16, color: "6E685C" })]
            }),
            buildAnswerLine(beforeItems)
          ]
        }),
        new TableCell({
          width: { size: arrowW, type: WidthType.DXA },
          borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "←", size: 30, bold: true })] })]
        }),
        new TableCell({
          width: { size: centerW, type: WidthType.DXA },
          borders: ANSWER_BORDERS,
          shading: { fill: "F5EFE2", type: ShadingType.CLEAR, color: "auto" },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 100, right: 100 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: pivot, bold: true, size: 18 })]
          })]
        }),
        new TableCell({
          width: { size: arrowW, type: WidthType.DXA },
          borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "→", size: 30, bold: true })] })]
        }),
        new TableCell({
          width: { size: sideW, type: WidthType.DXA },
          borders: ANSWER_BORDERS, shading: SHADING,
          verticalAlign: VerticalAlign.TOP,
          margins: { top: 100, bottom: 100, left: 80, right: 80 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
              children: [new TextRun({ text: afterLabel, bold: true, size: 16, color: "6E685C" })]
            }),
            buildAnswerLine(afterItems)
          ]
        })
      ];
      out.push(new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: "✓ Corrigé", bold: true, size: 18, color: "8B3A2E" })] }));
      out.push(new Table({
        width: { size: totalW, type: WidthType.DXA },
        columnWidths: widths,
        rows: [new TableRow({ height: { value: 1000, rule: "atLeast" }, children: baCells })]
      }));
      return out;
    }

    // 2d) Réponse "category-buckets" : N boîtes côte à côte, l'élève range des items dans chaque catégorie.
    //     q.corrige attendu : array d'arrays de strings — un sous-tableau par catégorie, dans le même ordre
    //     que rs.categories. Ex. pour 2 catégories : [["Document 1", "Document 2"], ["Document 3"]].
    //     Affichage géré par buildAnswerLine (cercles entourés si tous "Document N", sinon texte plat).
    if (rs && rs.type === 'category-buckets' && Array.isArray(q.corrige) && Array.isArray(q.corrige[0])) {
      const categories = rs.categories || [];
      const totalW = 9000;
      const cellW = Math.floor(totalW / Math.max(categories.length, 1));
      const widths = categories.map(() => cellW);

      const bucketCells = categories.map((cat, i) => new TableCell({
        width: { size: cellW, type: WidthType.DXA },
        borders: ANSWER_BORDERS, shading: SHADING,
        verticalAlign: VerticalAlign.TOP,
        margins: { top: 100, bottom: 100, left: 80, right: 80 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [new TextRun({ text: cat, bold: true, size: 16, color: "6E685C" })]
          }),
          buildAnswerLine(q.corrige[i])
        ]
      }));
      out.push(new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: "✓ Corrigé", bold: true, size: 18, color: "8B3A2E" })] }));
      out.push(new Table({
        width: { size: totalW, type: WidthType.DXA },
        columnWidths: widths,
        rows: [new TableRow({ height: { value: 1000, rule: "atLeast" }, children: bucketCells })]
      }));
      return out;
    }

    // 3) Réponse "checkbox-table" : montre le tableau avec cases cochées (☒) / non cochées (☐)
    if (rs && rs.type === 'checkbox-table' && Array.isArray(q.corrige)) {
      const cols = rs.columns || []; const rowItems = rs.rows || [];
      const totalW = 9000, firstColW = 3600;
      const otherColW = Math.floor((totalW - firstColW) / Math.max(cols.length, 1));
      const headerCells = [
        new TableCell({ width: { size: firstColW, type: WidthType.DXA }, borders: ANSWER_BORDERS, shading: SHADING,
          margins: ANSWER_CELL_MARGINS, children: [new Paragraph({ children: [new TextRun({ text: "" })] })] }),
        ...cols.map(c => new TableCell({ width: { size: otherColW, type: WidthType.DXA }, borders: ANSWER_BORDERS, shading: SHADING,
          verticalAlign: VerticalAlign.CENTER, margins: ANSWER_CELL_MARGINS,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: c, bold: true, size: 18 })] })] }))
      ];
      const trows = [new TableRow({ children: headerCells, tableHeader: true })];
      rowItems.forEach((item, ri) => {
        const checks = q.corrige[ri] || [];
        const cells = [
          new TableCell({ width: { size: firstColW, type: WidthType.DXA }, borders: ANSWER_BORDERS, shading: SHADING,
            verticalAlign: VerticalAlign.CENTER, margins: ANSWER_CELL_MARGINS,
            children: [new Paragraph({ children: [new TextRun({ text: item, size: 20 })] })] }),
          ...cols.map((_, ci) => new TableCell({ width: { size: otherColW, type: WidthType.DXA }, borders: ANSWER_BORDERS, shading: SHADING,
            verticalAlign: VerticalAlign.CENTER, margins: ANSWER_CELL_MARGINS,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: checks[ci] ? "☒" : "☐", bold: true, size: 32, color: checks[ci] ? "8B3A2E" : "999999" })] })] }))
        ];
        trows.push(new TableRow({ children: cells }));
      });
      out.push(new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: "✓ Corrigé", bold: true, size: 18, color: "8B3A2E" })] }));
      out.push(new Table({ width: { size: totalW, type: WidthType.DXA }, columnWidths: [firstColW, ...cols.map(() => otherColW)], rows: trows }));
      return out;
    }

    // Fallback : afficher la valeur brute
    out.push(new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: "✓ Corrigé : ", bold: true, color: "8B3A2E", size: 18 })] }));
    out.push(new Paragraph({ children: [new TextRun({ text: JSON.stringify(q.corrige), size: 20 })] }));
    return out;
  }

  // ====== PAGE COUVERTURE ======
  function buildCoverPage(d) {
    const {
      Paragraph, TextRun, Table, TableRow, TableCell,
      AlignmentType, BorderStyle, WidthType, VerticalAlign
    } = d;

    const TEXT_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
    const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };

    const totalPoints = computeCahierPoints();

    // Détection uniformité niveau / réalité sociale
    const niveaux = new Set();
    const realites = new Set();
    const periodesGlobales = new Set();
    state.cahier.forEach(p => {
      const q = DATA.questions.find(x => x.id === p.questionId);
      if (q) {
        niveaux.add(q.niveau);
        realites.add(q.realite_sociale_id);
        // Période globale P1-P8 : (annee - 3) * 4 + niveau
        const annee = q.annee || 3;
        periodesGlobales.add((annee - 3) * 4 + q.niveau);
      }
    });
    const uniformNiveau = niveaux.size === 1 ? [...niveaux][0] : null;
    const uniformPeriodeGlobale = periodesGlobales.size === 1 ? [...periodesGlobales][0] : null;
    const uniformRealiteId = realites.size === 1 ? [...realites][0] : null;
    const uniformRealite = uniformRealiteId
      ? (DATA.realites_sociales.find(r => r.id === uniformRealiteId) || {}).titre
      : null;

    const out = [];

    // Espacement vertical pour pousser le contenu vers le centre/haut
    out.push(new Paragraph({
      children: [new TextRun({ text: "" })],
      spacing: { before: 1300 }
    }));

    // Surtitre (discipline) : petites capitales espacées, discret
    out.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 160 },
      children: [new TextRun({
        text: "Histoire du Québec et du Canada",
        allCaps: true, bold: true, size: 21, color: "6E685C", characterSpacing: 30
      })]
    }));

    // Titre principal
    out.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [new TextRun({ text: "Cahier de l'élève", bold: true, size: 64, color: "2A2620", font: "Georgia" })]
    }));

    // Double filet d'accent : burgundy épais puis or fin (identité du catalogue)
    out.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 30 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: "8B3A2E", space: 1 } },
      indent: { left: 2800, right: 2800 },
      children: [new TextRun({ text: "" })]
    }));
    out.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 460 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "C89B3C", space: 1 } },
      indent: { left: 3400, right: 3400 },
      children: [new TextRun({ text: "" })]
    }));

    // ---- FRISE CHRONOLOGIQUE ----
    // Les 8 périodes du programme avec leurs années ; celles couvertes par cette évaluation
    // sont colorées (couleur de leur réalité sociale), les autres restent en gris pâle.
    // L'élève situe d'un coup d'œil l'évaluation dans la chronologie du cours.
    if (state.periodes.length) {
      const friseW = 9600;
      const cellW = Math.floor(friseW / state.periodes.length);
      const cells = state.periodes.map(p => {
        const covered = periodesGlobales.has(p.pg);
        const idx = realiteIdxForPeriode(p);
        const fill = covered ? (REALITE_HEX[idx] || '8B3A2E') : 'EFEBE1';
        const fg = covered ? 'FFFFFF' : 'B8B1A2';
        return new TableCell({
          width: { size: cellW, type: WidthType.DXA },
          shading: { fill, type: d.ShadingType.CLEAR, color: 'auto' },
          borders: { top: NO_BORDER, bottom: NO_BORDER,
                     left: { style: BorderStyle.SINGLE, size: 6, color: 'FFFFFF' },
                     right: { style: BorderStyle.SINGLE, size: 6, color: 'FFFFFF' } },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 70, bottom: 70, left: 40, right: 40 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 10 },
              children: [new TextRun({ text: `P${p.pg}`, bold: true, size: 17, color: fg })] }),
            new Paragraph({ alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: p.years, size: 11, color: fg })] })
          ]
        });
      });
      out.push(new Table({
        width: { size: friseW, type: WidthType.DXA },
        columnWidths: state.periodes.map(() => cellW),
        alignment: AlignmentType.CENTER,
        rows: [new TableRow({ height: { value: 560, rule: 'atLeast' }, children: cells })]
      }));
      out.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 420 } }));
    }

    // Réalité sociale (la frise ci-dessus situe déjà la période ; on nomme la réalité)
    if (uniformRealite) {
      out.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 700 },
        children: [new TextRun({ text: uniformRealite, italics: true, size: 28 })]
      }));
    } else {
      out.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 700 } }));
    }

    // Champs : Nom, Groupe, Date — tableau 2 colonnes
    const fieldRow = (label) => new TableRow({
      height: { value: 600, rule: "atLeast" },
      children: [
        new TableCell({
          width: { size: 2000, type: WidthType.DXA },
          borders: NO_BORDERS,
          verticalAlign: VerticalAlign.BOTTOM,
          margins: { top: 120, bottom: 120, left: 0, right: 240 },
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `${label} :`, bold: true, size: 28 })]
          })]
        }),
        new TableCell({
          width: { size: 5500, type: WidthType.DXA },
          borders: { top: NO_BORDER, bottom: TEXT_BORDER, left: NO_BORDER, right: NO_BORDER },
          margins: { top: 120, bottom: 120, left: 0, right: 0 },
          children: [new Paragraph({ children: [new TextRun({ text: "" })] })]
        })
      ]
    });
    out.push(new Table({
      width: { size: 7500, type: WidthType.DXA },
      columnWidths: [2000, 5500],
      alignment: AlignmentType.CENTER,
      rows: [fieldRow('Nom'), fieldRow('Groupe'), fieldRow('Date')]
    }));

    // Pondération de l'évaluation — une ligne par PARTIE présente dans le cahier (OI / C1 / C2),
    // puis le Total. Une partie n'apparaît que si elle vaut plus de 0 point dans ce cahier.
    out.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { before: 1200 } }));

    const ponder = computeCahierPointsByCategory();
    const SEP = { style: BorderStyle.SINGLE, size: 8, color: "6E685C" };
    const wLabel = 3800, wLine = 1700, wPts = 1700;
    const ponderRow = (label, pts, opts) => {
      opts = opts || {};
      const size = opts.size || 24;
      const color = opts.color || "2A2620";
      const topB = opts.topBorder ? SEP : NO_BORDER;
      return new TableRow({
        height: { value: opts.tall ? 720 : 540, rule: "atLeast" },
        children: [
          new TableCell({ width: { size: wLabel, type: WidthType.DXA }, verticalAlign: VerticalAlign.BOTTOM,
            borders: { top: topB, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
            margins: { top: 100, bottom: 100, left: 0, right: 220 },
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${label} :`, bold: true, size, color })] })] }),
          new TableCell({ width: { size: wLine, type: WidthType.DXA }, verticalAlign: VerticalAlign.BOTTOM,
            borders: { top: topB, bottom: TEXT_BORDER, left: NO_BORDER, right: NO_BORDER },
            margins: { top: 100, bottom: 100, left: 0, right: 0 },
            children: [new Paragraph({ children: [new TextRun({ text: "" })] })] }),
          new TableCell({ width: { size: wPts, type: WidthType.DXA }, verticalAlign: VerticalAlign.BOTTOM,
            borders: { top: topB, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
            margins: { top: 100, bottom: 100, left: 200, right: 0 },
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: `/ ${pts} points`, bold: true, size, color })] })] })
        ]
      });
    };
    const ponderRows = [];
    if (ponder.oi > 0) ponderRows.push(ponderRow("Opérations intellectuelles", ponder.oi));
    if (ponder.c1 > 0) ponderRows.push(ponderRow("Compétence 1", ponder.c1));
    if (ponder.c2 > 0) ponderRows.push(ponderRow("Compétence 2", ponder.c2));
    const hasParts = ponderRows.length > 0;   // total séparé par un filet s'il y a des parties détaillées
    ponderRows.push(ponderRow("Total", ponder.total, { size: 32, color: "8B3A2E", tall: true, topBorder: hasParts }));

    out.push(new Table({
      width: { size: wLabel + wLine + wPts, type: WidthType.DXA },
      columnWidths: [wLabel, wLine, wPts],
      alignment: AlignmentType.CENTER,
      rows: ponderRows
    }));

    return out;
  }

  async function generateDocx(download, corrige, variant) {
    if (state.cahier.length === 0) return;
    showLoading(
      variant && corrige ? 'Génération du guide (variante)…'
      : variant ? 'Génération du cahier (variante)…'
      : corrige ? 'Génération du guide de l\'enseignant…'
      : 'Génération du cahier…'
    );
    try {
      const blob = variant
        ? (corrige ? await buildCorrigeBlob(/*flat*/ true) : await buildDocxBlobFlat())
        : (corrige ? await buildCorrigeBlob() : await buildDocxBlob());
      const url = URL.createObjectURL(blob);
      if (download !== false) {
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = variant && corrige ? `HQC-guide-enseignant-variante-${date}.docx`
          : variant ? `HQC-cahier-variante-${date}.docx`
          : corrige ? `HQC-guide-enseignant-${date}.docx`
          : `HQC-cahier-${date}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }
      hideLoading();
      return blob;
    } catch (err) {
      hideLoading();
      console.error('Erreur lors de la génération du .docx :', err);
      alert('Une erreur est survenue lors de la génération.\n\n' + err.message);
    }
  }

  // ====== PRÉVISUALISATION ======
  // Utilise docx-preview pour un rendu fidèle du .docx (préserve bordures, couleurs, mises en page)
  async function previewCahier(corrige, variant) {
    if (state.cahier.length === 0) return;
    state.previewMode = variant ? (corrige ? 'variante-corrige' : 'variante') : corrige ? 'corrige' : 'cahier';
    showLoading(
      variant && corrige ? 'Préparation du guide (variante)…'
      : variant ? 'Préparation de l\'aperçu (variante)…'
      : corrige ? 'Préparation du guide…'
      : 'Préparation de l\'aperçu…'
    );
    try {
      const blob = variant
        ? (corrige ? await buildCorrigeBlob(/*flat*/ true) : await buildDocxBlobFlat())
        : (corrige ? await buildCorrigeBlob() : await buildDocxBlob());

      // Mettre à jour le titre et le bouton du modal selon le mode
      if (el.modalTitle) el.modalTitle.textContent =
        variant && corrige ? 'Aperçu — Guide de l\'enseignant (variante · documents à la fin)'
        : variant ? 'Aperçu — Cahier de l\'élève (variante · documents à la fin)'
        : corrige ? 'Aperçu — Guide de l\'enseignant'
        : 'Aperçu — Cahier de l\'élève';
      if (el.modalDownload) el.modalDownload.textContent =
        variant && corrige ? '⬇ Télécharger le guide (variante)'
        : variant ? '⬇ Télécharger la variante'
        : corrige ? '⬇ Télécharger le guide'
        : '⬇ Télécharger le cahier';

      // Vider le conteneur et y faire rendre le docx
      el.previewContainer.innerHTML = '';
      el.previewOverlay.hidden = false;
      document.body.style.overflow = 'hidden';

      await docxPreview.renderAsync(blob, el.previewContainer, null, {
        className: 'docx',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        ignoreLastRenderedPageBreak: false,
        experimental: false,
        trimXmlDeclaration: true,
        useBase64URL: true
      });

      // Compétence 1 (paysage) : docx-preview applique l'orientation de chaque section via un style
      // inline (width = w:w, minHeight = w:h). Le CSS de l'aperçu force le portrait (!important) ; on
      // marque les pages dont la largeur inline dépasse la hauteur pour leur appliquer les dimensions
      // paysage (voir .preview-container section.docx.landscape dans style.css).
      el.previewContainer.querySelectorAll('section.docx').forEach(sec => {
        const w = parseFloat(sec.style.width), h = parseFloat(sec.style.minHeight || sec.style.height);
        if (w && h && w > h) sec.classList.add('landscape');
      });
      // Une page paysage (≈28 cm) est plus large que la fenêtre d'aperçu : on la met à l'échelle
      // (zoom) pour qu'elle tienne dans la largeur disponible, sans débordement horizontal.
      const _availW = el.previewContainer.clientWidth || 0;
      el.previewContainer.querySelectorAll('section.docx.landscape').forEach(sec => {
        sec.style.zoom = '1';
        const natural = sec.offsetWidth;
        if (_availW > 0 && natural > _availW) sec.style.zoom = String(Math.max(0.5, (_availW - 14) / natural));
      });

      // VARIANTE : l'aperçu n'affiche pas les coupures de page (docx-preview ne repagine pas
      // le texte qui s'enchaîne). On les simule, sans toucher au .docx, une fois les images
      // chargées. Le ratio « hauteur utile / largeur utile » dépend des marges, qui diffèrent
      // entre le cahier (720 partout → 14400/10800) et le guide (900/1080 → 14040/10080).
      // Repli sûr : toute erreur est avalée et l'aperçu reste affiché.
      // Coupures de page simulées : docx-preview ne repagine pas le contenu qui s'enchaîne.
      //  • VARIANTE (« documents à la fin ») : flux continu → simulation héritée (ratio unique).
      //  • C1 : le dossier documentaire s'enchaîne en portrait sans saut de page explicite ; sans
      //    simulation, docx-preview l'affiche en une seule très longue page. On simule alors les
      //    coupures UNIQUEMENT sur les sections portrait. Chaque question/écran est déjà une
      //    <section.docx> distincte (docx-preview scinde aux sauts explicites), donc la simulation
      //    reste locale à chaque section et ne perturbe ni le paysage ni les questions d'OI.
      const _hasC1 = state.cahier.some(p => {
        const _q = DATA.questions.find(x => x.id === p.questionId);
        return _q && categoryOf(_q) === 'c1';
      });
      if (variant) {
        await awaitImages(el.previewContainer);
        const ratio = corrige ? (14040 / 10080) : (14400 / 10800);
        simulatePageBreaks(el.previewContainer, ratio);
      } else if (_hasC1) {
        await awaitImages(el.previewContainer);
        simulatePageBreaks(el.previewContainer, { portrait: corrige ? (14040 / 10080) : (14400 / 10800) });
      }

      hideLoading();
    } catch (err) {
      hideLoading();
      console.error('Erreur lors de la prévisualisation :', err);
      alert('Erreur lors de la prévisualisation : ' + err.message);
    }
  }

  // Attend le chargement de toutes les images du conteneur (pour mesurer des hauteurs justes).
  function awaitImages(container) {
    const imgs = Array.from(container.querySelectorAll('img'));
    return Promise.all(imgs.map(img => (img.complete && img.naturalHeight !== 0)
      ? Promise.resolve()
      : new Promise(res => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
          setTimeout(res, 3000); // garde-fou
        })
    ));
  }

  // Simule les coupures de page dans l'aperçu de la variante (affichage seulement).
  // Principe : chaque bloc de premier niveau est insécable (enveloppe cantSplit pour les
  // questions, tableau unique pour chaque document) — exactement comme Word les traite. On
  // empile les blocs et, dès qu'un bloc déborde la hauteur utile d'une page, on insère une
  // coupure AVANT lui (comble + ligne pointillée + n° de page), reproduisant la pagination de Word.
  // docx-preview rend : <section class="docx"> <article> blocs… </article> ; les blocs sont les
  // enfants de l'<article>. Hauteur utile (px) = largeur de contenu rendue (px) × ratio fourni.
  function simulatePageBreaks(container, ratios) {
    try {
      // `ratios` : soit un nombre (héritage — variante : un ratio unique pour toutes les sections),
      // soit un objet { portrait } (mode C1 — on ne simule QUE les sections portrait). Raison : le
      // dossier documentaire de la C1 s'enchaîne en portrait sans saut de page explicite (docx-preview
      // ne repagine pas → une seule très longue page), alors que le schéma et la grille en paysage
      // tiennent chacun sur une page et possèdent déjà leurs sauts explicites (docx-preview les a
      // scindés en sections distinctes). On laisse donc le paysage intact.
      const portraitOnly = ratios && typeof ratios === 'object';
      const sections = container.querySelectorAll('section.docx');
      if (!sections.length) return;
      sections.forEach(section => {
        if (portraitOnly && section.classList.contains('landscape')) return;
        let R = portraitOnly ? ratios.portrait : ratios;
        if (!(R > 0)) R = (14400 / 10800);
        const article = section.querySelector(':scope > article') || section;
        const contentWidthPx = (article.clientWidth || section.clientWidth || 0);
        const pageContentHeightPx = contentWidthPx * R;
        if (!(pageContentHeightPx > 0)) return;

        const blocks = Array.from(article.children);
        if (blocks.length < 2) return;

        // Mesurer toutes les hauteurs AVANT toute insertion (évite tout effet de reflux).
        const heights = blocks.map(b => {
          const bcs = getComputedStyle(b);
          return b.offsetHeight + (parseFloat(bcs.marginTop) || 0) + (parseFloat(bcs.marginBottom) || 0);
        });

        let acc = 0, pageNo = 1;
        blocks.forEach((block, i) => {
          const h = heights[i];
          if (i > 0 && acc + h > pageContentHeightPx) {
            const remaining = Math.max(0, pageContentHeightPx - acc);
            const spacer = document.createElement('div');
            spacer.className = 'page-sim-spacer';
            spacer.style.height = remaining + 'px';
            pageNo++;
            const brk = document.createElement('div');
            brk.className = 'page-sim-break';
            brk.setAttribute('data-page', 'Page ' + pageNo);
            article.insertBefore(spacer, block);
            article.insertBefore(brk, block);
            acc = 0;
          }
          acc += h;
          if (h > pageContentHeightPx) acc = 0; // bloc plus grand qu'une page : on repart à 0
        });
      });
    } catch (e) {
      console.warn('Simulation de pages (aperçu) ignorée :', e);
    }
  }

  function closePreview() {
    el.previewOverlay.hidden = true;
    document.body.style.overflow = '';
    el.previewContainer.innerHTML = '';
  }

  // Précharge les images (bytes + dimensions naturelles) référencées dans les pièces sélectionnées
  async function preloadImages() {
    const cache = {};
    const urls = new Set();
    state.cahier.forEach(p => {
      const q = DATA.questions.find(x => x.id === p.questionId);
      if (!q) return;
      if (p.kind === 'document') {
        const d = q.documents.find(x => x.id === p.pieceId);
        if (d && d.imageUrl) urls.add(d.imageUrl);
      }
    });

    // Lit la largeur et la hauteur directement dans le fichier image, sans dépendre
    // du navigateur. Gère les PNG ET les JPG (les deux formats les plus courants).
    function detectImageFormat(bytes) {
      if (!bytes || bytes.length < 4) return null;
      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'png';
      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'jpg';
      return null;
    }
    // PNG : signature 8 octets puis chunk IHDR ; largeur aux octets 16-19, hauteur 20-23 (big-endian).
    function readPngDimensions(bytes) {
      if (!bytes || bytes.length < 24) return null;
      const view = new DataView(bytes.buffer, bytes.byteOffset || 0, bytes.byteLength);
      const width = view.getUint32(16, false);
      const height = view.getUint32(20, false);
      if (!width || !height) return null;
      return { width, height };
    }
    // JPG : on parcourt les marqueurs jusqu'au segment « Start Of Frame » (SOFn),
    // qui contient la hauteur (2 octets) puis la largeur (2 octets).
    function readJpegDimensions(bytes) {
      if (!bytes || bytes.length < 4 || bytes[0] !== 0xFF || bytes[1] !== 0xD8) return null;
      let off = 2; const len = bytes.length;
      while (off + 1 < len) {
        if (bytes[off] !== 0xFF) { off++; continue; }
        let marker = bytes[off + 1];
        while (marker === 0xFF && off + 1 < len) { off++; marker = bytes[off + 1]; }
        off += 2;
        // marqueurs sans contenu (SOI, EOI, RSTn) : on continue
        if (marker === 0xD8 || marker === 0xD9 || (marker >= 0xD0 && marker <= 0xD7)) continue;
        if (off + 1 >= len) break;
        const segLen = (bytes[off] << 8) | bytes[off + 1];
        // SOFn (dimensions) : 0xC0–0xCF sauf 0xC4, 0xC8, 0xCC
        if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
          if (off + 6 < len) {
            const height = (bytes[off + 3] << 8) | bytes[off + 4];
            const width  = (bytes[off + 5] << 8) | bytes[off + 6];
            if (width && height) return { width, height };
          }
          return null;
        }
        off += segLen; // sauter ce segment
      }
      return null;
    }

    await Promise.all(Array.from(urls).map(async (url) => {
      try {
        const buf = await fetch(url).then(r => r.arrayBuffer());
        const bytes = new Uint8Array(buf);
        const format = detectImageFormat(bytes);
        const dims = (format === 'jpg' ? readJpegDimensions(bytes) : readPngDimensions(bytes)) || { width: 400, height: 400 };
        cache[url] = {
          bytes,
          naturalWidth: dims.width,
          naturalHeight: dims.height,
          format: format || 'png'
        };
      } catch (e) {
        console.warn('Image non chargée:', url, e);
      }
    }));
    return cache;
  }

  // ====== BUILDERS DOCX ======
  function makeBuilders(d, imageCache) {
    const {
      Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
      AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
      HeadingLevel, LevelFormat, PageBreak
    } = d;

    const TEXT_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
    const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const ALL_BORDERS = { top: TEXT_BORDER, bottom: TEXT_BORDER, left: TEXT_BORDER, right: TEXT_BORDER };
    const NO_BORDERS  = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
    const CELL_MARGINS = { top: 100, bottom: 100, left: 120, right: 120 };

    // Build a single empty answer "case" (2-row table: light blue header + white body)
    function buildAnswerCase() {
      return new Table({
        width: { size: 10500, type: WidthType.DXA },
        columnWidths: [10500],
        rows: [
          new TableRow({
            height: { value: 240, rule: "exact" },
            children: [new TableCell({
              width: { size: 10500, type: WidthType.DXA },
              shading: { fill: "D6E6F4", type: ShadingType.CLEAR, color: "auto" },
              borders: {
                top:    TEXT_BORDER,
                bottom: NO_BORDER,
                left:   TEXT_BORDER,
                right:  TEXT_BORDER,
              },
              children: [new Paragraph({ children: [new TextRun({ text: "" })] })]
            })]
          }),
          new TableRow({
            height: { value: 900, rule: "atLeast" },
            children: [new TableCell({
              width: { size: 10500, type: WidthType.DXA },
              borders: {
                top:    NO_BORDER,
                bottom: TEXT_BORDER,
                left:   TEXT_BORDER,
                right:  TEXT_BORDER,
              },
              margins: CELL_MARGINS,
              children: [new Paragraph({ children: [new TextRun({ text: "" })] })]
            })]
          })
        ]
      });
    }

    function buildArrow() {
      return new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "↓", size: 36, color: "6A8DB5", font: "Arial" })],
        indent: { right: 200 }
      });
    }

    // ============== QUESTION BODY ==============
    // seqNumero : numéro séquentiel dans le cahier (1, 2, 3, …)
    function buildQuestionBody(q, seqNumero) {
      const elements = [];
      const num = seqNumero !== undefined ? seqNumero : q.numero;

      // En-tête à badge : pastille numérotée burgundy + « QUESTION » en petites capitales
      // + pondération de la question à droite (l'élève voit le poids de chaque question).
      const qPts = computeQuestionPoints(q);
      const HDR_NO_B = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
      const HDR_RULE = { style: BorderStyle.SINGLE, size: 10, color: "8B3A2E" };
      elements.push(new Table({
        width: { size: 10500, type: WidthType.DXA },
        columnWidths: [820, 8080, 1600],
        rows: [new TableRow({
          cantSplit: true,
          height: { value: 420, rule: "atLeast" },
          children: [
            new TableCell({
              width: { size: 820, type: WidthType.DXA },
              shading: { fill: "8B3A2E", type: ShadingType.CLEAR, color: "auto" },
              borders: { top: HDR_NO_B, bottom: HDR_NO_B, left: HDR_NO_B, right: HDR_NO_B },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 40, bottom: 40, left: 60, right: 60 },
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${num}`, bold: true, size: 30, color: "FFFFFF" })]
              })]
            }),
            new TableCell({
              width: { size: 8080, type: WidthType.DXA },
              borders: { top: HDR_NO_B, bottom: HDR_RULE, left: HDR_NO_B, right: HDR_NO_B },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 40, bottom: 40, left: 160, right: 60 },
              children: [new Paragraph({
                children: [new TextRun({ text: "Question", allCaps: true, bold: true, size: 24, characterSpacing: 28, color: "2A2620" })]
              })]
            }),
            new TableCell({
              width: { size: 1600, type: WidthType.DXA },
              borders: { top: HDR_NO_B, bottom: HDR_RULE, left: HDR_NO_B, right: HDR_NO_B },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 40, bottom: 40, left: 60, right: 40 },
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: qPts > 0 ? `/ ${qPts} points` : "", bold: true, size: 19, color: "6E685C" })]
              })]
            })
          ]
        })]
      }));
      elements.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 200 } }));

      // Prompt
      const body = q.questionBody;
      elements.push(new Paragraph({
        children: [
          new TextRun({ text: body.prompt })
        ],
        spacing: { after: 100 }
      }));

      // Bullets (optionnels)
      if (body.bullets && body.bullets.length > 0) {
        body.bullets.forEach(b => {
          elements.push(new Paragraph({
            children: [new TextRun({ text: b })],
            bullet: { level: 0 },
            indent: { left: 720 },
            spacing: { after: 40 }
          }));
        });
        elements.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
      }

      // Instructions (optionnelles - utilisées surtout pour la causalité)
      if (body.instructions && body.instructions.parts) {
        elements.push(new Paragraph({
          children: body.instructions.parts.map(p => new TextRun({ text: p.text, bold: !!p.bold })),
          spacing: { after: 200 }
        }));
      }

      // Response space
      if (body.responseSpace) {
        if (body.responseSpace.type === 'lines') {
          // Lignes continues pour réponse textuelle écrite (approche table)
          const n = body.responseSpace.count || 6;
          const lineBorder = { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA" };
          const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
          const lineRows = [];
          for (let i = 0; i < n; i++) {
            lineRows.push(new TableRow({
              height: { value: 420, rule: "atLeast" },
              children: [new TableCell({
                width: { size: 10500, type: WidthType.DXA },
                borders: { top: noBorder, bottom: lineBorder, left: noBorder, right: noBorder },
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [new Paragraph({ children: [new TextRun({ text: "" })] })]
              })]
            }));
          }
          elements.push(new Table({
            width: { size: 10500, type: WidthType.DXA },
            columnWidths: [10500],
            rows: lineRows
          }));
        } else if (body.responseSpace.type === 'labeled-list') {
          // Liste d'items à étiqueter : tableau 2 colonnes (libellé | ligne d'écriture).
          // L'ancienne approche utilisait `tabStops` avec un `leader: "underscore"` —
          // Word le rend bien mais docx-preview ne supporte pas les leaders de tab,
          // ce qui faisait apparaître les espaces de réponse comme « manquants » dans
          // l'aperçu. Un tableau bordé fonctionne dans les deux moteurs.
          const items = body.responseSpace.items || [];
          const totalW = 10500;
          // Auto-dimensionner la colonne libellé pour éviter le retour à la ligne sur
          // les longs libellés (ex. « Conséquence de la sédentarisation (Document n°) »).
          // ~140 DXA/char + 400 DXA marge (calibré pour Word ET docx-preview, ce dernier
          // utilisant un rendu un peu plus large). Plancher à 3800, plafond pour garder
          // au moins 3500 DXA à la ligne de réponse.
          const maxChars = items.reduce((m, it) => Math.max(m, (it || '').length), 0);
          const labelColW = Math.max(3800, Math.min(totalW - 3500, maxChars * 140 + 400));
          const answerColW = totalW - labelColW;
          const lineBorder = { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA" };
          const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
          const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
          const writingLineBorders = { top: noBorder, bottom: lineBorder, left: noBorder, right: noBorder };
          const linesPerItem = body.responseSpace.linesPerItem || 1;
          const llRows = [];
          items.forEach(item => {
            if (linesPerItem === 1) {
              // Comportement classique : une row par item (libellé | ligne d'écriture)
              llRows.push(new TableRow({
                height: { value: 480, rule: "atLeast" },
                children: [
                  new TableCell({
                    width: { size: labelColW, type: WidthType.DXA },
                    borders: noBorders,
                    verticalAlign: VerticalAlign.BOTTOM,
                    margins: { top: 0, bottom: 60, left: 0, right: 120 },
                    children: [new Paragraph({ children: [new TextRun({ text: item, size: 22 })] })]
                  }),
                  new TableCell({
                    width: { size: answerColW, type: WidthType.DXA },
                    borders: writingLineBorders,
                    verticalAlign: VerticalAlign.BOTTOM,
                    margins: { top: 0, bottom: 0, left: 0, right: 0 },
                    children: [new Paragraph({ children: [new TextRun({ text: "" })] })]
                  })
                ]
              }));
            } else {
              // Mode multi-lignes : libellé sur la 1re row (top-aligned), puis N rows d'écriture vides
              // alignées sous la colonne réponse.
              for (let i = 0; i < linesPerItem; i++) {
                llRows.push(new TableRow({
                  height: { value: 420, rule: "atLeast" },
                  children: [
                    new TableCell({
                      width: { size: labelColW, type: WidthType.DXA },
                      borders: noBorders,
                      verticalAlign: VerticalAlign.TOP,
                      margins: { top: i === 0 ? 60 : 0, bottom: 0, left: 0, right: 120 },
                      children: i === 0
                        ? [new Paragraph({ children: [new TextRun({ text: item, size: 22, bold: true })] })]
                        : [new Paragraph({ children: [new TextRun({ text: "" })] })]
                    }),
                    new TableCell({
                      width: { size: answerColW, type: WidthType.DXA },
                      borders: writingLineBorders,
                      verticalAlign: VerticalAlign.BOTTOM,
                      margins: { top: 0, bottom: 0, left: 0, right: 0 },
                      children: [new Paragraph({ children: [new TextRun({ text: "" })] })]
                    })
                  ]
                }));
              }
              // Spacer row entre items (sauf après le dernier) pour séparer visuellement les blocs
              if (item !== items[items.length - 1]) {
                llRows.push(new TableRow({
                  height: { value: 220, rule: "atLeast" },
                  children: [
                    new TableCell({ width: { size: labelColW, type: WidthType.DXA }, borders: noBorders,
                      children: [new Paragraph({ children: [new TextRun({ text: "" })] })] }),
                    new TableCell({ width: { size: answerColW, type: WidthType.DXA }, borders: noBorders,
                      children: [new Paragraph({ children: [new TextRun({ text: "" })] })] })
                  ]
                }));
              }
            }
          });
          elements.push(new Table({
            width: { size: totalW, type: WidthType.DXA },
            columnWidths: [labelColW, answerColW],
            rows: llRows
          }));
        } else if (body.responseSpace.type === 'checkbox-table') {
          // Tableau de cases à cocher : lignes (items) × colonnes (catégories)
          const cols = body.responseSpace.columns || [];
          const rowItems = body.responseSpace.rows || [];
          const totalW = 10500;
          const firstColW = 4200;
          const otherColW = Math.floor((totalW - firstColW) / cols.length);
          const colWidths = [firstColW, ...cols.map(() => otherColW)];
          // En-tête
          const headerCells = [
            new TableCell({
              width: { size: firstColW, type: WidthType.DXA },
              borders: ALL_BORDERS,
              shading: { fill: "F5EFE2", type: ShadingType.CLEAR, color: "auto" },
              margins: CELL_MARGINS,
              children: [new Paragraph({ children: [new TextRun({ text: "" })] })]
            }),
            ...cols.map(c => new TableCell({
              width: { size: otherColW, type: WidthType.DXA },
              borders: ALL_BORDERS,
              shading: { fill: "F5EFE2", type: ShadingType.CLEAR, color: "auto" },
              margins: CELL_MARGINS,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: c, bold: true, size: 20 })]
              })]
            }))
          ];
          const tableRows = [new TableRow({ children: headerCells, tableHeader: true })];
          rowItems.forEach(item => {
            const cells = [
              new TableCell({
                width: { size: firstColW, type: WidthType.DXA },
                borders: ALL_BORDERS,
                verticalAlign: VerticalAlign.CENTER,
                margins: CELL_MARGINS,
                children: [new Paragraph({ children: [new TextRun({ text: item, size: 22 })] })]
              }),
              ...cols.map(() => new TableCell({
                width: { size: otherColW, type: WidthType.DXA },
                borders: ALL_BORDERS,
                verticalAlign: VerticalAlign.CENTER,
                margins: CELL_MARGINS,
                children: [new Paragraph({
                  alignment: AlignmentType.CENTER,
                  // Case à cocher rendue avec un caractère carré vide
                  children: [new TextRun({ text: "☐", size: 32 })]
                })]
              }))
            ];
            tableRows.push(new TableRow({
              height: { value: 500, rule: "atLeast" },
              children: cells
            }));
          });
          elements.push(new Table({
            width: { size: totalW, type: WidthType.DXA },
            columnWidths: colWidths,
            rows: tableRows
          }));
        } else if (body.responseSpace.type === 'chrono-ordering') {
          // Mise en ordre chronologique : N cases bordées séparées par des flèches « → ».
          // Format inspiré du gabarit pédagogique original : trois cercles connectés par
          // des flèches que l'élève remplit de gauche (le plus ancien) à droite (le plus récent).
          // Les `items` servent de petites étiquettes AU-DESSUS de chaque case (hors des encadrés).
          // `prefilled` (optionnel) : array de même longueur que `items`, contenant la valeur
          // à afficher pré-placée dans certaines cases (null = vide pour l'élève).
          const items = body.responseSpace.items || [];
          const prefilled = Array.isArray(body.responseSpace.prefilled) ? body.responseSpace.prefilled : [];
          const n = items.length;
          const totalW = 10500;
          const arrowW = 550;
          const boxW = Math.floor((totalW - (n - 1) * arrowW) / n);
          const widths = [];
          // Row 1: labels au-dessus (sans bordure)
          const labelRow = [];
          // Row 2: cases vides + flèches
          const boxRow = [];
          items.forEach((label, i) => {
            widths.push(boxW);
            labelRow.push(new TableCell({
              width: { size: boxW, type: WidthType.DXA },
              borders: NO_BORDERS,
              verticalAlign: VerticalAlign.BOTTOM,
              margins: { top: 0, bottom: 60, left: 0, right: 0 },
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: label, size: 18, italics: true, color: "6E685C" })]
              })]
            }));
            // Si pré-placé : afficher le contenu en gris-italique avec une note discrète « (déjà placé) »
            const pre = prefilled[i];
            const boxChildren = pre
              ? [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: pre, size: 24, bold: true, color: "8B3A2E" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(déjà placé)", size: 16, italics: true, color: "6E685C" })] })
                ]
              : [
                  new Paragraph({ children: [new TextRun({ text: "", size: 24 })] }),
                  new Paragraph({ children: [new TextRun({ text: "", size: 24 })] })
                ];
            boxRow.push(new TableCell({
              width: { size: boxW, type: WidthType.DXA },
              borders: ALL_BORDERS,
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 100, bottom: 100, left: 80, right: 80 },
              shading: pre ? { type: "clear", color: "auto", fill: "F8F1E8" } : undefined,
              children: boxChildren
            }));
            if (i < n - 1) {
              widths.push(arrowW);
              // Cellule vide alignée avec la flèche dans la 2e row
              labelRow.push(new TableCell({
                width: { size: arrowW, type: WidthType.DXA },
                borders: NO_BORDERS,
                children: [new Paragraph({ children: [new TextRun({ text: "" })] })]
              }));
              boxRow.push(new TableCell({
                width: { size: arrowW, type: WidthType.DXA },
                borders: NO_BORDERS,
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "→", size: 40, bold: true })]
                })]
              }));
            }
          });
          elements.push(new Table({
            width: { size: totalW, type: WidthType.DXA },
            columnWidths: widths,
            rows: [
              new TableRow({ children: labelRow }),
              new TableRow({ height: { value: 1000, rule: "atLeast" }, children: boxRow })
            ]
          }));
        } else if (body.responseSpace.type === 'before-after-axis') {
          // Axe chronologique à 3 boîtes : Antériorité | événement pivot | Postériorité.
          // Les boîtes latérales reçoivent des cercles vides si `slots: { before: N, after: M }`
          // est fourni, sinon de l'espace vide pour écriture libre.
          const rs = body.responseSpace;
          const beforeLabel = rs.beforeLabel || 'Antériorité (Avant)';
          const afterLabel  = rs.afterLabel  || 'Postériorité (Après)';
          const pivot       = rs.pivot       || '';
          const slotsObj    = (rs.slots && typeof rs.slots === 'object') ? rs.slots : {};
          const nBefore     = slotsObj.before || 0;
          const nAfter      = slotsObj.after  || 0;
          const totalW = 10500;
          const arrowW = 450;
          const sideW = Math.floor((totalW - 2 * arrowW) * 0.32);
          const centerW = totalW - 2 * sideW - 2 * arrowW;
          const widths = [sideW, arrowW, centerW, arrowW, sideW];

          // Helper local : construit le contenu d'une boîte latérale (label + cercles vides OU espaces)
          const buildSideCellChildren = (label, n) => {
            const out = [new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
              children: [new TextRun({ text: label, bold: true, size: 20, color: "6E685C" })]
            })];
            if (n > 0) {
              out.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 120 },
                children: [new TextRun({
                  text: Array.from({ length: n }, () => '◯').join(' '),
                  size: 100
                })]
              }));
            } else {
              out.push(new Paragraph({ children: [new TextRun({ text: "", size: 24 })] }));
              out.push(new Paragraph({ children: [new TextRun({ text: "", size: 24 })] }));
            }
            return out;
          };

          const baCells = [
            new TableCell({
              width: { size: sideW, type: WidthType.DXA },
              borders: ALL_BORDERS,
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 100, bottom: 100, left: 80, right: 80 },
              children: buildSideCellChildren(beforeLabel, nBefore)
            }),
            new TableCell({
              width: { size: arrowW, type: WidthType.DXA },
              borders: NO_BORDERS,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "←", size: 36, bold: true })] })]
            }),
            new TableCell({
              width: { size: centerW, type: WidthType.DXA },
              borders: ALL_BORDERS,
              shading: { fill: "F5EFE2", type: ShadingType.CLEAR, color: "auto" },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 120, bottom: 120, left: 100, right: 100 },
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: pivot, bold: true, size: 20 })]
              })]
            }),
            new TableCell({
              width: { size: arrowW, type: WidthType.DXA },
              borders: NO_BORDERS,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "→", size: 36, bold: true })] })]
            }),
            new TableCell({
              width: { size: sideW, type: WidthType.DXA },
              borders: ALL_BORDERS,
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 100, bottom: 100, left: 80, right: 80 },
              children: buildSideCellChildren(afterLabel, nAfter)
            })
          ];
          elements.push(new Table({
            width: { size: totalW, type: WidthType.DXA },
            columnWidths: widths,
            rows: [new TableRow({ height: { value: 1400, rule: "atLeast" }, children: baCells })]
          }));
        } else if (body.responseSpace.type === 'timeline-segments') {
          // Ligne du temps en N encadrés contigus, un par période. L'élève coche/encercle
          // l'encadré qui correspond à la période visée.
          // Forme attendue : { type: 'timeline-segments',
          //                    periods: [{ letter: 'A', range: '1840-1848' }, ...] }
          // Forme alternative (rétrocompatible) avec `dates`/`letters` : les périodes sont
          // construites automatiquement à partir des dates consécutives.
          const rs = body.responseSpace;
          let periods = rs.periods;
          if (!periods && Array.isArray(rs.dates) && Array.isArray(rs.letters)) {
            // Construire les périodes : letter[i] couvre dates[i] à dates[i+1]
            periods = rs.letters.map((letter, i) => ({
              letter,
              range: `${rs.dates[i]}–${rs.dates[i + 1] || ''}`
            }));
          }
          periods = periods || [];

          const totalW = 10500;
          const cellW = Math.floor(totalW / periods.length);
          const colWidths = periods.map(() => cellW);

          // Bordure rouge bourgogne pour séparer visuellement les périodes
          const PERIOD_BORDER = { style: BorderStyle.SINGLE, size: 12, color: "8B3A2E" };
          const periodBorders = { top: PERIOD_BORDER, bottom: PERIOD_BORDER, left: PERIOD_BORDER, right: PERIOD_BORDER };

          const periodCells = periods.map(p => new TableCell({
            width: { size: cellW, type: WidthType.DXA },
            borders: periodBorders,
            shading: { fill: "F5EFE2", type: ShadingType.CLEAR, color: "auto" },
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 200, bottom: 200, left: 80, right: 80 },
            children: [
              // Lettre en gros
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 },
                children: [new TextRun({ text: p.letter, bold: true, size: 48, color: "8B3A2E" })]
              }),
              // Période
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [new TextRun({ text: p.range, bold: true, size: 24 })]
              }),
              // Cercle à encercler
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '◯', size: 56 })]
              })
            ]
          }));

          elements.push(new Paragraph({
            spacing: { before: 100, after: 80 },
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Encercle la lettre correspondant à la période appropriée.", italics: true, size: 20, color: "6E685C" })]
          }));
          elements.push(new Table({
            width: { size: totalW, type: WidthType.DXA },
            columnWidths: colWidths,
            rows: [new TableRow({ height: { value: 1800, rule: "atLeast" }, children: periodCells })]
          }));
        } else if (body.responseSpace.type === 'category-buckets') {
          // N boîtes côte à côte, une par catégorie. L'élève écrit les items rangés dans chaque catégorie.
          // Forme attendue : { type: 'category-buckets', categories: ['Cat A', 'Cat B', ...], slots: [2, 2, ...] }
          // `slots` (optionnel) — array d'entiers de même longueur que `categories`, indique combien
          // de cercles vides afficher par catégorie. Si omis ou 0, aucun cercle (l'élève écrit librement).
          const rs = body.responseSpace;
          const categories = rs.categories || [];
          const slots = Array.isArray(rs.slots) ? rs.slots : categories.map(() => 0);
          const totalW = 10500;
          const cellW = Math.floor(totalW / Math.max(categories.length, 1));
          const widths = categories.map(() => cellW);
          const bucketCells = categories.map((cat, i) => {
            const n = slots[i] || 0;
            const cellChildren = [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [new TextRun({ text: cat, bold: true, size: 20, color: "6E685C" })]
              })
            ];
            if (n > 0) {
              // Ligne de cercles vides ◯ ◯ ◯ ... séparés par des espaces
              cellChildren.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 120 },
                children: [new TextRun({
                  text: Array.from({ length: n }, () => '◯').join(' '),
                  size: 100
                })]
              }));
            } else {
              // Pas de cercles : juste de l'espace vide pour écriture libre
              cellChildren.push(new Paragraph({ children: [new TextRun({ text: "", size: 24 })] }));
              cellChildren.push(new Paragraph({ children: [new TextRun({ text: "", size: 24 })] }));
            }
            return new TableCell({
              width: { size: cellW, type: WidthType.DXA },
              borders: ALL_BORDERS,
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 100, bottom: 100, left: 80, right: 80 },
              children: cellChildren
            });
          });
          elements.push(new Table({
            width: { size: totalW, type: WidthType.DXA },
            columnWidths: widths,
            rows: [new TableRow({ height: { value: 1400, rule: "atLeast" }, children: bucketCells })]
          }));
        } else if (body.responseSpace.type === 'cases-causalite') {
          // Conservé pour rétro-compatibilité — cases bleutées avec flèches
          for (let i = 0; i < body.responseSpace.count; i++) {
            elements.push(buildAnswerCase());
            if (i < body.responseSpace.count - 1) {
              elements.push(buildArrow());
            }
          }
        } else if (body.responseSpace.type === 'c1-schema') {
          // Compétence 1 : organisateur graphique vide à remplir par l'élève
          elements.push(buildC1SchemaTable(docx, body.responseSpace, null, false));
        }
      }

      return elements;
    }

    // ============== RÉGLETTE ==============
    function buildReglette(r) {
      // Type "simple" : tableau matriciel à 2 rangées (en-tête points / conditions)
      if (r.type === 'simple') {
        return buildSimpleReglette(r);
      }
      // Type "c1-grid" : grille /8 de la Compétence 1
      if (r.type === 'c1-grid') {
        return [buildC1GridTable(docx, r)];
      }
      // Sinon, type "complex" par défaut (utilisé pour les rubriques de causalité)
      return buildComplexReglette(r);
    }

    function buildSimpleReglette(r) {
      const levels = r.levels || [];
      const totalW = 10500;
      const labelW = 2000;
      const levelW = Math.floor((totalW - labelW) / Math.max(levels.length, 1));
      const colWidths = [labelW, ...levels.map(() => levelW)];

      // Row 1 : label opération (rowspan 2) + en-tête points
      const row1Cells = [
        new TableCell({
          width: { size: labelW, type: WidthType.DXA },
          rowSpan: 2,
          borders: ALL_BORDERS,
          verticalAlign: VerticalAlign.CENTER,
          margins: CELL_MARGINS,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: r.opLabel, bold: true, size: 20 })]
          })]
        }),
        ...levels.map(lvl => new TableCell({
          width: { size: levelW, type: WidthType.DXA },
          borders: ALL_BORDERS,
          shading: { fill: "F5EFE2", type: ShadingType.CLEAR, color: "auto" },
          verticalAlign: VerticalAlign.CENTER,
          margins: CELL_MARGINS,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: lvl.points, bold: true, size: 20 })]
          })]
        }))
      ];

      // Row 2 : conditions (la 1re cellule étant merged depuis la row1)
      // Le « (N sur M) » est isolé sur sa propre ligne sous le texte qualitatif
      const row2Cells = levels.map(lvl => {
        const countMatch = lvl.condition.match(/\s*(\([^)]*sur[^)]*\))\s*\.?\s*$/i);
        const mainText = countMatch
          ? lvl.condition.slice(0, countMatch.index).replace(/\s+$/, '')
          : lvl.condition;
        const countText = countMatch ? countMatch[1] : null;
        const paragraphs = [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: countText ? 40 : 0 },
          children: [new TextRun({ text: mainText, size: 18 })]
        })];
        if (countText) {
          paragraphs.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [new TextRun({ text: countText, size: 18, color: "6E685C", italics: true })]
          }));
        }
        return new TableCell({
          width: { size: levelW, type: WidthType.DXA },
          borders: ALL_BORDERS,
          verticalAlign: VerticalAlign.CENTER,
          margins: CELL_MARGINS,
          children: paragraphs
        });
      });

      return [new Table({
        width: { size: totalW, type: WidthType.DXA },
        columnWidths: colWidths,
        rows: [
          new TableRow({ children: row1Cells }),
          new TableRow({ children: row2Cells })
        ]
      })];
    }

    function buildComplexReglette(r) {
      // 4-column rubric table: opName (merged vertical) | precise | condition | points
      // Build rows: track precise cells to span across when null
      const rows = r.rows;
      const tableRows = [];

      // We'll need to compute vertical merges later. For simplicity, render flat with explicit merge data.
      // python-docx style merges are easier; in docx-js use rowSpan.

      // Group consecutive rows where precise is "continuation" (precise=null means continuation)
      // First pass: assign rowspan to first row of each precise group
      const merged = [];
      let i = 0;
      while (i < rows.length) {
        let span = 1;
        let j = i + 1;
        while (j < rows.length && rows[j].precise === null) { span++; j++; }
        merged.push({ startIdx: i, span, precise: rows[i].precise });
        i = j;
      }

      // Op label cell merged across ALL rows
      const opSpan = rows.length;

      // Build all table rows
      for (let r_i = 0; r_i < rows.length; r_i++) {
        const row = rows[r_i];
        const cells = [];

        // Col 1: operation label, spans all rows (only on first row)
        if (r_i === 0) {
          cells.push(new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            rowSpan: opSpan,
            borders: ALL_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            margins: CELL_MARGINS,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: r.opLabel, bold: true, size: 20 })]
            })]
          }));
        }

        // Col 2: precise label, with rowSpan according to merged group
        const groupHere = merged.find(g => g.startIdx === r_i);
        if (groupHere) {
          // Last row of "L'élève précise un seul élément ou n'en précise pas." spans col 2+3
          const isLast = groupHere.startIdx === rows.length - 1 && row.condition === null;
          cells.push(new TableCell({
            width: { size: isLast ? 6000 : 3000, type: WidthType.DXA },
            rowSpan: groupHere.span,
            borders: ALL_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            margins: CELL_MARGINS,
            columnSpan: isLast ? 2 : 1,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: groupHere.precise, size: 20 })]
            })]
          }));
        }

        // Col 3: condition
        if (row.condition !== null) {
          cells.push(new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            borders: ALL_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            margins: CELL_MARGINS,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: row.condition, size: 20 })]
            })]
          }));
        }

        // Col 4: points
        cells.push(new TableCell({
          width: { size: 1200, type: WidthType.DXA },
          borders: ALL_BORDERS,
          verticalAlign: VerticalAlign.CENTER,
          margins: CELL_MARGINS,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: row.points, size: 20 })]
          })]
        }));

        tableRows.push(new TableRow({ children: cells }));
      }

      const tableEl = new Table({
        width: { size: 10500, type: WidthType.DXA },
        columnWidths: [1800, 3000, 3000, 1200],
        rows: tableRows
      });
      // Footnote (v1.21.0) : si la rubrique en a un, on l'ajoute en paragraphe italique
      // sous le tableau. Utilisé par RUBRIC_CHANGEMENTS_3PT_REPERE_TEMPS.
      if (r.footnote) {
        return [
          tableEl,
          new Paragraph({
            spacing: { before: 80, after: 0 },
            children: [new TextRun({ text: r.footnote, italics: true, size: 18 })]
          })
        ];
      }
      return [tableEl];
    }

    // ============== DOCUMENT ==============
    // outerWidth : largeur du conteneur en DXA (10500 par défaut = pleine largeur)
    // Si outerWidth < 6000, on bascule en mode « étroit » (image au-dessus du texte, polices plus petites)
    function buildDocument(d_doc, outerWidth) {
      outerWidth = outerWidth || 10500;
      const isNarrow = outerWidth < 6000;
      const innerW = outerWidth - 200; // un peu de marge interne pour le cell padding
      // Taille de police UNIFORME pour tous les documents, quelle que soit la largeur de leur
      // colonne (paire côte à côte ou pleine largeur) : les documents d'une même page ont ainsi
      // une police identique. `isNarrow` ne sert désormais qu'au dimensionnement des images.
      const fontSize = 20;
      const sourceFontSize = 14;
      const elements = [];

      const titleP = new Paragraph({
        children: [new TextRun({ text: d_doc.title, bold: true, color: "5C4A1E", size: 21 })],
        shading: { fill: "F0EAD9", type: ShadingType.CLEAR, color: "auto" },
        spacing: { after: 100 }
      });
      const sourcesPs = d_doc.sources.map(s =>
        new Paragraph({ children: [new TextRun({ text: s, italics: true, size: sourceFontSize })], spacing: { after: 20, line: 180, lineRule: 'exact' } })
      );

      // Aspect ratio réel de l'image (si présente)
      function calcImageDims(imgInfo, targetWidthCm) {
        if (!imgInfo) return { widthPx: Math.round(targetWidthCm * 28.35), heightPx: Math.round(targetWidthCm * 28.35) };
        const widthPx = Math.round(targetWidthCm * 28.35);
        const ratio = imgInfo.naturalHeight / imgInfo.naturalWidth;
        return { widthPx, heightPx: Math.round(widthPx * ratio) };
      }

      if (d_doc.layout === 'text-image') {
        const imgInfo = imageCache[d_doc.imageUrl];
        const targetCm = d_doc.imageWidthCm || 3.5;
        const dims = calcImageDims(imgInfo, targetCm);
        const imgChildren = imgInfo
          ? [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new ImageRun({ data: imgInfo.bytes, transformation: { width: dims.widthPx, height: dims.heightPx }, type: imgInfo.format || 'png' })]
            })]
          : [new Paragraph({ children: [new TextRun({ text: "[image]" })] })];

        if (isNarrow) {
          // Mode étroit : image au-dessus, texte en-dessous (1 colonne)
          const cellChildren = [titleP, ...imgChildren, new Paragraph({
            children: [new TextRun({ text: d_doc.text, size: fontSize })],
            spacing: { before: 80, after: 80 }
          }), ...sourcesPs];
          elements.push(new Table({
            width: { size: innerW, type: WidthType.DXA },
            columnWidths: [innerW],
            rows: [new TableRow({
              cantSplit: true,
              children: [new TableCell({
                width: { size: innerW, type: WidthType.DXA },
                borders: ALL_BORDERS, margins: CELL_MARGINS,
                children: cellChildren
              })]
            })]
          }));
        } else {
          // Mode large : texte à gauche (70%), image à droite (30%)
          const textW = Math.round(innerW * 0.62);
          const imgW = innerW - textW;
          const textCellChildren = [titleP, new Paragraph({
            children: [new TextRun({ text: d_doc.text, size: fontSize })],
            spacing: { after: 120 }
          }), ...sourcesPs];
          elements.push(new Table({
            width: { size: innerW, type: WidthType.DXA },
            columnWidths: [textW, imgW],
            rows: [new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: textW, type: WidthType.DXA },
                  borders: ALL_BORDERS, verticalAlign: VerticalAlign.TOP, margins: CELL_MARGINS,
                  children: textCellChildren
                }),
                new TableCell({
                  width: { size: imgW, type: WidthType.DXA },
                  borders: ALL_BORDERS, verticalAlign: VerticalAlign.CENTER, margins: CELL_MARGINS,
                  children: imgChildren
                })
              ]
            })]
          }));
        }
      } else if (d_doc.layout === 'image-only') {
        // Encadré image-only :
        //  - En mode appairé (étroit) : la boîte remplit toute la cellule pour éviter
        //    un grand espace entre les deux documents côte à côte.
        //  - En mode seul (large) : la boîte reste à la taille de l'image, alignée à gauche.
        const imgInfo = imageCache[d_doc.imageUrl];
        let targetCm = d_doc.imageWidthCm || 7;
        // En mode étroit, limiter la taille de l'image à ce qui rentre dans la cellule
        // En mode large, plafond à 16 cm (≈ largeur utile d'une page letter avec marges 2,5 cm).
        const maxCmInCell = isNarrow ? (innerW / 567) - 1 : 16;
        targetCm = Math.min(Math.max(targetCm, 3), maxCmInCell);
        const dims = calcImageDims(imgInfo, targetCm);

        const tableWidthDxa = isNarrow
          ? innerW
          : Math.min(Math.round(targetCm * 567) + 480, innerW);

        const cellChildren = [titleP];
        if (imgInfo) {
          cellChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new ImageRun({ data: imgInfo.bytes, transformation: { width: dims.widthPx, height: dims.heightPx }, type: imgInfo.format || 'png' })],
            spacing: { after: 80 }
          }));
        }
        cellChildren.push(...sourcesPs);

        elements.push(new Table({
          width: { size: tableWidthDxa, type: WidthType.DXA },
          columnWidths: [tableWidthDxa],
          rows: [new TableRow({
            cantSplit: true,
            children: [new TableCell({
              width: { size: tableWidthDxa, type: WidthType.DXA },
              borders: ALL_BORDERS,
              margins: CELL_MARGINS,
              children: cellChildren
            })]
          })]
        }));
      } else if (d_doc.layout === 'data-table') {
        // Encadré « tableau de données » : titre + tableau (en-tête bleu pâle) + sources.
        const tbl = d_doc.table || { headers: [], rows: [] };
        const nCols = (tbl.headers && tbl.headers.length) || (tbl.rows[0] ? tbl.rows[0].length : 1);
        const innerTableW = innerW - 240; // léger retrait sous le cadre extérieur
        const colW = Math.floor(innerTableW / nCols);
        const colWidths = Array.from({ length: nCols }, (_, i) =>
          i === nCols - 1 ? innerTableW - colW * (nCols - 1) : colW);

        const headerRow = new TableRow({
          tableHeader: true,
          children: (tbl.headers || []).map((h, i) => new TableCell({
            width: { size: colWidths[i], type: WidthType.DXA },
            borders: ALL_BORDERS, verticalAlign: VerticalAlign.CENTER, margins: CELL_MARGINS,
            shading: { fill: "D6E6F4", type: ShadingType.CLEAR, color: "auto" },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(h), bold: true, size: fontSize })] })]
          }))
        });
        const dataRows = (tbl.rows || []).map(r => new TableRow({
          cantSplit: true,
          children: r.map((c, i) => new TableCell({
            width: { size: colWidths[i], type: WidthType.DXA },
            borders: ALL_BORDERS, verticalAlign: VerticalAlign.CENTER, margins: CELL_MARGINS,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(c), size: fontSize })] })]
          }))
        }));

        const innerTable = new Table({
          width: { size: innerTableW, type: WidthType.DXA },
          columnWidths: colWidths,
          rows: [headerRow, ...dataRows]
        });

        // Word interdit qu'une cellule se termine par un tableau : les sources (paragraphes)
        // suivent toujours ; on ajoute un paragraphe vide de secours si aucune source.
        const afterTable = sourcesPs.length ? sourcesPs : [new Paragraph({ children: [new TextRun({ text: "" })] })];

        elements.push(new Table({
          width: { size: innerW, type: WidthType.DXA },
          columnWidths: [innerW],
          rows: [new TableRow({
            cantSplit: true,
            children: [new TableCell({
              width: { size: innerW, type: WidthType.DXA },
              borders: ALL_BORDERS, margins: CELL_MARGINS,
              children: [titleP, innerTable, ...afterTable]
            })]
          })]
        }));
      } else { // text-only
        const cellChildren = [titleP];
        cellChildren.push(new Paragraph({
          children: [new TextRun({ text: d_doc.text, size: fontSize })],
          spacing: { after: 120 }
        }));
        cellChildren.push(...sourcesPs);

        elements.push(new Table({
          width: { size: innerW, type: WidthType.DXA },
          columnWidths: [innerW],
          rows: [new TableRow({
            cantSplit: true,
            children: [new TableCell({
              width: { size: innerW, type: WidthType.DXA },
              borders: ALL_BORDERS,
              margins: CELL_MARGINS,
              children: cellChildren
            })]
          })]
        }));
      }

      return elements;
    }

    // ============== DOCUMENTS APPAIRÉS (côte à côte) ==============
    // Deux documents étroits dans une seule rangée à 2 colonnes.
    function buildPairedDocuments(d1, d2) {
      const outerW = 10500;
      const cellW = Math.floor((outerW - 200) / 2); // ~5150 DXA chacun, ~9.1 cm
      const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
      const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

      const inner1 = buildDocument(d1, cellW);
      const inner2 = buildDocument(d2, cellW);

      return new Table({
        width: { size: outerW, type: WidthType.DXA },
        columnWidths: [cellW, 200, cellW],
        rows: [new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: cellW, type: WidthType.DXA },
              borders: noBorders,
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              children: inner1
            }),
            new TableCell({
              width: { size: 200, type: WidthType.DXA },
              borders: noBorders,
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              children: [new Paragraph({ children: [new TextRun({ text: "" })] })]
            }),
            new TableCell({
              width: { size: cellW, type: WidthType.DXA },
              borders: noBorders,
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              children: inner2
            })
          ]
        })]
      });
    }

    return { buildQuestionBody, buildReglette, buildDocument, buildPairedDocuments };
  }

  // ====== UTILS ======
  function showLoading(msg) {
    el.loadingMsg.textContent = msg || 'Chargement…';
    el.loading.hidden = false;
  }
  function hideLoading() { el.loading.hidden = true; }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // ====== CHARGEMENT DES QUESTIONS ÉDITABLES (questions.json géré par la console admin) ======
  async function loadCMSQuestions() {
    try {
      if (typeof DATA === 'undefined' || !DATA || !Array.isArray(DATA.questions)) return;
      if (typeof QuizCMS === 'undefined' || !QuizCMS || !QuizCMS.toRuntime) return;
      const res = await fetch('assets/data/questions.json?t=' + Date.now());
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data && data.questions) || [];
      if (!list.length) return;
      const idx = {};
      DATA.questions.forEach((q, i) => { idx[q.id] = i; });
      list.forEach(cms => {
        let rt;
        try { rt = QuizCMS.toRuntime(cms); } catch (e) { return; }
        if (!rt || !rt.id) return;
        if (idx[rt.id] != null) DATA.questions[idx[rt.id]] = rt;       // remplace l'existante
        else { DATA.questions.push(rt); idx[rt.id] = DATA.questions.length - 1; } // ajoute la nouvelle
      });
    } catch (e) { /* repli silencieux : on garde DATA tel quel si le fichier manque/illisible */ }
  }
  function boot() { loadCMSQuestions().then(init).catch(init); }

  // ====== BOOT ======
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

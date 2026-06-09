/* ============================================================
   Adaptateur CMS <-> runtime  (version étendue, compatible HEC & HQC)
   ------------------------------------------------------------
   - toRuntime(cms) : utilisé par le navigateur (app.js) au chargement
   - toCMS(runtime) : utilisé par le script de migration
   Inverse exact l'un de l'autre (prouvé par le test d'aller-retour).

   Nouveautés gérées par rapport à la version HEC :
   - champs supplémentaires en haut de question (annee, cantSplitAllDocs…)
     laissés passer tels quels ;
   - footnote sur les réglettes, pair sur les documents, conservés ;
   - documents null conservés ;
   - corrigé "buckets" (catégories -> listes de documents, des TEXTES)
     distinct de "cases" (cases à cocher, des BOOLÉENS) ;
   - tout type de responseSpace conservé tel quel (dont category-buckets
     et timeline-segments) car copié par clonage.
   ============================================================ */
(function (root) {
  'use strict';

  function isArray(x) { return Array.isArray(x); }
  function clone(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }

  var KNOWN_TOP = { id:1, operation:1, numero:1, niveau:1, realite_sociale_id:1,
                    questionBody:1, reglettes:1, documents:1, corrige:1 };
  var REG_KNOWN = { type:1, id:1, label:1, opLabel:1, maxPoints:1, levels:1, rows:1 };
  var DOC_KNOWN = ['id','title','layout','text','imageUrl','imageWidthCm','sources','pair'];

  // ---------- corrigé : runtime -> CMS ----------
  function corrigeToCMS(c) {
    if (typeof c === 'string') return [{ kind: 'texte', valeur: c }];
    if (isArray(c)) {
      if (c.length > 0 && isArray(c[0])) {
        // distinguer buckets (textes) de cases (booléens)
        var sample;
        for (var i = 0; i < c.length && sample === undefined; i++) {
          if (isArray(c[i])) for (var j = 0; j < c[i].length; j++) {
            if (c[i][j] !== undefined) { sample = c[i][j]; break; }
          }
        }
        if (typeof sample === 'string') {
          return [{ kind: 'buckets', groupes: c.map(function (row) { return row.slice(); }) }];
        }
        return [{ kind: 'cases', lignes: c.map(function (row) {
          return { cochees: row.map(function (b) { return { coche: !!b }; }) };
        }) }];
      }
      return [{ kind: 'lettres', valeurs: c.slice() }];
    }
    if (c && typeof c === 'object') {
      return [{ kind: 'avant_apres', avant: (c.before || []).slice(), apres: (c.after || []).slice() }];
    }
    return [{ kind: 'texte', valeur: '' }];
  }

  // ---------- corrigé : CMS -> runtime ----------
  function corrigeToRuntime(arr) {
    var c = (arr && arr[0]) || { kind: 'texte', valeur: '' };
    switch (c.kind) {
      case 'texte':   return c.valeur || '';
      case 'lettres': return (c.valeurs || []).slice();
      case 'buckets': return (c.groupes || []).map(function (g) { return g.slice(); });
      case 'cases':   return (c.lignes || []).map(function (l) {
                        return (l.cochees || []).map(function (x) { return !!x.coche; });
                      });
      case 'avant_apres': return { before: (c.avant || []).slice(), after: (c.apres || []).slice() };
      default: return '';
    }
  }

  // ---------- instructions ----------
  function instructionsToCMS(instr) {
    if (!instr || !isArray(instr.parts)) return [];
    return instr.parts.map(function (p) { return { text: p.text, bold: !!p.bold }; });
  }
  function instructionsToRuntime(list) {
    if (!isArray(list) || list.length === 0) return undefined;
    return { parts: list.map(function (p) {
      var part = { text: p.text || '' };
      if (p.bold) part.bold = true;
      return part;
    }) };
  }

  // ---------- réglettes (footnote + clés inconnues conservées) ----------
  function regletteToCMS(r) {
    var out = { type: r.type, id: r.id, label: r.label, opLabel: r.opLabel, maxPoints: r.maxPoints };
    if (r.type === 'complex') {
      out.rows = (r.rows || []).map(function (row) {
        return { precise: row.precise == null ? '' : row.precise,
                 condition: row.condition == null ? '' : row.condition, points: row.points };
      });
    } else {
      out.levels = (r.levels || []).map(function (lv) { return { points: lv.points, condition: lv.condition }; });
    }
    Object.keys(r).forEach(function (k) { if (!REG_KNOWN[k]) out[k] = clone(r[k]); });
    return out;
  }
  function regletteToRuntime(r) {
    var out = { id: r.id, label: r.label, type: r.type, opLabel: r.opLabel, maxPoints: r.maxPoints };
    if (r.type === 'complex') {
      out.rows = (r.rows || []).map(function (row) {
        return { precise: row.precise === '' ? null : row.precise,
                 condition: row.condition === '' ? null : row.condition, points: row.points };
      });
    } else {
      out.levels = (r.levels || []).map(function (lv) { return { points: lv.points, condition: lv.condition }; });
    }
    Object.keys(r).forEach(function (k) { if (!REG_KNOWN[k]) out[k] = clone(r[k]); });
    return out;
  }

  // ---------- documents (pair + clés inconnues conservées ; null conservé) ----------
  function docToCMS(d) {
    if (d == null) return null;
    var out = {};
    DOC_KNOWN.forEach(function (k) { if (d[k] !== undefined) out[k] = clone(d[k]); });
    Object.keys(d).forEach(function (k) { if (DOC_KNOWN.indexOf(k) < 0) out[k] = clone(d[k]); });
    return out;
  }
  function docToRuntime(d) {
    if (d == null) return null;
    var out = { id: d.id, title: d.title, layout: d.layout };
    if (d.text !== undefined && d.text !== '') out.text = d.text;
    if (d.imageUrl !== undefined && d.imageUrl !== '') out.imageUrl = d.imageUrl;
    if (d.imageWidthCm !== undefined && d.imageWidthCm !== null && d.imageWidthCm !== '') out.imageWidthCm = d.imageWidthCm;
    if (d.pair !== undefined) out.pair = d.pair;
    if (isArray(d.sources)) out.sources = d.sources.slice();
    Object.keys(d).forEach(function (k) {
      if (['id','title','layout','text','imageUrl','imageWidthCm','pair','sources'].indexOf(k) < 0) out[k] = clone(d[k]);
    });
    return out;
  }

  // ---------- responseSpace (liste de 1 côté CMS ; tout type conservé par clonage) ----------
  function responseSpaceToCMS(rs) { return rs ? [clone(rs)] : []; }
  function responseSpaceToRuntime(arr) { return (arr && arr[0]) ? clone(arr[0]) : undefined; }

  // ============ QUESTION : runtime -> CMS ============
  function toCMS(q) {
    var qb = q.questionBody || {};
    var cms = {
      id: q.id, operation: q.operation, numero: q.numero, niveau: q.niveau, realite_sociale_id: q.realite_sociale_id,
      questionBody: {
        prompt: qb.prompt || '',
        bullets: isArray(qb.bullets) ? qb.bullets.slice() : [],
        instructions: instructionsToCMS(qb.instructions),
        responseSpace: responseSpaceToCMS(qb.responseSpace)
      },
      reglettes: (q.reglettes || []).map(regletteToCMS),
      documents: (q.documents || []).map(docToCMS),
      corrige: corrigeToCMS(q.corrige)
    };
    Object.keys(q).forEach(function (k) { if (!KNOWN_TOP[k]) cms[k] = clone(q[k]); });
    return cms;
  }

  // ============ QUESTION : CMS -> runtime ============
  function toRuntime(c) {
    var cqb = c.questionBody || {};
    var qb = { prompt: cqb.prompt || '' };
    if (isArray(cqb.bullets) && cqb.bullets.length) qb.bullets = cqb.bullets.slice();
    var instr = instructionsToRuntime(cqb.instructions);
    if (instr) qb.instructions = instr;
    qb.responseSpace = responseSpaceToRuntime(cqb.responseSpace);

    var rt = {
      id: c.id, operation: c.operation, numero: c.numero, niveau: c.niveau, realite_sociale_id: c.realite_sociale_id,
      questionBody: qb,
      reglettes: (c.reglettes || []).map(regletteToRuntime),
      documents: (c.documents || []).map(docToRuntime),
      corrige: corrigeToRuntime(c.corrige)
    };
    Object.keys(c).forEach(function (k) { if (!KNOWN_TOP[k]) rt[k] = clone(c[k]); });
    return rt;
  }

  var API = { toCMS: toCMS, toRuntime: toRuntime };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.QuizCMS = API;

})(typeof window !== 'undefined' ? window : this);

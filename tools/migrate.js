const fs = require('fs');
const assert = require('assert');
const path = require('path');

// 1) charger les données résolues
global.window = {};
eval(fs.readFileSync('assets/js/data.js', 'utf8'));
const DATA = global.window.DATA;
const ALL = DATA.questions;

// 2) charger l'adaptateur RÉEL (le même que le navigateur utilisera)
const { toCMS, toRuntime } = require(process.cwd() + '/assets/js/cms-adapter.js')  // exécuter depuis v2/ : node tools/migrate.js;

// 3) dimensions de couverture
const dimsOf = (q) => ({
  op: q.operation,
  rs: q.questionBody?.responseSpace?.type || '(aucun)',
  reg: [...new Set((q.reglettes||[]).map(r=>r.type))],
  lay: [...new Set((q.documents||[]).map(d=>d.layout))],
  cor: (() => { const c=q.corrige;
    if (typeof c==='string') return 'texte';
    if (Array.isArray(c)) return (c.length&&Array.isArray(c[0]))?'cases':'lettres';
    if (c&&typeof c==='object') return 'avant_apres'; return '?'; })(),
  extras: [ q.questionBody?.bullets?'bullets':null, q.questionBody?.instructions?'instructions':null ].filter(Boolean),
  realite: q.realite_sociale_id,
});

// 4) sélection gloutonne pour couvrir toutes les valeurs de chaque dimension
const need = { op:new Set(), rs:new Set(), reg:new Set(), lay:new Set(), cor:new Set(), extra:new Set() };
ALL.forEach(q=>{ const d=dimsOf(q);
  need.op.add(d.op); need.rs.add(d.rs); d.reg.forEach(x=>need.reg.add(x));
  d.lay.forEach(x=>need.lay.add(x)); need.cor.add(d.cor); d.extras.forEach(x=>need.extra.add(x)); });

const covered = { op:new Set(), rs:new Set(), reg:new Set(), lay:new Set(), cor:new Set(), extra:new Set() };
const gain = (q) => { const d=dimsOf(q); let g=0;
  if(!covered.op.has(d.op))g++; if(!covered.rs.has(d.rs))g++;
  d.reg.forEach(x=>{if(!covered.reg.has(x))g++;}); d.lay.forEach(x=>{if(!covered.lay.has(x))g++;});
  if(!covered.cor.has(d.cor))g++; d.extras.forEach(x=>{if(!covered.extra.has(x))g++;}); return g; };
const apply = (q)=>{ const d=dimsOf(q); covered.op.add(d.op); covered.rs.add(d.rs);
  d.reg.forEach(x=>covered.reg.add(x)); d.lay.forEach(x=>covered.lay.add(x));
  covered.cor.add(d.cor); d.extras.forEach(x=>covered.extra.add(x)); };

const selected = [];
const pool = ALL.slice();
// phase A : couvrir toutes les dimensions
while (true) {
  let best=null, bestG=0;
  for (const q of pool) { if(selected.includes(q)) continue; const g=gain(q); if(g>bestG){bestG=g;best=q;} }
  if (!best || bestG===0) break;
  selected.push(best); apply(best);
}
// phase B : compléter jusqu'à ~20 en ROUND-ROBIN sur les réalités sociales
// (on touche un maximum de réalités différentes, en ordre curriculaire)
const TARGET = 20;
const byRealite = {};
DATA.realites_sociales.forEach(r => byRealite[r.id] = pool.filter(q =>
  q.realite_sociale_id === r.id && !selected.includes(q)).sort((a,b)=>a.numero-b.numero));
let added = true;
while (selected.length < TARGET && added) {
  added = false;
  for (const r of DATA.realites_sociales) {           // un tour = une question par réalité
    if (selected.length >= TARGET) break;
    const next = byRealite[r.id].shift();
    if (next) { selected.push(next); added = true; }
  }
}
// ordre stable : par réalité (ordre curriculaire) puis numéro
const realiteOrder = {}; DATA.realites_sociales.forEach((r,i)=>realiteOrder[r.id]=i);
selected.sort((a,b)=> (realiteOrder[a.realite_sociale_id]-realiteOrder[b.realite_sociale_id]) || (a.numero-b.numero));

// 5) AUDIT de clés : s'assurer qu'aucune clé inattendue n'est ignorée
const TOP = new Set(['id','operation','numero','niveau','realite_sociale_id','questionBody','reglettes','documents','corrige']);
const QB = new Set(['prompt','bullets','instructions','responseSpace']);
const REG = new Set(['id','label','type','opLabel','maxPoints','levels','rows']);
const DOC = new Set(['id','title','layout','text','imageUrl','imageWidthCm','sources']);
let auditErrors = [];
const audit = (obj, allowed, where) => Object.keys(obj||{}).forEach(k=>{ if(!allowed.has(k)) auditErrors.push(`${where}: clé inattendue "${k}"`); });
selected.forEach(q=>{ audit(q,TOP,q.id); audit(q.questionBody,QB,q.id+'.questionBody');
  (q.reglettes||[]).forEach((r,i)=>audit(r,REG,`${q.id}.reglettes[${i}]`));
  (q.documents||[]).forEach((d,i)=>audit(d,DOC,`${q.id}.documents[${i}]`)); });
if (auditErrors.length) { console.error('AUDIT KO:\n'+auditErrors.join('\n')); process.exit(1); }

// 6) TEST aller-retour SANS PERTE : toRuntime(toCMS(q)) === q
let fails = 0;
const cmsArray = [];
selected.forEach(q=>{
  const cms = toCMS(q);
  cmsArray.push(cms);
  const back = toRuntime(cms);
  try { assert.deepStrictEqual(back, q); }
  catch (e) { fails++; console.error(`\n✗ PERTE sur ${q.id}`);
    console.error('  attendu :', JSON.stringify(q).slice(0,200));
    console.error('  obtenu  :', JSON.stringify(back).slice(0,200)); }
});

// 7) rapport
const showSet = s => [...s].sort().join(', ');
console.log('=== Sélection : '+selected.length+' questions ===');
selected.forEach(q=>{ const d=dimsOf(q);
  console.log(`  ${q.id.padEnd(26)} | OI=${d.op.slice(0,22).padEnd(22)} | rép=${d.rs.padEnd(17)} | rég=${d.reg.join('+').padEnd(13)} | cor=${d.cor.padEnd(11)} | doc=${d.lay.join('+')}`); });
console.log('\n=== Couverture (tout doit apparaître) ===');
console.log('  Opérations    :', showSet(covered.op));
console.log('  Esp. réponse  :', showSet(covered.rs));
console.log('  Réglettes     :', showSet(covered.reg));
console.log('  Layouts doc   :', showSet(covered.lay));
console.log('  Corrigés      :', showSet(covered.cor));
console.log('  Champs extra  :', showSet(covered.extra));
const realites = [...new Set(selected.map(q=>q.realite_sociale_id))];
console.log('  Réalités soc. :', realites.length, '->', realites.join(', '));

console.log('\n=== Test aller-retour SANS PERTE ===');
console.log(fails===0 ? `  ✓ ${selected.length}/${selected.length} questions identiques après CMS->runtime->comparaison`
                      : `  ✗ ${fails} perte(s) détectée(s)`);

// 8) écrire le JSON éditable par le CMS
if (fails===0) {
  fs.mkdirSync('assets/data', { recursive: true });
  fs.writeFileSync('assets/data/questions.json', JSON.stringify({ questions: cmsArray }, null, 2) + '\n', 'utf8');
  const sz = fs.statSync('assets/data/questions.json').size;
  console.log(`\n✓ Écrit assets/data/questions.json (${selected.length} questions, ${(sz/1024).toFixed(1)} Ko)`);
} else { process.exit(1); }

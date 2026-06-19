#!/usr/bin/env python3
# Générateur de personnages romains SVG modulaires (rôles + expressions)
import cairosvg

CERNE="#3A2E26"
PEAU="#E8B68C"; PEAU_OMBRE="#D99C6E"; PEAU2="#E3A878"
CHEVEUX="#5A4632"; CHEVEUX_OMBRE="#4A3829"; CHEV_GAUL="#C07A33"; CHEV_GAUL_O="#9E6024"
TOGE="#F7F2E8"; TOGE_PLI="#CBBF9E"; TUNIQUE="#E7DCC4"
POURPRE="#732640"; OR="#D9A93C"; OR_O="#A87E22"
BRONZE="#C8962F"; BRONZE_O="#7A5A18"
TOGE_IMP="#6E2440"; TOGE_IMP_PLI="#581C32"
METAL="#C4BEB2"; METAL_O="#928C80"; CRISTA="#9E3B2E"; CRISTA_O="#7C2A20"
GAUL_TUN="#6E7B45"; GAUL_TUN_O="#586438"; CAPE="#8A2B22"

def visage(expr):
    # sourcils + yeux + nez + bouche selon expression
    nez = f'<path d="M198 184 C196 200 190 212 188 218 Q200 226 210 216" fill="none" stroke="{CERNE}" stroke-width="4.5"/>'
    # yeux de base
    def oeil(cx, ferme=False, joie=False):
        if joie:
            return f'<path d="M{cx-15} 182 Q{cx} 172 {cx+15} 182" fill="none" stroke="{CERNE}" stroke-width="5"/>'
        h = 9 if ferme else 12.5
        return (f'<ellipse cx="{cx}" cy="180" rx="15" ry="{h}" fill="#fff"/>'
                f'<circle cx="{cx+3 if cx<200 else cx-3}" cy="182" r="6.5" fill="{CERNE}" stroke="none"/>'
                f'<circle cx="{cx+5 if cx<200 else cx-1}" cy="180" r="2" fill="#fff" stroke="none"/>')
    if expr=="neutre":
        sourcils=(f'<path d="M150 162 Q170 153 188 160" fill="none" stroke="{CERNE}" stroke-width="6"/>'
                  f'<path d="M212 160 Q230 153 250 162" fill="none" stroke="{CERNE}" stroke-width="6"/>')
        yeux=oeil(168)+oeil(232)
        bouche=f'<path d="M178 246 Q200 257 222 246" fill="none" stroke="{CERNE}" stroke-width="5"/>'
    elif expr=="content":
        sourcils=(f'<path d="M150 156 Q170 148 188 155" fill="none" stroke="{CERNE}" stroke-width="6"/>'
                  f'<path d="M212 155 Q230 148 250 156" fill="none" stroke="{CERNE}" stroke-width="6"/>')
        yeux=oeil(168,joie=True)+oeil(232,joie=True)
        bouche=(f'<path d="M172 242 Q200 272 228 242 Z" fill="#fff" stroke="{CERNE}" stroke-width="5"/>'
                f'<path d="M180 248 Q200 258 220 248" fill="none" stroke="{CERNE}" stroke-width="2.5"/>')
    elif expr=="inquiet":
        sourcils=(f'<path d="M150 166 Q170 150 190 156" fill="none" stroke="{CERNE}" stroke-width="6"/>'
                  f'<path d="M210 156 Q230 150 250 166" fill="none" stroke="{CERNE}" stroke-width="6"/>')
        yeux=oeil(168)+oeil(232)
        bouche=f'<path d="M182 252 Q200 246 218 252" fill="none" stroke="{CERNE}" stroke-width="5"/>'
    else: # severe
        sourcils=(f'<path d="M150 154 Q172 158 192 168" fill="none" stroke="{CERNE}" stroke-width="6.5"/>'
                  f'<path d="M208 168 Q228 158 250 154" fill="none" stroke="{CERNE}" stroke-width="6.5"/>'
                  f'<path d="M200 160 L200 172" stroke="{CERNE}" stroke-width="3" fill="none"/>')
        yeux=oeil(168,ferme=True)+oeil(232,ferme=True)
        bouche=f'<path d="M178 252 Q200 246 222 252" fill="none" stroke="{CERNE}" stroke-width="5.5"/>'
    return sourcils+yeux+nez+bouche

def corps(role):
    if role=="empereur":
        toge=TOGE_IMP; pli=TOGE_IMP_PLI; lat=OR
        return (f'<path d="M70 440 C70 350 120 320 200 320 C280 320 330 350 330 440 Z" fill="{TUNIQUE}"/>'
                f'<path d="M118 440 C150 360 250 345 320 360 C338 400 338 440 338 440 Z" fill="{toge}"/>'
                f'<path d="M150 430 C180 380 235 366 300 376" fill="none" stroke="{pli}" stroke-width="4"/>'
                f'<path d="M168 438 C200 398 250 388 312 398" fill="none" stroke="{pli}" stroke-width="4"/>'
                f'<path d="M118 440 C150 360 250 345 320 360" fill="none" stroke="{lat}" stroke-width="9"/>'
                f'<circle cx="300" cy="360" r="11" fill="{OR}"/><circle cx="300" cy="360" r="4" fill="{OR_O}" stroke="none"/>')
    if role=="centurion":
        return (f'<path d="M64 440 C64 348 120 322 200 322 C280 322 336 348 336 440 Z" fill="{METAL}"/>'
                # lorica : bandes
                f'<path d="M80 380 H320" stroke="{METAL_O}" stroke-width="4" fill="none"/>'
                f'<path d="M74 405 H326" stroke="{METAL_O}" stroke-width="4" fill="none"/>'
                f'<path d="M70 430 H330" stroke="{METAL_O}" stroke-width="4" fill="none"/>'
                # épaulières
                f'<path d="M96 350 C110 330 150 326 165 342 C150 350 120 356 96 366 Z" fill="{METAL}"/>'
                f'<path d="M304 350 C290 330 250 326 235 342 C250 350 280 356 304 366 Z" fill="{METAL}"/>'
                # cape rouge sur une épaule
                f'<path d="M235 338 C300 340 322 372 330 430 C300 410 270 396 245 392 Z" fill="{CAPE}"/>')
    if role=="gaulois":
        return (f'<path d="M70 440 C70 350 120 322 200 322 C280 322 330 350 330 440 Z" fill="{GAUL_TUN}"/>'
                f'<path d="M150 340 Q200 360 250 340" fill="none" stroke="{GAUL_TUN_O}" stroke-width="5"/>'
                f'<path d="M120 400 Q200 420 280 400" fill="none" stroke="{GAUL_TUN_O}" stroke-width="4"/>'
                # torque (collier celtique en bronze)
                f'<path d="M168 330 C168 360 232 360 232 330" fill="none" stroke="{BRONZE}" stroke-width="11"/>'
                f'<circle cx="168" cy="330" r="8" fill="{BRONZE}"/><circle cx="232" cy="330" r="8" fill="{BRONZE}"/>')
    if role=="marchand":
        return (f'<path d="M70 440 C70 350 120 320 200 320 C280 320 330 350 330 440 Z" fill="{OR}"/>'
                f'<path d="M70 440 C72 372 120 346 200 346 C220 346 238 348 254 352 L240 440 Z" fill="{POURPRE}" stroke="none" opacity="0.85"/>'
                f'<path d="M254 352 C300 360 326 388 330 440" fill="none" stroke="{OR_O}" stroke-width="4"/>'
                f'<path d="M150 360 Q200 378 250 360" fill="none" stroke="{OR_O}" stroke-width="4"/>')
    # conseiller par défaut
    return (f'<path d="M70 440 C70 350 120 320 200 320 C280 320 330 350 330 440 Z" fill="{TUNIQUE}"/>'
            f'<path d="M118 440 C150 360 250 345 320 360 C338 400 338 440 338 440 Z" fill="{TOGE}"/>'
            f'<path d="M150 430 C180 380 235 366 300 376" fill="none" stroke="{TOGE_PLI}" stroke-width="4"/>'
            f'<path d="M168 438 C200 398 250 388 312 398" fill="none" stroke="{TOGE_PLI}" stroke-width="4"/>'
            f'<path d="M118 440 C150 360 250 345 320 360" fill="none" stroke="{POURPRE}" stroke-width="9"/>'
            f'<circle cx="300" cy="360" r="11" fill="{BRONZE}"/><circle cx="300" cy="360" r="4" fill="{BRONZE_O}" stroke="none"/>')

def coiffe(role):
    if role=="centurion":
        # casque (galea) + crête (crista) transversale
        return (f'<path d="M122 150 C122 92 160 70 200 70 C240 70 278 92 278 150 C278 138 270 132 258 132 L142 132 C130 132 122 138 122 150 Z" fill="{METAL}"/>'
                f'<rect x="134" y="126" width="132" height="16" rx="6" fill="{METAL}"/>'
                f'<path d="M122 150 C118 168 120 184 124 196 L132 196 C128 178 130 160 134 150 Z" fill="{METAL}"/>'   # protège-joue G
                f'<path d="M278 150 C282 168 280 184 276 196 L268 196 C272 178 270 160 266 150 Z" fill="{METAL}"/>'   # protège-joue D
                # crête rouge
                f'<path d="M188 70 C188 40 212 40 212 70 C212 56 200 52 200 56 C200 52 188 56 188 70 Z" fill="{CRISTA}"/>'
                f'<path d="M192 70 C192 30 208 30 208 70" fill="{CRISTA}"/>'
                f'<rect x="194" y="60" width="12" height="78" fill="{CRISTA}"/>'
                f'<path d="M134 126 C134 110 150 100 200 100 C250 100 266 110 266 126" fill="none" stroke="{METAL_O}" stroke-width="3"/>')
    if role=="gaulois":
        # cheveux roux nets (silhouette propre, frange ondulée, sans pic)
        return (f'<path d="M120 178 C112 95 158 58 200 58 C242 58 288 95 280 178 '
                f'C280 150 270 138 256 136 C250 150 240 150 232 140 C224 152 210 152 200 142 '
                f'C190 152 176 152 168 140 C160 150 150 150 144 136 C130 138 120 150 120 178 Z" fill="{CHEV_GAUL}"/>'
                f'<path d="M120 178 C112 108 140 78 176 62 C150 86 134 130 134 176 Z" fill="{CHEV_GAUL_O}" stroke="none"/>')
    # cheveux romains courts (conseiller / empereur)
    base=(f'<path d="M120 178 C112 95 158 66 200 66 C242 66 288 95 280 178 '
          f'C280 150 270 138 256 136 C250 150 240 150 232 140 C224 152 210 152 200 142 '
          f'C190 152 176 152 168 140 C160 150 150 150 144 136 C130 138 120 150 120 178 Z" fill="{CHEVEUX}"/>'
          f'<path d="M120 178 C112 110 140 80 175 70 C150 90 134 130 134 175 Z" fill="{CHEVEUX_OMBRE}" stroke="none"/>')
    if role=="empereur":
        # couronne de laurier
        laur=f'<g stroke="{CERNE}" stroke-width="2.5">'
        # bande
        laur+=f'<path d="M122 120 C160 100 240 100 278 120" fill="none" stroke="{OR_O}" stroke-width="4"/>'
        # feuilles gauche
        for i,(x,y,r) in enumerate([(150,118,-35),(168,110,-30),(186,104,-22),(204,102,-12)]):
            laur+=f'<ellipse cx="{x}" cy="{y}" rx="13" ry="6" fill="#5E8A5C" transform="rotate({r} {x} {y})"/>'
        for i,(x,y,r) in enumerate([(250,118,35),(232,110,30),(214,104,22)]):
            laur+=f'<ellipse cx="{x}" cy="{y}" rx="13" ry="6" fill="#5E8A5C" transform="rotate({r} {x} {y})"/>'
        laur+=f'<circle cx="200" cy="100" r="6" fill="{OR}"/>'
        laur+='</g>'
        return base+laur
    return base

def moustache(role):
    if role=="gaulois":
        return f'<path d="M170 240 C184 256 196 256 200 250 C204 256 216 256 230 240 C216 268 184 268 170 240 Z" fill="{CHEV_GAUL}" stroke="{CERNE}" stroke-width="3.5"/>'
    if role=="marchand":
        # barbe courte
        return (f'<path d="M138 210 C140 270 168 300 200 300 C232 300 260 270 262 210 '
                f'C256 250 230 264 200 264 C170 264 144 250 138 210 Z" fill="{CHEVEUX}" stroke="{CERNE}" stroke-width="4"/>'
                f'<path d="M176 248 C186 258 214 258 224 248 C214 262 186 262 176 248 Z" fill="{CHEVEUX}" stroke="none"/>')
    return ""

def perso(role="conseiller", expr="neutre", bg=None):
    skin_l = PEAU
    parts=[]
    if bg: parts.append(f'<rect width="400" height="440" fill="{bg}"/>')
    parts.append(f'<g stroke="{CERNE}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">')
    parts.append(corps(role))
    # cou
    parts.append(f'<path d="M176 274 L176 326 Q200 340 224 326 L224 274 Z" fill="{PEAU2}"/>')
    parts.append(f'<path d="M176 300 Q200 318 224 300 L224 326 Q200 340 176 326 Z" fill="{PEAU_OMBRE}" stroke="none" opacity="0.6"/>')
    # tête
    parts.append(f'<ellipse cx="200" cy="190" rx="80" ry="92" fill="{skin_l}"/>')
    parts.append(f'<path d="M200 100 C250 104 280 150 280 190 C280 245 245 280 200 282 C235 270 258 230 258 188 C258 145 235 108 200 100 Z" fill="{PEAU_OMBRE}" stroke="none" opacity="0.5"/>')
    # oreilles : forme d'oreille attachée à la tête (pas de trait côté visage)
    parts.append(
        f'<path d="M129 179 C107 180 103 207 122 213 C125 208 124 196 127 188 C127 184 128 181 129 179 Z" fill="{PEAU}" stroke="none"/>'
        f'<path d="M271 179 C293 180 297 207 278 213 C275 208 276 196 273 188 C273 184 272 181 271 179 Z" fill="{PEAU2}" stroke="none"/>'
        f'<path d="M129 180 C108 182 105 206 122 212" fill="none" stroke="{CERNE}" stroke-width="4.5"/>'
        f'<path d="M271 180 C292 182 295 206 278 212" fill="none" stroke="{CERNE}" stroke-width="4.5"/>'
        f'<path d="M121 189 C115 193 115 202 120 206" fill="none" stroke="{CERNE}" stroke-width="2.8"/>'
        f'<path d="M279 189 C285 193 285 202 280 206" fill="none" stroke="{CERNE}" stroke-width="2.8"/>')
    parts.append(coiffe(role))
    parts.append(visage(expr))
    parts.append(moustache(role))
    parts.append('</g>')
    return f'<svg width="400" height="440" viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg">{"".join(parts)}</svg>'

if __name__=="__main__":
    import sys
    if len(sys.argv)>1 and sys.argv[1]=="export":
        import os
        out="/home/claude/legatus2/legatus-romanisation/assets/img/perso"
        os.makedirs(out, exist_ok=True)
        combos=[(r,e) for r in ("conseiller","empereur","centurion","gaulois","marchand")
                       for e in ("neutre","content","inquiet","severe")]
        for role,expr in combos:
            open(f"{out}/{role}-{expr}.svg","w").write(perso(role,expr))
        print("exporté", len(combos), "personnages dans", out)
        sys.exit(0)
    # planche de contrôle
    cell_w, cell_h = 340, 374
    items=[("conseiller","neutre"),("conseiller","content"),("conseiller","inquiet"),("conseiller","severe"),
           ("empereur","neutre"),("centurion","severe"),("gaulois","neutre"),("conseiller","content")]
    cols=4; rows=2
    W=cell_w*cols; H=cell_h*rows
    svg=[f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">']
    svg.append(f'<rect width="{W}" height="{H}" fill="#F2ECE0"/>')
    for i,(role,expr) in enumerate(items):
        cx=(i%cols)*cell_w; cy=(i//cols)*cell_h
        inner=perso(role,expr).replace('<svg width="400" height="440" viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg">','').replace('</svg>','')
        svg.append(f'<g transform="translate({cx},{cy}) scale({cell_w/400})">{inner}</g>')
        svg.append(f'<text x="{cx+cell_w/2}" y="{cy+cell_h-8}" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#3A2E26">{role}/{expr}</text>')
    svg.append('</svg>')
    open('/home/claude/perso/planche.svg','w').write("".join(svg))
    cairosvg.svg2png(url='/home/claude/perso/planche.svg', write_to='/home/claude/perso/planche.png', output_width=W, output_height=H)
    print("planche générée", W, H)

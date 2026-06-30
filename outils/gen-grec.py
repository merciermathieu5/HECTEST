#!/usr/bin/env python3
# Générateur de personnages grecs SVG modulaires (rôles + expressions).
# Mêmes visage/tête/assemblage que Legatus ; corps, coiffes et barbes grecs.
import os

CERNE="#3A2E26"
PEAU="#E8B68C"; PEAU_OMBRE="#D99C6E"; PEAU2="#E3A878"
CHEV="#4A3A2A"; CHEV_O="#3A2D20"; GRIS="#9A9183"; GRIS_O="#7E766A"
CHITON="#EFE7D6"; HIM="#F6F1E5"; HIM_PLI="#D6CBB0"
BLEU="#1C5D7A"; BLEU_O="#13455B"; OR="#C49A3A"; OR_O="#8F6E22"
OCRE="#C9923C"; OCRE_O="#9A6E22"; ROUGE="#9E3B2E"; ROUGE_O="#7C2A20"
METAL="#C2A85A"; METAL_O="#8A7330"; BRONZE="#B0843A"
EXOMIS="#9C7B4E"; EXOMIS_O="#7C5F38"
PERSE="#3D6E73"; PERSE_O="#2A5055"; PERSE_BAND="#6E2E64"

# ------------------------------------------------------------------ VISAGE
def visage(expr):
    nez = f'<path d="M198 184 C196 200 190 212 188 218 Q200 226 210 216" fill="none" stroke="{CERNE}" stroke-width="4.5"/>'
    def oeil(cx, ferme=False, joie=False):
        if joie:
            return f'<path d="M{cx-15} 182 Q{cx} 172 {cx+15} 182" fill="none" stroke="{CERNE}" stroke-width="5"/>'
        h = 9 if ferme else 12.5
        return (f'<ellipse cx="{cx}" cy="180" rx="15" ry="{h}" fill="#fff"/>'
                f'<circle cx="{cx+3 if cx<200 else cx-3}" cy="182" r="6.5" fill="{CERNE}" stroke="none"/>'
                f'<circle cx="{cx+5 if cx<200 else cx-1}" cy="180" r="2" fill="#fff" stroke="none"/>')
    if expr=="neutre":
        s=(f'<path d="M150 162 Q170 153 188 160" fill="none" stroke="{CERNE}" stroke-width="6"/>'
           f'<path d="M212 160 Q230 153 250 162" fill="none" stroke="{CERNE}" stroke-width="6"/>')
        y=oeil(168)+oeil(232); b=f'<path d="M178 246 Q200 257 222 246" fill="none" stroke="{CERNE}" stroke-width="5"/>'
    elif expr=="content":
        s=(f'<path d="M150 156 Q170 148 188 155" fill="none" stroke="{CERNE}" stroke-width="6"/>'
           f'<path d="M212 155 Q230 148 250 156" fill="none" stroke="{CERNE}" stroke-width="6"/>')
        y=oeil(168,joie=True)+oeil(232,joie=True)
        b=(f'<path d="M172 242 Q200 272 228 242 Z" fill="#fff" stroke="{CERNE}" stroke-width="5"/>'
           f'<path d="M180 248 Q200 258 220 248" fill="none" stroke="{CERNE}" stroke-width="2.5"/>')
    elif expr=="inquiet":
        s=(f'<path d="M150 166 Q170 150 190 156" fill="none" stroke="{CERNE}" stroke-width="6"/>'
           f'<path d="M210 156 Q230 150 250 166" fill="none" stroke="{CERNE}" stroke-width="6"/>')
        y=oeil(168)+oeil(232); b=f'<path d="M182 252 Q200 246 218 252" fill="none" stroke="{CERNE}" stroke-width="5"/>'
    else: # severe
        s=(f'<path d="M150 154 Q172 158 192 168" fill="none" stroke="{CERNE}" stroke-width="6.5"/>'
           f'<path d="M208 168 Q228 158 250 154" fill="none" stroke="{CERNE}" stroke-width="6.5"/>'
           f'<path d="M200 160 L200 172" stroke="{CERNE}" stroke-width="3" fill="none"/>')
        y=oeil(168,ferme=True)+oeil(232,ferme=True)
        b=f'<path d="M178 252 Q200 246 222 252" fill="none" stroke="{CERNE}" stroke-width="5.5"/>'
    return s+y+nez+b

# ------------------------------------------------------------------ CORPS
def corps(role):
    drape = (f'<path d="M118 440 C150 360 250 345 320 360 C338 400 338 440 338 440 Z" fill="{HIM}"/>'
             f'<path d="M150 430 C180 380 235 366 300 376" fill="none" stroke="{HIM_PLI}" stroke-width="4"/>'
             f'<path d="M168 438 C200 398 250 388 312 398" fill="none" stroke="{HIM_PLI}" stroke-width="4"/>')
    pin = f'<circle cx="300" cy="360" r="11" fill="{OR}"/><circle cx="300" cy="360" r="4" fill="{OR_O}" stroke="none"/>'
    base = f'<path d="M70 440 C70 350 120 320 200 320 C280 320 330 350 330 440 Z" fill="{CHITON}"/>'
    if role=="conseiller":
        return base+drape+f'<path d="M118 440 C150 360 250 345 320 360" fill="none" stroke="{BLEU}" stroke-width="9"/>'+pin
    if role=="citoyen":
        return base+drape+f'<path d="M118 440 C150 360 250 345 320 360" fill="none" stroke="{OCRE}" stroke-width="9"/>'+pin
    if role=="stratege":
        # himation + liseré bleu + pteruges (lanières de cuir) suggérant le chef de guerre
        return (base+drape
                +f'<path d="M118 440 C150 360 250 345 320 360" fill="none" stroke="{BLEU}" stroke-width="9"/>'
                +f'<g fill="{EXOMIS}" stroke="{EXOMIS_O}" stroke-width="2">'
                 f'<rect x="120" y="430" width="16" height="14" rx="3"/><rect x="142" y="432" width="16" height="12" rx="3"/>'
                 f'<rect x="164" y="433" width="16" height="11" rx="3"/></g>'+pin)
    if role=="paysan":
        # exomis : tunique d'une épaule, droite nue, teinte terreuse
        return (f'<path d="M70 440 C70 352 120 324 200 324 C280 324 330 352 330 440 Z" fill="{EXOMIS}"/>'
                f'<path d="M214 330 C266 332 306 356 326 410 C320 426 312 434 306 440 L250 440 '
                f'C250 392 236 354 214 332 Z" fill="{PEAU2}"/>'
                f'<path d="M90 408 Q200 426 286 408" fill="none" stroke="{EXOMIS_O}" stroke-width="6"/>'
                f'<path d="M120 360 Q170 374 206 360" fill="none" stroke="{EXOMIS_O}" stroke-width="4"/>')
    if role=="perse":
        # longue robe à motifs + bande verticale dorée
        dots="".join(f'<circle cx="{x}" cy="{yy}" r="3.4" fill="{OR}"/>'
                     for x in (110,150,250,290) for yy in (372,402,432))
        return (f'<path d="M64 440 C64 348 116 320 200 320 C284 320 336 348 336 440 Z" fill="{PERSE}"/>'
                f'<path d="M64 440 C66 366 116 340 200 340 C284 340 334 366 336 440" fill="none" stroke="{PERSE_O}" stroke-width="5"/>'
                f'<rect x="188" y="330" width="24" height="110" fill="{OR}"/>'
                f'<rect x="194" y="330" width="12" height="110" fill="{PERSE_BAND}"/>'
                +dots
                +f'<path d="M150 352 Q200 368 250 352" fill="none" stroke="{OR_O}" stroke-width="3"/>')
    if role=="spartiate":
        # chiton sobre + manteau rouge (phoinikis) sur une épaule
        return (f'<path d="M64 440 C64 348 120 322 200 322 C280 322 336 348 336 440 Z" fill="#CBBFA2"/>'
                f'<path d="M235 336 C302 338 324 372 332 432 C302 412 272 398 247 394 Z" fill="{ROUGE}"/>'
                f'<path d="M245 348 C295 354 316 384 322 428" fill="none" stroke="{ROUGE_O}" stroke-width="3"/>'
                f'<path d="M86 404 Q180 420 232 404" fill="none" stroke="#A99A78" stroke-width="5"/>')
    if role=="marchand":
        chiton=f'<path d="M70 440 C70 350 120 320 200 320 C280 320 330 350 330 440 Z" fill="#C98A5A"/>'
        bord=f'<path d="M118 440 C150 360 250 345 320 360" fill="none" stroke="{OCRE}" stroke-width="9"/>'
        bourse=(f'<ellipse cx="116" cy="410" rx="15" ry="19" fill="#8A5A2B" stroke="{CERNE}" stroke-width="3"/>'
                f'<path d="M104 396 Q116 388 128 396" fill="none" stroke="{CERNE}" stroke-width="3"/>')
        return chiton+drape+bord+bourse+pin
    return base+drape+pin

# ------------------------------------------------------------------ COIFFE
def cheveux(col, col_o):
    return (f'<path d="M120 178 C112 95 158 66 200 66 C242 66 288 95 280 178 '
            f'C280 150 270 138 256 136 C250 150 240 150 232 140 C224 152 210 152 200 142 '
            f'C190 152 176 152 168 140 C160 150 150 150 144 136 C130 138 120 150 120 178 Z" fill="{col}"/>'
            f'<path d="M120 178 C112 110 140 80 175 70 C150 90 134 130 134 175 Z" fill="{col_o}" stroke="none"/>')

def casque_corinthien(crista):
    # casque relevé sur le crâne : dôme de bronze au-dessus du front + cimier
    return (f'<path d="M126 132 C126 64 162 42 200 42 C238 42 274 64 274 132 '
            f'C274 116 262 108 244 108 L156 108 C138 108 126 116 126 132 Z" fill="{METAL}"/>'
            f'<path d="M126 132 C126 96 150 78 200 78 C250 78 274 96 274 132" fill="none" stroke="{METAL_O}" stroke-width="3"/>'
            f'<rect x="150" y="116" width="100" height="14" rx="6" fill="{METAL}" stroke="{METAL_O}" stroke-width="2"/>'
            # cimier (crête)
            f'<path d="M190 42 C190 14 210 14 210 42 Z" fill="{crista}"/>'
            f'<rect x="194" y="22" width="12" height="64" fill="{crista}"/>'
            f'<path d="M188 86 C188 40 212 40 212 86" fill="{crista}"/>')

def coiffe(role):
    if role=="conseiller":
        # cheveux gris + bandeau (tainia)
        return (cheveux(GRIS,GRIS_O)
                +f'<path d="M126 138 C160 120 240 120 274 138" fill="none" stroke="{OCRE}" stroke-width="6"/>'
                 f'<path d="M126 138 C160 120 240 120 274 138" fill="none" stroke="{OR_O}" stroke-width="2"/>')
    if role=="citoyen":
        return cheveux(CHEV,CHEV_O)
    if role=="paysan":
        return (cheveux(CHEV,CHEV_O)
                +f'<path d="M150 92 l8 -14 M180 78 l4 -14 M222 78 l-2 -14 M252 92 l-8 -14" '
                 f'stroke="{CHEV_O}" stroke-width="4" fill="none"/>')
    if role=="stratege":
        return cheveux(CHEV,CHEV_O)+casque_corinthien(BLEU_O)
    if role=="spartiate":
        # longue chevelure spartiate + casque relevé à cimier rouge
        return (cheveux(CHEV,CHEV_O)
                +f'<path d="M120 176 C112 220 116 268 126 300 L150 300 C138 262 134 214 134 176 Z" fill="{CHEV}"/>'
                +f'<path d="M280 176 C288 220 284 268 274 300 L250 300 C262 262 266 214 266 176 Z" fill="{CHEV}"/>'
                +casque_corinthien(ROUGE))
    if role=="perse":
        # tiare (kidaris) + cheveux bouclés sur les côtés
        return (cheveux(CHEV,CHEV_O)
                +f'<path d="M134 110 C134 60 150 40 200 40 C250 40 266 60 266 110 Z" fill="{PERSE_BAND}"/>'
                f'<path d="M134 110 C134 60 150 40 200 40 C250 40 266 60 266 110" fill="none" stroke="{OR}" stroke-width="4"/>'
                f'<path d="M138 96 H262" stroke="{OR}" stroke-width="6"/>'
                f'<path d="M150 72 H250" stroke="{OR}" stroke-width="4"/>'
                +"".join(f'<circle cx="{x}" cy="58" r="3.5" fill="{OR}"/>' for x in (168,200,232)))
    if role=="marchand":
        cap="#2E6E78"; cap_o="#21545C"
        bonnet=(f'<path d="M130 120 C128 74 152 54 194 54 C232 54 256 72 250 104 '
                f'C244 84 224 76 198 76 C170 76 146 86 134 110 Z" fill="{cap}" stroke="{cap_o}" stroke-width="2"/>'
                f'<path d="M150 58 C138 36 108 40 100 62 C118 52 140 56 154 70 Z" fill="{cap}" stroke="{cap_o}" stroke-width="2"/>')
        return cheveux(CHEV,CHEV_O)+bonnet
    return cheveux(CHEV,CHEV_O)

# ------------------------------------------------------------------ BARBE
def barbe(role):
    courte=(f'<path d="M138 210 C140 270 168 300 200 300 C232 300 260 270 262 210 '
            f'C256 250 230 264 200 264 C170 264 144 250 138 210 Z" fill="{{c}}" stroke="{CERNE}" stroke-width="4"/>'
            f'<path d="M176 248 C186 258 214 258 224 248 C214 262 186 262 176 248 Z" fill="{{c}}" stroke="none"/>')
    if role in ("conseiller",):
        return courte.replace("{c}",GRIS)
    if role in ("citoyen","stratege","marchand"):
        return courte.replace("{c}",CHEV)
    if role=="paysan":
        return f'<path d="M158 248 C170 268 230 268 242 248 C232 280 168 280 158 248 Z" fill="{CHEV}" stroke="none" opacity="0.7"/>'
    if role=="spartiate":
        # barbe longue
        return (f'<path d="M134 206 C134 296 168 348 200 348 C232 348 266 296 266 206 '
                f'C258 250 230 264 200 264 C170 264 142 250 134 206 Z" fill="{CHEV}" stroke="{CERNE}" stroke-width="4"/>'
                f'<path d="M172 250 C184 262 216 262 228 250" fill="none" stroke="{CERNE}" stroke-width="2.5"/>')
    if role=="perse":
        # barbe carrée bouclée (achéménide)
        rangs="".join(f'<path d="M{150} {y} Q200 {y+16} 250 {y}" fill="none" stroke="{CERNE}" stroke-width="2.5"/>'
                      for y in (276,300,324))
        return (f'<path d="M140 208 C140 250 150 264 150 264 L150 336 C150 348 250 348 250 336 L250 264 '
                f'C250 264 260 250 260 208 C254 248 230 264 200 264 C170 264 146 248 140 208 Z" '
                f'fill="{CHEV}" stroke="{CERNE}" stroke-width="4"/>'+rangs)
    return ""

# ------------------------------------------------------------------ ASSEMBLAGE
def perso(role="conseiller", expr="neutre"):
    parts=[f'<g stroke="{CERNE}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">']
    parts.append(corps(role))
    parts.append(f'<path d="M176 274 L176 326 Q200 340 224 326 L224 274 Z" fill="{PEAU2}"/>')
    parts.append(f'<path d="M176 300 Q200 318 224 300 L224 326 Q200 340 176 326 Z" fill="{PEAU_OMBRE}" stroke="none" opacity="0.6"/>')
    parts.append(f'<ellipse cx="200" cy="190" rx="80" ry="92" fill="{PEAU}"/>')
    parts.append(f'<path d="M200 100 C250 104 280 150 280 190 C280 245 245 280 200 282 C235 270 258 230 258 188 C258 145 235 108 200 100 Z" fill="{PEAU_OMBRE}" stroke="none" opacity="0.5"/>')
    parts.append(
        f'<path d="M129 179 C107 180 103 207 122 213 C125 208 124 196 127 188 C127 184 128 181 129 179 Z" fill="{PEAU}" stroke="none"/>'
        f'<path d="M271 179 C293 180 297 207 278 213 C275 208 276 196 273 188 C273 184 272 181 271 179 Z" fill="{PEAU2}" stroke="none"/>'
        f'<path d="M129 180 C108 182 105 206 122 212" fill="none" stroke="{CERNE}" stroke-width="4.5"/>'
        f'<path d="M271 180 C292 182 295 206 278 212" fill="none" stroke="{CERNE}" stroke-width="4.5"/>')
    parts.append(coiffe(role))
    parts.append(barbe(role))
    parts.append(visage(expr))
    parts.append('</g>')
    return f'<svg width="400" height="440" viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg">{"".join(parts)}</svg>'

ROLES=("conseiller","citoyen","stratege","paysan","perse","spartiate","marchand")
EXPRS=("neutre","content","inquiet","severe")

if __name__=="__main__":
    import sys
    out = sys.argv[2] if len(sys.argv)>2 else "../assets/img/perso"
    os.makedirs(out, exist_ok=True)
    n=0
    for r in ROLES:
        for e in EXPRS:
            open(f"{out}/{r}-{e}.svg","w").write(perso(r,e)); n+=1
    print("exporté", n, "personnages dans", out)

# Imagens e vídeos da casa NUVO · prompts

O topo do site agora são **cenas em foto**: cada ambiente ocupa a tela inteira e uma pequena rolada leva ao próximo,
numa passagem com parallax. Então o que mais melhora o site agora são **fotos**, não vídeos. Elas estão logo abaixo,
em "Fotos para as cenas do topo". O voo em vídeo continua no ar em `?video`, e os prompts dele seguem depois.

## Fotos para as cenas do topo

Gere no Flow sempre **anexando uma imagem da casa como referência** (as 5 imagens de baixo estão em
`assets/img/keys/`), para todas as cenas parecerem a mesma casa: mesma madeira, mesma pedra, mesma luz. Baixe na
**maior resolução** que ele oferecer (o site usa 2752 px de largura; menor que isso eu amplio, mas a original grande
fica melhor). Depois é só me mandar, ou rodar `tools/make-scenes.sh nome=arquivo.png` (veja o README).

### 1. As versões em pé (9:16) das 5 cenas · resolve o "corta a imagem" do celular

No celular em pé cabe só um quarto da largura da foto 16:9. Hoje o site centraliza o ponto mais bonito e a câmera
passeia devagar pela sala, mas com a versão em pé o celular mostra o ambiente inteiro. Anexe cada uma das 5 imagens
(porta, sala, cozinha, closet, casa) e peça:

```text
Recreate this exact scene as a vertical 9:16 photograph from the same camera position and height: same architecture, materials, woodwork, furniture, light and colors. Keep the main subject centered and extend the view upward and downward (ceiling and floor) instead of cropping the sides. Ultra-photorealistic architectural photography, physically accurate light and reflections. No people, no text, no logos, no watermark, no fisheye. --ar 9:16
```

Nomes: `door-tall.png`, `living-tall.png`, `kitchen-tall.png`, `closet-tall.png`, `house-tall.png`. No site cada uma
entra como `tall` na cena dela, e o celular em pé passa a usar a foto em pé no lugar da larga.

### 2. Mais cozinha (o Guilherme pediu mais cozinhas e mais detalhes)

Cozinha é o carro-chefe. Estas três viram cenas novas logo depois da cozinha atual. Anexe a **imagem da cozinha**
(`assets/img/keys/kitchen.webp`) como referência em todas.

**Cozinha · o detalhe da gaveta e da ilha** (`kitchen-detail.png`)

```text
Use the attached image as the strict reference for the same kitchen, materials and light. Close-up architectural detail photograph at counter height, 50mm lens: the end of the white-oak island where the thick white quartzite waterfall edge meets the travertine floor, and a fully open push-to-open walnut drawer with fitted white-oak dividers holding neatly arranged utensils and linen. Flawless grain match across the drawer fronts, razor-thin even reveals, crisp edges. Warm golden-hour side light grazing across the wood grain, shallow depth of field with the brass pendants softly out of focus in the background. Premium editorial interior photography, physically accurate materials and reflections. No people, no hands, no text, no logos, no brand names, no watermark. --ar 16:9
```

**Cozinha · a despensa e a parede de armários** (`kitchen-pantry.png`)

```text
Use the attached image as the strict reference for the same kitchen, materials and light. The camera now stands beside the island at eye level (1.5 meters), 24mm lens, looking at the wall of handleless walnut tall cabinets with two tall pantry doors swung fully open, revealing a walk-in-depth pantry fitted entirely in white oak: lit shelves with warm 2700K LED strips, pull-out drawers with glass jars, ceramic bowls and neatly folded linen, and a recessed appliance garage with an espresso machine on a honed quartzite counter. The island and one brass pendant are visible in the foreground on the left. Every piece of cabinetry is finished, precise and immaculate. Three-layer depth, premium architectural interior photography, physically accurate materials and reflections. No people, no text, no logos, no brand names, no watermark, no fisheye, no clutter. --ar 16:9
```

**Cozinha · vista do outro lado, para o jardim** (`kitchen-garden.png`)

```text
Use the attached image as the strict reference for the same residence, kitchen, materials and light. Reverse angle: the camera is now behind the walnut tall cabinets at eye level (1.5 meters), 24mm lens, looking across the full length of the white-oak island with its quartzite waterfall top, the three brass pendants and the leather stools, toward floor-to-ceiling glass doors fully open to the tropical garden and the pool in golden-hour light. On the right, a long walnut buffet with fluted doors and a backlit oak shelf above it. Premium architectural interior photography with deep foreground, midground and background separation, physically accurate light and reflections. No people, no text, no logos, no watermark, no fisheye, no clutter. --ar 16:9
```

### 3. Outros ambientes (opcional · o índice do site já tem escritório, bar e lavanderia)

Anexe a **imagem da sala** (`assets/img/keys/living.webp`) como referência.

**Bar e adega** (`bar.png`)

```text
Use the attached image as the strict reference for the same residence, materials and light. The camera is at eye level (1.4 meters), 24mm lens, perfectly centered on a built-in wet bar and wine wall: floor-to-ceiling walnut cabinetry with a glass-enclosed, softly lit wine display in the center, bronze-tinted glass shelves with crystal glasses, a honed quartzite bar top with a brass faucet, and fluted white-oak panels on both sides. Evening light, warm 2700K accent lighting. Premium architectural interior photography, physically accurate materials and reflections. No people, no text, no logos, no labels on bottles, no watermark, no fisheye. --ar 16:9
```

**Escritório** (`office.png`)

```text
Use the attached image as the strict reference for the same residence, materials and light. The camera is at eye level (1.4 meters), 24mm lens, centered on a home office: a floor-to-ceiling walnut library wall with backlit open shelves holding books and ceramics, closed lower cabinets with push-to-open doors, a slim brass rolling ladder, and a long white-oak desk floating in front of a window with the tropical garden in soft afternoon light. Every piece of woodwork is finished, precise and immaculate. Premium architectural interior photography, physically accurate materials and reflections. No people, no screens with content, no text, no logos, no watermark, no fisheye. --ar 16:9
```

**Banheiro** (`bath.png`)

```text
Use the attached image as the strict reference for the same residence, materials and light. The camera is in the primary bathroom at eye level (1.5 meters), 24mm lens, perfectly centered on a long floating walnut double vanity with handleless drawers and a thick honed travertine top with two integrated basins and brushed brass faucets, a full-width mirror with warm backlighting, fluted white-oak wall panels and a tall window with soft golden-hour light. Premium architectural interior photography, physically accurate materials and reflections. No people, no text, no logos, no watermark, no fisheye. --ar 16:9
```

Para cada cena nova, gere também a versão em pé (prompt do item 1).

---

## Vídeos para a visita por clique (`?tour`)

A visita por clique é no formato do reel do @michonmotion: a câmera para num ambiente, a pessoa clica numa etiqueta
("Kitchen", "Closet") e um vídeo curto leva a câmera até lá; o "voltar" toca o mesmo vídeo de trás para frente. Hoje
ela usa os vídeos do filme (720p e com a marcenaria se montando, que de trás para frente fica estranho, por isso o
voltar ainda é uma fusão). Para chegar no nível do reel, cada caminho precisa de um vídeo **limpo**: só a câmera
andando, nada se montando nem mudando de forma.

No **Flow**, use **Frames to Video** (Veo) com o **primeiro e o último quadro**, **16:9**, e baixe em **1080p**
(*Upscaled*). Os quadros são as imagens das cenas (as de `assets/img/keys/`, ou as novas do item acima). Como o vídeo
termina exatamente na imagem do ambiente, a parada fica perfeita.

| Arquivo | Primeiro quadro | Último quadro | O caminho |
| --- | --- | --- | --- |
| `living-kitchen.mp4` | sala | cozinha | da sala, passando pela abertura, até a cozinha |
| `living-closet.mp4` | sala | closet | da sala, subindo a escada flutuante, até o closet |
| `door-living.mp4` | porta | sala | a porta pivotante abre e a câmera entra até a sala |
| `living-bar.mp4` (opcional) | sala | bar (item 3 acima) | da sala até o bar e a adega |
| `closet-house.mp4` (opcional) | closet | casa acesa | do closet, saindo pela janela, até a casa vista de fora |

Prompt base (troque a origem e o destino):

```text
Smooth, steady gimbal camera walking at a calm, constant pace from the living room (first frame) through the open passage into the kitchen (last frame). One continuous camera move with a gentle ease-in at the start and ease-out at the end, eye level 1.5 meters, 24mm lens. The architecture, furniture, millwork and lighting stay exactly the same the whole time: nothing appears, disappears, assembles or changes shape. Photorealistic, natural light, subtle motion blur, perfectly stable horizon. No people, no text, no cuts, no fast moves.
```

Para o closet (a escada): troque o caminho por
`...from the living room (first frame), turning toward the floating walnut staircase, gliding up the stairs and along the upstairs hallway into the walk-in closet (last frame)...`.

Confira antes de mandar: a câmera não para nem dá trancos, o último quadro é igual à imagem, nada se deforma e não
aparece gente. Depois é só me mandar, ou rodar `tools/make-tour-videos.sh living-kitchen=arquivo.mp4` (faz o vídeo e a
versão de trás para frente) e apontar o caminho em `content.js` → `visit.moves` (veja o README).

---

## O filme em vídeo (`?video`)

Mesmo método do site de referência que o Guilherme mandou ("Criei um Site 3D com IA Sem Usar 3D", do Lucas Rocha):
uma **imagem inicial**, uma **imagem final** gerada usando a primeira como referência, e um **vídeo de 10 segundos no
Seedance 2.0** que liga as duas num voo de drone FPV contínuo, com a casa se montando na frente da câmera.
O scroll do site controla esse vídeo: desce, o voo avança; sobe, o voo volta.

A diferença para a referência: o Guilherme quer **sem a rua** e **passando pelos ambientes**, com cada um se montando
até virar produto da Nuvo. Por isso, em vez de um vídeo só, são **4 vídeos encadeados**: o último quadro de um é o
primeiro do próximo, e no site eles viram um voo só, da porta da casa até a casa inteira acesa.

| Vídeo | Arquivo | Começa em | Termina em | O que se monta no caminho |
| --- | --- | --- | --- | --- |
| 1 | `01-living.mp4` | Imagem 1 · porta fechada | Imagem 2 · sala pronta | Hall (painéis, aparador, escada) e sala (painel de TV, aparador, nichos, bar) |
| 2 | `02-kitchen.mp4` | último quadro do vídeo 1 | Imagem 3 · cozinha pronta | Ilha, armários, nicho iluminado, pendentes |
| 3 | `03-closet.mp4` | último quadro do vídeo 2 | Imagem 4 · closet pronto | Escada até o andar de cima, closet (armários, ilha, iluminação) |
| 4 | `04-finale.mp4` | último quadro do vídeo 3 | Imagem 5 · casa acesa ao entardecer | Cabeceira e escrivaninha do quarto, saída pela piscina, drone recua e mostra a casa |

**Total: 5 imagens e 4 vídeos de 10 s.** Se o tempo for curto, faça só o **vídeo 1**: sozinho ele já dá o efeito
da referência, e os outros entram no site conforme ficarem prontos.

### Passo a passo

1. **Imagem 1** (16:9) com o prompt dela. Ela define a casa inteira: materiais, luz, paisagismo.
2. **Imagens 2, 3 e 4**: anexe a imagem indicada como referência e cole o prompt. **Imagem 5**: anexe a Imagem 1.
   Gere de novo até ficarem com cara da mesma casa (mesma madeira, mesma pedra, mesma luz).
3. **Vídeo 1** no **Seedance 2.0, 10 segundos, 16:9**: Imagem 1 como `@image_1` e Imagem 2 como `@image_2`.
4. **Vídeos 2, 3 e 4**: `@image_1` é o **último quadro do vídeo anterior** e `@image_2` é a próxima imagem.
   Usar o último quadro de verdade (e não a imagem) é o que faz a emenda entre os vídeos sumir.
   Para tirar o último quadro: me mande o vídeo aqui que eu devolvo o quadro em alta, ou exporte no próprio gerador.
   Se pular essa parte e usar a imagem mesmo, o site disfarça a diferença com uma transição curta.
5. Me mande os MP4 com os nomes da tabela. Mande também as 5 imagens: enquanto um vídeo não chega, o site
   mostra as imagens daquele trecho.

Em gerador sem `@image`, use os campos de primeiro e último quadro (first/last frame) e cole o mesmo prompt.
Fora do Seedance, funciona no Kling (start/end frame) e no Veo 3.1 (first/last frame).

**Confira cada vídeo antes de mandar** (o scroll deixa a pessoa parar em qualquer quadro, então defeito aparece):

- O movimento começa logo no primeiro segundo.
- O voo faz curvas de verdade, não é um zoom reto.
- O último quadro é igual à imagem final.
- Nada derrete, pisca ou muda de forma, e a marcenaria termina reta e precisa.
- Não aparecem pessoas, letras nem drones (na primeira leva, o vídeo 4 mostrou drones sobre a piscina;
  por isso os prompts agora proíbem isso).

---

### As 5 imagens

#### Imagem 1 · A porta (início do site)

```text
Ultra-photorealistic cinematic establishing frame of the front entrance of a fictional contemporary luxury residence in Boca Raton, South Florida. Eye-level camera at 1.6 meters, perfectly centered, 24mm wide-angle architectural lens. A monumental 4-meter closed pivot front door in warm American walnut with a slim vertical matte-black pull dominates the center, set into a tall wall of honed limestone beneath a deep cantilevered concrete canopy with a white-oak soffit and hidden warm lighting. Large limestone stepping pads cross a still reflecting pool toward the door. Dense high-end tropical landscaping frames both sides: royal palms, bird-of-paradise, sculpted shrubs, ornamental grasses, textured stone planters and warm garden lighting. Soft late-afternoon golden-hour sunlight, long soft shadows, realistic reflections on the water, premium architectural photography with deep foreground, midground and background separation. The interior must not be visible yet: the closed door creates mystery about what exists behind it. Perfectly symmetrical composition, physically accurate materials and lighting, genuinely buildable architecture. No street, no cars, no gate, no people, no signs, no text, no logos, no watermark, no fisheye distortion, no aerial view. --ar 16:9
```

#### Imagem 2 · A sala pronta (anexe a Imagem 1)

```text
Use the attached image as the strict reference for the same fictional residence in Boca Raton. Preserve its architectural language, materials (honed limestone, warm American walnut, rift-cut white oak, matte-black metal), golden-hour light and color palette. The camera is now inside, past the front door and the double-height foyer, at eye level (1.4 meters) with the same 24mm architectural lens, perfectly centered on the main wall of the open living room. The wall is a floor-to-ceiling composition of vertical fluted walnut panels with a large black TV mounted flush in the center, a long floating white-oak console below it with push-to-open doors, and symmetrical backlit display niches with ceramics glowing in warm 2700K light. At the right edge, part of a wet bar with bronze-tinted glass shelves and a wine column. A low cream sofa and a wool rug in the foreground, honed travertine floor, floor-to-ceiling glass on the left with the tropical garden in golden light. Every piece of woodwork is finished, precise and immaculate: the work of a high-end custom millwork studio. Three-layer depth, premium architectural interior photography, physically accurate materials, reflections and contact shadows. No people, no pets, no text, no logos, no watermark, no fisheye, no kitchen visible. --ar 16:9
```

#### Imagem 3 · A cozinha pronta (anexe a Imagem 2)

```text
Use the attached image as the strict reference for the same residence and interior style. Preserve the materials, golden-hour light, travertine floor, ceiling height and color palette. The camera is now in the open kitchen next to the living room, at counter height (1.2 meters), 24mm lens, perfectly centered on a long white-oak island with a thick waterfall-edge white quartzite top, three sculptural brass pendant lights above it and four leather counter stools. Behind the island, a full wall of handleless walnut tall cabinets with an integrated refrigerator and ovens, and a recessed niche with backlit oak shelves in the center. A large window on the left looks onto the tropical garden in golden light. All cabinetry is finished, precise and immaculate. Three-layer depth, premium architectural interior photography, physically accurate materials and reflections. No people, no text, no logos, no watermark, no fisheye, no clutter. --ar 16:9
```

#### Imagem 4 · O closet pronto (anexe a Imagem 2)

```text
Use the attached image as the strict reference for the same residence and interior style. Preserve the materials (white oak, walnut, travertine, brushed brass), warm light and color palette. The camera is now upstairs, inside the primary walk-in closet, at eye level (1.5 meters), 24mm lens, in a perfectly symmetrical view down the center. On both sides, floor-to-ceiling white-oak wardrobes with bronze-tinted glass doors and integrated warm LED lighting, with neatly hung clothes and lit shoe shelves. In the center, an island with walnut drawers and a pale stone top. At the far end, a full-height mirror and a velvet bench under a clerestory window with warm late-afternoon light. All woodwork is finished, precise and immaculate. Premium architectural interior photography, physically accurate materials and reflections. No people, no text, no logos, no brand names on clothes, no watermark, no fisheye. --ar 16:9
```

#### Imagem 5 · A casa inteira acesa (anexe a Imagem 1; fim do site)

```text
Use the attached image as the strict reference for the same residence, materials and landscaping. The camera has pulled back about 40 meters and risen to 6 meters, still perfectly centered on the front entrance axis. The entire two-story contemporary residence is now visible just after sunset: cantilevered concrete volumes, honed limestone walls, the tall walnut pivot door and floor-to-ceiling glass. Every room glows with warm interior light, revealing walnut and white-oak millwork inside: the living room media wall, the kitchen, the upstairs closet. The reflecting pool mirrors the facade, royal palms frame both sides, and the sky is a soft warm afterglow fading to deep blue. Premium architectural photography, physically accurate light and reflections, perfectly symmetrical composition. No people, no cars, no street, no text, no logos, no watermark, no fisheye. --ar 16:9
```

---

### Os 4 vídeos (Seedance 2.0 · 10 segundos · 16:9)

#### Vídeo 1 · Da porta à sala · `01-living.mp4`

`@image_1` = Imagem 1 · `@image_2` = Imagem 2

```text
STYLE: Photoreal luxury-interior film, anamorphic, natural 24fps motion, warm South Florida golden hour. Live action, NOT CGI or 3D render.

SCENE: Exactly 10 seconds, 16:9, ONE CONTINUOUS FPV CINEWHOOP TAKE, NO CUTS. The flight goes through the front door of a contemporary Boca Raton residence, crosses the double-height foyer and tours the living room while its custom woodwork assembles, then resolves into a frontal hero view of the finished media wall.

REFERENCES: @image_1 is the exact opening frame: the closed walnut pivot door; preserve its timber, limestone, water, plants, perspective and light. @image_2 is the exact finished living room and final frame; preserve its media wall, console, niches, bar, furniture and composition. No redesign.

CAMERA: Fluid 18mm FPV cinewhoop with strong foreground parallax and real inertia, flying between 1 and 2 meters high indoors. Never use a straight push-in. Path: door push-through → S-curve through the double-height foyer → descending bank into the living room → C-curve along the media wall → settle into @image_2. Constantly vary yaw, roll and altitude; never fly straight for more than 0.6 seconds. Pass only through visible openings.

LIGHT/COLOR: Golden sun shafts through floor-to-ceiling glass; warm 2700K lights activate as each piece finishes. Amber walnut, pale white oak, honed travertine and limestone, brushed brass, matte black; accurate glass and stone reflections.

CONSTRUCTION: A physical construction wave travels just ahead of the camera. The architecture is already there (walls, floors, windows); only the woodwork and furniture assemble. No instant appearance or morphing. Wall panels rise and lock, fluted walnut slats click into place one by one, cabinet boxes slide in and seat, doors close flush, shelves slot into niches, stone tops lower with weight, LED strips ignite. Real gravity, inertia, shadows and occlusion; never block the camera.

ACTION:
0:00–0:01.0 — Motion immediately. The walnut pivot door in @image_1 swings open on its pivot while the drone accelerates over the stepping pads and through the gap.
0:01.0–0:03.5 — Inside the bare double-height foyer: full-height white-oak wall paneling rises from the floor and locks, a floating walnut console seats against the wall and its LED strip ignites, and the floating staircase's oak treads slot into the wall one by one in the background. Bank right beneath the staircase landing.
0:03.5–0:07.5 — Descend into the open living room and perform a 60-degree C-curve along the main wall: vertical fluted walnut panels assemble outward from the center, the long floating white-oak console slides in and locks, the backlit niches fill and light up one by one, the TV mounts flush, and on the right the wet bar's bronze glass shelves slot in. The sofa and rug settle with weight.
0:07.5–0:10.0 — Decelerate, level the horizon and arc back into the precise symmetrical frontal composition of @image_2. At exactly 10 seconds, match @image_2.

COMPOSITION/PHYSICS: Three-layer depth: close architecture or plants in the foreground, woodwork assembling in the midground, finished room in the background. Real mass, grounded shadows, stable geometry.

TECHNICAL: Natural motion blur; no jitter, duplicate frames or geometry drift. Fast but readable; crisp, precise final woodwork.

AUDIO: No music or dialogue.

CONSTRAINTS: No cuts, transitions, teleportation, straight-only flight, slow motion, particles, dissolves, morphs, visible drones or quadcopters (the camera itself is never seen), people, pets, vehicles, text or logos. Lock @image_1 as the opening and @image_2 as the exact design and final frame.
```

#### Vídeo 2 · Da sala à cozinha · `02-kitchen.mp4`

`@image_1` = último quadro do vídeo 1 (ou a Imagem 2) · `@image_2` = Imagem 3

```text
STYLE: Photoreal luxury-interior film, anamorphic, natural 24fps motion, warm South Florida golden hour. Live action, NOT CGI or 3D render.

SCENE: Exactly 10 seconds, 16:9, ONE CONTINUOUS FPV CINEWHOOP TAKE, NO CUTS. The flight leaves the finished living room, flows through an open passage into the kitchen while its custom cabinetry assembles, then resolves into a frontal hero view of the finished island.

REFERENCES: @image_1 is the exact opening frame: the finished living room; preserve everything in it. @image_2 is the exact finished kitchen and final frame; preserve the island, walnut cabinetry, niche, pendants, stools and composition. No redesign.

CAMERA: Fluid 18mm FPV cinewhoop with strong foreground parallax and real inertia, flying between 0.9 and 1.8 meters high. Never use a straight push-in. Path: lateral bank away from the media wall → glide through the open passage → drop to counter height → C-curve around the island → rise and settle into @image_2. Constantly vary yaw, roll and altitude; never fly straight for more than 0.6 seconds. Pass only through visible openings.

LIGHT/COLOR: Golden sun through the garden window; warm 2700K lights activate as each piece finishes. Amber walnut, pale white oak, white quartzite, honed travertine, brushed brass; accurate stone, glass and metal reflections.

CONSTRUCTION: A physical construction wave travels just ahead of the camera. The kitchen architecture is already there (walls, floor, window); only the cabinetry, appliances and lighting assemble. No instant appearance or morphing. Cabinet boxes rise and lock, doors close flush, the stone slab lowers with weight, appliances slide in and seat, shelves slot in, pendants descend on their cables and ignite. Real gravity, inertia, shadows and occlusion; never block the camera.

ACTION:
0:00–0:01.5 — Motion immediately. Bank left away from the media wall in @image_1 and glide past the edge of the bar toward the open passage; the living room stays finished behind.
0:01.5–0:04.0 — Enter the bare kitchen: white walls, travertine floor, plumbing ready. Drop to counter height as the island's oak cabinet boxes rise from the floor and the thick waterfall quartzite slab lowers onto them with weight.
0:04.0–0:07.5 — C-curve around the island: handleless walnut tall cabinets slide in and lock along the back wall from left to right, the refrigerator and ovens seat flush, the oak shelves slot into the backlit niche, the three brass pendants descend and illuminate, and the leather stools slide into alignment.
0:07.5–0:10.0 — Rise to 1.2 meters, level the horizon and settle into the precise symmetrical composition of @image_2. At exactly 10 seconds, match @image_2.

COMPOSITION/PHYSICS: Three-layer depth: close cabinetry or stools in the foreground, cabinetry assembling in the midground, finished kitchen in the background. Real mass, grounded shadows, stable geometry.

TECHNICAL: Natural motion blur; no jitter, duplicate frames or geometry drift. Fast but readable; crisp, precise final cabinetry.

AUDIO: No music or dialogue.

CONSTRAINTS: No cuts, transitions, teleportation, straight-only flight, slow motion, particles, dissolves, morphs, visible drones or quadcopters (the camera itself is never seen), people, pets, text or logos. Lock @image_1 as the opening and @image_2 as the exact design and final frame.
```

#### Vídeo 3 · Da cozinha ao closet · `03-closet.mp4`

`@image_1` = último quadro do vídeo 2 (ou a Imagem 3) · `@image_2` = Imagem 4

```text
STYLE: Photoreal luxury-interior film, anamorphic, natural 24fps motion, warm South Florida late-afternoon light. Live action, NOT CGI or 3D render.

SCENE: Exactly 10 seconds, 16:9, ONE CONTINUOUS FPV CINEWHOOP TAKE, NO CUTS. The flight leaves the finished kitchen, climbs the floating staircase to the upper floor, enters the primary suite and tours the walk-in closet while it assembles, then resolves into a symmetrical hero view down the finished closet.

REFERENCES: @image_1 is the exact opening frame: the finished kitchen; preserve everything in it. @image_2 is the exact finished walk-in closet and final frame; preserve its wardrobes, glass doors, island, mirror, bench and composition. No redesign.

CAMERA: Fluid 18mm FPV cinewhoop with strong foreground parallax and real inertia. Never use a straight push-in. Path: pivot away from the island → rising spiral up the floating oak staircase → glide along the upstairs hallway → through the open double doors of the primary suite → S-curve down the closet aisle → settle into @image_2. Constantly vary yaw, roll and altitude; never fly straight for more than 0.6 seconds. Pass only through visible openings.

LIGHT/COLOR: Warm sun strobing through the stair glass; warm 2700K LED strips ignite as each wardrobe finishes. Pale white oak, walnut, bronze-tinted glass, pale stone, brushed brass; accurate glass and mirror reflections.

CONSTRUCTION: A physical construction wave travels just ahead of the camera. The closet room is already there (walls, floor, clerestory window); only the woodwork, lighting and contents assemble. No instant appearance or morphing. Wardrobe frames rise and lock, shelves and hanging rails slot in, glass doors swing shut, drawers slide in, the stone top lowers with weight, garments slide onto the rails on their hangers, shoes settle on the lit shelves. Real gravity, inertia, shadows and occlusion; never block the camera.

ACTION:
0:00–0:01.5 — Motion immediately. Pivot right away from the island in @image_1 and accelerate toward the floating oak staircase.
0:01.5–0:04.0 — Climb the staircase in a rising spiral, following the treads, with warm sunlight strobing through the glass; glide along the upstairs hallway past walnut paneling.
0:04.0–0:07.5 — Pass through the open double doors into the bare walk-in closet: white-oak wardrobe frames rise along both walls and lock, shelves and rails slot in, the bronze glass doors swing shut, LED strips ignite from the back to the front, and the central island assembles drawer by drawer as its stone top settles with weight. Garments slide onto the rails and shoes settle on the lit shelves.
0:07.5–0:10.0 — Decelerate in the center aisle, level the horizon and settle into the precise symmetrical view of @image_2. At exactly 10 seconds, match @image_2.

COMPOSITION/PHYSICS: Three-layer depth: door frame or wardrobe edges in the foreground, woodwork assembling in the midground, mirror and bench in the background. Real mass, grounded shadows, stable geometry.

TECHNICAL: Natural motion blur; no jitter, duplicate frames or geometry drift. Fast but readable; crisp, precise final woodwork.

AUDIO: No music or dialogue.

CONSTRAINTS: No cuts, transitions, teleportation, straight-only flight, slow motion, particles, dissolves, morphs, visible drones or quadcopters (the camera itself is never seen), people, pets, text or logos. Lock @image_1 as the opening and @image_2 as the exact design and final frame.
```

#### Vídeo 4 · Do closet à casa inteira · `04-finale.mp4`

`@image_1` = último quadro do vídeo 3 (ou a Imagem 4) · `@image_2` = Imagem 5

```text
STYLE: Photoreal luxury-property film, anamorphic, natural 24fps motion, South Florida golden hour turning into sunset afterglow. Live action, NOT CGI or 3D render.

SCENE: Exactly 10 seconds, 16:9, ONE CONTINUOUS FPV CINEWHOOP TAKE, NO CUTS. The flight leaves the finished walk-in closet, crosses the primary bedroom while its last pieces of woodwork assemble, exits over the reflecting pool and rises into a frontal hero view of the whole residence glowing with warm light.

REFERENCES: @image_1 is the exact opening frame: the finished walk-in closet; preserve everything in it. @image_2 is the exact final frame: the complete residence at sunset; preserve its architecture, facade, glowing interiors, pool, palms and composition. No redesign.

CAMERA: Fluid 18mm FPV cinewhoop with strong foreground parallax and real inertia. Never use a straight push-in. Path: turn away from the mirror → glide into the primary bedroom → bank toward the open sliding glass doors → exit onto the terrace → skim the reflecting pool → smooth ascending orbit pulling back → settle into @image_2. Constantly vary yaw, roll and altitude; never fly straight for more than 0.6 seconds. Pass only through visible openings.

LIGHT/COLOR: Warm interior light inside; outside, the sun dips below the horizon as the camera rises and every window glows warm against a soft afterglow sky fading to deep blue. Walnut, white oak, limestone, concrete, black metal; accurate glass and water reflections.

CONSTRUCTION: Only the bedroom's last woodwork assembles, as a physical wave just ahead of the camera: walnut headboard wall panels rise and lock one by one, a built-in white-oak desk niche seats beside the window, bedside lights activate. No instant appearance or morphing. Real gravity, inertia, shadows and occlusion; never block the camera. Everything outside is already complete.

ACTION:
0:00–0:01.5 — Motion immediately. Turn away from the mirror in @image_1 and glide out of the closet into the primary bedroom.
0:01.5–0:04.0 — In the bedroom, the full-height walnut headboard wall assembles panel by panel and the built-in white-oak desk niche seats beside the window; bedside lights activate. Bank toward the open sliding glass doors.
0:04.0–0:06.5 — Exit onto the terrace, descend and skim 40 cm above the reflecting pool, producing ripples and reflections of the glowing facade.
0:06.5–0:10.0 — Accelerate into a smooth ascending orbit around the front while pulling back. Reveal the completed residence with warm light in every room, level the horizon and align with the central entrance axis. At exactly 10 seconds, arrive at the precise symmetrical composition of @image_2.

COMPOSITION/PHYSICS: Three-layer depth: close architecture or palms in the foreground, glowing rooms and pool in the midground, the residence and sky in the background. Real mass, grounded shadows, water ripples, stable geometry.

TECHNICAL: Natural motion blur; no jitter, duplicate frames or geometry drift. Fast but readable; crisp final architecture.

AUDIO: No music or dialogue.

CONSTRAINTS: No cuts, transitions, teleportation, straight-only flight, slow motion, particles, dissolves, morphs, visible drones or quadcopters (the camera itself is never seen), people, pets, vehicles, text or logos. Lock @image_1 as the opening and @image_2 as the exact design and final frame.
```

---

### Depois de gerar

Me mande os MP4 (pode ser um de cada vez) e as imagens. Eu rodo, na pasta `nuvo-woodwork/`:

```bash
tools/make-videos.sh
```

O script prepara cada vídeo para andar liso com o scroll (16:9 para computador e um recorte do centro em 3:4 para
celular), atualiza `assets/video/manifest.js` e o site passa a usar o vídeo daquele trecho. Os trechos que ainda não
têm vídeo mostram as imagens, então dá para publicar aos poucos.

**Baixe sempre na maior resolução** (no Flow: **1080p Upscaled**). No celular em pé o site mostra só o meio do
vídeo, bem ampliado; com 720p a imagem fica mole, com 1080p fica bem mais nítida.

---

## Teste em 3D de verdade (Marble · World Labs)

**Por que testar:** em vez de um vídeo, o site recebe o ambiente em 3D (Gaussian Splatting: milhões de pontinhos
coloridos tirados de imagens) e o navegador desenha a cena ao vivo, na frequência da tela.

- **Fluidez:** não existem quadros, então não há o que travar.
- **Celular:** em pé, a câmera abre na vertical em vez de cortar as laterais.
- **Montagem:** no começo do scroll, o ambiente "se monta" em volta de quem chega.

**Faça primeiro com um ambiente só, a cozinha:**

1. Entre em <https://marble.worldlabs.ai> e crie um mundo a partir de imagem.
2. Suba a **Imagem 3 · a cozinha pronta**, no arquivo original, sem compressão do WhatsApp. Se o Guilherme mandar
   fotos de cozinhas reais da Nuvo, faça também com uma delas: aí é a cozinha de verdade deles em 3D.
3. Use o modelo mais forte disponível. Quando ficar pronto, ande um pouco dentro do mundo e confira:
   - a marcenaria tem que ficar reta, sem derreter;
   - não pode aparecer nada estranho atrás da câmera.
4. Exporte: **Gaussian splat → SPZ → 500k** (a versão mais leve, boa para o site). Exportar exige o plano pago.
5. Abra <https://nuvo-woodwork.lucassouzalima10.workers.dev/lab/3d.html> no computador e no celular, escolha o
   arquivo e role a página. Ou me mande o arquivo, que eu deixo no link e ajusto o caminho da câmera.

**Outra forma, com realidade total:** escanear uma cozinha pronta de verdade com o iPhone. Use o Scaniverse
(grátis), o Polycam ou o Luma:

- ande devagar em volta do ambiente filmando por 1 a 2 minutos, olhando para a marcenaria de vários ângulos;
- exporte em SPZ ou PLY e me mande.

---

## Versão em pé do filme em vídeo (9:16)

No celular em pé o filme em vídeo mostra só o meio do vídeo 16:9, e o Guilherme achou que fica cortado. Se o caminho
voltar a ser o vídeo, a solução é o mesmo voo gravado em pé:

1. **As 5 imagens em 9:16:** anexe cada imagem 16:9 como referência e peça:

   ```
   Recreate this exact scene as a vertical 9:16 photograph from the same camera position and height: same
   architecture, materials, woodwork, furniture, light and colors. Keep the subject centered and extend the
   view upward and downward (ceiling and floor). Ultra-photorealistic architectural photography, no people,
   no text, no watermark. --ar 9:16
   ```

2. **Os 4 vídeos em 9:16:** mesmos prompts, mesmo gerador e **mesma duração (10 s)**. Use as imagens 9:16 como
   primeiro e último quadro (e, do vídeo 2 em diante, o último quadro do vídeo anterior em 9:16).
3. Nomes: `01-living-mobile.mp4`, `02-kitchen-mobile.mp4`, `03-closet-mobile.mp4`, `04-finale-mobile.mp4`.
   O script já usa esses arquivos no celular em pé no lugar do recorte.

**Baixe sempre em 1080p ou 4K** (no Flow: *Upscaled*). Os vídeos atuais são 720p.

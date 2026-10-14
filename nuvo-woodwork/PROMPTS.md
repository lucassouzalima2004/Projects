# Vídeos da casa NUVO · prompts

O site abre como um filme: uma casa de alto padrão em South Florida, e conforme a pessoa rola a página a câmera passa
pelos ambientes e cada um se monta sozinho, de parede pelada até o móvel da Nuvo pronto. São **8 vídeos**, um por cena.

Cada vídeo vira uma sequência de imagens e o scroll controla o vídeo quadro a quadro. Enquanto um vídeo não existe,
a cena aparece como desenho técnico que vira a foto real (as cenas externas aparecem como a fachada desenhada a traço).

| # | Nome do arquivo | Cena | O que acontece |
| --- | --- | --- | --- |
| 00 | `00-arrival.mp4` | Chegada (fachada, fim de tarde) | O drone desce até a porta, que abre |
| 01 | `01-foyer.mp4` | Hall de entrada | Painéis, aparador, banco e escada se montam |
| 02 | `02-kitchen.mp4` | Cozinha | Ilha, armários e pendentes se montam |
| 03 | `03-living.mp4` | Sala de TV + bar | Painel ripado, TV, nichos e bar se montam |
| 04 | `04-office.mp4` | Escritório | Estante, escada de biblioteca, mesa e forro |
| 05 | `05-closet.mp4` | Closet | Armários, ilha e iluminação |
| 06 | `06-laundry.mp4` | Lavanderia | Armários, bancada sobre as máquinas, pia |
| 07 | `07-finale.mp4` | A casa à noite (fim) | O drone se afasta da casa toda acesa |

## Como gerar (o jeito que dá menos retrabalho)

1. **Imagem final** de cada ambiente (já pronto, com a marcenaria): prompt "Imagem final" + o bloco de estilo.
2. **Imagem inicial**: edite a imagem final com o prompt "Imagem inicial (edição)". Editar a final, em vez de gerar
   outra do zero, mantém a mesma câmera, as mesmas paredes e a mesma luz. Assim o vídeo só precisa "montar" os móveis
   e não inventa um ambiente diferente no meio. Serve qualquer gerador que edite imagem mantendo o enquadramento
   (Nano Banana/Gemini, ChatGPT, Flux Kontext etc.).
3. **Vídeo** com primeiro quadro = imagem inicial e último quadro = imagem final (o recurso de start/end frame,
   ou "frames to video": Kling, Veo no Google Flow e outros) + o prompt "Vídeo".
4. Exporte em **MP4, 16:9, 1080p, 5 a 8 segundos, sem áudio**, com o nome da tabela.
5. Me mande os arquivos aqui na conversa. Eu converto e publico (veja "Depois de gerar", no fim).

Para a casa parecer uma só, use a imagem final da cena anterior como referência de estilo ao gerar a próxima.

## Regras para o scroll ficar bonito

- **Câmera quase parada**, no máximo um "push-in" lento. Câmera rápida vira tremedeira no scroll.
- **Um plano só**, sem cortes dentro do vídeo.
- **Sem pessoas e sem texto**: a IA deforma mãos e letras.
- **Peça principal no centro**: no celular o site corta as laterais do vídeo.
- **Mesma luz** (fim de manhã) em todos os ambientes internos.
- Se o vídeo sair com objeto derretendo, piscando ou mudando de forma, gere de novo antes de mandar: o scroll deixa
  qualquer defeito bem visível, porque a pessoa pode parar em qualquer quadro.

## Bloco de estilo

Cole no fim de **todo prompt de imagem dos ambientes internos** (onde aparece `[style block]`):

```text
Photorealistic architectural interior photography of a contemporary luxury home in Boca Raton, Florida. Warm minimalism: rift-cut white oak and American walnut millwork, matte lacquer, honed travertine floors, brushed brass details, hidden warm 2700K LED lighting. Soft late-morning daylight, gentle shadows. Full-frame camera, 24mm tilt-shift lens at eye level, one-point perspective, symmetrical composition with the main piece centered. Clean and uncluttered, no people, no text, no logos. 16:9.
```

Negative prompt, para os geradores que aceitam:

```text
people, hands, text, letters, logo, watermark, camera shake, fast camera movement, cuts, fisheye, distortion, warping, melting furniture, flicker, blurry
```

---

## 00 · Arrival · `00-arrival.mp4`

A chegada: de longe, no fim de tarde, até a porta de madeira, que abre. Aqui as duas imagens têm câmeras diferentes,
então gere a inicial primeiro e use-a como referência para a final.

**Imagem inicial**

```text
Aerial drone photograph at golden hour of a contemporary two-story luxury villa in Boca Raton, Florida. White stucco and limestone volumes, flat roofs with deep overhangs and warm teak wood soffits, floor-to-ceiling glass, a long reflecting pool in front, royal palms and a manicured tropical garden. The interior lights are starting to glow warm. The camera is high and far away, with the house centered in the frame. Photorealistic architectural photography, no people, no text, 16:9.
```

**Imagem final** (com a inicial como referência)

```text
The same villa, now seen at eye level from the front walkway at golden hour: a monumental 3-meter tall walnut pivot door in the center, slightly open, with warm light spilling from the entrance hall inside. Limestone steps cross the reflecting pool to the door, and palms frame both sides. Symmetrical, centered composition. Photorealistic, no people, no text, 16:9.
```

**Vídeo**

```text
One continuous cinematic drone shot. The camera glides slowly down and forward from high above the villa toward the front entrance, keeping the house centered, and settles at eye level in front of the tall walnut pivot door. As the camera arrives, the door swings open and warm light pours out. Golden hour, palm leaves moving gently, soft reflections on the pool. Smooth and stable, no cuts, no people.
```

## 01 · Foyer · `01-foyer.mp4`

**Imagem final**

```text
Double-height entrance foyer of the same villa. Centered on the back wall: full-height fluted white oak wall paneling with a floating walnut console lit from below by a warm LED strip, and a large round mirror above it. On the right, a built-in white oak bench with hidden shoe drawers; on the left, a floating staircase with thick oak treads. Honed travertine floor, soft daylight from a tall window. [style block]
```

**Imagem inicial (edição da final)**

```text
Edit this image. Keep exactly the same room, camera angle, window and daylight. Remove all the woodwork: the wall paneling, the console, the mirror, the bench and the staircase treads. Leave bare white primed drywall, a raw concrete floor and a few electrical boxes on the walls. The room is empty and unfinished. Change nothing else.
```

**Vídeo**

```text
Static camera with a very slow push-in. The empty, unfinished foyer builds itself: white oak panels slide up from the floor and click into place one by one across the back wall, the walnut console glides in and attaches to the wall, the mirror lowers into place, the bench assembles piece by piece, the staircase treads slot into the wall from bottom to top, and the concrete floor turns into travertine. Finally the warm LED lights fade on. Precise, satisfying architectural build, smooth motion, one continuous shot, no people.
```

## 02 · Kitchen · `02-kitchen.mp4`

**Imagem final**

```text
Open kitchen of the same villa. Centered: a long island in white oak with a thick waterfall-edge white quartzite top and three sculptural pendant lights above it. Behind it, a full wall of handleless walnut tall cabinets with an integrated refrigerator and ovens, and a recessed niche with backlit oak shelves in the middle. A large window on the left looks onto the tropical garden. [style block]
```

**Imagem inicial (edição da final)**

```text
Edit this image. Keep exactly the same kitchen space, camera angle, window and daylight. Remove all the cabinets, the island, the countertops, the shelves and the pendant lights. Leave bare primed walls with plumbing and electrical stubs, a raw concrete floor and empty ceiling junction boxes. The space is an empty shell before installation. Change nothing else.
```

**Vídeo**

```text
Static camera, slow push-in toward the island. The kitchen assembles itself: the island cabinet boxes rise from the floor and the quartzite slab lowers softly onto them, walnut panels slide in and click into place from left to right across the back wall, the doors close flush, the shelves slot into the niche, and the pendant lights descend from the ceiling and glow on. Precise, smooth, satisfying build, one continuous shot, no people.
```

## 03 · Living (sala de TV + bar) · `03-living.mp4`

**Imagem final**

```text
Living room media wall of the same villa. Centered: a floor-to-ceiling wall of vertical fluted walnut panels with a large black TV mounted flush in the middle, a long floating white oak console below it with push-to-open doors, and backlit display niches with ceramics on both sides. On the right side of the room, a wet bar with bronze-tinted glass shelves and a wine column. [style block]
```

**Imagem inicial (edição da final)**

```text
Edit this image. Keep exactly the same room, camera angle and daylight. Remove the media wall, the TV, the console, the niches and the bar. Leave a bare primed drywall wall with loose cables hanging where the TV will go, a raw concrete floor and nothing else. Change nothing else.
```

**Vídeo**

```text
Static camera, slow push-in. The fluted walnut panels unfold across the wall from the center outward, the floating console slides in and locks into place, the loose cables retract into the wall as the TV mounts flush, the display niches light up one by one, and the bar shelves slot in on the right. The warm ambient lights fade on. Smooth, satisfying, architectural, one continuous shot, no people.
```

## 04 · Office · `04-office.mp4`

**Imagem final**

```text
Home office of the same villa. Centered: a wall-to-wall built-in walnut bookcase with a brass library ladder on a rail, and a built-in white oak desk floating in front of it; a white oak coffered ceiling above; a leather desk chair and a warm desk lamp. A side window with a garden view. [style block]
```

**Imagem inicial (edição da final)**

```text
Edit this image. Keep exactly the same room, camera angle, window and daylight. Remove the bookcase, the ladder, the desk, the chair, the lamp and the coffered ceiling. Leave bare white walls, a flat drywall ceiling and a raw concrete floor. The room is empty. Change nothing else.
```

**Vídeo**

```text
Static camera, slow push-in. Bookcase shelves slide into the wall one row at a time from bottom to top, the brass ladder rolls in along its rail, the coffered ceiling beams lower into place, the desk extends out from the wall, books appear on the shelves and the desk lamp switches on. Calm, smooth, satisfying build, one continuous shot, no people.
```

## 05 · Closet · `05-closet.mp4`

**Imagem final**

```text
Primary walk-in closet of the same villa, in a symmetrical view down the center. On both sides, floor-to-ceiling white oak wardrobes with bronze-tinted glass doors and integrated warm LED lighting, with neatly hung clothes and shoes on lit shelves. In the center, an island with walnut drawers and a pale stone top. At the far end, a full-height mirror and a velvet bench. [style block]
```

**Imagem inicial (edição da final)**

```text
Edit this image. Keep exactly the same room, camera angle and light. Remove the wardrobes, the island, the mirror, the bench, the clothes and all the lighting. Leave bare white walls and a raw concrete floor. The room is empty. Change nothing else.
```

**Vídeo**

```text
Static camera, slow push-in down the center. Wardrobe frames rise along both walls, shelves and rails slot in, the glass doors swing shut, the LED strips light up from the back to the front, the island assembles drawer by drawer and its stone top settles on it, and the clothes appear on the rails. Elegant, smooth, satisfying, one continuous shot, no people.
```

## 06 · Laundry · `06-laundry.mp4`

**Imagem final**

```text
Laundry room of the same villa. Centered: a front-loading washer and dryer side by side under a white quartz countertop, flanked by tall white oak and matte cream lacquer cabinets; upper cabinets with open oak shelves; a built-in utility sink, a pull-out hamper and a hanging rod with a few shirts. A bright window. [style block]
```

**Imagem inicial (edição da final)**

```text
Edit this image. Keep exactly the same room, camera angle, window and daylight. Remove all the cabinets, the countertop, the sink, the shelves and the washer and dryer. Leave bare walls with exposed water and power hookups and a raw concrete floor. Change nothing else.
```

**Vídeo**

```text
Static camera, slow push-in. Base cabinets slide in, the washer and dryer roll into their slots, the countertop lowers onto them, the upper cabinets lift into place, the sink drops in and folded towels stack themselves on the shelves. Bright, clean, smooth, one continuous shot, no people.
```

## 07 · Finale · `07-finale.mp4`

O fecho: a casa inteira acesa à noite, a câmera se afastando. É sobre esse vídeo que aparece o "Your home is next"
com o botão da consultoria grátis. Como na chegada, gere a inicial e use-a como referência para a final.

**Imagem inicial**

```text
The same villa at blue hour, seen at eye level from across the reflecting pool. Every room glows with warm interior light behind the floor-to-ceiling glass, and the walnut and oak millwork is visible inside. Palms in silhouette, reflections on the water, a deep blue sky. Centered, symmetrical composition. Photorealistic architectural photography, no people, no text, 16:9.
```

**Imagem final** (com a inicial como referência)

```text
The same villa at night, seen from high above and far away: the whole house glowing warmly among dark palms, the reflecting pool lit, a deep blue night sky. The house is small and centered in the frame. Photorealistic, no people, no text, 16:9.
```

**Vídeo**

```text
One continuous cinematic drone shot. The camera slowly pulls back and rises from the reflecting pool, revealing the whole villa glowing at blue hour, interior lights warm and steady, palms swaying gently, soft reflections on the water. Smooth and stable, no cuts, no people.
```

---

## Versão vertical para celular (opcional)

Sem ela, o site recorta o centro do vídeo 16:9 para o celular em pé (por isso a peça principal no centro).
Se quiser caprichar, gere também uma versão vertical de cada cena: os mesmos prompts, trocando `16:9` por
`vertical 9:16, tall composition`, e as imagens inicial e final também em 9:16. Nome: `02-kitchen-mobile.mp4`.

## Depois de gerar

Me mande os MP4 aqui (pode ser um de cada vez). Eu rodo, na pasta `nuvo-woodwork/`:

```bash
tools/make-frames.sh
```

O script transforma cada vídeo em imagens WebP (versão 16:9 e versão para celular), atualiza
`assets/frames/manifest.js` e o site passa a usar o vídeo daquela cena. As cenas que ainda não têm vídeo continuam
com o desenho técnico, então dá para publicar aos poucos.

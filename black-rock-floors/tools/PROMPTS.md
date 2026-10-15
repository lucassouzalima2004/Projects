# Prompts para gerar clipes de piso por IA

O vídeo do topo hoje usa 3 clipes gratuitos (veja o `README.md`). Para ter um vídeo só da Black Rock Floors, dá para
gerar clipes num gerador de vídeo por IA (Veo, Kling, Runway, Sora…) e montar com o `tools/make-hero-video.sh`.
O Gabriel pediu **"vídeo de piso mesmo, passando"**: câmera andando devagar, rente ao piso, sem carpintaria.

## Regras que funcionam

- **Deitado (16:9), 1080p ou mais, 5 a 8 segundos.** Som não precisa.
- **Câmera lenta e baixa**, deslizando sobre o piso. Movimento rápido fica estranho com o texto por cima.
- **Luz de dia, suave**, com cara de casa da região de Seattle: janelas grandes, pinheiros lá fora, céu nublado claro.
- **Sem rostos e sem texto.** A IA costuma errar letras e logos: se quiser o logo, grave de verdade ou ponha na edição.
- O meio do quadro fica atrás do título: evite janela estourada ou objeto chamativo bem no centro.
- Confira se o plano da ferramenta permite **uso comercial**.

## Prompts (em inglês, que é como as ferramentas entendem melhor)

**1. Carvalho largo (hardwood)**

> Slow, low dolly shot gliding forward just above a newly installed wide-plank white oak floor in a bright, empty living
> room of a modern Pacific Northwest home. Soft overcast daylight from tall windows, evergreen trees outside, matte
> natural finish, visible wood grain, tight seams. Smooth camera, shallow depth of field, photorealistic, cinematic,
> no people, no text.

**2. Espinha de peixe (herringbone)**

> Smooth overhead tracking shot sliding slowly across a herringbone oak floor in a calm entryway, warm morning light
> crossing the boards at an angle, crisp joints, natural oil finish. Photorealistic, cinematic, no people, no text.

**3. Vinílico na cozinha (LVP)**

> Low tracking shot moving slowly across a light wood-look luxury vinyl plank floor in a modern white kitchen, soft
> daylight, a few water droplets beading on the surface in the foreground, clean baseboards. Photorealistic, cinematic,
> no people, no text.

**4. Porcelanato (tile)**

> Slow slider shot across large-format matte gray porcelain floor tiles in a modern bathroom, perfectly straight thin
> grout lines, soft window light, minimal decor. Photorealistic, cinematic, no people, no text.

**5. Escada (stair treads)**

> Slow upward tilt following new white oak stair treads with crisp bullnose nosing and painted white risers, black
> metal railing, soft daylight. Photorealistic, cinematic, no people, no text.

**6. Piso restaurado (refinishing)**

> Late-afternoon sunlight slowly moving across a freshly refinished red oak floor, satin finish glowing, every board
> even and smooth, empty room. Slow push-in, photorealistic, cinematic, no people, no text.

**7. Instalação (opcional)**

> Close-up of a flooring installer's hands in work gloves tapping a luxury vinyl plank into place with a tapping block,
> kneeling on a clean subfloor, black work shirt, soft daylight, slow camera. Photorealistic, no faces, no text.

## Montar o vídeo

1. Salve os clipes em `tools/clips/` (por exemplo `oak.mp4`, `herringbone.mp4`, `kitchen.mp4`).
2. No começo do `tools/make-hero-video.sh`, troque a lista `CLIPS`. Cada linha é
   `nome | arquivo | segundo onde começa | duração | centro do recorte em pé (0 a 1) | recorte opcional`:

   ```bash
   CLIPS=(
     "oak|tools/clips/oak.mp4|0.5|5|0.5"
     "herringbone|tools/clips/herringbone.mp4|0.5|4.5|0.5"
     "kitchen|tools/clips/kitchen.mp4|0.5|4.5|0.4"
   )
   ```

3. Rode `bash tools/make-hero-video.sh`. Ele grava as 3 versões (computador, telas médias e celular) em MP4 e WebM,
   e o primeiro quadro, em `assets/video/`.
4. Abra o site e confira o texto do topo sobre cada cena, no computador e no celular.

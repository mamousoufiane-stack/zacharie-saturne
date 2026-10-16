# Zacharie Flashiflash — Saturne, version 4 : personnage Blender animé

## Jouer et compiler

### Rocher qui s'effondre

Les quatre horloges flottantes du décor ont été retirées. Chaque astéroïde intermédiaire descend dès l'impact. Attendre 0,22 seconde pour la réception, puis sauter avant 0,85 seconde : les appuis anticipés ne sont pas mémorisés. Le départ et l'arrivée restent stables. En cas de chute, « Réessayer » relance le parcours. `node scripts/check-collapse.mjs` vérifie dans Chrome la descente, la fenêtre de saut, la chute et le redémarrage. Cette mécanique remplace l'attente libre et le tampon d'appui décrits dans les notes de validation de la version précédente.

Pour GitHub Pages, la version compilée est publiée dans `docs/`. Dans Settings → Pages, sélectionner « Deploy from a branch », branche `main`, dossier `/docs`, puis Save. L’adresse prévue est https://mamousoufiane-stack.github.io/zacharie-saturne/ ; elle ne fonctionne qu’après activation et déploiement de Pages.

Les chemins des modèles, textures, scripts et styles sont relatifs, pour fonctionner aussi bien dans ce sous-dossier que sur le serveur local. Après une modification, exécuter `npm run build` et actualiser `docs/` à partir de `dist/` avant publication.

Pour jouer sur ce PC : double-cliquer sur `../Jouer.cmd`, puis cliquer sur « C’EST PARTI » à `http://localhost:5173`. La version compilée est fournie dans `dist/` et Node.js est installé. Garder le serveur ouvert pendant la partie ; Ctrl+C permet de l’arrêter. `npm start` lance également le jeu. Ne pas ouvrir index.html via file://.

Pour développer : Node 20.19+ ou 22.12+, `npm ci`, puis `npm run dev`. Après modification, `npm run build` actualise la version jouable. `npm test` vérifie la logique, le GLB et les animations. `npm run test:browser` utilise Chrome installé sur ce PC et un serveur déjà lancé au port 5173.

Un appui sur l'écran, un clic sur le décor ou Espace déclenche un saut vers le prochain astéroïde. Le héros attend à l'arrêt entre les sauts. Aucun déplacement latéral, aucun accélérateur/frein, aucun double saut. Les appuis pendant le vol sont ignorés, sauf dans les 160 dernières millisecondes où un seul saut peut être mémorisé. Les interactions avec les menus ne font pas sauter. Échap ou Ⅱ met en pause. Le parcours finit sur le 36e astéroïde, indépendamment de la durée audio. Un appui près d'un temps du métronome démo donne un bonus ; ce n'est pas une détection automatique du rythme du MP3.

## Direction artistique

Le fond `public/images/saturn-backdrop.png` est une adaptation de la planche fournie : Saturne et ses anneaux ont été reconstruits après suppression des textes et personnages. C'est un fond image fixe, pas une planète 3D, et ce n'est pas une extraction pixel pour pixel. Le cadrage est adapté au ratio de l'écran. Les anneaux ne sont pas jouables.

Les îlots jouables et le décor utilisent les trois véritables modèles glTF Wandering Asteroids Of Andromeda fournis par l’utilisateur. La silhouette est conservée grâce à une échelle uniforme. Les dalles, couronnes et supports artificiels ont été supprimés. Un raycast sur chaque astéroïde détermine son point de contact ; le placement du personnage tient compte de la position réelle de ses pieds. Les matériaux sont teintés en violet, avec éclairage doré. Textures originales embarquées (environ 37 Mo ; premier chargement plus long). Attribution CC BY 4.0 dans le menu Crédits et ASSETS_CREDITS.md.

Le personnage vient du fichier Blender Zacharie, adapté de la base Ryder et de la coiffure OBJ fournis. `public/models/zacharie.glb` contient le squelette, le skinning, les couleurs et la texture des iris intégrée. Il est normalisé à 2,65 unités et orienté vers le prochain astéroïde. Les clips Idle, JumpStart, JumpAir, Land et Victory sont pilotés par l’état du jeu ; le vol suit la trajectoire de 1,05 seconde, sans seconde translation dans l’animation. Les jambes utilisent une IK calculée puis enregistrée dans les clips pour conserver l’appui des pieds pendant les flexions.

Le GLB représente 68 929 triangles, 14 objets de maillage avant export, 20 os et environ 3,36 Mo. L’ancien personnage reste disponible dans `src/character-fallback.js` et prend le relais si le GLB ne charge pas ; un message le signale. Les sources se trouvent dans `../art/characters/zacharie/`, notamment `blender/zacharie_game_rig.blend` et `scripts/export_game.py`. Les fichiers artistiques précédents sont conservés.

## Musique

Aucun MP3 fourni. Le mode démo de 104 secondes et ses marqueurs fictifs sont conservés. La course peut continuer après la fin du morceau jusqu'au dernier astéroïde.

« Studio de synchronisation » : importer le MP3, écouter, placer les 13 marqueurs avec ⊕ ou saisir les secondes, exporter JSON. Remplacer `src/data/saturnTimeline.json` avec le fichier exporté. Placer la chanson dans `public/audio/saturne.mp3`, puis recompiler pour l'embarquer. Les changements dans le studio sont temporaires tant qu'ils ne sont pas exportés.

En mode MP3, `audio.currentTime` reste l'horloge. Les marqueurs nuls ne sont pas déclenchés. Pause arrête audio et saut ; la reprise conserve les états. Les événements modifient les paroles affichées et certains effets, mais ne changent plus le déplacement : l'utilisateur n'a qu'une action, sauter. Les champs end/action/anticipation restent conservés dans le JSON mais ne pilotent pas encore de séquences indépendantes. Le bonus rythmique reste un métronome fixe de démonstration.

## Modules

- `jumping.js` : sauts entre îlots, attente, réception, score, fin.
- `controls.js` : appui/clic/Espace et pause uniquement.
- `world.js` : fond image, glTF Andromeda, astéroïdes, lumière et caméra.
- `asteroids.js` : extraction des trois géométries, échelle uniforme, contacts par raycast.
- `character.js` : chargement du GLB, AnimationMixer et synchronisation des cinq clips ; `character-fallback.js` : ancien modèle de secours.
- `audio.js`, `data/saturnTimeline.json` : horloge et calibration.
- `main.js`, `ui.js`, `style.css` : orchestration, studio et interface.
- `effects.js` : particules et éléments cosmiques.
- `gameplay.js` : validation des timelines ; ancien RunnerState conservé pour référence, non utilisé par le jeu V2.

## Vérifications et limites

Tests : attente sans déplacement, saut exact entre deux centres, appuis rapides sans double saut, tampon d'appui unique, 36 îlots atteignables, validation timeline et GLTFLoader sur les modèles locaux. Compilation Vite.

Contrôles effectués : compilation Vite, 14 tests Node, réimport GLB dans Blender 4.5, chargement et textures dans Chrome automatisé, saut clavier jusqu’au rocher suivant, réception, pause, arrivée à la victoire et commande tactile en viewport 390×844 sans débordement horizontal. Les cinq poses exportées ont été inspectées visuellement. Captures : `test-results/`. Les pieds restent stables à moins de 0,005 unité dans les animations d’appui testées.

Le parcours complet est couvert par les tests de logique ; le contrôle navigateur de victoire place le joueur sur l’avant-dernier rocher puis effectue le dernier saut. Le test tactile est une émulation dans Chrome, pas une mesure sur un téléphone physique. Les performances mobiles réelles restent à vérifier, notamment à cause des textures Andromeda existantes (environ 37 Mo). Les sauts sont guidés entre îlots, sans échec punitif ni simulation physique libre. Les contacts centraux des 37 astéroïdes et le dégagement de l’arc sont vérifiés sur leurs géométries.

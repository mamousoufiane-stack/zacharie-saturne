# Provenance des ressources

## Kenney — Space Kit

- Auteur : Kenney (https://kenney.nl)
- Page officielle : https://kenney.nl/assets/space-kit
- Archive réellement téléchargée le 15 octobre 2026 : https://kenney.nl/media/pages/assets/space-kit/20874c75ac-1677698978/kenney_space-kit.zip
- Licence : Creative Commons Zero 1.0 (CC0), https://creativecommons.org/publicdomain/zero/1.0/
- Vérification : la page officielle affiche CC0 ; le fichier License.txt fourni dans l’archive confirme CC0 et l’utilisation personnelle, pédagogique et commerciale. Attribution facultative.
- Copie de la licence originale : `public/models/KENNEY_LICENSE.txt`.
- Modèles extraits sans modification : `meteor.glb`, `meteor_detailed.glb`, `meteor_half.glb`, `rock.glb`, `rock_largeA.glb`, `rock_largeB.glb`, `rock_crystals.glb`, `rock_crystalsLargeA.glb`, `rock_crystalsLargeB.glb`, `rocks_smallA.glb`, `rocks_smallB.glb`.
- Chaque GLB contient sa géométrie et ses matériaux ; aucune texture ou URL distante requise. L’en-tête et le JSON glTF de chaque fichier ont été vérifiés après extraction. Le chargement dans la scène doit être validé par les tests du jeu.

## Éléments originaux du projet

Le personnage provisoire, Saturne, ses anneaux, la piste, les textures procédurales, les effets lumineux et l’interface sont créés pour ce projet dans le code. Les planches transmises par l’utilisateur servent de direction artistique et ne constituent pas des modèles 3D importés. Le personnage exact des planches n’est pas un asset existant intégré.

## Audio

Aucun MP3 de la chanson n’a été fourni. Le mode de démonstration n’est pas une synchronisation validée avec la chanson. Ajouter un fichier autorisé à `public/audio/saturne.mp3`, puis calibrer et exporter les marqueurs.

## Créations originales de cette version

- Zacharie : interprétation 3D procédurale animée, créée pour ce projet à partir de la description ; aucun modèle tiers de garçon intégré.
- Texture de Saturne, nébuleuse, étoiles, piste, effets, interface et mélodie synthétique : créations procédurales du projet.
- Images utilisateur : consultées comme références de direction artistique, non incorporées aux fichiers distribués.
- Three.js : MIT ; Vite : MIT. Voir licences des dépendances installées.

## Mise à jour V2

`public/images/saturn-backdrop.png` : image générée avec l'outil intégré image_gen à partir de la planche utilisateur `1000144086.png`. Adaptation/inpainting du décor, non extraction identique. Consigne : conserver Saturne crème-or, anneaux lumineux, nébuleuse bleu-violet ; supprimer textes, panneaux, interfaces, personnages, animaux et routes ; compléter les zones masquées ; laisser le bas libre pour les astéroïdes 3D. Aucun modèle 3D tiers de Zacharie ajouté.

## V3 — Astéroïdes choisis par l’utilisateur

This work is based on "Wandering Asteroids Of Andromeda" (https://sketchfab.com/3d-models/wandering-asteroids-of-andromeda-6a8e84e0fdea43628b8b3ab85b130281) by ARCTIC WOLVES™ (https://sketchfab.com/arctic.wolves) licensed under CC-BY-4.0 (https://creativecommons.org/licenses/by/4.0/).

Archive fournie par l’utilisateur : wandering_asteroids_of_andromeda.zip. Licence originale dans public/models/andromeda/license.txt. Les trois géométries et neuf textures sont intégrées localement. Changements : teinte violette par facteur de couleur, conversion des matériaux specular-glossiness vers metallic-roughness pour compatibilité Three.js, réglage de rugosité et de force du relief ; repositionnement, rotation et échelle uniforme. Géométrie et fichiers textures conservés. Animation de présentation du pack non jouée. Aucun ajout de dalle plate ni modification de silhouette. Les modèles Kenney restent archivés dans le projet mais ne sont plus utilisés dans la scène.


## Personnage Blender intégré (version 4)

Base : `ryder-paw-patrol.zip` et coiffure `black-messy-hair-with-horns.zip`, archives fournies par l’utilisateur. Aucun auteur ou fichier de licence n’était inclus dans ces deux archives ; aucune attribution ou licence supplémentaire n’est supposée. Adaptations locales : coiffure châtain, visage et sourire, tenue orange/noire et emblèmes, rig, animations et conversion GLB. Les archives d’origine restent conservées. Aucun service externe de génération ou téléversement utilisé pour ce personnage.
# Second skin : casque spatial

This work is based on "space helmet" (https://sketchfab.com/3d-models/space-helmet-4135c92041514754829013181fbc7ee6) by J4747 (https://sketchfab.com/J4747), licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
Archive fournie : `space_helmet.zip`. Modifications : adaptation des proportions au personnage, visière transparente, liaison rigide à l'os Head. Le modèle fourni est distinct du premier lien Ryan King Art.

# Gants du skin spatial

This work is based on "space gloves" (https://sketchfab.com/3d-models/space-gloves-b8c0735db3d6431583406819c204fe1a) by gohean33 (https://sketchfab.com/gohean33), licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
Archive fournie : `space_gloves.zip`. Adaptations : création du gant droit par symétrie, proportions adaptées, liaison aux os Hand/Forearm, réduction de géométrie et textures redimensionnées à 1024 pixels.


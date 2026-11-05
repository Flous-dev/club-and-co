# Club&Co — La nuit, sans la file

Prototype d'application mobile pour boîtes de nuit.

**Démo en ligne :** https://flous-dev.github.io/club-and-co/ (à ouvrir sur ton téléphone, puis « Ajouter à l'écran d'accueil » pour l'avoir comme une vraie app).

## Fonctionnalités
- **Commande au bar** depuis la piste : carte par catégorie, options (premium, glaçons), choix du bar, pourboire, paiement mobile simulé.
- **Suivi en temps réel** : reçue → en préparation → prête, code de retrait + QR, écran plein « C'est prêt ! », vibration, son et notification.
- **Demandes de sons au DJ** : recherche, message au DJ, boost payant (remboursé si refusé), votes de la salle, réponse du DJ (acceptée / refusée avec raison / jouée).
- **Espace pro (démo)** : vue barman (file de commandes) et vue DJ (accepter / refuser / jouer) pour voir les deux côtés.
- **Billet** : liaison du billet Shotgun / guest list, pass sortie-retour.
- **Vestiaire** : paiement 3 €/article dans l'app, numéro + initiales (+ description) donnés au comptoir et notés sur l'étiquette — récupérable même téléphone éteint. Vue vestiaire staff avec recherche.
- **Angles morts** : fiche de secours (téléphone éteint / batterie faible), annulation remboursée, signalement de problème, rappel de commande non récupérée, pause des commandes en cas de rush, mode hors connexion, mode ID pour le DJ, filtre des messages, vérification 18+.
- **Ma soirée** : budget de soirée, rappel d'hydratation (eau offerte), offrir un verre à un ami, fidélité.
- **Sécurité** : VTC, partage de trajet, alerte discrète au staff, appel 112.

## Technique
HTML/CSS/JS sans dépendance ni build. Les données restent dans le navigateur (`localStorage`) ; le bar et le DJ sont simulés.
Pour lancer en local : `python3 -m http.server` dans ce dossier.

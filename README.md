# Club&Co — La nuit, sans la file

Prototype d'application mobile pour boîtes de nuit.

**Démo en ligne :** https://flous-dev.github.io/club-and-co/ (à ouvrir sur ton téléphone, puis « Ajouter à l'écran d'accueil » pour l'avoir comme une vraie app).

## Parcours
1. **Compte** : prénom, e-mail, vérification 18+.
2. **Accueil hors club** : scanner le QR à l'entrée du club, ou lier son billet Shotgun. Tant que ce n'est pas fait, bar, sons, vestiaire et commandes restent verrouillés. Accès aussi à « Mes sorties » et « Mon compte » (infos, moyens de paiement).
   - **Mes billets** : lier Shotgun importe tous les billets (plusieurs soirées, plusieurs places). Un billet ne débloque l'app que le jour J. Les places en trop s'envoient à un ami par lien (`#billet=…`) ; il l'ajoute dans sa propre app, et on peut le reprendre tant qu'il n'est pas entré.
3. **Dans le club** : onglets Club · Bar · Sons · Commandes · Soirée.
   - Bar : commande, paiement, suivi en temps réel, écran « C'est prêt ! ».
   - Sons : proposer un son, voir et liker les demandes des autres.
   - Commandes : en cours + historique de la soirée.
   - Soirée : billet / pass sortie-retour, vestiaire (numéro + initiales), budget, sécurité, « Terminer ma soirée » (rangée dans Mes sorties).
4. **Espace pro** (lien discret « Je suis un club ») : identifiant + code.
   Démo : `bar@nebula`, `dj@nebula`, `vestiaire@nebula` — code `2580`.

## Technique
HTML/CSS/JS sans dépendance ni build. Les données restent dans le navigateur (`localStorage`) ; le bar et le DJ sont simulés.
Pour lancer en local : `python3 -m http.server` dans ce dossier.

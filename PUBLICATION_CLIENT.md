# 📝 Guide de Publication NextLead n8n - Pour le Client

## Résumé Exécutif

Pour rendre le node NextLead disponible publiquement dans n8n, il faut :

1. Créer un compte npm (5 minutes)
2. Publier le package (2 minutes)
3. Attendre la validation n8n (2-4 semaines)

---

## Actions à Effectuer

### 1️⃣ Créer un compte npm (une seule fois)

**Qui** : La personne responsable chez NextLead/CREACH
**Durée** : 5 minutes
**Coût** : Gratuit

1. Aller sur https://www.npmjs.com/signup
2. Créer un compte avec :
   - Username : `nextlead` ou `creach-agency`
   - Email : email professionnel
   - Password : sécurisé
3. Confirmer l'email reçu

### 2️⃣ Publier le package

**Qui** : Développeur avec accès au code
**Durée** : 10 minutes
**Prérequis** : Compte npm créé

Dans le terminal, depuis le dossier du projet :

```bash
# Se connecter à npm (première fois seulement)
npm login
# Entrer username, password, email

# Publier le package
npm publish --access public
```

✅ **Résultat** : Le package est immédiatement disponible sur https://www.npmjs.com/package/n8n-nodes-nextlead

### 3️⃣ Informer n8n (optionnel mais recommandé)

**Qui** : Responsable du projet
**Durée** : 5 minutes

Créer une issue sur GitHub :

- URL : https://github.com/n8n-io/n8n/issues/new
- Titre : "Community Node: NextLead CRM"
- Message : "Nous avons publié un nouveau node pour NextLead CRM : https://www.npmjs.com/package/n8n-nodes-nextlead"

### 4️⃣ Attendre la validation

**Durée** : 2-4 semaines

- n8n va automatiquement détecter le nouveau package
- Ils vont tester la sécurité et la qualité
- Si approuvé : badge "Verified" ✅

---

## Statuts du Node

### 🟡 Phase 1 : Non vérifié (Immédiat après publication)

- ✅ Disponible sur npm
- ✅ Installable manuellement
- ❌ Pas visible dans l'interface n8n
- ❌ Pas disponible sur n8n Cloud

**Qui peut l'utiliser** : Les utilisateurs avancés qui savent installer des nodes manuellement

### 🟢 Phase 2 : Vérifié (2-4 semaines)

- ✅ Badge "Verified"
- ✅ Visible dans l'interface n8n
- ✅ Installation en 1 clic
- ✅ Disponible sur n8n Cloud

**Qui peut l'utiliser** : Tous les utilisateurs n8n

---

## Maintenance Future

### Publier une mise à jour

```bash
# Changement de version (dans package.json)
npm version patch  # Pour un bug fix (0.1.0 → 0.1.1)
npm version minor  # Pour une nouvelle fonction (0.1.0 → 0.2.0)

# Publier
npm publish
```

### Support

- Répondre aux issues sur GitHub
- Corriger les bugs signalés
- Maintenir la compatibilité avec les nouvelles versions n8n

---

## Questions Fréquentes

**Q : C'est gratuit ?**
R : Oui, la publication sur npm est gratuite.

**Q : Combien de temps avant que les utilisateurs puissent l'utiliser ?**
R : Immédiatement après publication sur npm (installation manuelle). Pour l'installation facile, 2-4 semaines.

**Q : Faut-il payer n8n ?**
R : Non, c'est gratuit pour publier un node communautaire.

**Q : Qui gère les mises à jour ?**
R : Vous gardez le contrôle total. Vous publiez les mises à jour quand vous voulez.

**Q : Et si n8n refuse le node ?**
R : Ils donneront les raisons. Après correction, vous pouvez resoumettre.

---

## Contact

Pour toute question sur le processus :

- Forum n8n : https://community.n8n.io/
- Email n8n : hello@n8n.io

---

_Document préparé le 31/01/2025_

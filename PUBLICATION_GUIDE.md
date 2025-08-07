# Guide de Publication du Node NextLead pour n8n

## 📋 Vue d'ensemble du processus

La publication d'un node n8n communautaire se fait en plusieurs étapes :
1. Préparation du package
2. Publication sur npm
3. Soumission à n8n pour vérification
4. Attente de la validation
5. Disponibilité publique

## 🚀 Étape 1 : Préparation du Package

### Vérifications préalables

**Structure du projet**
- ✅ Le nom du package commence par `n8n-nodes-` (notre cas : `n8n-nodes-nextlead`)
- ✅ Le fichier `package.json` contient la configuration n8n
- ✅ Les credentials sont définies dans `/credentials/`
- ✅ Les nodes sont dans `/nodes/`
- ✅ Le README est clair et complet

**Tests locaux**
```bash
# Builder le projet
pnpm run build

# Linter pour vérifier le code
pnpm run lint

# Tester localement dans n8n
npm link
# Puis dans le dossier n8n : npm link n8n-nodes-nextlead
```

### Configuration du package.json

Vérifier que ces éléments sont présents :
```json
{
  "name": "n8n-nodes-nextlead",
  "version": "0.1.0",
  "description": "n8n community node for NextLead CRM integration",
  "keywords": [
    "n8n-community-node-package",  // OBLIGATOIRE
    "n8n",
    "nextlead",
    "crm"
  ],
  "license": "MIT",  // Recommandé pour la vérification
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/NextLeadApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/NextLead/NextLead.node.js",
      "dist/nodes/NextLead/NextLeadTrigger.node.js"
    ]
  }
}
```

## 🏢 Étape 2 : Création du Compte npm (pour l'entreprise)

### Création du compte entreprise

1. **Aller sur npmjs.com**
   - Cliquer sur "Sign Up"
   - Choisir un nom d'utilisateur (ex: `creach-agency` ou `nextlead`)
   - Confirmer l'email

2. **Configurer le compte localement**
   ```bash
   # Se connecter à npm
   npm login
   # Entrer username, password, email
   # Un code OTP sera envoyé par email
   ```

3. **Option : Organisation npm (payant)**
   - Pour publier sous `@nextlead/n8n-nodes-nextlead`
   - Permet la gestion d'équipe
   - 7$/mois par utilisateur

## 📦 Étape 3 : Publication sur npm

### Commandes de publication

```bash
# S'assurer d'être dans le bon dossier
cd /Users/bozzettomirko/code/nextlead-n8n

# Nettoyer et reconstruire
pnpm run build

# Vérifier ce qui sera publié
npm pack --dry-run

# Première publication
npm publish --access public

# Pour les mises à jour futures
npm version patch  # ou minor/major
npm publish
```

### Après la publication

Le package sera disponible sur :
- https://www.npmjs.com/package/n8n-nodes-nextlead
- Installation possible via : `npm install n8n-nodes-nextlead`

## 🔍 Étape 4 : Soumission pour Vérification n8n

### Processus de vérification

**Critères de vérification n8n :**
- ✅ Sécurité du code
- ✅ Qualité du code
- ✅ Documentation complète
- ✅ Licence MIT (recommandé)
- ✅ Pas de dépendances externes dangereuses

### Comment soumettre

1. **Automatique**
   - Une fois publié sur npm avec le bon naming et keywords
   - n8n détecte automatiquement les nouveaux nodes

2. **Manuel (recommandé)**
   - Ouvrir une issue sur : https://github.com/n8n-io/n8n
   - Titre : "Community Node Submission: NextLead"
   - Contenu :
   ```markdown
   ## Node Information
   - Package name: n8n-nodes-nextlead
   - npm URL: https://www.npmjs.com/package/n8n-nodes-nextlead
   - GitHub: https://github.com/CREACH-Agency/nextlead-n8n
   - Description: NextLead CRM integration for n8n
   
   ## Features
   - Manage contacts, sales, actions, structures
   - Polling triggers for events
   - Full CRUD operations
   
   ## Testing
   - Tested locally with n8n version X.X.X
   - All operations verified
   ```

3. **Forum communautaire**
   - Poster sur : https://community.n8n.io/
   - Catégorie : "Show and Tell"
   - Présenter le node et demander des retours

## ⏱️ Étape 5 : Délais et Validation

### Timeline estimée

- **Publication npm** : Immédiat
- **Détection par n8n** : 1-7 jours
- **Review initial** : 1-2 semaines
- **Vérification complète** : 2-4 semaines
- **Badge "Verified"** : 1-2 mois

### Statuts possibles

1. **Non vérifié** (initial)
   - Disponible via npm
   - Installation manuelle uniquement
   - Pas visible dans l'interface n8n

2. **En review**
   - L'équipe n8n examine le code
   - Tests de sécurité

3. **Vérifié** ✅
   - Badge shield dans l'interface
   - Disponible dans n8n Cloud
   - Installation directe depuis l'interface

4. **Rejeté** ❌
   - Problèmes de sécurité ou qualité
   - Possibilité de resoumettre après corrections

## 📊 Étape 6 : Maintenance et Mises à jour

### Versioning

```bash
# Bug fixes
npm version patch  # 0.1.0 → 0.1.1

# Nouvelles fonctionnalités
npm version minor  # 0.1.0 → 0.2.0

# Breaking changes
npm version major  # 0.1.0 → 1.0.0

# Publier la mise à jour
npm publish
```

### Support communautaire

- Répondre aux issues GitHub
- Maintenir la documentation à jour
- Corriger les bugs signalés
- Ajouter des fonctionnalités demandées

## ✅ Checklist finale avant publication

- [ ] Code testé localement
- [ ] Documentation README complète
- [ ] Licence MIT dans package.json
- [ ] Keywords incluent `n8n-community-node-package`
- [ ] Nom commence par `n8n-nodes-`
- [ ] Build sans erreurs
- [ ] Credentials fonctionnelles
- [ ] Tous les nodes testés
- [ ] Version initiale 0.1.0

## 📞 Contacts et Ressources

- **Documentation n8n** : https://docs.n8n.io/integrations/community-nodes/
- **Forum** : https://community.n8n.io/
- **GitHub n8n** : https://github.com/n8n-io/n8n
- **Support** : hello@n8n.io

## Notes importantes

1. **Pas de dépendances lourdes** : n8n préfère les nodes sans dépendances externes complexes
2. **Sécurité d'abord** : Ne jamais exposer d'API keys ou secrets dans le code
3. **Compatibilité** : Tester avec plusieurs versions de n8n
4. **Performance** : Éviter les opérations bloquantes ou lentes

---

*Ce guide sera mis à jour selon les retours de l'équipe n8n lors du processus de soumission.*
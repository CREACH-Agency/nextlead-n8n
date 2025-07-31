# 📋 Checklist de Publication NextLead n8n Node

## Avant de publier sur npm

- [ ] **Version** : Vérifier le numéro de version dans package.json
- [ ] **Build** : `pnpm run build` fonctionne sans erreurs
- [ ] **Lint** : `pnpm run lint` passe sans erreurs
- [ ] **Test local** : Le node fonctionne dans n8n local
- [ ] **README** : Documentation à jour
- [ ] **License** : Fichier LICENSE.md présent (MIT)

## Publication npm

1. [ ] Créer compte npm : https://www.npmjs.com/signup
2. [ ] Login npm : `npm login`
3. [ ] Dry run : `npm publish --dry-run`
4. [ ] Publier : `npm publish`
5. [ ] Vérifier sur npm : https://www.npmjs.com/package/n8n-nodes-nextlead

## Après publication

- [ ] Tester l'installation : Dans un n8n, installer depuis Community Nodes
- [ ] Créer une release GitHub avec tag de version
- [ ] Annoncer sur le forum n8n : https://community.n8n.io/

## Pour la vérification n8n (optionnel)

1. [ ] Vérifier avec : `npx @n8n/scan-community-package n8n-nodes-nextlead`
2. [ ] Soumettre ici : https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/
3. [ ] Attendre la review de n8n

## Commandes utiles

```bash
# Build et test
pnpm run build
pnpm run lint

# Publication
npm login
npm publish --dry-run
npm publish

# Vérification
npx @n8n/scan-community-package n8n-nodes-nextlead

# Mise à jour de version
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0
```

## Notes

- Une fois publié avec un numéro de version, impossible de republier le même numéro
- Les nodes apparaissent automatiquement dans n8n après publication sur npm
- La vérification n8n est optionnelle mais recommandée pour n8n Cloud
# Guide de release — n8n-nodes-nextlead

Procédure complète pour publier une nouvelle version du node sur npm.

La publication se fait **exclusivement via GitHub Actions**. Depuis le 1er mai 2026, n8n
exige que les community nodes vérifiés soient publiés avec une *provenance statement* npm,
qui prouve cryptographiquement que le package a été construit depuis ce dépôt, à ce commit.
Un `npm publish` depuis ta machine ne produit pas cette preuve et disqualifie le node.

**Le principe :** tu ne publies jamais à la main. Tu pousses un tag de version, et le
workflow [`.github/workflows/publish.yml`](.github/workflows/publish.yml) publie pour toi.

---

## ⚠️ Étape 0 — Vérifier le token npm (à faire AVANT chaque release)

**C'est la panne la plus fréquente.** npm plafonne les tokens en écriture à **90 jours
maximum**, et 7 jours par défaut. Un token expiré ne produit pas un message d'erreur clair :
la publication échoue avec un `E404` trompeur.

```
npm error code E404
npm error 404 Not Found - PUT https://registry.npmjs.org/n8n-nodes-nextlead
npm error 404 The requested resource 'n8n-nodes-nextlead@X.Y.Z' could not be found
       or you do not have permission to access it.
```

Le registre renvoie `404` au lieu de `403` pour ne pas révéler l'existence des packages aux
non-autorisés. **Un `E404` sur un `PUT` d'un package qui existe = problème d'authentification,
jamais un package introuvable.**

### Vérifier

1. npmjs.com → avatar → **Access Tokens**
2. Repérer le token `nextlead-n8n-publish` et sa date d'expiration.
3. S'il est expiré ou absent → le régénérer (ci-dessous).

### Régénérer le token

npmjs.com → **Access Tokens** → *Generate New Token* → **Granular Access Token**

| Champ | Valeur |
|---|---|
| Token name | `nextlead-n8n-publish` |
| **Bypass two-factor authentication (2FA)** | ✅ **coché** — sinon `npm publish` échoue avec `EOTP` en CI, personne ne peut saisir un code sur un runner |
| Allowed IP ranges | **vide** — les runners GitHub ont des IP dynamiques |
| Packages and scopes | *Only select packages and scopes* → **`n8n-nodes-nextlead`** |
| Permissions (packages) | **Read and write** |
| Organizations | **No access** — le package appartient à des comptes utilisateurs, pas à une org |
| Expiration | **90 days** (le maximum) |

Avant de valider, le résumé doit afficher **« read and write access to 1 package »**.
S'il affiche `0 packages`, le package n'a pas été sélectionné et le token sera inutile.

Puis : GitHub → repo → **Settings → Secrets and variables → Actions** → `NPM_TOKEN` →
**Update secret**.

> **Note d'échéance :** npm restreint les tokens qui contournent la 2FA pour la publication
> directe à partir de **janvier 2027**. Il faudra basculer sur le *Trusted Publishing* OIDC
> d'ici là (voir « Évolutions à prévoir » en bas).

---

## Étape 1 — Développer et tester

```bash
pnpm dev
```

Lance une instance n8n sur http://localhost:5678 avec le node lié et rechargé à chaud.
Teste réellement les opérations modifiées dans l'éditeur : ni le linter ni le compilateur ne
valident le comportement runtime (appels API, formats de dates, chargement des dropdowns).

## Étape 2 — Contrôles avant release

```bash
pnpm lint     # règles de vérification n8n (mode strict)
pnpm build    # compilation TypeScript + copie des assets
```

Les deux doivent sortir en code 0. Le linter applique les règles `eslint-plugin-n8n-nodes-base`
exigées pour la vérification n8n : nommage des paramètres, `default` obligatoire, suffixe
« Name or ID » sur les champs à `loadOptionsMethod`, descriptions, etc.

Optionnel, pour inspecter le contenu exact du tarball publié :

```bash
npm pack --dry-run
```

Seul le dossier `dist/` est publié (champ `files` de `package.json`).

## Étape 3 — Fusionner dans `main`

Le tag de release doit pointer sur `main`. `n8n-node release` refuse de tourner ailleurs
(`--git.requireBranch main`).

```bash
git push -u origin ma-branche
# ouvrir la PR, la faire relire, merger

git checkout main
git pull
git status        # doit être vide : --git.requireCleanWorkingDir
```

## Étape 4 — Lancer la release

```bash
pnpm run release
```

Ce que la commande enchaîne :

1. `pnpm lint` puis `pnpm build`
2. génération du changelog (`auto-changelog`)
3. **prompt du numéro de version** :
   ```
   ? Select increment (next version):
   ❯ patch (0.1.8)     ← corrections de bugs
     minor (0.2.0)     ← nouvelles fonctionnalités rétrocompatibles
     major (1.0.0)     ← breaking changes
   ```
4. écriture de la version dans `package.json`, commit `Release X.Y.Z`
5. tag `vX.Y.Z`, push du commit et du tag
6. création de la GitHub Release

**Elle ne publie pas sur npm** — c'est volontaire, une publication locale n'aurait pas de
provenance. C'est le push du tag qui déclenche le workflow.

Pense à committer le `CHANGELOG.md` généré s'il apparaît en non suivi.

## Étape 5 — Surveiller le workflow

GitHub → onglet **Actions** → le run porte le nom du commit de release.

Le workflow (déclenché par les tags `*.*.*`) : checkout → pnpm → Node LTS →
`pnpm install --frozen-lockfile` → `pnpm run build` → `npm publish --provenance`.

## Étape 6 — Vérifier la publication

```bash
npm view n8n-nodes-nextlead version     # doit afficher la nouvelle version
```

Sur https://www.npmjs.com/package/n8n-nodes-nextlead, la mention
**« Built and signed on GitHub Actions »** doit apparaître : c'est la provenance exigée par n8n.

---

## Résolution des pannes

### `ERR_PNPM_IGNORED_BUILDS` à l'étape *Install dependencies*

```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: <package>@x.y.z
```

Depuis pnpm 11, un build script non approuvé est une **erreur fatale** (c'était un simple
warning en pnpm 10). Le workflow utilise `version: latest` pour pnpm, il peut donc tourner sur
une version plus récente que la tienne en local — l'erreur est alors invisible côté développeur.

Correctif : ajouter la dépendance dans [`pnpm-workspace.yaml`](pnpm-workspace.yaml), qui déclare
les deux clés (`allowBuilds` pour pnpm 11, `onlyBuiltDependencies` pour pnpm 10). Le champ `pnpm`
de `package.json` n'est **plus lu** par pnpm 11.

Reproduire l'environnement CI en local :

```bash
CI=true npx pnpm@latest install --frozen-lockfile
```

### `E404` sur `PUT` à l'étape *Publish to npm*

Token npm expiré, révoqué, ou sans droit d'écriture sur le package → voir l'**Étape 0**.

### `ERR_PNPM_OUTDATED_LOCKFILE`

`pnpm-lock.yaml` n'est pas synchro avec `package.json`. Lance `pnpm install` et committe le
lockfile.

### `ERROR Unknown option '-n'` au lancement de `pnpm run release`

`release-it` v21 a supprimé le flag `-n` que `@n8n/node-cli` passe encore. Le paquet est
épinglé en `^20.2.0` dans les devDependencies — ne pas le monter en v21.

### `spawn ENAMETOOLONG` en fin de release (Windows)

Sans variable d'environnement `GITHUB_TOKEN`, release-it bascule sur la création de Release
« web » et tente d'ouvrir une URL contenant tout le changelog — trop longue pour Windows.

Le commit, le tag et le push sont déjà passés à ce stade : **la release n'est pas perdue**,
seule la GitHub Release n'est pas créée. Corriger avec `setx GH_TOKEN <token>`, ou créer la
Release à la main.

### Le run a échoué, je veux le relancer

**Un « Re-run jobs » ne reprend pas le dernier état de `main`.** Il rejoue exactement le commit
qui avait déclenché le run. Si le correctif est dans un commit postérieur, il faut déplacer le
tag :

```bash
git tag -f vX.Y.Z
git push origin :refs/tags/vX.Y.Z    # supprimer le tag distant
git push origin vX.Y.Z               # le repousser → nouveau run
```

Ne supprime pas un run que tu comptes relancer : un run supprimé n'est plus rejouable.

### La version a été taguée mais jamais publiée

Tant que la version n'existe pas sur npm, le numéro reste réutilisable : corrige, puis déplace
le tag comme ci-dessus. Si la version **a** été publiée, elle est définitive — npm interdit de
republier un même numéro, il faut repartir sur un `patch`.

---

## Règles de versioning

Le node suit le semver. `n8n-nodes-nextlead` étant en `0.x`, les breaking changes restent
tolérés sur un `minor`, mais autant rester rigoureux :

| Incrément | Quand |
|---|---|
| `patch` | correction de bug, ajustement de description, correctif CI |
| `minor` | nouvelle ressource, nouvelle opération, nouveau champ |
| `major` | suppression ou renommage d'un champ/opération, changement de format de sortie — casse les workflows existants des utilisateurs |

Attention particulière au `major` : renommer le `name` d'un paramètre casse silencieusement les
workflows déjà construits par les utilisateurs.

---

## Contraintes à respecter (vérification n8n)

Elles sont validées automatiquement par `pnpm lint`, mais restent utiles à connaître :

- nom du package préfixé `n8n-nodes-`
- keyword `n8n-community-node-package` présent
- **zéro dépendance runtime** — seul `n8n-workflow` en peerDependency ; tout ce qui est ajouté
  doit l'être en `devDependencies`
- licence MIT
- nodes et credentials déclarés dans l'attribut `n8n` de `package.json`
- publication via GitHub Actions avec provenance

---

## Évolutions à prévoir

**Trusted Publishing (OIDC)** — supprime totalement le token npm et donc les expirations à
répétition. C'est la méthode recommandée par n8n. Nécessite : déclarer le publisher sur
npmjs.com (package settings → Trusted Publishers → repo `CREACH-Agency/nextlead-n8n`, workflow
`publish.yml`), ajouter `registry-url` à `setup-node`, et supprimer la ligne
`[ -n "$NPM_TOKEN" ] && ...` du workflow — sous `bash -e`, elle fait échouer l'étape quand le
secret est vide, ce qui est précisément le cas en mode OIDC.

**Actions Node 20 dépréciées** — passer `actions/checkout` et `actions/setup-node` en `@v5`
pour éteindre le warning.

---

## Références

- [Community nodes — n8n docs](https://docs.n8n.io/integrations/community-nodes/)
- [@n8n/node-cli](https://www.npmjs.com/package/@n8n/node-cli)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements)
- [Package sur npm](https://www.npmjs.com/package/n8n-nodes-nextlead)

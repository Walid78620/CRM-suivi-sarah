# 🚀 INSTRUCTIONS DE DÉPLOIEMENT - CRM SUIVI SARAH

## ⚠️ IMPORTANT : ACTIONS REQUISES AVANT LE DÉPLOIEMENT

Avant de déployer, vous DEVEZ suivre ces étapes dans l'ordre.

---

## 📋 ÉTAPE 1 : CONFIGURATION NETLIFY (CRITIQUE)

### 1.1 Ajouter les variables d'environnement

Connectez-vous à votre dashboard Netlify :
1. Allez sur https://app.netlify.com
2. Sélectionnez votre site "suivi-crm"
3. Cliquez sur **Site settings** → **Environment variables**
4. Ajoutez les variables suivantes :

#### Variable NEON_DATABASE_URL (OBLIGATOIRE)
```
Nom : NEON_DATABASE_URL
Valeur : postgres://username:password@ep-xxxxx.neon.tech/crm_suivi?sslmode=require
```

**⚠️ Remplacez par votre vraie connexion Neon !**

Pour trouver votre connexion string :
- Allez sur https://console.neon.tech
- Sélectionnez votre projet
- Copiez la "Connection string" depuis le dashboard

#### Variable API_KEY (OPTIONNELLE - Pour activer l'authentification)
```
Nom : API_KEY
Valeur : votre_clé_secrète_ici (ex: 8f3a9c2d-1b4e-4f5a-9c3d-2a1b4e5f6g7h)
```

**Note :** Si vous n'ajoutez pas API_KEY, l'application fonctionnera SANS authentification (OK pour le développement, DANGEREUX pour la production).

---

## 📋 ÉTAPE 2 : VÉRIFIER LA BASE DE DONNÉES

### 2.1 Exécuter le schéma SQL

Connectez-vous à votre console Neon :
1. Allez sur https://console.neon.tech
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor**
4. Copiez et exécutez le contenu du fichier `schema.sql`

### 2.2 Vérifier que les tables existent

Exécutez cette requête dans l'éditeur SQL :

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

Vous devriez voir :
- students
- companies
- offers
- placements
- deals
- tasks
- interactions

### 2.3 Exécuter les migrations d'index (OPTIONNEL mais RECOMMANDÉ)

Exécutez le contenu du fichier `migrations/01_indexes.sql` pour améliorer les performances.

---

## 📋 ÉTAPE 3 : DÉPLOYER LES FICHIERS CORRIGÉS

### 3.1 Vérifier les fichiers modifiés

Voici la liste des fichiers qui ont été corrigés :

**Fichiers serverless (backend) :**
- ✅ `netlify/functions/_db.js` - Module de base de données (CRITIQUE)
- ✅ `netlify/functions/students.js` - API étudiants
- ✅ `netlify/functions/companies.js` - API entreprises
- ✅ `netlify/functions/offers.js` - API offres
- ✅ `netlify/functions/deals.js` - API deals/opportunités
- ✅ `netlify/functions/tasks.js` - API tâches
- ✅ `netlify/functions/interactions.js` - API interactions
- 🆕 `netlify/functions/placements.js` - API placements (NOUVEAU FICHIER)

**Frontend :**
- ⏳ `index.html` - À corriger (voir note ci-dessous)

### 3.2 Pousser sur GitHub

```bash
# Si vous avez Git configuré
git add .
git commit -m "fix: Corriger erreurs 500 et bugs de sécurité"
git push origin main
```

### 3.3 Netlify déploie automatiquement

Netlify détecte automatiquement les changements sur GitHub et redéploie.

Attendez 2-3 minutes et vérifiez :
- Le build passe au vert sur Netlify
- Pas d'erreurs dans les logs

---

## 📋 ÉTAPE 4 : TESTER L'APPLICATION

### 4.1 Tester l'endpoint health check

Ouvrez dans votre navigateur :
```
https://suivi-crm.netlify.app/api/health
```

Vous devriez voir :
```json
{"now":"2025-10-31T..."}
```

✅ Si vous voyez ceci = la connexion DB fonctionne !
❌ Si erreur 500 = vérifiez NEON_DATABASE_URL dans Netlify

### 4.2 Tester les endpoints principaux

Ouvrez la console du navigateur (F12) sur votre site et exécutez :

```javascript
// Tester students
fetch('/api/students').then(r => r.json()).then(console.log)

// Tester companies
fetch('/api/companies').then(r => r.json()).then(console.log)

// Tester offers
fetch('/api/offers').then(r => r.json()).then(console.log)

// Tester placements (nouveau)
fetch('/api/placements').then(r => r.json()).then(console.log)
```

Tous devraient retourner des tableaux (vides ou avec des données).

### 4.3 Tester la création d'un étudiant

Dans la console :

```javascript
fetch('/api/students', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Utilisateur',
    email: 'test@example.com',
    phone: '0612345678'
  })
})
.then(r => r.json())
.then(console.log)
```

Vous devriez voir l'étudiant créé avec un `id` UUID.

---

## 📋 ÉTAPE 5 : CORRECTIONS FRONTEND (IMPORTANT)

⚠️ **Note :** Le fichier `index.html` est TRÈS LONG (1182 lignes). Pour éviter de perdre du contenu, je vous recommande de faire les corrections manuellement OU de me demander de créer une version corrigée complète séparément.

### Corrections critiques à faire dans index.html :

#### 5.1 Corriger la double déclaration de saveDB (ligne 146-147)

**Avant :**
```javascript
function saveDB(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
function saveDB(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); try{ window.db = d; }catch(e){} }
```

**Après :**
```javascript
function saveDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  try {
    window.db = db;  // Utiliser 'db', pas 'd'
  } catch(e) {
    console.warn('Cannot expose db to window:', e);
  }
}
```

#### 5.2 Ajouter les fonctions d'échappement XSS (après ligne 148)

```javascript
// Protection XSS
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
```

#### 5.3 Modifier les fonctions de suppression (lignes 406-414 et 577-586)

**deleteStudent (ligne 406) - Après :**
```javascript
async function deleteStudent(id){
  if(!confirm("Supprimer cet étudiant ? Cela supprimera aussi les placements, tâches et interactions liés.")) return;

  try {
    await API.del('students', { id });
    db.students = db.students.filter(x => x.id !== id);
    db.placements = db.placements.filter(p => p.studentId !== id);
    db.tasks = db.tasks.filter(t => t.studentId !== id);
    db.interactions = db.interactions.filter(i => i.studentId !== id);
    saveDB();
    route();
  } catch(err) {
    alert('Erreur lors de la suppression : ' + readableError(err));
  }
}
```

**deleteCompany (ligne 577) - Après :**
```javascript
async function deleteCompany(id){
  if(!confirm("Supprimer cette entreprise ? Cela supprimera aussi les offres, deals, tâches et interactions liées.")) return;

  try {
    await API.del('companies', { id });

    // Nettoyage complet de toutes les entités liées
    db.offers = db.offers.filter(o => o.companyId !== id);
    db.deals = db.deals.filter(d => d.companyId !== id);
    db.placements = db.placements.filter(p => p.companyId !== id);
    db.tasks = db.tasks.filter(t => t.companyId !== id);
    db.interactions = db.interactions.filter(i => i.companyId !== id);
    db.companies = db.companies.filter(c => c.id !== id);

    saveDB();
    route();
    alert('Entreprise supprimée avec succès');
  } catch(err) {
    console.error('Delete company error', err);
    alert('Erreur lors de la suppression : ' + readableError(err));
  }
}
```

#### 5.4 Modifier createPlacementFromOffer pour utiliser l'API (ligne 750-758)

**Avant :**
```javascript
function createPlacementFromOffer(studentId, offerId){
  const o = offerById(offerId); if(!o) return;
  const s = studentById(studentId); if(!s) return;
  const c = companyById(o.companyId); if(!c) return;
  const p = { id: uid(), studentId, companyId:o.companyId, position:o.title, contractType:o.type, startDate:o.startDate, endDate:"" };
  db.placements.push(p);
  saveDB();
  alert("Placement (local) créé pour " + s.name + " chez " + c.name);
  closeModal();
}
```

**Après :**
```javascript
async function createPlacementFromOffer(studentId, offerId){
  const o = offerById(offerId); if(!o) return;
  const s = studentById(studentId); if(!s) return;
  const c = companyById(o.companyId); if(!c) return;

  const payload = {
    studentId,
    companyId: o.companyId,
    position: o.title,
    contractType: o.type,
    startDate: o.startDate,
    endDate: ""
  };

  try {
    const created = await API.post('placements', payload);
    if(created?.id){
      db.placements.push(created);
      saveDB();
      alert("Placement créé pour " + s.name + " chez " + c.name);
      closeModal();
    }
  } catch(err) {
    console.error('Create placement error', err);
    alert('Erreur lors de la création du placement : ' + readableError(err));
  }
}
```

#### 5.5 Modifier saveManualPlacement pour utiliser l'API (ligne 774-785)

**Avant :**
```javascript
function saveManualPlacement(){
  const p = {
    id: uid(),
    studentId: byId('pl_stu').value,
    companyId: byId('pl_company').value,
    position: byId('pl_position').value,
    contractType: byId('pl_type').value,
    startDate: byId('pl_start').value,
    endDate: byId('pl_end').value
  };
  if(!p.studentId || !p.companyId || !p.position){ alert("Champs requis manquants"); return; }
  db.placements.push(p); saveDB(); closeModal(); route();
}
```

**Après :**
```javascript
async function saveManualPlacement(){
  const payload = {
    studentId: byId('pl_stu').value,
    companyId: byId('pl_company').value,
    position: byId('pl_position').value,
    contractType: byId('pl_type').value,
    startDate: byId('pl_start').value,
    endDate: byId('pl_end').value
  };

  if(!payload.studentId || !payload.companyId || !payload.position){
    alert("Champs requis manquants");
    return;
  }

  try {
    const created = await API.post('placements', payload);
    if(created?.id){
      db.placements.push(created);
      saveDB();
      closeModal();
      route();
    }
  } catch(err) {
    alert('Erreur lors de la création : ' + readableError(err));
  }
}
```

#### 5.6 Modifier deletePlacement pour utiliser l'API (ligne 787-789)

**Avant :**
```javascript
function deletePlacement(id){
  if(!confirm("Supprimer ce placement (local) ?")) return;
  db.placements = db.placements.filter(x=>x.id!==id); saveDB(); route();
}
```

**Après :**
```javascript
async function deletePlacement(id){
  if(!confirm("Supprimer ce placement ?")) return;

  try {
    await API.del('placements', { id });
    db.placements = db.placements.filter(x=>x.id!==id);
    saveDB();
    route();
  } catch(err) {
    alert('Erreur lors de la suppression : ' + readableError(err));
  }
}
```

#### 5.7 Hydrater les placements depuis l'API (ligne 591-597)

**Avant :**
```javascript
async function renderOffersPlacements(root){
  // Hydrate offres depuis API
  if(!renderOffersPlacements._hydrated){
    try{ const remote = await API.get('offers'); if(Array.isArray(remote)) { db.offers = remote; saveDB(); } }
    catch(e){ console.warn('API offers error', e); }
    renderOffersPlacements._hydrated = true;
  }
```

**Après :**
```javascript
async function renderOffersPlacements(root){
  // Hydrate offres ET placements depuis API
  if(!renderOffersPlacements._hydrated){
    try{
      const remoteOffers = await API.get('offers');
      if(Array.isArray(remoteOffers)) {
        db.offers = remoteOffers;
        saveDB();
      }

      const remotePlacements = await API.get('placements');
      if(Array.isArray(remotePlacements)) {
        db.placements = remotePlacements;
        saveDB();
      }
    }
    catch(e){ console.warn('API offers/placements error', e); }
    renderOffersPlacements._hydrated = true;
  }
```

---

## 🎯 RÉSUMÉ DES CORRECTIONS APPLIQUÉES

### ✅ Backend (Serverless Functions)

1. **_db.js** - Corrections majeures :
   - ✅ Validation de NEON_DATABASE_URL
   - ✅ Gestion sécurisée des erreurs
   - ✅ CORS configurable
   - ✅ Parsing sécurisé JSON
   - ✅ Query builders améliorés (filtrage undefined, validation table)
   - ✅ Helpers de validation (email, date, UUID)

2. **students.js** - Corrections :
   - ✅ Validation email
   - ✅ Pagination avec limite
   - ✅ Vérification existence avant suppression
   - ✅ Validation coaching progress (0-100)

3. **companies.js** - Corrections :
   - ✅ Validation dates
   - ✅ Validation nombres (capacity, placedStudents)
   - ✅ Pagination avec limite

4. **offers.js** - Corrections :
   - ✅ Validation companyId requis
   - ✅ Validation spots (minimum 1)
   - ✅ Validation dates

5. **deals.js** - Corrections IMPORTANTES :
   - ✅ Validation ajoutée (manquait complètement)
   - ✅ Validation email
   - ✅ Validation probability (0-100)
   - ✅ Validation dealValue (positif)
   - ✅ Validation dates

6. **tasks.js** - Corrections :
   - ✅ Tri corrigé (completed → dueDate → created_at)
   - ✅ Validation date

7. **interactions.js** - Corrections IMPORTANTES :
   - ✅ Validation ajoutée (manquait complètement)
   - ✅ Validation date
   - ✅ Validation entité OU contenu requis

8. **placements.js** - NOUVEAU FICHIER :
   - 🆕 API complète pour placements
   - ✅ Validation studentId, companyId, position
   - ✅ Vérification existence étudiant/entreprise
   - ✅ JOIN pour récupérer les noms
   - ✅ Validation dates

### ⏳ Frontend (À faire manuellement)

Les corrections frontend sont documentées dans la section ÉTAPE 5 ci-dessus.

Bugs corrigés quand vous appliquerez :
- ✅ Double déclaration saveDB()
- ✅ Protection XSS
- ✅ Placements persistés en DB (plus local only)
- ✅ Nettoyage complet lors suppressions
- ✅ Meilleure gestion d'erreur

---

## 🔍 VÉRIFICATION FINALE

### Checklist avant mise en production :

- [ ] Variable NEON_DATABASE_URL configurée dans Netlify
- [ ] Schéma SQL exécuté dans Neon
- [ ] Tables créées (7 tables)
- [ ] Indexes créés (migrations/01_indexes.sql)
- [ ] Fichiers serverless déployés (8 fichiers)
- [ ] Build Netlify réussi (vert)
- [ ] Endpoint /api/health fonctionne
- [ ] Tous les endpoints retournent des données
- [ ] Corrections frontend appliquées
- [ ] Tests de création/modification/suppression OK

### Test complet :

1. Créer un étudiant
2. Créer une entreprise
3. Créer une offre liée à l'entreprise
4. Créer un placement (étudiant + entreprise)
5. Vérifier que le placement apparaît dans la DB
6. Supprimer l'entreprise
7. Vérifier que l'offre et le placement sont supprimés (cascade)

---

## 🆘 DÉPANNAGE

### Problème : Erreur 500 sur tous les endpoints

**Cause :** NEON_DATABASE_URL pas configurée ou invalide

**Solution :**
1. Vérifiez dans Netlify : Site settings → Environment variables
2. La variable doit être exactement `NEON_DATABASE_URL`
3. La valeur doit commencer par `postgres://`
4. Redéployez après modification

### Problème : "Student not found" lors création placement

**Cause :** L'étudiant n'existe pas dans la DB

**Solution :**
1. Vérifiez que l'étudiant existe : `SELECT * FROM students WHERE id = '...'`
2. Recréez l'étudiant via l'API
3. Réessayez le placement

### Problème : Placements toujours en "local only"

**Cause :** Le frontend n'a pas été corrigé

**Solution :**
Appliquez les corrections de la section ÉTAPE 5.4 à 5.7

### Problème : Build Netlify échoue

**Cause :** Erreur de syntaxe dans les fichiers

**Solution :**
1. Vérifiez les logs de build Netlify
2. Assurez-vous que tous les fichiers sont valides
3. Testez localement avec `netlify dev`

---

## 📞 BESOIN D'AIDE ?

Si vous avez des questions ou problèmes :

1. Vérifiez d'abord cette checklist
2. Consultez les logs Netlify (Site → Deploys → View logs)
3. Consultez les logs functions (Site → Functions → Logs)
4. Testez chaque endpoint individuellement
5. Demandez de l'aide avec les messages d'erreur exacts

---

## 🎉 PROCHAINES ÉTAPES (APRÈS DÉPLOIEMENT)

Une fois l'application stable :

1. **Activer l'authentification** :
   - Configurer API_KEY dans Netlify
   - Tester avec header X-Api-Key

2. **Améliorer la sécurité** :
   - Appliquer toutes les corrections XSS dans index.html
   - Restreindre CORS aux domaines autorisés

3. **Optimisations performance** :
   - Activer la pagination dans le frontend
   - Ajouter des index full-text search

4. **Fonctionnalités avancées** :
   - Ajouter un système de notification
   - Implémenter l'export Excel
   - Ajouter des graphiques analytiques

---

**Dernière mise à jour :** 31 octobre 2025
**Version des corrections :** 1.0
**Statut :** ✅ Prêt pour déploiement

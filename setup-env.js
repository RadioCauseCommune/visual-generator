/**
 * Script de setup de l'environnement
 * Crée un fichier .env à partir de .env.example
 * 
 * Usage: npm run setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envExampleContent = `# Configuration du Générateur d'Assets Cause Commune
# NE PAS COMMITTER CE FICHIER

# Token HuggingFace pour la génération d'images avec FLUX.1-schnell
# Obtenir un token: https://huggingface.co/settings/tokens
HUGGINGFACE_TOKEN=

# Environnement (development, production)
NODE_ENV=development

# Origines autorisées pour CORS (séparées par des virgules)
ALLOWED_ORIGINS=http://localhost:3000

# Port du serveur
PORT=3000

# Hôte du serveur
HOST=0.0.0.0
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('\n🔧 Configuration de Cause Commune Visual Generator\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Vérifier si .env existe déjà
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  Un fichier .env existe déjà. Écraser ? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('\n✓ Configuration annulée. Fichier .env conservé.\n');
      rl.close();
      return;
    }
  }

  // Demander le token HuggingFace
  console.log('Pour obtenir un token HuggingFace:');
  console.log('1. Allez sur https://huggingface.co/settings/tokens');
  console.log('2. Créez un nouveau token avec les permissions "read"\n');
  
  const token = await question('🤖 Token HuggingFace (hf_...): ');
  
  if (!token || !token.startsWith('hf_')) {
    console.log('\n⚠️  Attention: Le token devrait commencer par "hf_"');
    const proceed = await question('Continuer quand même ? (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('\n✗ Configuration annulée.\n');
      rl.close();
      return;
    }
  }

  // Demander l'environnement
  const env = await question('🌍 Environnement (development/production) [development]: ') || 'development';
  
  // Demander le port
  const port = await question('🔌 Port du serveur [3000]: ') || '3000';

  // Créer le fichier .env
  const envContent = `# Configuration du Générateur d'Assets Cause Commune
# NE PAS COMMITTER CE FICHIER
# Généré le ${new Date().toLocaleString('fr-FR')}

# Token HuggingFace pour la génération d'images avec FLUX.1-schnell
HUGGINGFACE_TOKEN=${token}

# Environnement
NODE_ENV=${env}

# Origines autorisées pour CORS
ALLOWED_ORIGINS=http://localhost:${port}

# Port du serveur
PORT=${port}

# Hôte du serveur
HOST=0.0.0.0
`;

  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Fichier .env créé avec succès !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Prochaines étapes:');
  console.log('  1. npm install          # Installer les dépendances');
  console.log('  2. npm run dev          # Démarrer en développement');
  console.log('  ou');
  console.log('  2. npm run build        # Build pour la production');
  console.log('  3. npm run start:prod   # Démarrer le serveur de production\n');

  rl.close();
}

setup().catch(err => {
  console.error('Erreur:', err);
  rl.close();
  process.exit(1);
});


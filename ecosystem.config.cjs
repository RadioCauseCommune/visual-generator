/**
 * Configuration PM2 pour Cause Commune Visual Generator
 * 
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 * 
 * Note: Fichier .cjs car le projet utilise "type": "module" dans package.json
 */

module.exports = {
  apps: [{
    name: 'cause-commune-generator',
    script: 'server-production.js',
    instances: 1,
    exec_mode: 'fork',
    
    // Variables d'environnement
    // Note: Les variables du fichier .env seront chargées automatiquement
    // par server-production.js via dotenv
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    
    // Fichiers de logs
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Redémarrage automatique
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Limite de mémoire (redémarre si dépassée)
    max_memory_restart: '500M',
    
    // Options de monitoring
    watch: false, // Ne pas surveiller les fichiers en production
    
    // Ignorer les fichiers à surveiller (si watch: true)
    ignore_watch: [
      'node_modules',
      'logs',
      'dist',
      '.git'
    ]
  }]
};

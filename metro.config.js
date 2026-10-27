const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Drizzle genera migrations.js que importa archivos .sql:
// Metro debe saber resolver esa extensión.
config.resolver.sourceExts.push('sql');
// expo-sqlite en web carga su motor SQLite desde un .wasm.
config.resolver.assetExts.push('wasm');

module.exports = config;

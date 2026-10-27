module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Embebe los .sql de las migraciones de Drizzle (drizzle/migrations.js).
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};

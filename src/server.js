// src/server.js
const app       = require('./app');
const { sequelize } = require('./models');
const port      = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced');
    app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
  })
  .catch(err => {
    console.error('Sync error:', err);
    process.exit(1);
  });

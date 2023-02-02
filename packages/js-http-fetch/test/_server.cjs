/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const jsonServer = require('json-server');

const server = jsonServer.create();
server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// Custom routes.
server.get('/errors/404', (req, res) => {
  res.status(404).json({ message: 'Custom 404 error message' });
});

server.use(jsonServer.router('test/db.json'));
server.listen(3000, () => {
  console.log('Test server running at http://localhost:3000...');
});

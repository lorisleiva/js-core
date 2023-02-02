/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const jsonServer = require('json-server');

const server = jsonServer.create();
server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);
server.use(jsonServer.router('test/db.json'));

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.json(req.query);
});

server.listen(3000, () => {
  console.log('Test server running at http://localhost:3000...');
});

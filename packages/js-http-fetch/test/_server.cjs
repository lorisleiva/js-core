/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const jsonServer = require('json-server');

const server = jsonServer.create();
server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);
server.use(jsonServer.router('test/db.json'));

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

server.listen(3000, () => {
  console.log('Test server is running...');
});

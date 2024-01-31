const corsProxy = require('cors-anywhere');
const host = 'localhost';
const port = 8079;

corsProxy.createServer().listen(port, host, () => {
  console.log(`Running CORS Anywhere on ${host}:${port}`);
});

function rollDie(min, max) {
  return Math.floor((Math.random() * (max - min + 1)) + min);
}

const HTTP = require('http');
const URL = require('url').URL; // imports URL class
const PORT = 3000;

const SERVER = HTTP.createServer((req, res) => {
  let method = req.method;
  let path = req.url;
  let url = new URL(path, 'http://localhost:3000');
  let params = url.searchParams;

  if (path === '/favicon.ico') {
    res.statusCode = 404;
    res.end();
  } else {
    let rollsCounter = params.get('rolls');
    let numOfSides = params.get('sides');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');

    while (rollsCounter > 0) {
      let dieResult = rollDie(1, numOfSides);
      res.write(`You rolled the dice. It's a ${dieResult}!\n`);
      rollsCounter -= 1;
    }

    res.write(`${method} ${path}\n`);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
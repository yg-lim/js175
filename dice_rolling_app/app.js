const HTTP = require('http');
const PORT = 3000;
const { URL } = require('url');
const BASE_URL = `http://localhost:${PORT}`;

function dieRoll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollDice(params) {
  let numberOfRolls = Number(params.get('rolls'));
  let numberOfSides = Number(params.get('sides'));

  let result = ``;
  let counter = numberOfRolls;
  while (counter > 0) {
    result += `${dieRoll(1, numberOfSides)}\n`;
    counter -= 1;
  }

  return result;
}

function getParams(pathAndQueryString) {
  let url = new URL(pathAndQueryString, BASE_URL);
  return url.searchParams;
}

const SERVER = HTTP.createServer((req, res) => {
  let method = req.method;
  let pathAndQueryString = req.url;

  if (pathAndQueryString === '/favicon.ico') {
    res.statusCode = 404;
    res.write(`${method} ${pathAndQueryString}\n`);
    res.write(`Favicon not found!\n`);
    res.end();
  } else {
    let params = getParams(pathAndQueryString);
    let content = rollDice(params);

    res.statusCode = 200;
    res.write(`${method} ${pathAndQueryString}\n`);
    res.write(`${content}`);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Listening on port number ${PORT}...`);
});
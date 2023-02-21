const HTTP = require('http');
const { URL } = require('url');
const HANDLEBARS = require('handlebars');
const QUERYSTRING = require('querystring');
const ROUTER = require('router');
const FINALHANDLER = require('finalhandler');
const SERVESTATIC = require('serve-static');

const PORT = 3000;
const APR = 0.02;
const MONTHS_IN_YEAR = 12;
const PERCENTAGE = 100;
const HOST = 'http://localhost';

const LOAN_OFFER_SOURCE = `
<!DOCTYPE html>
<html lang="en-US">
<head>
  <title>Loan Calculator</title>
  <meta charset="utf-8">
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
  <h1>Loan Calculator</h1>
  <table>
    <tbody>
      <tr>
        <th scope="row">Loan Amount:</th>
        <td>
          <a href="?amount={{amountDecrement}}&duration={{duration}}">-10,000</a>
        </td>
        <td>$ {{amount}}</td>
        <td>
          <a href="?amount={{amountIncrement}}&duration={{duration}}">+10,000</a>
        </td>
      </tr>
      <tr>
        <th scope="row">Duration:</th>
        <td>
          <a href="?amount={{amount}}&duration={{durationDecrement}}">-1</a>
        </td>
        <td>{{duration}} years</td>
        <td>
          <a href="?amount={{amount}}&duration={{durationIncrement}}">+1</a>
        </td>
      </tr>
      <tr>
        <th scope="row">APR:</th>
        <td>{{apr}}%</td>
      </tr>
      <tr>
        <th scope="row">Monthly payment:</th>
        <td>$ {{monthlyPayment}}</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;

const LOAN_FORM_SOURCE = `
<!DOCTYPE html>
<html lang="en-US">
<head>
  <title>Loan Calculator</title>
  <meta charset="utf-8">
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
<main>
  <h1>Loan Calculator</h1>
  <p>All loans are offered at an APR of {{apr}}%.</p>
  <form action="/loan-offer" method="post">
    <dl>
      <dt><label for="amount">How much do you want to borrow (in dollars)?</label></dt>
      <dd><input type="text" id="amount" name="amount"></dd>
    </dl>

    <dl>
      <dt><label for="duration">How much time do you want to pay back your loan (in years)?</label></dt>
      <dd><input type="text" id="duration" name="duration"></dd>
    </dl>

    <button>Get loan offer!</button>
  </form>
</main>
</body>
</html>
`;

const LOAN_OFFER_TEMPLATE = HANDLEBARS.compile(LOAN_OFFER_SOURCE);
const LOAN_FORM_TEMPLATE = HANDLEBARS.compile(LOAN_FORM_SOURCE)

function getParams(path) {
  let url = new URL(path, HOST);
  let searchParams = url.searchParams;
  let data = {};
  data.amount = Number(searchParams.get('amount'));
  data.duration = Number(searchParams.get('duration'));
  return data;
}

function calculateMonthlyPayment(loanAmount, loanDurationYears) {
  let monthlyInterestRate = APR / MONTHS_IN_YEAR;
  let loanDurationMonths = loanDurationYears * MONTHS_IN_YEAR;

  let monthlyPayment = loanAmount * (monthlyInterestRate /
  (1 - Math.pow((1 + monthlyInterestRate), (-loanDurationMonths))));

  return monthlyPayment.toFixed(2);
}

function generateData(data) {
  data.amountIncrement = data.amount + 10000;
  data.amountDecrement = data.amount - 10000;
  data.durationIncrement = data.duration + 1;
  data.durationDecrement = data.duration - 1;
  data.monthlyPayment = calculateMonthlyPayment(data.amount, data.duration);
  data.apr = APR * PERCENTAGE;

  return data;
}

function renderHTML(template, data) {
  let html = template(data);
  return html;
}

function getPathname(path) {
  let url = new URL(path, HOST);
  return url.pathname;
}

function parseFormData(request, callback) {
  let body = '';
  request.on('data', chunk => {
    body += chunk.toString();
  });

  request.on('end', () => {
    let data = QUERYSTRING.parse(body);
    data.amount = Number(data.amount);
    data.duration = Number(data.duration);
    callback(data);
  });
}

let router = ROUTER();

router.use(SERVESTATIC('public'));

router.get('/', (req, res) => {
  let content = renderHTML(LOAN_FORM_TEMPLATE, { apr: APR * PERCENTAGE });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write(`${content}\n`);
  res.end();
});

router.get('/loan-offer', (req, res) => {
  let path = req.url;
  let data = generateData(getParams(path));
  let content = renderHTML(LOAN_OFFER_TEMPLATE, data);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write(content);
  res.end();
});

router.post('/loan-offer', (req, res) => {
  parseFormData(req, parsedData => {
    let data = generateData(parsedData);
    let content = renderHTML(LOAN_OFFER_TEMPLATE, data);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(`${content}\n`);
    res.end();
  });
});

router.get('*', (req, res) => {
  res.statusCode = 404;
  res.end();
});

const SERVER = HTTP.createServer((req, res) => {
  router(req, res, FINALHANDLER(req, res));
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port number ${PORT}...`);
});
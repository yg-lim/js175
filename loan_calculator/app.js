/* eslint-disable no-param-reassign */
const HTTP = require('http');
const { URL } = require('url');
const HANDLEBARS = require('handlebars');
const QUERYSTRING = require('querystring');
const ROUTER = require('router');
const FINALHANDLER = require('finalhandler');
const SERVESTATIC = require('serve-static');

const PORT = 3000;
const BASE_URL = `http://localhost:${3000}`;
const NUMBER_OF_MONTHS_IN_YEAR = 12;
const APR = 3.5;
const LOAN_OFFER_SOURCE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
          <tr>
            <th>Amount:</th>
            <td>
              <a href='/loan-offer?amount={{amountDecrement}}&duration={{durationInYears}}'>- $100</a>
            </td>
            <td>$ {{loanAmount}}</td>
            <td>
              <a href='/loan-offer?amount={{amountIncrement}}&duration={{durationInYears}}'>+ $100</a>
            </td>
          </tr>
          <tr>
            <th>Duration:</th>
            <td>
              <a href='/loan-offer?amount={{loanAmount}}&duration={{durationDecrement}}'>- 1 year</a>
            </td>
            <td>{{durationInYears}} years</td>
            <td>
              <a href='/loan-offer?amount={{loanAmount}}&duration={{durationIncrement}}'>+ 1 year</a>
            </td>
          </tr>
          <tr>
            <th>APR:</th>
            <td colspan='3'>{{apr}}%</td>
          </tr>
          <tr>
            <th>Monthly payment:</th>
            <td colspan='3'>$ {{monthlyPayment}}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </body>
</html>`;

const LOAN_FORM_SOURCE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <form action="/loan-offer" method="post">
        <p>All loans are offered at an APR of {{apr}}%.</p>
        <label for="amount">How much do you want to borrow (in dollars)?</label>
        <input type="number" name="amount" value="">
        <label for="amount">How much time do you want to pay back your loan?</label>
        <input type="number" name="duration" value="">
        <input type="submit" name="" value="Get loan offer!">
      </form>
    </article>
  </body>
</html>
`;

const LOAN_OFFER_TEMPLATE = HANDLEBARS.compile(LOAN_OFFER_SOURCE);
const LOAN_FORM_TEMPLATE = HANDLEBARS.compile(LOAN_FORM_SOURCE);

function parseFormData(request, callback) {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk.toString();
  });
  request.on('end', () => {
    const data = QUERYSTRING.parse(body);
    data.loanAmount = Number(data.amount);
    data.durationInYears = Number(data.duration);
    callback(data);
  });
}

function render(template, data) {
  const html = template(data);
  return html;
}

function getParams(pathAndQueryString) {
  const url = new URL(pathAndQueryString, BASE_URL);
  const { searchParams } = url;
  const data = {};
  data.loanAmount = Number(searchParams.get('amount'));
  data.durationInYears = Number(searchParams.get('duration'));

  return data;
}

function calculateMonthlyPayment(loanAmount, monthlyInterestRate, durationInMonths) {
  const monthlyPayment = loanAmount * (monthlyInterestRate
    / (1 - ((1 + monthlyInterestRate) ** (-durationInMonths))));

  return monthlyPayment.toFixed(2);
}

function generateLoanOffer(data) {
  data.apr = APR;
  data.amountIncrement = data.loanAmount + 100;
  data.amountDecrement = data.loanAmount - 100;
  data.durationIncrement = data.durationInYears + 1;
  data.durationDecrement = data.durationInYears - 1;

  const durationInMonths = data.durationInYears * NUMBER_OF_MONTHS_IN_YEAR;
  const monthlyInterestRate = (APR / 100) / NUMBER_OF_MONTHS_IN_YEAR;
  // eslint-disable-next-line max-len
  data.monthlyPayment = calculateMonthlyPayment(data.loanAmount, monthlyInterestRate, durationInMonths);
  return data;
}

const router = ROUTER();
router.use(SERVESTATIC('public'));

router.get('/', (req, res) => {
  const content = render(LOAN_FORM_TEMPLATE, { apr: APR });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write(`${content}\n`);
  res.end();
});

router.get('/loan-offer', (req, res) => {
  const data = generateLoanOffer(getParams(req.url));
  const content = render(LOAN_OFFER_TEMPLATE, data);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write(`${content}\n`);
  res.end();
});

router.post('/loan-offer', (req, res) => {
  parseFormData(req, (parsedData) => {
    const data = generateLoanOffer(parsedData);
    const content = render(LOAN_OFFER_TEMPLATE, data);

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

SERVER.listen(PORT, () => {});

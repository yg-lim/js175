/* eslint-disable no-lonely-if */
const HTTP = require('http');
const { URL } = require('url'); // imports URL class of `url` module
const HANDLEBARS = require('handlebars');
const FS = require('fs');
const PATH = require('path');

const PORT = 3000;

const APR = 3.49;

const MIME_TYPES = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const LOAN_OFFER_SOURCE = `
<!DOCTYPE html>
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
              <a href='/?amount={{amountDecrement}}&duration={{durationInYears}}'>- $100</a>
            </td>
            <td>$ {{amount}}</td>
            <td>
              <a href='/?amount={{amountIncrement}}&duration={{durationInYears}}'>+ $100</a>
            </td>
          </tr>
          <tr>
            <th>Duration:</th>
            <td>
              <a href='/?amount={{amount}}&duration={{durationDecrement}}'>- 1 year</a>
            </td>
            <td>{{duration}} years</td>
            <td>
              <a href='/?amount={{amount}}&duration={{durationIncrement}}'>+ 1 year</a>
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
</html>
`;

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
      <form action="/loan-offer" method="get">
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

function render(template, data) {
  const html = template(data);
  return html;
}

function getParams(path) {
  const myURL = new URL(path, 'http://localhost:3000');
  return myURL.searchParams;
}

function getPathname(path) {
  const myURL = new URL(path, `http://localhost:${PORT}`);
  return myURL.pathname;
}

function calculateLoan(amount, durationInYears, apr) {
  const NUM_OF_MONTHS_IN_YEAR = 12;
  const durationInMonths = durationInYears * NUM_OF_MONTHS_IN_YEAR;
  const monthlyInterestRate = (apr / 100) / NUM_OF_MONTHS_IN_YEAR;
  const monthlyPayment = amount * (monthlyInterestRate
    / (1 - (1 + monthlyInterestRate) ** -durationInMonths));

  return monthlyPayment.toFixed(2);
}

function generateLoanOffer(params) {
  const data = {};

  data.amount = Number(params.get('amount'));
  data.amountIncrement = data.amount + 100;
  data.amountDecrement = data.amount - 100;
  data.durationInYears = Number(params.get('duration'));
  data.durationIncrement = data.durationInYears + 1;
  data.durationDecrement = data.durationInYears - 1;
  data.apr = APR;
  data.monthlyPayment = calculateLoan(data.amount, data.durationInYears, data.apr);

  return data;
}

const SERVER = HTTP.createServer((req, res) => {
  const path = req.url;
  const pathname = getPathname(path);
  const fileExtension = PATH.extname(pathname);

  FS.readFile(`./public${pathname}`, (err, FSdata) => {
    if (FSdata) {
      res.statusCode = 200;
      res.setHeader('Content-Type', `${MIME_TYPES[fileExtension]}`);
      res.write(`${FSdata}\n`);
      res.end();
    } else {
      if (pathname === '/') {
        const content = render(LOAN_FORM_TEMPLATE, { apr: APR });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write(`${content}\n`);
        res.end();
      } else if (pathname === '/loan-offer') {
        const data = generateLoanOffer(getParams(path));
        const content = render(LOAN_OFFER_TEMPLATE, data);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write(`${content}\n`);
        res.end();
      } else {
        res.statusCode = 404;
        res.end();
      }
    }
  });
});

SERVER.listen(PORT, () => {
});

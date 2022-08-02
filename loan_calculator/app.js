const HTTP = require('http');
const { URL } = require('url'); // imports URL class of `url` module

const PORT = 3000;

const HTML_START = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <style type="text/css">
      body {
        background: rgba(250, 250, 250);
        font-family: sans-serif;
        color: rgb(50, 50, 50);
      }

      article {
        width: 100%;
        max-width: 40rem;
        margin: 0 auto;
        padding: 1rem 2rem;
      }

      h1 {
        font-size: 2.5rem;
        text-align: center;
      }

      table {
        font-size: 2rem;
      }

      th {
        text-align: right;
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
`;

const HTML_END = `
        </tbody>
      </table>
    </article>
  </body>
</html>`;

function getParams(path) {
  const myURL = new URL(path, 'http://localhost:3000');
  return myURL.searchParams;
}

function calculateLoan(amount, durationInYears, APR) {
  const NUM_OF_MONTHS_IN_YEAR = 12;
  const durationInMonths = durationInYears * NUM_OF_MONTHS_IN_YEAR;
  const monthlyInterestRate = (APR / 100) / NUM_OF_MONTHS_IN_YEAR;
  const monthlyPayment = amount * (monthlyInterestRate
    / (1 - (1 + monthlyInterestRate) ** -durationInMonths));

  return monthlyPayment.toFixed(2);
}

function generateLoanOffer(params) {
  const APR = 3.49;
  const amount = Number(params.get('amount'));
  const durationInYears = Number(params.get('duration'));
  const monthlyPayment = calculateLoan(amount, durationInYears, APR);
  let content = `<tr>
                 <th>Amount:</th>
                 <td><a href='/?amount=${amount - 10000}&duration=${durationInYears}'>- $10,000</a></td>
                 <td>${amount}</td>
                 <td><a href='/?amount=${amount + 10000}&duration=${durationInYears}'>+ $10,000</a></td>
                 </tr>
                 <tr>
                 <th>Duration:</th>
                 <td><a href='/?amount=${amount}&duration=${durationInYears - 1}'>- 1 year</a></td>
                 <td>${durationInYears} years</td>
                 <td><a href='/?amount=${amount}&duration=${durationInYears + 1}'>+ 1 year</a></td>
                 </tr>
                 <tr>
                 <th>APR:</th>
                 <td colspan='3'>${APR}%</td>
                 </tr>
                 <tr>
                 <th>Monthly payment:</th>
                 <td colspan='3'>${monthlyPayment}</td>
                 </tr>`

  return `${HTML_START}${content}${HTML_END}`;
}

const SERVER = HTTP.createServer((req, res) => {
  const path = req.url;
  const params = getParams(path);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  const content = generateLoanOffer(params);
  res.write(content);
  res.end();
});

SERVER.listen(PORT, () => {
});

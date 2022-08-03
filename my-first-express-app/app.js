const EXPRESS = require('express');
const PORT = 3000;
const app = EXPRESS();
app.set('view engine', 'pug');

app.get('/', (request, response) => {
  response.render('index');
});

app.get('/account', (request, response) => {
  response.render('account', { money: '$100', recentTransaction: false });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`)
});
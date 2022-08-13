const express = require('express');
const app = express();
const PORT = 3000;

app.set("views", "./views");
app.set("view engine", "pug");

app.get('/', (req, res) => {
  res.render("hello-world-english");
});

app.listen(PORT, 'localhost', () => {
  console.log(`Listening on port number ${PORT}...`);
});
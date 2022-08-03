const express = require('express');
const morgan = require('morgan');
const app = express();
const COUNTRY_DATA = [
  {
    path: "/english",
    flag: "flag-of-United-States-of-America.png",
    alt: "US Flag",
    title: "Go to US English site",
  },
  {
    path: "/french",
    flag: "flag-of-France.png",
    alt: "Drapeau de la france",
    title: "Aller sur le site français",
  },
  {
    path: "/serbian",
    flag: "flag-of-Serbia.png",
    alt: "Застава Србије",
    title: "Идите на српски сајт",
  }
];

const LANGUAGE_CODES = {
  english: "en-US",
  french: "fr-FR",
  serbian: "sr-Cryl-rs",
};

const PORT = 3000;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static("public"));
app.use(morgan("common"));

const writeLog = (req, res) => {
  let timeStamp = String(new Date()).substring(4, 24);
  console.log(`${timeStamp} ${req.method} ${req.originalUrl} ${res.statusCode}`);
}

const showEnglishView = (req, res) => {
  res.render('index-english', { 
    countries: COUNTRY_DATA,
    currentPath: req.path,
    language: 'en-US',
  });
};

app.locals.currentPathClass = (path, currentPath) => {
  return path === currentPath ? "current" : "";
}

app.get('/', showEnglishView)

app.get("/:language", (req, res, next) => {
  const language = req.params.language;
  const languageCode = LANGUAGE_CODES[language];
  if (!languageCode) {
    next(new Error(`Language not supoprted: ${language}`));
  } else {
    res.render(`index-${language}`, {
      countries: COUNTRY_DATA,
      currentPath: req.path,
      language: languageCode,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`)
});

app.use((err, req, res, _next) => {
  console.log(err);
  res.status(404).send(err.message);
});
const express = require('express');
const morgan = require('morgan');
const app = express();
const { body, validationResult } = require('express-validator');

const PORT = 3000;

const contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = contacts => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

function inputIsEmpty(input) {
  return input.length === 0;
}

function exceedsMaxCharacterLimit(input) {
  return input.length > 25;
}

function containsNonAlphabeticalChars(input) {
  return input.test(/[^a-z]/i);
}

function isUSPhoneNumberFormat(input) {
  return input.test(/^\d{3}-\d{3}-\d{4}$/i);
}

function trimUserInputs(req, res, next) {
  Object.keys(req.body).forEach(key => {
    req.body[key] = req.body[key].trim();
  });

  next();
}

function createErrorMessagesArray(req, res, next) {
  res.locals.errorMessages = [];
  next();
}

function checkValidFirstName(req, res, next) {
  const input = req.body.firstName;
  const errorMessages = [];
  
  if (inputIsEmpty(input)) errorMessages.push('First name is required.');
  if (exceedsMaxCharacterLimit(input)) errorMessages.push('First name cannot exceed 25 characters.');
  if (containsNonAlphabeticalChars(input)) errorMessages.push('First name must consist only of alphabetical characters');

  if (errorMessages.length > 0) res.locals.errorMessages.push(errorMessages.join(' '));

  next();
};

function checkValidLastName(req, res, next) {
  const input = req.body.lastName;
  const errorMessages = [];

  if (inputIsEmpty(input)) errorMessages.push('Last name is required.');
  if (exceedsMaxCharacterLimit(input)) errorMessages.push('Last name cannot exceed 25 characters.');
  if (containsNonAlphabeticalChars(input)) errorMessages.push('Last name must consist only of alphabetical characters');

  if (errorMessages.length > 0) res.locals.errorMessages.push(errorMessages.join(' '));

  next();
};

function checkContactNameExists(req, res, next) {
  const firstName = req.body.firstName.toLowerCase();
  const lastName = req.body.lastName.toLowerCase();

  contactData.forEach(contact => {
    const contactFirstName = contact.firstName.toLowerCase();
    const contactLastName = contact.lastName.toLowerCase();

    if (firstName === contactFirstName && lastName === contactLastName) {
      res.locals.errorMessages.push('Contact already exists.');
    }
  });

  next();
}

function checkValidPhoneNumber(req, res, next) {
  const input = req.body.phoneNumber;
  const errorMessages = [];

  if (inputIsEmpty(input)) {
    errorMessages.push('Phone number is required.');
  } else if (!inputIsEmpty(input) && !isUSPhoneNumberFormat(input)) {
    errorMessages.push('Phone number must be ###-###-#### format.');
  }

  if (errorMessages.length > 0) res.locals.errorMessages.push(errorMessages.join(' '));

  next();
};

function displayErrorMessages(req, res, next) {
  if (res.locals.errorMessages.length > 0) {
    res.render('new-contact', {
      errorMessages: res.locals.errorMessages,
      ...req.body
    });
  } else {
    next();
  }
};

function saveContactAndDisplayPage(req, res) {
  contactData.push({ ...req.body });
  res.redirect('/contacts');
};

const newContactFunctions = [
  createErrorMessagesArray,
  trimUserInputs,
  checkValidFirstName,
  checkValidLastName,
  checkContactNameExists,
  checkValidPhoneNumber,
  displayErrorMessages,
  saveContactAndDisplayPage,
];

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('common'));

app.get('/', (req, res) => {
  res.redirect('/contacts');
});

app.get('/contacts', (req, res) => {
  res.render('contacts', {
    contacts: sortContacts(contactData),
  })
});

app.get('/contacts/new', (req, res) => {
  res.render('new-contact');
});

app.post('/contacts/new', newContactFunctions);

app.listen(PORT, 'localhost', () => {
  console.log(`Server listening on port number ${PORT}...`);
});
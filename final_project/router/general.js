const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop using async-await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await new Promise((resolve, reject) => {
      resolve(books);
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  })
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err.message }));
});

// Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const booksByAuthor = await new Promise((resolve, reject) => {
      const result = [];
      const keys = Object.keys(books);
      keys.forEach(key => {
        if (books[key].author === author) {
          result.push({ isbn: key, ...books[key] });
        }
      });
      if (result.length > 0) {
        resolve(result);
      } else {
        reject(new Error("No books found for this author"));
      }
    });
    return res.status(200).json({ booksByAuthor });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get all books based on title using async-await
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const booksByTitle = await new Promise((resolve, reject) => {
      const result = [];
      const keys = Object.keys(books);
      keys.forEach(key => {
        if (books[key].title === title) {
          result.push({ isbn: key, ...books[key] });
        }
      });
      if (result.length > 0) {
        resolve(result);
      } else {
        reject(new Error("No books found with this title"));
      }
    });
    return res.status(200).json({ booksByTitle });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;

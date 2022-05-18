const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const urlDatabase1 = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  usermID: {
    id: "usermID",
    email: "ikchoi0@gmail.com",
    password: "1",
  },
};

function generateRandomString() {
  let string = "0123456789abcdefghijklmnopqrstuvwxyz";
  let count = 6;
  let result = "";
  for (let i = 0; i < count; i++) {
    result += string[Math.floor(Math.random() * string.length)];
  }
  return result;
}
function checkEmailInDatabase(users, email) {
  for (let key of Object.keys(users)) {
    if (users[key].email === email) {
      // email already exists
      // res.redirect('/register');
      // return;
      return { error: null, data: users[key] };
    }
  }
  return { error: "400", data: {} };
}

function loggedIn (cookie) {
  if (cookie) {
    return true;
  }
  return false;
}
app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/hello", (req, res) => {
//   const templateVars = { username: req.cookies["username"], greeting: "Hello World!" };
//   res.render("hello_world", templateVars);
// });

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  const templateVars = { user: user, urls: urlDatabase1 };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase1[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  res.redirect(urlDatabase1[req.params.shortURL].longURL);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  res.render("registration", { user: user });
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]] || {};
  res.render("login", {user:user});
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase1[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  urlDatabase1[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID: user_id
  }
  res.redirect("/urls/" + req.params.shortURL);
});

app.post("/urls", (req, res) => {
  if (!loggedIn(req.cookies["user_id"])) {
    return res.redirect("/login");
  }
  const user_id = req.cookies["user_id"];
  let generatedURL = generateRandomString();
  urlDatabase1[generatedURL] = {
    longURL: req.body.longURL,
    userID: user_id
  }
  res.redirect(`/urls/${generatedURL}`); // Respond with 'Ok' (we will replace this)
});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const { error, data } = checkEmailInDatabase(users, email);
  if (error) {
    return res.status("403").send("Email is not registered");
  }
  if (password !== data.password) {
    return res.status("403").send("Password does not match!");
  }
  res.cookie("user_id", data.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    // res.statusCode = 400;
    // res.redirect("/register");
    res.status("400").send("enter email/password");
    return;
  }
  const { error, data } = checkEmailInDatabase(users, email);
  if (!error) {
    return res.status("400").send("Email exists");
  }
  const generatedId = generateRandomString();
  users[generatedId] = {
    id: generatedId,
    email,
    password,
  };
  res.cookie("user_id", generatedId);
  res.redirect("/urls");
});

app.use((req, res) => {
  res.status(404).send(`<h1>Page Not Found: ${req.url}</h1>`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}`);
});

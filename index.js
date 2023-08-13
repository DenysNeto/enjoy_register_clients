var express = require("express");
const app = express();

app.use(express.json());

console.log("HERE", __dirname);

// app.use(bodyParser.json({ extended: true }));

app.use(express.static(__dirname));
app.use(express.static("assets"));
app.use(express.static("utils"));
app.use(express.static("frontend"));

app.get("/", (req, res) => {
  app.get("/", (req, res) => {
    console.log("START_!!!");
    res.sendFile(__dirname + "/frontend/login.html");
  });
});

app.get("/json", (req, res) => {
  res.json({ "Choo Choo": "Welcome to your Express app 🚅" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

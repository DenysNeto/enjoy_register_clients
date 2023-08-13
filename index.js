const path = require("path");
const util = require("util");
var express = require("express");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const GridFSBucket = require("mongodb").GridFSBucket;

(app = express()), (port = process.env.PORT || 3000);
app.use(express.json());

console.log("HERE");

// app.use(bodyParser.json({ extended: true }));
app.listen(port);
// app.use(express.static(__dirname));
// app.use(express.static("assets"));
// app.use(express.static("utils"));
app.use(express.static("frontend"));

console.log("HERE2");

// Enable parsing of URL-encoded data on all routes:
app.use(
  express.urlencoded({
    extended: false, // Whether to use algorithm that can handle non-flat data strutures
    limit: 10000, // Limit payload size in bytes
    parameterLimit: 20, // Limit number of form items on payload
  })
);

console.log("HERE3");
//TODO TEST
//app.use(cors()); // Allows request from any IP (prevent any CORS error)

let dbConfig = {
  //url: "mongodb://localhost:27017/",
  url: "mongodb+srv://admin:admin@cluster0.huv9vl6.mongodb.net/lazer",
  database: "lazer",
  imgBucket: "photos",
};
console.log("HERE4");
// MONGO CONNECTION

// SET FOR UPLOAD
var storage = new GridFsStorage({
  url: dbConfig.url,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    // TODO change the name of file to be unique
    console.log("DWSCRIPTION", req.body.metadata_photo, file.originalname);

    let allDescriptions = JSON.parse(req.body.metadata_photo);
    let fileDescription = allDescriptions[file.originalname];

    console.log("RESULT", req.body.descriptions_photo);

    console.log("REQ_BODY_TEST", req.body, file);
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${file.originalname}`;
      return filename;
    }

    // GENERATE UNIQUE ID FOR PHOTO
    let id = Math.random().toString(16).slice(2);

    return {
      bucketName: dbConfig.imgBucket,
      filename: `${id}`,
      metadata: fileDescription,
    };
  },
});

console.log("HERE5");

var uploadFiles = multer({ storage: storage }).array("files", 10);
var uploadFilesMiddleware = util.promisify(uploadFiles);

let mongoConnectionFunc = async () => {
  await mongoClient.connect();
};
console.log("HERE5");
const mongoClient = new MongoClient(dbConfig.url);
console.log("HERE6");
// download photo from server
const download = async (req, res) => {
  try {
    console.log("DOWNLOAD");
    await mongoClient.connect();
    console.log("CONNECTED");
    const database = mongoClient.db("lazer");
    const bucket = new GridFSBucket(database, {
      bucketName: dbConfig.imgBucket,
    });

    let downloadStream = bucket.openDownloadStreamByName(req.params.name);

    downloadStream.on("data", function (data) {
      return res.status(200).write(data);
    });

    downloadStream.on("error", function (err) {
      return res.status(404).send({ message: "Cannot download the Image!" });
    });

    downloadStream.on("end", () => {
      return res.end();
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

// EXECUTION

mongoConnectionFunc();

// RENDERING
console.log("HERE8");
app.get("/", (req, res) => {
  console.log("START_!!!");
  res.sendFile(__dirname + "/frontend/login.html");
});

// app.get("/add_customer_render", (req, res) => {
//   res.sendFile(__dirname + "/frontend/index.html");
// });

app.get("/search_customer_render", (req, res) => {
  res.sendFile(__dirname + "/frontend/searchCustomer.html");
});

app.get("/search_worker_render", (req, res) => {
  res.sendFile(__dirname + "/frontend/searchWorker.html");
});

app.get("/add_customer_render", (req, res) => {
  res.sendFile(__dirname + "/frontend/addCustomer.html");
});

app.get("/add_worker_render", (req, res) => {
  res.sendFile(__dirname + "/frontend/addWorker.html");
});

app.get("/main_page_render", (req, res) => {
  res.sendFile(__dirname + "/frontend/mainPage.html");
});

app.get("/customer_render/:id", async (req, res) => {
  //res.sendFile(__dirname + "/frontend/search.html");
  res.sendFile(__dirname + "/frontend/customerDetails.html");
});

app.get("/edit_customer_render/:id", async (req, res) => {
  //res.sendFile(__dirname + "/frontend/search.html");
  res.sendFile(__dirname + "/frontend/editCustomer.html");
});

// EXECUTION

// CUSTOMERS

app.get("/customer/:id", async (req, res) => {
  console.log("REQ_CUSTOMER_ID", req.params.id);

  const database = mongoClient.db("lazer");
  const customers = database.collection("customers");

  let curentCustomer = customers.find({ _id: new ObjectId(req.params.id) });
  // //console.log("ALL_CUSTOMERS", allCustomers);

  let allDocumnets = [];
  for await (const doc of curentCustomer) {
    allDocumnets.push(doc);
  }

  res.status(200).send(allDocumnets[0]);
});

app.put("/customer/:id", async (req, res) => {
  // TODO ADD DELETE PHOTOS
  console.log("UPDATE_PAYLOAD", req.body);
  try {
    const database = mongoClient.db("lazer");
    const customers = database.collection("customers");
    let resultUpdate = await customers.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body } }
    );

    if (resultUpdate.matchedCount == 0) {
      res.status(404).send({ message: "Клиент не найден!", status: 404 });
    }

    console.log("AFTER_UPDATE", resultUpdate);
    res.status(200).send({ message: "Удалено успешно!", status: 200 });
  } catch (err) {
    console.log("ERROR_DELETE", err);
    res.status(500).send({
      message: err.message,
    });
  }
});

app.delete("/customer/:id", async (req, res) => {
  // TODO ADD DELETE PHOTOS
  console.log("REQ_CUSTOMER_ID_DELETE", req.params.id);
  try {
    const database = mongoClient.db("lazer");
    const customers = database.collection("customers");
    await customers.updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      { $set: { status: "deleted" } }
    );

    console.log("AFTER_DELETE");
    res.status(200).send({ message: "Удалено успешно!", status: 200 });
  } catch (err) {
    console.log("ERROR_DELETE", err);
    res.status(500).send({
      message: err.message,
    });
  }
});

// Query params to get all
app.get("/customers", async (req, res) => {
  console.log("PARAMS", req.query.params, req.query);
  const database = mongoClient.db("lazer");
  const customers = database.collection("users");
  let allCustomers = customers.find({
    status: { $ne: "deleted" },
    ...req.query,
  });
  //console.log("ALL_CUSTOMERS", allCustomers);
  let allDocumnets = [];
  for await (const doc of allCustomers) {
    allDocumnets.push(doc);
  }

  res.status(200).send(allDocumnets);
});

app.get("/login", async (req, res) => {
  try {
    console.log("PARAMS", req.query);
    let obj = req.query;
    const database = mongoClient.db("lazer");
    const users = database.collection("users");

    console.log("OBJ", obj);

    let curentUser = users.find(obj);
    // //console.log("ALL_CUSTOMERS", allCustomers);
    let allDocumnets = [];
    for await (const doc of curentUser) {
      allDocumnets.push(doc);
    }
    console.log("RESULT_LOGIN", allDocumnets[0]);
    if (allDocumnets[0]) {
      res
        .status(200)
        .send({ user: allDocumnets[0], message: "Вход выполнен", status: 200 });
    } else {
      res.status(400).send({ message: "Пользователь не найден", status: 400 });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.get("/workers/:id", async (req, res) => {
  const database = mongoClient.db("lazer");
  const users = database.collection("users");

  let foundUsers = users.find({
    added_by: req.params.id,
    role: "worker",
  });

  //console.log("ALL_CUSTOMERS", allCustomers);
  let allDocumnets = [];
  for await (const doc of foundUsers) {
    allDocumnets.push(doc);
  }

  res
    .status(200)
    .send({ status: 200, message: "Users found", workers: allDocumnets });
});

//
app.get("/photos/:name", download);

// TODO ADD EXAMPLE for search
// FINISH WITH EXAMPLE GET IMAGE

app.post("/addUser", async function (req, res) {
  try {
    await uploadFilesMiddleware(req, res);
    const database = mongoClient.db("lazer");
    // TODO EXAMPLE ADD INDEX
    database.collection("users").createIndex({ location: 1 });
    const customers = database.collection("users");
    let aa = req.body;
    aa.photos = req.files.map((el) => el.filename);

    // TODO add ref to chunk
    const result = await customers.insertOne({ ...aa });
    console.log("RESULT ADD USER ", result);
    if (result && result.acknowledged == true) {
      res.status(200).send({
        status: 200,
        message: "Пользователь добавлен успешно",
      });
    } else {
      res.status(400).send({
        status: 400,
        message: "Ошибка! Пользователь не добавлен",
        error: "Error push to DB",
      });
    }
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: "Ошибка! Пользователь не добавлен",
      error: err.message,
    });
  }
});

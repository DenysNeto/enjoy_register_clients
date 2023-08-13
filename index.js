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
// app.use(bodyParser.json({ extended: true }));
app.listen(port);
app.use(express.static(__dirname));
app.use(express.static("assets"));
app.use(express.static("utils"));
app.use(express.static("frontend"));

// Enable parsing of URL-encoded data on all routes:
app.use(
  express.urlencoded({
    extended: false, // Whether to use algorithm that can handle non-flat data strutures
    limit: 10000, // Limit payload size in bytes
    parameterLimit: 20, // Limit number of form items on payload
  })
);
//TODO TEST
//app.use(cors()); // Allows request from any IP (prevent any CORS error)

let dbConfig = {
  url: "mongodb+srv://admin:admin@cluster0.huv9vl6.mongodb.net/lazer",
  database: "lazer",
  imgBucket: "photos",
};

// MONGO CONNECTION

// SET FOR UPLOAD
var storage = new GridFsStorage({
  url: dbConfig.url,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    // TODO change the name of file to be unique
    let fileDescription = {};
    if (req.body.metadata_photo) {
      let allDescriptions = JSON.parse(req.body.metadata_photo);
      fileDescription = allDescriptions[file.originalname];
    }

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
      metadata: { ...fileDescription },
    };
  },
});

var uploadFiles = multer({ storage: storage }).array("files", 10);
var uploadFilesMiddleware = util.promisify(uploadFiles);

let mongoConnectionFunc = async () => {
  await mongoClient.connect();
};

const mongoClient = new MongoClient(dbConfig.url);

// VARIABLES

// FUNCTIONS REPLACE AFTER (PUT IN CONTROLLER)
async function getById(collection, id) {
  return await collection.findOne({ _id: new ObjectId(id) });
}

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

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/frontend/login.html");
});

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

app.get("/add_customer_photo_render/:id", async (req, res) => {
  //res.sendFile(__dirname + "/frontend/search.html");
  res.sendFile(__dirname + "/frontend/addPhoto.html");
});

// EXECUTION

// CUSTOMERS

app.post("/add_customer_photos/:id", async (req, res) => {
  await uploadFilesMiddleware(req, res);
  let reqResult = req.body;

  const database = mongoClient.db("lazer");
  const customers = database.collection("users");
  reqResult.photos = req.files.map((el) => el.filename);
  let resultUpdate = await customers.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $push: { photos: { $each: reqResult.photos } } }
  );

  if (resultUpdate.matchedCount == 0) {
    res.status(404).send({ message: "Клиент не найден!", status: 404 });
  }
  res.status(200).send({ message: "Фото добавленно успешно!", status: 200 });
});

app.get("/customer/:id", async (req, res) => {
  const database = mongoClient.db("lazer");
  const customers = database.collection("users");
  let curentCustomer = await getById(customers, req.params.id);
  let addedBy = await getById(customers, curentCustomer.added_by);
  let workers = await getById(customers, curentCustomer.workers);
  curentCustomer.added_by = `${addedBy.name} ${addedBy["last-name"]}`;
  curentCustomer.workers = `${workers.name} ${workers["last-name"]}`;

  if (!curentCustomer) {
    res.status(400).send({ message: "Клиент не нейден!", status: 400 });
  } else {
    res.status(200).send(curentCustomer);
  }
});

app.put("/customer/:id", async (req, res) => {
  // TODO ADD DELETE PHOTOS
  try {
    const database = mongoClient.db("lazer");
    const customers = database.collection("users");
    let resultUpdate = await customers.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updated_at: new Date().getTime() } }
    );

    if (resultUpdate.matchedCount == 0) {
      res.status(404).send({ message: "Клиент не найден!", status: 404 });
    }
    res.status(200).send({ message: "Клиент обновлён успешно!", status: 200 });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});

app.delete("/customer/:id", async (req, res) => {
  // TODO ADD DELETE PHOTOS
  try {
    const database = mongoClient.db("lazer");
    const customers = database.collection("users");
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
    let obj = req.query;
    const database = mongoClient.db("lazer");
    const users = database.collection("users");
    let curentUser = users.findOne(obj);
    if (curentUser) {
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

app.get("/find_workers_attached_to_clien/:id", async (req, res) => {
  const database = mongoClient.db("lazer");
  const users = database.collection("users");
  let foundUsers = users.find({
    added_by: req.params.id,
    role: "worker",
  });
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

//TODO ADDTO UTILS
async function isUserExists(collection, payload) {
  var myDocument = await collection.findOne(payload);
  console.log("MY_DOCUMENT", myDocument);
  if (myDocument) {
    return true;
  }
  return false;
}

app.post("/addUser", async function (req, res) {
  try {
    await uploadFilesMiddleware(req, res);
    const database = mongoClient.db("lazer");

    // TODO EXAMPLE ADD INDEX
    database.collection("users").createIndex({ location: 1 });
    const customers = database.collection("users");

    let isDuplicate = await isUserExists(customers, {
      name: req.body.name,
      "last-name": req.body["last-name"],
    });

    if (isDuplicate) {
      res.status(200).send({
        status: 200,
        message: "Пользователь уже существует",
      });
      return;
    }

    let userPayload = req.body;
    userPayload.photos = req.files.map((el) => el.filename);
    userPayload.created_at = new Date().getTime();

    // TODO add ref to chunk
    const result = await customers.insertOne({ ...userPayload });
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

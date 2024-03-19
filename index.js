const express = require("express");
const app = express();
require("dotenv").config();
const AWS = require("aws-sdk");
const upload = require("./upload/upload");
///
//config AWS
// khai bao trc
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";
AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESSKEY,
  secretAccessKey: process.env.SECRETKEY,
});

const tableName = process.env.TABLENAME;
const bucketName = process.env.BUCKETNAME;
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("./view")); // thu muc view
app.set("view engine", "ejs");
app.set("views", "./view");

app.listen(3000, () => {
  console.log("Running with port 3000");
});
////
app.get("/", async (req, res) => {
  const params = { TableName: tableName };
  const data = await dynamoDB.scan(params).promise();

  return res.render("index", { products: data.Items });
});

app.post("/save", upload.single("image"), (req, res) => {
  const { id, name, quantity } = req.body;
  const image = req.file?.originalname.split(".");
  const filePath = `${id}_${Date.now().toString()}_${image[0]}_${image[1]}`;
  console.log(filePath);
  //dua hinh anh len s3
  const paramsS3 = {
    Bucket: bucketName,
    Key: filePath,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };
  s3.upload(paramsS3, async (err, data) => {
    if (err) console.log(err);
    else {
      const imageURL = data.Location;
      const paramsDynamoDB = {
        TableName: tableName,
        Item: {
          id: id,
          name: name,
          quantity: quantity,
          image: imageURL,
        },
      };
      await dynamoDB.put(paramsDynamoDB).promise();
      return res.redirect("/");
    }
  });
});

app.post("/delete", (req, res) => {
  const { checked } = req.body;
  const ids = [...checked]
  ids.forEach((id, index) => {
    const params = {
      TableName: tableName,
      Key: {
        id: id
      }
    }
    dynamoDB.delete(params, (err, data) => {
      if (err) console.log(err);
      else 
      if (index === ids.length - 1) return res.redirect("/");
    })
  })
})

// Requiring dependancies
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import multer from 'multer';
import AWS from 'aws-sdk';
import Uploads from './models/Uploads.js';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

const MONGODB_URI = "mongodb+srv://abhinabroy2001:awOjlddyoig1TOrL@upload-demo.vu8t0sm.mongodb.net/uploadDemo"
// const MONGODB_URI = "mongodb://abhinab:OPlg3nWeW7MILxIA@trumpcard.rnsznsz.mongodb.net/trumpcardsdb"



const app = express();
const upload = multer();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-AUTH-TOKEN");
    res.setHeader("Access-Control-Allow-Methods",
    "GET, POST, PATCH,PUT, DELETE,OPTIONS");

    next();
});

app.use('/upload', upload.single('file'), async (req, res, next) => {
    // const fileData = req.file.buffer.toString('base64');


    // const upload = await Uploads.create({
    //     fileName: req.file.originalname,
    //     fileData
    // })

    // if(upload)
    //     res.send("Uploaded!");

    // else
    //     res.send("Not Uploaded!");

    const file = req.file;

  // Set the S3 bucket name and key (filename) for the uploaded file
  const bucketName = 'abhinabfilestore';
  const key = file.originalname;

  // Set up the S3 upload parameters
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer
  };

  // Upload the file to S3
  try {
    const data = await s3.upload(params).promise();
    console.log(data);


    try {
        const newFile = await Uploads.create({
            fileName: key,
            fileUrl: data.Location
        })
        res.status(200).json({
            message: "success",
            newFile
        })
    } catch (error) {
        return res.send("Something went wrong saving the file!")
    }
  } catch (error) {
    return res.send("Something went wrong uploading the file!")
  }

})

app.use('/get-files', async (req, res, next) => {
    const files = await Uploads.find({});

    if(files.length > 0) {
        res.status(200).json({
            files,
            message: "success"
        })
    }
    else {
        res.status(500).json({
            message: "No files found!"
        })
    }

});

mongoose.connect(MONGODB_URI,
    { useUnifiedTopology: true, useNewUrlParser: true }
  )
  .then(result => {
    console.log("Database has been connected successfully!")

  })
  .catch(err => {
    console.log("Could not connect to the Database!")
    console.log(err)
  })


  export default app;
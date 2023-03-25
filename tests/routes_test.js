// Description: Test file for image upload
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const imagePath = 'testImage.jpg';
const imageBuffer = fs.readFileSync(imagePath);

// Define HTTP POST request data
const formData = new FormData();
formData.append('image', imageBuffer, { filename: imagePath });

// Define HTTP POST request options
const options = {
  method: 'POST',
  url: 'http://localhost:3030/imageUpload',
  data: formData,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
};

// Send HTTP POST request
axios(options)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });
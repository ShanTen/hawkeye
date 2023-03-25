const isDebugMode = true; //Set to true to disable sending messages to the messaging service
if(isDebugMode) console.log("Debug mode is enabled");

// Description: This file is the main server file that handles all the requests from the client side (pi)

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import { google } from 'googleapis';
import crypto from 'crypto';
import axios from 'axios';

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////// Config and Google Drive Setup ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/* fs read and write methods */
const read_json = (fileLoc) => JSON.parse(fs.readFileSync(fileLoc));
const save_json = (filename, data) => fs.writeFileSync(filename, JSON.stringify(data));

/*Config*/
const config = read_json('./runtimeConfig.json');
const users = read_json('./users.json');
const app = express();

const { client_id, client_secret, redirect_uris, refresh_token, google_folder_id, messaging_service_url } = config;
var redirect_uri = redirect_uris[0];

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uri
);

oauth2Client.setCredentials({ refresh_token })

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

test_googleapis_connection();

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Helper Functions /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/* Test google drive connection */
async function test_googleapis_connection() {
  try {
    // Call the drive.files.list method to test the connection
    const response = await drive.files.list({ pageSize: 1, fields: 'nextPageToken, files(id, name)' });
    const files = response.data.files;
    console.log('Connection successful');
    console.log(`Number of files in folder Files: ${files.length}`);
    // If the connection was successful, the token should also be valid
    console.log('Token is valid');
  } catch (err) {
    console.error('Error testing connection:', err);
  }
}

/* Get timestamp for image name */
function get_timestamp() {
  var current_date = new Date();
  var date_time = current_date.getFullYear() + "-"
    + (current_date.getMonth() + 1) + "-"
    + current_date.getDate() + " "
    + current_date.getHours() + ":"
    + current_date.getMinutes() + ":"
    + current_date.getSeconds();
  return date_time;
}

/* Upload file to google drive */
async function upload_file(filepath, gdrive_filename) {
  try {
    var metadata = {
      name: gdrive_filename,
      parents: [google_folder_id],
    }

    var media = {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(filepath)
    }

    const response = await drive.files.create({
      resource: metadata,
      media: media
    })

    console.log(response.data);
    return response.data
  }

  catch (err) {
    console.log(err);
  }
}

/* Generate public url for uploaded file */
async function generate_public_url(file_id) {
  try {
    await drive.permissions.create({
      fileId: file_id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    const result = await drive.files.get({
      fileId: file_id,
      fields: 'webViewLink, webContentLink'
    });

    return result.data;
  }
  catch (err) {
    console.log(err);
  }
}

/* Get view link for uploaded file */
async function get_view_link(path_to_image, save_filename) {
  try {
    var file_upload_response = await upload_file(path_to_image, save_filename)
    var bless = await generate_public_url(file_upload_response.id);
    return bless.webViewLink
  }
  catch (err) {
    console.log(err);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// MiddleWare ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

// Enable CORS, NOTE: Should probably be more restrictive
app.use(cors());

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Routes ///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.send('Nothing here...to see all routes, go to /test');
})

app.get('/test', (req, res) => {
  res.send(`Routes: imageUpload (post), test (get)`);
})

/* Route to handle post request for image upload */
app.post('/upload', (req, res) => {

  var metadata = req.headers.metadata;
  var metadata = JSON.parse(metadata);
  metadata.location = JSON.parse(metadata.location);
  var {location, uuid} = metadata;

  console.log(`HIT LOG: Got a POST request with an image to upload`)
  if (isDebugMode){
    console.log(`HIT LOG: Request body`);
    console.log(metadata);
  }
    

  var set_ts = get_timestamp(); // Get timestamp for image name
  var hash = crypto.createHash('md5').update(set_ts).digest('hex');
  var save_filename = `${hash}.jpg`

  /* Set up multer storage configuration */
  var storage = multer.diskStorage({
    destination: config.image_upload_path,
    filename: (req, file, cb) => {
      cb(null, save_filename);
    }
  });

  /* Set up multer upload */
  var upload = multer({
    storage: storage
  }).single('image'); // 'image' is the name of the form field in the POST request that contains the image

  /* Save image locally */
  upload(req, res, async (err) => {
    if (err) {
      // Handle error
      console.error(err);
      return res.status(500).json({
        error: err
      });
    } else {
      // At this point in time the image is saved locally.
      // Now you can start google drive upload 
      var path_to_image = path.join(config.image_upload_path, save_filename);
      var view_link = await get_view_link(path_to_image, save_filename);

      var victim_id = uuid; /* You Get this as a query param from the pi */
      var victim_data = users.find((obj) => { return obj.uuid === victim_id; });

      victim_data["location_obj"] = location;
      victim_data["last_image"] = view_link;

      /* Send a message to the messaging service */
      if (!isDebugMode) {
        axios.post(`${messaging_service_url}/notify`, victim_data)
          .then((response) => {
            console.log(response.data);
          })
          .catch(function (error) {
            console.log("Error sending notification to messaging service");
            console.log(error);
          });
      }
      else {
        console.log("Debug mode is on, not sending notification to messaging service");
        console.log("Notification data:");
        console.log(victim_data);
      }

      return res.status(200).send("Image uploaded successfully to google drive. View link: " + view_link);
    }
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Run Server ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

app.listen(config.port, () => {
  console.log(`listing on port ${config.port}. Test it @ http://localhost:${config.port}/test`);
});
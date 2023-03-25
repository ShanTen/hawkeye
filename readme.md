# Project: HawkEye 📸

HawkEye is an IoT-based safety camera system designed to enhance user safety.  
The camera is split into two parts - a client for a Raspberry Pi and a server side with a messaging service.  
The client is responsible for capturing images and sending them to the server side, while the server side handles image storage and messaging.

## Client

The client is written in Python and is designed to run on a Raspberry Pi.  
It captures images using a connected camera and sends them to the server side for storage and analysis.  
The client is designed to run continuously, capturing and sending images in real-time.

## Server Side

The server side is written in JavaScript using Node.js and Express.  
It receives images from the client and stores them using the Google Drive API.  
The server side also includes a messaging service written in Python using Flask and PyWhatKit.  
The messaging service is responsible for sending alerts to users' selected contacts in the event of an emergency.

## Running the Project

To run the project, you will need a

* Raspberry Pi 
* USB Webcam for the Pi
* Laptop/PC connected to the same network as the pi

Install Steps: 

1. Clone the repository to your Raspberry Pi and laptop.
2. Set up the Google Drive API credentials on the server side.
3. Install the necessary Python and Node.js dependencies on both the client and server side.
4. Create config files
5. Start the client on the Raspberry Pi.
6. Start the server side on the laptop.

Once the client and server side are both running, the camera will begin capturing and sending images to the server side for storage and analysis. In the event of an emergency, the messaging service will send alerts to the user's selected contacts.

## Conclusion
This was created as a college project and most of the code was written in a time period of 1 hour and 45 mins on the day of the event.  
V1 was originally supposed to use an Arduino, Accelerometer, ESP32 Camera, GSM, GPS Module but writing the code for that was a pain so we pivoted to V2  
V2 uses a Raspberry and a WebCam (yes that's it.)

TS: 02:06 PM 25-03-2023  

PS: We somehow won first place 💀
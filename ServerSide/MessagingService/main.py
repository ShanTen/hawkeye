from flask import Flask, request
import pywhatkit
import datetime
from flask_cors import CORS, cross_origin

#Messaging Service API using Flask and PyWhatKit
def get_google_maps_link(obj):
    latitude = obj["latitude"]
    longitude = obj["longitude"]
    base_url = "https://www.google.com/maps/search/?api=1&query="
    location_string = f"{latitude},{longitude}"
    return base_url + location_string

app = Flask(__name__)
CORS(app)

@app.route('/test', methods=['GET'])
def test():
    return "API is working!"

@app.route('/notify', methods=['POST'])
def sendMessage():
    victim_data = request.get_json()
    
    location_obj = victim_data["location_obj"]
    location_url = get_google_maps_link(location_obj)
    contacts = victim_data["contacts"]

    message = f"ALERT: A PERSON CLOSE TO YOU ({victim_data['name']}) MAY HAVE BEEN INVOLVED IN AN ASSAULT AND OR AN ACCIDENT. PLEASE CHECK ON THEM AND ALERT RESPECTIVE AUTHORITIES IF NECESSARY. LOCATION: {location_url}.\nLAST IMAGE CAPTURED: {victim_data['last_image']}"

    for contact in contacts:        
        print("Sending message...")
        print(message)

        current_time=datetime.datetime.now()
        hour=current_time.hour
        minute=current_time.minute
        pywhatkit.sendwhatmsg(contact,message,hour,minute+3)
        print("Sent the message.")

    return "Message Dispatched!"

if __name__ == '__main__':
    isDebug = True
    PORT = 6969 #port should not be hardcoded but its fine

    if isDebug:
        print("Refreshing....")
    print(f"Test API @ http://localhost:{PORT}/test")
    app.run(port=PORT, debug=isDebug)
    
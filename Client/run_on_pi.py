#Code for capture.py on client (raspberry pi)
def get_image(camera):
    retval, im = camera.read()
    return im 

def show_countdown(time_in_seconds):
    for i in range(time_in_seconds, 0, -1):
        print(i)
        time.sleep(1)

def get_latitude_longitude():
    return 20.9909223,105.7965673

def main():
    # Define server IP and port 
    server_ip = "192.168.1.19"
    server_port = 3030

    camera_port = 0 
    ramp_frames = 30 
    show_countdown(3)
    camera = cv2.VideoCapture(camera_port)

    for i in range(ramp_frames):
        _ = camera.read()

    camera_capture = get_image(camera)
    filename = "capture.jpg"
    cv2.imwrite(filename,camera_capture)
    del(camera)

    #This is the unique identifier for the client. 
    # This is used to identify the client in the database 
    #Should be moved to a config file 
    uuid = "a77e6952-86fc-46f9-9af1-35c1d1fb6a8b" 
    
    latitude, longitude = get_latitude_longitude()

    location = json.dumps({"latitude": latitude,"longitude": longitude})
    image_metadata = {"uuid": uuid, "location": location}

    form_data = {
        'image': ('image.jpg', open(filename, "rb"))
    }
    
    header_data = {
        'metadata': json.dumps(image_metadata)
    }

    # Define HTTP POST request options
    url = f'http://{server_ip}:{server_port}/upload'

    print("Sending image to server...")
    response = requests.post(url, files=form_data, headers=header_data)
    print(f"SERVER RESPONSE: {response.text}")

if __name__ == "__main__":
    import cv2
    import json
    import time
    import requests
    main()
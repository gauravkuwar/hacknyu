from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# unique identifier for drives that use this app
# stored in the drive_uid file
drive_uid = "ccf629d7-c79b-4bf8-8a45-68c904ab3a82"

@app.route('/')
def health_check():
    return 'OK', 200

@app.route('/api/login', methods=['POST'])
def login():
    # Get username and password from request
    username = request.json.get('username')
    password = request.json.get('password')
    
    # Simple hardcoded check (for demonstration purposes)
    if username == 'admin' and password == 'password':        
        return {"message": "OK"}, 200
    else:
        return {"message": "Invalid credentials"}, 401

@app.route('/api/upload', methods=['POST'])
def upload():
    file = request.files['file']
    filename = file.filename
    file.save(filename)
    return jsonify({"message": "File uploaded successfully"}), 200

@app.route('/api/download', methods=['GET'])
def download():
    filename = request.args.get('filename')
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/delete', methods=['DELETE'])
def delete():
    filename = request.args.get('filename')
    os.remove(filename)
    return jsonify({"message": "File deleted successfully"}), 200

@app.route('/api/files', methods=['GET'])
def get_files():
    files = ["file1.txt", "file2.txt", "file3.txt"]
    return jsonify({"files": files}), 200

@app.route('/api/drives', methods=['GET', 'POST'])
def drives():
    compatible_drives = []

    if request.method == 'GET':
        path_to_drives = "/Volumes/"
        drives = os.listdir(path_to_drives)
        for drive in drives:
            if drive == "Macintosh HD":
                continue
            
            files = os.listdir(f"{path_to_drives}/{drive}")
            if "drive_uid" in files:
                with open(f"{path_to_drives}/{drive}/drive_uid", "r") as f:
                    cur_drive_uid = f.read()
                    if cur_drive_uid == drive_uid:
                        compatible_drives.append(drive)

        return jsonify({"drives": compatible_drives}), 200
    elif request.method == 'POST':
        path_to_drive = request.json.get('drive')
        if path_to_drive == "/Volumes/Macintosh HD":
            return jsonify({"message": "Invalid drive"}), 400
        
        with open(os.path.join(path_to_drive, "drive_uid"), "w") as f:
            f.write(drive_uid)
        return jsonify({"message": "Drive added successfully"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)

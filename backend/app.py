from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import hashlib
import shutil
import secrets
from sympy import isprime
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os


# cryptography helper functions
def hash(input_string):
    # Create a SHA-256 hash of the input string
    sha_hash = hashlib.sha256(input_string.encode()).hexdigest()
    # Convert the hexadecimal hash to an integer
    return int(sha_hash, 16)

def generate_large_random_number(bits=128):
    # Generate a random number with the specified bit length
    return secrets.randbits(bits)

def generate_large_prime(bits=2048):
    while True:
        # Generate a random number with the specified bit length
        candidate = secrets.randbits(bits)
        # Ensure it's odd (except for 2, all primes are odd)
        candidate |= 1
        # Check if it's prime
        if isprime(candidate):
            return candidate

def fast_mod_exp(x, h, N):
    return pow(x, h, N)


# File encryption helper functions
# Generate a 256-bit integer key
def generate_key():
    # Generate 32 random bytes (256 bits) and convert to integer
    key_bytes = os.urandom(32)
    return int.from_bytes(key_bytes, byteorder='big')

# Encrypt a file using an integer key
def encrypt_file(input_file, output_file, key_int):
    # Convert the integer key back to bytes (32 bytes for AES-256)
    key = key_int.to_bytes(32, byteorder='big')

    # Generate a random initialization vector (IV)
    iv = os.urandom(16)  # 16 bytes for AES block size

    # Create AES cipher in GCM mode
    cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    # Read the input file
    with open(input_file, 'rb') as f:
        plaintext = f.read()

    # Encrypt the data
    ciphertext = encryptor.update(plaintext) + encryptor.finalize()

    # Write the IV, authentication tag, and ciphertext to the output file
    with open(output_file, 'wb') as f:
        f.write(iv + encryptor.tag + ciphertext)

# Decrypt a file using an integer key
def decrypt_file(input_file, output_file, key_int):
    # Convert the integer key back to bytes (32 bytes for AES-256)
    key = key_int.to_bytes(32, byteorder='big')

    # Read the encrypted file
    with open(input_file, 'rb') as f:
        data = f.read()

    # Extract IV, tag, and ciphertext
    iv = data[:16]  # First 16 bytes are IV
    tag = data[16:32]  # Next 16 bytes are the tag
    ciphertext = data[32:]  # Rest is the ciphertext

    # Create AES cipher in GCM mode
    cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend())
    decryptor = cipher.decryptor()

    # Decrypt the data
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()

    # Write the decrypted data to the output file
    with open(output_file, 'wb') as f:
        f.write(plaintext)

app = Flask(__name__)
CORS(app)

# unique identifier for drives that use this app
# stored in the drive_uid file
drive_uid = "ccf629d7-c79b-4bf8-8a45-68c904ab3a82"

# example drive_to_vars
drive_to_vars = {}

@app.route('/')
def health_check():
    return 'OK', 200

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify({"usernames": ["user1", "user2", "user3"]}), 200

@app.route('/api/login', methods=['POST'])
def login():
    # Get username and password from request
    username = request.json.get('username')
    password = request.json.get('password')
    drive = request.json.get('drive')
    h = hash(username + password)
    drive_to_vars[drive]["users"][username] = h

    # Simple hardcoded check (for demonstration purposes)
    if username in drive_to_vars[drive]["users"]:       
        return {"message": "OK"}, 200
    else:
        return {"message": "Invalid credentials"}, 401
    
@app.route('/api/createaccount', methods=['POST'])
def create_account():
    username = request.json.get('username')
    password = request.json.get('password')
    drive = request.json.get('drive')

    drive_to_vars[drive]["users"][username] = ""
    x = drive_to_vars[drive]["x"]
    N = drive_to_vars[drive]["N"]
    hi = hash(username + password)
    yi = fast_mod_exp(x, hi, N)
    drive_to_vars[drive]["y"].append(yi)
    drive_to_vars[drive]["acl"][username] = {
        "owner": [[], generate_key()]
    }

    for user in drive_to_vars[drive]["users"]:
        if user == username:
            continue

        drive_to_vars[drive]["acl"][username][user] = [[], generate_key()]
        drive_to_vars[drive]["acl"][user][username] = [[], generate_key()]

    with open(f"/Volumes/{drive}/drive_data.json", "w") as f:
        f.write(json.dumps(drive_to_vars[drive]))

    return jsonify({"message": "Account created successfully"}), 200
    

@app.route('/api/upload', methods=['POST'])
def upload():
    username = request.form.get('username')
    drive = request.form.get('drive')

    file = request.files['file']
    filename = file.filename
    file.save(f"tmp/{filename}")
    master_key = drive_to_vars[drive]["acl"][username]["owner"][1]
    encrypt_file(f"tmp/{filename}", f"tmp/{filename}.enc", master_key)
    os.remove(f"tmp/{filename}")
    shutil.move(f"tmp/{filename}.enc", f"/Volumes/{drive}/{filename}.enc")

    drive_to_vars[drive]["acl"][username]["owner"][0].append(filename)
    return jsonify({"message": "File uploaded successfully"}), 200

@app.route('/api/download', methods=['GET'])
def download():
    filename = request.args.get('filename')
    drive = request.args.get('drive')
    username = request.args.get('username')

    master_key = drive_to_vars[drive]["acl"][username]["owner"][1]
    decrypt_file(f"/Volumes/{drive}/{filename}.enc", f"tmp/{filename}", master_key)
    return send_from_directory("tmp/", filename)

@app.route('/api/delete', methods=['DELETE'])
def delete():
    filename = request.args.get('filename')
    os.remove(filename)
    return jsonify({"message": "File deleted successfully"}), 200

@app.route('/api/files', methods=['GET'])
def get_files():
    username = request.args.get('username')
    drive = request.args.get('drive')
    files = list(drive_to_vars[drive]["acl"][username]["owner"][0])
    return jsonify({"files": files}), 200

@app.route('/api/drives', methods=['GET', 'POST'])
def drives():
    if request.method == 'GET':
        path_to_drives = "/Volumes/"
        drives = os.listdir(path_to_drives)
        for drive in drives:
            if drive == "Macintosh HD":
                continue
            
            files = os.listdir(f"{path_to_drives}/{drive}")
            if "drive_data.json" in files:
                with open(f"{path_to_drives}/{drive}/drive_data.json", "r") as f:
                    cur_drive_data = json.loads(f.read())
                    if cur_drive_data["drive_uid"] == drive_uid:
                        drive_to_vars[drive] = cur_drive_data
        
        return jsonify({"drives": list(drive_to_vars.keys())}), 200
    
    elif request.method == 'POST':
        path_to_drive = request.json.get('drive')
        if path_to_drive == "/Volumes/Macintosh HD":
            return jsonify({"message": "Invalid drive"}), 400
        
        with open(os.path.join(path_to_drive, "drive_data.json"), "w") as f:
            new_data = {
                "drive_uid": drive_uid,
                "N": generate_large_prime(),
                "x": generate_large_random_number(),
                "y": [],
                "users": {},
                "acl": {},
            }
            f.write(json.dumps(new_data))
        return jsonify({"message": "Drive added successfully"}), 200
    
@app.route('/api/giveaccess', methods=['POST'])
def give_access():
    username = request.json.get('username')
    filename = request.json.get('filename')
    return jsonify({"message": "Access granted successfully"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)

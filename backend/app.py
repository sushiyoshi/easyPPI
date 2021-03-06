from flask import Flask
from flask import request, make_response, jsonify,url_for,send_file
import xml_to_json
import json
from werkzeug.utils import secure_filename
from flask_cors import CORS
import io
import uuid

app = Flask(__name__)
ALLOWED_EXTENSIONS = set(['json'])
CORS(app) #Cross Origin Resource Sharing
def allwed_file(filename):
    # .があるかどうかのチェックと、拡張子の確認
    # OKなら１、だめなら0
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def error_obj(error_id,error_message):
    obj = {
        "state":-1,
        "elem":{
            "error_id":error_id,
            "error_message":error_message
        }
    }
    return obj

@app.route("/", methods=['GET'])
def index():
    return "graph tool server"

@app.route("/protein_id",methods=['POST'])
def protein_id():
    try:
        if request.method == 'POST':
            req = request.get_json()
            #アクセッション番号
            target = req['target']
            #深さ
            depth = req['depth']
            #オプション
            option = req['option']
            print(target,depth,option)
            elements = xml_to_json.xmlTojson_fileoutput(target,int(depth),option)
            if elements == -1:
                error_text = error_obj(2,"Invalid ID")
                return make_response(jsonify(error_text))
            return make_response(jsonify({"elem":elements,"state":0}))
    except Exception as e:
        error_text = error_obj(0,str(e))
        return make_response(jsonify(error_text))

@app.route("/file_mode",methods=['POST'])
def file_mode():
    try:
    #アップロードしたjsonファイルからグラフを生成する場合は、POST
        if request.method == 'POST':
            depth = request.form.get("depth")
            file = request.files['file']
            if file.filename == '':
                error_text = error_obj(2,"file_unspecified")
                return make_response(jsonify(error_text))
            if file and allwed_file(file.filename):
                filename = secure_filename(file.filename)
                #fileはFileSrage型なので、readしてjsonに変換
                json_file = json.dumps(json.loads(file.read()))
                depth = int(depth)
                print(json_file)
                print(depth)
                if depth != 0:
                    json_file = xml_to_json.xmlTojson_inp_json(json_file,depth)
                elements = json_file
                #print(elements[filename])
                return make_response(jsonify({"elem":elements,"state":0}))
            else:
                error_text = error_obj(2,"file_unspecified")
                return make_response(jsonify(error_text))
        else:
            error_text = error_obj(2,"error")
            return make_response(jsonify(error_text))
    except Exception as e:
        error_text = error_obj(1,str(e))
        return make_response(jsonify(error_text))
@app.route("/deeper_mode",methods=['POST'])
def deeper_mode():
    try:
    #アップロードしたjsonファイルからグラフを生成する場合は、POST
        if request.method == 'POST':
            #protein_name = request.form.get("protein_name")
            req = request.get_json()
            elem = req['file']
            protein_id = req['protein_id']
            option = req['option']
            ref = req['ref']
            # x = int(req['x'])
            # y = int(req['y'])
            # re = xml_to_json.xmlTojson_deep(elem,protein_id,x,y)
            re = xml_to_json.xmlTojson_deep(elem,protein_id,option)
            print(re)
            return make_response(jsonify({"elem":json.dumps(re[0],ensure_ascii=True),"protein_list":re[1],"state":0,"ref":ref}))
    except Exception as e:
        error_text = error_obj(1,str(e))
        return make_response(jsonify(error_text))

@app.route("/getLength",methods=['GET'])
def getLength():
    try:
        if request.method == 'GET':
            #protein_name = request.form.get("protein_name")
            #アクセッション番号
            target = request.args.get('target', '')
            ref = request.args.get('ref', '')
            re = xml_to_json.getNodeLength(target)
            return make_response(jsonify({"elem":re,"state":0,"target":target,"ref":ref}))
    except Exception as e:
        error_text = error_obj(1,str(e))
        return make_response(jsonify(error_text))

if __name__ == "__main__":
    app.run(debug=True)

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

@app.route("/protein_id",methods=['GET'])
def protein_id():
    try:
        #アクセッション番号
        target = request.args.get('target', '')
        #深さ
        depth = request.args.get('depth', '')
        print(target,depth)
        elements = xml_to_json.xmlTojson_fileoutput(target,int(depth))
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
            error_text = error_obj(2,abort(400))
            return make_response(jsonify(error_text))
    except Exception as e:
        error_text = error_obj(1,str(e))
        return make_response(jsonify(error_text))


# @app.route('/download',methods=['POST'])
# def donwload():
#     #print(request.headers)
#     #print(request.get_json())
#     #print(request.get_data())
#     #print(request.get_json())
#     #print(type(request.get_data()))
#     #return "Success"
#     try:
#         if request.method == 'POST':
#             file = request.get_json()
#             if file:
#                 file = json.dumps(file)
#                 #ファイルをサーバ内に残さないために、インメモリでjsonファイルの内容を展開
#                 mem = io.BytesIO()
#                 mem.write( file.encode('utf-8'))
#                 mem.seek(0)
#                 #ユーザーに処理したjsonファイルを送信する
#                 fileid = str(uuid.uuid4())[-6:]
#                 filename = fileid + '.json'
#                 return send_file( mem, mimetype='application/json', as_attachment=True, attachment_filename=filename,)
#             else:
#                 return 'This file may have been invalidated because the timeout period has elapsed.'
#     except Exception as e:
#         return str(e)
if __name__ == "__main__":
    app.run(debug=True)
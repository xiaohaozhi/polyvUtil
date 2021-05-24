
const fs = require('fs');

var location = true;
var Module = {};

function setbyte(t, e) {
    var i = t.length * 1;
    var n = e.exports.j.apply(null, [i]);
    var R = new Uint8Array(wasmMemory.buffer, n, i);
    R.set(t);
    return R
}

function Read_CString(ptr) {
    var data = "";
    while (1){
        var t = new Uint8Array(wasmMemory.buffer, ptr, 1)[0];
        if (t === 0){
            return data
        }else {
            data += String.fromCharCode(t);
            ptr += 1
        }
    }
}

var __fun = function(){};

function _emscripten_run_script_int(ptr) {
    var jscode = Read_CString(ptr);
    return eval(jscode)
}

var wasmMemory = new WebAssembly.Memory({
    initial: 1024,
    maximum: 1024
});

var wasmTable = new WebAssembly.Table({
    initial: 4,
    maximum: 4,
    element: "anyfunc"
});

var importObject = {
    'a': {
        a: _emscripten_run_script_int,
        b: __fun,
        c: __fun,
        d: __fun,
        memory: wasmMemory,
        table: wasmTable
    }
};

var wasmobject = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array(fs.readFileSync('v1102.wasm'))), importObject);

function decrypt(token, key, iv, seedconst, path) {
    Module[token] = token.length;
    token = new Uint8Array(new Buffer.from(token, 'utf8'));
    key = new Uint8Array(new Buffer.from(key, 'hex'));
    iv = new Uint8Array(new Buffer.from(iv, 'hex'));
    seedconst = parseInt(seedconst);
    var ts = new Uint8Array(fs.readFileSync(path));
    var wasmtoken = setbyte(token, wasmobject);
    var wasmkey = setbyte(key, wasmobject);
    var wasmts = setbyte(ts, wasmobject);
    var wasmiv = setbyte(iv, wasmobject);
    var outptr = wasmobject.exports.f.apply(null, [wasmts.byteOffset, wasmiv.byteOffset, wasmts.length, wasmkey.byteOffset, wasmkey.length, seedconst, wasmtoken.byteOffset, wasmtoken.length]);
    var outbuff = new Uint8Array(wasmMemory.buffer, outptr , wasmts.length);
    fs.writeFileSync(path, outbuff);
}

decrypt(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6]);
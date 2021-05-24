
const fs = require('fs');
let wasmfilename = 'v1102.wasm';

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

var wasmobject = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array(fs.readFileSync(wasmfilename))), importObject);

var token = '120482';
Module[token] = token.length;
token = new Uint8Array(new Buffer.from(token, 'utf8'));
var key = new Uint8Array([40, 145, 38, 3, 225, 41, 201, 166, 235, 156, 29, 189, 75, 235, 108, 241, 217, 254, 196, 140, 97, 45, 5, 248, 227, 82, 192, 195, 93, 123, 248, 216]);
var iv = new Uint8Array([247, 163, 249, 36, 46, 50, 85, 183, 172, 158, 25, 145, 112, 203, 43, 25]);
var ts = new Uint8Array(fs.readFileSync('v11_1.ts'));

var wasmtoken = setbyte(token, wasmobject);
var wasmkey = setbyte(key, wasmobject);
var wasmts = setbyte(ts, wasmobject);
var wasmiv = setbyte(iv, wasmobject);
var outptr = wasmobject.exports.f.apply(null, [wasmts.byteOffset, wasmiv.byteOffset, wasmts.length, wasmkey.byteOffset, wasmkey.length, 143, wasmtoken.byteOffset, wasmtoken.length]);
var outbuff = new Uint8Array(wasmMemory.buffer, outptr , wasmts.length);
fs.writeFileSync('v11_2.ts', outbuff);
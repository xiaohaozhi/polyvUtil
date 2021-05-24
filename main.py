
import requests
import json
import base64
import hashlib
import m3u8
import shutil
import os
import logging
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

logging.basicConfig(level=logging.DEBUG)

def main():
    downloadpath = './temp/'
    if os.path.exists(downloadpath):
        shutil.rmtree(downloadpath)
    os.makedirs(downloadpath)
    vid = '9b52ce99c4d51214b63dfb4166fddddc'  # 设置自己的vid与token
    token = ''
    if '_' in vid:
        vid = vid.split('_')[0] + '_' + vid[0]
    else:
        vid = vid + '_' + vid[0]
    url = 'https://player.polyv.net/secure/' + vid + '.json'
    response = requests.get(url).json()
    keyiv = hashlib.md5(vid.encode()).hexdigest()
    cryptor = AES.new(key=keyiv[:16].encode(), mode=AES.MODE_CBC, iv=keyiv[16:].encode())
    response = json.loads(base64.b64decode(cryptor.decrypt(bytes.fromhex(response['body']))).decode())
    m3u8url = response['hls'][-1]
    title = response['title']
    logging.info('获取标题： '+title)
    logging.info('获取m3u8地址： '+m3u8url)
    seedconst = str(response['seed_const'])
    m3u8text = requests.get(m3u8url).text
    m3u8_obj = m3u8.loads(m3u8text)
    iv = m3u8_obj.data['segments'][0]['key']['iv'][2:]
    keyurl = m3u8_obj.data['segments'][0]['key']['uri']
    DRMversion = 'v0'
    token_keyurl = keyurl.split('/')
    token_keyurl.insert(3, 'playsafe')
    token_keyurl = '/'.join(token_keyurl) + '?token=' + token
    enc_key = requests.get(token_keyurl).content
    if not enc_key:
        DRMversion = 'v1102'
        token_keyurl = keyurl.split('/')
        token_keyurl.insert(3, 'playsafe/v1102')
        token_keyurl = '/'.join(token_keyurl) + '?token=' + token
        enc_key = requests.get(token_keyurl).content
        if not enc_key:
            logging.error('token失效')
            return

    logging.info('DRMversion： ' + DRMversion)

    for index, ts_obj in enumerate(m3u8_obj.data['segments']):
        tsurl = ts_obj['uri']
        tsname = str(index).zfill(5)+'.ts'
        ts = requests.get(tsurl).content
        if DRMversion == 'v0':
            cryptor = AES.new(key=hashlib.md5(seedconst.encode()).hexdigest()[:16].encode(), mode=AES.MODE_CBC, iv=bytes([1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 7, 5, 3, 2, 1]))
            ts = AES.new(key=unpad(cryptor.decrypt(enc_key), AES.block_size), mode=AES.MODE_CBC, iv=bytes.fromhex(iv)).decrypt(ts)
            with open(downloadpath+tsname, 'wb') as f:
                f.write(ts)
        elif DRMversion == 'v1102':
            entoken = token.split('-')[-1]
            detoken = entoken if len(entoken) == 34 else ''.join(['abcdofghijklnmepqrstuvwxyz0123456789'['lpmkenjibhuvgycftxdrzsoawq0126783459'.index(each)] if each in 'lpmkenjibhuvgycftxdrzsoawq0126783459' else each for each in entoken[1:]])
            with open(downloadpath + tsname, 'wb') as f:
                f.write(ts)
            os.system('node v1102 ' + detoken + ' ' + enc_key.hex() + ' ' + iv + ' ' + seedconst + ' "' + downloadpath + tsname + '"')


if __name__ == '__main__':
    main()
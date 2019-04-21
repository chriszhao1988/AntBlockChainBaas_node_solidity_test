const Chain = require("@alipay/mychain/index.node"); //在 node 环境使用 TLS 协议
const solc = require('@alipay/solc');
const fs = require("fs");
const path = require("path");
const createKeccakHash = require('keccak');

const log4js = require('log4js');
log4js.configure({
    appenders: {
        default:
            { type: 'file', filename: path.join(__dirname, '../logs/test.log'), category: 'test' }
    },
    categories: {
        default: { appenders: ['default'], level: 'debug' }
    }
});
const logger = log4js.getLogger('poc');

// 体验链 参数
const accountKey = fs.readFileSync("./certs/user.pem", {encoding: "utf8"});
const accountPassword = "123456";
const passphrase = "1alictY7p3Vg"; //需要替换为自定义的 client.key 密码

const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
const keyInfo = Chain.utils.getKeyInfo(accountKey, accountPassword);
//可打印私钥和公钥，使用 16 进制
console.log('private key:', keyInfo.privateKey.toString('hex'));
console.log('public key:', keyInfo.publicKey.toString('hex'));

const AccountName = "qwBlockChain";
let opt = {
    host: '47.102.108.6',    //目标区块链网络节点的 IP
    port: 18130,          //端口号
    timeout: 30000,       //连接超时时间配置
    cert: fs.readFileSync("./certs/client.crt", {encoding: "utf8"}),
    ca: fs.readFileSync("./certs/ca.crt", {encoding: "utf8"}),
    key: fs.readFileSync("./certs/client.key", {encoding: "utf8"}),
    userPublicKey: keyInfo.publicKey,
    userPrivateKey: keyInfo.privateKey,
    userRecoverPublicKey: keyInfo.publicKey,
    userRecoverPrivateKey: keyInfo.privateKey,
    passphrase: passphrase
};

const chain = Chain(opt);

/**
 *@desc     这里是手动完成编译的方法 POC档案夹内执行  solcjs --bin --abi ./chaincode/*.sol --output-dir ./chaincode/bin
 *@author Chris.Zhao
 *@date 2019/4/8
 */
const abi = JSON.parse(fs.readFileSync(path.join(__dirname, "../chaincode/bin/__chaincode_testchaincode_sol_Main.abi"), { encoding: 'ascii' }));
const bytecode = fs.readFileSync(path.join(__dirname, "../chaincode/bin/__chaincode_testchaincode_sol_Main.bin"), { encoding: 'ascii' });

// 带上时间戳，防止合约名计算哈希后已存在
const contractName = 'contract' + Date.now();
// 初始化一个合约实例
let myContract = chain.ctr.contract(contractName, abi);

console.log("contractName:", contractName);

let init = () => new Promise((resolve, reject) => {
    myContract.new(bytecode, {
        from: AccountName,
    }, (err, contract, data) => {
        if (err) {
            return reject(err);
        }
        resolve();
    })
});

/**
 *@desc nonce参数每次不同 以防止蚂蚁方面误认为攻击而拒绝
 *@author Chris.Zhao
 *@date 2019/4/8
 */
let setObj = (numA,strB) => new Promise((resolve, reject) => {
    myContract.setObj(numA,strB, {
        from: AccountName,
        nonce: Math.random() * 10000000
    }, (err, output, data) => {
        if (err) {
            return reject(err);
        }
        console.dir(output);

        resolve();
    })
});

let getObj = (numA) => new Promise((resolve,reject)=>{
    myContract.getObj(numA, {
        from: AccountName,
        nonce: Math.random() * 10000000
    }, (err, output, data) => {
        if (err) {
            return reject(err);
        }
        console.dir(output);

        resolve(output);
    })
});

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

(async (cb)=>{

    try{
        await init();

        myContract.LOGEVENT((err, output, data) => {
            logger.debug(contractName + ":" + output.join("\n"));
        });

        let arr = [];
        console.time("test1");

        for(let i =1;i<=10;i++){
            await setObj(i,"test"+i);
            arr.push(await getObj(i));

        }

        console.dir(arr);
        console.timeEnd("test1");

        return cb(true);

    }catch(e){
        console.error(e);
        return cb(false);
    }

})((b)=>{
    if(b) return "ALL COMPLETE!";
    return "ERROR!";
});
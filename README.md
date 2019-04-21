##

```$xslt
蚂蚁baas 相关文档:https://tech.antfin.com/docs/2/73763
```

#### 使用说明

-   修改solidity编写的chaincode之后的编译动作

```$xslt
    cd chaincode 
    solcjs --bin --abi ./chaincode/*.sol --output-dir ./chaincode/bin
    // 这步操作可能比较费时
```   

-   编写并执行测试js

```$xslt
    node ./src/test.js
```

#### 可能遇到的问题
- solc 未找到指令

```
    npm i -g ./ali_libs/alipay-solc-0.1.12.tgz    
    
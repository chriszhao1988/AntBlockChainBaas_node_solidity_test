pragma solidity ^0.4.20;
pragma experimental ABIEncoderV2;


contract Main {
    mapping(uint=>string) tobj;
    function Main(uint numA,string strB){
        tobj[numA] = strB;
    }

    event LOGEVENT (string topic, string func, string output);

    function setObj(uint numA,string strB) returns (string res){
        tobj[numA] = strB;
        emit LOGEVENT("log", "setObj" , "complete");
        return "complete!";
    }

    function getObj(uint numA) returns (string res){
        emit LOGEVENT("log", "getObj" , tobj[numA]);
        return tobj[numA];
    }

    function delObj(uint numA) returns (string res){
        emit LOGEVENT("log", "delObj" , "complete");
        delete tobj[numA];
        return "complete!";
    }
}
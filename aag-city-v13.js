(function(){
var canvas=document.getElementById('c');
var ctx=canvas.getContext('2d');
var root=document.getElementById('game-root');
var cityCanvas=null;
var VW=360,VH=640,DPR=1;
var WORLD_W=2100,WORLD_H=1500,PAD=36,DOOR=22,INFL=6;
var keys={},hold={up:0,down:0,left:0,right:0};
var player={x:300,y:96,dir:'down',gender:'male',bob:0,yaw:0,speed:0};
var cam={x:300,y:-40,yaw:0,dist:200,h:70};
var state={email:'',gender:null,rep:40,mi:0,si:0,done:0,x:300,y:96,carry:'',diary:[],timerKey:'',left:0};
(function(){
var canvas=document.getElementById('c');
var ctx=canvas.getContext('2d');
var root=document.getElementById('game-root');
var cityCanvas=null;
var VW=360,VH=640,DPR=1;
var WORLD_W=1680,WORLD_H=1580,RW=96,PAD=26;
var vRoads=[40,520,1000,1480];
var hRoads=[40,500,960,1420];
var keys={},hold={up:0,down:0,left:0,right:0};
var player={x:240,y:88,dir:'down',gender:'male',bob:0};
var cam={x:0,y:0};
var state={email:'',gender:null,rep:40,mi:0,si:0,done:0,x:240,y:88,carry:''};
var playing=false,modalOpen=false,shake=0,toastT=0;
var solids=[],pois=[],parks=[];
var MISSIONS=[
{id:'brief',title:'First Brief',steps:[
{poi:'office',verb:'Take the file',got:'Client file',brief:'Walk to the law firm. The file is at reception.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',
ctype:'BAIL APPLICATION  -  PAPERS NOT READY',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-014',
status:'Incomplete. FIR is not in the file.',
client:'Ramesh Kumar, age 34, mechanic, Workshop Road',
opp:'State',
forum:'Sessions Court. Nothing filed yet.',
ps:'North Gate police station, as the family says. Not confirmed on paper.',
next:'No date. The family wants a hearing today.',
law:'Bail. Copy sections from the FIR only. Do not guess a section.',
papers:'1. Vakalatnama, signed this morning\n2. Client phone, not yet written on the cover\n3. FIR copy - missing\n4. Custody note - missing\n5. Surety papers - missing',
facts:'The family came this morning. They say police picked him up last night from the workshop. They want bail today. The brief has no FIR, no custody memo, and no surety paper.',
job:'Collect the physical file from reception. Check the vakalatnama is signed. Write the client phone on the cover before you leave.',
caution:'A signed vakalatnama is not a bail order. Do not tell the family a result.'}},
{poi:'police',verb:'Note the FIR',got:'FIR copy',brief:'Go to the police station. Note the FIR. Do not argue.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',
ctype:'BAIL APPLICATION  -  FIR STILL TO BE NOTED',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-014',
status:'File is with you. FIR particulars are blank.',
client:'Ramesh Kumar, age 34, mechanic',
opp:'State',
forum:'Sessions Court. Still not filed.',
ps:'North Gate police station. Confirm the name on the FIR itself.',
next:'No date until the papers are complete.',
law:'Read the FIR before any advice. The family story is not the charge.',
papers:'1. Vakalatnama - in this file\n2. Blank cover note for FIR number, date, station, sections\n3. FIR copy - to collect at the counter\n4. Surety papers - still missing',
facts:'The family story is a workshop theft. Until the FIR is in hand, that story is only what they remember.',
job:'Ask for the FIR copy. On the cover, write the FIR number, date, police station, and the sections. If a section is unclear, ask the reader to point to the line.',
caution:'If the sections and the family story do not match, the family story loses. Do not argue at the station.'}},
{poi:'office',verb:'Report to the senior',got:'',brief:'Back to the firm. Hand the FIR to the senior. Then stop.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',
ctype:'BAIL APPLICATION  -  FOR THE SENIOR',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-014',
status:'FIR copy is in hand. Senior has not seen it.',
client:'Ramesh Kumar',
opp:'State',
forum:'AAG Law Firm, senior table',
ps:'As written on the FIR cover. Do not change it from memory.',
next:'Senior will say if a draft is even possible today.',
law:'The senior sees the sections before anyone calls the family.',
papers:'1. Vakalatnama\n2. FIR copy, particulars on the cover\n3. Your one-line note of the time you reached the station\n4. Surety papers - still missing',
facts:'You now have the FIR copy. The senior has not seen it. The family is waiting on the phone.',
job:'Hand the FIR to the senior. Say the sections once. Stop. Write the time you returned, on the file, not in a chat.',
caution:'Do not promise bail on the phone while you are still in the corridor.'}}
]},
{id:'bail',title:'Bail Papers',steps:[
{poi:'client',verb:'List the surety',got:'Surety list',brief:'Go to the client house. Write who can stand surety today.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',
ctype:'BAIL APPLICATION  -  SURETY INSTRUCTIONS',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-014',
status:'FIR is in. Surety is only a conversation.',
client:'Ramesh Kumar, through his uncle Suresh, at the family house',
opp:'State',
forum:'Sessions Court. Draft not started.',
ps:'North Gate police station, as noted from the FIR.',
next:'No hearing date. Papers are not filed.',
law:'A surety is a person the court can proceed against if the accused does not appear.',
papers:'1. FIR copy\n2. Vakalatnama\n3. Surety list - to be written at the house\n4. Property paper - ask what they can actually show today',
facts:'The uncle says he owns a house. The papers are not in the brief. The family still thinks a relative standing in court is enough.',
job:'At the house, write who will stand as surety, which document they can show today, and what is missing. Do not draft an affidavit from memory.',
caution:'No property paper, no surety paragraph. A promise at the kitchen table is not a document.'}},
{poi:'chamber',verb:'Get the draft checked',got:'Checked draft',brief:'Chambers. Read the grounds. Take corrections on the paper.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',
ctype:'BAIL APPLICATION  -  GROUNDS FOR CHECK',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-014',
status:'Surety list is in. Draft is not settled.',
client:'Ramesh Kumar',
opp:'State',
forum:'Senior chambers',
ps:'North Gate police station',
next:'Filing only after the senior marks the draft.',
law:'Every ground must be something you can point to in the FIR or in the instructions.',
papers:'1. FIR, with sections noted\n2. Surety list from the house\n3. Draft grounds - pencil, not final\n4. Note of what you will not argue',
facts:'You have a surety list and the FIR sections. The draft is not settled until the senior marks it.',
job:'Read the grounds aloud. Take the corrections on the draft itself. Do not add a new ground in the corridor afterwards.',
caution:'A ground you cannot point to in the FIR does not go in the petition.'}},
{poi:'court',verb:'File and take diary no.',got:'Diary number',brief:'District court filing counter. No diary number means it is not filed.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',
ctype:'BAIL APPLICATION  -  FILING SET',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-014',
status:'Set is in the bag. Not filed.',
client:'Ramesh Kumar',
opp:'State',
forum:'District court filing counter',
ps:'North Gate police station',
next:'Diary number and date, to be written before you leave the campus.',
law:'Stamps, index, page numbers, then the diary number. A set in the bag is not a filing.',
papers:'1. Index\n2. Petition, senior marks on it\n3. FIR copy\n4. Vakalatnama\n5. Surety papers that you actually have\n6. Stamp paper as the clerk asked',
facts:'The set is ready for the counter. It is not filed until the counter gives a number.',
job:'Check stamps, index, and page numbers. File it. Write the diary number and the date on the file cover before you leave the campus.',
caution:'No diary number, no file note that says filed.'}}
]},
{id:'cheque',title:'Cheque Bounce',steps:[
{poi:'client',verb:'Fix the dates',got:'Date sheet',brief:'Client house. Read only the dates already marked. Do not invent one.',file:{
court:'IN THE COURT OF THE JUDICIAL MAGISTRATE',
ctype:'COMPLAINT UNDER SECTION 138, NEGOTIABLE INSTRUMENTS ACT, 1881',
cause:'Asha Jain, Meera Textiles\nversus\nNitin Goyal',
no:'AAG-2026-031',
status:'Notice is in. Reply date is the one on the cover.',
client:'Asha Jain, proprietor, Meera Textiles',
opp:'Nitin Goyal, buyer, the person who signed the cheque',
forum:'Magistrate court, later. Reply is still a draft.',
ps:'Not a police file. Bank return memo is the paper that matters today.',
next:'The senior has marked the reply date on the cover. Use that date.',
law:'Section 138, Negotiable Instruments Act, 1881. Use the dates already marked. Do not invent a new last date.',
papers:'1. Cheque, Rs 2,40,000, dated 2 March 2026\n2. Bank return memo, funds insufficient\n3. Legal notice, received 18 March 2026\n4. Cover note with the reply date already marked\n5. Date sheet - to be written in one list, from those papers only',
facts:'Cheque of Rs 2,40,000 dated 2 March 2026, returned funds insufficient. Legal notice received 18 March 2026. The senior has marked the reply date on the cover.',
job:'Sit with the client and read only the dates: cheque, return memo, notice received, reply date on the cover. Write them again in one list.',
caution:'If the client wants a new date because of travel, the marked date still stands until the senior changes it.'}},
{poi:'office',verb:'Draft the reply',got:'Reply draft',brief:'Back at the firm. Draft the reply from the date sheet only.',file:{
court:'IN THE COURT OF THE JUDICIAL MAGISTRATE',
ctype:'REPLY TO NOTICE  -  SECTION 138',
cause:'Asha Jain, Meera Textiles\nversus\nNitin Goyal',
no:'AAG-2026-031',
status:'Date sheet is in. Reply is not sent.',
client:'Asha Jain, Meera Textiles',
opp:'Nitin Goyal',
forum:'AAG Law Firm, draft only',
ps:'Not applicable. This is a cheque file.',
next:'Reply date as marked on the cover.',
law:'The reply can dispute the cheque and still leave settlement open. Do not admit more than the client said.',
papers:'1. Date sheet\n2. Cheque copy\n3. Return memo\n4. Notice\n5. Reply draft - not signed, gaps marked in pencil',
facts:'The date sheet is in the file. The reply is not sent. Settlement is still possible. The draft must not admit more than the client has said.',
job:'Draft the reply at the firm from the date sheet and the client instructions. Mark anything you are unsure of, instead of filling the gap.',
caution:'Do not write that the full amount is admitted unless the client said that, in those words.'}},
{poi:'registry',verb:'Take certified copies',got:'Certified copies',brief:'Registry copying section. A photocopy is not a certified copy.',file:{
court:'IN THE COURT OF THE JUDICIAL MAGISTRATE',
ctype:'ANNEXURES  -  CERTIFIED COPIES',
cause:'Asha Jain\nversus\nNitin Goyal',
no:'AAG-2026-031',
status:'Reply cites two old orders. Copies are not certified yet.',
client:'Asha Jain',
opp:'Nitin Goyal',
forum:'Copying section, district court',
ps:'Not applicable.',
next:'Do not list a copy you have not collected.',
law:'A certified copy needs the seal and the date of the copy. A plain photocopy is not a certified copy.',
papers:'1. Reply draft\n2. Application for certified copies\n3. Two old orders, names written on a slip\n4. Plain photocopies in the bag - not for annexing',
facts:'The reply cites two old orders. Plain photocopies are in the bag. The annexure list asks for certified copies.',
job:'Apply, collect, and check each copy: name of the case, seal, and date. If one is missing, leave it off the list.',
caution:'A photocopy with no seal is not a certified copy. Do not staple it in as if it is.'}}
]},
{id:'hearing',title:'Hearing Prep',steps:[
{poi:'registry',verb:'Check the seal',got:'Sealed copy',brief:'Copying section again. Match the case name before you carry it.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',
ctype:'BAIL  -  COPY FOR THE HEARING',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-014',
status:'Hearing is tomorrow. One seal looks faint.',
client:'Ramesh Kumar',
opp:'State',
forum:'Copying section, then the bail court',
ps:'North Gate police station',
next:'Tomorrow. Item number not yet copied from the board.',
law:'The copy you carry must match the case name on the brief.',
papers:'1. Filing diary number, on the cover\n2. Certified copy with a faint seal - to be checked\n3. Petition set\n4. FIR',
facts:'Tomorrow is the bail hearing. One certified copy in the file has a faint seal. The reader at the office was not sure.',
job:'Confirm the seal and the date. If the name on the copy is not this matter, do not carry it into court.',
caution:'A wrong copy is worse than no copy. You will read from it.'}},
{poi:'chamber',verb:'Lock the list of dates',got:'List of dates',brief:'Chambers. One line per event. No adjectives.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',
ctype:'BAIL  -  LIST OF DATES',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-014',
status:'Copy is checked. What you will say is not locked.',
client:'Ramesh Kumar',
opp:'State',
forum:'Senior chambers',
ps:'North Gate police station',
next:'Tomorrow, bail board.',
law:'A list of dates is a list. It is not the argument.',
papers:'1. Arrest, as in the FIR\n2. FIR date and sections\n3. Surety papers you actually filed\n4. Diary number and filing date\n5. Lines you crossed out, still visible',
facts:'The senior wants one line per event: arrest, FIR, surety papers, filing, diary number. No adjectives.',
job:'Agree the list. Cross out any line you cannot support with a paper in the file. Note what you will not argue.',
caution:'If it is not on the list, you do not say it when the matter is called.'}},
{poi:'court',verb:'Mark presence',got:'',brief:'District court. Stay till your item. Mark presence. Note the next date.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',
ctype:'BAIL  -  BOARD',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-014',
status:'Paper book is ready. Presence is not marked yet.',
client:'Ramesh Kumar',
opp:'State',
forum:'District court, bail board',
ps:'North Gate police station',
next:'Write the next date before you leave the room.',
law:'Presence is marked when the matter is called, not when you enter the campus.',
papers:'1. Paper book\n2. List of dates\n3. Diary number\n4. Blank line for the next date and the direction',
facts:'The paper book is ready. The board is outside. Other matters are running.',
job:'Find the item number. Stay near that court. When it is called, mark presence. Note the next date before you leave the room.',
caution:'Do not leave for the canteen while this item is in the next five.'}}
]},
{id:'higher',title:'Higher Brief',steps:[
{poi:'office',verb:'Read the operative part',got:'Order notes',brief:'At the firm, read the last page of the order first.',file:{
court:'IN THE HIGHER COURT',
ctype:'CHALLENGE TO THE BAIL ORDER',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-052',
status:'A 12 page order is in. The operative part is not noted.',
client:'Ramesh Kumar',
opp:'State',
forum:'Higher court paper book. Not the same mention as before.',
ps:'North Gate police station. Custody still to be checked.',
next:'No date in the higher court until the set is ready.',
law:'Read the last page of the order first. That is what was actually decided.',
papers:'1. Order, 12 pages\n2. Old bail file AAG-2026-014\n3. Two blank lines: what was refused, what is still open\n4. Family note - do not brief from this',
facts:'A 12 page order arrived. The family has only read the middle. The brief is now a challenge, not the same bail mention.',
job:'Read the operative part. Write, in two lines, what was refused and what is still open. Then read the reasons.',
caution:'Do not brief the senior from the family summary of the order.'}},
{poi:'police',verb:'Confirm custody',got:'Custody note',brief:'Police station. Is he still in, and as on what time?',file:{
court:'IN THE HIGHER COURT',
ctype:'CUSTODY CHECK BEFORE ANY NEW APPLICATION',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-052',
status:'Order notes are in. Custody today is unknown.',
client:'Ramesh Kumar',
opp:'State',
forum:'Do not draft until custody is confirmed.',
ps:'North Gate police station, lock-up, today.',
next:'If he is out, call the firm before any new draft.',
law:'A custody brief and a person already released are different cases.',
papers:'1. Order notes, two lines\n2. Blank custody line: in or out, and the time you checked\n3. Old FIR number, so you ask about the right person',
facts:'The family last saw him two days ago. Nobody has checked the lock-up today.',
job:'Confirm whether he is still in custody, and as on what time. Write that sentence on the file. If he is out, call the firm before you draft anything new.',
caution:'Do not file a custody application for a person who is already out.'}},
{poi:'court',verb:'Submit the set',got:'',brief:'Court. Hand in the indexed set. Do not add an oral request.',file:{
court:'IN THE HIGHER COURT',
ctype:'PAPER BOOK',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-052',
status:'Indexed set is ready to hand in.',
client:'Ramesh Kumar',
opp:'State',
forum:'Court officer, as directed at the window',
ps:'Custody note is inside the set.',
next:'Take the acknowledgment or diary note.',
law:'This is a filed set, not a casual mention.',
papers:'1. Index\n2. Operative-part note\n3. Custody note with time\n4. Copy of the 12 page order\n5. Old diary number from AAG-2026-014',
facts:'The order notes and the custody note are in the paper book. The set has an index.',
job:'Hand the set in the way the court officer asks. Take the acknowledgment or diary note. Do not add an oral request that is not in the index.',
caution:'If a page is missing at the table, say so. Do not hope nobody turns to it.'}}
]},
{id:'feet',title:'On Your Feet',steps:[
{poi:'chamber',verb:'Prepare the one line',got:'One-line ask',brief:'Chambers. Write the one sentence you will say. Then cut it.',file:{
court:'IN THE HIGHER COURT',
ctype:'MENTION  -  ONE ASK',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-052',
status:'You will mention it. The senior is in another court.',
client:'Ramesh Kumar',
opp:'State',
forum:'Chambers, then the board',
ps:'As in the custody note.',
next:'The date you will ask for. One date. Not a speech.',
law:'A mention is one ask. The provision. The date you want. Then stop.',
papers:'1. Paper book\n2. One sentence, written large\n3. Words you cut, still visible so you do not put them back',
facts:'The senior is in another court. You have the paper book. You do not have permission to tell the whole story.',
job:'Write the one sentence you will say. Read it once to the junior beside you. Cut any word that is not the ask.',
caution:'If you need a second sentence, you are not ready to mention it.'}},
{poi:'court',verb:'Mention, then stop',got:'Court note',brief:'When the item is called, say the one line. Then write what the court said.',file:{
court:'IN THE HIGHER COURT',
ctype:'MENTION',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-052',
status:'One line is ready. The board is crowded.',
client:'Ramesh Kumar',
opp:'State',
forum:'Higher court, busy board',
ps:'As in the file.',
next:'Write the next date in the words you heard.',
law:'Stop when the judge stops you. Write what was said, not what you wish you had said.',
papers:'1. One-line ask\n2. Paper book\n3. Blank court note: next date, direction, what was not argued',
facts:'The item will be called in a busy board. Other lawyers will be standing close.',
job:'Say the one line. Answer only what is asked. On the file, write the next date and any direction, in the words you heard.',
caution:'Do not correct the judge from memory of the file after the matter has moved on.'}},
{poi:'office',verb:'Write the diary',got:'',brief:'Same day, at the firm. Diary the mention before you leave.',file:{
court:'IN THE HIGHER COURT',
ctype:'OFFICE DIARY  -  SAME DAY',
cause:'Ramesh Kumar\nversus\nState',
no:'AAG-2026-052',
status:'Mention is over. The diary is still blank.',
client:'Ramesh Kumar',
opp:'State',
forum:'AAG Law Firm',
ps:'As already noted.',
next:'Copy the next date into the diary and onto the cover.',
law:'A diary note is written the same day, before you leave.',
facts:'The mention is over. The next person who opens this file was not in court.',
job:'Write the diary: date, court, what was asked, what the court said, the next date, and what was not argued. Put the note in the file, not in a chat message.',
caution:'If it is not in the diary, the firm will treat it as not said.'}}
]}
];
var RANKS=[{need:0,name:'Junior Advocate'},{need:2,name:'Associate'},{need:4,name:'Senior Associate'},{need:6,name:'Counsel'}];
var cars=[
{h:true,ri:0,t:0.18,dir:1,sp:0.86,col:'#9f2d2d',kind:'car'},
{h:true,ri:1,t:0.62,dir:-1,sp:1.02,col:'#1e4e79',kind:'car'},
{h:true,ri:2,t:0.36,dir:1,sp:0.72,col:'#e6b325',kind:'auto'},
{h:false,ri:1,t:0.28,dir:1,sp:0.92,col:'#166534',kind:'car'},
{h:false,ri:2,t:0.7,dir:-1,sp:1.08,col:'#334155',kind:'car'},
{h:true,ri:3,t:0.42,dir:-1,sp:0.48,col:'#e7e5e4',kind:'bus'}
];
function buildCity(){
solids=[];pois=[];parks=[];
var meta=[
['LAW FIRM','office','#e4d8c4','#6d5642','firm','#4a382c'],
['CHAMBERS','chamber','#d5d8dc','#5c6770','chamber','#3e4850'],
['DISTRICT COURT','court','#eadcc4','#8d3a34','court','#6e2c2c'],
['POLICE','police','#d7dbe2','#243e66','police','#1e3a5f'],
['REGISTRY','registry','#e6d09a','#6a5424','office','#5c4818'],
['CLIENT HOUSE','client','#f0e0cc','#8d4634','house','#6b3a2c'],
['CITY BANK','bank','#d5ddd8','#1f4d4a','bank','#134e4a'],
['BAR ROOM','bar','#e4d2b8','#4a3b2a','bar','#5c2a2a'],
['PARK','park','#1d4a2a','#2f7a40','park','#1d4a2a']
];
var n=0,j,i,b,m,bx,by,bw,bh;
for(j=0;j<hRoads.length-1;j++){
for(i=0;i<vRoads.length-1;i++){
m=meta[n++];
bx=vRoads[i]+RW+PAD+14;
by=hRoads[j]+RW+PAD+14;
bw=vRoads[i+1]-PAD-16-bx;
bh=hRoads[j+1]-PAD-16-by;
if(m[4]==='park'){
parks.push({x:bx-10,y:by-10,w:bw+20,h:bh+20,name:'DISTRICT PARK'});
}else{
b={x:bx,y:by,w:bw,h:bh,name:m[0],id:m[1],wall:m[2],roof:m[3],kind:m[4],face:m[5]};
solids.push(b);
if(m[1]!=='bank'){if(m[1]!=='bar') pois.push(b);}
}
}
}
}
function inRect(x,y,rx,ry,rw,rh){
if(x<rx) return false;
if(y<ry) return false;
if(x>rx+rw) return false;
if(y>ry+rh) return false;
return true;
}
function doorOf(b){return {x:b.x+b.w/2,y:b.y+b.h+16};}
function walkable(x,y){
var i,d;
if(x<10||y<10||x>WORLD_W-10||y>WORLD_H-10) return false;
for(i=0;i<vRoads.length;i++){if(inRect(x,y,vRoads[i]-PAD,0,RW+PAD*2,WORLD_H)) return true;}
for(i=0;i<hRoads.length;i++){if(inRect(x,y,0,hRoads[i]-PAD,WORLD_W,RW+PAD*2)) return true;}
for(i=0;i<parks.length;i++){if(inRect(x,y,parks[i].x,parks[i].y,parks[i].w,parks[i].h)) return true;}
for(i=0;i<pois.length;i++){
d=doorOf(pois[i]);
if(Math.abs(x-d.x)<34){if(Math.abs(y-d.y)<34) return true;}
}
return false;
}
function blocked(x,y){
if(!walkable(x,y)) return true;
if(!walkable(x+10,y)) return true;
if(!walkable(x-10,y)) return true;
if(!walkable(x,y+10)) return true;
if(!walkable(x,y-10)) return true;
return false;
}
function rankName(){
var name=RANKS[0].name,i;
for(i=0;i<RANKS.length;i++) if(state.done>=RANKS[i].need) name=RANKS[i].name;
return name;
}
function currentStep(){
if(state.mi>=MISSIONS.length) return null;
return MISSIONS[state.mi].steps[state.si];
}
function poiById(id){
var i;for(i=0;i<pois.length;i++) if(pois[i].id===id) return pois[i];
return null;
}
function resize(){
DPR=Math.min(2,window.devicePixelRatio||1);
VW=root.clientWidth||window.innerWidth;
VH=root.clientHeight||window.innerHeight;
canvas.width=Math.max(1,Math.floor(VW*DPR));
canvas.height=Math.max(1,Math.floor(VH*DPR));
ctx.setTransform(DPR,0,0,DPR,0,0);
}
function movePlayer(dx,dy){
if(dx){if(!blocked(player.x+dx,player.y)) player.x+=dx;}
if(dy){if(!blocked(player.x,player.y+dy)) player.y+=dy;}
if(Math.abs(dx)>Math.abs(dy)) player.dir=dx>0?'right':'left';
else if(dy) player.dir=dy>0?'down':'up';
player.bob+=Math.abs(dx)+Math.abs(dy);
}
function save(){
if(!state.email) return;
state.x=player.x;state.y=player.y;state.gender=player.gender;
try{localStorage.setItem('aag_city_v4_'+state.email,JSON.stringify(state));}catch(e){}
}
function load(email){
var raw=null,s;
try{raw=localStorage.getItem('aag_city_v4_'+email);}catch(e){}
if(!raw){state={email:email,gender:null,rep:40,mi:0,si:0,done:0,x:240,y:88,carry:''};return;}
try{s=JSON.parse(raw);state=s;state.email=email;if(!state.carry) state.carry='';}catch(e){state={email:email,gender:null,rep:40,mi:0,si:0,done:0,x:240,y:88,carry:''};}
}
function hud(){
var step=currentStep(),m=null,near=false,p,d,hand,show=false;
if(state.mi<MISSIONS.length) m=MISSIONS[state.mi];
var obj=document.getElementById('obj');
if(!playing) obj.textContent='The yellow file marker is your brief. Stay on the street.';
else if(!step) obj.textContent='No open brief. The district is quiet. More files will land later.';
else obj.textContent=m.title+'  -  '+step.brief;
document.getElementById('rank').textContent=rankName().toUpperCase()+'\nREP '+state.rep+'  '+state.done+'/'+MISSIONS.length;
hand=document.getElementById('hand');
if(playing){if(state.carry){hand.style.display='block';hand.textContent='IN HAND: '+state.carry;}else hand.style.display='none';}
if(playing){if(step){
p=poiById(step.poi);d=doorOf(p);
if(Math.hypot(player.x-d.x,player.y-d.y)<72) near=true;
}}
if(near){if(!modalOpen) show=true;}
document.getElementById('near').style.display=show?'block':'none';
if(show) document.getElementById('act').classList.add('on');
else document.getElementById('act').classList.remove('on');
}
function openFile(){
var step=currentStep(),f,p,d;
if(!playing) return;
if(modalOpen) return;
if(!step) return;
p=poiById(step.poi);
if(!p) return;
d=doorOf(p);
if(Math.hypot(player.x-d.x,player.y-d.y)>72) return;
f=step.file;
document.getElementById('fcourt').textContent=f.court;
document.getElementById('fctype').textContent=f.ctype;
document.getElementById('fcause').textContent=f.cause;
document.getElementById('fno').textContent=f.no;
document.getElementById('fstat').textContent=f.status;
document.getElementById('fcli').textContent=f.client;
document.getElementById('fopp').textContent=f.opp;
document.getElementById('ffor').textContent=f.forum;
document.getElementById('fps').textContent=f.ps;
document.getElementById('fnext').textContent=f.next;
document.getElementById('flaw').textContent=f.law;
document.getElementById('findex').textContent=f.papers;
document.getElementById('ffacts').textContent=f.facts;
document.getElementById('fjob').textContent=f.job;
document.getElementById('fcaut').textContent='Do not: '+f.caution;
document.getElementById('btn-do').textContent=step.verb.toUpperCase();
document.getElementById('file').classList.remove('hidden');
document.getElementById('file').scrollTop=0;
modalOpen=true;
}
function completeStep(){
var m=MISSIONS[state.mi],step=m.steps[state.si];
state.carry=step.got||'';
state.si++;
state.rep+=8;
if(state.si>=m.steps.length){
state.si=0;state.mi++;state.done++;state.rep+=12;state.carry='';
flash(state.mi>=MISSIONS.length?'CITY CLEAR':(m.title+' CLOSED').toUpperCase());
}else flash('FILE NOTE UPDATED');
save();hud();
}
function flash(text){
var t=document.getElementById('toast');
t.textContent=text;t.style.display='block';toastT=90;
}
function bootPlay(){
player.gender=state.gender||'male';
player.x=state.x||240;player.y=state.y||88;
playing=true;
document.getElementById('login').classList.add('hidden');
document.getElementById('gender').classList.add('hidden');
hud();
}
function carPos(c){
var span,x,y,w,h;
w=46;h=20;
if(c.kind==='bus'){w=84;h=24;}
if(c.kind==='auto'){w=30;h=18;}
if(c.h){
span=WORLD_W-160;x=80+((c.t%1+1)%1)*span;y=hRoads[c.ri]+RW/2;
return {x:x,y:y,w:w,h:h,hdir:true,dir:c.dir};
}
span=WORLD_H-160;y=80+((c.t%1+1)%1)*span;x=vRoads[c.ri]+RW/2;
return {x:x,y:y,w:h,h:w,hdir:false,dir:c.dir};
}
function updateCars(){
var i,c,p,push;
for(i=0;i<cars.length;i++){
c=cars[i];
c.t+=c.dir*c.sp*0.0015;
if(c.t>0.97){c.t=0.97;c.dir=-1;}
if(c.t<0.03){c.t=0.03;c.dir=1;}
p=carPos(c);
push=c.kind==='bus'?22:16;
if(Math.abs(player.x-p.x)<(c.kind==='bus'?46:30)){if(Math.abs(player.y-p.y)<22){
if(c.h){if(!blocked(player.x+c.dir*push,player.y)) player.x+=c.dir*push;}
else {if(!blocked(player.x,player.y+c.dir*push)) player.y+=c.dir*push;}
shake=5;
}}
}
}
function hash(n){var x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x);}
function drawTree(x,y,r){
ctx.fillStyle='rgba(20,30,10,.22)';
ctx.beginPath();ctx.ellipse(x+3,y+r*0.4,r*0.85,r*0.4,0,0,6.28);ctx.fill();
ctx.fillStyle='#1b4d2c';
ctx.beginPath();ctx.arc(x,y,r,0,6.28);ctx.fill();
ctx.fillStyle='#2f7a40';
ctx.beginPath();ctx.arc(x-r*0.28,y-r*0.25,r*0.55,0,6.28);ctx.fill();
ctx.fillStyle='#5a3a22';
ctx.fillRect(x-1.4,y+r*0.35,3,r*0.45);
}
function drawGround(){
var x,y,n;
ctx.fillStyle='#6a7846';
ctx.fillRect(0,0,WORLD_W,WORLD_H);
for(y=0;y<WORLD_H;y+=22){
for(x=0;x<WORLD_W;x+=22){
n=hash(x*0.17+y*1.3);
if(n>0.78) ctx.fillStyle='#7a6e46';
else if(n>0.45) ctx.fillStyle='#617244';
else ctx.fillStyle='#738451';
ctx.fillRect(x,y,22,22);
}
}
}
function drawLots(){
var i,b,yard;
for(i=0;i<solids.length;i++){
b=solids[i];
yard='#7e8b58';
if(b.kind==='court') yard='#ddd4c2';
if(b.kind==='house') yard='#8d7a52';
if(b.kind==='police') yard='#c9cdc4';
if(b.kind==='bank') yard='#d5ddd4';
ctx.fillStyle='#6a6254';
ctx.fillRect(b.x-16,b.y-16,b.w+32,b.h+40);
ctx.fillStyle=yard;
ctx.fillRect(b.x-8,b.y-8,b.w+16,b.h+22);
}
}
function plate(text,x,y){
ctx.font='bold 11px system-ui,sans-serif';
var w=ctx.measureText(text).width+14;
ctx.fillStyle='#16345c';
ctx.fillRect(x,y,w,16);
ctx.strokeStyle='#f4f7fb';
ctx.lineWidth=1;
ctx.strokeRect(x+1,y+1,w-2,14);
ctx.fillStyle='#f4f7fb';
ctx.textAlign='left';
ctx.fillText(text,x+7,y+12);
}
function drawRoads(){
var i,j,k,x,y;
ctx.fillStyle='#cfc6b8';
for(i=0;i<vRoads.length;i++) ctx.fillRect(vRoads[i]-PAD,0,RW+PAD*2,WORLD_H);
for(j=0;j<hRoads.length;j++) ctx.fillRect(0,hRoads[j]-PAD,WORLD_W,RW+PAD*2);
ctx.strokeStyle='rgba(90,78,64,.28)';
ctx.lineWidth=1;
for(i=0;i<vRoads.length;i++){
for(y=0;y<WORLD_H;y+=32){
ctx.strokeRect(vRoads[i]-PAD+1,y,PAD-3,32);
ctx.strokeRect(vRoads[i]+RW+2,y,PAD-5,32);
}
}
for(j=0;j<hRoads.length;j++){
for(x=0;x<WORLD_W;x+=32){
ctx.strokeRect(x,hRoads[j]-PAD+1,32,PAD-3);
ctx.strokeRect(x,hRoads[j]+RW+2,32,PAD-5);
}
}
ctx.fillStyle='#8a8378';
for(i=0;i<vRoads.length;i++){
ctx.fillRect(vRoads[i]-3,0,4,WORLD_H);
ctx.fillRect(vRoads[i]+RW-1,0,4,WORLD_H);
}
for(j=0;j<hRoads.length;j++){
ctx.fillRect(0,hRoads[j]-3,WORLD_W,4);
ctx.fillRect(0,hRoads[j]+RW-1,WORLD_W,4);
}
ctx.fillStyle='#3c4148';
for(i=0;i<vRoads.length;i++) ctx.fillRect(vRoads[i]+1,0,RW-2,WORLD_H);
for(j=0;j<hRoads.length;j++) ctx.fillRect(0,hRoads[j]+1,WORLD_W,RW-2);
ctx.fillStyle='rgba(255,255,255,.045)';
for(k=0;k<90;k++){
ctx.beginPath();
ctx.ellipse(hash(k*9.1)*WORLD_W,hash(k*4.3)*WORLD_H,22,7,hash(k)*3,0,6.28);
ctx.fill();
}
ctx.strokeStyle='rgba(255,255,255,.5)';
ctx.lineWidth=1.4;
ctx.setLineDash([]);
for(j=0;j<hRoads.length;j++){
ctx.beginPath();ctx.moveTo(0,hRoads[j]+6);ctx.lineTo(WORLD_W,hRoads[j]+6);ctx.stroke();
ctx.beginPath();ctx.moveTo(0,hRoads[j]+RW-6);ctx.lineTo(WORLD_W,hRoads[j]+RW-6);ctx.stroke();
}
for(i=0;i<vRoads.length;i++){
ctx.beginPath();ctx.moveTo(vRoads[i]+6,0);ctx.lineTo(vRoads[i]+6,WORLD_H);ctx.stroke();
ctx.beginPath();ctx.moveTo(vRoads[i]+RW-6,0);ctx.lineTo(vRoads[i]+RW-6,WORLD_H);ctx.stroke();
}
ctx.strokeStyle='rgba(236,224,170,.85)';
ctx.lineWidth=2;
ctx.setLineDash([18,16]);
for(j=0;j<hRoads.length;j++){ctx.beginPath();ctx.moveTo(0,hRoads[j]+RW/2);ctx.lineTo(WORLD_W,hRoads[j]+RW/2);ctx.stroke();}
for(i=0;i<vRoads.length;i++){ctx.beginPath();ctx.moveTo(vRoads[i]+RW/2,0);ctx.lineTo(vRoads[i]+RW/2,WORLD_H);ctx.stroke();}
ctx.setLineDash([]);
ctx.fillStyle='#f4efe4';
for(i=0;i<vRoads.length;i++){
for(j=0;j<hRoads.length;j++){
for(k=0;k<5;k++){
ctx.fillRect(vRoads[i]+10+k*16,hRoads[j]-14,10,8);
ctx.fillRect(vRoads[i]+10+k*16,hRoads[j]+RW+6,10,8);
ctx.fillRect(vRoads[i]-14,hRoads[j]+10+k*16,8,10);
ctx.fillRect(vRoads[i]+RW+6,hRoads[j]+10+k*16,8,10);
}
}
}
ctx.strokeStyle='#2c3136';
ctx.lineWidth=2;
for(k=0;k<6;k++){
ctx.beginPath();
ctx.arc(vRoads[k%4]+RW/2,hRoads[k%4]+RW/2+20,6,0,6.28);
ctx.stroke();
}
plate('FILING STREET',70,hRoads[0]+RW+6);
plate('BAR ROAD',70,hRoads[1]+RW+6);
plate('CAUSEWAY',70,hRoads[2]+RW+6);
plate('REGISTRY ROAD',70,hRoads[3]+RW+6);
ctx.save();
ctx.translate(vRoads[1]-PAD+2,150);
ctx.rotate(-1.5708);
plate('COURT LANE',0,0);
ctx.restore();
ctx.save();
ctx.translate(vRoads[2]+RW+PAD-2,210);
ctx.rotate(1.5708);
plate('STATION ROAD',0,0);
ctx.restore();
}
function drawPaths(){
var i,b;
ctx.fillStyle='#e7dfd2';
for(i=0;i<solids.length;i++){
b=solids[i];
ctx.fillRect(b.x+b.w/2-14,b.y+b.h-2,28,36);
ctx.strokeStyle='rgba(90,78,64,.35)';
ctx.strokeRect(b.x+b.w/2-14,b.y+b.h-2,28,18);
ctx.strokeRect(b.x+b.w/2-14,b.y+b.h+16,28,18);
}
}
function closeToH(y){
var i;
for(i=0;i<hRoads.length;i++) if(Math.abs(y-(hRoads[i]+RW/2))<64) return true;
return false;
}
function closeToV(x){
var i;
for(i=0;i<vRoads.length;i++) if(Math.abs(x-(vRoads[i]+RW/2))<64) return true;
return false;
}
function drawStreetTrees(){
var i,j,x,y;
for(i=0;i<vRoads.length;i++){
for(y=80;y<WORLD_H-40;y+=92){
if(closeToH(y)) continue;
drawTree(vRoads[i]-PAD+8,y,12);
}
}
for(j=0;j<hRoads.length;j++){
for(x=90;x<WORLD_W-40;x+=110){
if(closeToV(x)) continue;
drawTree(x,hRoads[j]-PAD+8,12);
}
}
}
function lamp(x,y){
ctx.fillStyle='rgba(255,210,120,.16)';
ctx.beginPath();ctx.arc(x,y,16,0,6.28);ctx.fill();
ctx.fillStyle='#4a4338';
ctx.fillRect(x-1,y,3,18);
ctx.fillStyle='#f6e7b8';
ctx.fillRect(x-6,y-3,12,4);
}
function drawScooter(x,y){
ctx.fillStyle='#1c1917';
ctx.beginPath();ctx.arc(x-5,y+2,2.5,0,6.28);ctx.arc(x+6,y+2,2.5,0,6.28);ctx.fill();
ctx.fillStyle='#c2410c';
ctx.fillRect(x-5,y-3,11,5);
ctx.fillStyle='#111';
ctx.fillRect(x-1,y-6,2,4);
}
function drawParkedAuto(x,y){
ctx.fillStyle='#111';
ctx.beginPath();ctx.arc(x-7,y+6,3,0,6.28);ctx.arc(x+7,y+6,3,0,6.28);ctx.arc(x,y-8,3,0,6.28);ctx.fill();
ctx.fillStyle='#e6b325';
ctx.fillRect(x-8,y-6,16,13);
ctx.fillStyle='#17803d';
ctx.fillRect(x-8,y-6,16,4);
ctx.fillStyle='#d5eef8';
ctx.fillRect(x-5,y-1,10,5);
}
function teaStall(x,y){
ctx.fillStyle='#6b3e22';
ctx.fillRect(x,y,28,16);
ctx.fillStyle='#f3e6c8';
ctx.fillRect(x-6,y+14,40,5);
ctx.fillStyle='#7f1d1d';
ctx.font='bold 9px system-ui,sans-serif';
ctx.textAlign='left';
ctx.fillText('TEA',x+5,y+11);
}
function drawStreetLife(){
var i,j,x,y;
for(i=0;i<vRoads.length;i++){
for(y=110;y<WORLD_H-50;y+=160){
if(closeToH(y)) continue;
lamp(vRoads[i]+RW+10,y);
}
}
for(j=0;j<hRoads.length;j++){
for(x=160;x<WORLD_W-90;x+=240){
if(closeToV(x)) continue;
drawScooter(x,hRoads[j]+RW+14);
}
}
drawParkedAuto(300,hRoads[0]+RW+14);
drawParkedAuto(780,hRoads[2]-18);
teaStall(180,hRoads[0]+RW+5);
}
function drawBuilding(b){
var x,lit,s,fw,tw;
ctx.fillStyle='rgba(50,36,18,.25)';
ctx.fillRect(b.x+9,b.y+12,b.w,b.h);
ctx.fillStyle='#9a917f';
ctx.fillRect(b.x-3,b.y-3,b.w+6,b.h+6);
ctx.fillStyle=b.wall;
ctx.fillRect(b.x,b.y,b.w,b.h-16);
ctx.fillStyle=b.roof;
ctx.fillRect(b.x+12,b.y+12,b.w-24,b.h-56);
ctx.strokeStyle='rgba(255,255,255,.28)';
ctx.lineWidth=2;
ctx.strokeRect(b.x+10,b.y+10,b.w-20,b.h-54);
if(b.kind!=='house'){
ctx.fillStyle='#c5ced2';
ctx.fillRect(b.x+20,b.y+20,26,16);
ctx.fillStyle='#8ea0a6';
ctx.fillRect(b.x+22,b.y+17,22,5);
ctx.fillStyle='#6b7280';
ctx.fillRect(b.x+b.w-36,b.y+22,14,10);
}
if(b.kind==='house'){
ctx.strokeStyle='rgba(60,24,16,.4)';
ctx.lineWidth=1;
var yy;
for(yy=b.y+18;yy<b.y+b.h-58;yy+=7){
ctx.beginPath();ctx.moveTo(b.x+14,yy);ctx.lineTo(b.x+b.w-14,yy);ctx.stroke();
}
}
fw=b.kind==='court'?46:30;
ctx.fillStyle=b.face;
ctx.fillRect(b.x,b.y+b.h-fw,b.w,fw);
if(b.kind==='court'){
ctx.fillStyle='#f4ead8';
ctx.beginPath();
ctx.moveTo(b.x+36,b.y+52);
ctx.lineTo(b.x+b.w/2,b.y+18);
ctx.lineTo(b.x+b.w-36,b.y+52);
ctx.closePath();
ctx.fill();
ctx.fillStyle='#f7f1e6';
var c;
for(c=-3;c<=3;c++) ctx.fillRect(b.x+b.w/2+c*24-4,b.y+b.h-86,8,42);
ctx.strokeStyle='#5a4632';
ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(b.x+b.w-30,b.y+6);ctx.lineTo(b.x+b.w-30,b.y-18);ctx.stroke();
ctx.fillStyle='#e6c84a';
ctx.fillRect(b.x+b.w-30,b.y-18,18,11);
ctx.fillStyle='#1f3f73';
ctx.fillRect(b.x+b.w-30,b.y-7,18,6);
}
for(x=b.x+18;x<b.x+b.w-20;x+=24){
lit=hash(x*3+b.y)>0.42;
ctx.fillStyle=lit?'#f6e2a8':'#211a14';
ctx.fillRect(x,b.y+b.h-fw+10,12,16);
ctx.fillStyle='rgba(255,255,255,.28)';
ctx.fillRect(x,b.y+b.h-fw+10,3,16);
}
ctx.fillStyle='#1a120c';
ctx.fillRect(b.x+b.w/2-11,b.y+b.h-22,22,22);
ctx.fillStyle='#c4a574';
ctx.fillRect(b.x+b.w/2-8,b.y+b.h-16,7,12);
ctx.fillStyle='#e7dfd2';
for(s=0;s<3;s++) ctx.fillRect(b.x+b.w/2-18-s*6,b.y+b.h-1+s*6,36+s*12,6);
ctx.font='bold 12px system-ui,sans-serif';
ctx.textAlign='center';
tw=ctx.measureText(b.name).width;
ctx.fillStyle='#1b140e';
ctx.fillRect(b.x+b.w/2-tw/2-8,b.y+b.h-fw-18,tw+16,16);
ctx.fillStyle='#f6edd6';
ctx.fillText(b.name,b.x+b.w/2,b.y+b.h-fw-6);
if(b.kind==='firm'){
ctx.fillStyle='#7a1f1f';
ctx.fillRect(b.x+b.w/2-42,b.y+16,84,16);
ctx.fillStyle='#f8efe0';
ctx.font='bold 11px system-ui,sans-serif';
ctx.fillText('AAG LAW',b.x+b.w/2,b.y+28);
}
if(b.kind==='police'){
ctx.fillStyle='#1d4ed8';
ctx.beginPath();ctx.arc(b.x+28,b.y+28,8,0,6.28);ctx.fill();
ctx.fillStyle='#dbeafe';
ctx.beginPath();ctx.arc(b.x+28,b.y+28,3.5,0,6.28);ctx.fill();
}
if(b.kind==='bank'){
ctx.fillStyle='#0f766e';
ctx.fillRect(b.x+16,b.y+b.h-fw+6,34,20);
ctx.fillStyle='#99f6e4';
ctx.fillRect(b.x+20,b.y+b.h-fw+10,26,8);
ctx.fillStyle='#042f2e';
ctx.font='bold 9px system-ui,sans-serif';
ctx.textAlign='left';
ctx.fillText('ATM',b.x+24,b.y+b.h-fw+24);
}
if(b.kind==='bar'){
ctx.fillStyle='#7f1d1d';
ctx.fillRect(b.x+b.w-78,b.y+18,58,14);
ctx.fillStyle='#fecaca';
ctx.font='bold 10px system-ui,sans-serif';
ctx.textAlign='center';
ctx.fillText('OPEN',b.x+b.w-49,b.y+29);
}
if(b.kind==='chamber'){
ctx.fillStyle='#111';
ctx.fillRect(b.x+16,b.y+18,18,22);
ctx.fillStyle='#f8fafc';
ctx.fillRect(b.x+22,b.y+18,6,22);
}
}
function drawParks(){
var i,p,t,k;
for(i=0;i<parks.length;i++){
p=parks[i];
ctx.fillStyle='#2c6a3c';
ctx.fillRect(p.x,p.y,p.w,p.h);
for(k=0;k<36;k++){
ctx.fillStyle=hash(k+3)>0.5?'#256b38':'#3c8148';
ctx.fillRect(p.x+8+hash(k*5)*(p.w-20),p.y+8+hash(k*9)*(p.h-20),18,12);
}
ctx.fillStyle='#e4d9c8';
ctx.fillRect(p.x+p.w/2-11,p.y+10,22,p.h-20);
ctx.fillRect(p.x+18,p.y+p.h/2-9,p.w-36,18);
ctx.fillStyle='#8eb4c6';
ctx.beginPath();ctx.arc(p.x+p.w/2,p.y+p.h/2,26,0,6.28);ctx.fill();
ctx.strokeStyle='#d5e4ec';
ctx.lineWidth=3;
ctx.beginPath();ctx.arc(p.x+p.w/2,p.y+p.h/2,14,0,6.28);ctx.stroke();
for(t=0;t<8;t++) drawTree(p.x+36+(t%4)*58,p.y+48+Math.floor(t/4)*100,15);
ctx.fillStyle='#6b3e22';
ctx.fillRect(p.x+40,p.y+p.h/2-30,26,8);
ctx.fillRect(p.x+p.w-66,p.y+p.h/2+22,26,8);
ctx.fillStyle='#5c5648';
ctx.fillRect(p.x+p.w/2-58,p.y+16,116,18);
ctx.fillStyle='#f6edd6';
ctx.font='bold 12px system-ui,sans-serif';
ctx.textAlign='center';
ctx.fillText(p.name,p.x+p.w/2,p.y+29);
}
}
function drawLawyer(x,y){
ctx.fillStyle='rgba(0,0,0,.22)';
ctx.beginPath();ctx.ellipse(x,y+9,6,2.3,0,0,6.28);ctx.fill();
ctx.fillStyle='#111';
ctx.fillRect(x-4,y-1,8,10);
ctx.fillStyle='#f8fafc';
ctx.fillRect(x-1,y,2,6);
ctx.fillStyle='#e0b090';
ctx.beginPath();ctx.arc(x,y-5,3.3,0,6.28);ctx.fill();
ctx.fillStyle='#111';
ctx.beginPath();ctx.arc(x,y-6.4,3.3,3.15,0);ctx.fill();
}
function drawNpc(x,y,col){
ctx.fillStyle='rgba(0,0,0,.22)';
ctx.beginPath();ctx.ellipse(x,y+9,6,2.3,0,0,6.28);ctx.fill();
ctx.fillStyle=col;
ctx.fillRect(x-4,y-1,8,10);
ctx.fillStyle='#e0b090';
ctx.beginPath();ctx.arc(x,y-5,3.2,0,6.28);ctx.fill();
}
function drawCrowd(){
var b,d;
b=poiById('court');
if(b){d=doorOf(b);drawLawyer(d.x-30,d.y+8);drawLawyer(d.x+24,d.y+2);drawLawyer(d.x+44,d.y+12);}
b=poiById('police');
if(b){d=doorOf(b);drawNpc(d.x+22,d.y+8,'#7c6a32');}
b=poiById('client');
if(b){d=doorOf(b);drawNpc(d.x-18,d.y+8,'#9a3412');}
b=poiById('office');
if(b){d=doorOf(b);drawNpc(d.x+26,d.y+10,'#1d4e89');}
}
function bakeCity(){
cityCanvas=document.createElement('canvas');
cityCanvas.width=WORLD_W;
cityCanvas.height=WORLD_H;
var live=ctx;
ctx=cityCanvas.getContext('2d');
drawGround();
drawParks();
drawLots();
drawRoads();
drawPaths();
drawStreetTrees();
var i;
for(i=0;i<solids.length;i++) drawBuilding(solids[i]);
drawStreetLife();
drawCrowd();
ctx=live;
}
function drawBlip(){
var step=currentStep(),b,d,pulse;
if(!step) return;
b=poiById(step.poi);if(!b) return;
d=doorOf(b);
pulse=0.55+Math.sin(Date.now()/220)*0.45;
ctx.save();
ctx.translate(d.x,d.y-34);
ctx.fillStyle='rgba(0,0,0,.25)';
ctx.fillRect(-6,2,16,18);
ctx.fillStyle='#f7f1e4';
ctx.fillRect(-8,-2,16,20);
ctx.fillStyle='#7a1f1f';
ctx.fillRect(-8,-2,16,5);
ctx.fillStyle='#7a1f1f';
ctx.fillRect(-5,6,10,1);ctx.fillRect(-5,9,8,1);ctx.fillRect(-5,12,10,1);
ctx.restore();
ctx.strokeStyle='rgba(226,182,87,'+pulse+')';
ctx.lineWidth=2;
ctx.beginPath();ctx.arc(d.x,d.y,18+pulse*8,0,6.28);ctx.stroke();
}
function drawCars(){
var i,p,c,wx;
for(i=0;i<cars.length;i++){
c=cars[i];p=carPos(c);
ctx.save();
ctx.translate(p.x,p.y);
if(!p.hdir) ctx.rotate(1.5708);
if(p.dir<0) ctx.rotate(3.1416);
ctx.fillStyle='rgba(0,0,0,.25)';
ctx.beginPath();ctx.ellipse(2,7,p.w*0.32,5,0,0,6.28);ctx.fill();
if(c.kind==='auto'){
ctx.fillStyle='#e6b325';
ctx.fillRect(-14,-8,28,16);
ctx.fillStyle='#17803d';
ctx.fillRect(-14,-8,28,4);
ctx.fillStyle='#d7eef8';
ctx.fillRect(-7,-3,12,7);
}else if(c.kind==='bus'){
ctx.fillStyle=c.col;
ctx.fillRect(-40,-12,80,24);
ctx.fillStyle='#7dd3fc';
for(wx=-30;wx<=20;wx+=16) ctx.fillRect(wx,-9,11,7);
ctx.fillStyle='#111';
ctx.fillRect(28,-5,8,10);
ctx.fillStyle='#f8fafc';
ctx.fillRect(34,-4,3,3);
}else{
ctx.fillStyle=c.col;
ctx.fillRect(-23,-9,46,18);
ctx.fillStyle='#b9d7ea';
ctx.fillRect(-4,-7,16,14);
ctx.fillStyle='#0f172a';
ctx.fillRect(-16,-11,8,3);ctx.fillRect(10,-11,8,3);
ctx.fillRect(-16,8,8,3);ctx.fillRect(10,8,8,3);
ctx.fillStyle='#f8fafc';
ctx.fillRect(20,-5,3,4);
}
ctx.restore();
}
}
function drawPlayer(){
var x=player.x,y=player.y,swing=Math.sin(player.bob*0.45)*3;
var suit,skin,hair;
suit=player.gender==='female'?'#7c243c':'#1d3f72';
skin=player.gender==='female'?'#efc2b0':'#e0b090';
hair=player.gender==='female'?'#2a1a16':'#161616';
ctx.fillStyle='rgba(0,0,0,.28)';
ctx.beginPath();ctx.ellipse(x+2,y+14,12,5,0,0,6.28);ctx.fill();
ctx.fillStyle='#1c1917';
ctx.fillRect(x-6,y+2,5,9);
ctx.fillRect(x+1,y+2,5,9);
ctx.fillStyle='#111';
ctx.fillRect(x-7,y+10+swing*0.15,6,3);
ctx.fillRect(x+1,y+10-swing*0.15,6,3);
ctx.fillStyle=suit;
ctx.fillRect(x-8,y-8,16,13);
ctx.fillStyle='#f8fafc';
ctx.fillRect(x-2,y-7,4,8);
ctx.fillStyle=skin;
ctx.fillRect(x-12,y-6,4,8+swing);
ctx.fillRect(x+8,y-6,4,8-swing);
ctx.fillStyle=skin;
ctx.beginPath();ctx.arc(x,y-13,6.2,0,6.28);ctx.fill();
ctx.fillStyle=hair;
ctx.beginPath();ctx.arc(x,y-15,6.2,3.15,0);ctx.fill();
if(player.gender==='female'){
ctx.fillRect(x-6,y-13,3,8);
ctx.fillRect(x+3,y-13,3,8);
}
ctx.fillStyle='#6b4b3a';
if(player.dir==='left') ctx.fillRect(x-6,y-13,2,2);
else if(player.dir==='right') ctx.fillRect(x+4,y-13,2,2);
else if(player.dir==='up') ctx.fillRect(x-1,y-17,2,2);
else ctx.fillRect(x-1,y-10,2,2);
if(state.carry){
ctx.fillStyle='#f7f1e4';
ctx.fillRect(x+10,y-6,8,10);
ctx.fillStyle='#7a1f1f';
ctx.fillRect(x+10,y-6,8,3);
}
}
function drawRadar(){
var s=104,x=VW-s-8,y=86,sx=s/WORLD_W,sy=s/WORLD_H,i,step,d,b;
ctx.fillStyle='rgba(12,18,12,.78)';
ctx.fillRect(x-4,y-16,s+8,s+22);
ctx.fillStyle='#6a7846';
ctx.fillRect(x,y,s,s);
ctx.fillStyle='#cfc6b8';
for(i=0;i<vRoads.length;i++) ctx.fillRect(x+(vRoads[i]-PAD)*sx,y,Math.max(2,(RW+PAD*2)*sx),s);
for(i=0;i<hRoads.length;i++) ctx.fillRect(x,y+(hRoads[i]-PAD)*sy,s,Math.max(2,(RW+PAD*2)*sy));
ctx.fillStyle='#3c4148';
for(i=0;i<vRoads.length;i++) ctx.fillRect(x+vRoads[i]*sx,y,Math.max(2,RW*sx),s);
for(i=0;i<hRoads.length;i++) ctx.fillRect(x,y+hRoads[i]*sy,s,Math.max(2,RW*sy));
ctx.fillStyle='#6b5344';
for(i=0;i<solids.length;i++){
b=solids[i];
ctx.fillRect(x+b.x*sx,y+b.y*sy,Math.max(2,b.w*sx),Math.max(2,b.h*sy));
}
step=currentStep();
if(step){d=doorOf(poiById(step.poi));ctx.fillStyle='#e2b657';ctx.fillRect(x+d.x*sx-2,y+d.y*sy-2,5,5);}
ctx.fillStyle='#7eb6ff';
ctx.beginPath();ctx.arc(x+player.x*sx,y+player.y*sy,3,0,6.28);ctx.fill();
ctx.strokeStyle='#e2b657';
ctx.strokeRect(x,y,s,s);
ctx.fillStyle='#e2b657';
ctx.font='10px system-ui,sans-serif';
ctx.textAlign='left';
ctx.fillText('DISTRICT',x,y-4);
}
function draw(){
var maxX=WORLD_W-VW,maxY=WORLD_H-VH,sx=0,sy=0;
if(maxX<0) maxX=0;
if(maxY<0) maxY=0;
if(shake>0){sx=Math.random()*shake-shake/2;sy=Math.random()*shake-shake/2;shake--;}
cam.x+=(player.x-VW/2-cam.x)*0.14;
cam.y+=(player.y-VH/2-cam.y)*0.14;
if(cam.x<0) cam.x=0;
if(cam.x>maxX) cam.x=maxX;
if(cam.y<0) cam.y=0;
if(cam.y>maxY) cam.y=maxY;
ctx.setTransform(DPR,0,0,DPR,0,0);
ctx.clearRect(0,0,VW,VH);
ctx.fillStyle='#24301c';
ctx.fillRect(0,0,VW,VH);
ctx.save();
ctx.translate(-cam.x+sx,-cam.y+sy);
if(cityCanvas) ctx.drawImage(cityCanvas,0,0);
drawCars();
drawBlip();
drawPlayer();
ctx.restore();
var g=ctx.createRadialGradient(VW/2,VH*0.42,Math.min(VW,VH)*0.2,VW/2,VH*0.5,Math.max(VW,VH)*0.75);
g.addColorStop(0,'rgba(255,214,160,0)');
g.addColorStop(1,'rgba(20,16,8,.22)');
ctx.fillStyle=g;
ctx.fillRect(0,0,VW,VH);
drawRadar();
}
function frame(){
var dx,dy,sp,len;
if(playing){if(!modalOpen){
dx=0;dy=0;sp=3.05;
if(keys['w']||keys['arrowup']||hold.up) dy-=1;
if(keys['s']||keys['arrowdown']||hold.down) dy+=1;
if(keys['a']||keys['arrowleft']||hold.left) dx-=1;
if(keys['d']||keys['arrowright']||hold.right) dx+=1;
if(dx||dy){len=Math.hypot(dx,dy)||1;movePlayer(dx/len*sp,dy/len*sp);}
updateCars();
}}
if(toastT>0){toastT--;if(toastT<=0) document.getElementById('toast').style.display='none';}
hud();
draw();
requestAnimationFrame(frame);
}
document.getElementById('btn-login').onclick=function(){
var email=(document.getElementById('em').value||'').trim().toLowerCase();
if(email.indexOf('@')<1){alert('Enter the email you use on AAG Legal.');return;}
load(email);
if(!state.gender){document.getElementById('login').classList.add('hidden');document.getElementById('gender').classList.remove('hidden');}
else bootPlay();
};
var picks=document.querySelectorAll('[data-g]'),pi;
for(pi=0;pi<picks.length;pi++){
picks[pi].onclick=function(){state.gender=this.getAttribute('data-g');player.gender=state.gender;save();bootPlay();};
}
document.getElementById('btn-do').onclick=function(){
document.getElementById('file').classList.add('hidden');modalOpen=false;completeStep();
};
document.getElementById('btn-later').onclick=function(){
document.getElementById('file').classList.add('hidden');modalOpen=false;
};
document.getElementById('act').onclick=function(e){e.preventDefault();openFile();};
var padBtns=document.querySelectorAll('#pad button'),pbi;
for(pbi=0;pbi<padBtns.length;pbi++){
(function(btn){
var d=btn.getAttribute('data-d');
var on=function(ev){ev.preventDefault();hold[d]=1;};
var off=function(){hold[d]=0;};
btn.addEventListener('touchstart',on,{passive:false});
btn.addEventListener('touchend',off);
btn.addEventListener('mousedown',on);
btn.addEventListener('mouseup',off);
btn.addEventListener('mouseleave',off);
})(padBtns[pbi]);
}
window.addEventListener('keydown',function(e){
keys[e.key.toLowerCase()]=1;
if(e.key==='e'||e.key==='E'||e.key===' '){e.preventDefault();openFile();}
var arrows=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
if(arrows.indexOf(e.key)>=0) e.preventDefault();
});
window.addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=0;});
window.addEventListener('resize',resize);
buildCity();
bakeCity();
resize();
frame();
})();

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
var playing=false,modalOpen=false,shake=0,toastT=0,warn30=0,canteenHit=0;
var solids=[],yards=[],walkers=[];
var lastT=0;
var roads=[
{x:0,y:40,w:2100,h:110,name:'COURT ROAD'},
{x:0,y:560,w:2100,h:96,name:'FILING STREET'},
{x:0,y:1040,w:2100,h:90,name:'HOUSE LANE'},
{x:40,y:0,w:104,h:1500,name:'STATION ROAD'},
{x:708,y:0,w:112,h:1500,name:'COURT LANE'},
{x:1310,y:0,w:104,h:1500,name:'CHAMBERS ROAD'},
{x:1860,y:0,w:96,h:1500,name:'EAST LANE'}
];
var yardDefs=[
{x:190,y:175,w:490,h:420,gate:'s',wallY:500,kind:'court',name:'COURT CAMPUS'},
{x:860,y:175,w:420,h:420,gate:'s',wallY:500,kind:'stone',name:'CHAMBERS'},
{x:160,y:700,w:520,h:155,gate:'w',wallX:220,kind:'police',name:'POLICE LINES'}
];
var park={x:1488,y:1160,w:340,h:300,name:'DISTRICT PARK'};
var BUILDINGS=[
{id:'court',name:'DISTRICT COURT',kind:'court',x:210,y:198,w:280,h:140,door:'s'},
{id:'tower',name:'',kind:'tower',x:530,y:198,w:58,h:78,door:'s'},
{id:'filing',name:'FILING COUNTER',kind:'gov',x:210,y:400,w:200,h:52,door:'s'},
{id:'registry',name:'COPYING SECTION',kind:'gov',x:440,y:400,w:200,h:52,door:'s'},
{id:'office',name:'AAG LAW FIRM',kind:'firm',x:890,y:200,w:170,h:130,door:'s'},
{id:'chamber',name:'SENIOR CHAMBERS',kind:'chamber',x:1090,y:196,w:160,h:140,door:'s'},
{id:'stamps',name:'STAMP WINDOW',kind:'shop',x:890,y:400,w:155,h:55,door:'s'},
{id:'bar',name:'BAR CANTEEN',kind:'bar',x:1075,y:400,w:165,h:55,door:'s'},
{id:'bank',name:'CITY BANK',kind:'bank',x:1458,y:210,w:168,h:150,door:'w'},
{id:'typist',name:'TYPING HALL',kind:'shop',x:900,y:704,w:190,h:100,door:'n'},
{id:'house9',name:'HOUSE 9',kind:'house',x:1140,y:710,w:140,h:100,door:'n',wall:'#f3e2c4',roof:'#7a3b32',roof2:'#b5654a'},
{id:'police',name:'POLICE STATION',kind:'police',x:280,y:724,w:230,h:108,door:'w'},
{id:'lockup',name:'LOCK-UP',kind:'lockup',x:530,y:734,w:120,h:90,door:'s'},
{id:'client',name:'RAMESH HOUSE',kind:'house',x:200,y:868,w:165,h:124,door:'s',wall:'#f6e7cf',roof:'#8d3428',roof2:'#c45a3a'},
{id:'house2',name:'HOUSE 12',kind:'house',x:390,y:878,w:145,h:114,door:'s',wall:'#f3d2c2',roof:'#6b5344',roof2:'#8d6b4e'},
{id:'house3',name:'HOUSE 14',kind:'house',x:560,y:872,w:130,h:120,door:'s',wall:'#efe6b8',roof:'#7a4a38',roof2:'#c4844a'},
{id:'asha',name:'ASHA HOUSE',kind:'house',x:860,y:868,w:170,h:124,door:'s',wall:'#f8eef2',roof:'#7c2d3a',roof2:'#c45a68'},
{id:'house5',name:'HOUSE 21',kind:'house',x:1060,y:876,w:150,h:116,door:'s',wall:'#e7f0dc',roof:'#3f5c3a',roof2:'#6d8a55'},
{id:'hostel',name:'LAW HOSTEL',kind:'hostel',x:1458,y:700,w:190,h:130,door:'w'},
{id:'east1',name:'HOUSE 30',kind:'house',x:1688,y:860,w:142,h:124,door:'e',wall:'#f7e3c4',roof:'#8d3a2a',roof2:'#d06a42'},
{id:'house6',name:'HOUSE 4',kind:'house',x:200,y:1178,w:155,h:112,door:'n',wall:'#f4e6d4',roof:'#6e2e2e',roof2:'#a85040'},
{id:'house7',name:'HOUSE 6',kind:'house',x:390,y:1186,w:140,h:108,door:'n',wall:'#e7e0f2',roof:'#4a3f66',roof2:'#7a6aa0'},
{id:'house8',name:'MEHRA HOUSE',kind:'house',x:860,y:1176,w:160,h:116,door:'n',wall:'#f8f1dc',roof:'#8a6230',roof2:'#d09a48'},
{id:'house10',name:'HOUSE 28',kind:'house',x:1060,y:1184,w:145,h:108,door:'n',wall:'#fde8d8',roof:'#5c4030',roof2:'#a87858'}
];
var RANKS=[{need:0,name:'Junior Advocate'},{need:2,name:'Associate'},{need:4,name:'Senior Associate'},{need:6,name:'Counsel'},{need:8,name:'Senior Counsel'}];
var MISSIONS=[
{id:'brief',title:'The Night Call',steps:[
{poi:'office',near:'Mrs Kumar is in the front room',brief:'AAG Law. Mrs Kumar wants a promise tonight. Do not give one.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',ctype:'BAIL APPLICATION  -  PAPERS NOT READY',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-014',status:'Incomplete. No FIR in the file.',
client:'Ramesh Kumar, age 34, mechanic, Workshop Road',opp:'State',forum:'AAG Law Firm. Nothing filed.',
ps:'North Gate police station, as the family says. Not on paper.',next:'None. They want tonight.',
law:'Bail. Copy sections from the FIR only. Do not guess a section.',
papers:'1. Vakalatnama, signed this morning\n2. FIR copy  -  missing\n3. Custody note  -  missing\n4. Surety papers  -  missing',
facts:'Police picked Ramesh up last night from the workshop. Mrs Kumar is in the front room. She wants you to say he will be out tonight.',
job:'Read what is actually in the file. Then choose what you tell them.',
caution:'A signed vakalatnama is not a bail order.'},
choices:[
{t:'A. Call it. Tell them bail will happen tonight.',ok:false,rep:-8,why:'STANDING -8. A vakalatnama is not a bail order. You just made a promise the file cannot keep.'},
{t:'B. Say you have no result until the FIR is in the file. List every missing paper for Mrs Kumar.',ok:true,rep:8,got:'Client file',why:'File note: Mrs Kumar told there is no result yet. Gap list started.'}
]},
{poi:'police',near:'Constable Iqbal has the FIR. Not the lock-up.',brief:'North Gate. Iqbal will recite sections. Copy the paper.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',ctype:'BAIL  -  FIR STILL TO BE COPIED',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-014',status:'You are at the station. Sections are blank.',
client:'Ramesh Kumar, age 34, mechanic',opp:'State',forum:'Not filed.',
ps:'North Gate police station. Read the name on the FIR, do not trust the signboard only.',next:'None.',
law:'The charge is the FIR, not the family story.',
papers:'1. Vakalatnama\n2. Blank lines: FIR number, date, station, sections\n3. Verbal account from the constable  -  not a paper',
facts:'Constable Iqbal says he will tell you the sections. He does not want to hand the FIR across.',
job:'Decide what you are willing to write down.',
caution:'If it is not on the paper, you do not have a section.'},
choices:[
{t:'A. Note the sections he recites. Do not waste time on a copy.',ok:false,rep:-8,why:'STANDING -8. A recited section is not the FIR. You may have written the wrong charge.'},
{t:'B. Insist on the FIR. Copy number, date, station, and sections from the page.',ok:true,rep:10,got:'FIR copy',why:'File note: FIR particulars copied from the paper, not from memory.'}
]},
{poi:'office',near:'Senior Shah is back at the table',brief:'Back to AAG Law. Tell Senior Shah the sections once. Stop.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',ctype:'FOR THE SENIOR',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-014',status:'FIR copy is in hand. Senior has not seen it.',
client:'Ramesh Kumar',opp:'State',forum:'AAG Law Firm',ps:'As written on the FIR.',next:'Senior decides if a draft is possible.',
law:'Grounds come from the FIR and the instructions. Not from a theory.',
papers:'1. FIR copy\n2. Gap list\n3. Family theory, told in the corridor  -  not in the FIR',
facts:'The family wants a ground added: that the police had a grudge about a workshop dispute. That line is not in the FIR.',
job:'What do you put in front of the senior?',
caution:'Do not brief him from the corridor version.'},
choices:[
{t:'A. Add the grudge. It is the real story and it will help.',ok:false,rep:-8,why:'STANDING -8. A ground you cannot point to in the FIR does not go in the petition.'},
{t:'B. Read only the sections you copied. Stop. Leave the theory out.',ok:true,rep:10,got:'',why:'File note: senior briefed from the FIR only. Time of return written on the cover.'}
]}
]},
{id:'surety',title:'The Surety',steps:[
{poi:'client',near:'Uncle Suresh is at Ramesh house',brief:'House Lane. Write only what Uncle Suresh can show today.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',ctype:'SURETY INSTRUCTIONS',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-014',status:'FIR is in. Surety is still a conversation.',
client:'Ramesh Kumar, through his uncle Suresh',opp:'State',forum:'Draft not started.',
ps:'North Gate police station',next:'No date. Not filed.',
law:'A surety is a person the court can proceed against if the accused does not appear.',
papers:'1. FIR\n2. Uncle says he owns the house\n3. Papers he can actually show today  -  not listed yet',
facts:'Suresh says the sale deed is with the bank. He wants the petition to say he owns the house anyway. He can show an electricity bill in his name.',
job:'What goes in the surety note?',
caution:'A promise at the kitchen table is not a document.'},
choices:[
{t:'A. Write that he owns the house. He said it clearly.',ok:false,rep:-8,why:'STANDING -8. No title paper, no ownership line. You would be filing his sentence as a fact.'},
{t:'B. Write: bill in his name, sale deed not here, do not plead ownership.',ok:true,rep:8,got:'Surety list',why:'File note: surety limited to the bill he showed. Missing deed marked.'}
]},
{poi:'chamber',near:'Senior Shah has the red pencil out',brief:'Chambers. Senior Shah struck a ground. Leave it struck.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',ctype:'GROUNDS, AFTER CORRECTION',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-014',status:'Draft has a red line through one ground.',
client:'Ramesh Kumar',opp:'State',forum:'Senior chambers',ps:'North Gate police station',next:'Filing only after this draft.',
law:'Every ground must be something you can point to.',
papers:'1. FIR\n2. Surety list\n3. Draft with one ground struck by the senior\n4. Your wish to put that ground back',
facts:'The struck ground was the strongest sentence in the draft. The senior struck it because the FIR does not support it. The corridor is empty. You could write it back.',
job:'What do you do with the red line?',
caution:'A ground put back in the corridor is your ground, not his.'},
choices:[
{t:'A. Put it back. He was in a hurry. It sounds like a real ground.',ok:false,rep:-10,why:'STANDING -10. You restored a ground the senior killed. If it fails, it is yours.'},
{t:'B. Leave the strike. Carry only what the red line still allows.',ok:true,rep:10,got:'Checked draft',why:'File note: draft stays as marked. No corridor edits.'}
]},
{poi:'filing',near:'Clerk Meera wants a diary number, or nothing',brief:'Filing counter. Clerk Meera says the stamp is short.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',ctype:'FILING SET',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-014',status:'Set is in the bag. Clerk says the stamp is short.',
client:'Ramesh Kumar',opp:'State',forum:'District court filing counter',ps:'North Gate police station',
next:'Diary number, to be written before you leave.',
law:'Stamps, index, page numbers, then the diary number.',
papers:'1. Index\n2. Petition, as marked\n3. FIR copy\n4. Vakalatnama\n5. Stamp the clerk says is short\n6. Stamp window is across this campus',
facts:'The clerk will not take the set. Another junior tells you to write filed in the office diary anyway and fix the stamp tomorrow.',
job:'What do you write, and when do you leave?',
caution:'A set in the bag is not a filing.'},
choices:[
{t:'A. Write filed. Leave. The stamp can be cured tomorrow.',ok:false,rep:-10,why:'STANDING -10. No diary number, no file note that says filed. Tomorrow is a different board.'},
{t:'B. Cross to the stamp window, file, copy the diary number on the cover before the gate.',ok:true,rep:12,got:'Diary number',why:'File note: diary number and date on the cover. Stamp cured before filing.'}
]}
]},
{id:'cheque',title:'The Cheque',steps:[
{poi:'asha',near:'Asha Jain is packing. Read the dates.',brief:'Asha house. She wants the cover date moved. Do not invent one.',file:{
court:'IN THE COURT OF THE JUDICIAL MAGISTRATE',ctype:'COMPLAINT UNDER SECTION 138, NEGOTIABLE INSTRUMENTS ACT, 1881',
cause:'Asha Jain, Meera Textiles\nversus\nNitin Goyal',no:'AAG-2026-031',status:'Reply date is already on the cover.',
client:'Asha Jain, proprietor, Meera Textiles',opp:'Nitin Goyal, who signed the cheque',forum:'Reply is still a draft.',
ps:'Not a police file. The return memo is the paper that matters.',next:'The date the senior marked on the cover.',
law:'Section 138. Use the dates already marked. Do not invent a last date.',
papers:'1. Cheque, Rs 2,40,000, 2 March 2026\n2. Return memo, funds insufficient\n3. Notice received 18 March 2026\n4. Cover date for the reply, already marked',
facts:'Asha is leaving town. She wants the reply date moved by a week. The senior is not here. The cover already has a date.',
job:'What date do you write in the list?',
caution:'Travel does not move a date the senior has marked.'},
choices:[
{t:'A. Move the reply date. She cannot be in town, and the court will understand.',ok:false,rep:-8,why:'STANDING -8. You invented a date. The cover date still stands.'},
{t:'B. Read only cheque, memo, notice, and the cover date. Change nothing.',ok:true,rep:8,got:'Date sheet',why:'File note: date sheet copied from the papers. Cover date unchanged.'}
]},
{poi:'office',near:'The reply is on your desk, not in the corridor',brief:'AAG Law. Asha did not admit the full amount. Do not admit it for her.',file:{
court:'IN THE COURT OF THE JUDICIAL MAGISTRATE',ctype:'REPLY TO NOTICE  -  SECTION 138',
cause:'Asha Jain\nversus\nNitin Goyal',no:'AAG-2026-031',status:'Date sheet is in. Reply is not sent.',
client:'Asha Jain, Meera Textiles',opp:'Nitin Goyal',forum:'Firm draft',ps:'Not a police file.',next:'Cover date.',
law:'The reply can dispute the cheque and still leave settlement open.',
papers:'1. Date sheet\n2. Her words: she disputes the cheque\n3. A polite sentence that would admit Rs 2,40,000',
facts:'A polite admission feels safer. She did not say she owes the full amount. She said the cheque is not her liability in the way the notice claims.',
job:'What does the draft admit?',
caution:'Do not admit more than she said, in her words.'},
choices:[
{t:'A. Admit the full amount. It sounds reasonable and may settle the matter.',ok:false,rep:-10,why:'STANDING -10. You admitted Rs 2,40,000. She never said that.'},
{t:'B. Dispute what she disputes. Offer settlement only if she later says the figure.',ok:true,rep:10,got:'Reply draft',why:'File note: no admission of the amount. Gaps left in pencil.'}
]},
{poi:'registry',near:'The copy clerk has two seals. Check the name.',brief:'Copying section. A photocopy is not a certified copy.',file:{
court:'IN THE COURT OF THE JUDICIAL MAGISTRATE',ctype:'ANNEXURES',
cause:'Asha Jain\nversus\nNitin Goyal',no:'AAG-2026-031',status:'Two copies ordered. One seal is still wet. One name looks wrong.',
client:'Asha Jain',opp:'Nitin Goyal',forum:'Copying section',ps:'Not applicable.',next:'Do not list a copy you have not checked.',
law:'A certified copy needs the seal and the date of the copy.',
papers:'1. Reply draft\n2. Copy with seal and date, right case name\n3. Copy with no seal\n4. Copy with a seal but a different case name\n5. Plain photocopy in the bag',
facts:'Your matter is in the next few on the board. A typist says staple whatever you have. The reader is still stamping the last page.',
job:'What do you annex?',
caution:'A wrong copy is worse than no copy. You will read from it.'},
choices:[
{t:'A. Staple the photocopy and the no-seal copy. The board will not wait.',ok:false,rep:-10,why:'STANDING -10. A photocopy with no seal is not a certified copy. You were about to read from it.'},
{t:'B. Take only the copy with the right name, the seal, and the date. Leave the others out.',ok:true,rep:12,got:'Certified copies',why:'File note: one certified copy checked. Wrong-name copy left at the counter.'}
]}
]},
{id:'hearing',title:'Board Day',timed:true,seconds:240,steps:[
{poi:'registry',near:'Match Ramesh Kumar before you run',brief:'Clock is running. The copy clerk has two Ramesh files.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',ctype:'BAIL  -  COPY FOR THE HEARING',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-014',status:'Hearing is today. One seal is faint. One name is close.',
client:'Ramesh Kumar',opp:'State',forum:'Copying section, then the bail court',ps:'North Gate police station',next:'Today. Item not yet taken from the board.',
law:'The copy you carry must match the case name on the brief.',
papers:'1. Diary number on the cover\n2. Copy, faint seal, correct name\n3. Copy, clear seal, name of a different Ramesh',
facts:'You are late. The clear seal is tempting. The name is Ramesh, but not this Ramesh, and not this station.',
job:'Which copy enters the court?',
caution:'A wrong copy is worse than no copy.'},
choices:[
{t:'A. Take the clear seal. The name is close and the clock is running.',ok:false,rep:-10,why:'STANDING -10. You picked a different case. You would have read the wrong order.'},
{t:'B. Take the faint seal only if the name matches this file. Leave the other.',ok:true,rep:8,got:'Sealed copy',why:'File note: name matched before the copy was carried.'}
]},
{poi:'chamber',near:'Senior Shah will not hear a confession you cannot show',brief:'Chambers. One line per event. No confession that is not in the file.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',ctype:'LIST OF DATES',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-014',status:'What you will say is not locked.',
client:'Ramesh Kumar',opp:'State',forum:'Senior chambers',ps:'North Gate police station',next:'Today, bail board.',
law:'A list of dates is a list. It is not a speech.',
papers:'1. Arrest, as in the FIR\n2. FIR date and sections\n3. Surety papers you actually filed\n4. Diary number\n5. A line you want: confession at the station',
facts:'There is no confession paper. A friend says the court likes that line. If you keep it, you will say it when the item is called.',
job:'Does the confession line stay?',
caution:'If it is not on the list, you do not say it. If it is on the list, you will.'},
choices:[
{t:'A. Keep the confession line. It is the only line that moves a court.',ok:false,rep:-10,why:'STANDING -10. You armed yourself with a fact you cannot show. That is how a junior gets stopped.'},
{t:'B. Strike it. Arrest, FIR, surety, diary number. Nothing else.',ok:true,rep:10,got:'List of dates',why:'File note: list locked. Confession line struck and still visible so it is not put back.'}
]},
{poi:'court',near:'Usher is calling item 14. Not 12. Not 18.',brief:'Court steps. Item 14 is Ramesh. The clock is the board.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',ctype:'BAIL BOARD  -  TODAY',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-014',status:'You are outside. Presence is not marked.',
client:'Ramesh Kumar',opp:'State',forum:'Bail board',ps:'North Gate police station',next:'Write it before you leave the room.',
law:'Presence is marked when your item is called, not when you enter the campus.',
papers:'1. Paper book\n2. List of dates\n3. Diary number\n4. Cause list on the board:\n   Item 12  State versus a workshop theft, different name\n   Item 14  Ramesh Kumar versus State, bail\n   Item 18  Mehta versus Gupta, civil',
facts:'Item 12 is being called now. The courtroom looks free if you stand up. Item 18 is a senior you know. Your item is 14. Mehta junior is already inside for 12.',
job:'Which item do you stand for?',
caution:'Do not leave for the canteen while 14 is in the next few.'},
choices:[
{t:'A. Item 12. Stand up now, while the court is listening.',ok:false,rep:-8,why:'STANDING -8. That is not your matter. You were about to appear in someone else file.'},
{t:'B. Item 18. Mention Mehta as well. It will be remembered.',ok:false,rep:-6,why:'STANDING -6. Item 18 is not your brief. Do not borrow a senior matter.'},
{t:'C. Item 14. Mark presence. Say only the list. Write the next date. Stop.',ok:true,rep:14,got:'',why:'File note: presence on item 14. Next date written before leaving the room.'}
]}
]},
{id:'order',title:'The Order',steps:[
{poi:'office',near:'Read the last page before Mrs Kumar does',brief:'AAG Law. Last page of the order. Not the family version.',file:{
court:'IN THE HIGHER COURT',ctype:'CHALLENGE TO THE BAIL ORDER',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-052',status:'12 page order. Operative part not noted.',
client:'Ramesh Kumar',opp:'State',forum:'Higher court paper book',ps:'North Gate. Custody not checked today.',next:'No date until the set is ready.',
law:'Read the last page first. That is what was decided.',
papers:'1. Order, 12 pages\n2. Old file AAG-2026-014\n3. Family note, middle pages only\n4. Two blank lines: refused, and still open',
facts:'The family has read the angry middle. They say the whole bail was rejected. The last page may be narrower than their fear. You have not turned to it.',
job:'What do you brief?',
caution:'Do not brief the senior from the family summary.'},
choices:[
{t:'A. Brief the family version. They lived it. The middle pages sound like a rejection.',ok:false,rep:-8,why:'STANDING -8. You briefed a summary. The operative part is the order.'},
{t:'B. Last page first. Two lines: what was refused, what is still open. Then the reasons.',ok:true,rep:10,got:'Order notes',why:'File note: operative part in two lines. Family summary kept out of the brief.'}
]},
{poi:'police',near:'Ask Iqbal: is he in, and as of what time?',brief:'North Gate lock-up. Confirm custody before any new paper.',file:{
court:'IN THE HIGHER COURT',ctype:'CUSTODY CHECK',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-052',status:'Order notes are in. Custody today is unknown.',
client:'Ramesh Kumar',opp:'State',forum:'Do not draft until this sentence exists.',ps:'North Gate lock-up',next:'If he is out, call the firm first.',
law:'A custody brief and a person already released are different cases.',
papers:'1. Order notes\n2. Blank line: in or out, and the time\n3. Old FIR number, so you ask about the right person',
facts:'The family is sure he is inside. They last saw him two days ago. Nobody has checked the lock-up today. A draft custody application is already in your bag.',
job:'Do you file it on their certainty?',
caution:'Do not file a custody application for a person who is already out.'},
choices:[
{t:'A. File it. The family is sure, and delay looks weak.',ok:false,rep:-10,why:'STANDING -10. You were about to file custody blind. If he is out, the application is a false instruction.'},
{t:'B. Confirm in or out, and the time. If he is out, call the firm before any draft.',ok:true,rep:10,got:'Custody note',why:'File note: custody checked, with the time. Firm to be called if he is out.'}
]},
{poi:'court',near:'Tell them if a page is missing',brief:'Higher court window. Missing page is said out loud.',file:{
court:'IN THE HIGHER COURT',ctype:'PAPER BOOK',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-052',status:'Indexed set. Page 7 is not in it.',
client:'Ramesh Kumar',opp:'State',forum:'Court officer at the window',ps:'Custody note is in the set.',next:'Acknowledgment, or a spoken missing page.',
law:'This is a filed set, not a casual mention.',
papers:'1. Index\n2. Operative-part note\n3. Custody note with time\n4. Copy of the order\n5. Page 7, listed in the index, not in the set',
facts:'The officer is fast and irritable. If you say nothing, the set may be taken. Page 7 is the page that matches the operative part.',
job:'Do you hope, or do you speak?',
caution:'Hope is not a page.'},
choices:[
{t:'A. Hand it in. Do not annoy the officer. Nobody may turn to page 7.',ok:false,rep:-10,why:'STANDING -10. You filed an index you cannot meet. That is the page they ask for.'},
{t:'B. Say page 7 is missing. Do not add an oral request that is not in the index.',ok:true,rep:12,got:'',why:'File note: missing page disclosed at the window. No extra oral request.'}
]}
]},
{id:'feet',title:'On Your Feet',steps:[
{poi:'chamber',near:'Senior Shah wants one sentence, then silence',brief:'Chambers. If you need a second sentence, you are not ready.',file:{
court:'IN THE HIGHER COURT',ctype:'MENTION  -  ONE ASK',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-052',status:'The senior is in another court. You will mention it.',
client:'Ramesh Kumar',opp:'State',forum:'Chambers, then the board',ps:'As in the custody note.',next:'One date. Not a speech.',
law:'A mention is one ask. The provision. The date. Then stop.',
papers:'1. Paper book\n2. A speech of two sentences\n3. One sentence: the provision, the date, stop',
facts:'You want the court to understand the family. That is a second sentence. You were not given permission to tell the story.',
job:'Which version do you take to the board?',
caution:'The second sentence is how a mention becomes an argument you are not ready for.'},
choices:[
{t:'A. Two sentences. The story, then the date. Otherwise they will not care.',ok:false,rep:-8,why:'STANDING -8. You needed a second sentence. You are not ready to mention it.'},
{t:'B. One sentence. Provision, date, stop. Cut every other word.',ok:true,rep:10,got:'One-line ask',why:'File note: one sentence locked. Extra words struck.'}
]},
{poi:'court',near:'Say the line to the court. Then stop.',brief:'Board. One line. If you do not know, take instruction.',timed:true,seconds:150,file:{
court:'IN THE HIGHER COURT',ctype:'THE MENTION',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-052',status:'Your item will be called in a crowd.',
client:'Ramesh Kumar',opp:'State',forum:'Higher court board',ps:'As in the file.',next:'Write the words you heard, not the words you wish.',
law:'Stop when the judge stops you.',
papers:'1. One-line ask\n2. Paper book\n3. Blank note: next date, direction, what was not argued',
facts:'The judge may ask a fact that is not in your sentence. You remember something from the family. It is not in the file you are holding.',
job:'What do you do with the extra fact?',
caution:'Do not correct the court from a memory that is not in the brief.'},
choices:[
{t:'A. Add the family fact. A mention is useless if the court is left with the wrong picture.',ok:false,rep:-10,why:'STANDING -10. You argued from memory after the matter had moved. That fact was not in the brief.'},
{t:'B. Say the one line. If asked what you do not have, say you will take instruction. Write what you heard.',ok:true,rep:14,got:'Court note',why:'File note: one line said. Unknown point taken as instruction. Next date in the words you heard.'}
]},
{poi:'office',near:'Write the diary before you leave the firm',brief:'Same day. The diary, not a chat to Senior Shah.',file:{
court:'IN THE HIGHER COURT',ctype:'OFFICE DIARY  -  SAME DAY',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-052',status:'Mention is over. The diary is blank.',
client:'Ramesh Kumar',opp:'State',forum:'AAG Law Firm',ps:'As already noted.',next:'Copy it to the cover before you go.',
law:'A diary note is written the same day, before you leave.',
papers:'1. Court note in your hand\n2. Blank diary\n3. A chat box, which is faster',
facts:'The next person who opens this file was not in court. A chat to the senior feels like the same thing. It is not in the file.',
job:'Where does the day go?',
caution:'If it is not in the diary, the firm will treat it as not said.'},
choices:[
{t:'A. Message the senior. Write the file tomorrow when the office is quiet.',ok:false,rep:-8,why:'STANDING -8. Tomorrow diary is a different day. The chat is not the file.'},
{t:'B. Write it now: date, court, the ask, the words you heard, the next date, what you did not argue.',ok:true,rep:12,got:'',why:'Diary closed same day. Cover updated. City can rest.'}
]}
]},
{id:'fair',title:'The Fair Copy',steps:[
{poi:'typist',near:'Raju has a fair copy. Read it against the draft.',brief:'Typing hall. Raju improved a date. Do not sign that.',file:{
court:'IN THE COURT OF THE CIVIL JUDGE',ctype:'REPLY  -  FAIR COPY NOT CHECKED',
cause:'Lata Mehra\nversus\nOm Prakash',no:'AAG-2026-066',status:'Draft is marked. Fair copy is not signed.',
client:'Lata Mehra, Mehra House',opp:'Om Prakash, the neighbour',forum:'Typing hall. Not filed.',
ps:'Not a police file.',next:'The date on the draft, not the date Raju prefers.',
law:'A fair copy is checked against the draft before anyone signs it.',
papers:'1. Draft with the senior date\n2. Fair copy, one date changed by the typist\n3. Blank signature line',
facts:'Raju says the new date looks cleaner and the court will not notice. Lata is not here. The draft on your desk still has the old date.',
job:'Which date survives?',
caution:'A cleaner page is not a correction.'},
choices:[
{t:'A. Sign the fair copy. Raju types these every day and the new date is tidier.',ok:false,rep:-8,why:'STANDING -8. You signed a date the draft does not have.'},
{t:'B. Send it back. The fair copy must match the draft, including the date.',ok:true,rep:8,got:'Checked draft',why:'File note: fair copy returned. Date left as the draft has it.'}
]},
{poi:'stamps',near:'Gopal is at the stamp window',brief:'Stamp window. Same value is not the same court.',file:{
court:'IN THE COURT OF THE CIVIL JUDGE',ctype:'COURT FEE',
cause:'Lata Mehra\nversus\nOm Prakash',no:'AAG-2026-066',status:'Fair copy matches. Fee not checked.',
client:'Lata Mehra',opp:'Om Prakash',forum:'Stamp window, district court',
ps:'Not a police file.',next:'The stamp must name this court.',
law:'The stamp is for the court named on the petition, not for a nearby counter.',
papers:'1. Fair copy, dates matched\n2. Stamp Gopal offers, right value, different court name\n3. The petition heading',
facts:'Gopal says the value is the same and the reader never looks at the court name. The heading of your petition is the civil judge, not the court printed on his stamp.',
job:'Which stamp goes on the set?',
caution:'A right amount on the wrong court is still the wrong stamp.'},
choices:[
{t:'A. Take his stamp. The money is right and the board will not wait.',ok:false,rep:-8,why:'STANDING -8. You were about to file a fee for a different court.'},
{t:'B. Ask for the stamp that names this court. Wait if he has to write it.',ok:true,rep:10,got:'Court stamp',why:'File note: stamp matches the court on the heading.'}
]},
{poi:'filing',near:'Clerk Meera can see a missing page',brief:'Filing counter. A missing page is not filed later.',file:{
court:'IN THE COURT OF THE CIVIL JUDGE',ctype:'FILING SET  -  PAGE 4',
cause:'Lata Mehra\nversus\nOm Prakash',no:'AAG-2026-066',status:'Set is in the bag. Page 4 is still on the copier.',
client:'Lata Mehra',opp:'Om Prakash',forum:'District court filing counter',
ps:'Not a police file.',next:'Diary number only for the set she actually takes.',
law:'The index, the page numbers, and the papers must be the same set.',
papers:'1. Index listing page 4\n2. Pages 1 to 3 and 5\n3. Page 4, still warm on the copier\n4. Clerk offer: take a number now, insert page 4 after lunch',
facts:'Clerk Meera is being kind. She says she will hold the set open. Another junior says everyone does this on a Friday.',
job:'When do you write the diary number?',
caution:'A number on an incomplete set is a different filing from the one in your index.'},
choices:[
{t:'A. Take the number. Run back with page 4 before she closes the register.',ok:false,rep:-10,why:'STANDING -10. You took a diary number for a set that did not yet have page 4.'},
{t:'B. Wait. Put page 4 in. Then watch her number the set you can point to.',ok:true,rep:12,got:'Diary number',why:'File note: page 4 in the set before the number. Index matches.'}
]}
]},
{id:'student',title:'The Student',steps:[
{poi:'hostel',near:'Meher Sen is outside the law hostel',brief:'Hostel gate. She wants you to stand up tomorrow. You are not on the vakalatnama.',file:{
court:'IN THE COURT OF THE CIVIL JUDGE',ctype:'WITNESS SUMMONS  -  NO AUTHORITY YET',
cause:'Lata Mehra\nversus\nOm Prakash',no:'AAG-2026-066',status:'Meher has a summons. You have no vakalatnama.',
client:'Not you yet. Meher Sen is a student in the hostel. Lata is her aunt.',opp:'Om Prakash',forum:'Law hostel steps. Nothing filed by you.',
ps:'Not a police file.',next:'Tomorrow, if someone authorised appears.',
law:'A summons is not a request to a friend. Appearance needs authority.',
papers:'1. Witness summons for Lata Mehra\n2. No vakalatnama\n3. Meher asking you to just stand up and say the date',
facts:'Meher is frightened and late for class. She says the court only needs a person in a black coat. She will message her aunt later.',
job:'What do you tell Meher?',
caution:'Sympathy is not a vakalatnama.'},
choices:[
{t:'A. Tell her you will appear. It is only a date, and she is terrified.',ok:false,rep:-10,why:'STANDING -10. You promised to appear with no authority in the file.'},
{t:'B. Walk her to the firm. No appearance until someone who can sign is in the file.',ok:true,rep:10,got:'Summons copy',why:'File note: Meher told there is no appearance without authority. Summons brought to the firm.'}
]},
{poi:'office',near:'Senior Shah has not seen the summons',brief:'AAG Law. Do not draft from the hostel version.',file:{
court:'IN THE COURT OF THE CIVIL JUDGE',ctype:'INSTRUCTIONS',
cause:'Lata Mehra\nversus\nOm Prakash',no:'AAG-2026-066',status:'Summons is on the table. Lata has not signed anything.',
client:'Lata Mehra, if she instructs. Meher is not the client.',opp:'Om Prakash',forum:'AAG Law Firm',
ps:'Not a police file.',next:'No date is yours until the senior says so.',
law:'Instructions come from the person who can engage you, not from a relative in a hurry.',
papers:'1. Summons\n2. Meher account of what her aunt wants\n3. No signed vakalatnama\n4. A draft you could write from the hostel story',
facts:'Meher is sure her aunt wants an adjournment and an apology. That apology is not in any paper. Senior Shah has not come down yet.',
job:'What do you put in front of him?',
caution:'A hostel story does not become instructions.'},
choices:[
{t:'A. Draft the apology. Meher heard it clearly and the senior can sign later.',ok:false,rep:-8,why:'STANDING -8. You drafted an apology nobody in the file has instructed.'},
{t:'B. Show only the summons. Say Meher is not the client. Wait for Lata or the senior.',ok:true,rep:10,got:'Instruction note',why:'File note: summons shown. No hostel draft. Client named as Lata, not Meher.'}
]},
{poi:'chamber',near:'Lata signed one page. Senior Shah marked it.',brief:'Chambers. Do not add a ground she did not sign.',file:{
court:'IN THE COURT OF THE CIVIL JUDGE',ctype:'INSTRUCTIONS, SIGNED',
cause:'Lata Mehra\nversus\nOm Prakash',no:'AAG-2026-066',status:'One page is signed. You wish it said more.',
client:'Lata Mehra',opp:'Om Prakash',forum:'Senior chambers',
ps:'Not a police file.',next:'Diary the signed page before you leave.',
law:'The signed instruction is the whole instruction.',
papers:'1. One signed page: seek a date, no apology\n2. Your better ground, written in the margin, not signed\n3. The office diary, still blank',
facts:'The margin ground is the one you would be proud of. Lata did not sign it. Senior Shah has already gone to court. The diary is the only record of what she did sign.',
job:'What goes in the diary?',
caution:'A ground added after the signature is your ground.'},
choices:[
{t:'A. Diary the margin ground too. She would have signed it if the senior had not left.',ok:false,rep:-8,why:'STANDING -8. You recorded an instruction that was never signed.'},
{t:'B. Diary only the signed page: date, seek a date, no apology. Then go.',ok:true,rep:12,got:'',why:'Diary: signed instruction only. Margin ground left in the margin.'}
]}
]}
];
var cars=[
{ri:0,h:true,t:0.15,dir:1,sp:0.9,col:'#9f2d2d',kind:'car'},
{ri:0,h:true,t:0.62,dir:-1,sp:1.05,col:'#1e3a8a',kind:'car'},
{ri:1,h:true,t:0.4,dir:1,sp:0.72,col:'#e6b325',kind:'auto'},
{ri:2,h:true,t:0.28,dir:-1,sp:0.8,col:'#e7e5e4',kind:'bus'},
{ri:4,h:false,t:0.2,dir:1,sp:0.95,col:'#166534',kind:'car'},
{ri:5,h:false,t:0.55,dir:-1,sp:1.02,col:'#334155',kind:'car'},
{ri:3,h:false,t:0.33,dir:1,sp:0.7,col:'#b45309',kind:'auto'}
];
function hash(n){var x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x);}
function wall(x,y,w,h){return {x:x,y:y,w:w,h:h,kind:'wall',name:'',door:'s'};}
function addWalls(yard){
var t=10,g=84,x=yard.x,y=yard.y,w=yard.w,h=yard.h;
solids.push(wall(x,y,w,t));
solids.push(wall(x+w-t,y,t,h));
if(yard.gate==='s'){
var gx=x+w/2-g/2;
var wy=yard.wallY;
solids.push(wall(x,wy,gx-x,t));
solids.push(wall(gx+g,wy,x+w-(gx+g),t));
}else solids.push(wall(x,y+h-t,w,t));
if(yard.gate==='w'){
var gy=y+h/2-g/2;
var wx=yard.wallX;
solids.push(wall(wx,y,t,gy-y));
solids.push(wall(wx,gy+g,t,y+h-(gy+g)));
}else solids.push(wall(x,y,t,h));
}
function buildCity(){
var i,b,s;
solids=[];yards=yardDefs;
for(i=0;i<yardDefs.length;i++) addWalls(yardDefs[i]);
for(i=0;i<BUILDINGS.length;i++){
b=BUILDINGS[i];
s={id:b.id,name:b.name,kind:b.kind,x:b.x,y:b.y,w:b.w,h:b.h,door:b.door||'s',wall:b.wall||'#f4e6d0',roof:b.roof||'#8d3a2a',roof2:b.roof2||'#c46a48'};
solids.push(s);
}
}
function doorOf(b){
if(b.door==='n') return {x:b.x+b.w/2,y:b.y-DOOR};
if(b.door==='w') return {x:b.x-DOOR,y:b.y+b.h/2};
if(b.door==='e') return {x:b.x+b.w+DOOR,y:b.y+b.h/2};
return {x:b.x+b.w/2,y:b.y+b.h+DOOR};
}
function inR(x,y,r){if(x<r.x)return false;if(y<r.y)return false;if(x>r.x+r.w)return false;if(y>r.y+r.h)return false;return true;}
function onPath(x,y){
var i,r;
for(i=0;i<roads.length;i++){
r=roads[i];
if(x>=r.x-PAD){if(x<=r.x+r.w+PAD){if(y>=r.y-PAD){if(y<=r.y+r.h+PAD)return true;}}}
}
for(i=0;i<yards.length;i++) if(inR(x,y,yards[i])) return true;
if(inR(x,y,park)) return true;
return false;
}
function hitsSolid(x,y){
var i,b;
for(i=0;i<solids.length;i++){
b=solids[i];
if(x>b.x-INFL){if(x<b.x+b.w+INFL){if(y>b.y-INFL){if(y<b.y+b.h+INFL)return true;}}}
}
return false;
}
function blocked(x,y){
if(x<14||y<14||x>WORLD_W-14||y>WORLD_H-14) return true;
if(hitsSolid(x,y)) return true;
if(!onPath(x,y)) return true;
return false;
}
function poiById(id){var i;for(i=0;i<solids.length;i++) if(solids[i].id===id) return solids[i];return null;}
function currentStep(){if(state.mi>=MISSIONS.length) return null;return MISSIONS[state.mi].steps[state.si];}
function rankName(){var name=RANKS[0].name,i;for(i=0;i<RANKS.length;i++) if(state.done>=RANKS[i].need) name=RANKS[i].name;return name;}
function standingWord(){if(state.rep>=70) return 'TRUSTED';if(state.rep>=45) return 'STEADY';if(state.rep>=25) return 'SHAKY';return 'ON NOTICE';}
function streetName(){
var best='',bestD=1e9,i,r,d,dx,dy,nx,ny;
for(i=0;i<yards.length;i++){
r=yards[i];
if(player.x>=r.x){if(player.x<=r.x+r.w){if(player.y>=r.y){if(player.y<=r.y+r.h) return r.name;}}}
}
if(player.x>=park.x){if(player.y>=park.y){if(player.x<=park.x+park.w){if(player.y<=park.y+park.h) return park.name;}}}
for(i=0;i<roads.length;i++){
r=roads[i];
nx=player.x; ny=player.y;
if(nx<r.x) nx=r.x;
if(nx>r.x+r.w) nx=r.x+r.w;
if(ny<r.y) ny=r.y;
if(ny>r.y+r.h) ny=r.y+r.h;
dx=player.x-nx; dy=player.y-ny;
d=dx*dx+dy*dy;
if(d<bestD){bestD=d;best=r.name;}
}
if(!best) best='DISTRICT';
return best;
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
state.x=player.x;state.y=player.y;state.gender=player.gender;state.yaw=player.yaw;
try{localStorage.setItem('aag_city_v5_'+state.email,JSON.stringify(state));}catch(e){}
}
function load(email){
var raw=null,s;
try{raw=localStorage.getItem('aag_city_v5_'+email);}catch(e){}
if(!raw){state={email:email,gender:null,rep:40,mi:0,si:0,done:0,x:300,y:96,carry:'',diary:[],timerKey:'',left:0};return;}
try{
s=JSON.parse(raw);
state=s;state.email=email;
if(!state.carry) state.carry='';
if(!state.diary) state.diary=[];
if(!state.timerKey) state.timerKey='';
if(!state.left) state.left=0;
}catch(e){state={email:email,gender:null,rep:40,mi:0,si:0,done:0,x:300,y:96,carry:'',diary:[],timerKey:'',left:0};}
}
function activeKey(){
var m,step;
if(state.mi>=MISSIONS.length) return '';
m=MISSIONS[state.mi];step=currentStep();
if(m.timed) return m.id;
if(step){if(step.timed) return m.id+':'+state.si;}
return '';
}
function timerSeconds(){
var m=MISSIONS[state.mi],step=currentStep();
if(!m) return 0;
if(m.timed) return m.seconds;
if(step){if(step.timed) return step.seconds;}
return 0;
}
function syncTimer(){
var key=activeKey();
if(!key){state.timerKey='';state.left=0;return;}
if(state.timerKey!==key){state.timerKey=key;state.left=timerSeconds();}
}
function clockText(){
var s=Math.max(0,Math.ceil(state.left));
var m=Math.floor(s/60),r=s%60;
var rs=r<10?'0'+r:''+r;
return 'BOARD  '+m+':'+rs;
}
function hud(){
var step=currentStep(),m=null,near=false,p,d,hand,show=false,obj,clk,bar;
if(state.mi<MISSIONS.length) m=MISSIONS[state.mi];
obj=document.getElementById('obj');
if(!playing) obj.textContent='Drag the stick, or use W A S D.\nUp walks forward. Left and right turn you.';
else if(!step) obj.textContent='No open brief.\nThe district is quiet. More files will land later.';
else obj.textContent=streetName()+'\n'+m.title+'  -  '+step.brief;
document.getElementById('rank').textContent=rankName().toUpperCase()+'\n'+standingWord()+'  '+state.rep+'\nFILE '+state.done+'/'+MISSIONS.length;
hand=document.getElementById('hand');
if(playing){if(state.carry){hand.style.display='block';hand.textContent='IN HAND: '+state.carry;}else hand.style.display='none';}
else hand.style.display='none';
clk=document.getElementById('clock');
if(playing){if(state.timerKey){
clk.style.display='block';
clk.textContent=clockText();
if(state.left<45) clk.style.background='#7a1f1f';
else clk.style.background='#1e3a5f';
}else clk.style.display='none';}
else clk.style.display='none';
if(playing){if(step){
p=poiById(step.poi);
if(p){d=doorOf(p);if(Math.hypot(player.x-d.x,player.y-d.y)<78) near=true;}
}}
if(near){if(!modalOpen) show=true;}
bar=document.getElementById('near');
bar.style.display=show?'block':'none';
var actEl=document.getElementById('act');
var mn=document.getElementById('mnum');
var mt=document.getElementById('mtitle');
var ml=document.getElementById('mline');
if(show){
if(mn) mn.textContent='FILE  '+(state.mi+1);
if(mt) mt.textContent=m.title;
if(ml) ml.textContent=step.near||step.brief;
actEl.classList.add('on');
actEl.textContent='OPEN FILE';
}else{
actEl.classList.remove('on');
actEl.textContent='FILE';
}
}
function fillFile(step){
var f=step.file,box,i,b,diary;
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
diary=document.getElementById('fdiary');
if(!state.diary.length) diary.textContent='No note yet. The note is written when you choose.';
else diary.textContent=state.diary.join('\n');
box=document.getElementById('choices');
while(box.firstChild) box.removeChild(box.firstChild);
for(i=0;i<step.choices.length;i++){
b=document.createElement('button');
b.type='button';
b.textContent=step.choices[i].t;
(function(ch){b.addEventListener('click',function(){choose(ch);});})(step.choices[i]);
box.appendChild(b);
}
}
function openFile(){
var step,p,d;
if(!playing) return;
if(modalOpen) return;
step=currentStep();
if(!step) return;
p=poiById(step.poi);
if(!p) return;
d=doorOf(p);
if(Math.hypot(player.x-d.x,player.y-d.y)>78) return;
fillFile(step);
document.getElementById('file').classList.remove('hidden');
document.getElementById('file').scrollTop=0;
modalOpen=true;
}
function flash(text){var t=document.getElementById('toast');t.textContent=text;t.style.display='block';toastT=150;}
function choose(ch){
if(!modalOpen) return;
modalOpen=false;
document.getElementById('file').classList.add('hidden');
if(!ch.ok){
state.rep=Math.max(0,state.rep+ch.rep);
shake=7;
flash(ch.why);
save();hud();
return;
}
state.rep+=ch.rep;
state.diary.push(ch.why);
if(state.diary.length>6) state.diary.shift();
state.carry=ch.got||'';
advance();
}
function advance(){
var m=MISSIONS[state.mi];
state.si++;
if(state.si>=m.steps.length){
state.si=0;state.mi++;state.done++;state.rep+=12;state.carry='';
warn30=0;canteenHit=0;
if(state.mi>=MISSIONS.length) flash('CITY CLEAR\nYou can hold a file without inventing it.');
else flash((m.title+' CLOSED').toUpperCase()+'\n'+MISSIONS[state.mi].title+' is on the desk.');
}else flash('FILE NOTE UPDATED');
syncTimer();
save();hud();
}
function bootPlay(){
player.gender=state.gender||'male';
player.x=state.x||300;player.y=state.y||96;
if(typeof state.yaw==='number') player.yaw=state.yaw;
else player.yaw=0;
playing=true;
document.getElementById('login').classList.add('hidden');
document.getElementById('gender').classList.add('hidden');
syncTimer();
hud();
syncCam();
}
function carPos(c){
var road=roads[c.ri],span,x,y,w,h;
w=46;h=20;
if(c.kind==='bus'){w=86;h=24;}
if(c.kind==='auto'){w=30;h=18;}
if(c.h){
span=Math.max(40,road.w-160);
x=road.x+70+((c.t%1+1)%1)*span;
y=road.y+road.h/2;
return {x:x,y:y,w:w,h:h,hdir:true,dir:c.dir};
}
span=Math.max(40,road.h-160);
y=road.y+70+((c.t%1+1)%1)*span;
x=road.x+road.w/2;
return {x:x,y:y,w:h,h:w,hdir:false,dir:c.dir};
}
function updateCars(){
var i,c,p,push;
for(i=0;i<cars.length;i++){
c=cars[i];
c.t+=c.dir*c.sp*0.0014;
if(c.t>0.96){c.t=0.96;c.dir=-1;}
if(c.t<0.04){c.t=0.04;c.dir=1;}
p=carPos(c);
push=c.kind==='bus'?20:14;
if(Math.abs(player.x-p.x)<(c.kind==='bus'?48:30)){if(Math.abs(player.y-p.y)<22){
if(c.h){if(!blocked(player.x+c.dir*push,player.y)) player.x+=c.dir*push;}
else {if(!blocked(player.x,player.y+c.dir*push)) player.y+=c.dir*push;}
shake=4;
}}
}
}
function initWalkers(){
var specs=[
{x:250,y:118,axis:'x',min:180,max:640,col:'#111',kind:'law'},
{x:900,y:118,axis:'x',min:760,max:1400,col:'#111',kind:'law'},
{x:400,y:610,axis:'x',min:200,max:680,col:'#7c6a32',kind:'civ'},
{x:980,y:620,axis:'x',min:860,max:1280,col:'#1d4e89',kind:'civ'},
{x:120,y:400,axis:'y',min:200,max:520,col:'#7c6a32',kind:'cop'},
{x:760,y:800,axis:'y',min:200,max:1000,col:'#111',kind:'law'},
{x:1360,y:400,axis:'y',min:220,max:980,col:'#9a3412',kind:'civ'},
{x:500,y:1090,axis:'x',min:200,max:1100,col:'#7c243c',kind:'civ'},
{x:1680,y:100,axis:'x',min:1500,max:1900,col:'#1e3a5f',kind:'civ'},
{x:250,y:990,axis:'x',min:180,max:700,col:'#111',kind:'law'}
];
var i,s;
walkers=[];
for(i=0;i<specs.length;i++){
s=specs[i];
walkers.push({x:s.x,y:s.y,axis:s.axis,min:s.min,max:s.max,dir:1,col:s.col,kind:s.kind,bob:i});
}
}
function updateWalkers(dt){
var i,w,step=28*dt;
for(i=0;i<walkers.length;i++){
w=walkers[i];
w.bob+=dt*3;
if(w.axis==='x'){w.x+=w.dir*step;if(w.x>w.max){w.x=w.max;w.dir=-1;}if(w.x<w.min){w.x=w.min;w.dir=1;}}
else {w.y+=w.dir*step;if(w.y>w.max){w.y=w.max;w.dir=-1;}if(w.y<w.min){w.y=w.min;w.dir=1;}}
}
}
function canteenWatch(){
var b,d,m,step;
if(!playing||modalOpen) return;
m=MISSIONS[state.mi];
if(!m||!m.timed) return;
step=currentStep();
if(!step||step.poi!=='court') return;
b=poiById('bar');
if(!b) return;
d=doorOf(b);
if(Math.hypot(player.x-d.x,player.y-d.y)<70){
if(!canteenHit){canteenHit=1;state.rep=Math.max(0,state.rep-4);flash('THE CANTEEN CAN WAIT.\nSTANDING -4. The board will not.');}
}else canteenHit=0;
}
function tick(dt){
var step;
if(!playing||modalOpen) return;
syncTimer();
if(!state.timerKey) return;
state.left-=dt;
if(state.left<30){if(!warn30){warn30=1;flash('THIRTY SECONDS.\nGet to the marked door.');}}
if(state.left<=0){
state.left=timerSeconds();
warn30=0;
state.rep=Math.max(0,state.rep-8);
shake=8;
flash('PASSED OVER.\nSTANDING -8. Back to the board. The clock starts again.');
save();
}
}
var props=[];
var animT=0;
var stick={x:0,y:0,on:0,down:0};
var forcedSteer=null;
var FOCAL=640, HORIZ=220;
var queue=[];
function wrapAng(a){
var p=Math.PI*2;
while(a>Math.PI) a-=p;
while(a<-Math.PI) a+=p;
return a;
}
function forwardOf(yaw){return {x:-Math.sin(yaw), y:Math.cos(yaw)};}
function beginView(){
FOCAL=VH*1.16;
HORIZ=VH*0.41;
}
function depthAt(wx,wy){
var dx=wx-cam.x, dy=wy-cam.y;
var s=Math.sin(cam.yaw), c=Math.cos(cam.yaw);
return dx*(-s)+dy*c;
}
function project(wx,wy,wz){
var dx=wx-cam.x, dy=wy-cam.y;
var s=Math.sin(cam.yaw), c=Math.cos(cam.yaw);
var z=dx*(-s)+dy*c;
if(z<1.25) return null;
var rgt=dx*c+dy*s;
var inv=FOCAL/z;
return {x:VW*0.5+rgt*inv, y:HORIZ+(cam.h-(wz||0))*inv, z:z, s:inv};
}
function spotClear(x,y){
if(hitsSolid(x,y)) return false;
return true;
}
function rayClear(x0,y0,x1,y1){
var i,t,x,y;
i=1;
while(i<=6){
t=i/7;
x=x0+(x1-x0)*t;
y=y0+(y1-y0)*t;
if(hitsSolid(x,y)) return false;
i++;
}
return true;
}
function pickCam(){
var dists,angs,di,ai,d,ang,yaw,cf,x,y,score,bestS,best,f;
dists=[145,160,130,175,112,90,70,52,36,24];
angs=[0,0.18,-0.18,0.4,-0.4,0.68,-0.68];
bestS=-1e9;
best=null;
f=forwardOf(player.yaw);
di=0;
while(di<dists.length){
d=dists[di];
ai=0;
while(ai<angs.length){
ang=angs[ai];
yaw=wrapAng(player.yaw+ang);
cf=forwardOf(yaw);
x=player.x-cf.x*d;
y=player.y-cf.y*d;
if(spotClear(x,y)){
if(rayClear(player.x,player.y,x,y)){
score=9000-Math.abs(ang)*5200-Math.abs(d-145)*4;
if(score>bestS){bestS=score;best={x:x,y:y,dist:d};}
}
}
ai++;
}
di++;
}
if(!best){
d=48;
while(d>=22){
ai=0;
while(ai<5){
ang=ai*0.38;
yaw=wrapAng(player.yaw+ang);
cf=forwardOf(yaw);
x=player.x-cf.x*d;
y=player.y-cf.y*d;
if(spotClear(x,y)){
if(rayClear(player.x,player.y,x,y)){best={x:x,y:y,dist:d};break;}
}
if(!best){
yaw=wrapAng(player.yaw-ang);
cf=forwardOf(yaw);
x=player.x-cf.x*d;
y=player.y-cf.y*d;
if(spotClear(x,y)){
if(rayClear(player.x,player.y,x,y)){best={x:x,y:y,dist:d};break;}
}
}
ai++;
}
if(best) break;
d-=8;
}
}
if(!best) best={x:player.x-f.x*48,y:player.y-f.y*48,dist:48};
return best;
}
function placeCam(snap){
var t,want,k,dy,mx,my,jump,fresh;
t=pickCam();
fresh=!cam.ready;
if(snap||fresh){
cam.x=t.x; cam.y=t.y; cam.ready=1;
}else{
jump=Math.hypot(t.x-cam.x, t.y-cam.y);
if(jump>90){
cam.x=t.x; cam.y=t.y;
}else{
k=0.28;
mx=cam.x+(t.x-cam.x)*k;
my=cam.y+(t.y-cam.y)*k;
if(spotClear(mx,my)){
if(rayClear(player.x,player.y,mx,my)){cam.x=mx; cam.y=my;}
else {cam.x=t.x; cam.y=t.y;}
}else {cam.x=t.x; cam.y=t.y;}
}
}
want=Math.atan2(-(player.x-cam.x), player.y-cam.y);
if(snap||fresh) cam.yaw=want;
else{
dy=wrapAng(want-cam.yaw);
if(Math.abs(dy)>0.9) cam.yaw=want;
else cam.yaw=wrapAng(cam.yaw+dy*0.45);
}
cam.dist=Math.hypot(player.x-cam.x, player.y-cam.y);
cam.h=0.33*cam.dist;
if(cam.h<14) cam.h=14;
if(cam.h>56) cam.h=56;
}
function syncCam(){placeCam(1);}
function moveAlong(dx,dy){
var dist=Math.hypot(dx,dy), n, i;
if(dist<0.0001) return;
n=Math.ceil(dist/4);
for(i=0;i<n;i++) movePlayer(dx/n, dy/n);
}
function sim(dt){
var steer=0, throttle=0, f, sp, ox, oy, moved;
if(stick.on){
throttle=-stick.y;
steer=-stick.x;
}else{
if(keys['a']||keys['arrowleft']||hold.left) steer+=1;
if(keys['d']||keys['arrowright']||hold.right) steer-=1;
if(keys['w']||keys['arrowup']||hold.up) throttle+=1;
if(keys['s']||keys['arrowdown']||hold.down) throttle-=1;
}
if(forcedSteer!==null) steer=forcedSteer;
if(steer>1) steer=1;
if(steer<-1) steer=-1;
if(throttle>1) throttle=1;
if(throttle<-1) throttle=-1;
player.yaw=wrapAng(player.yaw+steer*2.55*dt);
if(Math.abs(steer)>0.2) player.bob+=dt*7;
sp=176;
if(throttle<0) sp=98;
f=forwardOf(player.yaw);
ox=player.x; oy=player.y;
moveAlong(f.x*sp*throttle*dt, f.y*sp*throttle*dt);
moved=Math.hypot(player.x-ox, player.y-oy);
if(dt>0){
if(throttle>=0) player.speed=moved/dt;
else player.speed=-moved/dt;
}else player.speed=0;
placeCam(0);
}
function shade(hex,x,y){
var n=hash(Math.floor(x*0.07)+Math.floor(y*0.07)*17);
var k=0.9+n*0.14;
var v=parseInt(hex.slice(1),16);
var r=Math.floor(Math.floor(v/65536)*k);
var g=Math.floor((Math.floor(v/256)%256)*k);
var b=Math.floor((v%256)*k);
if(r>255) r=255;
if(g>255) g=255;
if(b>255) b=255;
return 'rgb('+r+','+g+','+b+')';
}
function mixHex(a,b,t){
var va=parseInt(a.slice(1),16), vb=parseInt(b.slice(1),16);
var ar=Math.floor(va/65536), ag=Math.floor(va/256)%256, ab=va%256;
var br=Math.floor(vb/65536), bg=Math.floor(vb/256)%256, bb=vb%256;
var r=Math.floor(ar+(br-ar)*t);
var g=Math.floor(ag+(bg-ag)*t);
var bl=Math.floor(ab+(bb-ab)*t);
return 'rgb('+r+','+g+','+bl+')';
}
function fogged(hex,z){
var t=(z-140)/620;
if(t<0) t=0;
if(t>0.62) t=0.62;
return mixHex(hex,'#c6e7f7',t);
}
function groundAt(wx,wy){
var i,r,g;
if(wx>=park.x){if(wy>=park.y){if(wx<=park.x+park.w){if(wy<=park.y+park.h) return '#2f9a4e';}}}
for(i=0;i<yards.length;i++){
r=yards[i];
if(wx<r.x) continue;
if(wy<r.y) continue;
if(wx>r.x+r.w) continue;
if(wy>r.y+r.h) continue;
if(r.kind==='court') return '#efe4d2';
if(r.kind==='police') return '#d7dec8';
return '#e6d8c4';
}
for(i=0;i<roads.length;i++){
r=roads[i];
if(wx<r.x) continue;
if(wy<r.y) continue;
if(wx>r.x+r.w) continue;
if(wy>r.y+r.h) continue;
return '#5a636c';
}
if(onPath(wx,wy)) return '#e3d5c2';
g=Math.floor(wx/120)+Math.floor(wy/120);
if(g%2) return '#3c9844';
return '#34863c';
}
function drawSky(){
var g,i,spots,x,y,n;
g=ctx.createLinearGradient(0,0,0,HORIZ+6);
g.addColorStop(0,'#5aa6de');
g.addColorStop(0.55,'#b7ddf6');
g.addColorStop(1,'#e7f5fc');
ctx.fillStyle=g;
ctx.fillRect(0,0,VW,HORIZ+6);
ctx.fillStyle='rgba(255,236,196,.95)';
ctx.beginPath();
ctx.arc(VW*0.82, HORIZ*0.36, Math.max(16,VH*0.032), 0, 6.283185);
ctx.fill();
ctx.fillStyle='#9dc3d4';
ctx.beginPath();
ctx.moveTo(0,HORIZ+1);
for(i=0;i<=18;i++){
x=i/18*VW;
y=HORIZ-8-Math.sin(i*0.62+cam.yaw*2)*12-Math.sin(i*0.23)*7;
ctx.lineTo(x,y);
}
ctx.lineTo(VW,HORIZ+1);
ctx.closePath();
ctx.fill();
spots=[0.08,0.28,0.5,0.72,0.96];
for(i=0;i<spots.length;i++){
n=spots[i]*VW-cam.yaw*VH*0.5;
x=n%(VW+200);
if(x<0) x=x+VW+200;
x=x-80;
y=HORIZ*(0.16+(i%3)*0.1);
ctx.fillStyle='rgba(255,255,255,.9)';
ctx.beginPath(); ctx.ellipse(x,y,34+(i%3)*6,14,0,0,6.283185); ctx.fill();
ctx.beginPath(); ctx.ellipse(x+18,y+3,22,11,0,0,6.283185); ctx.fill();
ctx.beginPath(); ctx.ellipse(x-20,y+2,18,10,0,0,6.283185); ctx.fill();
}
}
function drawGround(){
ctx.fillStyle='#3f8f3c';
ctx.fillRect(0,HORIZ,VW,VH-HORIZ);
var haze=ctx.createLinearGradient(0,HORIZ-8,0,HORIZ+VH*0.28);
haze.addColorStop(0,'rgba(198,228,242,.72)');
haze.addColorStop(1,'rgba(198,228,242,0)');
ctx.fillStyle=haze;
ctx.fillRect(0,HORIZ-8,VW,VH*0.32);
}
function tileFill(x,y,w,h,color){
if(w<1) return;
if(h<1) return;
hface(x,y,w,h,0.2,color);
}
function drawSlabs(){
var i,r,pad=22;
for(i=0;i<roads.length;i++){
r=roads[i];
tileFill(r.x-pad, r.y-pad, r.w+pad*2, r.h+pad*2, '#e3d5c2');
}
for(i=0;i<yards.length;i++){
r=yards[i];
if(r.kind==='court') tileFill(r.x,r.y,r.w,r.h,'#efe4d2');
else if(r.kind==='police') tileFill(r.x,r.y,r.w,r.h,'#d7dec8');
else tileFill(r.x,r.y,r.w,r.h,'#e6d8c4');
}
tileFill(park.x,park.y,park.w,park.h,'#2f9a4e');
for(i=0;i<roads.length;i++){
r=roads[i];
tileFill(r.x,r.y,r.w,r.h,'#5a636c');
}
}
var NEARZ=14;
function camOf(wx,wy,wz){
var dx=wx-cam.x, dy=wy-cam.y;
var s=Math.sin(cam.yaw), c=Math.cos(cam.yaw);
return {r:dx*c+dy*s, z:dx*(-s)+dy*c, h:wz||0};
}
function scrOf(pt){
var inv=FOCAL/pt.z;
return {x:VW*0.5+pt.r*inv, y:HORIZ+(cam.h-pt.h)*inv};
}
function clipZ(pts){
var out=[], i, n, a, b, t;
n=pts.length;
i=0;
while(i<n){
a=pts[i];
b=pts[(i+1)%n];
if(a.z>=NEARZ){
if(b.z>=NEARZ) out.push(b);
else {
t=(a.z-NEARZ)/(a.z-b.z);
out.push({r:a.r+(b.r-a.r)*t, z:NEARZ, h:a.h+(b.h-a.h)*t});
}
}else if(b.z>=NEARZ){
t=(a.z-NEARZ)/(a.z-b.z);
out.push({r:a.r+(b.r-a.r)*t, z:NEARZ, h:a.h+(b.h-a.h)*t});
out.push(b);
}
i++;
}
return out;
}
function fillCam(pts, color){
var c, i, q;
c=clipZ(pts);
if(c.length<3) return;
ctx.fillStyle=color;
ctx.beginPath();
q=scrOf(c[0]);
ctx.moveTo(q.x,q.y);
i=1;
while(i<c.length){
q=scrOf(c[i]);
ctx.lineTo(q.x,q.y);
i++;
}
ctx.closePath();
ctx.fill();
}
function hface(x,y,w,h,z,color){
fillCam([camOf(x,y,z), camOf(x+w,y,z), camOf(x+w,y+h,z), camOf(x,y+h,z)], color);
}
function vface(x0,y0,x1,y1,z0,z1,color){
fillCam([camOf(x0,y0,z0), camOf(x1,y1,z0), camOf(x1,y1,z1), camOf(x0,y0,z1)], color);
}
function triFace(x0,y0,z0,x1,y1,z1,x2,y2,z2,color){
fillCam([camOf(x0,y0,z0), camOf(x1,y1,z1), camOf(x2,y2,z2)], color);
}
function faceOn(side,b){
if(side==='s') return cam.y>b.y+b.h-0.5;
if(side==='n') return cam.y<b.y+0.5;
if(side==='w') return cam.x<b.x+0.5;
return cam.x>b.x+b.w-0.5;
}
function styleOf(b){
if(b.kind==='court') return {wall:'#f8f0e0', wall2:'#e8d8c0', roof:'#8d3428', roof2:'#b55240', ht:98, roofH:10, flat:1};
if(b.kind==='tower') return {wall:'#f7f3ea', wall2:'#ddd2c2', roof:'#f4f7fb', roof2:'#d5dee8', ht:152, roofH:20, flat:0};
if(b.kind==='firm') return {wall:'#f0f4fa', wall2:'#d0dce8', roof:'#1e3a5f', roof2:'#16304f', ht:82, roofH:8, flat:1};
if(b.kind==='chamber') return {wall:'#f4ead6', wall2:'#e2d2b2', roof:'#3f2a22', roof2:'#6a4636', ht:84, roofH:18, flat:0};
if(b.kind==='gov') return {wall:'#f8f2e6', wall2:'#e6d7c0', roof:'#6d7d4c', roof2:'#556338', ht:46, roofH:4, flat:1};
if(b.kind==='shop') return {wall:'#f7e7cf', wall2:'#e4cfb0', roof:'#9a3412', roof2:'#c45a28', ht:40, roofH:11, flat:0};
if(b.kind==='bar') return {wall:'#f6e2c4', wall2:'#e2c8a4', roof:'#7f1d1d', roof2:'#b45309', ht:38, roofH:10, flat:0};
if(b.kind==='bank') return {wall:'#e7eef2', wall2:'#c5d0d8', roof:'#0f766e', roof2:'#115e59', ht:108, roofH:6, flat:1};
if(b.kind==='police') return {wall:'#f4e6c4', wall2:'#dcc48a', roof:'#1d4e89', roof2:'#163a66', ht:68, roofH:6, flat:1};
if(b.kind==='lockup') return {wall:'#d9d3c7', wall2:'#b7b1a6', roof:'#57534e', roof2:'#44403c', ht:46, roofH:4, flat:1};
if(b.kind==='hostel') return {wall:'#f8e6da', wall2:'#e4c8b0', roof:'#7c2d3a', roof2:'#9f4050', ht:92, roofH:9, flat:1};
if(b.kind==='wall') return {wall:'#d7d0c0', wall2:'#b7ad9c', roof:'#cfc6b4', roof2:'#b7ad9c', ht:14, roofH:0, flat:1};
return {wall:b.wall||'#f6e6d0', wall2:'#e4d0b6', roof:b.roof||'#8d3428', roof2:b.roof2||'#c45a3a', ht:62, roofH:18, flat:0};
}
function glassAt(i,r,x){
if(hash(i*5+r*9+Math.floor(x))<0.22) return '#f0c870';
return '#a8d0e8';
}
function windowsOf(b,ht){
var rows,n,i,r,z,ww,wh,x,y,doorSide,glass;
rows=1;
if(ht>34) rows=2;
if(ht>58) rows=3;
if(ht>88) rows=4;
doorSide=b.door||'s';
if(faceOn('s',b)){
n=Math.max(1,Math.floor(b.w/16));
if(n>10) n=10;
ww=Math.min(10, (b.w-8)/n*0.45);
wh=Math.min(10, (ht-8)/ (rows+1));
for(r=0;r<rows;r++){
z=7+r*((ht-12)/rows);
for(i=0;i<n;i++){
x=b.x+5+(i+0.5)*((b.w-10)/n)-ww/2;
if(doorSide==='s'){if(z<15){if(Math.abs(x+ww/2-(b.x+b.w/2))<8) continue;}}
glass=glassAt(i,r,b.x);
vface(x-1,b.y+b.h,x+ww+1,b.y+b.h,z-0.5,z+wh+0.5,'#4a3c30');
vface(x,b.y+b.h,x+ww,b.y+b.h,z,z+wh,glass);
}
}
}
if(faceOn('n',b)){
n=Math.max(1,Math.floor(b.w/16));
if(n>10) n=10;
ww=Math.min(10, (b.w-8)/n*0.45);
wh=Math.min(10, (ht-8)/ (rows+1));
for(r=0;r<rows;r++){
z=7+r*((ht-12)/rows);
for(i=0;i<n;i++){
x=b.x+5+(i+0.5)*((b.w-10)/n)-ww/2;
if(doorSide==='n'){if(z<15){if(Math.abs(x+ww/2-(b.x+b.w/2))<8) continue;}}
vface(x,b.y,x+ww,b.y,z,z+wh,glassAt(i,r,b.y));
}
}
}
if(faceOn('w',b)){
n=Math.max(1,Math.floor(b.h/16));
if(n>8) n=8;
ww=Math.min(10, (b.h-8)/n*0.45);
wh=Math.min(10, (ht-8)/(rows+1));
for(r=0;r<rows;r++){
z=7+r*((ht-12)/rows);
for(i=0;i<n;i++){
y=b.y+5+(i+0.5)*((b.h-10)/n)-ww/2;
if(doorSide==='w'){if(z<15){if(Math.abs(y+ww/2-(b.y+b.h/2))<8) continue;}}
vface(b.x,y,b.x,y+ww,z,z+wh,glassAt(i,r,b.x+3));
}
}
}
if(faceOn('e',b)){
n=Math.max(1,Math.floor(b.h/16));
if(n>8) n=8;
ww=Math.min(10, (b.h-8)/n*0.45);
wh=Math.min(10, (ht-8)/(rows+1));
for(r=0;r<rows;r++){
z=7+r*((ht-12)/rows);
for(i=0;i<n;i++){
y=b.y+5+(i+0.5)*((b.h-10)/n)-ww/2;
if(doorSide==='e'){if(z<15){if(Math.abs(y+ww/2-(b.y+b.h/2))<8) continue;}}
vface(b.x+b.w,y,b.x+b.w,y+ww,z,z+wh,glassAt(i,r,b.x+b.w));
}
}
}
}
function drawDoor(b,ht){
var dw=16, dh, x, y;
dh=Math.min(18, ht-1);
if(dh<8) dh=8;
if((b.door||'s')==='s'){
if(!faceOn('s',b)) return;
x=b.x+b.w/2-dw/2; y=b.y+b.h;
vface(x,y,x+dw,y,0,dh,'#4a3226');
vface(x+dw*0.42,y,x+dw*0.55,y,dh*0.42,dh*0.55,'#e2b657');
}
if(b.door==='n'){
if(!faceOn('n',b)) return;
x=b.x+b.w/2-dw/2;
vface(x,b.y,x+dw,b.y,0,dh,'#4a3226');
}
if(b.door==='w'){
if(!faceOn('w',b)) return;
y=b.y+b.h/2-dw/2;
vface(b.x,y,b.x,y+dw,0,dh,'#4a3226');
}
if(b.door==='e'){
if(!faceOn('e',b)) return;
y=b.y+b.h/2-dw/2;
vface(b.x+b.w,y,b.x+b.w,y+dw,0,dh,'#4a3226');
}
}
function drawRoof(b,st){
var x=b.x, y=b.y, w=b.w, h=b.h, z=st.ht, peak=st.roofH;
var mx, my, z2, southFirst;
if(st.flat||peak<1){
hface(x,y,w,h,z,fogged(st.roof, depthAt(x+w/2,y+h/2)));
return;
}
z2=z+peak;
if(w>=h){
my=y+h/2;
southFirst=cam.y<my;
if(southFirst){
h=h;
slopeNS(x,y,w,my-y,z,z2,st.roof2,true);
slopeNS(x,my,w,y+h-my,z,z2,st.roof,false);
}else{
slopeNS(x,my,w,y+h-my,z,z2,st.roof,false);
slopeNS(x,y,w,my-y,z,z2,st.roof2,true);
}
if(faceOn('w',b)) triFace(x,y,z,x,y+h,z,x,my,z2,fogged(st.roof2,depthAt(x,my)));
if(faceOn('e',b)) triFace(x+w,y,z,x+w,y+h,z,x+w,my,z2,fogged(st.roof,depthAt(x+w,my)));
}else{
mx=x+w/2;
if(cam.x<mx){
slopeEW(x,y,mx-x,h,z,z2,st.roof2,true);
slopeEW(mx,y,x+w-mx,h,z,z2,st.roof,false);
}else{
slopeEW(mx,y,x+w-mx,h,z,z2,st.roof,false);
slopeEW(x,y,mx-x,h,z,z2,st.roof2,true);
}
if(faceOn('n',b)) triFace(x,y,z,x+w,y,z,mx,y,z2,fogged(st.roof2,depthAt(mx,y)));
if(faceOn('s',b)) triFace(x,y+h,z,x+w,y+h,z,mx,y+h,z2,fogged(st.roof,depthAt(mx,y+h)));
}
}
function slopeNS(x,y,w,h,z,z2,color,north){
var col=fogged(color, depthAt(x+w*0.5, y+h*0.5));
if(north) fillCam([camOf(x,y,z), camOf(x+w,y,z), camOf(x+w,y+h,z2), camOf(x,y+h,z2)], col);
else fillCam([camOf(x,y+h,z), camOf(x+w,y+h,z), camOf(x+w,y,z2), camOf(x,y,z2)], col);
}
function slopeEW(x,y,w,h,z,z2,color,west){
var col=fogged(color, depthAt(x+w*0.5, y+h*0.5));
if(west) fillCam([camOf(x,y,z), camOf(x,y+h,z), camOf(x+w,y+h,z2), camOf(x+w,y,z2)], col);
else fillCam([camOf(x+w,y,z), camOf(x+w,y+h,z), camOf(x,y+h,z2), camOf(x,y,z2)], col);
}
function drawLabel(b,ht){
var p,z,side,tw;
if(!b.name) return;
if(b.kind==='wall') return;
z=depthAt(b.x+b.w/2, b.y+b.h/2);
if(z<130) return;
if(z>360) return;
side=b.door||'s';
if(!faceOn(side,b)) return;
if(side==='s') p=project(b.x+b.w/2, b.y+b.h, ht+1.5);
else if(side==='n') p=project(b.x+b.w/2, b.y, ht+1.5);
else if(side==='w') p=project(b.x, b.y+b.h/2, ht+1.5);
else p=project(b.x+b.w, b.y+b.h/2, ht+1.5);
if(!p) return;
if(p.s>6) return;
ctx.font=Math.max(11, Math.min(15, p.s*3.6))+'px system-ui,sans-serif';
ctx.textAlign='center';
tw=ctx.measureText(b.name).width;
ctx.fillStyle='rgba(16,14,12,.62)';
ctx.fillRect(p.x-tw/2-4, p.y-12, tw+8, 16);
ctx.fillStyle='#f7f1e4';
ctx.fillText(b.name, p.x, p.y);
}
function drawSolid(b){
var st=styleOf(b), z=depthAt(b.x+b.w/2, b.y+b.h/2);
var south=fogged(st.wall,z), shadeC=fogged(st.wall2,z);
if(b.kind==='wall'){
if(faceOn('s',b)) vface(b.x,b.y+b.h,b.x+b.w,b.y+b.h,0,st.ht,south);
if(faceOn('n',b)) vface(b.x,b.y,b.x+b.w,b.y,0,st.ht,shadeC);
if(faceOn('w',b)) vface(b.x,b.y,b.x,b.y+b.h,0,st.ht,shadeC);
if(faceOn('e',b)) vface(b.x+b.w,b.y,b.x+b.w,b.y+b.h,0,st.ht,south);
hface(b.x,b.y,b.w,b.h,st.ht,fogged(st.roof,z));
return;
}
hface(b.x+3, b.y+5, b.w, Math.max(8,b.h*0.35), 0.3, 'rgba(30,40,24,.2)');
if(faceOn('s',b)) vface(b.x,b.y+b.h,b.x+b.w,b.y+b.h,0,st.ht,south);
if(faceOn('n',b)) vface(b.x,b.y,b.x+b.w,b.y,0,st.ht,shadeC);
if(faceOn('w',b)) vface(b.x,b.y,b.x,b.y+b.h,0,st.ht,shadeC);
if(faceOn('e',b)) vface(b.x+b.w,b.y,b.x+b.w,b.y+b.h,0,st.ht,south);
if(faceOn('s',b)) vface(b.x,b.y+b.h,b.x+b.w,b.y+b.h,st.ht-2.4,st.ht+0.8,st.roof);
if(faceOn('n',b)) vface(b.x,b.y,b.x+b.w,b.y,st.ht-2.4,st.ht+0.8,st.roof2);
if(faceOn('w',b)) vface(b.x,b.y,b.x,b.y+b.h,st.ht-2.4,st.ht+0.8,st.roof2);
if(faceOn('e',b)) vface(b.x+b.w,b.y,b.x+b.w,b.y+b.h,st.ht-2.4,st.ht+0.8,st.roof);
if(b.kind!=='tower') windowsOf(b,st.ht);
if(b.kind==='tower'){
vface(b.x+b.w*0.2,b.y+b.h,b.x+b.w*0.8,b.y+b.h,st.ht*0.72,st.ht*0.8,'#9fd0e8');
}
drawDoor(b,st.ht);
if(b.kind==='court'){
if(faceOn('s',b)){
var i,cx;
for(i=0;i<5;i++){
cx=b.x+18+i*((b.w-36)/4);
vface(cx,b.y+b.h,cx+6,b.y+b.h,0,st.ht*0.72,'#f7f3ea');
}
}
}
if(b.kind==='lockup'){
if(faceOn('s',b)){
var j;
for(j=0;j<4;j++) vface(b.x+16+j*22, b.y+b.h, b.x+20+j*22, b.y+b.h, 8, 20, '#1f2937');
}
}
drawRoof(b,st);
if(b.kind==='shop'||b.kind==='bar'||b.kind==='gov'){
if(faceOn('s',b)) vface(b.x+2,b.y+b.h,b.x+b.w-2,b.y+b.h,st.ht-1,st.ht+3, b.kind==='bar'?'#f2d3d3':'#f4efe4');
}
drawLabel(b,st.ht);
}
function drawMarks(){
var i,r,x,y,z;
for(i=0;i<roads.length;i++){
r=roads[i];
if(r.w>r.h){
y=r.y+r.h*0.5;
for(x=r.x+20; x<r.x+r.w-10; x+=34){
z=depthAt(x,y);
if(z<8) continue;
if(z>640) continue;
hface(x, y-1.05, 15, 2.1, 0.45, '#f4f1ea');
}
}else{
x=r.x+r.w*0.5;
for(y=r.y+20; y<r.y+r.h-10; y+=34){
z=depthAt(x,y);
if(z<8) continue;
if(z>640) continue;
hface(x-1.05, y, 2.1, 15, 0.45, '#f4f1ea');
}
}
}
}
function drawTree(x,y,r){
var g=project(x,y,0), u, h, crown, top, tip;
if(!g) return;
if(g.z<26) return;
if(g.z>820) return;
u=g.s;
if(u>3.4) u=3.4;
tip=project(x,y,r*3.6);
h=r*2.8*u;
if(tip){if(g.y-tip.y>12) h=g.y-tip.y;}
crown=r*1.05*u;
if(crown>46) crown=46;
top=crown*0.72;
if(top>34) top=34;
ctx.fillStyle='rgba(0,0,0,.22)';
ctx.beginPath(); ctx.ellipse(g.x,g.y,Math.min(18,r*0.7*u),Math.min(7,r*0.24*u),0,0,6.283185); ctx.fill();
ctx.fillStyle='#6b442c';
ctx.fillRect(g.x-Math.min(3.2,u*1.1), g.y-h*0.42, Math.min(6.4,u*2.2), h*0.42);
ctx.fillStyle='#1a5c2e';
ctx.beginPath(); ctx.arc(g.x, g.y-h*0.62, crown, 0, 6.283185); ctx.fill();
ctx.fillStyle='#2a8040';
ctx.beginPath(); ctx.arc(g.x-crown*0.22, g.y-h*0.82, top, 0, 6.283185); ctx.fill();
}
function drawLampAt(x,y){
var a=project(x,y,0), b=project(x,y,26), w, glow;
if(!a||!b) return;
if(a.z<20) return;
if(a.z>700) return;
ctx.strokeStyle='#2c312c';
w=a.s*0.55;
if(w<1.1) w=1.1;
if(w>2.4) w=2.4;
ctx.lineWidth=w;
ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
ctx.fillStyle='#f8e7a2';
glow=b.s*2.1;
if(glow<2) glow=2;
if(glow>7) glow=7;
ctx.beginPath(); ctx.arc(b.x,b.y,glow,0,6.283185); ctx.fill();
}
function drawPillarAt(x,y){
vface(x,y,x+5,y,0,16,'#f4efe4');
vface(x,y,x,y+5,0,16,'#e4dcc8');
hface(x,y,5,5,16,'#faf7f0');
}
function drawBenchAt(x,y){
vface(x,y,x+16,y,0,4,'#8d5a32');
hface(x,y,16,6,4,'#c48a56');
vface(x,y,x+16,y,4,8,'#6b4124');
}
function drawStallAt(){
var x=1568,y=162,w=70,h=36,ht=18;
vface(x,y+h,x+w,y+h,0,ht,'#f3e0c4');
vface(x,y,x+w,y,0,ht,'#e2d0b4');
vface(x,y,x,y+h,0,ht,'#d7c2a4');
vface(x+w,y,x+w,y+h,0,ht,'#f3e0c4');
hface(x,y,w,h,ht,'#f7f4ee');
slopeNS(x,y,w,h/2,ht,ht+8,'#d06a42',true);
slopeNS(x,y+h/2,w,h/2,ht,ht+8,'#8d3428',false);
}
function drawFigure(wx,wy,o,fyaw){
var feet=project(wx,wy,0);
if(!feet) return;
if(feet.z>860) return;
var u=feet.s*0.42;
var crown=project(wx,wy,16.5);
if(crown){
var span=feet.y-crown.y;
if(span>8) u=span/40;
}
if(o.hero){
if(u>6.4) u=6.4;
}else{
if(feet.z<28) return;
if(u>5.2) u=5.2;
}
if(u<0.4) return;
var rel=wrapAng((fyaw||0)-cam.yaw);
var back=Math.cos(rel);
var seeBack=false;
if(o.hero) seeBack=true;
if(back>0.2) seeBack=true;
var side=Math.sin(rel);
var x=feet.x+side*u*4;
var y=feet.y;
var swing=Math.sin((o.bob||0)*1.45);
var female=o.female?true:false;
var hw=(female?6.1:7.1)*u;
if(o.hero) hw=hw*1.06;
var skin=o.skin||'#e0b090';
var suit=o.suit||'#1d3f72';
var pants=o.pants||'#141820';
var hair=o.hair||'#1a1a1a';
if(o.coat) suit='#14161a';
ctx.fillStyle='rgba(0,0,0,.28)';
ctx.beginPath();
ctx.ellipse(feet.x, feet.y, hw*1.2, hw*0.4, 0, 0, 6.283185);
ctx.fill();
var legW=hw*0.42;
var legH=17.4*u;
var hipY=y-legH;
ctx.fillStyle=pants;
ctx.fillRect(x-hw*0.58+swing*u*2.4, hipY, legW, legH);
ctx.fillRect(x+hw*0.58-legW-swing*u*2.4, hipY, legW, legH);
ctx.fillStyle='#111';
ctx.fillRect(x-hw*0.58+swing*u*2.4-u*0.3, y-2.1*u, legW+u, 2.3*u);
ctx.fillRect(x+hw*0.58-legW-swing*u*2.4-u*0.3, y-2.1*u, legW+u, 2.3*u);
var torsoH=13.5*u;
var neckY=hipY-torsoH;
ctx.fillStyle=suit;
ctx.beginPath();
ctx.moveTo(x-hw*0.92, neckY+torsoH);
ctx.lineTo(x-hw*0.72, neckY+2*u);
ctx.lineTo(x+hw*0.72, neckY+2*u);
ctx.lineTo(x+hw*0.92, neckY+torsoH);
ctx.closePath();
ctx.fill();
ctx.fillStyle='rgba(255,255,255,.14)';
ctx.fillRect(x-hw*0.18, neckY+3*u, hw*0.36, torsoH-4*u);
if(o.coat){
ctx.fillStyle='#0e1014';
ctx.beginPath();
ctx.moveTo(x-hw*0.96, neckY+u);
ctx.lineTo(x+hw*0.96, neckY+u);
ctx.lineTo(x+hw*1.28, hipY+3.5*u);
ctx.lineTo(x-hw*1.28, hipY+3.5*u);
ctx.closePath();
ctx.fill();
if(!seeBack){
ctx.fillStyle='#5c4034';
ctx.fillRect(x-u*0.35, neckY, u*0.7, torsoH);
}
}
ctx.fillStyle=suit;
var armH=11.5*u;
ctx.fillRect(x-hw-u*1.7, neckY+1.6*u+swing*u*2.1, u*2.05, armH);
ctx.fillRect(x+hw-u*0.35, neckY+1.6*u-swing*u*2.1, u*2.05, armH);
ctx.fillStyle=skin;
ctx.fillRect(x-hw-u*1.5, neckY+1.6*u+swing*u*2.1+armH-u, u*1.6, u*1.7);
ctx.fillRect(x+hw-u*0.15, neckY+1.6*u-swing*u*2.1+armH-u, u*1.6, u*1.7);
if(o.hero||o.role==='senior'||o.role==='clerk'||o.role==='usher'){
ctx.fillStyle='#f7f4ee';
ctx.beginPath();
ctx.moveTo(x, neckY+2.4*u);
ctx.lineTo(x-hw*0.28, neckY);
ctx.lineTo(x+hw*0.28, neckY);
ctx.closePath();
ctx.fill();
}
var headR=4.55*u;
var headC=neckY-headR*0.95;
if(seeBack){
ctx.fillStyle=hair;
ctx.beginPath();
ctx.arc(x, headC, headR, 0, 6.283185);
ctx.fill();
ctx.fillRect(x-headR*0.55, neckY-u*0.2, headR*1.1, headR*0.9);
if(female){
ctx.fillRect(x-headR*0.95, headC-headR*0.15, headR*0.72, headR*2.5);
ctx.fillRect(x+headR*0.23, headC-headR*0.15, headR*0.72, headR*2.5);
}
if(o.old){
ctx.fillStyle='#f4f4f5';
ctx.beginPath();
ctx.arc(x, headC, headR*0.98, 0, 6.283185);
ctx.fill();
}
}else{
ctx.fillStyle=skin;
ctx.fillRect(x-u*1.3, neckY-u*0.2, u*2.6, u*2.2);
ctx.beginPath();
ctx.arc(x, headC, headR, 0, 6.283185);
ctx.fill();
ctx.fillStyle=hair;
ctx.beginPath();
ctx.arc(x, headC-headR*0.15, headR*0.98, Math.PI*1.02, Math.PI*1.98);
ctx.fill();
if(female){
ctx.fillRect(x-headR*0.98, headC-headR*0.2, headR*0.55, headR*2.15);
ctx.fillRect(x+headR*0.42, headC-headR*0.2, headR*0.55, headR*2.15);
}
if(o.old){
ctx.fillStyle='#f4f4f5';
ctx.beginPath();
ctx.arc(x, headC-headR*0.2, headR, Math.PI*1.08, Math.PI*1.92);
ctx.fill();
}
if(back<-0.2){
ctx.fillStyle='#2a211c';
ctx.fillRect(x-headR*0.42, headC-headR*0.15, headR*0.16, headR*0.16);
ctx.fillRect(x+headR*0.26, headC-headR*0.15, headR*0.16, headR*0.16);
}
}
if(o.role==='student'){
if(back>0.1){
ctx.fillStyle='#243656';
ctx.fillRect(x-hw*0.62, neckY+1.5*u, hw*1.24, torsoH*0.72);
}
}
if(o.role==='cop'){
ctx.fillStyle='#3a3424';
ctx.fillRect(x-headR*1.05, headC-headR*1.15, headR*2.1, headR*0.42);
ctx.fillStyle='#c4a15a';
ctx.fillRect(x-headR*0.55, headC-headR*1.45, headR*1.1, headR*0.38);
}
if(o.role==='usher'){
ctx.fillStyle='#1c1917';
ctx.fillRect(x-headR*0.7, headC-headR*1.35, headR*1.4, headR*0.7);
}
if(o.carry){
ctx.fillStyle='#6b3a22';
ctx.fillRect(x-hw-u*2.4, neckY+armH*0.7, u*3.3, u*2.5);
ctx.fillStyle='#e7d3a8';
ctx.fillRect(x-hw-u*2.1, neckY+armH*0.7, u*2.6, u*0.45);
}
if(o.name){
ctx.font='12px system-ui,sans-serif';
ctx.textAlign='center';
var tw=ctx.measureText(o.name).width;
var ny=headC-headR-14;
ctx.fillStyle='rgba(12,14,18,.78)';
ctx.fillRect(x-tw/2-5, ny-11, tw+10, 16);
ctx.fillStyle='#f8f4ea';
ctx.fillText(o.name, x, ny);
if(o.active){
ctx.strokeStyle='#e2b657';
ctx.lineWidth=2;
ctx.strokeRect(x-tw/2-5, ny-11, tw+10, 16);
}
}
}
function drawBeacon(dx,dy){
var g, p, s, bob, rw, rh;
if(Math.hypot(player.x-dx,player.y-dy)<36) return;
g=project(dx,dy,0);
if(g){
if(g.z>12){
if(g.z<900){
rw=g.s*8;
if(rw<8) rw=8;
if(rw>26) rw=26;
rh=rw*0.32;
ctx.strokeStyle='rgba(226,182,87,.92)';
ctx.lineWidth=2;
ctx.beginPath();
ctx.ellipse(g.x,g.y,rw,rh,0,0,6.283185);
ctx.stroke();
}
}
}
bob=Math.sin(animT*3)*2;
p=project(dx,dy,18+bob);
if(!p) return;
if(p.z<24) return;
s=p.s*3.6;
if(s<6) s=6;
if(s>13) s=13;
ctx.fillStyle='#f7f1e4';
ctx.fillRect(p.x-s, p.y-s*1.25, s*2, s*2.15);
ctx.fillStyle='#7a1f1f';
ctx.fillRect(p.x-s, p.y-s*1.25, s*2, s*0.48);
ctx.fillRect(p.x-s*0.7, p.y-s*0.45, s*1.4, s*0.16);
ctx.fillRect(p.x-s*0.7, p.y-s*0.1, s*1.05, s*0.16);
}
function push(z,fn){queue.push({z:z,fn:fn});}
function flush(){
var i;
queue.sort(function(a,b){return b.z-a.z;});
for(i=0;i<queue.length;i++) queue[i].fn();
queue.length=0;
}
function faceYaw(x,y,tx,ty){
return Math.atan2(-(tx-x), ty-y);
}
function walkerYaw(w){
if(w.axis==='x'){if(w.dir>0) return -Math.PI/2; return Math.PI/2;}
if(w.dir>0) return 0;
return Math.PI;
}
function pushPart(z,fn){
if(z<8) return;
if(z>980) return;
push(z,fn);
}
function winSpan(b,ht,side,x0,y0,x1,y1){
var rows,n,i,r,z,ww,wh,x,y,doorSide,glass,cx,cy;
rows=1;
if(ht>34) rows=2;
if(ht>58) rows=3;
if(ht>88) rows=4;
doorSide=b.door||'s';
if(side==='s'||side==='n'){
n=Math.max(1,Math.floor(b.w/18));
if(n>8) n=8;
ww=Math.min(9,(b.w-8)/n*0.55);
wh=Math.min(11,(ht-8)/(rows+1));
r=0;
while(r<rows){
z=8+r*((ht-14)/Math.max(1,rows));
i=0;
while(i<n){
x=b.x+6+(i+0.5)*((b.w-12)/n)-ww*0.5;
cx=x+ww*0.5;
if(cx>=x0){if(cx<=x1){
if(doorSide===side){if(z<16){if(Math.abs(cx-(b.x+b.w*0.5))<11){i++; continue;}}}
glass=glassAt(i,r,b.x+r*3);
if(side==='s') vface(x,b.y+b.h,x+ww,b.y+b.h,z,z+wh,glass);
else vface(x,b.y,x+ww,b.y,z,z+wh,glass);
}}
i++;
}
r++;
}
}else{
n=Math.max(1,Math.floor(b.h/18));
if(n>6) n=6;
ww=Math.min(9,(b.h-8)/n*0.55);
wh=Math.min(11,(ht-8)/(rows+1));
r=0;
while(r<rows){
z=8+r*((ht-14)/Math.max(1,rows));
i=0;
while(i<n){
y=b.y+6+(i+0.5)*((b.h-12)/n)-ww*0.5;
cy=y+ww*0.5;
if(cy>=Math.min(y0,y1)){if(cy<=Math.max(y0,y1)){
if(doorSide===side){if(z<16){if(Math.abs(cy-(b.y+b.h*0.5))<11){i++; continue;}}}
glass=glassAt(i,r,b.y+r*3);
if(side==='w') vface(b.x,y,b.x,y+ww,z,z+wh,glass);
else vface(b.x+b.w,y,b.x+b.w,y+ww,z,z+wh,glass);
}}
i++;
}
r++;
}
}
}
function doorSpan(b,ht,side,x0,y0,x1,y1){
var dw,dh,x,y,cx,cy;
if((b.door||'s')!==side) return;
dw=16;
dh=Math.min(18, ht-1);
if(dh<8) dh=8;
if(side==='s'||side==='n'){
x=b.x+b.w*0.5-dw*0.5;
cx=x+dw*0.5;
if(cx<x0) return;
if(cx>x1) return;
if(side==='s'){
vface(x,b.y+b.h,x+dw,b.y+b.h,0,dh,'#4a3226');
vface(x+dw*0.42,b.y+b.h,x+dw*0.55,b.y+b.h,dh*0.42,dh*0.55,'#e2b657');
}else vface(x,b.y,x+dw,b.y,0,dh,'#4a3226');
}else{
y=b.y+b.h*0.5-dw*0.5;
cy=y+dw*0.5;
if(cy<Math.min(y0,y1)) return;
if(cy>Math.max(y0,y1)) return;
if(side==='w') vface(b.x,y,b.x,y+dw,0,dh,'#4a3226');
else vface(b.x+b.w,y,b.x+b.w,y+dw,0,dh,'#4a3226');
}
}
function wallBits(b,st,side,x0,y0,x1,y1){
var ht,z,mx,my,col;
ht=st.ht;
mx=(x0+x1)*0.5;
my=(y0+y1)*0.5;
z=depthAt(mx,my);
if(side==='s'||side==='e') col=fogged(st.wall,z);
else col=fogged(st.wall2,z);
pushPart(z, function(){
vface(x0,y0,x1,y1,0,ht,col);
if(b.kind!=='wall'){
vface(x0,y0,x1,y1,0,3.4,st.wall2);
vface(x0,y0,x1,y1,ht-2.2,ht+0.7,st.roof);
winSpan(b,ht,side,x0,y0,x1,y1);
doorSpan(b,ht,side,x0,y0,x1,y1);
if(side==='s'){
if(b.kind==='shop'||b.kind==='bar'||b.kind==='gov'){
vface(x0,y0,x1,y1,ht-1,ht+3.2, b.kind==='bar'?'#f2d3d3':'#f4efe4');
}
}
}
});
}
function queueRoof(b,st){
var x,y,w,h,z,step,ix,iy,tw,th,cx,cy,zz,peak,z2,my,i,x0,w2;
x=b.x; y=b.y; w=b.w; h=b.h; z=st.ht; step=40;
if(st.flat||st.roofH<1){
iy=y;
while(iy<y+h-0.1){
th=step;
if(iy+th>y+h) th=y+h-iy;
ix=x;
while(ix<x+w-0.1){
tw=step;
if(ix+tw>x+w) tw=x+w-ix;
cx=ix+tw*0.5; cy=iy+th*0.5;
zz=depthAt(cx,cy);
(function(ix,iy,tw,th,zz){
pushPart(zz, function(){hface(ix,iy,tw,th,z,fogged(st.roof,zz));});
})(ix,iy,tw,th,zz);
ix+=step;
}
iy+=step;
}
return;
}
peak=st.roofH;
z2=z+peak;
if(w>=h){
my=y+h*0.5;
i=0;
while(i<w){
x0=x+i; w2=step; if(x0+w2>x+w) w2=x+w-x0;
zz=depthAt(x0+w2*0.5, my);
(function(x0,w2,zz){
pushPart(zz, function(){
if(cam.y<my){
slopeNS(x0,y,w2,my-y,z,z2,st.roof2,true);
slopeNS(x0,my,w2,y+h-my,z,z2,st.roof,false);
}else{
slopeNS(x0,my,w2,y+h-my,z,z2,st.roof,false);
slopeNS(x0,y,w2,my-y,z,z2,st.roof2,true);
}
});
})(x0,w2,zz);
i+=step;
}
}else{
var mx,j,y0,h2;
mx=x+w*0.5;
j=0;
while(j<h){
y0=y+j; h2=step; if(y0+h2>y+h) h2=y+h-y0;
zz=depthAt(mx, y0+h2*0.5);
(function(y0,h2,zz){
pushPart(zz, function(){
if(cam.x<mx){
slopeEW(x,y0,mx-x,h2,z,z2,st.roof2,true);
slopeEW(mx,y0,x+w-mx,h2,z,z2,st.roof,false);
}else{
slopeEW(mx,y0,x+w-mx,h2,z,z2,st.roof,false);
slopeEW(x,y0,mx-x,h2,z,z2,st.roof2,true);
}
});
})(y0,h2,zz);
j+=step;
}
}
}
function queueExtras(b,st){
var z,side,i,cx,j;
side=b.door||'s';
if(side==='s') z=depthAt(b.x+b.w*0.5, b.y+b.h);
else if(side==='n') z=depthAt(b.x+b.w*0.5, b.y);
else if(side==='w') z=depthAt(b.x, b.y+b.h*0.5);
else z=depthAt(b.x+b.w, b.y+b.h*0.5);
pushPart(z-0.4, function(){
if(b.kind==='court'){
if(faceOn('s',b)){
i=0;
while(i<5){
cx=b.x+18+i*((b.w-36)/4);
vface(cx,b.y+b.h,cx+6,b.y+b.h,0,st.ht*0.72,'#f7f3ea');
i++;
}
}
}
if(b.kind==='lockup'){
if(faceOn('s',b)){
j=0;
while(j<4){
vface(b.x+16+j*22, b.y+b.h, b.x+20+j*22, b.y+b.h, 8, 20, '#1f2937');
j++;
}
}
}
if(b.kind==='tower'){
if(faceOn('s',b)) vface(b.x+b.w*0.2,b.y+b.h,b.x+b.w*0.8,b.y+b.h,st.ht*0.72,st.ht*0.8,'#9fd0e8');
}
drawLabel(b, st.ht);
});
}
function queueSolid(b){
var st, step, x, y, w, h, i, x0, x1, y0, y1;
st=styleOf(b);
step=44;
x=b.x; y=b.y; w=b.w; h=b.h;
if(faceOn('s',b)){
i=0;
while(i<w){
x0=x+i; x1=x0+step; if(x1>x+w) x1=x+w;
wallBits(b,st,'s',x0,y+h,x1,y+h);
i+=step;
}
}
if(faceOn('n',b)){
i=0;
while(i<w){
x0=x+i; x1=x0+step; if(x1>x+w) x1=x+w;
wallBits(b,st,'n',x0,y,x1,y);
i+=step;
}
}
if(faceOn('w',b)){
i=0;
while(i<h){
y0=y+i; y1=y0+step; if(y1>y+h) y1=y+h;
wallBits(b,st,'w',x,y0,x,y1);
i+=step;
}
}
if(faceOn('e',b)){
i=0;
while(i<h){
y0=y+i; y1=y0+step; if(y1>y+h) y1=y+h;
wallBits(b,st,'e',x+w,y0,x+w,y1);
i+=step;
}
}
queueRoof(b,st);
if(b.kind!=='wall') queueExtras(b,st);
}
function onHero(wx,wy){
var pz,z,a,b,lim;
pz=depthAt(player.x,player.y);
z=depthAt(wx,wy);
if(z+8<pz) return true;
if(z>pz+150) return false;
a=project(wx,wy,0);
b=project(player.x,player.y,0);
if(!a) return false;
if(!b) return false;
lim=22*b.s;
if(lim<18) lim=18;
if(lim>64) lim=64;
if(Math.abs(a.x-b.x)>lim) return false;
if(a.y<b.y-lim*2.1) return false;
return true;
}
function enqueueAll(){
var i,b,p,w,c,s,step,hot,z;
for(i=0;i<solids.length;i++){
b=solids[i];
z=depthAt(b.x+b.w*0.5, b.y+b.h*0.5);
if(z<-120) continue;
if(z>1100) continue;
queueSolid(b);
}
for(i=0;i<props.length;i++){
p=props[i];
if(p.k==='tree'){
z=depthAt(p.x,p.y);
if(z>26){if(z<860){(function(p,z){push(z,function(){drawTree(p.x,p.y,p.r);});})(p,z);}}
}else if(p.k==='lamp'){
z=depthAt(p.x,p.y);
if(z>20){if(z<700){(function(p,z){push(z,function(){drawLampAt(p.x,p.y);});})(p,z);}}
}else if(p.k==='pillar'){
z=depthAt(p.x,p.y);
if(z>6){if(z<700){(function(p,z){push(z,function(){drawPillarAt(p.x,p.y);});})(p,z);}}
}else if(p.k==='bench'){
z=depthAt(p.x,p.y);
if(z>6){if(z<500){(function(p,z){push(z,function(){drawBenchAt(p.x,p.y);});})(p,z);}}
}else if(p.k==='stall'){
z=depthAt(1600,180);
if(z>6){if(z<700) push(z, drawStallAt);}
}
}
step=currentStep();
hot=step?step.poi:'';
for(i=0;i<CAST.length;i++){
c=CAST[i];
s=spotFor(c.poi);
if(!s) continue;
z=depthAt(s.x,s.y);
if(z<42) continue;
if(Math.hypot(player.x-s.x,player.y-s.y)<28) continue;
if(z>820) continue;
if(onHero(s.x,s.y)) continue;
(function(c,s,z,i){
push(z,function(){
var show=hot===c.poi;
if(Math.hypot(player.x-s.x,player.y-s.y)<120) show=true;
drawFigure(s.x,s.y,{
bob:animT*2+i, role:c.role, suit:c.suit,
skin:c.female?'#efc2b0':'#e0b090', hair:c.hair, pants:c.pants,
female:c.female?true:false, coat:c.coat?true:false, old:c.old?true:false,
hero:false, carry:false, name:show?c.name:'', active:hot===c.poi
}, faceYaw(s.x,s.y,player.x,player.y));
});
})(c,s,z,i);
}
for(i=0;i<cars.length;i++){
c=cars[i];
p=carPos(c);
z=depthAt(p.x,p.y);
if(z<80) continue;
if(z<depthAt(player.x,player.y)+10) continue;
if(z>820) continue;
if(onHero(p.x,p.y)) continue;
(function(c,p,z){push(z,function(){drawCar(c,p);});})(c,p,z);
}
for(i=0;i<walkers.length;i++){
w=walkers[i];
z=depthAt(w.x,w.y);
if(z<42) continue;
if(Math.hypot(player.x-w.x,player.y-w.y)<48) continue;
if(z>760) continue;
if(onHero(w.x,w.y)) continue;
(function(w,z){push(z,function(){
drawFigure(w.x,w.y,{
bob:w.bob, role:w.kind==='cop'?'cop':w.kind==='law'?'senior':'civ',
suit:w.kind==='law'?'#111111':w.kind==='cop'?'#c4a15a':w.col,
skin:'#e0b090', hair:'#24180f', pants:'#1c1917',
coat:w.kind==='law', female:false, hero:false, carry:false
}, walkerYaw(w));
});})(w,z);
}
z=depthAt(player.x,player.y);
push(z-0.8, drawHero);
if(step){
b=poiById(step.poi);
if(b){
s=doorOf(b);
z=depthAt(s.x,s.y);
if(z>2){if(z<900){(function(s,z){push(z,function(){drawBeacon(s.x,s.y);});})(s,z);}}
}
}
}
function drawCar(c,p){
var ht=14, roof='#dbe7ef', wall=c.col, x, y, w, h;
if(c.kind==='bus'){ht=24; roof='#dbeafe';}
if(c.kind==='auto'){ht=13; roof='#166534';}
x=p.x-p.w/2; y=p.y-p.h/2; w=p.w; h=p.h;
var b={x:x,y:y,w:w,h:h};
hface(x+1,y+2,w,h*0.4,0.3,'rgba(0,0,0,.2)');
if(faceOn('s',b)) vface(x,y+h,x+w,y+h,0,ht,wall);
if(faceOn('n',b)) vface(x,y,x+w,y,0,ht,wall);
if(faceOn('w',b)) vface(x,y,x,y+h,0,ht,wall);
if(faceOn('e',b)) vface(x+w,y,x+w,y+h,0,ht,wall);
if(c.kind!=='auto'){
if(faceOn('s',b)) vface(x+3,y+h,x+w-3,y+h,ht*0.5,ht*0.78,'#d7eef8');
if(faceOn('n',b)) vface(x+3,y,x+w-3,y,ht*0.5,ht*0.78,'#d7eef8');
if(faceOn('w',b)) vface(x,y+2,x,y+h-2,ht*0.5,ht*0.78,'#d7eef8');
if(faceOn('e',b)) vface(x+w,y+2,x+w,y+h-2,ht*0.5,ht*0.78,'#d7eef8');
}
hface(x,y,w,h,ht,roof);
var wz=project(x+3,y+3,2), wz2=project(x+w-3,y+3,2), wz3=project(x+3,y+h-3,2), wz4=project(x+w-3,y+h-3,2);
ctx.fillStyle='#111827';
if(wz){ctx.beginPath(); ctx.arc(wz.x,wz.y,Math.max(1.4,wz.s*2),0,6.283185); ctx.fill();}
if(wz2){ctx.beginPath(); ctx.arc(wz2.x,wz2.y,Math.max(1.4,wz2.s*2),0,6.283185); ctx.fill();}
if(wz3){ctx.beginPath(); ctx.arc(wz3.x,wz3.y,Math.max(1.4,wz3.s*2),0,6.283185); ctx.fill();}
if(wz4){ctx.beginPath(); ctx.arc(wz4.x,wz4.y,Math.max(1.4,wz4.s*2),0,6.283185); ctx.fill();}
}
function drawRadar(){
var s=108, x=VW-s-12, y=10, sx=s/WORLD_W, sy=s/WORLD_H, i, step, d, b, px, py;
ctx.save();
ctx.fillStyle='rgba(8,14,20,.8)';
ctx.fillRect(x-5,y-5,s+10,s+22);
ctx.beginPath();
ctx.rect(x,y,s,s);
ctx.clip();
ctx.fillStyle='#67b84c';
ctx.fillRect(x,y,s,s);
ctx.fillStyle='#5c6572';
for(i=0;i<roads.length;i++){
b=roads[i];
ctx.fillRect(x+b.x*sx,y+b.y*sy,Math.max(2,b.w*sx),Math.max(2,b.h*sy));
}
ctx.fillStyle='#8d5a3a';
for(i=0;i<solids.length;i++){
b=solids[i];
if(b.kind==='wall') continue;
ctx.fillRect(x+b.x*sx,y+b.y*sy,Math.max(1.5,b.w*sx),Math.max(1.5,b.h*sy));
}
ctx.fillStyle='#3aa0d8';
ctx.fillRect(x+park.x*sx,y+park.y*sy,park.w*sx,park.h*sy);
step=currentStep();
if(step){
b=poiById(step.poi);
if(b){
d=doorOf(b);
ctx.fillStyle='#e2b657';
ctx.beginPath();
ctx.arc(x+d.x*sx,y+d.y*sy,3.4,0,6.283185);
ctx.fill();
}
}
px=x+player.x*sx;
py=y+player.y*sy;
ctx.translate(px,py);
ctx.rotate(player.yaw);
ctx.fillStyle='#ffffff';
ctx.beginPath();
ctx.moveTo(0,6);
ctx.lineTo(3.3,-3.2);
ctx.lineTo(0,-1);
ctx.lineTo(-3.3,-3.2);
ctx.closePath();
ctx.fill();
ctx.restore();
ctx.strokeStyle='#e2b657';
ctx.lineWidth=2;
ctx.strokeRect(x,y,s,s);
ctx.fillStyle='#e2b657';
ctx.font='10px system-ui,sans-serif';
ctx.textAlign='left';
ctx.fillText('DISTRICT', x, y+s+14);
}
function draw(){
var sx=0, sy=0;
beginView();
if(shake>0){sx=(Math.random()-0.5)*shake; sy=(Math.random()-0.5)*shake; shake--;}
ctx.setTransform(DPR,0,0,DPR,0,0);
ctx.imageSmoothingEnabled=true;
ctx.clearRect(0,0,VW,VH);
ctx.save();
if(sx||sy) ctx.translate(sx,sy);
drawSky();
drawGround();
drawSlabs();
drawMarks();
enqueueAll();
flush();
ctx.restore();
var vg=ctx.createRadialGradient(VW*0.5,VH*0.45,Math.min(VW,VH)*0.2,VW*0.5,VH*0.55,Math.max(VW,VH)*0.75);
vg.addColorStop(0,'rgba(0,0,0,0)');
vg.addColorStop(1,'rgba(20,32,44,.18)');
ctx.fillStyle=vg;
ctx.fillRect(0,0,VW,VH);
drawRadar();
}
function drawHero(){
drawFigure(player.x,player.y,{
bob:player.bob, role:'senior',
suit:player.gender==='female'?'#7c243c':'#1d3f72',
skin:player.gender==='female'?'#efc2b0':'#e0b090',
hair:player.gender==='female'?'#2a1a16':'#161616',
pants:'#0f172a', coat:state.done>=2, female:player.gender==='female',
hero:true, carry:state.carry?true:false
}, player.yaw);
}
function frame(t){
var dt;
if(!lastT) lastT=t||0;
dt=Math.min(0.05,((t||0)-lastT)/1000);
lastT=t||0;
if(playing){if(!modalOpen){
sim(dt);
updateCars();
updateWalkers(dt);
canteenWatch();
tick(dt);
}}
animT+=dt;
if(toastT>0){toastT--;if(toastT<=0) document.getElementById('toast').style.display='none';}
hud();
draw();
requestAnimationFrame(frame);
}
function codeToKey(c){
if(c==='KeyW'||c==='w') return 'w';
if(c==='KeyA'||c==='a') return 'a';
if(c==='KeyS'||c==='s') return 's';
if(c==='KeyD'||c==='d') return 'd';
if(c==='ArrowUp') return 'arrowup';
if(c==='ArrowDown') return 'arrowdown';
if(c==='ArrowLeft') return 'arrowleft';
if(c==='ArrowRight') return 'arrowright';
return '';
}
function endStick(){
stick.x=0; stick.y=0; stick.on=0; stick.down=0;
var knob=document.getElementById('knob');
if(knob) knob.style.transform='translate(0px,0px)';
}
function bindStick(){
var pad=document.getElementById('pad');
var knob=document.getElementById('knob');
if(!pad) return;
if(!pad.addEventListener) return;
function local(ev){
var r=pad.getBoundingClientRect?pad.getBoundingClientRect():null;
if(!r) return;
if(!r.width) return;
var src=ev;
if(ev.touches){if(ev.touches.length) src=ev.touches[0];}
var dx=src.clientX-(r.left+r.width/2);
var dy=src.clientY-(r.top+r.height/2);
var max=r.width*0.36;
var len=Math.hypot(dx,dy);
if(len>max){dx=dx/len*max; dy=dy/len*max; len=max;}
if(len<max*0.16){stick.x=0; stick.y=0;}
else{stick.x=dx/max; stick.y=dy/max;}
stick.on=1;
stick.down=1;
if(knob) knob.style.transform='translate('+dx+'px,'+dy+'px)';
}
pad.addEventListener('pointerdown', function(ev){
if(ev.preventDefault) ev.preventDefault();
if(pad.setPointerCapture){if(ev.pointerId!==undefined) pad.setPointerCapture(ev.pointerId);}
local(ev);
});
window.addEventListener('pointermove', function(ev){if(!stick.down) return; local(ev);});
window.addEventListener('pointerup', endStick);
window.addEventListener('pointercancel', endStick);
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
document.getElementById('btn-later').onclick=function(){
document.getElementById('file').classList.add('hidden');modalOpen=false;
};
document.getElementById('act').onclick=function(e){if(e.preventDefault) e.preventDefault();openFile();};
bindStick();
window.addEventListener('keydown',function(e){
var k=e.key.toLowerCase();
var tag='';
if(e.target){if(e.target.tagName) tag=e.target.tagName.toLowerCase();}
if(tag==='input'||tag==='textarea') return;
keys[k]=1;
if(k==='e'||k===' '){e.preventDefault();openFile();}
if(k==='arrowup'||k==='arrowdown'||k==='arrowleft'||k==='arrowright') e.preventDefault();
if(playing){if(k==='w'||k==='a'||k==='s'||k==='d') e.preventDefault();}
});
window.addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=0;});
window.addEventListener('blur',function(){keys={}; endStick();});
window.addEventListener('resize',resize);
function initProps(){
var i,b,r,x,y,spots,s,y0,gx,gy;
props=[];
spots=[[48,64,16],[130,190,20],[250,78,15],[286,220,18],[78,250,14],[180,36,13],[300,150,17],[40,150,12]];
for(i=0;i<spots.length;i++){
s=spots[i];
props.push({k:'tree',x:park.x+s[0],y:park.y+s[1],r:s[2]});
}
props.push({k:'bench',x:park.x+70,y:park.y+park.h/2+20});
props.push({k:'bench',x:park.x+220,y:park.y+80});
props.push({k:'tree',x:300,y:370,r:14});
props.push({k:'tree',x:560,y:250,r:12});
props.push({k:'tree',x:250,y:470,r:13});
props.push({k:'tree',x:1180,y:360,r:14});
props.push({k:'tree',x:700,y:300,r:11});
for(i=0;i<BUILDINGS.length;i++){
b=BUILDINGS[i];
if(b.kind==='house'){if(!hitsSolid(b.x-16,b.y+12)) props.push({k:'tree',x:b.x-16,y:b.y+12,r:11});}
}
for(i=0;i<roads.length;i++){
r=roads[i];
if(r.w>r.h){
for(x=r.x+120;x<r.x+r.w-80;x+=260){
y=r.y-20;
if(onPath(x,y)){if(!hitsSolid(x,y)) props.push({k:'lamp',x:x,y:y});}
y=r.y+r.h+20;
if(onPath(x,y)){if(!hitsSolid(x,y)) props.push({k:'lamp',x:x,y:y});}
}
}else{
for(y=r.y+140;y<r.y+r.h-80;y+=280){
x=r.x-18;
if(onPath(x,y)){if(!hitsSolid(x,y)) props.push({k:'lamp',x:x,y:y});}
x=r.x+r.w+18;
if(onPath(x,y)){if(!hitsSolid(x,y)) props.push({k:'lamp',x:x,y:y});}
}
}
}
for(i=0;i<yardDefs.length;i++){
y0=yardDefs[i];
if(y0.gate==='s'){
gx=y0.x+y0.w/2-42;
props.push({k:'pillar',x:gx+4,y:y0.wallY-2});
props.push({k:'pillar',x:gx+68,y:y0.wallY-2});
}
if(y0.gate==='w'){
gy=y0.y+y0.h/2-42;
props.push({k:'pillar',x:y0.wallX-2,y:gy+4});
props.push({k:'pillar',x:y0.wallX-2,y:gy+66});
}
}
props.push({k:'stall'});
}
var CAST=[
{poi:'office',name:'Mrs Kumar',role:'family',suit:'#c45a68',hair:'#3a2418',female:true,pants:'#7c2d3a'},
{poi:'police',name:'Iqbal',role:'cop',suit:'#c4a15a',hair:'#1a1a1a',pants:'#6b5a32'},
{poi:'client',name:'Uncle Suresh',role:'client',suit:'#e7e0d4',hair:'#e7e5e4',pants:'#3f3f46',old:true},
{poi:'chamber',name:'Senior Shah',role:'senior',suit:'#111111',hair:'#f4f4f5',pants:'#111111',coat:true,old:true},
{poi:'filing',name:'Clerk Meera',role:'clerk',suit:'#1d4e89',hair:'#2a1a16',female:true,pants:'#1e3a5f'},
{poi:'asha',name:'Asha Jain',role:'client',suit:'#f8eef2',hair:'#2a1a16',female:true,pants:'#7c2d3a'},
{poi:'registry',name:'Copy Clerk',role:'clerk',suit:'#0f766e',hair:'#1a1a1a',pants:'#134e4a'},
{poi:'court',name:'Usher',role:'usher',suit:'#f4efe4',hair:'#3a2a22',pants:'#1c1917'},
{poi:'typist',name:'Raju',role:'clerk',suit:'#f3e6c8',hair:'#1a1a1a',pants:'#44403c'},
{poi:'stamps',name:'Gopal',role:'clerk',suit:'#b45309',hair:'#1a1a1a',pants:'#44403c'},
{poi:'hostel',name:'Meher Sen',role:'student',suit:'#1e3a5f',hair:'#2a1a16',female:true,pants:'#1e293b'},
{poi:'bank',name:'Bank Officer',role:'clerk',suit:'#115e59',hair:'#1a1a1a',pants:'#0f3d3a'}
];
function spotFor(poi){
var b=poiById(poi),d,tries,i,x,y;
if(!b) return null;
d=doorOf(b);
if(b.door==='s') tries=[[28,18],[-28,18],[28,32],[-28,32],[0,34]];
else if(b.door==='n') tries=[[28,-18],[-28,-18],[28,-32],[0,-34]];
else if(b.door==='w') tries=[[-18,28],[-18,-28],[-32,22],[-34,0]];
else tries=[[18,28],[18,-28],[32,22],[34,0]];
for(i=0;i<tries.length;i++){
x=d.x+tries[i][0]; y=d.y+tries[i][1];
if(!blocked(x,y)) return {x:x,y:y};
}
return {x:d.x,y:d.y};
}
buildCity();
initWalkers();
initProps();
resize();
syncCam();
frame(0);
globalThis.__AAG={
blocked:blocked,doorOf:doorOf,solids:solids,roads:roads,park:park,
WORLD_W:WORLD_W,WORLD_H:WORLD_H,MISSIONS:MISSIONS,player:player,
redraw:draw,cam:cam,spotFor:spotFor,syncCam:syncCam,sim:sim,project:project,
forward:forwardOf,state:state,resize:resize,streetName:streetName
};
globalThis.__controlsTest={
getYaw:function(){return player.yaw;},
getSpeed:function(){return player.speed;},
setSteer:function(v){forcedSteer=v;},
setKeys:function(codes){
var i,k;
keys={};
forcedSteer=null;
stick.on=0;
for(i=0;i<codes.length;i++){
k=codeToKey(codes[i]);
if(k) keys[k]=1;
}
}
};
})();

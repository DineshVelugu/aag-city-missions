(function(){
var canvas=document.getElementById('c');
var ctx=canvas.getContext('2d');
var root=document.getElementById('game-root');
var cityCanvas=null;
var VW=360,VH=640,DPR=1;
var WORLD_W=2100,WORLD_H=1500,PAD=36,DOOR=22,INFL=6;
var keys={},hold={up:0,down:0,left:0,right:0};
var player={x:300,y:96,dir:'down',gender:'male',bob:0};
var cam={x:0,y:0};
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
var best='',bestD=1e9,i,r,cx,cy,d;
for(i=0;i<roads.length;i++){
r=roads[i];
cx=r.x+r.w/2;cy=r.y+r.h/2;
if(r.hrod||r.name){}
d=1e9;
if(player.x>=r.x-PAD){if(player.x<=r.x+r.w+PAD){if(player.y>=r.y-PAD){if(player.y<=r.y+r.h+PAD){
if(r.w>r.h) d=Math.abs(player.y-(r.y+r.h/2));
else d=Math.abs(player.x-(r.x+r.w/2));
}}}}
if(d<bestD){bestD=d;best=r.name;}
}
if(!best) best='OFF THE ROAD';
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
state.x=player.x;state.y=player.y;state.gender=player.gender;
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
if(!playing) obj.textContent='The file marker is the next door.\nStay on the road and the pavement.';
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
if(show){bar.textContent=step.near||'Open the brief';document.getElementById('act').classList.add('on');}
else document.getElementById('act').classList.remove('on');
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
playing=true;
document.getElementById('login').classList.add('hidden');
document.getElementById('gender').classList.add('hidden');
syncTimer();
hud();
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
var ISO_X=1.05, ISO_Y=0.62, OX=1700, OY=220;
var BAKE_W=4050, BAKE_H=2620;
var props=[];
function iso(x,y,z){
return {x:(x-y)*ISO_X+OX, y:(x+y)*ISO_Y-(z||0)+OY};
}
function poly(pts){
var i;
ctx.beginPath();
ctx.moveTo(pts[0].x,pts[0].y);
for(i=1;i<pts.length;i++) ctx.lineTo(pts[i].x,pts[i].y);
ctx.closePath();
}
function fillPoly(pts,color){
ctx.fillStyle=color;
poly(pts);
ctx.fill();
}
function strokePoly(pts,color,w){
ctx.save();
ctx.strokeStyle=color;
ctx.lineWidth=w||1;
ctx.lineJoin='round';
poly(pts);
ctx.stroke();
ctx.restore();
}
function quad(x,y,w,h,z){
return [iso(x,y,z),iso(x+w,y,z),iso(x+w,y+h,z),iso(x,y+h,z)];
}
function shade(hex,amt){
var r=parseInt(hex.slice(1,3),16);
var g=parseInt(hex.slice(3,5),16);
var b=parseInt(hex.slice(5,7),16);
function ch(v){
var n=Math.round(v+(amt>0?(255-v)*amt:v*amt));
if(n<0) n=0;
if(n>255) n=255;
var s=n.toString(16);
if(s.length<2) s='0'+s;
return s;
}
return '#'+ch(r)+ch(g)+ch(b);
}
function faces(x,y,w,h,z0,z1,south,east){
fillPoly([iso(x,y+h,z0),iso(x+w,y+h,z0),iso(x+w,y+h,z1),iso(x,y+h,z1)],south);
fillPoly([iso(x+w,y+h,z0),iso(x+w,y,z0),iso(x+w,y,z1),iso(x+w,y+h,z1)],east);
}
function winFace(x0,y0,x1,y1,z0,z1,col){
fillPoly([iso(x0,y0,z0),iso(x1,y1,z0),iso(x1,y1,z1),iso(x0,y0,z1)],col);
}
function roofFlat(x,y,w,h,z,col){
fillPoly(quad(x-5,y-5,w+10,h+10,z),shade(col,-0.12));
if(w>18){if(h>18){
fillPoly(quad(x+5,y+5,w-10,h-10,z+4),shade(col,0.16));
}}
}
function roofPitch(x,y,w,h,z,ridge,col,lit,gable){
var ox=x-4, oy=y-4, ow=w+8, oh=h+8;
var rn=iso(ox+ow*0.5,oy+oh*0.14,z+ridge);
var rs=iso(ox+ow*0.5,oy+oh*0.88,z+ridge);
fillPoly([iso(ox,oy,z),iso(ox,oy+oh,z),rs,rn],lit||shade(col,0.08));
fillPoly([iso(ox+ow,oy,z),rn,rs,iso(ox+ow,oy+oh,z)],shade(col,-0.22));
fillPoly([iso(x,y+h,z),iso(x+w,y+h,z),iso(x+w*0.5,y+h*0.86,z+ridge*0.92)],shade(gable||col,0.16));
ctx.save();
ctx.strokeStyle=shade(col,0.28);
ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(rn.x,rn.y);
ctx.lineTo(rs.x,rs.y);
ctx.stroke();
ctx.restore();
}
function isoEllipse(cx,cy,rx,ry,z,color){
var i,a,p;
ctx.beginPath();
for(i=0;i<=24;i++){
a=i/24*6.283185;
p=iso(cx+Math.cos(a)*rx,cy+Math.sin(a)*ry,z);
if(i===0) ctx.moveTo(p.x,p.y);
else ctx.lineTo(p.x,p.y);
}
ctx.closePath();
ctx.fillStyle=color;
ctx.fill();
}
function strokeIso(x1,y1,x2,y2,z){
var a=iso(x1,y1,z), b=iso(x2,y2,z);
ctx.beginPath();
ctx.moveTo(a.x,a.y);
ctx.lineTo(b.x,b.y);
ctx.stroke();
}
function plateAt(text,wx,wy){
var p=iso(wx,wy,10);
ctx.save();
ctx.font='bold 12px system-ui,sans-serif';
ctx.textAlign='left';
var tw=ctx.measureText(text).width;
ctx.fillStyle='#14345c';
ctx.fillRect(p.x,p.y,tw+16,18);
ctx.strokeStyle='#f4f7fb';
ctx.lineWidth=1;
ctx.strokeRect(p.x+1,p.y+1,tw+14,16);
ctx.fillStyle='#f4f7fb';
ctx.fillText(text,p.x+8,p.y+13);
ctx.restore();
}
function namePlate(b,z){
if(!b.name) return;
if(b.name.indexOf('HOUSE ')===0) return;
var p=iso(b.x+b.w/2,b.y+b.h*0.35,z);
ctx.save();
ctx.font='bold 12px system-ui,sans-serif';
ctx.textAlign='center';
var tw=ctx.measureText(b.name).width;
ctx.fillStyle='rgba(16,20,16,.82)';
ctx.fillRect(p.x-tw/2-8,p.y-12,tw+16,18);
ctx.fillStyle='#f6edd6';
ctx.fillText(b.name,p.x,p.y+2);
ctx.restore();
}
function drawWindows(b,zStart,ht,floors){
var usable,gap,row,z,u,v,lit,ww=11,wh=10,step=18;
if(!floors) return;
usable=ht-zStart-8;
gap=usable/floors;
if(gap<14) gap=14;
for(row=0;row<floors;row++){
z=zStart+row*gap;
if(z+wh>ht-5) continue;
for(u=9;u<b.w-16;u+=step){
if(b.door==='s'){if(row===0){if(Math.abs(u+ww/2-b.w/2)<14) continue;}}
lit=hash(b.x*0.17+u+row*9+b.y)>0.72;
winFace(b.x+u-1,b.y+b.h,b.x+u+ww+1,b.y+b.h,z-1,z+wh+1,'#f7f4ee');
winFace(b.x+u,b.y+b.h,b.x+u+ww,b.y+b.h,z,z+wh,lit?'#ffe29a':'#8ec8ea');
if(lit) winFace(b.x+u,b.y+b.h,b.x+u+3,b.y+b.h,z,z+wh,'rgba(255,255,255,.45)');
}
for(v=8;v<b.h-16;v+=step){
if(b.door==='e'){if(row===0){if(Math.abs(v+5-b.h/2)<12) continue;}}
lit=hash(b.y*0.23+v+row*7+b.x+3)>0.74;
winFace(b.x+b.w,b.y+v-1,b.x+b.w,b.y+v+ww+1,z-1,z+wh+1,'#efeae2');
winFace(b.x+b.w,b.y+v,b.x+b.w,b.y+v+ww,z,z+wh,lit?'#ffe29a':'#6eafd4');
}
}
}
function drawDoor(b){
var dw=13,dh=22,u,v;
if(b.kind==='court') dh=28;
if(b.kind==='bank') dh=26;
if(b.door==='s'){
u=b.x+b.w/2-dw/2;
fillPoly(quad(u-3,b.y+b.h,dw+6,7,1),'#efe3d0');
winFace(u,b.y+b.h,u+dw,b.y+b.h,0,dh,'#4a3024');
winFace(u+2,b.y+b.h,u+dw-2,b.y+b.h,dh-10,dh-2,'#d7eef8');
winFace(u+dw-4,b.y+b.h,u+dw-2,b.y+b.h,10,13,'#e6c56a');
}else if(b.door==='e'){
v=b.y+b.h/2-dw/2;
fillPoly(quad(b.x+b.w,v-2,7,dw+4,1),'#efe3d0');
winFace(b.x+b.w,v,b.x+b.w,v+dw,0,dh,'#4a3024');
winFace(b.x+b.w,v+2,b.x+b.w,v+dw-2,dh-10,dh-2,'#d7eef8');
winFace(b.x+b.w,v+dw-4,b.x+b.w,v+dw-2,10,13,'#e6c56a');
}
}
function awning(b,z,c1,c2){
var i,slice,y=b.y+b.h,depth=16,c;
if(b.w<30) return;
slice=b.w/8;
for(i=0;i<8;i++){
c=i%2?c1:c2;
fillPoly([
iso(b.x+i*slice,y,z),
iso(b.x+(i+1)*slice,y,z),
iso(b.x+(i+1)*slice,y+depth,z-8),
iso(b.x+i*slice,y+depth,z-8)
],c);
}
}
function chimney(x,y,z,top){
faces(x,y,9,8,z,top,'#7a5344','#5c3d32');
fillPoly(quad(x-1,y-1,11,10,top),'#3a2a26');
}
function bandSouth(b,z,col){
fillPoly([iso(b.x,b.y+b.h,z),iso(b.x+b.w,b.y+b.h,z),iso(b.x+b.w,b.y+b.h,z+3),iso(b.x,b.y+b.h,z+3)],col);
}
function portico(b,ht){
var xs=[b.x+8,b.x+26,b.x+b.w-36,b.x+b.w-18],i,x;
for(i=0;i<xs.length;i++){
x=xs[i];
faces(x,b.y+b.h-1,10,12,0,ht,'#fbf7f0','#e4d8c6');
fillPoly(quad(x,b.y+b.h-1,10,12,ht),'#fffdf8');
}
fillPoly([
iso(b.x+4,b.y+b.h+8,ht),
iso(b.x+b.w-4,b.y+b.h+8,ht),
iso(b.x+b.w-8,b.y+b.h-2,ht+5),
iso(b.x+8,b.y+b.h-2,ht+5)
],'#f7f1e6');
}
function stepsSouth(b,n){
var i,grow,y0=b.y+b.h;
for(i=n;i>=1;i--){
grow=i*5;
fillPoly(quad(b.x+b.w/2-16-grow,y0+(n-i)*7,32+grow*2,8,i*1.6),i%2?'#f7f1e4':'#e5d7c2');
}
}
function flagAt(x,y,z){
var a=iso(x,y,z), b=iso(x,y,z+34);
ctx.save();
ctx.strokeStyle='#5c4632';
ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(a.x,a.y);
ctx.lineTo(b.x,b.y);
ctx.stroke();
ctx.fillStyle='#e07a2f';
ctx.fillRect(b.x,b.y,18,5);
ctx.fillStyle='#f8fafc';
ctx.fillRect(b.x,b.y+5,18,5);
ctx.fillStyle='#138808';
ctx.fillRect(b.x,b.y+10,18,5);
ctx.restore();
}
function clockAt(x,y,z){
var p=iso(x,y,z);
ctx.save();
ctx.fillStyle='#f8fafc';
ctx.beginPath();
ctx.arc(p.x,p.y,12,0,6.283185);
ctx.fill();
ctx.strokeStyle='#1f2937';
ctx.lineWidth=1.5;
ctx.stroke();
ctx.beginPath();
ctx.moveTo(p.x,p.y);
ctx.lineTo(p.x,p.y-7);
ctx.moveTo(p.x,p.y);
ctx.lineTo(p.x+5,p.y+2);
ctx.stroke();
ctx.restore();
}
function signFace(b,text,col,z){
winFace(b.x+10,b.y+b.h,b.x+b.w-10,b.y+b.h,z,z+8,col);
}
function hedge(b){
var y=b.y+b.h+4, mid=b.x+b.w/2, leftW, rightX;
if(b.door==='s'){
leftW=mid-b.x-18;
if(leftW>8){
faces(b.x+2,y,leftW,7,0,9,'#2f9a4a','#1d6e34');
fillPoly(quad(b.x+2,y,leftW,7,9),'#62d472');
}
rightX=mid+16;
if(b.x+b.w-4-rightX>8){
faces(rightX,y,b.x+b.w-4-rightX,7,0,9,'#2f9a4a','#1d6e34');
fillPoly(quad(rightX,y,b.x+b.w-4-rightX,7,9),'#62d472');
}
}else{
faces(b.x+4,y,b.w-8,7,0,9,'#2f9a4a','#1d6e34');
fillPoly(quad(b.x+4,y,b.w-8,7,9),'#62d472');
}
}
function flowers(wx,wy){
var p=iso(wx,wy,10);
ctx.fillStyle='#e24b6a';
ctx.beginPath();ctx.arc(p.x,p.y,3.2,0,6.283185);ctx.fill();
ctx.fillStyle='#f2d14a';
ctx.beginPath();ctx.arc(p.x+6,p.y+1,2.4,0,6.283185);ctx.fill();
ctx.fillStyle='#f7f7f2';
ctx.beginPath();ctx.arc(p.x-5,p.y+2,2.2,0,6.283185);ctx.fill();
}
function paintWall(b){
var south='#e7dcc8', east='#cfc3ae', top='#f6f0e4';
if(b.y>650){south='#d5dee8';east='#a9b8c8';top='#f3f7fb';}
else if(b.x>800){south='#ddd6c8';east='#bdb6a6';top='#f4f0e6';}
faces(b.x,b.y,b.w,b.h,0,15,south,east);
fillPoly(quad(b.x-1,b.y-1,b.w+2,b.h+2,16),top);
}
function paintHouse(b){
var tall=hash(b.x+b.y*1.7)>0.55;
var ht=tall?46:38;
var ridge=tall?16:12;
var south=shade(b.wall,0.04);
var east=shade(b.wall,-0.2);
faces(b.x-2,b.y-2,b.w+4,b.h+4,0,7,'#e7dcc8','#cfc3ae');
fillPoly(quad(b.x-2,b.y-2,b.w+4,b.h+4,7),'#f4ecdf');
faces(b.x,b.y,b.w,b.h,7,ht,south,east);
roofPitch(b.x,b.y,b.w,b.h,ht,ridge,b.roof,b.roof2,south);
chimney(b.x+b.w*0.68,b.y+b.h*0.28,ht+6,ht+ridge+12);
drawWindows(b,16,ht,tall?2:2);
drawDoor(b);
if(b.door==='s'){
fillPoly([
iso(b.x+b.w/2-16,b.y+b.h,30),
iso(b.x+b.w/2+16,b.y+b.h,30),
iso(b.x+b.w/2+18,b.y+b.h+12,20),
iso(b.x+b.w/2-18,b.y+b.h+12,20)
],b.roof);
}
hedge(b);
flowers(b.x+10,b.y+b.h+8);
flowers(b.x+b.w-16,b.y+b.h+8);
namePlate(b,ht+ridge+16);
}
function paintCourt(b){
var ht=50, ridge=14;
faces(b.x-6,b.y-6,b.w+12,b.h+12,0,8,'#efe4d0','#d5c6aa');
fillPoly(quad(b.x-6,b.y-6,b.w+12,b.h+12,8),'#f8f1e4');
faces(b.x,b.y,b.w,b.h,8,ht,'#f7f1e6','#e0d3bd');
bandSouth(b,ht-16,'#8d3a34');
bandSouth(b,22,'#8d3a34');
drawWindows(b,14,ht,2);
roofPitch(b.x,b.y,b.w,b.h,ht,ridge,'#a33b34','#d46558','#f4ead8');
faces(b.x+b.w/2-12,b.y+b.h/2-12,24,24,ht+ridge-6,ht+ridge+18,'#f7f1e6','#e4d6c0');
fillPoly(quad(b.x+b.w/2-14,b.y+b.h/2-14,28,28,ht+ridge+18),'#8d3a34');
stepsSouth(b,4);
portico(b,40);
drawDoor(b);
signFace(b,'DISTRICT COURT','#7a1f1f',ht-32);
flagAt(b.x+b.w-16,b.y+10,ht+ridge);
namePlate(b,ht+ridge+28);
}
function paintTower(b){
var ht=92;
faces(b.x-3,b.y-3,b.w+6,b.h+6,0,8,'#e7dcc8','#cfc3ae');
faces(b.x,b.y,b.w,b.h,8,ht,'#f3ead8','#dccdb6');
bandSouth(b,ht-10,'#8d3a34');
roofPitch(b.x,b.y,b.w,b.h,ht,26,'#8d3a34','#c45a4a','#f4ead8');
clockAt(b.x+b.w/2,b.y+b.h,ht*0.62);
flagAt(b.x+b.w/2,b.y+4,ht+30);
}
function paintFirm(b){
var ht=60;
faces(b.x-3,b.y-3,b.w+6,b.h+6,0,8,'#e7dcc8','#cfc3ae');
fillPoly(quad(b.x-3,b.y-3,b.w+6,b.h+6,8),'#f4ecdf');
faces(b.x,b.y,b.w,b.h,8,ht,'#f6efe2','#ddd0ba');
bandSouth(b,26,'#c4a574');
bandSouth(b,42,'#c4a574');
drawWindows(b,14,ht,3);
roofFlat(b.x,b.y,b.w,b.h,ht,'#6d5642');
stepsSouth(b,3);
drawDoor(b);
signFace(b,'AAG LAW','#7a1f1f',ht-20);
namePlate(b,ht+18);
}
function paintChamber(b){
var ht=56;
faces(b.x-3,b.y-3,b.w+6,b.h+6,0,8,'#d5dbe2','#b7c0c8');
faces(b.x,b.y,b.w,b.h,8,ht,'#e7eef4','#c5d0da');
bandSouth(b,22,'#8a93a0');
bandSouth(b,38,'#8a93a0');
drawWindows(b,14,ht,3);
roofFlat(b.x,b.y,b.w,b.h,ht,'#3e4854');
stepsSouth(b,3);
portico(b,36);
drawDoor(b);
signFace(b,'CHAMBERS','#1e293b',ht-20);
namePlate(b,ht+16);
}
function paintGov(b){
var ht=22;
faces(b.x-2,b.y-2,b.w+4,b.h+4,0,5,'#efe3c8','#d5c4a4');
faces(b.x,b.y,b.w,b.h,5,ht,'#f6edd4','#e2d2ae');
roofFlat(b.x,b.y,b.w,b.h,ht,'#c4a15a');
drawWindows(b,10,ht,1);
awning(b,ht-4,'#f4e7c2','#e7c98a');
drawDoor(b);
namePlate(b,ht+14);
}
function paintShop(b){
var ht=18, ridge=6;
faces(b.x-2,b.y-2,b.w+4,b.h+4,0,5,'#f0e0c8','#d7c4a6');
faces(b.x,b.y,b.w,b.h,5,ht,'#f8e7c8','#e2ccaa');
roofPitch(b.x,b.y,b.w,b.h,ht,ridge,'#c48a3a','#e7c98a','#f8e7c8');
drawWindows(b,8,ht,1);
awning(b,ht-2,'#f4e7c2','#d7a441');
drawDoor(b);
namePlate(b,ht+ridge+12);
}
function paintBar(b){
var ht=18;
faces(b.x-2,b.y-2,b.w+4,b.h+4,0,5,'#f0d8c0','#d7bda4');
faces(b.x,b.y,b.w,b.h,5,ht,'#f6dcc0','#e2c2a4');
roofPitch(b.x,b.y,b.w,b.h,ht,6,'#7a3030','#c45a4a','#f6dcc0');
drawWindows(b,8,ht,1);
awning(b,ht-2,'#f2d3d3','#f7f4ee');
drawDoor(b);
signFace(b,'CANTEEN','#7f1d1d',ht-8);
namePlate(b,ht+16);
}
function paintBank(b){
var ht=58;
faces(b.x-4,b.y-4,b.w+8,b.h+8,0,10,'#d5e4e0','#b7ccc6');
faces(b.x,b.y,b.w,b.h,10,ht,'#e7f4f0','#c5ddd6');
bandSouth(b,ht-14,'#0f766e');
drawWindows(b,16,ht-8,3);
roofFlat(b.x,b.y,b.w,b.h,ht,'#14756c');
stepsSouth(b,3);
portico(b,42);
drawDoor(b);
signFace(b,'CITY BANK','#134e4a',ht-30);
faces(b.x+b.w-46,b.y+b.h+2,28,12,0,16,'#0f766e','#115e59');
fillPoly(quad(b.x+b.w-46,b.y+b.h+2,28,12,16),'#99f6e4');
var p=iso(b.x+b.w-32,b.y+b.h+8,12);
ctx.save();
ctx.fillStyle='#042f2e';
ctx.font='bold 10px system-ui,sans-serif';
ctx.textAlign='center';
ctx.fillText('ATM',p.x,p.y);
ctx.restore();
namePlate(b,ht+16);
}
function paintPolice(b){
var ht=56, ridge=18;
faces(b.x-3,b.y-3,b.w+6,b.h+6,0,7,'#d5dbe4','#b7c0cc');
faces(b.x,b.y,b.w,b.h,7,ht,'#e8eef6','#c9d3e0');
bandSouth(b,ht-12,'#1d4ed8');
drawWindows(b,14,ht,2);
roofPitch(b.x,b.y,b.w,b.h,ht,ridge,'#1e3a8a','#3b82f6','#e8eef6');
drawDoor(b);
var badge=iso(b.x+22,b.y+b.h,ht*0.55);
ctx.save();
ctx.fillStyle='#1d4ed8';
ctx.beginPath();ctx.arc(badge.x,badge.y,8,0,6.283185);ctx.fill();
ctx.fillStyle='#dbeafe';
ctx.beginPath();ctx.arc(badge.x,badge.y,3.5,0,6.283185);ctx.fill();
ctx.restore();
signFace(b,'P.S.','#1e3a8a',ht-26);
namePlate(b,ht+ridge+12);
}
function paintLockup(b){
var ht=44, u;
faces(b.x,b.y,b.w,b.h,0,ht,'#9aa3ad','#6b7280');
roofFlat(b.x,b.y,b.w,b.h,ht,'#4b5563');
for(u=6;u<b.w-4;u+=8){
winFace(b.x+u,b.y+b.h,b.x+u+2,b.y+b.h,8,ht-6,'#111827');
}
winFace(b.x+4,b.y+b.h,b.x+b.w-4,b.y+b.h,18,21,'#111827');
drawDoor(b);
namePlate(b,ht+12);
}
function paintHostel(b){
var ht=62, row, z;
faces(b.x-3,b.y-3,b.w+6,b.h+6,0,8,'#e7dcc8','#cfc3ae');
faces(b.x,b.y,b.w,b.h,8,ht,'#f6ead4','#e0d0b6');
for(row=0;row<4;row++){
z=24+row*16;
bandSouth(b,z,'#e7d3b0');
}
drawWindows(b,16,ht,5);
roofFlat(b.x,b.y,b.w,b.h,ht,'#6b5344');
faces(b.x+b.w-32,b.y+10,20,14,ht+4,ht+20,'#d5dde3','#b7c2cb');
fillPoly(quad(b.x+b.w-32,b.y+10,20,14,ht+20),'#eef3f6');
stepsSouth(b,2);
drawDoor(b);
signFace(b,'LAW HOSTEL','#6b3e22',ht-22);
namePlate(b,ht+28);
}
function paintBlock(b){
if(b.kind==='firm'){paintFirm(b);return;}
if(b.kind==='chamber'){paintChamber(b);return;}
if(b.kind==='gov'){paintGov(b);return;}
if(b.kind==='shop'){paintShop(b);return;}
if(b.kind==='hostel'){paintHostel(b);return;}
paintGov(b);
}
function paintBuilding(b){
if(b.kind==='wall'){paintWall(b);return;}
if(b.kind==='house'){paintHouse(b);return;}
if(b.kind==='court'){paintCourt(b);return;}
if(b.kind==='tower'){paintTower(b);return;}
if(b.kind==='police'){paintPolice(b);return;}
if(b.kind==='lockup'){paintLockup(b);return;}
if(b.kind==='bank'){paintBank(b);return;}
if(b.kind==='bar'){paintBar(b);return;}
paintBlock(b);
}
function drawSky(){
var g=ctx.createLinearGradient(0,0,0,BAKE_H);
g.addColorStop(0,'#8ecaf2');
g.addColorStop(0.35,'#d5eefb');
g.addColorStop(1,'#c6e7a4');
ctx.fillStyle=g;
ctx.fillRect(0,0,BAKE_W,BAKE_H);
}
function drawCloud(x,y,s){
ctx.fillStyle='rgba(255,255,255,.9)';
ctx.beginPath();ctx.ellipse(x,y,34*s,16*s,0,0,6.283185);ctx.fill();
ctx.beginPath();ctx.ellipse(x+26*s,y+4,22*s,13*s,0,0,6.283185);ctx.fill();
ctx.beginPath();ctx.ellipse(x-24*s,y+5,18*s,11*s,0,0,6.283185);ctx.fill();
}
function drawGrass(){
var x,y,n,col;
fillPoly(quad(-30,-30,WORLD_W+60,WORLD_H+60,0),'#67b84c');
for(y=0;y<WORLD_H;y+=72){
for(x=0;x<WORLD_W;x+=72){
n=hash(x*0.17+y*1.31);
if(n>0.96) col='#c6a86a';
else if(n>0.7) col='#63b44c';
else if(n>0.35) col='#6eb852';
else col='#74be58';
fillPoly(quad(x+3,y+3,66,66,0.15),col);
}
}
}
function drawYardsIso(){
var i,y0,col;
for(i=0;i<yards.length;i++){
y0=yards[i];
if(y0.kind==='court') col='#7dcf62';
else if(y0.kind==='police') col='#d5dbd4';
else col='#e4ddd0';
fillPoly(quad(y0.x,y0.y,y0.w,y0.h,0.4),col);
}
fillPoly(quad(250,348,70,150,0.5),'#f0e6d4');
fillPoly(quad(990,340,70,150,0.5),'#f3eee4');
}
function drawParkIso(){
fillPoly(quad(park.x,park.y,park.w,park.h,0.3),'#3eae62');
fillPoly(quad(park.x+8,park.y+8,park.w-16,park.h-16,0.45),'#49c072');
fillPoly(quad(park.x+park.w/2-14,park.y+18,28,park.h-36,0.7),'#f0e6d2');
fillPoly(quad(park.x+22,park.y+park.h/2-12,park.w-44,24,0.7),'#f0e6d2');
isoEllipse(park.x+park.w/2,park.y+park.h/2,46,30,1,'#3aa0d8');
isoEllipse(park.x+park.w/2-4,park.y+park.h/2-2,28,16,1.4,'#8ed4f2');
isoEllipse(park.x+park.w/2,park.y+park.h/2,10,6,2,'#f7fbff');
plateAt(park.name,park.x+24,park.y+28);
}
function drawPlots(){
var i,b;
for(i=0;i<BUILDINGS.length;i++){
b=BUILDINGS[i];
if(b.kind!=='house') continue;
fillPoly(quad(b.x-18,b.y-14,b.w+36,b.h+30,0.25),'#93d86e');
fillPoly(quad(b.x-12,b.y-8,b.w+20,b.h+16,0.35),'#a6e484');
}
}
function drawShadows(){
var i,b;
for(i=0;i<solids.length;i++){
b=solids[i];
if(b.kind==='wall') continue;
fillPoly([
iso(b.x+8,b.y+b.h-2,0),
iso(b.x+b.w+6,b.y+b.h-2,0),
iso(b.x+b.w+20,b.y+b.h+18,0),
iso(b.x+18,b.y+b.h+18,0)
],'rgba(36,48,18,.20)');
}
}
function drawDrives(){
var i,b,reach=42;
for(i=0;i<BUILDINGS.length;i++){
b=BUILDINGS[i];
if(b.door==='s') fillPoly(quad(b.x+b.w/2-11,b.y+b.h,22,reach,0.8),'#f3e6d0');
else if(b.door==='n') fillPoly(quad(b.x+b.w/2-11,b.y-reach,22,reach,0.8),'#f3e6d0');
else if(b.door==='w') fillPoly(quad(b.x-reach,b.y+b.h/2-11,reach,22,0.8),'#f3e6d0');
else fillPoly(quad(b.x+b.w,b.y+b.h/2-11,reach,22,0.8),'#f3e6d0');
fillPoly(quad(b.x+b.w/2-8,b.y+b.h/2-8,16,16,1.2),'#e7d3b0');
}
}
function drawRoadsIso(){
var i,j,r,v,k,cw;
for(i=0;i<roads.length;i++){
r=roads[i];
fillPoly(quad(r.x-PAD,r.y-PAD,r.w+PAD*2,r.h+PAD*2,0.2),'#f3eadc');
}
for(i=0;i<roads.length;i++){
r=roads[i];
fillPoly(quad(r.x,r.y,r.w,r.h,0.55),'#5c6572');
strokePoly(quad(r.x,r.y,r.w,r.h,0.6),'#3c4450',3);
}
ctx.save();
ctx.strokeStyle='rgba(255,255,255,.78)';
ctx.lineWidth=2;
for(i=0;i<roads.length;i++){
r=roads[i];
if(r.w>r.h){
strokeIso(r.x+6,r.y+5,r.x+r.w-6,r.y+5,1);
strokeIso(r.x+6,r.y+r.h-5,r.x+r.w-6,r.y+r.h-5,1);
}else{
strokeIso(r.x+5,r.y+6,r.x+5,r.y+r.h-6,1);
strokeIso(r.x+r.w-5,r.y+6,r.x+r.w-5,r.y+r.h-6,1);
}
}
ctx.strokeStyle='#f3e7b0';
ctx.lineWidth=2.5;
ctx.setLineDash([14,16]);
for(i=0;i<roads.length;i++){
r=roads[i];
if(r.w>r.h) strokeIso(r.x+12,r.y+r.h/2,r.x+r.w-12,r.y+r.h/2,1.2);
else strokeIso(r.x+r.w/2,r.y+12,r.x+r.w/2,r.y+r.h-12,1.2);
}
ctx.setLineDash([]);
ctx.restore();
for(i=0;i<roads.length;i++){
if(roads[i].w<roads[i].h) continue;
r=roads[i];
for(j=0;j<roads.length;j++){
v=roads[j];
if(v.w>v.h) continue;
cw=(v.w-16)/5;
for(k=0;k<5;k++){
fillPoly(quad(v.x+8+k*cw,r.y+8,Math.max(6,cw*0.45),r.h-16,1.3),'rgba(255,255,255,.88)');
}
}
}
plateAt('COURT ROAD',860,78);
plateAt('FILING STREET',860,590);
plateAt('HOUSE LANE',860,1068);
plateAt('STATION ROAD',78,250);
plateAt('COURT LANE',734,250);
plateAt('CHAMBERS ROAD',1336,250);
plateAt('EAST LANE',1876,250);
}
function bakeCity(){
cityCanvas=document.createElement('canvas');
cityCanvas.width=BAKE_W;
cityCanvas.height=BAKE_H;
var live=ctx;
ctx=cityCanvas.getContext('2d');
drawSky();
drawCloud(180,90,1.4);
drawCloud(520,50,1);
drawCloud(2500,70,1.3);
drawCloud(2900,160,0.9);
drawCloud(2100,40,1.1);
drawGrass();
drawPlots();
drawYardsIso();
drawParkIso();
drawShadows();
drawRoadsIso();
drawDrives();
ctx=live;
}
function depthOf(x,y){return x+y;}
var queue=[];
function pushDraw(z,fn){queue.push({z:z,fn:fn});}
function flushDraw(){
var i,j,a;
for(i=1;i<queue.length;i++){
a=queue[i];
j=i;
while(j>0){
if(queue[j-1].z<=a.z) break;
queue[j]=queue[j-1];
j--;
}
queue[j]=a;
}
for(i=0;i<queue.length;i++) queue[i].fn();
queue.length=0;
}
function drawIsoTree(x,y,r){
var g=iso(x,y,0);
var top=iso(x,y,r*1.15);
ctx.save();
ctx.fillStyle='rgba(30,50,16,.22)';
ctx.beginPath();ctx.ellipse(g.x+6,g.y+3,r*0.7,r*0.32,0.4,0,6.283185);ctx.fill();
ctx.fillStyle='#6b4423';
ctx.fillRect(g.x-2,top.y+r*0.15,4,g.y-top.y);
ctx.fillStyle='#166534';
ctx.beginPath();ctx.arc(g.x+r*0.2,top.y+r*0.15,r*0.72,0,6.283185);ctx.fill();
ctx.fillStyle='#1f7a3a';
ctx.beginPath();ctx.arc(g.x,top.y,r,0,6.283185);ctx.fill();
ctx.fillStyle='#3cb85c';
ctx.beginPath();ctx.arc(g.x-r*0.28,top.y-r*0.22,r*0.62,0,6.283185);ctx.fill();
ctx.fillStyle='#b6f0a4';
ctx.beginPath();ctx.arc(g.x-r*0.38,top.y-r*0.38,r*0.24,0,6.283185);ctx.fill();
ctx.restore();
}
function drawLamp(x,y){
var a=iso(x,y,0), b=iso(x,y,32);
ctx.save();
ctx.strokeStyle='#3a342c';
ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
ctx.fillStyle='#f8e7b0';
ctx.beginPath();ctx.arc(b.x,b.y,4.5,0,6.283185);ctx.fill();
ctx.fillStyle='rgba(255,214,120,.28)';
ctx.beginPath();ctx.arc(b.x,b.y,12,0,6.283185);ctx.fill();
ctx.restore();
}
function drawPillar(x,y){
faces(x,y,11,11,0,28,'#fbf7f0','#e4d8c6');
fillPoly(quad(x-1,y-1,13,13,28),'#e6c84a');
fillPoly(quad(x+2,y+2,7,7,32),'#fff6d0');
}
function drawBench(x,y){
faces(x,y,18,7,0,5,'#a56b3c','#7a4e28');
fillPoly(quad(x,y,18,7,5),'#c48a56');
faces(x,y,18,3,5,11,'#8d5a32','#6b4124');
}
function drawStall(){
var x=1568,y=162,w=86,h=42,ht=30;
faces(x,y,w,h,0,ht,'#f3e0c4','#d7c2a4');
roofPitch(x,y,w,h,ht,14,'#8d3428','#d06a42','#f3e0c4');
awning({x:x,y:y,w:w,h:h},22,'#f2d3d3','#f7f4ee');
signFace({x:x,y:y,w:w,h:h},'TEA','#7f1d1d',ht-16);
}
function drawPerson(x,y,o){
var tall=o.hero?58:48;
var feet=iso(x,y,0);
var hip=iso(x,y,tall*0.40);
var neck=iso(x,y,tall*0.66);
var head=iso(x,y,tall);
var swing=Math.sin((o.bob||0)*0.55)*(o.hero?4.2:3.2);
var bw=o.hero?18:15;
var bh=o.hero?20:16;
var role=o.role||(o.kind==='cop'?'cop':(o.kind==='law'?'senior':'civ'));
var suit=o.coat?'#141414':(o.suit||'#1d3f72');
var pants=o.pants||'#1e293b';
var skin=o.skin||'#e0b090';
ctx.save();
ctx.fillStyle='rgba(20,30,10,.28)';
ctx.beginPath();ctx.ellipse(feet.x+2,feet.y+2,o.hero?14:11,5.2,0.45,0,6.283185);ctx.fill();
ctx.fillStyle='#1c1917';
ctx.beginPath();ctx.ellipse(feet.x-5+swing*0.25,feet.y,4.2,2.3,0.4,0,6.283185);ctx.fill();
ctx.beginPath();ctx.ellipse(feet.x+5-swing*0.25,feet.y,4.2,2.3,0.4,0,6.283185);ctx.fill();
ctx.strokeStyle=pants;
ctx.lineWidth=o.hero?5:4.2;
ctx.lineCap='round';
ctx.beginPath();
ctx.moveTo(hip.x-4,hip.y);
ctx.lineTo(feet.x-5+swing,feet.y-2);
ctx.moveTo(hip.x+4,hip.y);
ctx.lineTo(feet.x+5-swing,feet.y-2);
ctx.stroke();
ctx.fillStyle=suit;
roundBody(neck.x-bw/2,neck.y-2,bw,bh);
if(role==='cop'){
ctx.fillStyle='#f8fafc';
ctx.fillRect(neck.x-bw/2,neck.y-2,bw,4);
ctx.fillStyle='#1e3a8a';
ctx.fillRect(neck.x-3,neck.y+4,6,8);
}else if(o.coat||role==='senior'){
ctx.fillStyle='#f8fafc';
ctx.fillRect(neck.x-1.2,neck.y,2.4,bh-4);
}else if(o.hero||role==='clerk'||role==='usher'){
ctx.fillStyle='#f8fafc';
ctx.fillRect(neck.x-2.4,neck.y,4.8,bh-5);
}
if(o.female){if(!o.coat){
ctx.fillStyle=shade(suit,-0.08);
ctx.beginPath();ctx.ellipse(neck.x,neck.y+bh*0.62,bw*0.62,bh*0.38,0,0,6.283185);ctx.fill();
}}
ctx.strokeStyle=skin;
ctx.lineWidth=o.hero?3.6:3;
ctx.beginPath();
ctx.moveTo(neck.x-bw/2+1,neck.y+3);
ctx.lineTo(neck.x-bw/2-5,neck.y+12+swing);
ctx.moveTo(neck.x+bw/2-1,neck.y+3);
ctx.lineTo(neck.x+bw/2+5,neck.y+12-swing);
ctx.stroke();
if(role==='student'){
ctx.fillStyle='#1e3a5f';
ctx.fillRect(neck.x-bw/2-5,neck.y+1,6,11);
ctx.fillStyle='#93c5fd';
ctx.fillRect(neck.x-bw/2-4,neck.y+2,4,4);
}
if(o.carry||role==='clerk'){
ctx.fillStyle='#f7f1e4';
ctx.fillRect(neck.x+bw/2+1,neck.y+2,8,11);
ctx.fillStyle='#7a1f1f';
ctx.fillRect(neck.x+bw/2+1,neck.y+2,8,3);
}
ctx.fillStyle=skin;
ctx.beginPath();ctx.arc(head.x,head.y,o.hero?8.2:6.8,0,6.283185);ctx.fill();
ctx.lineWidth=1.4;
ctx.strokeStyle='rgba(40,24,16,.35)';
ctx.stroke();
ctx.fillStyle='#2a2118';
ctx.fillRect(head.x-3.1,head.y-1.2,1.7,1.7);
ctx.fillRect(head.x+1.5,head.y-1.2,1.7,1.7);
ctx.fillStyle=o.hair||'#24180f';
ctx.beginPath();ctx.arc(head.x,head.y-1.5,o.hero?8:6.6,3.35,6.15);ctx.fill();
if(o.old||role==='senior'){
ctx.fillStyle='#f4f4f5';
ctx.beginPath();ctx.arc(head.x,head.y-2,o.hero?8:6.6,3.4,6.05);ctx.fill();
}
if(o.female){
ctx.fillStyle=o.hair||'#24180f';
ctx.fillRect(head.x-7.2,head.y-1,3.2,11);
ctx.fillRect(head.x+4,head.y-1,3.2,11);
}
if(role==='cop'){
ctx.fillStyle='#7c6a32';
ctx.fillRect(head.x-7,head.y-9,14,4);
ctx.fillStyle='#1e3a5f';
ctx.fillRect(head.x-8,head.y-6,16,3);
ctx.fillStyle='#e6c84a';
ctx.fillRect(head.x-1.5,head.y-8,3,2);
}
if(role==='usher'){
ctx.fillStyle='#111';
ctx.fillRect(head.x-8,head.y-8,16,3);
}
if(o.active){
ctx.strokeStyle='rgba(226,182,87,.95)';
ctx.lineWidth=2.4;
ctx.beginPath();ctx.ellipse(feet.x,feet.y+1,15,6.5,0.45,0,6.283185);ctx.stroke();
}
if(o.hero){
ctx.strokeStyle='rgba(255,255,255,.9)';
ctx.lineWidth=2;
ctx.beginPath();ctx.ellipse(feet.x,feet.y+1,16,7,0.45,0,6.283185);ctx.stroke();
}
if(o.name){
var lp=iso(x,y,tall+16);
ctx.font='bold 11px system-ui,sans-serif';
ctx.textAlign='center';
var tw=ctx.measureText(o.name).width;
ctx.fillStyle='rgba(16,18,14,.88)';
ctx.fillRect(lp.x-tw/2-7,lp.y-12,tw+14,16);
ctx.fillStyle='#f6edd6';
ctx.fillText(o.name,lp.x,lp.y);
}
ctx.restore();
}
function roundBody(x,y,w,h){
ctx.beginPath();
ctx.moveTo(x+3,y);
ctx.lineTo(x+w-3,y);
ctx.quadraticCurveTo(x+w,y,x+w,y+3);
ctx.lineTo(x+w,y+h-2);
ctx.lineTo(x,y+h-2);
ctx.lineTo(x,y+3);
ctx.quadraticCurveTo(x,y,x+3,y);
ctx.fill();
}
function drawIsoVehicle(c){
var p=carPos(c);
var x=p.x-p.w/2, y=p.y-p.h/2, w=p.w, h=p.h;
var body=c.kind==='auto'?'#f5c518':(c.kind==='bus'?'#1d4ed8':c.col);
var ht=c.kind==='bus'?22:(c.kind==='auto'?15:13);
var u;
ctx.save();
wheelAt(x+6,y+4);
wheelAt(x+w-8,y+4);
wheelAt(x+6,y+h-6);
wheelAt(x+w-8,y+h-6);
faces(x,y,w,h,4,ht,shade(body,0.08),shade(body,-0.22));
fillPoly(quad(x,y,w,h,ht),shade(body,0.18));
if(c.kind==='bus'){
winFace(x+2,y+h,x+w-4,y+h,4,10,'#f8fafc');
for(u=7;u<w-18;u+=12) winFace(x+u,y+h,x+u+8,y+h,ht-10,ht-2,'#bae6fd');
fillPoly(quad(x+3,y+2,w-6,h-4,ht),'#eff6ff');
winFace(x+w-4,y+2,x+w,y+h-2,6,ht-3,'#bae6fd');
}else if(c.kind==='auto'){
faces(x+2,y+2,w*0.62,h-4,ht,ht+8,'#d7eef8','#9ec5d6');
fillPoly(quad(x+2,y+2,w*0.62,h-4,ht+8),'#17803d');
winFace(x+w-2,y+2,x+w,y+h-2,5,ht-1,'#fff7d6');
}else{
faces(x+w*0.32,y+1.5,w*0.42,h-3,ht,ht+7,'#d7eef8','#8fb4c8');
fillPoly(quad(x+w*0.32,y+1.5,w*0.42,h-3,ht+7),'#e8f4fb');
winFace(x+w-1,y+2,x+w,y+h-2,4,ht-1,'#fff7d6');
winFace(x+2,y+h,x+7,y+h,5,8,'#fde68a');
}
ctx.restore();
}
function wheelAt(x,y){
var p=iso(x,y,3);
ctx.fillStyle='#111827';
ctx.beginPath();ctx.ellipse(p.x,p.y,4.6,2.5,0.45,0,6.283185);ctx.fill();
ctx.fillStyle='#9ca3af';
ctx.beginPath();ctx.ellipse(p.x,p.y,1.6,1,0.45,0,6.283185);ctx.fill();
}
function drawBlip(){
var step=currentStep(),b,d,pulse,p,q,lift;
if(!step) return;
b=poiById(step.poi);
if(!b) return;
d=doorOf(b);
pulse=0.55+Math.sin(Date.now()/220)*0.45;
lift=78+pulse*10;
p=iso(d.x,d.y,0);
q=iso(d.x,d.y,lift);
ctx.save();
ctx.strokeStyle='rgba(226,182,87,'+(0.35+pulse*0.45)+')';
ctx.lineWidth=3;
ctx.beginPath();
ctx.ellipse(p.x,p.y,18+pulse*8,8+pulse*3,0.5,0,6.283185);
ctx.stroke();
ctx.strokeStyle='rgba(226,182,87,.55)';
ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(p.x,p.y);
ctx.lineTo(q.x,q.y);
ctx.stroke();
ctx.fillStyle='#f7f1e4';
ctx.fillRect(q.x-9,q.y-18,18,22);
ctx.fillStyle='#7a1f1f';
ctx.fillRect(q.x-9,q.y-18,18,5);
ctx.fillRect(q.x-6,q.y-10,12,1.4);
ctx.fillRect(q.x-6,q.y-6,9,1.4);
ctx.fillRect(q.x-6,q.y-2,12,1.4);
ctx.restore();
}
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
function pushWall(b){
var step=34,x,y,w,h,seg;
if(b.w>=b.h){
for(x=b.x;x<b.x+b.w-1;x+=step){
w=Math.min(step,b.x+b.w-x);
seg={x:x,y:b.y,w:w,h:b.h,kind:'wall'};
(function(seg){pushDraw(seg.x+seg.w+seg.y+seg.h,function(){paintWall(seg);});})(seg);
}
}else{
for(y=b.y;y<b.y+b.h-1;y+=step){
h=Math.min(step,b.y+b.h-y);
seg={x:b.x,y:y,w:b.w,h:h,kind:'wall'};
(function(seg){pushDraw(seg.x+seg.w+seg.y+seg.h,function(){paintWall(seg);});})(seg);
}
}
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
function enqueueCast(){
var i,c,s,step,hot;
step=currentStep();
hot=step?step.poi:'';
for(i=0;i<CAST.length;i++){
c=CAST[i];
s=spotFor(c.poi);
if(!s) continue;
(function(c,s,hot,idx){
pushDraw(s.x+s.y,function(){
var showName=hot===c.poi;
if(Math.hypot(player.x-s.x,player.y-s.y)<260) showName=true;
drawPerson(s.x,s.y,{
bob:Date.now()/260+idx,role:c.role,suit:c.suit,skin:c.female?'#efc2b0':'#e0b090',hair:c.hair,
pants:c.pants,female:c.female?true:false,coat:c.coat?true:false,old:c.old?true:false,
hero:false,carry:false,name:showName?c.name:'',active:hot===c.poi
});
});
})(c,s,hot,i);
}
}
function enqueueWorld(){
var i,b,p,w,c;
for(i=0;i<solids.length;i++){
b=solids[i];
if(b.kind==='wall'){pushWall(b);continue;}
(function(b){pushDraw(b.x+b.w+b.y+b.h,function(){paintBuilding(b);});})(b);
}
for(i=0;i<props.length;i++){
p=props[i];
if(p.k==='tree') (function(p){pushDraw(p.x+p.y,function(){drawIsoTree(p.x,p.y,p.r);});})(p);
else if(p.k==='lamp') (function(p){pushDraw(p.x+p.y,function(){drawLamp(p.x,p.y);});})(p);
else if(p.k==='pillar') (function(p){pushDraw(p.x+p.y+8,function(){drawPillar(p.x,p.y);});})(p);
else if(p.k==='bench') (function(p){pushDraw(p.x+p.y,function(){drawBench(p.x,p.y);});})(p);
else if(p.k==='stall') pushDraw(1568+86+162+42,drawStall);
}
enqueueCast();

for(i=0;i<cars.length;i++){
c=cars[i];
p=carPos(c);
(function(c){pushDraw(p.x+p.y,function(){drawIsoVehicle(c);});})(c);
}
for(i=0;i<walkers.length;i++){
w=walkers[i];
(function(w){pushDraw(w.x+w.y,function(){
drawPerson(w.x,w.y,{
bob:w.bob,kind:w.kind,suit:w.kind==='law'?'#111':w.kind==='cop'?'#7c6a32':w.col,
skin:'#e0b090',hair:'#24180f',coat:w.kind==='law',female:false,hero:false,carry:false
});
});})(w);
}
}
function drawRadar(){
var s=132,x=VW-s-10,y=126,sx=s/WORLD_W,sy=s/WORLD_H,i,step,d,b;
ctx.save();
ctx.fillStyle='rgba(12,22,16,.82)';
ctx.fillRect(x-5,y-18,s+10,s+26);
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
ctx.fillRect(x+b.x*sx,y+b.y*sy,Math.max(2,b.w*sx),Math.max(2,b.h*sy));
}
ctx.fillStyle='#3aa0d8';
ctx.fillRect(x+park.x*sx,y+park.y*sy,park.w*sx,park.h*sy);
step=currentStep();
if(step){b=poiById(step.poi);if(b){d=doorOf(b);ctx.fillStyle='#e2b657';ctx.fillRect(x+d.x*sx-2,y+d.y*sy-2,5,5);}}
ctx.fillStyle='#ffffff';
ctx.beginPath();ctx.arc(x+player.x*sx,y+player.y*sy,3.2,0,6.283185);ctx.fill();
ctx.strokeStyle='#e2b657';
ctx.lineWidth=2;
ctx.strokeRect(x,y,s,s);
ctx.fillStyle='#e2b657';
ctx.font='10px system-ui,sans-serif';
ctx.textAlign='left';
ctx.fillText('DISTRICT',x,y-5);
ctx.restore();
}
function draw(){
var maxX,maxY,sx=0,sy=0,focus;
if(!cam.ready){
focus=iso(player.x,player.y,20);
cam.x=focus.x-VW/2;
cam.y=focus.y-VH*0.46;
cam.ready=1;
}
focus=iso(player.x,player.y,20);
maxX=BAKE_W-VW;
maxY=BAKE_H-VH;
if(maxX<0) maxX=0;
if(maxY<0) maxY=0;
if(shake>0){sx=(Math.random()-0.5)*shake;sy=(Math.random()-0.5)*shake;shake--;}
cam.x+=(focus.x-VW/2-cam.x)*0.14;
cam.y+=(focus.y-VH*0.46-cam.y)*0.14;
if(cam.x<0) cam.x=0;
if(cam.x>maxX) cam.x=maxX;
if(cam.y<0) cam.y=0;
if(cam.y>maxY) cam.y=maxY;
ctx.setTransform(DPR,0,0,DPR,0,0);
ctx.imageSmoothingEnabled=true;
ctx.clearRect(0,0,VW,VH);
ctx.fillStyle='#b9e2f6';
ctx.fillRect(0,0,VW,VH);
ctx.save();
ctx.translate(-cam.x+sx,-cam.y+sy);
if(cityCanvas) ctx.drawImage(cityCanvas,0,0);
enqueueWorld();
pushDraw(player.x+player.y+12,function(){
drawPerson(player.x,player.y,{
bob:player.bob,kind:'law',role:'senior',
suit:player.gender==='female'?'#7c243c':'#1d3f72',
skin:player.gender==='female'?'#efc2b0':'#e0b090',
hair:player.gender==='female'?'#2a1a16':'#161616',
pants:'#0f172a',
coat:state.done>=2,female:player.gender==='female',hero:true,carry:state.carry?true:false
});
});
flushDraw();
drawBlip();
ctx.restore();
var g=ctx.createRadialGradient(VW/2,VH*0.38,Math.min(VW,VH)*0.2,VW/2,VH*0.5,Math.max(VW,VH)*0.85);
g.addColorStop(0,'rgba(255,244,214,0)');
g.addColorStop(1,'rgba(70,110,140,.10)');
ctx.fillStyle=g;
ctx.fillRect(0,0,VW,VH);
drawRadar();
}

function frame(t){
var dt,dx,dy,sp,len;
if(!lastT) lastT=t||0;
dt=Math.min(0.05,((t||0)-lastT)/1000);
lastT=t||0;
if(playing){if(!modalOpen){
dx=0;dy=0;sp=3.15;
if(keys['w']||keys['arrowup']||hold.up) dy-=1;
if(keys['s']||keys['arrowdown']||hold.down) dy+=1;
if(keys['a']||keys['arrowleft']||hold.left) dx-=1;
if(keys['d']||keys['arrowright']||hold.right) dx+=1;
if(dx||dy){len=Math.hypot(dx,dy)||1;movePlayer(dx/len*sp,dy/len*sp);}
updateCars();
updateWalkers(dt);
canteenWatch();
tick(dt);
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
initWalkers();
initProps();
bakeCity();
resize();
frame(0);
globalThis.__AAG={blocked:blocked,doorOf:doorOf,solids:solids,roads:roads,park:park,WORLD_W:WORLD_W,WORLD_H:WORLD_H,MISSIONS:MISSIONS,player:player,redraw:draw,cam:cam,spotFor:spotFor};
})();

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
var RANKS=[{need:0,name:'Junior Advocate'},{need:2,name:'Associate'},{need:4,name:'Senior Associate'},{need:6,name:'Counsel'}];
var MISSIONS=[
{id:'brief',title:'The Night Call',steps:[
{poi:'office',near:'The family is at the firm',brief:'AAG Law, 3rd floor. Do not promise a result.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',ctype:'BAIL APPLICATION  -  PAPERS NOT READY',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-014',status:'Incomplete. No FIR in the file.',
client:'Ramesh Kumar, age 34, mechanic, Workshop Road',opp:'State',forum:'AAG Law Firm. Nothing filed.',
ps:'North Gate police station, as the family says. Not on paper.',next:'None. They want tonight.',
law:'Bail. Copy sections from the FIR only. Do not guess a section.',
papers:'1. Vakalatnama, signed this morning\n2. FIR copy  -  missing\n3. Custody note  -  missing\n4. Surety papers  -  missing',
facts:'Police picked him up last night from the workshop. The family is in the front room. They want you to say he will be out tonight.',
job:'Read what is actually in the file. Then choose what you tell them.',
caution:'A signed vakalatnama is not a bail order.'},
choices:[
{t:'A. Call it. Tell them bail will happen tonight.',ok:false,rep:-8,why:'STANDING -8. A vakalatnama is not a bail order. You just made a promise the file cannot keep.'},
{t:'B. Say you have no result until the FIR is in the file. List every missing paper.',ok:true,rep:8,got:'Client file',why:'File note: family told there is no result yet. Gap list started.'}
]},
{poi:'police',near:'FIR counter, not the lock-up gate',brief:'North Gate. Copy the FIR. Do not argue.',file:{
court:'IN THE COURT OF THE SESSIONS JUDGE',ctype:'BAIL  -  FIR STILL TO BE COPIED',
cause:'Ramesh Kumar\nversus\nState',no:'AAG-2026-014',status:'You are at the station. Sections are blank.',
client:'Ramesh Kumar, age 34, mechanic',opp:'State',forum:'Not filed.',
ps:'North Gate police station. Read the name on the FIR, do not trust the signboard only.',next:'None.',
law:'The charge is the FIR, not the family story.',
papers:'1. Vakalatnama\n2. Blank lines: FIR number, date, station, sections\n3. Verbal account from the constable  -  not a paper',
facts:'The constable says he will tell you the sections. He does not want to hand the FIR across.',
job:'Decide what you are willing to write down.',
caution:'If it is not on the paper, you do not have a section.'},
choices:[
{t:'A. Note the sections he recites. Do not waste time on a copy.',ok:false,rep:-8,why:'STANDING -8. A recited section is not the FIR. You may have written the wrong charge.'},
{t:'B. Insist on the FIR. Copy number, date, station, and sections from the page.',ok:true,rep:10,got:'FIR copy',why:'File note: FIR particulars copied from the paper, not from memory.'}
]},
{poi:'office',near:'Senior is back at the table',brief:'Back to AAG Law. Say the sections once. Stop.',file:{
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
{poi:'client',near:'Ramesh house, House Lane',brief:'House Lane. Write only what the uncle can show today.',file:{
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
{poi:'chamber',near:'Senior chambers, take the struck draft',brief:'Chambers. Leave the struck ground struck.',file:{
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
{poi:'filing',near:'Filing counter. Get a number or it is not filed.',brief:'Filing counter. Short stamp. No number, not filed.',file:{
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
{poi:'asha',near:'Asha house, House Lane',brief:'Meera Textiles. Read the dates. Do not invent one.',file:{
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
{poi:'office',near:'Draft at the firm, not in the corridor',brief:'AAG Law. Do not admit the full amount.',file:{
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
{poi:'registry',near:'Copying section. Seal and date, or leave it out.',brief:'Copying section. A photocopy is not a certified copy.',file:{
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
{poi:'registry',near:'Match the name before you run',brief:'Clock is running. Copying section first. Match the name.',file:{
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
{poi:'chamber',near:'Lock the list. Strike what you cannot prove.',brief:'Chambers. One line per event. No confession you cannot show.',file:{
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
{poi:'court',near:'Item 14. Not 12. Not 18.',brief:'District court steps. Item 14 is yours. The clock is the board.',file:{
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
{poi:'office',near:'Read the last page first',brief:'AAG Law. Last page of the order. Not the family version.',file:{
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
{poi:'police',near:'Is he in, and as on what time?',brief:'North Gate lock-up. Confirm custody before any new paper.',file:{
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
{poi:'chamber',near:'One sentence. Then cut it.',brief:'Chambers. If you need a second sentence, you are not ready.',file:{
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
{poi:'court',near:'Say the line. Then stop talking.',brief:'Board. One line. If you do not know, take instruction.',timed:true,seconds:150,file:{
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
{poi:'office',near:'Diary before you leave the building',brief:'Same day. The diary, not a chat.',file:{
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
function plate(text,x,y){
ctx.font='bold 12px system-ui,sans-serif';
var w=ctx.measureText(text).width+16;
ctx.fillStyle='#14345c';
ctx.fillRect(x,y,w,18);
ctx.strokeStyle='#f4f7fb';
ctx.lineWidth=1;
ctx.strokeRect(x+1,y+1,w-2,16);
ctx.fillStyle='#f4f7fb';
ctx.textAlign='left';
ctx.fillText(text,x+8,y+13);
}
function drawTree(x,y,r){
ctx.fillStyle='rgba(20,40,16,.25)';
ctx.beginPath();ctx.ellipse(x+4,y+r*0.45,r*0.9,r*0.4,0,0,6.28);ctx.fill();
ctx.fillStyle='#1d4f30';
ctx.beginPath();ctx.arc(x,y,r,0,6.28);ctx.fill();
ctx.fillStyle='#3c8f4e';
ctx.beginPath();ctx.arc(x-r*0.28,y-r*0.22,r*0.55,0,6.28);ctx.fill();
ctx.fillStyle='#5a3a22';
ctx.fillRect(x-2,y+r*0.2,4,r*0.55);
}
function drawGround(){
var x,y,n;
ctx.fillStyle='#6d7a48';
ctx.fillRect(0,0,WORLD_W,WORLD_H);
for(y=0;y<WORLD_H;y+=24){
for(x=0;x<WORLD_W;x+=24){
n=hash(x*0.13+y*1.7);
if(n>0.84) ctx.fillStyle='#8a7048';
else if(n>0.55) ctx.fillStyle='#617244';
else ctx.fillStyle='#7b8c52';
ctx.fillRect(x,y,24,24);
}
}
}
function drawYards(){
var i,y0;
for(i=0;i<yards.length;i++){
y0=yards[i];
if(y0.kind==='court') ctx.fillStyle='#7f9a58';
else if(y0.kind==='police') ctx.fillStyle='#c5c9bf';
else ctx.fillStyle='#d5d0c4';
ctx.fillRect(y0.x,y0.y,y0.w,y0.h);
ctx.strokeStyle='rgba(80,70,50,.35)';
ctx.lineWidth=2;
ctx.strokeRect(y0.x+3,y0.y+3,y0.w-6,y0.h-6);
}
ctx.fillStyle='#2f6b3c';
ctx.fillRect(park.x,park.y,park.w,park.h);
ctx.fillStyle='#e4d9c8';
ctx.fillRect(park.x+park.w/2-12,park.y+16,24,park.h-32);
ctx.fillRect(park.x+20,park.y+park.h/2-10,park.w-40,20);
ctx.fillStyle='#8eb4c6';
ctx.beginPath();ctx.arc(park.x+park.w/2,park.y+park.h/2,28,0,6.28);ctx.fill();
ctx.strokeStyle='#e7f3f8';ctx.lineWidth=3;
ctx.beginPath();ctx.arc(park.x+park.w/2,park.y+park.h/2,14,0,6.28);ctx.stroke();
ctx.fillStyle='#5c5648';
ctx.fillRect(park.x+16,park.y+16,132,20);
ctx.fillStyle='#f6edd6';
ctx.font='bold 13px system-ui,sans-serif';
ctx.textAlign='left';
ctx.fillText(park.name,park.x+24,park.y+31);
}
function drawRoads(){
var i,j,r,a,k,x,y;
ctx.fillStyle='#d2c8ba';
for(i=0;i<roads.length;i++){
r=roads[i];
ctx.fillRect(r.x-PAD,r.y-PAD,r.w+PAD*2,r.h+PAD*2);
}
ctx.strokeStyle='rgba(90,78,64,.25)';
ctx.lineWidth=1;
for(i=0;i<roads.length;i++){
r=roads[i];
if(r.w>r.h){
for(x=r.x;x<r.x+r.w;x+=34){
ctx.strokeRect(x,r.y-PAD+2,34,PAD-6);
ctx.strokeRect(x,r.y+r.h+4,34,PAD-8);
}
}else{
for(y=r.y;y<r.y+r.h;y+=34){
ctx.strokeRect(r.x-PAD+2,y,PAD-6,34);
ctx.strokeRect(r.x+r.w+4,y,PAD-8,34);
}
}
}
ctx.fillStyle='#8d867c';
for(i=0;i<roads.length;i++){
r=roads[i];
if(r.w>r.h){
ctx.fillRect(r.x,r.y-3,r.w,4);
ctx.fillRect(r.x,r.y+r.h-1,r.w,4);
}else{
ctx.fillRect(r.x-3,r.y,4,r.h);
ctx.fillRect(r.x+r.w-1,r.y,4,r.h);
}
}
ctx.fillStyle='#3e444c';
for(i=0;i<roads.length;i++){
r=roads[i];
ctx.fillRect(r.x,r.y,r.w,r.h);
}
ctx.fillStyle='rgba(255,255,255,.05)';
for(k=0;k<80;k++){
ctx.beginPath();
ctx.ellipse(hash(k*3)*WORLD_W,hash(k*9)*WORLD_H,26,8,hash(k),0,6.28);
ctx.fill();
}
ctx.strokeStyle='rgba(255,255,255,.55)';
ctx.lineWidth=1.5;
ctx.setLineDash([]);
for(i=0;i<roads.length;i++){
r=roads[i];
ctx.strokeRect(r.x+5,r.y+5,r.w-10,r.h-10);
}
ctx.strokeStyle='rgba(236,224,170,.9)';
ctx.lineWidth=2;
ctx.setLineDash([18,16]);
for(i=0;i<roads.length;i++){
r=roads[i];
ctx.beginPath();
if(r.w>r.h){ctx.moveTo(r.x,r.y+r.h/2);ctx.lineTo(r.x+r.w,r.y+r.h/2);}
else {ctx.moveTo(r.x+r.w/2,r.y);ctx.lineTo(r.x+r.w/2,r.y+r.h);}
ctx.stroke();
}
ctx.setLineDash([]);
ctx.fillStyle='#f4efe4';
for(i=0;i<roads.length;i++){
if(roads[i].w<roads[i].h) continue;
for(j=0;j<roads.length;j++){
if(roads[j].w>roads[j].h) continue;
for(k=0;k<5;k++){
ctx.fillRect(roads[j].x+14+k*16,roads[i].y-16,10,10);
ctx.fillRect(roads[j].x+14+k*16,roads[i].y+roads[i].h+6,10,10);
}
}
}
for(i=0;i<roads.length;i++){
r=roads[i];
if(r.w>r.h) plate(r.name,r.x+80,r.y+r.h+8);
}
ctx.save();
ctx.translate(roads[4].x-18,220);
ctx.rotate(-1.5708);
plate('COURT LANE',0,0);
ctx.restore();
ctx.save();
ctx.translate(roads[3].x+roads[3].w+18,260);
ctx.rotate(1.5708);
plate('STATION ROAD',0,0);
ctx.restore();
}
function drawGatePosts(x,y){
ctx.fillStyle='#5c5648';
ctx.fillRect(x-16,y,10,18);
ctx.fillRect(x+6,y,10,18);
ctx.fillStyle='#e6c84a';
ctx.fillRect(x-14,y+4,6,3);
ctx.fillRect(x+8,y+4,6,3);
}
function drawBuilding(b){
if(b.kind==='wall'){
ctx.fillStyle='#6b6458';
ctx.fillRect(b.x,b.y,b.w,b.h);
ctx.fillStyle='#8d8474';
ctx.fillRect(b.x,b.y,b.w,2);
return;
}
if(b.kind==='house'){drawHouse(b);return;}
if(b.kind==='court'){drawCourt(b);return;}
if(b.kind==='police'){drawPolice(b);return;}
if(b.kind==='lockup'){drawLockup(b);return;}
if(b.kind==='bank'){drawBank(b);return;}
if(b.kind==='tower'){drawTower(b);return;}
if(b.kind==='bar'){drawBar(b);return;}
if(b.kind==='hostel'){drawHostel(b);return;}
drawBlock(b,b.kind==='firm'?'#e7dcc6':b.kind==='chamber'?'#d5dbe2':'#e6d7a4',b.kind==='firm'?'#6d5642':b.kind==='chamber'?'#4e5964':'#8a6a2e');
if(b.kind==='firm'){
ctx.fillStyle='#7a1f1f';
ctx.fillRect(b.x+b.w/2-58,b.y+18,116,28);
ctx.fillStyle='#f8efe0';
ctx.font='bold 13px system-ui,sans-serif';
ctx.textAlign='center';
ctx.fillText('AAG LAW',b.x+b.w/2,b.y+30);
ctx.font='10px system-ui,sans-serif';
ctx.fillText('3RD FLOOR',b.x+b.w/2,b.y+42);
}
}
function plaque(b,y){
if(!b.name) return;
ctx.font='bold 11px system-ui,sans-serif';
ctx.textAlign='center';
var tw=ctx.measureText(b.name).width;
ctx.fillStyle='#1b140e';
ctx.fillRect(b.x+b.w/2-tw/2-8,y,tw+16,16);
ctx.fillStyle='#f6edd6';
ctx.fillText(b.name,b.x+b.w/2,y+12);
}
function drawBlock(b,wall,roof){
var x,lit;
ctx.fillStyle='rgba(40,30,16,.28)';
ctx.fillRect(b.x+8,b.y+10,b.w,b.h);
ctx.fillStyle='#9a917f';
ctx.fillRect(b.x-3,b.y-3,b.w+6,b.h+6);
ctx.fillStyle=wall;
ctx.fillRect(b.x,b.y,b.w,b.h-18);
ctx.fillStyle=roof;
ctx.fillRect(b.x+8,b.y+8,b.w-16,b.h-40);
ctx.strokeStyle='rgba(255,255,255,.25)';
ctx.lineWidth=1;
ctx.strokeRect(b.x+8,b.y+8,b.w-16,b.h-40);
ctx.fillStyle='#c5ced2';
ctx.fillRect(b.x+14,b.y+14,22,14);
for(x=b.x+16;x<b.x+b.w-18;x+=22){
lit=hash(x+b.y)>0.45;
ctx.fillStyle=lit?'#f6e2a8':'#241910';
ctx.fillRect(x,b.y+b.h-36,12,14);
}
ctx.fillStyle='#1a120c';
ctx.fillRect(b.x+b.w/2-8,b.y+b.h-16,16,16);
plaque(b,b.y+b.h-52);
}
function drawHouse(b){
var x;
ctx.fillStyle='rgba(40,30,16,.25)';
ctx.fillRect(b.x+6,b.y+8,b.w,b.h);
ctx.fillStyle='#6a6256';
ctx.fillRect(b.x-12,b.y-12,b.w+24,b.h+28);
ctx.fillStyle='#cbb892';
ctx.fillRect(b.x-6,b.y-6,b.w+12,b.h+16);
ctx.fillStyle='#3e7d46';
ctx.fillRect(b.x-4,b.y+b.h+2,b.w+8,10);
ctx.fillStyle='#ded4c4';
ctx.fillRect(b.x+b.w/2-14,b.y+b.h-2,28,24);
ctx.fillStyle=b.roof;
ctx.beginPath();
ctx.moveTo(b.x+2,b.y+b.h*0.46);
ctx.lineTo(b.x+b.w/2,b.y+6);
ctx.lineTo(b.x+b.w-2,b.y+b.h*0.46);
ctx.closePath();
ctx.fill();
ctx.fillStyle=b.roof2;
ctx.fillRect(b.x+6,b.y+b.h*0.46,b.w-12,b.h*0.32);
ctx.strokeStyle='rgba(255,236,210,.35)';
ctx.lineWidth=1;
var yy;
for(yy=b.y+b.h*0.46+4;yy<b.y+b.h*0.75;yy+=5){
ctx.beginPath();ctx.moveTo(b.x+8,yy);ctx.lineTo(b.x+b.w-8,yy);ctx.stroke();
}
ctx.strokeStyle='#f3e6d0';
ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(b.x+b.w/2,b.y+6);
ctx.lineTo(b.x+b.w/2,b.y+b.h*0.46);
ctx.stroke();
ctx.fillStyle='#cfd6da';
ctx.fillRect(b.x+b.w-28,b.y+16,18,12);
ctx.fillStyle='#9aa6ac';
ctx.fillRect(b.x+b.w-26,b.y+13,14,4);
ctx.fillStyle=b.wall;
ctx.fillRect(b.x+4,b.y+b.h*0.72,b.w-8,b.h*0.28-4);
for(x=b.x+14;x<b.x+b.w-16;x+=24){
ctx.fillStyle='#6b3e22';
ctx.fillRect(x-2,b.y+b.h-36,16,14);
ctx.fillStyle='#d7e7f2';
ctx.fillRect(x,b.y+b.h-34,12,10);
ctx.fillStyle='rgba(255,255,255,.4)';
ctx.fillRect(x,b.y+b.h-34,4,10);
}
ctx.fillStyle='#3a2418';
ctx.fillRect(b.x+b.w/2-8,b.y+b.h-22,16,18);
ctx.fillStyle='#e7c98a';
ctx.fillRect(b.x+b.w/2-6,b.y+b.h-16,5,8);
ctx.fillStyle='#cfc6b8';
ctx.fillRect(b.x+b.w/2-18,b.y+b.h-4,36,5);
plaque(b,b.y+b.h-48);
drawTree(b.x+16,b.y+18,8);
}
function drawCourt(b){
var c,cx=b.x+b.w/2;
ctx.fillStyle='rgba(40,30,16,.25)';
ctx.fillRect(b.x+8,b.y+12,b.w,b.h);
ctx.fillStyle='#d9c7a2';
ctx.fillRect(b.x-6,b.y-6,b.w+12,b.h+16);
ctx.fillStyle='#c4b18a';
ctx.fillRect(b.x,b.y,b.w,b.h);
ctx.fillStyle='#8d3a34';
ctx.fillRect(b.x+18,b.y+16,b.w-36,b.h-70);
ctx.fillStyle='#f4ead8';
ctx.beginPath();
ctx.moveTo(b.x+36,b.y+48);
ctx.lineTo(cx,b.y+12);
ctx.lineTo(b.x+b.w-36,b.y+48);
ctx.closePath();
ctx.fill();
ctx.fillStyle='#f7f1e6';
for(c=-4;c<=4;c++) ctx.fillRect(cx+c*22-4,b.y+52,8,b.h-90);
ctx.fillStyle='#6e2c2c';
ctx.fillRect(b.x,b.y+b.h-36,b.w,36);
ctx.fillStyle='#1a120c';
ctx.fillRect(cx-14,b.y+b.h-28,28,28);
ctx.fillStyle='#e7dfd2';
var s;for(s=0;s<4;s++) ctx.fillRect(cx-36-s*8,b.y+b.h-6+s*6,72+s*16,6);
ctx.strokeStyle='#5a4632';
ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(b.x+b.w-24,b.y+8);ctx.lineTo(b.x+b.w-24,b.y-22);ctx.stroke();
ctx.fillStyle='#e07a2f';ctx.fillRect(b.x+b.w-24,b.y-22,16,5);
ctx.fillStyle='#f8fafc';ctx.fillRect(b.x+b.w-24,b.y-17,16,5);
ctx.fillStyle='#138808';ctx.fillRect(b.x+b.w-24,b.y-12,16,5);
ctx.fillStyle='#1b140e';
ctx.fillRect(b.x+12,b.y+b.h+8,78,22);
ctx.fillStyle='#f6edd6';
ctx.font='bold 9px system-ui,sans-serif';
ctx.textAlign='left';
ctx.fillText('CAUSE LIST',b.x+18,b.y+b.h+22);
plaque(b,b.y+b.h-50);
}
function drawPolice(b){
drawBlock(b,'#d5dbe3','#243e66');
ctx.fillStyle='#1d4ed8';
ctx.beginPath();ctx.arc(b.x+24,b.y+24,9,0,6.28);ctx.fill();
ctx.fillStyle='#dbeafe';
ctx.beginPath();ctx.arc(b.x+24,b.y+24,4,0,6.28);ctx.fill();
ctx.fillStyle='#f8fafc';
ctx.fillRect(b.x+b.w-78,b.y+16,62,16);
ctx.fillStyle='#1e3a8a';
ctx.font='bold 11px system-ui,sans-serif';
ctx.textAlign='center';
ctx.fillText('P.S.',b.x+b.w-47,b.y+28);
}
function drawLockup(b){
ctx.fillStyle='#4b5563';
ctx.fillRect(b.x,b.y,b.w,b.h);
var x;
ctx.strokeStyle='#111';
ctx.lineWidth=3;
for(x=b.x+8;x<b.x+b.w-6;x+=10){
ctx.beginPath();ctx.moveTo(x,b.y+8);ctx.lineTo(x,b.y+b.h-8);ctx.stroke();
}
plaque(b,b.y+8);
}
function drawBank(b){
drawBlock(b,'#d5ddd8','#1f4d4a');
ctx.fillStyle='#0f766e';
ctx.fillRect(b.x+12,b.y+b.h-48,40,26);
ctx.fillStyle='#99f6e4';
ctx.fillRect(b.x+16,b.y+b.h-44,32,12);
ctx.fillStyle='#042f2e';
ctx.font='bold 10px system-ui,sans-serif';
ctx.textAlign='left';
ctx.fillText('ATM',b.x+22,b.y+b.h-26);
}
function drawTower(b){
ctx.fillStyle='#c4b497';
ctx.fillRect(b.x,b.y+16,b.w,b.h-16);
ctx.fillStyle='#8d3a34';
ctx.beginPath();
ctx.moveTo(b.x-4,b.y+20);
ctx.lineTo(b.x+b.w/2,b.y);
ctx.lineTo(b.x+b.w+4,b.y+20);
ctx.closePath();
ctx.fill();
ctx.fillStyle='#f8fafc';
ctx.beginPath();ctx.arc(b.x+b.w/2,b.y+40,12,0,6.28);ctx.fill();
ctx.strokeStyle='#1f2937';
ctx.lineWidth=1;
ctx.beginPath();ctx.arc(b.x+b.w/2,b.y+40,12,0,6.28);ctx.stroke();
ctx.beginPath();ctx.moveTo(b.x+b.w/2,b.y+40);ctx.lineTo(b.x+b.w/2,b.y+32);ctx.stroke();
}
function drawBar(b){
drawBlock(b,'#e4d2b8','#5c2a2a');
ctx.fillStyle='#7f1d1d';
ctx.fillRect(b.x+8,b.y+8,b.w-16,12);
ctx.fillStyle='#fecaca';
ctx.font='bold 10px system-ui,sans-serif';
ctx.textAlign='center';
ctx.fillText('CANTEEN',b.x+b.w/2,b.y+17);
}
function drawHostel(b){
drawBlock(b,'#e7dcc4','#6b5344');
var y;
ctx.strokeStyle='rgba(60,40,20,.35)';
for(y=b.y+28;y<b.y+b.h-30;y+=16){
ctx.beginPath();ctx.moveTo(b.x+6,y);ctx.lineTo(b.x+b.w-6,y);ctx.stroke();
}
}
function drawProps(){
drawTree(park.x+50,park.y+70,16);
drawTree(park.x+120,park.y+200,18);
drawTree(park.x+240,park.y+80,15);
drawTree(park.x+280,park.y+210,17);
drawTree(park.x+70,park.y+250,14);
var campus=yards[0];
drawGatePosts(campus.x+campus.w/2,campus.wallY-4);
drawGatePosts(yards[1].x+yards[1].w/2,yards[1].wallY-4);
ctx.fillStyle='#6b3e22';
ctx.fillRect(1588,168,70,36);
ctx.fillStyle='#f3e6c8';
ctx.fillRect(1576,198,92,8);
ctx.fillStyle='#7f1d1d';
ctx.font='bold 11px system-ui,sans-serif';
ctx.textAlign='left';
ctx.fillText('TEA',1608,190);
var i,x;
ctx.fillStyle='#c2410c';
for(i=0;i<6;i++){
x=220+i*70;
ctx.fillRect(x,1004,14,8);
}
}
function bakeCity(){
cityCanvas=document.createElement('canvas');
cityCanvas.width=WORLD_W;
cityCanvas.height=WORLD_H;
var live=ctx,i;
ctx=cityCanvas.getContext('2d');
drawGround();
drawYards();
drawRoads();
for(i=0;i<solids.length;i++) drawBuilding(solids[i]);
drawProps();
ctx=live;
}
function drawWalker(w){
var x=w.x,y=w.y;
ctx.fillStyle='rgba(0,0,0,.22)';
ctx.beginPath();ctx.ellipse(x,y+8,6,2.2,0,0,6.28);ctx.fill();
ctx.fillStyle=w.kind==='law'?'#111':w.kind==='cop'?'#7c6a32':w.col;
ctx.fillRect(x-4,y-2,8,10);
if(w.kind==='law'){ctx.fillStyle='#f8fafc';ctx.fillRect(x-1,y-1,2,6);}
ctx.fillStyle='#e0b090';
ctx.beginPath();ctx.arc(x,y-6,3.2,0,6.28);ctx.fill();
}
function drawBlip(){
var step=currentStep(),b,d,pulse;
if(!step) return;
b=poiById(step.poi);if(!b) return;
d=doorOf(b);
pulse=0.55+Math.sin(Date.now()/220)*0.45;
ctx.save();
ctx.translate(d.x,d.y-36);
ctx.fillStyle='#f7f1e4';
ctx.fillRect(-8,-2,16,20);
ctx.fillStyle='#7a1f1f';
ctx.fillRect(-8,-2,16,5);
ctx.fillRect(-5,6,10,1);ctx.fillRect(-5,9,8,1);ctx.fillRect(-5,12,10,1);
ctx.restore();
ctx.strokeStyle='rgba(226,182,87,'+pulse+')';
ctx.lineWidth=2;
ctx.beginPath();ctx.arc(d.x,d.y,16+pulse*7,0,6.28);ctx.stroke();
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
ctx.beginPath();ctx.ellipse(2,7,p.w*0.3,5,0,0,6.28);ctx.fill();
if(c.kind==='auto'){
ctx.fillStyle='#e6b325';ctx.fillRect(-14,-8,28,16);
ctx.fillStyle='#17803d';ctx.fillRect(-14,-8,28,4);
ctx.fillStyle='#d7eef8';ctx.fillRect(-7,-3,12,7);
}else if(c.kind==='bus'){
ctx.fillStyle=c.col;ctx.fillRect(-40,-12,80,24);
ctx.fillStyle='#7dd3fc';
for(wx=-28;wx<=18;wx+=16) ctx.fillRect(wx,-9,11,7);
ctx.fillStyle='#111';ctx.fillRect(30,-5,8,10);
}else{
ctx.fillStyle=c.col;ctx.fillRect(-23,-9,46,18);
ctx.fillStyle='#b9d7ea';ctx.fillRect(-4,-7,16,14);
ctx.fillStyle='#0f172a';
ctx.fillRect(-16,-11,8,3);ctx.fillRect(10,-11,8,3);
ctx.fillRect(-16,8,8,3);ctx.fillRect(10,8,8,3);
ctx.fillStyle='#f8fafc';ctx.fillRect(20,-5,3,4);
}
ctx.restore();
}
}
function drawPlayer(){
var x=player.x,y=player.y,swing=Math.sin(player.bob*0.45)*3;
var suit,skin,hair,coat;
suit=player.gender==='female'?'#7c243c':'#1d3f72';
skin=player.gender==='female'?'#efc2b0':'#e0b090';
hair=player.gender==='female'?'#2a1a16':'#161616';
coat=state.done>=2;
ctx.fillStyle='rgba(0,0,0,.28)';
ctx.beginPath();ctx.ellipse(x+2,y+14,12,5,0,0,6.28);ctx.fill();
ctx.fillStyle='#1c1917';
ctx.fillRect(x-6,y+2,5,9);
ctx.fillRect(x+1,y+2,5,9);
ctx.fillStyle=coat?'#111':suit;
ctx.fillRect(x-8,y-8,16,13);
if(!coat){ctx.fillStyle='#f8fafc';ctx.fillRect(x-2,y-7,4,8);}
else {ctx.fillStyle='#f8fafc';ctx.fillRect(x-1,y-7,2,8);}
ctx.fillStyle=skin;
ctx.fillRect(x-12,y-6,4,8+swing);
ctx.fillRect(x+8,y-6,4,8-swing);
ctx.beginPath();ctx.arc(x,y-13,6.2,0,6.28);ctx.fill();
ctx.fillStyle=hair;
ctx.beginPath();ctx.arc(x,y-15,6.2,3.15,0);ctx.fill();
if(player.gender==='female'){ctx.fillRect(x-6,y-13,3,8);ctx.fillRect(x+3,y-13,3,8);}
if(state.carry){
ctx.fillStyle='#f7f1e4';ctx.fillRect(x+10,y-6,8,10);
ctx.fillStyle='#7a1f1f';ctx.fillRect(x+10,y-6,8,3);
}
}
function drawRadar(){
var s=112,x=VW-s-8,y=118,sx=s/WORLD_W,sy=s/WORLD_H,i,step,d,b;
ctx.fillStyle='rgba(12,18,12,.8)';
ctx.fillRect(x-4,y-16,s+8,s+22);
ctx.fillStyle='#6d7a48';
ctx.fillRect(x,y,s,s);
ctx.fillStyle='#3e444c';
for(i=0;i<roads.length;i++){
b=roads[i];
ctx.fillRect(x+b.x*sx,y+b.y*sy,Math.max(1,b.w*sx),Math.max(1,b.h*sy));
}
ctx.fillStyle='#6b5344';
for(i=0;i<solids.length;i++){
b=solids[i];
if(b.kind==='wall') continue;
ctx.fillRect(x+b.x*sx,y+b.y*sy,Math.max(2,b.w*sx),Math.max(2,b.h*sy));
}
step=currentStep();
if(step){b=poiById(step.poi);if(b){d=doorOf(b);ctx.fillStyle='#e2b657';ctx.fillRect(x+d.x*sx-2,y+d.y*sy-2,5,5);}}
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
var maxX=WORLD_W-VW,maxY=WORLD_H-VH,sx=0,sy=0,i,g;
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
for(i=0;i<walkers.length;i++) drawWalker(walkers[i]);
drawBlip();
drawPlayer();
ctx.restore();
g=ctx.createRadialGradient(VW/2,VH*0.42,Math.min(VW,VH)*0.2,VW/2,VH*0.5,Math.max(VW,VH)*0.78);
g.addColorStop(0,'rgba(255,214,160,0)');
g.addColorStop(1,'rgba(20,16,8,.2)');
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
bakeCity();
resize();
frame(0);
globalThis.__AAG={blocked:blocked,doorOf:doorOf,solids:solids,roads:roads,park:park,WORLD_W:WORLD_W,WORLD_H:WORLD_H};
})();

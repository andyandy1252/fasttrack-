import{useState,useRef,useEffect}from"react";
import{QRCodeCanvas}from"qrcode.react";
import{supabase}from"./supabaseClient";
const B="#D97757",BH="#C4622A",BL="var(--BL)",BR="var(--BR)",PU="#5b21b6",PUH="#4c1d95",PUL="var(--PUL)",PUB="#c4b5fd",G="#00875a",GL="var(--GL)",GBR="#57d9a3",W="var(--W)",GR="var(--GR)",BD="var(--BD)",T="var(--T)",TM="var(--TM)",TL="var(--TL)";
const TY=new Date().getFullYear();
const GY=Array.from({length:8},(_,i)=>`${TY+i}`);
const SP={Basketball:["Point Guard","Shooting Guard","Small Forward","Power Forward","Center"],Football:["Quarterback","Running Back","Fullback","Wide Receiver","Tight End","Offensive Lineman","Defensive End","Linebacker","Cornerback","Safety","Kicker","Punter"],Soccer:["Goalkeeper (GK)","Right Back (RB)","Left Back (LB)","Center Back (CB)","Sweeper (SW)","Defensive Mid (CDM)","Central Mid (CM)","Attacking Mid (CAM)","Right Winger (RW)","Left Winger (LW)","Second Striker (SS)","Striker (ST)","Center Forward (CF)"],Wrestling:["125 lbs","133 lbs","141 lbs","149 lbs","157 lbs","165 lbs","174 lbs","184 lbs","197 lbs","285 lbs"],Lacrosse:["Attack","Midfield","Defense","Goalkeeper"]};
const SCHS=[
  {id:1,name:"Ohio State",state:"OH",div:"D1",conf:"Big Ten",coach:"Chris Holtmann",email:"holtmann@osu.edu",enroll:"61,391",founded:1870,colors:"Scarlet & Gray",camps:[{id:101,title:"Buckeyes Elite Guard Camp",date:"Jun 14–15, 2026",cost:"$175",spots:12,total:30,loc:"Value City Arena, Columbus OH",desc:"Two-day guard camp. Individual workouts and 5-on-5. Film every session.",video:true}]},
  {id:2,name:"Fordham",state:"NY",div:"D1",conf:"Atlantic 10",coach:"Kyle Neptune",email:"neptune@fordham.edu",enroll:"16,000",founded:1841,colors:"Maroon & White",camps:[{id:102,title:"Atlantic 10 Skills Showcase",date:"Jun 21, 2026",cost:"$125",spots:8,total:24,loc:"Rose Hill Gymnasium, Bronx NY",desc:"One-day showcase. Individual feedback from the full coaching staff.",video:true}]},
  {id:3,name:"Louisville",state:"KY",div:"D1",conf:"ACC",coach:"Pat Kelsey",email:"kelsey@louisville.edu",enroll:"22,600",founded:1798,colors:"Red & Black",camps:[]},
  {id:4,name:"Villanova",state:"PA",div:"D1",conf:"Big East",coach:"Kyle Neptune",email:"neptune@villanova.edu",enroll:"10,800",founded:1842,colors:"Blue & White",camps:[]},
  {id:5,name:"Hofstra",state:"NY",div:"D1",conf:"CAA",coach:"Speedy Claxton",email:"claxton@hofstra.edu",enroll:"11,000",founded:1935,colors:"Blue & Gold",camps:[{id:103,title:"Pride Guard Development Camp",date:"Jul 19, 2026",cost:"$95",spots:20,total:32,loc:"Mack Sports Complex, Hempstead NY",desc:"Guard camp — speed, shooting, defense.",video:true}]},
  {id:6,name:"Bryant University",state:"RI",div:"D1",conf:"America East",coach:"Jared Grasso",email:"grasso@bryant.edu",enroll:"3,700",founded:1863,colors:"Black & Gold",camps:[{id:104,title:"Bulldogs All-Skills Camp",date:"Aug 2, 2026",cost:"$85",spots:25,total:40,loc:"Chace Athletic Center, Smithfield RI",desc:"Open to all positions. Written scouting report for every athlete.",video:false}]},
  {id:7,name:"Quinnipiac",state:"CT",div:"D1",conf:"MAAC",coach:"Baker Dunleavy",email:"dunleavy@qu.edu",enroll:"9,700",founded:1929,colors:"Blue & Gold",camps:[]},
  {id:8,name:"Maryland",state:"MD",div:"D1",conf:"Big Ten",coach:"Kevin Willard",email:"willard@maryland.edu",enroll:"40,700",founded:1856,colors:"Red & Gold",camps:[{id:105,title:"Terps Big Man Academy",date:"Jul 8–10, 2026",cost:"$225",spots:5,total:20,loc:"Xfinity Center, College Park MD",desc:"Elite big man camp. Coach Willard runs all sessions. Limited to 20.",video:true}]},
  {id:9,name:"St. John's",state:"NY",div:"D1",conf:"Big East",coach:"Rick Pitino",email:"pitino@stjohns.edu",enroll:"21,000",founded:1870,colors:"Red & White",camps:[{id:106,title:"Big East PG Summit",date:"Jun 28, 2026",cost:"$150",spots:18,total:28,loc:"Carnesecca Arena, Queens NY",desc:"Annual PG summit by Coach Pitino. Personal eval guaranteed.",video:true}]},
  {id:10,name:"Penn State",state:"PA",div:"D1",conf:"Big Ten",coach:"Mike Rhoades",email:"rhoades@psu.edu",enroll:"90,000",founded:1855,colors:"Blue & White",camps:[]},
  {id:11,name:"Cornell",state:"NY",div:"D1",conf:"Ivy League",coach:"Brian Earl",email:"earl@cornell.edu",enroll:"15,500",founded:1865,colors:"Carnelian & White",camps:[]},
  {id:12,name:"Xavier",state:"OH",div:"D1",conf:"Big East",coach:"Sean Miller",email:"miller@xavier.edu",enroll:"7,200",founded:1831,colors:"Blue & White",camps:[]},
];
const STG=[{id:"interested",label:"Saved",c:"#475569"},{id:"emailed",label:"Emailed",c:"#2563eb"},{id:"viewed",label:"Viewed",c:"#7c3aed"},{id:"replied",label:"Replied",c:"#0284c7"},{id:"camped",label:"Camp",c:"#db2777"},{id:"offer",label:"Offer",c:"#059669"},{id:"committed",label:"Committed",c:"#f59e0b",gold:true}];
const CONF_NORMALIZE={"Atlantic Coast Conference":"ACC","Big Ten Conference":"Big Ten","Big 12 Conference":"Big 12","BIG EAST Conference":"Big East","Big East Conference":"Big East","Big West Conference":"Big West","Big Sky Conference":"Big Sky","Big South Conference":"Big South","Southeastern Conference":"SEC","American Conference":"AAC","American Athletic":"AAC","Sun Belt Conference":"Sun Belt","Mid-American Conference":"MAC","Mountain West Conference":"Mountain West","West Coast Conference":"WCC","Atlantic Sun Conference":"ASUN","Atlantic 10 Conference":"Atlantic 10","The Summit League":"Summit League","Summit":"Summit League","Missouri Valley Conference":"Missouri Valley","Horizon League":"Horizon","Northeast Conference":"NEC","Patriot":"Patriot League","Southland Conference":"Southland","Coastal Athletic Association":"CAA","Metro Atlantic Athletic Conference":"MAAC","The Ivy League":"Ivy League","America East Conference":"America East","Southwestern Athletic Conf.":"SWAC","Conference USA":"CUSA","Southern Conference":"SoCon","Ohio Valley Conference":"Ohio Valley","Western Athletic Conference":"WAC","Pac-12 Conference":"Pac-12","Pennsylvania State Athletic Conference":"PSAC","Great Lakes Valley Conference":"GLVC","Lone Star Conference":"Lone Star","Lone Star Conference (possibly)":"Lone Star","Northern Sun Intercollegiate Conference":"NSIC","Rocky Mountain Athletic Conference":"RMAC","California Collegiate Athletic Association":"CCAA","Pacific West Conference":"PacWest","Central Atlantic Collegiate Conference":"CACC","South Atlantic Conference":"SAC","Great Lakes Intercollegiate Athletic Conference":"GLIAC","Gulf South Conference":"Gulf South","Mountain East Conference":"Mountain East","Sunshine State Conference":"SSC","Great Midwest Athletic Conference":"GMAC","Great American Conference":"GAC","East Coast Conference":"ECC","Northeast 10 Conference":"NE10","Mid-America Intercollegiate Athletics Association":"MIAA","Great Northwest Athletic Conference":"GNAC","Peach Belt Conference":"Peach Belt","{{sortname|Conference|Carolinas}}":"Conference Carolinas"};
const normConf=c=>CONF_NORMALIZE[c]||c;
const CLIPS=[{id:1,title:"Game-Winner vs Lincoln HS",type:"Scoring",dur:"0:12",views:34},{id:2,title:"Full-Court Assist",type:"Passing",dur:"0:08",views:21},{id:3,title:"Defensive Stop, 4th Qtr",type:"Defense",dur:"0:15",views:18},{id:4,title:"Three-Point Streak (3/3)",type:"Scoring",dur:"0:22",views:45},{id:5,title:"Off-Ball Screen Read",type:"IQ",dur:"0:10",views:12}];
const ADB=[
  {id:1,first:"Marcus",last:"Johnson",positions:["Point Guard"],gradYear:"2027",school:"Lincoln HS",state:"NY",height:'6\'2"',weight:"185",gpa:"3.4",div:"D1",verified:true,views:52},
  {id:2,first:"Darius",last:"Cole",positions:["Shooting Guard"],gradYear:"2027",school:"Oak Hill Academy",state:"VA",height:'6\'4"',weight:"195",gpa:"3.1",div:"D1",verified:true,views:38},
  {id:3,first:"Jordan",last:"Smith",positions:["Power Forward","Center"],gradYear:"2026",school:"St. Anthony HS",state:"NJ",height:'6\'8"',weight:"230",gpa:"3.6",div:"D1",verified:true,views:29},
  {id:4,first:"Tyler",last:"Brooks",positions:["Center"],gradYear:"2028",school:"Montverde Academy",state:"FL",height:'6\'11"',weight:"245",gpa:"3.0",div:"D1",verified:true,views:44},
  {id:5,first:"Amir",last:"Wallace",positions:["Small Forward"],gradYear:"2027",school:"Don Bosco Prep",state:"NJ",height:'6\'6"',weight:"210",gpa:"3.3",div:"D1",verified:false,views:21},
  {id:6,first:"Caleb",last:"Rivers",positions:["Point Guard"],gradYear:"2026",school:"Rice HS",state:"NY",height:'6\'1"',weight:"175",gpa:"3.7",div:"D1",verified:true,views:61},
  {id:7,first:"Devon",last:"Mitchell",positions:["Shooting Guard","Small Forward"],gradYear:"2027",school:"Archbishop Stepinac",state:"NY",height:'6\'5"',weight:"200",gpa:"3.2",div:"D2",verified:true,views:17},
  {id:8,first:"Isaiah",last:"Torres",positions:["Power Forward"],gradYear:"2026",school:"Paul VI HS",state:"VA",height:'6\'7"',weight:"220",gpa:"3.5",div:"D1",verified:true,views:33},
];
// Metrics are sport-specific. Each metric: key, label, value, unit, percentile,
// source (combine|coach|video|wearable|self), sourceLabel, date, lower (bool — lower=better), status (verified|unverified)
// Universal base metrics every athlete has regardless of sport
// Sport-specific metrics are a small additional set
// Athletes can also add unlimited custom metrics
const BASE_METRICS=[
  {cat:"Physical", key:"height",  label:"Height",        value:"", unit:"",          hint:"e.g. 5ft 10in"},
  {cat:"Physical", key:"weight",  label:"Weight",        value:"", unit:"lbs",       hint:"e.g. 170"},
  {cat:"Physical", key:"wing",    label:"Wingspan",      value:"", unit:"",          hint:"e.g. 6ft 1in"},
  {cat:"Speed",    key:"40yd",    label:"40-Yard Dash",  value:"", unit:"sec",       hint:"e.g. 4.58"},
  {cat:"Jump",     key:"vert",    label:"Vertical Jump", value:"", unit:"in",        hint:"e.g. 32"},
  {cat:"Strength", key:"bench",   label:"Bench Press",   value:"", unit:"lbs",       hint:"e.g. 185"},
];
const SPORT_EXTRA={
  Basketball:[
    {cat:"Sport", key:"lane",   label:"Lane Agility",     value:"", unit:"sec",       hint:"e.g. 10.4"},
    {cat:"Sport", key:"reach",  label:"Standing Reach",   value:"", unit:"",          hint:"e.g. 8ft 4in"},
    {cat:"Sport", key:"sprint", label:"3/4 Court Sprint", value:"", unit:"sec",       hint:"e.g. 3.22"},
  ],
  Football:[
    {cat:"Sport", key:"10yd",  label:"10-Yard Split",     value:"", unit:"sec",       hint:"e.g. 1.52"},
    {cat:"Sport", key:"broad", label:"Broad Jump",        value:"", unit:"",          hint:"e.g. 10ft 2in"},
    {cat:"Sport", key:"reps",  label:"225 lbs Reps",      value:"", unit:"reps",      hint:"e.g. 22"},
  ],
  Soccer:[
    {cat:"Sport", key:"sprint", label:"Max Sprint Speed", value:"", unit:"mph",       hint:"e.g. 21.4"},
    {cat:"Sport", key:"vo2",    label:"VO2 Max",          value:"", unit:"ml/kg/min", hint:"e.g. 58"},
  ],
  Wrestling:[
    {cat:"Sport", key:"squat", label:"Back Squat",        value:"", unit:"lbs",       hint:"e.g. 315"},
    {cat:"Sport", key:"dead",  label:"Deadlift",          value:"", unit:"lbs",       hint:"e.g. 365"},
    {cat:"Sport", key:"20yd",  label:"20-Yard Dash",      value:"", unit:"sec",       hint:"e.g. 2.72"},
  ],
  Lacrosse:[
    {cat:"Sport", key:"shuttle", label:"5-10-5 Shuttle",  value:"", unit:"sec",       hint:"e.g. 4.22"},
    {cat:"Sport", key:"sprint",  label:"Max Sprint Speed",value:"", unit:"mph",       hint:"e.g. 19.8"},
  ],
};
// Grid pins — what shows in the 3x2 highlight grid per sport
const SPORT_PINNED={
  Basketball:["40yd","vert","bench","lane","reach","sprint"],
  Football:["40yd","vert","bench","10yd","broad","reps"],
  Soccer:["40yd","vert","bench","sprint","vo2","wing"],
  Wrestling:["40yd","vert","bench","squat","dead","20yd"],
  Lacrosse:["40yd","vert","bench","shuttle","sprint","wing"],
};
// No verification — metrics are self-reported
const METRICS=null;
const CST=[{id:"identified",label:"Identified",c:"#475569"},{id:"contacted",label:"Contacted",c:"#2563eb"},{id:"called",label:"Called",c:"#7c3aed"},{id:"visited",label:"Visited",c:"#db2777"},{id:"offered",label:"Offered",c:"#f59e0b"},{id:"committed",label:"Committed",c:"#059669"}];
const SA=[
  {id:1,schoolId:2,cName:"Kyle Neptune",school:"Fordham",cEmail:"neptune@fordham.edu",unread:1,
   viewed:{at:"Mar 10, 2:28 PM",label:"2 days ago"},
   msgs:[
    {id:1,from:"athlete",text:"Coach Neptune — Andrew Johnson, CB Class of 2027, Lincoln HS NY. Very interested in Fordham.",time:"Mar 10, 9:14 AM"},
    {id:2,from:"coach",text:"Andrew, reviewed your tape — impressive. Available for a call this week?",time:"Mar 10, 2:31 PM"},
    {id:3,from:"athlete",text:"Absolutely — Thursday after 4pm or anytime Friday.",time:"Mar 10, 3:48 PM"},
    {id:4,from:"coach",text:"Let's do Thursday at 5pm. Sending a calendar invite.",time:"Mar 11, 10:02 AM",unread:true}
  ]},
  {id:2,schoolId:9,cName:"Rick Pitino",school:"St. John's",cEmail:"pitino@stjohns.edu",unread:2,
   viewed:{at:"Mar 6, 3:12 PM",label:"4 days ago"},
   msgs:[
    {id:1,from:"athlete",text:"Coach Pitino — Andrew Johnson, Class of 2027, CB, Lincoln HS NY.",time:"Mar 5, 10:00 AM"},
    {id:2,from:"coach",text:"Your tape shows real positioning IQ. Will you be at the Showcase next weekend?",time:"Mar 6, 3:15 PM",unread:true},
    {id:3,from:"coach",text:"Formal invite to our Big East Showcase, June 28.",time:"Mar 6, 3:17 PM",unread:true}
  ]},
];
const SC=[{id:1,athId:1,athName:"Marcus Johnson",school:"Lincoln HS",athEmail:"marcus@email.com",unread:1,msgs:[{id:1,from:"athlete",text:"Coach — Marcus Johnson, PG Class of 2027, Lincoln HS NY. Fordham is high on my list.",time:"Mar 10, 9:14 AM"},{id:2,from:"coach",text:"Marcus, reviewed your tape. Available for a call this week?",time:"Mar 10, 2:31 PM"},{id:3,from:"athlete",text:"Following up — still very interested.",time:"Mar 12, 10:15 AM",unread:true}]},{id:2,athId:4,athName:"Tyler Brooks",school:"Montverde Academy",athEmail:"tyler@email.com",unread:2,msgs:[{id:1,from:"athlete",text:"Coach — Tyler Brooks, 6'11\" Center, Class of 2028, Montverde. Your program is at the top of my list.",time:"Mar 5, 10:00 AM"},{id:2,from:"athlete",text:"I'll be at the National Showcase in Atlanta next weekend.",time:"Mar 5, 10:01 AM",unread:true},{id:3,from:"athlete",text:"Film: fasttrack.app/tyler-brooks-2028",time:"Mar 5, 10:02 AM",unread:true}]}];
const SCAMPS=[{id:1,title:"Elite Guard Camp",date:"Jun 21, 2026",loc:"Rose Hill Gym, Bronx NY",cost:"$125",total:24,spots:13,sport:"Basketball",desc:"Two-day intensive guard camp. Individual skill sessions, film review, 5-on-5.",video:true,reqs:[{athId:1,name:"Marcus Johnson",status:"pending"},{athId:6,name:"Caleb Rivers",status:"accepted"},{athId:7,name:"Devon Mitchell",status:"pending"}]},{id:2,title:"Big Man Development Clinic",date:"Jul 19, 2026",loc:"Rose Hill Gym, Bronx NY",cost:"$95",total:16,spots:8,sport:"Basketball",desc:"One-day clinic on post skills, shot blocking, and rebounding. Written evaluation for every athlete.",video:false,reqs:[{athId:3,name:"Jordan Smith",status:"accepted"},{athId:4,name:"Tyler Brooks",status:"pending"}]}];

// Demo data for quick jump
const FILM_POSTS=[
  {id:1,title:"Game-Winner vs Lincoln HS",desc:"Buzzer beater off the dribble — Atlantic Conference Championship game.",type:"Highlight",date:"Mar 14, 2026",views:247,likes:38,duration:"0:12",thumb:"#1e3a5f",featured:true},
  {id:2,title:"24 Pts — Oak Hill Tournament",desc:"Full offensive showcase. Pull-up mid-range, three off the catch, and-one finish.",type:"Game Clip",date:"Mar 8, 2026",views:189,likes:29,duration:"2:14",thumb:"#C4622A",featured:false},
  {id:3,title:"Defensive Masterclass",desc:"4 steals, 2 blocks in the second half. Press break reads and help-side defense.",type:"Defense",date:"Feb 28, 2026",views:134,likes:21,duration:"1:38",thumb:"#1e3a8a",featured:false},
  {id:4,title:"Full Highlight Tape 2026",desc:"Official recruiting tape — best plays from the 2025-26 season.",type:"Tape",date:"Feb 15, 2026",views:412,likes:64,duration:"4:22",thumb:"#172554",featured:false},
  {id:5,title:"Three-Point Clinic",desc:"9/12 from three in back-to-back games. Range and shot mechanics.",type:"Scoring",date:"Feb 10, 2026",views:98,likes:17,duration:"0:55",thumb:"#1d4ed8",featured:false},
  {id:6,title:"Court Vision — Assist Reel",desc:"12 assists, 1 turnover — best passing sequences of the season.",type:"Passing",date:"Jan 30, 2026",views:156,likes:24,duration:"1:20",thumb:"#2563eb",featured:false},
];

const DA={first:"Andrew",last:"Johnson",email:"andrew@email.com",birthdate:"2008-03-15",phone:"5551234567",gender:"Male",sport:"Soccer",positions:["Center Back (CB)"],gradYear:"2027",school:"Lincoln High School",state:"NY",height:'5\'10"',weight:"170 lbs",gpa:"3.8",intl:false,country:"United States",club:"",academy:"",preferredDivision:"No Preference",ncaaEligibilityStatus:"Not Started",toefl:""};
const DC={first:"Kyle",last:"Neptune",email:"neptune@fordham.edu",school:"Fordham University",div:"D1",conf:"Atlantic 10",sport:"Basketball",role:"Head Coach"};

// SVGs
const mk=p=>({active:a=false,size:s=22,color:cl}={})=>{const c=cl||(a?B:TL);return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{stroke:c}} strokeWidth={a?2.2:1.7} strokeLinecap="round" strokeLinejoin="round">{p}</svg>;};
const Ic={
  user:mk(<><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>),
  search:mk(<><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></>),
  bars:mk(<><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></>),
  msg:mk(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>),
  grid:mk(<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>),
  users:mk(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
  board:mk(<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></>),
  camp:mk(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>),
  back:mk(<polyline points="15 18 9 12 15 6"/>),
  mail:mk(<><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></>),
  send:mk(<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>),
  check:mk(<polyline points="20 6 9 17 4 12"/>),
  home:mk(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>),
  info:mk(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>),
  play:({size:s=22,color:c=B}={})=><svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  file:mk(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>),
  card:mk(<><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>),
  clip:mk(<><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></>),
  film:mk(<><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="2" y1="17" x2="7" y2="17"/></>),
  heart:mk(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>),
  share:mk(<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>),
  plus:mk(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>),
  link:mk(<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>),
  x:mk(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>),
};

// Primitives
function Btn({ch,onClick,v="p",ac=B,dis=false,full=false,sm=false,sx={}}){
  const ah=ac===B?BH:PUH,al=ac===B?BL:PUL;
  const b={cursor:dis?"not-allowed":"pointer",fontWeight:700,fontSize:sm?11.5:13.5,borderRadius:8,padding:sm?"6px 14px":"11px 20px",border:"none",opacity:dis?.3:1,width:full?"100%":undefined,transition:"all .12s",letterSpacing:0,...sx};
  const shP=dis?"none":(b.boxShadow??`0 1px 3px ${ac}40`);
  if(v==="p") return <button disabled={dis} onClick={onClick} style={{...b,background:ac,color:W,boxShadow:shP}}>{ch}</button>;
  if(v==="o") return <button disabled={dis} onClick={onClick} style={{...b,background:"transparent",color:ac,border:`1.5px solid ${ac}`}}>{ch}</button>;
  return <button disabled={dis} onClick={onClick} style={{...b,background:GR,color:TM,border:`1px solid ${BD}`}}>{ch}</button>;
}
const Pill=({ch,color=B,bg=BL})=><span style={{display:"inline-flex",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,color,background:bg,letterSpacing:.3,whiteSpace:"nowrap"}}>{ch}</span>;
const DRow=({label,value,last})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:last?"none":`1px solid ${BD}`}}><span style={{fontSize:12,color:TM}}>{label}</span><span style={{fontSize:12,fontWeight:700,color:T}}>{value}</span></div>;
const KPI=({value,label,color=B})=><div style={{flex:1,textAlign:"center",padding:"8px 4px"}}><div style={{fontSize:18,fontWeight:700,color:T,lineHeight:1,letterSpacing:-.5}}>{value}</div><div style={{fontSize:9,color:TL,fontWeight:500,marginTop:3,textTransform:"uppercase",letterSpacing:.4}}>{label}</div></div>;
function FIn({ac=B,error=false,...p}){const bc=error?"#ef4444":BD;return <input {...p} style={{width:"100%",padding:"12px 14px",border:`1.5px solid ${bc}`,borderRadius:10,fontSize:14,color:T,background:W,outline:"none",transition:"border-color .15s",...p.style}} onFocus={e=>{p.onFocus?.(e);e.target.style.borderColor=error?"#ef4444":ac}} onBlur={e=>{p.onBlur?.(e);e.target.style.borderColor=error?"#ef4444":BD}}/>;}
function FSel({ch,ac=B,...p}){return <select {...p} style={{width:"100%",padding:"12px 14px",border:`1.5px solid ${BD}`,borderRadius:10,fontSize:14,color:T,background:W,outline:"none",...p.style}}>{ch}</select>;}
function FL({label,hint,ch}){return <div style={{marginBottom:16}}><div style={{fontSize:12,fontWeight:600,color:T,marginBottom:8}}>{label}{hint&&<span style={{fontWeight:400,color:TL,marginLeft:6}}>{hint}</span>}</div>{ch}</div>;}
function Dots({total,cur,ac=B}){return <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:28}}>{Array.from({length:total}).map((_,i)=><div key={i} style={{width:i===cur?20:5,height:5,borderRadius:3,background:i===cur?ac:BD,transition:"all .3s ease"}}/>)}</div>;}
function Logo({sz=24,purple=false,light=false}){const c=purple?PU:B;const tc=light?W:T;return <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:sz,height:sz,borderRadius:sz*.22,background:c,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width={sz*.56} height={sz*.56} viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="7" height="2.5" rx="1" fill="white"/><rect x="3" y="4" width="2.5" height="12" rx="1" fill="white"/><rect x="3" y="9" width="5.5" height="2.5" rx="1" fill="white"/><rect x="11" y="4" width="9" height="2.5" rx="1" fill="white"/><rect x="13.75" y="4" width="2.5" height="12" rx="1" fill="white"/></svg></div><span style={{fontWeight:800,fontSize:sz*.8,color:tc,letterSpacing:-.6,lineHeight:1}}><span style={{color:tc}}>Fast</span><span style={{color:c}}>Track</span></span></div>;}
function Sheet({open,onClose,title,sub,ch}){if(!open)return null;return <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(17,24,39,.5)",zIndex:300,display:"flex",alignItems:"flex-end",backdropFilter:"blur(6px)"}}><div style={{background:W,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,margin:"0 auto",maxHeight:"91vh",overflowY:"auto",boxShadow:"0 -4px 32px rgba(0,0,0,.12)"}}><div style={{width:36,height:4,background:BD,borderRadius:2,margin:"12px auto 0"}}/>{(title||sub)&&<div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${BD}`}}>{title&&<div style={{fontSize:14,fontWeight:700,color:T,letterSpacing:-.3}}>{title}</div>}{sub&&<div style={{fontSize:12,color:TL,marginTop:3}}>{sub}</div>}</div>}<div style={{padding:(title||sub)?"16px 20px 40px":"20px 20px 40px"}}>{ch}</div></div></div>;}
function FilterPill({label,value,options,onChange,ac=B}){
  const[open,setOpen]=useState(false);
  const active=value!=="All";
  const ref=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",fn);document.addEventListener("touchstart",fn);
    return()=>{document.removeEventListener("mousedown",fn);document.removeEventListener("touchstart",fn);};
  },[open]);
  return <div ref={ref} style={{position:"relative",flexShrink:0}}>
    <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px 4px 9px",borderRadius:5,border:`1px solid ${active?B:BD}`,background:active?BL:W,cursor:"pointer",fontSize:11,fontWeight:600,color:active?B:TM,whiteSpace:"nowrap",transition:"all .12s"}}>
      {active?value:label}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{transition:"transform .15s",transform:open?"rotate(180deg)":"rotate(0deg)",flexShrink:0}}>
        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {active&&<button onClick={e=>{e.stopPropagation();onChange("All");setOpen(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:0,marginLeft:1,display:"flex",alignItems:"center",color:B,fontSize:13,lineHeight:1}}>×</button>}
    </button>
    {open&&<div style={{position:"absolute",top:"calc(100% + 4px)",left:0,minWidth:140,background:W,border:`1px solid ${BD}`,borderRadius:8,boxShadow:"0 4px 20px rgba(0,0,0,.1)",zIndex:200,overflow:"hidden",maxHeight:220,overflowY:"auto"}}>
      {options.map(o=>{const sel=o===value;return <button key={o} onClick={()=>{onChange(o);setOpen(false);}} style={{width:"100%",textAlign:"left",padding:"9px 13px",border:"none",background:sel?BL:W,color:sel?B:T,fontSize:12,fontWeight:sel?600:400,cursor:"pointer",borderBottom:`1px solid ${sel?"#dbeafe":"#f3f4f6"}`,display:"block"}}>
        {o==="All"?`All ${label}s`:o}
      </button>;})}
    </div>}
  </div>;
}

function PosPick({sport,sel,onChange,ac=B}){const ps=SP[sport]||[];const tg=p=>onChange(sel.includes(p)?sel.filter(x=>x!==p):[...sel,p]);return <div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{ps.map(p=>{const on=sel.includes(p);return <button key={p} onClick={()=>tg(p)} style={{cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px 14px",borderRadius:100,border:`1.5px solid ${on?ac:BD}`,background:on?(ac===B?BL:PUL):W,color:on?ac:TM,transition:"all .12s"}}>{p}</button>;})}</div>{!sel.length&&<p style={{fontSize:12,color:"#ef4444",marginTop:8,fontWeight:500}}>Select at least one position</p>}</div>;}

const CSS=`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root{
  --W:#ffffff;--GR:#f7f8fa;--BD:#e4e7ec;--T:#111827;--TM:#4b5563;--TL:#9ca3af;
  --BL:#FDF3EE;--BR:#F5C4A8;--PUL:#f0ebff;--GL:#e3fcef;
  --nav-icon:#b0b8c4;
}
[data-theme=dark]{
  --W:#111111;--GR:#0a0a0a;--BD:#222222;--T:#f0f0ee;--TM:#888888;--TL:#555555;
  --BL:#2a1200;--BR:#7c3518;--PUL:#1e1040;--GL:#0a2e1e;
  --nav-icon:#4a4a50;
}

*{box-sizing:border-box;margin:0;padding:0}
html{touch-action:manipulation;-ms-touch-action:manipulation}
body{text-align:left;-webkit-font-smoothing:antialiased;background:var(--GR)}
body,input,select,textarea,button{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI','Inter',sans-serif}
*{-webkit-text-size-adjust:none;text-size-adjust:none}
input,select,textarea{font-size:16px!important}
::-webkit-scrollbar{width:0}
input:focus,select:focus,textarea:focus{outline:none}
input::placeholder,textarea::placeholder{color:var(--TL)}
textarea{resize:none;line-height:1.6}

/* Animations */
.fade{animation:fu .22s cubic-bezier(.16,1,.3,1)}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* Toast */
.toast,.ctoast{
  position:fixed;bottom:76px;left:50%;transform:translateX(-50%);
  background:#111827;color:#fff;padding:9px 18px;
  border-radius:100px;font-size:12px;font-weight:600;
  z-index:500;box-shadow:0 4px 24px rgba(0,0,0,.2);
  white-space:nowrap;animation:fu .15s ease;
  border:1px solid rgba(255,255,255,.08)
}

/* School / athlete rows */
.sr{
  background:var(--W);border-bottom:1px solid var(--BD);
  padding:14px 20px;cursor:pointer;
  display:flex;align-items:center;gap:14px;
  transition:background .1s;text-align:left
}
.sr:active{background:var(--GR)}

/* Clip row */
.ci{
  background:var(--W);border:1px solid var(--BD);border-radius:10px;
  padding:13px 15px;display:flex;align-items:center;gap:12px;
  cursor:pointer;transition:all .15s;margin-bottom:8px
}
.ci:active{background:var(--GR)}

.sc,.bc{
  background:var(--W);border:1px solid var(--BD);border-radius:8px;
  padding:11px 13px;margin-bottom:6px;cursor:pointer;
  transition:border-color .12s
}
.sc:active,.bc:active{border-color:#D97757}

/* Message threads */
.tr,.ar,.trc{
  background:var(--W);border-bottom:1px solid var(--BD);
  padding:14px 20px;cursor:pointer;
  display:flex;align-items:center;gap:13px;
  transition:background .1s
}
.tr:active,.ar:active,.trc:active{background:var(--GR)}

/* Athlete / coach cards */
.ac,.cc{
  background:var(--W);border:1px solid var(--BD);border-radius:12px;
  padding:16px;cursor:pointer;transition:all .15s
}
.ac:active,.cc:active{border-color:#D97757}

.rcard{transition:all .15s;cursor:pointer}

/* Camp card */
.campcard{
  background:var(--W);border:1px solid var(--BD);border-radius:12px;
  padding:18px;transition:all .15s;margin-bottom:12px
}
.campcard:active{border-color:#D97757}

/* Pipeline board card */
.bcard{
  background:var(--W);border:1px solid var(--BD);border-radius:8px;
  padding:12px;margin-bottom:6px;cursor:pointer;transition:all .12s
}
.bcard:active{background:var(--GR)}

/* Bottom navigation */
.nav-app{
  background:var(--W);
  border-top:1px solid var(--BD);
  display:flex;flex-shrink:0;height:58px;
  padding:0 4px;
}
.nav-btn{
  flex:1;background:none;border:none;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:2px;position:relative;
  transition:opacity .1s;padding-bottom:2px
}
.nav-btn:active{opacity:.6}
.nav-label{
  font-size:10px;letter-spacing:0;
  font-weight:600;
  font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif
}

/* Sub tabs */
.stab{
  flex:1;background:none;border:none;
  border-bottom:2px solid transparent;
  cursor:pointer;font-size:13px;font-weight:600;
  padding:13px 0;transition:all .12s;letter-spacing:0;
  font-family:'Inter',sans-serif
}
`;

function useMsgs(seed){
  const[threads,setT]=useState(seed);
  const[active,setA]=useState(null);
  const[inp,setInp]=useState("");
  const ref=useRef(null);
  const total=threads.reduce((a,t)=>a+t.unread,0);
  const open=t=>{setT(ts=>ts.map(x=>x.id===t.id?{...x,unread:0,msgs:x.msgs.map(m=>({...m,unread:false}))}:x));setA({...t,unread:0});};
  const send=(from,sim)=>{
    if(!inp.trim())return;
    const now=new Date(),ts=`${now.toLocaleDateString("en-US",{month:"short",day:"numeric"})}, ${now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}`;
    const m={id:Date.now(),from,text:inp.trim(),time:ts};
    setT(ts=>ts.map(t=>t.id===active.id?{...t,msgs:[...t.msgs,m]}:t));
    setA(a=>({...a,msgs:[...a.msgs,m]}));setInp("");
    if(sim) setTimeout(()=>{const r={id:Date.now()+1,from:from==="athlete"?"coach":"athlete",text:"Got your message — will follow up shortly.",time:ts};setT(ts=>ts.map(t=>t.id===active.id?{...t,msgs:[...t.msgs,r],unread:1}:t));setA(a=>a?{...a,msgs:[...a.msgs,r]}:a);},1500);
  };
  useEffect(()=>{if(ref.current)ref.current.scrollIntoView({behavior:"smooth"});},[active?.msgs?.length]);
  return{threads,setT,active,setA,inp,setInp,total,open,send,ref};
}

function ThreadUI({thread,inp,setInp,onSend,endRef,ac,fromLabel,fromEmail,onAttach}){
  const al=ac===B?"#C4622A":"#5b21b6",abg=ac===B?BL:PUL,abr=ac===B?BR:PUB;
  return <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{background:abg,borderBottom:`1px solid ${abr}`,padding:"7px 16px",display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
      <Ic.mail size={12} color={ac}/><p style={{fontSize:11,color:al,margin:0}}>Connected to <strong>{fromEmail}</strong> · replies sync both ways</p>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"14px 14px 6px",display:"flex",flexDirection:"column",gap:12}}>
      {thread.msgs.map(m=>{
        const mine=m.from==="athlete"?ac===B:ac===PU;
        return <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:mine?"flex-end":"flex-start",gap:3}}>
          {!mine&&<p style={{fontSize:11,color:TL,margin:0,paddingLeft:2,fontWeight:600}}>{fromLabel}</p>}
          <div style={{maxWidth:"78%",fontSize:13,lineHeight:1.55,padding:"10px 14px",borderRadius:mine?"18px 18px 4px 18px":"18px 18px 18px 4px",background:mine?ac:W,color:mine?W:T,border:mine?"none":`1px solid ${BD}`,wordBreak:"break-word"}}>{m.text}</div>
          <p style={{fontSize:10,color:TL,margin:0}}>{m.time}</p>
        </div>;
      })}
      <div ref={endRef}/>
    </div>
    <div style={{background:W,borderTop:`1px solid ${BD}`,padding:"9px 13px",flexShrink:0}}>
      <div style={{background:GR,border:`1.5px solid ${BD}`,borderRadius:6,padding:"8px 12px",display:"flex",alignItems:"flex-end",gap:8}}>
        <textarea rows={1} placeholder="Write a message…" value={inp} onChange={e=>{setInp(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onSend();}}} style={{flex:1,maxHeight:90,overflowY:"auto",background:"transparent",color:T,fontSize:13,border:"none",outline:"none"}}/>
        <div style={{display:"flex",gap:7,flexShrink:0,paddingBottom:2}}>
          <button onClick={onAttach} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Ic.clip size={16} color={TL}/></button>
          <button onClick={onSend} disabled={!inp.trim()} style={{width:31,height:31,borderRadius:"50%",background:inp.trim()?ac:BD,border:"none",cursor:inp.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s"}}><Ic.send size={13} color={W}/></button>
        </div>
      </div>
      <p style={{fontSize:10,color:TL,textAlign:"center",marginTop:4}}>Sends from <strong>{fromEmail}</strong></p>
    </div>
  </div>;
}

// Onboarding
function RoleSelect({onSelect,onJump,onSignIn}){
  const[hov,setHov]=useState(null);
  return <div style={{minHeight:"100vh",background:"#0D0D0D",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 22px",textAlign:"left"}}>
    <style>{CSS}</style>
    <div style={{width:"100%",maxWidth:360}}>

      {/* Logo mark */}
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{width:52,height:52,background:B,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 8px 32px ${B}40`}}>
          <svg width={26} height={26} viewBox="0 0 20 20" fill="none"><path d="M10 2L13 8H19L14 12L16 18L10 14.5L4 18L6 12L1 8H7L10 2Z" fill="white"/></svg>
        </div>
        <h1 style={{fontSize:22,fontWeight:800,color:W,letterSpacing:-.6,margin:0,marginBottom:6}}>FastTrack</h1>
        <p style={{fontSize:12,color:"#666",margin:0,letterSpacing:.3}}>College Recruiting Platform</p>
      </div>

      {/* Role cards */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:32}}>
        {[
          {role:"athlete",title:"I'm an Athlete",sub:"Build your profile, discover schools & camps, and get found by coaches."},
          {role:"coach",title:"I'm a Coach",sub:"Find verified athletes, manage your board, and run recruiting events."}
        ].map(r=>{const active=hov===r.role;return(
          <div key={r.role} onMouseEnter={()=>setHov(r.role)} onMouseLeave={()=>setHov(null)} onClick={()=>onSelect(r.role)}
            style={{border:`1px solid ${active?"#333":"#1a1a1a"}`,borderRadius:10,padding:"16px 18px",background:active?"#1a1a1a":"#111",cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <div style={{flex:1}}>
              <p style={{fontSize:14,fontWeight:700,color:active?W:"#ccc",margin:0,marginBottom:4}}>{r.title}</p>
              <p style={{fontSize:11,color:"#555",lineHeight:1.55,margin:0}}>{r.sub}</p>
            </div>
            <div style={{width:28,height:28,borderRadius:"50%",background:active?B:"#1a1a1a",border:`1px solid ${active?B:"#2a2a2a"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={active?W:"#444"} strokeWidth={2.5} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        );})}
      </div>

      <p style={{fontSize:12,color:"#444",textAlign:"center",marginBottom:28}}>Already have an account? <span style={{color:B,fontWeight:600,cursor:"pointer"}} onClick={onSignIn}>Sign in</span></p>

      {/* Dev shortcuts */}
      <div style={{borderTop:"1px solid #1a1a1a",paddingTop:20}}>
        <p style={{fontSize:9,color:"#333",textAlign:"center",letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Dev Shortcuts</p>
        <div style={{display:"flex",gap:7}}>
          {[["athlete","Athlete"],["coach","Coach"]].map(([r,label])=>(
            <button key={r} onClick={()=>onJump(r)} style={{flex:1,background:"transparent",border:"1px solid #222",borderRadius:6,padding:"8px 0",cursor:"pointer",fontSize:11,fontWeight:600,color:"#555",transition:"all .12s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=B;e.currentTarget.style.color=B;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#222";e.currentTarget.style.color="#555";}}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>;
}

const FT_ATHLETE_ONBOARD_DRAFT="ft_athlete_onboard_draft";
const ATHLETE_ONBOARD_DEFAULT_F={
  first:"",last:"",birthdate:"",email:"",phone:"",pw:"",
  gender:"",sport:"Basketball",positions:[],
  gradYear:"",school:"",state:"NY",gpa:"",height:"",weight:"",
  idDone:false,country:"United States",intl:false,heightCm:"",weightKg:"",
  club:"",academy:"",
  preferredDivision:"No Preference",ncaaEligibilityStatus:"",
  toefl:"",
};
function parseAthleteOnboardDraft(){
  try{
    const raw=localStorage.getItem(FT_ATHLETE_ONBOARD_DRAFT);
    if(!raw)return null;
    const d=JSON.parse(raw);
    if(!d||typeof d!=="object")return null;
    let step=typeof d.step==="number"&&d.step>=0&&d.step<=5?d.step:0;
    const pf=d.f&&typeof d.f==="object"?d.f:{};
    const f={...ATHLETE_ONBOARD_DEFAULT_F,...pf};
    if(!Array.isArray(f.positions))f.positions=[];
    if(!f.intl&&step===4)step=5;
    return{step,f};
  }catch{return null;}
}
const emailFmtOk=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s||"").trim());

function AthleteOnboard({onComplete,onSignIn}){
  const init=parseAthleteOnboardDraft();
  const[step,setStep]=useState(init?init.step:0);
  const[f,setF]=useState(init?init.f:{...ATHLETE_ONBOARD_DEFAULT_F});
  const[authErr,setAuthErr]=useState("");
  const[submitting,setSubmitting]=useState(false);
  const[t0,setT0]=useState({fn:false,ln:false,em:false,ph:false,pw:false});
  const[attempt0,setAttempt0]=useState(false);
  useEffect(()=>{
    localStorage.setItem(FT_ATHLETE_ONBOARD_DRAFT,JSON.stringify({step,f}));
  },[step,f]);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const setSport=v=>setF(p=>({...p,sport:v,positions:[]}));
  const phoneOk=(f.phone||"").replace(/\D/g,"").length>=10;
  const hasEligStep=!!f.intl;
  const steps=hasEligStep?6:5;
  const dotCur=hasEligStep?step:(step<=3?step:4);
  const isSoccer=f.sport==="Soccer";
  const goNext=()=>{
    if(step===0&&!ok[0]){setAttempt0(true);return;}
    setStep(s=>(s===3&&!f.intl)?5:Math.min(s+1,5));
  };
  const goBack=()=>setStep(s=>(s===5&&!f.intl)?3:Math.max(s-1,0));
  useEffect(()=>{if(!f.intl&&step===4)setStep(5);},[f.intl,step]);
  const e0={
    fn:(t0.fn||attempt0)&&!String(f.first||"").trim(),
    ln:(t0.ln||attempt0)&&!String(f.last||"").trim(),
    emEmpty:(t0.em||attempt0)&&!String(f.email||"").trim(),
    emFmt:(t0.em||attempt0)&&!!String(f.email||"").trim()&&!emailFmtOk(f.email),
    ph:(t0.ph||attempt0)&&!phoneOk,
    pw:(t0.pw||attempt0)&&f.pw.length<8,
  };
  const ok=[true,true,true,true,true,true];
  const H=[
    "Create your account",
    "Sport & position",
    "Academics & measurements",
    "School & club",
    "Eligibility & academics",
    "Become a verified athlete",
  ];
  const HSub=[
    "We use this to create your account and help coaches reach you.",
    "Tell us how you play so we can match the right programs.",
    "Academic and athletic details coaches use for eligibility and fit.",
    "Where you train helps coaches understand your background.",
    "NCAA eligibility and recruiting preferences for international athletes.",
    "Optional — verify your identity with a school or government ID.",
  ];
  const breadLabs=f.intl?["About you","Sport","Academics","School","Eligibility","Verify"]:["About you","Sport","Academics","School","Verify"];
  const breadCur=f.intl?step:(step<=3?step:4);
  const NCAA_ELIG_OPTS=["Not Started","In Progress","Certified — Eligible","Certified — Academic Redshirt","Waiver Pending","Not Applicable (HS Junior or earlier)"];
  const PREF_DIV_OPTS=["No Preference","D1","D2","D3","NAIA","JUCO","Professional Pathway"];

  const doSignUp=()=>{
    const meta={
      role:"athlete",
      first:f.first,last:f.last,birthdate:f.birthdate,phone:f.phone,
      gender:f.gender,sport:f.sport,positions:f.positions,gradYear:f.gradYear,
      school:f.school,state:f.state,gpa:f.gpa,height:f.height,weight:f.weight,
      intl:f.intl,country:f.country,heightCm:f.heightCm,weightKg:f.weightKg,
      club:f.club,academy:f.academy,preferredDivision:f.preferredDivision,
      ncaaEligibilityStatus:f.intl?f.ncaaEligibilityStatus:"",
      toefl:f.toefl,idDone:!!f.idDone,
    };
    localStorage.removeItem(FT_ATHLETE_ONBOARD_DRAFT);
    localStorage.setItem("ft_gender",f.gender==="Female"?"woman":"man");
    onComplete({...f,...meta});
  };

  const startOver=()=>{
    localStorage.removeItem(FT_ATHLETE_ONBOARD_DRAFT);
    setStep(0);
    setF({...ATHLETE_ONBOARD_DEFAULT_F});
    setAttempt0(false);
    setT0({fn:false,ln:false,em:false,ph:false,pw:false});
    setAuthErr("");
  };

  return <div style={{minHeight:"100vh",background:GR,display:"flex",alignItems:"center",justifyContent:"center",padding:22,textAlign:"left"}}><style>{CSS}</style>
    <div style={{background:W,borderRadius:16,padding:"28px 24px",width:"100%",maxWidth:430,boxShadow:"0 4px 32px rgba(0,0,0,.08)",position:"relative"}}>
      {submitting&&<div style={{position:"absolute",inset:0,background:"rgba(255,255,255,.94)",borderRadius:16,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:10,gap:14}}><p style={{fontSize:15,fontWeight:700,color:T,margin:0}}>Creating your profile…</p></div>}
      <div style={{marginBottom:16}}><Logo sz={24}/></div>
      <Dots total={steps} cur={dotCur}/>
      <div style={{fontSize:10,color:TL,marginBottom:12,lineHeight:1.6,display:"flex",flexWrap:"wrap",alignItems:"center",gap:6}}>
        {breadLabs.map((lab,i)=><span key={lab+i} style={{display:"inline-flex",alignItems:"center",gap:6}}>{i>0&&<span style={{color:BD,fontWeight:400}}>→</span>}<span style={{fontWeight:i===breadCur?700:600,color:i===breadCur?B:TL}}>{lab}</span></span>)}
      </div>
      <h2 style={{fontSize:17,fontWeight:800,color:T,letterSpacing:-.4,marginBottom:6,lineHeight:1.2}}>{H[step]}</h2>
      <p style={{fontSize:12,color:TM,margin:"0 0 14px",lineHeight:1.45}}>{HSub[step]}</p>

      <div key={step} className="fade">
      {step===0&&<><div style={{display:"flex",gap:9,marginTop:4}}><FL label="First Name" ch={<><FIn placeholder="Marcus" value={f.first} error={e0.fn} onChange={e=>set("first",e.target.value)} onBlur={()=>setT0(p=>({...p,fn:true}))}/>{e0.fn&&<p style={{fontSize:11,color:"#ef4444",marginTop:6,marginBottom:0}}>Enter your first name.</p>}</>}/><FL label="Last Name" ch={<><FIn placeholder="Johnson" value={f.last} error={e0.ln} onChange={e=>set("last",e.target.value)} onBlur={()=>setT0(p=>({...p,ln:true}))}/>{e0.ln&&<p style={{fontSize:11,color:"#ef4444",marginTop:6,marginBottom:0}}>Enter your last name.</p>}</>}/></div>
      <FL label="Email" ch={<><FIn type="email" placeholder="you@email.com" value={f.email} error={e0.emEmpty||e0.emFmt} onChange={e=>set("email",e.target.value)} onBlur={()=>setT0(p=>({...p,em:true}))}/>{e0.emEmpty&&<p style={{fontSize:11,color:"#ef4444",marginTop:6,marginBottom:0}}>Enter your email.</p>}{e0.emFmt&&!e0.emEmpty&&<p style={{fontSize:11,color:"#ef4444",marginTop:6,marginBottom:0}}>Enter a valid email address.</p>}</>}/>
      <p style={{fontSize:11,color:TM,margin:"-4px 0 12px",lineHeight:1.45}}>Phone is for account security and coach contact — never sold.</p>
      <FL label="Phone" ch={<><FIn type="tel" placeholder="(555) 123-4567" inputMode="tel" value={f.phone} error={e0.ph} onChange={e=>set("phone",e.target.value)} onBlur={()=>setT0(p=>({...p,ph:true}))}/>{e0.ph&&<p style={{fontSize:11,color:"#ef4444",marginTop:6,marginBottom:0}}>Enter a valid 10-digit phone number.</p>}</>}/>
      <FL label="Password" ch={<><FIn type="password" placeholder="Min 8 characters" value={f.pw} error={e0.pw} onChange={e=>set("pw",e.target.value)} onBlur={()=>setT0(p=>({...p,pw:true}))}/>{e0.pw&&<p style={{fontSize:11,color:"#ef4444",marginTop:6,marginBottom:0}}>Use at least 8 characters.</p>}<div style={{marginTop:8}}>{[["At least 8 characters",f.pw.length>=8]].map(([txt,done])=><div key={txt} style={{fontSize:11,color:done?G:TM,marginBottom:3}}>{done?<span style={{color:G,marginRight:6}}>✓</span>:<span style={{marginRight:6}}>○</span>}{txt}</div>)}</div></>}/>
      </>}

      {step===1&&<div style={{marginTop:12}}>
      <FL label="Gender" ch={<div style={{display:"flex",gap:8}}>{["Male","Female"].map(g=><button key={g} type="button" onClick={()=>set("gender",g)} style={{flex:1,padding:"10px 0",border:`1.5px solid ${f.gender===g?B:BD}`,borderRadius:4,background:f.gender===g?BL:W,color:f.gender===g?B:TM,fontSize:13,fontWeight:f.gender===g?700:500,cursor:"pointer",transition:"all .15s"}}>{g}</button>)}</div>}/>
      <FL label="Sport" ch={<FSel ch={Object.keys(SP).map(s=><option key={s}>{s}</option>)} value={f.sport} onChange={e=>setSport(e.target.value)}/>}/>
      <FL label="Position" hint="— select all that apply" ch={<PosPick sport={f.sport} sel={f.positions} onChange={v=>set("positions",v)}/>}/>
      <div style={{background:BL,border:`1px solid ${BR}`,borderRadius:4,padding:"10px 14px",marginTop:14,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><p style={{fontSize:13,fontWeight:600,color:T,margin:0}}>International Player</p><p style={{fontSize:11,color:TM,margin:0}}>Based outside the United States</p></div>
        <button type="button" onClick={()=>set("intl",!f.intl)} style={{width:44,height:24,borderRadius:6,background:f.intl?B:BD,border:"none",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
          <div style={{width:18,height:18,borderRadius:"50%",background:W,position:"absolute",top:3,left:f.intl?23:3,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
        </button>
      </div>
      {f.intl&&<><FL label="Country" ch={<FSel ch={["Argentina","Australia","Belgium","Brazil","Canada","Colombia","Costa Rica","Croatia","England","France","Germany","Ghana","Ireland","Italy","Jamaica","Mexico","Morocco","Netherlands","Nigeria","Portugal","Scotland","Senegal","South Korea","Spain","Sweden","United States","Other"].map(c=><option key={c}>{c}</option>)} value={f.country} onChange={e=>set("country",e.target.value)}/>}/>
      <div style={{display:"flex",gap:9}}>
        <FL label="Height (cm)" ch={<FIn placeholder="185" inputMode="decimal" value={f.heightCm} onChange={e=>set("heightCm",e.target.value)}/>}/>
        <FL label="Weight (kg)" ch={<FIn placeholder="75" inputMode="decimal" value={f.weightKg} onChange={e=>set("weightKg",e.target.value)}/>}/>
      </div></>}
      </div>}

      {step===2&&<div style={{marginTop:12}}>
      <FL label="Birthdate" hint="— type any format you prefer" ch={<FIn type="text" placeholder="e.g. 03/15/2008 or March 15, 2008" autoComplete="bday" inputMode="text" value={f.birthdate} onChange={e=>set("birthdate",e.target.value)}/>}/>
      <FL label="Graduation Year" ch={<FSel ch={[<option key="" value="" disabled>Select year</option>,...GY.map(y=><option key={y} value={y}>{y}</option>)]} value={f.gradYear} onChange={e=>set("gradYear",e.target.value)}/>}/>
      {!f.intl&&<div style={{display:"flex",gap:9}}>
        <FL label="Height" ch={<FIn placeholder="6&apos;2&quot;" inputMode="text" value={f.height} onChange={e=>set("height",e.target.value)}/>}/>
        <FL label="Weight (lbs)" ch={<FIn placeholder="185" inputMode="decimal" value={f.weight} onChange={e=>set("weight",e.target.value)}/>}/>
      </div>}
      <FL label="GPA" ch={<FIn placeholder="e.g. 3.4" inputMode="decimal" value={f.gpa} onChange={e=>set("gpa",e.target.value)}/>}/>
      </div>}

      {step===3&&<div style={{marginTop:12}}>
      <FL label={f.intl?"School / Academy":"Current High School"} ch={<FIn placeholder={f.intl?"e.g. Benfica Academy":"Lincoln High School"} value={f.school} onChange={e=>set("school",e.target.value)}/>}/>
      {f.intl
        ?<FL label="City / Region" ch={<FIn placeholder="e.g. Lisbon, Portugal" value={f.state} onChange={e=>set("state",e.target.value)}/>}/>
        :<FL label="State" ch={<FSel ch={["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map(s=><option key={s}>{s}</option>)} value={f.state} onChange={e=>set("state",e.target.value)}/>}/>
      }
      <FL label="Current Club / Academy" ch={<FIn placeholder="e.g. NY Red Bulls Academy, Manhattan SC" value={f.club} onChange={e=>set("club",e.target.value)}/>}/>
      <FL label="Club / Academy History" hint="optional" ch={<div style={{border:`1.5px solid ${BD}`,borderRadius:4,padding:"9px 12px"}} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor=BD}><textarea rows={3} placeholder="e.g. 2022–2024 NYRB Academy, 2020–2022 Manhattan SC" value={f.academy} onChange={e=>set("academy",e.target.value)} style={{background:"transparent",width:"100%",border:"none",outline:"none",fontSize:13,color:T,lineHeight:1.55,resize:"none"}}/></div>}/>
      <div style={{background:GR,border:`1px solid ${BD}`,borderRadius:4,padding:"10px 14px",marginTop:4}}>
        <p style={{fontSize:11,color:TM,margin:0,lineHeight:1.55}}>Your club history helps coaches understand your development path.</p>
      </div>
      </div>}

      {step===4&&f.intl&&<div style={{marginTop:12}}>
      <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:5,padding:"12px 14px",marginBottom:16}}>
        <p style={{fontSize:12,fontWeight:700,color:"#92400e",margin:0,marginBottom:3}}>NCAA Eligibility</p>
        <p style={{fontSize:11,color:"#92400e",margin:0,lineHeight:1.5}}>{isSoccer?"College coaches need to know your academic eligibility status. International players must also complete NCAA eligibility through the NCAA Eligibility Center before playing college soccer.":"College coaches need to know your academic eligibility status. Complete NCAA Eligibility Center registration when required for your sport."}</p>
      </div>
      <FL label="Preferred Division (recruiting)" ch={<FSel ch={PREF_DIV_OPTS.map(d=><option key={d}>{d}</option>)} value={f.preferredDivision} onChange={e=>set("preferredDivision",e.target.value)}/>}/>
      <FL label="NCAA Eligibility Status" ch={<FSel ch={[<option key="_p" value="" disabled>Select status</option>,...NCAA_ELIG_OPTS.map(s=><option key={s} value={s}>{s}</option>)]} value={f.ncaaEligibilityStatus} onChange={e=>set("ncaaEligibilityStatus",e.target.value)}/>}/>
      {f.intl&&<FL label="English Proficiency (TOEFL)" hint="if applicable" ch={<FIn placeholder="e.g. 90" inputMode="numeric" value={f.toefl} onChange={e=>set("toefl",e.target.value)}/>}/>}
      </div>}

      {step===5&&<div style={{marginTop:12}}><div style={{background:BL,border:`1px solid ${BR}`,borderRadius:4,padding:"12px 14px",fontSize:12,color:"#C4622A",lineHeight:1.6,marginBottom:14}}>Upload a photo of your school-issued student ID, athletic clearance, or government ID. Used only for verification.</div>{!f.idDone?<div onClick={()=>set("idDone",true)} style={{border:`1.5px dashed ${BD}`,borderRadius:5,padding:28,textAlign:"center",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=B;e.currentTarget.style.background=BL}} onMouseLeave={e=>{e.currentTarget.style.borderColor=BD;e.currentTarget.style.background=W}}><div style={{width:42,height:42,background:BL,border:`1px solid ${BR}`,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 11px"}}><Ic.card size={20} color={B}/></div><p style={{fontSize:14,fontWeight:700,color:T,marginBottom:2}}>Upload ID photo</p><p style={{fontSize:12,color:TM}}>JPG, PNG or PDF — max 10 MB</p><div style={{marginTop:14,display:"inline-block",background:B,color:W,padding:"8px 22px",borderRadius:4,fontSize:12,fontWeight:700}}>Choose File</div></div>:<div style={{background:GL,border:"1px solid #6ee7b7",borderRadius:5,padding:24,textAlign:"center"}}><div style={{width:38,height:38,background:"#d1fae5",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 9px"}}><Ic.check size={18} color={G}/></div><p style={{fontSize:14,fontWeight:700,color:G,marginBottom:2}}>ID Uploaded</p><p style={{fontSize:12,color:TM}}>Verification within 24 hours.</p></div>}<p style={{fontSize:11,color:TM,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:4,padding:"8px 12px",marginTop:10}}>Your ID is never shared with coaches or third parties.</p></div>}

      </div>

      {authErr&&<p style={{fontSize:12,color:"#ef4444",margin:"12px 0 0",lineHeight:1.4}}>{authErr}</p>}
      <div style={{display:"flex",gap:8,marginTop:20,flexWrap:"wrap"}}>
        {step>0&&<Btn ch="Back" v="g" sx={{flex:1,minWidth:100}} onClick={goBack}/>}
        {step<5&&<Btn ch="Continue" dis={!ok[step]} sx={{flex:2,minWidth:140}} onClick={goNext}/>}
        {step===5&&<>
          <Btn ch="Create account" dis={submitting} sx={{flex:2,minWidth:140}} onClick={doSignUp}/>
        </>}
      </div>
      {step===5&&<button type="button" disabled={submitting} onClick={doSignUp} style={{width:"100%",marginTop:10,background:"none",border:"none",cursor:submitting?"default":"pointer",fontSize:12,fontWeight:700,color:B,padding:"8px 0"}}>Skip verification — create account</button>}
      <p style={{fontSize:11,color:TL,textAlign:"center",marginTop:12}}><button type="button" onClick={startOver} style={{background:"none",border:"none",cursor:"pointer",color:TL,textDecoration:"underline",fontSize:11,padding:0}}>Start over</button></p>
      <p style={{fontSize:12,color:TL,textAlign:"center",marginTop:6}}>Have an account? <span style={{color:B,fontWeight:600,cursor:"pointer"}} onClick={onSignIn}>Sign in</span></p>
    </div>
  </div>;
}


function CoachOnboard({onComplete,onSignIn}){
  const[step,setStep]=useState(0);
  const[authErr,setAuthErr]=useState("");
  const[submitting,setSubmitting]=useState(false);
  const[f,setF]=useState({first:"",last:"",email:"",pw:"",school:"",div:"D1",conf:"",sport:"Basketball",role:"Head Coach",emailDone:false,credDone:false});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const ok=[true,true,true,true];
  const H=["Create your account","Your program","Verify school email","Upload credentials"];
  return <div style={{minHeight:"100vh",background:GR,display:"flex",alignItems:"center",justifyContent:"center",padding:22,textAlign:"left"}}><style>{CSS}</style>
    <div style={{background:W,borderRadius:4,padding:"28px 24px",width:"100%",maxWidth:430,boxShadow:"0 2px 40px rgba(10,14,26,.1)",border:`1px solid ${BD}`}}>
      <div style={{marginBottom:20}}><Logo sz={24} purple/></div><Dots total={4} cur={step} ac={PU}/>
      <h2 style={{fontSize:17,fontWeight:800,color:T,letterSpacing:-.4,marginBottom:4,lineHeight:1.2}}>{H[step]}</h2>
      {step===0&&<div style={{marginTop:12}}><div style={{display:"flex",gap:9}}><FL label="First Name" ch={<FIn ac={PU} placeholder="Kyle" value={f.first} onChange={e=>set("first",e.target.value)}/>}/><FL label="Last Name" ch={<FIn ac={PU} placeholder="Neptune" value={f.last} onChange={e=>set("last",e.target.value)}/>}/></div><FL label="Official School Email" ch={<FIn ac={PU} type="email" placeholder="neptune@fordham.edu" value={f.email} onChange={e=>set("email",e.target.value)}/>}/><FL label="Password" ch={<FIn ac={PU} type="password" placeholder="Min 8 characters" value={f.pw} onChange={e=>set("pw",e.target.value)}/>}/></div>}
      {step===1&&<div style={{marginTop:12}}><FL label="School / University" ch={<FIn ac={PU} placeholder="Fordham University" value={f.school} onChange={e=>set("school",e.target.value)}/>}/><div style={{display:"flex",gap:9}}><FL label="Division" ch={<FSel ch={["D1","D2","D3","NAIA","JUCO"].map(d=><option key={d}>{d}</option>)} value={f.div} onChange={e=>set("div",e.target.value)} style={{width:"100%"}}/>}/><FL label="Conference" ch={<FIn ac={PU} placeholder="Atlantic 10" value={f.conf} onChange={e=>set("conf",e.target.value)}/>}/></div><div style={{display:"flex",gap:9}}><FL label="Sport" ch={<FSel ch={Object.keys(SP).map(s=><option key={s}>{s}</option>)} value={f.sport} onChange={e=>set("sport",e.target.value)} style={{width:"100%"}}/>}/><FL label="Role" ch={<FSel ch={["Head Coach","Associate HC","Assistant Coach","Dir. of Recruiting","Grad Assistant"].map(r=><option key={r}>{r}</option>)} value={f.role} onChange={e=>set("role",e.target.value)} style={{width:"100%"}}/>}/></div></div>}
      {step===2&&<div style={{marginTop:12}}>{!f.emailDone?<div style={{background:GR,border:`1px solid ${BD}`,borderRadius:6,padding:20,textAlign:"center"}}><div style={{width:40,height:40,background:PUL,border:`1px solid ${PUB}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}><Ic.mail size={19} color={PU}/></div><p style={{fontSize:14,fontWeight:700,color:T,marginBottom:5}}>Check your school inbox</p><p style={{fontSize:12,color:TM,marginBottom:14}}>Link sent to <strong>{f.email||"your email"}</strong></p><Btn ch="I clicked the link" v="o" ac={PU} onClick={()=>set("emailDone",true)}/></div>:<div style={{background:GL,border:"1px solid #6ee7b7",borderRadius:6,padding:24,textAlign:"center"}}><div style={{width:38,height:38,background:"#d1fae5",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 9px"}}><Ic.check size={18} color={G}/></div><p style={{fontSize:14,fontWeight:700,color:G}}>Email Verified</p></div>}</div>}
      {step===3&&<div style={{marginTop:12}}>{!f.credDone?<div onClick={()=>set("credDone",true)} style={{border:`1.5px dashed ${BD}`,borderRadius:5,padding:28,textAlign:"center",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=PU;e.currentTarget.style.background=PUL}} onMouseLeave={e=>{e.currentTarget.style.borderColor=BD;e.currentTarget.style.background=W}}><div style={{width:42,height:42,background:PUL,border:`1px solid ${PUB}`,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 11px"}}><Ic.file size={20} color={PU}/></div><p style={{fontSize:14,fontWeight:700,color:T,marginBottom:2}}>Upload Credentials</p><p style={{fontSize:12,color:TM}}>Contract, staff page, or employment letter</p><div style={{marginTop:14,display:"inline-block",background:PU,color:W,padding:"8px 22px",borderRadius:4,fontSize:12,fontWeight:700}}>Choose File</div></div>:<div style={{background:GL,border:"1px solid #6ee7b7",borderRadius:5,padding:24,textAlign:"center"}}><div style={{width:38,height:38,background:"#d1fae5",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 9px"}}><Ic.check size={18} color={G}/></div><p style={{fontSize:14,fontWeight:700,color:G,marginBottom:2}}>Credentials Uploaded</p><p style={{fontSize:12,color:TM}}>Verified badge within 24 hours.</p></div>}</div>}
      {authErr&&<p style={{fontSize:12,color:"#ef4444",margin:"12px 0 0",lineHeight:1.4}}>{authErr}</p>}
      <div style={{display:"flex",gap:8,marginTop:20}}>{step>0&&<Btn ch="Back" v="g" ac={PU} sx={{flex:1}} onClick={()=>setStep(s=>s-1)}/>}{step<3?<Btn ch="Continue" dis={!ok[step]} ac={PU} sx={{flex:2}} onClick={()=>setStep(s=>s+1)}/>:<Btn ch="Create Coach Account" ac={PU} sx={{flex:2}} onClick={()=>onComplete(f)}/>}</div>
      <p style={{fontSize:12,color:TL,textAlign:"center",marginTop:14}}>Have an account? <span style={{color:PU,fontWeight:600,cursor:"pointer"}} onClick={onSignIn}>Sign in</span></p>
    </div>
  </div>;
}

// ── ATHLETE APP ──
function DarkProfile({user,posts,tapeOrder,setTapeOrder,metricValues,setEditMetric,setSelPost,followers,following,followReqs,accepted,setFollowOpen,setTab,setEditOpen,coachContacts,coachDraft,setCoachDraft,startCoachDraft,saveCoachDraft,cancelCoachDraft,expandedCoachId,toggleCoach,coachEditDraft,setCoachEditDraft,saveCoachEdits,cancelCoachEdits,removeCoachContact}){
  const[ptab,setPtab]=useState("overview");
  const[pfollowing,setPfollowing]=useState(false);
  const[psaved,setPsaved]=useState(false);
  const[shareOpen,setShareOpen]=useState(false);
  const[cpd,setCpd]=useState(false);
  const tape=(tapeOrder||[]).map(id=>posts.find(p=>p.id===id)).filter(Boolean);
  const moveClip=(id,dir)=>{setTapeOrder(o=>{const i=o.indexOf(id);if(dir==="up"&&i>0){const n=[...o];[n[i-1],n[i]]=[n[i],n[i-1]];return n;}if(dir==="dn"&&i<o.length-1){const n=[...o];[n[i],n[i+1]]=[n[i+1],n[i]];return n;}return o;});};
  const[tapeEditorOpen,setTapeEditorOpen]=useState(false);
  const[tapeEditorSel,setTapeEditorSel]=useState(0);
  const[tapePreviewOpen,setTapePreviewOpen]=useState(false);
  const[tapePreviewIdx,setTapePreviewIdx]=useState(-1);
  const[previewProgress,setPreviewProgress]=useState(0);
  const parseDur=d=>{const[m,s]=(d||"0:00").split(":").map(Number);return(m||0)*60+(s||0);};
  const fmtDur=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const totalTapeDur=fmtDur(tape.reduce((sum,c)=>sum+parseDur(c.duration),0));
  const tapeLastUpdated=tape.length?tape.reduce((latest,c)=>c.date>latest?c.date:latest,""):null;
  const tapeSlug=`fasttrackrecruit.com/tape/${(user?.first||"andrew").toLowerCase()}${(user?.last||"johnson").toLowerCase()}`;
  useEffect(()=>{
    if(!tapePreviewOpen)return;
    setPreviewProgress(0);
    const dur=tapePreviewIdx===-1?3000:2500;
    const tick=50;let elapsed=0;
    const iv=setInterval(()=>{
      elapsed+=tick;
      setPreviewProgress(Math.min(100,(elapsed/dur)*100));
      if(elapsed>=dur){
        clearInterval(iv);
        setTapePreviewIdx(i=>{
          const next=i+1;
          if(next>tape.length){setTapePreviewOpen(false);return -1;}
          return next;
        });
      }
    },tick);
    return()=>clearInterval(iv);
  },[tapePreviewOpen,tapePreviewIdx]);
  const qrRef=useRef(null);
  const pUrl=`https://fasttrack.app/u/${(user?.first||"andrew").toLowerCase()}-${(user?.last||"johnson").toLowerCase()}-${user?.gradYear||"2027"}`;
  const copyLink=()=>{navigator.clipboard?.writeText(pUrl);setCpd(true);setTimeout(()=>setCpd(false),2200);};
  const downloadQR=()=>{const c=qrRef.current;if(c){const a=document.createElement("a");a.download=`${user?.first||"profile"}-fasttrack-qr.png`;a.href=c.toDataURL("image/png");a.click();}};
  const shareProfile=()=>{if(navigator.share)navigator.share({title:`${user?.first||"Andrew"} ${user?.last||"Johnson"} — FastTrack`,url:pUrl});else copyLink();};
  const PBG="#0a0a0a",PCARD="#111111",PCARD2="#161616",PBD="#222222",PTXT="#f0f0ee",PTXT2="#888888",PTXT3="#555555",PACC="#D97757",PACC2="#C4622A";
  const pfn=user?.first||"Andrew",pln=user?.last||"Johnson";
  const ppos=(user?.positions||["Center Back (CB)"]).join(", ");
  const psport=user?.sport||"Soccer";
  const PMETRICS=[
    {label:"Height",     value:metricValues["height"]||user?.height||"5'10\"", unit:"",          cat:"Physical"},
    {label:"Weight",     value:metricValues["weight"]||"170",                  unit:"lbs",       cat:"Physical"},
    {label:"Wingspan",   value:metricValues["wing"]||"6ft 1in",               unit:"",          cat:"Physical"},
    {label:"40-Yard",    value:metricValues["40yd"]||"4.68",                  unit:"sec",       cat:"Speed"},
    {label:"Vertical",   value:metricValues["vert"]||"31.5",                  unit:"in",        cat:"Jump"},
    {label:"Bench",      value:metricValues["bench"]||"205",                  unit:"lbs",       cat:"Strength"},
    {label:"Max Speed",  value:metricValues["sprint"]||"21.1",               unit:"mph",       cat:"Sport"},
    {label:"VO2 Max",    value:metricValues["vo2"]||"56.8",                  unit:"ml/kg/min", cat:"Sport"},
  ];
  const PPINNED=["Height","Weight","40-Yard","Vertical","Max Speed","VO2 Max"];
  const ppinned=PPINNED.map(l=>PMETRICS.find(m=>m.label===l)).filter(Boolean);
  const PCLUBS=[
    {years:"2022–Present",name:"NYRB Academy",detail:"NY Red Bulls U18/U16"},
    {years:"2020–2022",   name:"Manhattan SC", detail:"USSDA U15/U16"},
    {years:"2018–2020",   name:"East NY United",detail:"USYS National League"},
  ];
  const PAWARDS=[
    {year:"2026",title:"All-State First Team"},
    {year:"2026",title:"Team Captain — Lincoln HS"},
    {year:"2025",title:"State Semifinalist"},
    {year:"2025",title:"Team MVP"},
    {year:"2024",title:"All-Conference Second Team"},
  ];
  const PCAMPS=[
    {name:"Atlantic 10 Skills Showcase",school:"Fordham",date:"Jun 21, 2026",div:"D1"},
    {name:"Big East Showcase",school:"St. John's",date:"Jun 28, 2026",div:"D1"},
  ];
  const POFFERS=[{school:"Fordham",div:"D1",conf:"Atlantic 10"},{school:"Hofstra",div:"D1",conf:"CAA"}];
  const PDiv=()=><div style={{height:1,background:`linear-gradient(90deg,transparent,${PACC} 30%,${PACC2} 60%,transparent)`,opacity:.35}}/>;
  const PSec=({children,right})=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
      <span style={{fontSize:9,fontWeight:700,color:PTXT3,letterSpacing:1.4,textTransform:"uppercase"}}>{children}</span>
      {right&&<span style={{fontSize:11,fontWeight:600,color:PACC}}>{right}</span>}
    </div>
  );
  return(<>
    <div style={{background:PBG,flex:1,overflowY:"auto"}}>
      <style>{`.pbtn-p{background:#D97757;color:#fff;border:none;border-radius:2px;padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer}.pbtn-s{background:#1a1a1a;color:#ccc;border:1px solid #2a2a2a;border-radius:2px;padding:8px 13px;font-size:12px;font-weight:600;cursor:pointer}.ptab-a{border-bottom:2px solid #D97757;color:#fff;font-weight:700}.ptab-i{border-bottom:2px solid transparent;color:#555;font-weight:700}`}</style>

      {/* HERO */}
      <div style={{position:"relative",background:PCARD}}>
        <div style={{height:56,background:`linear-gradient(135deg,${PBG} 0%,#1a0d08 35%,${PACC2} 70%,${PACC} 100%)`,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 70% 50%,rgba(217,119,87,.15) 0%,transparent 60%)"}}/>
          <div style={{position:"absolute",right:10,top:4,fontSize:44,fontWeight:800,color:"rgba(255,255,255,.05)",lineHeight:1,letterSpacing:-3}}>5</div>
        </div>
        <div style={{position:"absolute",left:16,top:56,transform:"translateY(-50%)",width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,${PACC},${PACC2})`,border:`3px solid ${PCARD}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(217,119,87,.3)",fontSize:18,fontWeight:800,color:"#fff",zIndex:10,letterSpacing:-.5}}>
          {pfn[0]}{pln[0]}
        </div>
      </div>

      <div style={{padding:"36px 16px 0",background:PCARD,borderBottom:`1px solid ${PBD}`}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <span style={{fontSize:20,fontWeight:800,color:PTXT,letterSpacing:-.5}}>{pfn} {pln}</span>
          <span style={{display:"inline-flex",alignItems:"center",gap:3,background:PACC,borderRadius:20,padding:"2px 7px"}}>
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3.5} strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{fontSize:8,fontWeight:700,color:"#fff",letterSpacing:.4}}>VERIFIED</span>
          </span>
        </div>
        <p style={{fontSize:12,fontWeight:700,color:PACC,margin:"0 0 3px"}}>{ppos} · {psport}</p>
        <p style={{fontSize:11,color:PTXT2,margin:"0 0 2px"}}>{user?.school||"Lincoln High School"} · {user?.state||"NY"}</p>
        <p style={{fontSize:11,color:PTXT3,margin:"0 0 8px"}}>{user?.height||"5'10\""} · {user?.weight||"170 lbs"} · {user?.gpa||"3.8"} GPA · Class of {user?.gradYear||"2027"}</p>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:PACC,flexShrink:0}}/>
          <span style={{fontSize:11,fontWeight:600,color:PTXT}}>NYRB Academy</span>
          <span style={{fontSize:10,color:PTXT3}}>2022–Present</span>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <button className="pbtn-p" style={{flex:2}} onClick={()=>setTab("messages")}>Message</button>
          <button className="pbtn-s" style={{flex:1,fontSize:11}} onClick={()=>setShareOpen(true)}>Share</button>
          <button className="pbtn-s" style={{flex:1,fontSize:11}} onClick={()=>setEditOpen(true)}>Edit</button>
        </div>
      </div>

      <Sheet open={shareOpen} onClose={()=>setShareOpen(false)} title="Share Profile" sub={pUrl} ch={<>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <div style={{background:"#ffffff",padding:16,borderRadius:14,boxShadow:"0 2px 16px rgba(0,0,0,.15)"}}>
            <QRCodeCanvas ref={qrRef} value={pUrl} size={180} bgColor="#ffffff" fgColor="#111111" level="M"/>
          </div>
        </div>
        <p style={{fontSize:11,color:TL,textAlign:"center",marginBottom:20,wordBreak:"break-all"}}>{pUrl}</p>
        <div style={{display:"flex",gap:8}}>
          <button onClick={copyLink} style={{flex:1,padding:"11px 0",borderRadius:8,border:`1px solid ${BD}`,background:cpd?BL:GR,color:cpd?B:T,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .15s"}}>
            {cpd?"Copied ✓":"Copy Link"}
          </button>
          <button onClick={downloadQR} style={{flex:1,padding:"11px 0",borderRadius:8,border:`1px solid ${BD}`,background:GR,color:T,fontSize:12,fontWeight:700,cursor:"pointer"}}>
            Download
          </button>
          <button onClick={shareProfile} style={{flex:1,padding:"11px 0",borderRadius:8,border:"none",background:B,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            Share
          </button>
        </div>
      </>}/>

      <div style={{height:8,background:`linear-gradient(180deg,${PCARD},${PBG})`}}/><PDiv/><div style={{height:8,background:`linear-gradient(180deg,${PBG},${PCARD})`}}/>

      {/* HIGHLIGHT TAPE — OVERVIEW */}
      <div style={{background:PCARD,padding:"16px 16px"}}>
        <PSec>Highlight Tape</PSec>
        {tape.length===0?(
          <div style={{border:`1.5px dashed ${PBD}`,borderRadius:8,padding:"32px 16px",textAlign:"center"}}>
            <p style={{fontSize:14,fontWeight:700,color:PTXT2,margin:0,marginBottom:6}}>No clips in your tape yet</p>
            <p style={{fontSize:12,color:PTXT3,margin:0,lineHeight:1.5}}>Post a clip to Media and add it to your tape — your tape is the link coaches open.</p>
          </div>
        ):(
          <>
            {/* Hero thumbnail */}
            <div style={{borderRadius:8,overflow:"hidden",cursor:"pointer",position:"relative",aspectRatio:"16/9",background:"#0d1117",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}} onClick={()=>{setTapePreviewIdx(-1);setTapePreviewOpen(true);}}>
              <div style={{position:"absolute",inset:0,background:`linear-gradient(160deg,${tape[0].thumb||"#1e3a5f"},#0d1117)`}}/>
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.25)"}}/>
              <div style={{position:"relative",width:56,height:56,borderRadius:"50%",background:"rgba(217,119,87,.92)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 28px rgba(217,119,87,.5)"}}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
              </div>
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 14px 12px",background:"linear-gradient(0deg,rgba(0,0,0,.85),transparent)"}}>
                <div style={{fontSize:14,fontWeight:800,color:"#fff",marginBottom:3,letterSpacing:-.2}}>{tape[0].title}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>{totalTapeDur} total · {tape.length} clip{tape.length!==1?"s":""}</div>
              </div>
            </div>
            {/* Last updated */}
            {tapeLastUpdated&&<p style={{fontSize:11,color:PTXT3,margin:"0 0 12px"}}>Last updated {tapeLastUpdated}</p>}
            {/* Action buttons */}
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <button onClick={()=>{setTapePreviewIdx(-1);setTapePreviewOpen(true);}} style={{flex:1,background:"rgba(217,119,87,.12)",border:"1.5px solid rgba(217,119,87,.35)",borderRadius:6,padding:"11px 0",cursor:"pointer",fontSize:12,fontWeight:700,color:PACC}}>Preview Tape</button>
              <button onClick={()=>{setTapeEditorSel(0);setTapeEditorOpen(true);}} style={{flex:1,background:PACC,border:"none",borderRadius:6,padding:"11px 0",cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff"}}>Edit Tape</button>
            </div>
            {/* Shareable link */}
            <div style={{background:"#0d0d0d",border:`1px solid ${PBD}`,borderRadius:6,padding:"10px 12px",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                <span style={{fontSize:11,color:PTXT3,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tapeSlug}</span>
                <button onClick={()=>{navigator.clipboard?.writeText(`https://${tapeSlug}`);}} style={{background:PACC,border:"none",borderRadius:4,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>Copy Link</button>
              </div>
            </div>
            {/* Stats */}
            <div style={{display:"flex",gap:16}}>
              {[["247","Coach Views"],["18","Link Opens"],["412","Total Views"]].map(([v,l])=>(
                <div key={l} style={{textAlign:"center"}}>
                  <p style={{fontSize:16,fontWeight:800,color:PTXT,margin:0,lineHeight:1}}>{v}</p>
                  <p style={{fontSize:9,color:PTXT3,fontWeight:600,margin:"3px 0 0",letterSpacing:.4,textTransform:"uppercase"}}>{l}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{height:8,background:`linear-gradient(180deg,${PCARD},${PBG})`}}/><PDiv/><div style={{height:8,background:`linear-gradient(180deg,${PBG},${PCARD})`}}/>

      {/* SUB TABS */}
      <div style={{background:PCARD,borderBottom:`1px solid ${PBD}`,display:"flex"}}>
        {[["overview","Overview"],["metrics","Metrics"],["media","Media"],["info","Info"]].map(([id,label],i)=>(
          <button key={id} onClick={()=>setPtab(id)} className={ptab===id?"ptab-a":"ptab-i"}
            style={{flex:1,background:"none",border:"none",borderLeft:i>0?`1px solid ${PBD}`:"none",padding:"11px 0",fontSize:11,cursor:"pointer",transition:"all .12s",letterSpacing:.3}}>
            {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {ptab==="overview"&&<>
        <div style={{background:PCARD,padding:"14px 16px"}}>
          <PSec>Club History</PSec>
          {PCLUBS.map((c,i,a)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:i<a.length-1?`1px solid ${PBD}`:"none",alignItems:"flex-start"}}>
              <div style={{width:3,height:3,borderRadius:"50%",background:PACC,flexShrink:0,marginTop:7}}/>
              <span style={{fontSize:10,color:PTXT3,fontWeight:500,flexShrink:0,width:82}}>{c.years}</span>
              <div><div style={{fontSize:12,fontWeight:700,color:PTXT,marginBottom:1}}>{c.name}</div><div style={{fontSize:10,color:PTXT3}}>{c.detail}</div></div>
            </div>
          ))}
        </div>
        <div style={{height:6,background:`linear-gradient(180deg,${PCARD},${PBG})`}}/><PDiv/><div style={{height:6,background:`linear-gradient(180deg,${PBG},${PCARD})`}}/>
        <div style={{background:PCARD,padding:"14px 16px"}}>
          <PSec>Awards & Accomplishments</PSec>
          {PAWARDS.map((aw,i,a)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<a.length-1?`1px solid ${PBD}`:"none"}}>
              <span style={{fontSize:10,color:PTXT3,flexShrink:0,width:30}}>{aw.year}</span>
              <svg width={10} height={10} viewBox="0 0 24 24" fill={PACC}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{fontSize:12,color:PTXT,fontWeight:500}}>{aw.title}</span>
            </div>
          ))}
        </div>
        <div style={{height:6,background:`linear-gradient(180deg,${PCARD},${PBG})`}}/><PDiv/><div style={{height:6,background:`linear-gradient(180deg,${PBG},${PCARD})`}}/>
        <div style={{background:PCARD,padding:"14px 16px"}}>
          <PSec>Camps Attended</PSec>
          {PCAMPS.map((c,i,a)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<a.length-1?`1px solid ${PBD}`:"none"}}>
              <div style={{width:32,height:32,borderRadius:2,background:`linear-gradient(135deg,${PACC},${PACC2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>{c.school[0]}</div>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:PTXT,marginBottom:1}}>{c.name}</div><div style={{fontSize:10,color:PTXT3}}>{c.school} · {c.date}</div></div>
              <span style={{fontSize:9,fontWeight:700,color:PACC,background:"rgba(217,119,87,.12)",border:"1px solid rgba(217,119,87,.25)",padding:"2px 7px",borderRadius:2}}>{c.div}</span>
            </div>
          ))}
        </div>
      </>}

      {/* METRICS */}
      {ptab==="metrics"&&<div style={{background:PCARD,padding:"14px 16px",marginTop:8}}>
        <PSec right={<button onClick={()=>setEditMetric(PMETRICS[0])} style={{background:"transparent",border:`1px solid ${PBD}`,color:PTXT,fontSize:10,fontWeight:800,padding:"5px 10px",borderRadius:2,cursor:"pointer"}}>Edit</button>}>Metrics</PSec>
        {["Physical","Speed","Jump","Strength","Sport"].map(cat=>{
          const ms=PMETRICS.filter(m=>m.cat===cat);
          if(!ms.length)return null;
          return(
            <div key={cat} style={{marginBottom:16}}>
              <div style={{fontSize:8,fontWeight:700,color:PACC,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6,paddingBottom:4,borderBottom:`1px solid ${PBD}`}}>{cat}</div>
              {ms.map((m,i,a)=>(
                <div key={m.label} onClick={()=>setEditMetric(m)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:i<a.length-1?`1px solid ${PBD}`:"none",cursor:"pointer"}}>
                  <span style={{fontSize:12,color:PTXT2,fontWeight:500}}>{m.label}</span>
                  <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                    <span style={{fontSize:14,fontWeight:800,color:PTXT,letterSpacing:-.4}}>{m.value||"—"}</span>
                    {m.value&&m.unit&&<span style={{fontSize:9,color:PTXT3}}>{m.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>}

      {/* MEDIA */}
      {ptab==="media"&&<div style={{background:PBG,paddingTop:2}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2}}>
          {posts.map(p=>{
            const tpos=tapeOrder.indexOf(p.id);
            return(
              <div key={p.id} style={{position:"relative",paddingBottom:"100%",overflow:"hidden",cursor:"pointer",background:PCARD}} onClick={()=>setSelPost(p)}>
                <div style={{position:"absolute",inset:0,background:`linear-gradient(145deg,${p.thumb},#0d1117)`}}/>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(217,119,87,.75)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
                  </div>
                </div>
                <div style={{position:"absolute",bottom:4,right:5}}><span style={{fontSize:8,color:"rgba(255,255,255,.7)",fontWeight:600}}>{p.duration}</span></div>
                <span style={{position:"absolute",top:4,left:4,fontSize:7,fontWeight:700,color:"#fff",background:"rgba(0,0,0,.55)",padding:"1px 4px",borderRadius:2}}>{p.type}</span>
                {tpos>=0&&<span style={{position:"absolute",top:4,right:4,fontSize:7,fontWeight:800,color:"#fff",background:B,padding:"1px 5px",borderRadius:2}}>#{tpos+1}</span>}
              </div>
            );
          })}
        </div>
      </div>}

      {/* INFO */}
      {ptab==="info"&&<>
        <div style={{background:PCARD,padding:"14px 16px",marginTop:8}}>
          <PSec>Contact</PSec>
          <div style={{padding:"9px 0",borderBottom:`1px solid ${PBD}`}}>
            <div style={{fontSize:8,color:PTXT3,textTransform:"uppercase",letterSpacing:.7,marginBottom:2}}>Athlete</div>
            <div style={{fontSize:12,color:PTXT,fontWeight:500}}>{user?.email||"andrew@email.com"}</div>
          </div>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0 8px"}}>
            <div style={{fontSize:8,color:PTXT3,textTransform:"uppercase",letterSpacing:.7,fontWeight:700}}>Coaches</div>
            <button
              onClick={startCoachDraft}
              disabled={!!coachDraft}
              style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${PBD}`,color:PTXT,fontSize:10,fontWeight:700,padding:"6px 10px",borderRadius:2,cursor:coachDraft?"not-allowed":"pointer",opacity:coachDraft?.55:1}}
            >
              <Ic.plus size={12} color={PTXT}/>
              Add
            </button>
          </div>

          {!coachContacts?.length && !coachDraft && (
            <div style={{fontSize:11,color:PTXT3,marginBottom:6,lineHeight:1.5}}>
              Optional — add your current coaches (club, academy, high school).
            </div>
          )}

          {coachDraft && (()=>{
            const d=coachDraft;
            const canSave=!!d.name?.trim() && !!d.team?.trim() && !!d.email?.trim();
            const InSx={padding:"8px 10px",borderRadius:8,fontSize:12};
            const Lbl={fontSize:10,fontWeight:700,color:PTXT3,textTransform:"uppercase",letterSpacing:.6,marginBottom:6};
            return (
              <div style={{borderTop:`1px solid ${PBD}`,paddingTop:10,marginTop:2}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:800,color:PTXT}}>New coach</div>
                  <button onClick={cancelCoachDraft} style={{background:"transparent",border:"none",color:PTXT3,fontSize:11,fontWeight:800,cursor:"pointer",padding:0}}>Cancel</button>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={Lbl}>Name</div>
                  <FIn style={InSx} placeholder="Coach name" value={d.name||""} onChange={e=>setCoachDraft(p=>({...p,name:e.target.value}))}/>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={Lbl}>Team / Program</div>
                  <FIn style={InSx} placeholder="e.g. NYRB Academy" value={d.team||""} onChange={e=>setCoachDraft(p=>({...p,team:e.target.value}))}/>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={Lbl}>Role (optional)</div>
                  <FIn style={InSx} placeholder="e.g. Head Coach" value={d.role||""} onChange={e=>setCoachDraft(p=>({...p,role:e.target.value}))}/>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={Lbl}>Email</div>
                  <FIn style={InSx} placeholder="coach@email.com" value={d.email||""} onChange={e=>setCoachDraft(p=>({...p,email:e.target.value}))}/>
                </div>
                <Btn ch="Save coach" full dis={!canSave} sm onClick={saveCoachDraft}/>
              </div>
            );
          })()}

          {(coachContacts||[]).map((c,idx)=>{
            const open=expandedCoachId===c.id;
            const title=c.name?.trim()||`Coach ${idx+1}`;
            const sub=[c.team?.trim(),c.role?.trim()].filter(Boolean).join(" · ");
            return (
              <div key={c.id} style={{borderTop:`1px solid ${PBD}`}}>
                <button
                  onClick={()=>toggleCoach(c.id)}
                  style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 0",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}
                >
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:PTXT}}>{title}</div>
                    {sub && <div style={{fontSize:10,color:PTXT3,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sub}</div>}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 10 10" fill="none" style={{transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform .15s"}}>
                    <path d="M2 3.5L5 6.5L8 3.5" stroke={PTXT3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {open && (
                  <div style={{padding:"8px 0 12px"}}>
                    {(()=>{
                      const d=coachEditDraft||c;
                      const isEditing=coachEditDraft?.id===c.id;
                      const canSave=!!d.name?.trim() && !!d.team?.trim() && !!d.email?.trim();
                      const InSx={padding:"8px 10px",borderRadius:8,fontSize:12};
                      const Lbl={fontSize:10,fontWeight:700,color:PTXT3,textTransform:"uppercase",letterSpacing:.6,marginBottom:6};
                      return (
                        <>
                          <div style={{marginBottom:10}}>
                            <div style={Lbl}>Name</div>
                            <FIn style={InSx} placeholder="Coach name" value={d.name||""} onChange={e=>setCoachEditDraft(p=>({...p,id:c.id,name:e.target.value,team:d.team||"",role:d.role||"",email:d.email||""}))}/>
                          </div>
                          <div style={{marginBottom:10}}>
                            <div style={Lbl}>Team / Program</div>
                            <FIn style={InSx} placeholder="e.g. NYRB Academy" value={d.team||""} onChange={e=>setCoachEditDraft(p=>({...p,id:c.id,name:d.name||"",team:e.target.value,role:d.role||"",email:d.email||""}))}/>
                          </div>
                          <div style={{marginBottom:10}}>
                            <div style={Lbl}>Role (optional)</div>
                            <FIn style={InSx} placeholder="e.g. Head Coach" value={d.role||""} onChange={e=>setCoachEditDraft(p=>({...p,id:c.id,name:d.name||"",team:d.team||"",role:e.target.value,email:d.email||""}))}/>
                          </div>
                          <div style={{marginBottom:12}}>
                            <div style={Lbl}>Email</div>
                            <FIn style={InSx} placeholder="coach@email.com" value={d.email||""} onChange={e=>setCoachEditDraft(p=>({...p,id:c.id,name:d.name||"",team:d.team||"",role:d.role||"",email:e.target.value}))}/>
                          </div>
                          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
                            <Btn ch="Save changes" sm dis={!canSave || !isEditing} onClick={()=>saveCoachEdits(c.id)}/>
                            <button onClick={cancelCoachEdits} style={{background:"transparent",border:`1px solid ${PBD}`,color:PTXT,fontSize:11,fontWeight:800,padding:"7px 10px",borderRadius:2,cursor:"pointer"}}>Cancel</button>
                          </div>
                        </>
                      );
                    })()}
                    <button
                      onClick={()=>removeCoachContact(c.id)}
                      style={{background:"rgba(239,68,68,.12)",border:`1px solid rgba(239,68,68,.3)`,color:"#fca5a5",fontSize:11,fontWeight:800,padding:"8px 10px",borderRadius:2,cursor:"pointer"}}
                    >
                      Remove coach
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{height:6,background:`linear-gradient(180deg,${PCARD},${PBG})`}}/><PDiv/><div style={{height:6,background:`linear-gradient(180deg,${PBG},${PCARD})`}}/>
        <div style={{background:PCARD,padding:"14px 16px"}}>
          <PSec>Academics</PSec>
          {[["GPA",user?.gpa||"3.8"],["Grad Year",user?.gradYear||"2027"],["Major","Sports Management"],["NCAA Status","Eligible"],["Preferred Division","D1 Target"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${PBD}`}}>
              <span style={{fontSize:12,color:PTXT2}}>{l}</span>
              <span style={{fontSize:12,fontWeight:700,color:PTXT}}>{v}</span>
            </div>
          ))}
        </div>
      </>}
    </div>
    {/* ── SCREEN 2: TAPE EDITOR ── */}
    {tapeEditorOpen&&<div style={{position:"fixed",inset:0,background:"#050505",zIndex:450,display:"flex",flexDirection:"column"}}>
      <div style={{width:"100%",maxWidth:430,margin:"0 auto",height:"100%",display:"flex",flexDirection:"column"}}>
        {/* Top bar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",flexShrink:0,borderBottom:"1px solid #1a1a1a"}}>
          <button onClick={()=>setTapeEditorOpen(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:PTXT2,padding:0}}>← Back</button>
          <span style={{fontSize:13,fontWeight:800,color:PTXT,letterSpacing:.5}}>TAPE EDITOR</span>
          <button onClick={()=>{setTapeEditorOpen(false);}} style={{background:PACC,border:"none",borderRadius:5,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff"}}>Save Tape</button>
        </div>
        {/* Preview window */}
        {tape.length>0&&(()=>{const sel=tape[Math.min(tapeEditorSel,tape.length-1)]||tape[0];return(
          <div style={{flexShrink:0,padding:"16px 16px 0"}}>
            <div style={{borderRadius:8,overflow:"hidden",position:"relative",aspectRatio:"16/9",background:"#0d1117",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:10}} onClick={()=>{}}>
              <div style={{position:"absolute",inset:0,background:`linear-gradient(160deg,${sel.thumb||"#1e3a5f"},#0d1117)`}}/>
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.3)"}}/>
              <div style={{position:"relative",width:44,height:44,borderRadius:"50%",background:"rgba(217,119,87,.9)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(217,119,87,.4)"}}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
              </div>
              <span style={{position:"absolute",top:8,left:8,fontSize:9,fontWeight:700,color:"rgba(255,255,255,.6)",background:"rgba(0,0,0,.5)",padding:"2px 6px",borderRadius:3}}>{sel.type}</span>
            </div>
            <p style={{fontSize:13,fontWeight:700,color:PTXT,margin:"0 0 2px"}}>{sel.title}</p>
            <p style={{fontSize:11,color:PTXT3,margin:"0 0 10px"}}>{sel.duration}</p>
            {/* Scrubber */}
            <div style={{marginBottom:6,position:"relative",height:3,background:"#222",borderRadius:2}}>
              <div style={{position:"absolute",left:0,top:0,height:"100%",width:"35%",background:PACC,borderRadius:2}}/>
              <div style={{position:"absolute",left:"35%",top:"50%",transform:"translate(-50%,-50%)",width:10,height:10,borderRadius:"50%",background:PACC,boxShadow:`0 0 6px ${PACC}`}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <span style={{fontSize:9,color:PTXT3}}>0:00</span>
              <span style={{fontSize:9,color:PTXT3}}>{sel.duration}</span>
            </div>
            {/* Trim handles */}
            <div style={{position:"relative",height:28,background:"#111",borderRadius:4,border:"1px solid #222",marginBottom:12,display:"flex",alignItems:"center",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:16,background:PACC,borderRadius:"4px 0 0 4px",cursor:"ew-resize",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={6} height={12} viewBox="0 0 6 12" fill="none"><line x1={2} y1={1} x2={2} y2={11} stroke="#fff" strokeWidth={1.5}/><line x1={4} y1={1} x2={4} y2={11} stroke="#fff" strokeWidth={1.5}/></svg>
              </div>
              <div style={{flex:1,height:4,margin:"0 18px",background:"#333",borderRadius:2}}>
                <div style={{height:"100%",width:"80%",background:"#444",borderRadius:2}}/>
              </div>
              <div style={{position:"absolute",right:0,top:0,bottom:0,width:16,background:PACC,borderRadius:"0 4px 4px 0",cursor:"ew-resize",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={6} height={12} viewBox="0 0 6 12" fill="none"><line x1={2} y1={1} x2={2} y2={11} stroke="#fff" strokeWidth={1.5}/><line x1={4} y1={1} x2={4} y2={11} stroke="#fff" strokeWidth={1.5}/></svg>
              </div>
            </div>
          </div>
        );})()}
        {/* Timeline */}
        <div style={{flex:1,overflowY:"auto",padding:"0 16px"}}>
          <p style={{fontSize:9,fontWeight:700,color:PTXT3,letterSpacing:1.2,textTransform:"uppercase",marginBottom:8}}>Timeline — tap to select, use arrows to reorder</p>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8}}>
            {tape.map((c,i)=>{const isSel=tapeEditorSel===i;return(
              <div key={c.id} onClick={()=>setTapeEditorSel(i)} style={{flexShrink:0,width:72,cursor:"pointer"}}>
                <div style={{position:"relative",width:72,height:72,borderRadius:6,overflow:"hidden",border:isSel?`2px solid ${PACC}`:"2px solid transparent",boxShadow:isSel?`0 0 12px rgba(217,119,87,.5)`:"none",transition:"all .15s"}}>
                  <div style={{position:"absolute",inset:0,background:`linear-gradient(145deg,${c.thumb},#0d1117)`}}/>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="rgba(255,255,255,.7)"><polygon points="5 3 19 12 5 21"/></svg>
                  </div>
                  <span style={{position:"absolute",bottom:3,right:3,fontSize:7,fontWeight:800,color:"rgba(255,255,255,.8)",background:"rgba(0,0,0,.6)",padding:"1px 4px",borderRadius:2}}>{c.duration}</span>
                  <button onClick={e=>{e.stopPropagation();setTapeOrder(o=>o.filter(id=>id!==c.id));if(tapeEditorSel>=tape.length-1)setTapeEditorSel(Math.max(0,tape.length-2));}} style={{position:"absolute",top:2,right:2,width:14,height:14,borderRadius:"50%",background:"rgba(0,0,0,.7)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
                    <svg width={7} height={7} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>
                  </button>
                </div>
                <p style={{fontSize:9,color:isSel?PACC:PTXT3,fontWeight:isSel?700:400,margin:"4px 0 0",textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>#{i+1}</p>
              </div>
            );})}
            {/* Add button */}
            <div style={{flexShrink:0,width:72,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}} onClick={()=>{}}>
              <div style={{width:72,height:72,borderRadius:6,border:`1.5px dashed #333`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={PTXT3} strokeWidth={2}><line x1={12} y1={5} x2={12} y2={19}/><line x1={5} y1={12} x2={19} y2={12}/></svg>
              </div>
              <p style={{fontSize:9,color:PTXT3,margin:0}}>Add</p>
            </div>
          </div>
        </div>
        {/* Bottom action bar */}
        <div style={{flexShrink:0,borderTop:"1px solid #1a1a1a",padding:"10px 16px",display:"flex",gap:8}}>
          <button disabled={tapeEditorSel===0||tape.length===0} onClick={()=>{if(tape[tapeEditorSel])moveClip(tape[tapeEditorSel].id,"up");setTapeEditorSel(s=>Math.max(0,s-1));}} style={{flex:1,background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:6,padding:"9px 0",cursor:tapeEditorSel===0?"default":"pointer",fontSize:12,fontWeight:700,color:tapeEditorSel===0?PTXT3:PTXT,opacity:tapeEditorSel===0?.4:1}}>← Move</button>
          <button disabled={tape.length===0} onClick={()=>{if(tape[tapeEditorSel]){setTapeOrder(o=>o.filter(id=>id!==tape[tapeEditorSel].id));if(tapeEditorSel>=tape.length-1)setTapeEditorSel(Math.max(0,tape.length-2));}}} style={{flex:1,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",borderRadius:6,padding:"9px 0",cursor:"pointer",fontSize:12,fontWeight:700,color:"#fca5a5"}}>Remove</button>
          <button disabled={tapeEditorSel>=tape.length-1||tape.length===0} onClick={()=>{if(tape[tapeEditorSel])moveClip(tape[tapeEditorSel].id,"dn");setTapeEditorSel(s=>Math.min(tape.length-1,s+1));}} style={{flex:1,background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:6,padding:"9px 0",cursor:tapeEditorSel>=tape.length-1?"default":"pointer",fontSize:12,fontWeight:700,color:tapeEditorSel>=tape.length-1?PTXT3:PTXT,opacity:tapeEditorSel>=tape.length-1?.4:1}}>Move →</button>
          <button onClick={()=>{setTapePreviewIdx(-1);setTapePreviewOpen(true);}} style={{flex:1,background:"rgba(217,119,87,.15)",border:"1px solid rgba(217,119,87,.3)",borderRadius:6,padding:"9px 0",cursor:"pointer",fontSize:12,fontWeight:700,color:PACC}}>Preview</button>
        </div>
      </div>
    </div>}

    {/* ── SCREEN 3: FULL PREVIEW ── */}
    {tapePreviewOpen&&<div style={{position:"fixed",inset:0,background:"#000",zIndex:460,display:"flex",flexDirection:"column"}} onClick={()=>setTapePreviewIdx(i=>i+1)}>
      <div style={{width:"100%",maxWidth:430,margin:"0 auto",height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
        {/* Progress bar */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"rgba(255,255,255,.15)",zIndex:2}}>
          <div style={{height:"100%",width:`${previewProgress}%`,background:PACC,transition:"width .05s linear"}}/>
        </div>
        {/* Close button */}
        <button onClick={e=>{e.stopPropagation();setTapePreviewOpen(false);setTapePreviewIdx(-1);}} style={{position:"absolute",top:16,right:16,zIndex:3,background:"rgba(0,0,0,.6)",border:"1px solid rgba(255,255,255,.2)",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.8)"}}>✕ Close</button>
        {/* INTRO CARD */}
        {tapePreviewIdx===-1&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",background:"radial-gradient(ellipse at center,#1a0d08 0%,#050505 70%)"}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${PACC},${PACC2})`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,boxShadow:`0 0 40px rgba(217,119,87,.4)`}}>
              <span style={{fontSize:24,fontWeight:800,color:"#fff"}}>{(user?.first||"A")[0]}{(user?.last||"J")[0]}</span>
            </div>
            <p style={{fontSize:28,fontWeight:900,color:"#fff",margin:"0 0 6px",letterSpacing:-.5,textAlign:"center"}}>{user?.first||"Andrew"} {user?.last||"Johnson"}</p>
            <p style={{fontSize:15,color:PACC,fontWeight:700,margin:"0 0 4px",textAlign:"center"}}>{(user?.positions||["Center Back (CB)"]).join(", ")}</p>
            <p style={{fontSize:13,color:"rgba(255,255,255,.5)",margin:"0 0 24px",textAlign:"center"}}>Class of {user?.gradYear||"2027"} · {user?.school||"Lincoln High School"}, {user?.state||"NY"}</p>
            <div style={{height:1,width:60,background:`rgba(217,119,87,.4)`,marginBottom:16}}/>
            <p style={{fontSize:10,color:"rgba(255,255,255,.3)",letterSpacing:.6}}>{tapeSlug}</p>
          </div>
        )}
        {/* CLIP CARD */}
        {tapePreviewIdx>=0&&tapePreviewIdx<tape.length&&(()=>{const c=tape[tapePreviewIdx];return(
          <div style={{flex:1,position:"relative",display:"flex",flexDirection:"column"}}>
            <div style={{flex:1,background:`linear-gradient(160deg,${c.thumb||"#1e3a5f"},#000)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(217,119,87,.9)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 30px rgba(217,119,87,.5)`}}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
              </div>
            </div>
            <div style={{position:"absolute",top:20,left:16,background:"rgba(0,0,0,.65)",borderRadius:4,padding:"4px 10px"}}>
              <span style={{fontSize:10,fontWeight:800,color:PACC,letterSpacing:.8,textTransform:"uppercase"}}>{c.type}</span>
            </div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"30px 16px 20px",background:"linear-gradient(0deg,rgba(0,0,0,.9),transparent)"}}>
              <p style={{fontSize:10,color:"rgba(255,255,255,.4)",margin:"0 0 4px"}}>Clip {tapePreviewIdx+1} of {tape.length}</p>
              <p style={{fontSize:15,fontWeight:700,color:"#fff",margin:0}}>{c.title} · {c.duration}</p>
            </div>
          </div>
        );})()}
        {/* END CARD */}
        {tapePreviewIdx===tape.length&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",background:"radial-gradient(ellipse at center,#1a0d08 0%,#050505 70%)"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,${PACC},${PACC2})`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,boxShadow:`0 0 32px rgba(217,119,87,.4)`}}>
              <span style={{fontSize:20,fontWeight:800,color:"#fff"}}>{(user?.first||"A")[0]}{(user?.last||"J")[0]}</span>
            </div>
            <p style={{fontSize:22,fontWeight:900,color:"#fff",margin:"0 0 4px",letterSpacing:-.3,textAlign:"center"}}>{user?.first||"Andrew"} {user?.last||"Johnson"}</p>
            <p style={{fontSize:13,color:"rgba(255,255,255,.5)",margin:"0 0 24px",textAlign:"center"}}>{(user?.positions||["Center Back (CB)"]).join(", ")} · Class of {user?.gradYear||"2027"}</p>
            <div style={{display:"flex",gap:10,marginBottom:20}}>
              <button onClick={e=>e.stopPropagation()} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",borderRadius:6,padding:"10px 22px",cursor:"pointer",fontSize:13,fontWeight:700,color:"#fff"}}>Follow</button>
              <button onClick={e=>e.stopPropagation()} style={{background:PACC,border:"none",borderRadius:6,padding:"10px 22px",cursor:"pointer",fontSize:13,fontWeight:700,color:"#fff"}}>Message</button>
            </div>
            <button onClick={e=>{e.stopPropagation();setTapePreviewOpen(false);setTapePreviewIdx(-1);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:PACC}}>View Full Profile →</button>
          </div>
        )}
      </div>
    </div>}
  </>);
}

function AthleteApp({user=null}){
  useEffect(()=>{
    // #region agent log
    fetch('http://127.0.0.1:7282/ingest/8e43e297-ecf0-462e-bc78-418cef0f1596',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'edb537'},body:JSON.stringify({sessionId:'edb537',location:'App.jsx:AthleteApp mount',message:'AthleteApp rendered',data:{hasUser:!!user,role:user?.role??null},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
  },[user]);
  const[tab,setTab]=useState("profile");
  const[notif,setNotif]=useState(null);
  const[search,setSearch]=useState("");
  const[divF,setDivF]=useState("All");const[confF,setConfF]=useState("All");const[stateF,setStateF]=useState("All");
  const[selSch,setSelSch]=useState(null);
  const[schView,setSchView]=useState("schools");
  const[campSrch,setCampSrch]=useState("");
  const[campDiv,setCampDiv]=useState("All");
  const[campConf,setCampConf]=useState("All");
  const[campState,setCampState]=useState("All");
  const[pip,setPip]=useState({interested:[],emailed:[],viewed:[],replied:[],camped:[],offer:[],committed:[]});
  const[cReqs,setCReqs]=useState([104,106]);
  const[copied,setCopied]=useState(null);
  const[editOpen,setEditOpen]=useState(false);
  const[posts,setPosts]=useState(FILM_POSTS);
  const[selPost,setSelPost]=useState(null);
  const[postOpen,setPostOpen]=useState(false);
  const[newPost,setNewPost]=useState({title:"",desc:"",type:"Highlight"});
  const[tapeOrder,setTapeOrder]=useState(()=>FILM_POSTS.map(p=>p.id));
  const[postPhase,setPostPhase]=useState("form");
  const[pendingPostId,setPendingPostId]=useState(null);
  const[linkCopied,setLinkCopied]=useState(false);const[settingsOpen,setSettingsOpen]=useState(false);const[selCamp,setSelCamp]=useState(null);
  const[viewedThreads,setViewedThreads]=useState({1:true,2:true});// thread ids coach has opened
  const[moveOpen,setMoveOpen]=useState(null);
  const[metricsOpen,setMetricsOpen]=useState(true);
  const[metCats,setMetCats]=useState({});
  const[verifyModal,setVerifyModal]=useState(null);
  const[metricValues,setMetricValues]=useState({});
  const[editMetric,setEditMetric]=useState(null);
  const[customMetrics,setCustomMetrics]=useState([]);
  const[addMetricOpen,setAddMetricOpen]=useState(false);
  const[newMetric,setNewMetric]=useState({label:"",value:"",unit:""});
  const[followers]=useState(247);
  const[following]=useState(89);
  const[followOpen,setFollowOpen]=useState(false);
  const[followReqs]=useState([
    {id:1,name:"Darius Cole",school:"Oak Hill Academy",sport:"Basketball",mutual:false},
    {id:2,name:"Caleb Rivers",school:"Rice HS",sport:"Basketball",mutual:true},
    {id:3,name:"Isaiah Torres",school:"Paul VI HS",sport:"Football",mutual:false},
    {id:4,name:"Amir Wallace",school:"Don Bosco Prep",sport:"Soccer",mutual:true},
  ]);
  const[accepted,setAccepted]=useState([]);
  const[nmo,setNmo]=useState(false);
  const[nmSch,setNmSch]=useState(null);
  const[nmTxt,setNmTxt]=useState("");
  const[aiOpen,setAiOpen]=useState(false);
  const[aiBroadcast,setAiBroadcast]=useState(false);
  const[aiSch,setAiSch]=useState(null);
  const[aiBcList,setAiBcList]=useState([]);
  const[aiCtx,setAiCtx]=useState("");
  const[aiStep,setAiStep]=useState(0);
  const[aiDrafts,setAiDrafts]=useState([]);
  const[aiEditIdx,setAiEditIdx]=useState(null);
  const[aiSavedOnly,setAiSavedOnly]=useState(false);
  const msg=useMsgs(SA);
  const[gender,setGender]=useState(()=>localStorage.getItem("ft_gender")||"");
  const COACH_CONTACTS_KEY="ft_coach_contacts";
  const[coachContacts,setCoachContacts]=useState(()=>{
    try{
      const raw=localStorage.getItem(COACH_CONTACTS_KEY);
      const parsed=raw?JSON.parse(raw):[];
      if(!Array.isArray(parsed))return [];
      return parsed
        .filter(Boolean)
        .map(c=>({id:c?.id??Date.now(),name:c?.name||"",team:c?.team||"",role:c?.role||"",email:c?.email||""}));
    }catch{return [];}
  });
  const[expandedCoachId,setExpandedCoachId]=useState(null);
  const[coachDraft,setCoachDraft]=useState(null);
  const[coachEditDraft,setCoachEditDraft]=useState(null);
  const[schools,setSchools]=useState([]);
  const[schoolsLoading,setSchoolsLoading]=useState(true);
  const persistCoachContacts=next=>{try{localStorage.setItem(COACH_CONTACTS_KEY,JSON.stringify(next||[]));}catch{}};
  useEffect(()=>{
    if(!gender){setSchools([]);setSchoolsLoading(false);return;}
    setSchoolsLoading(true);
    const table=gender==="man"?"mens_programs":"womens_programs";
    supabase.from(table).select("*").order("school_name").then(({data,error})=>{
      if(data)setSchools(data.map(s=>({id:s.id,name:s.school_name,div:s.division,conf:normConf(s.conference),state:s.state,athletics_url:s.athletics_url||"",coach:"",email:"",camps:[]})));
      setSchoolsLoading(false);
    });
  },[gender]);
  const notify=m=>{setNotif(m);setTimeout(()=>setNotif(null),3e3);};
  const startCoachDraft=()=>{
    if(coachDraft)return;
    setCoachDraft({id:Date.now(),name:"",team:"",role:"",email:""});
    setExpandedCoachId(null);
    setCoachEditDraft(null);
  };
  const cancelCoachDraft=()=>setCoachDraft(null);
  const saveCoachDraft=()=>{
    if(!coachDraft)return;
    const d={...coachDraft,name:(coachDraft.name||"").trim(),team:(coachDraft.team||"").trim(),role:(coachDraft.role||"").trim(),email:(coachDraft.email||"").trim()};
    if(!d.name||!d.team||!d.email){notify("Add name, team, and email");return;}
    setCoachContacts(cs=>{
      const next=[...(cs||[]),d];
      persistCoachContacts(next);
      return next;
    });
    setCoachDraft(null);
    notify("Coach saved");
  };
  const toggleCoach=id=>{
    setExpandedCoachId(cur=>{
      const next=cur===id?null:id;
      if(next){
        const c=coachContacts.find(x=>x.id===id);
        if(c)setCoachEditDraft({...c});
      }else{
        setCoachEditDraft(null);
      }
      return next;
    });
  };
  const cancelCoachEdits=()=>{
    setCoachEditDraft(null);
    setExpandedCoachId(null);
  };
  const saveCoachEdits=id=>{
    const d=coachEditDraft;
    if(!d||d.id!==id)return;
    const nextCoach={...d,name:(d.name||"").trim(),team:(d.team||"").trim(),role:(d.role||"").trim(),email:(d.email||"").trim()};
    if(!nextCoach.name||!nextCoach.team||!nextCoach.email){notify("Add name, team, and email");return;}
    setCoachContacts(cs=>{
      const next=(cs||[]).map(c=>c.id===id?nextCoach:c);
      persistCoachContacts(next);
      return next;
    });
    notify("Coach updated");
  };
  const removeCoachContact=id=>{
    setCoachContacts(cs=>{
      const next=(cs||[]).filter(c=>c.id!==id);
      persistCoachContacts(next);
      return next;
    });
    setExpandedCoachId(cur=>cur===id?null:cur);
    setCoachEditDraft(cur=>cur?.id===id?null:cur);
    notify("Coach removed");
  };
  // Auto-advance: when athlete opens a thread where coach has replied → move to Replied
  // When athlete opens any thread → move to Viewed (coach opened email sim)
  const openThread=t=>{
    msg.open(t);
    const sch=schools.find(s=>s.id===t.schoolId);
    if(!sch)return;
    const hasCoachReply=t.msgs.some(m=>m.from==="coach");
    if(hasCoachReply){advanceTo(sch,"replied");}
    else{advanceTo(sch,"viewed");}
  };
  const allT=Object.values(pip).flat();
  const inP=id=>allT.find(s=>s.id===id);
  const save=s=>{if(inP(s.id)){notify("Already in tracker");return;}setPip(p=>({...p,interested:[...p.interested,s]}));notify(`${s.name} saved`);};
  const STAGE_ORDER=["interested","emailed","viewed","replied","camped","offer","committed"];
  const advanceTo=(s,targetStage)=>{
    const existing=inP(s.id);
    if(!existing){setPip(p=>({...p,[targetStage]:[...p[targetStage],s]}));return;}
    // Find current stage
    const curStage=STAGE_ORDER.find(id=>pip[id]?.find(x=>x.id===s.id));
    if(!curStage)return;
    const curIdx=STAGE_ORDER.indexOf(curStage);
    const targetIdx=STAGE_ORDER.indexOf(targetStage);
    if(targetIdx>curIdx){
      // Remove from current, place in target
      setPip(p=>({...p,[curStage]:p[curStage].filter(x=>x.id!==s.id),[targetStage]:[...p[targetStage],s]}));
    }
  };
  const addTo=(s,st)=>advanceTo(s,st);
  const copyE=(e,id)=>{navigator.clipboard?.writeText(e).catch(()=>{});setCopied(id);setTimeout(()=>setCopied(null),2500);notify("Email copied");const s=schools.find(x=>x.id===id);if(s)advanceTo(s,"emailed");};
  const reqCamp=(cid,sch)=>{if(cReqs.includes(cid))return;setCReqs(r=>[...r,cid]);advanceTo(sch,"camped");notify(`Spot requested — ${sch.name} will see your profile`);};
  const moveSt=(sch,from,to)=>{setPip(p=>({...p,[from]:p[from].filter(x=>x.id!==sch.id),[to]:[...p[to],sch]}));setMoveOpen(null);notify(`Moved to ${STG.find(s=>s.id===to).label}`);};
  const resetAi=()=>{setAiOpen(false);setAiBroadcast(false);setAiSch(null);setAiBcList([]);setAiCtx("");setAiStep(0);setAiDrafts([]);setAiEditIdx(null);setAiSavedOnly(false);};
  const genDraft=(sch,u,ctx)=>{
    const coachFirst=(sch.coach||"Coach").split(" ")[0];
    const coachLast=(sch.coach||"Coach").split(" ").slice(-1)[0];
    const pos=(u?.positions||["athlete"])[0];
    const ctxPara=ctx?.trim()||`I have been following your program closely and am impressed by the culture and development your coaching staff provides to student-athletes.`;
    return `Dear Coach ${coachFirst},\n\nMy name is ${u?.first||"Andrew"} ${u?.last||"Johnson"}, a Class of ${u?.gradYear||"2027"} ${pos} from ${u?.school||"Lincoln High School"}, ${u?.state||"NY"}. I'm reaching out because I'm very interested in ${sch.name}'s ${sch.div} program.\n\n${ctxPara}\n\nI'd love the opportunity to learn more about your program and explore how I might be a fit. I've included my recruiting profile for your review.\n\nThank you for your time, Coach ${coachLast}.\n\n${u?.first||"Andrew"} ${u?.last||"Johnson"}\nClass of ${u?.gradYear||"2027"} | ${pos} | ${u?.school||"Lincoln High School"}`;
  };
  const launchAI=()=>{
    const ids=aiBroadcast?aiBcList:[aiSch];
    if(!ids.length||ids.some(id=>!id)){notify(aiBroadcast?"Select at least one school":"Select a school");return;}
    setAiStep(1);
    setTimeout(()=>{
      setAiDrafts(ids.map(id=>({schoolId:id,text:genDraft(schools.find(s=>s.id===id),user,aiCtx)})));
      setAiStep(2);
    },aiBroadcast?2000:1500);
  };
  const sendAiDrafts=()=>{
    const now=new Date();
    const ts=`${now.toLocaleDateString("en-US",{month:"short",day:"numeric"})}, ${now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}`;
    const draftsSnap=[...aiDrafts];
    draftsSnap.forEach(({schoolId,text})=>{
      const sch=schools.find(s=>s.id===schoolId);if(!sch)return;
      const m={id:Date.now()+schoolId,from:"athlete",text,time:ts};
      const ex=msg.threads.find(t=>t.schoolId===sch.id);
      if(ex){msg.setT(ts=>ts.map(t=>t.id===ex.id?{...t,msgs:[...t.msgs,m]}:t));}
      else{const t={id:Date.now()+schoolId,schoolId:sch.id,cName:sch.coach||sch.name,school:sch.name,cEmail:sch.email||"",unread:0,msgs:[m]};msg.setT(ts=>[t,...ts]);}
      if(!inP(sch.id))addTo(sch,"emailed");
    });
    const count=draftsSnap.length;
    const firstName=schools.find(s=>s.id===draftsSnap[0]?.schoolId)?.coach||"coach";
    resetAi();setTab("messages");
    notify(count===1?`Sent to ${firstName}`:`Sent to ${count} coaches`);
  };
  const startMsg=()=>{
    if(!nmSch||!nmTxt.trim())return;
    const sch=schools.find(s=>s.id===nmSch);const ex=msg.threads.find(t=>t.schoolId===sch.id);
    const now=new Date();const ts=`${now.toLocaleDateString("en-US",{month:"short",day:"numeric"})}, ${now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}`;
    const m={id:Date.now(),from:"athlete",text:nmTxt.trim(),time:ts};
    if(ex){msg.setT(ts=>ts.map(t=>t.id===ex.id?{...t,msgs:[...t.msgs,m]}:t));msg.setA({...ex,msgs:[...ex.msgs,m]});}
    else{const t={id:Date.now(),schoolId:sch.id,cName:sch.coach,school:sch.name,cEmail:sch.email,unread:0,msgs:[m]};msg.setT(ts=>[t,...ts]);msg.setA(t);if(!inP(sch.id))addTo(sch,"emailed");}
    setNmo(false);setNmSch(null);setNmTxt("");setTab("messages");notify(`Sent to ${sch.coach}`);
    // Simulate: coach opens email ~30s later in demo
    const newId=ex?ex.id:Date.now();setTimeout(()=>setViewedThreads(v=>({...v,[newId]:true})),8000);
  };
  const filteredByDiv=divF==="All"?schools:schools.filter(s=>s.div===divF);
  const confs=["All",...new Set(filteredByDiv.map(s=>s.conf))].filter(Boolean).sort();
  const filteredByDivConf=filteredByDiv.filter(s=>confF==="All"||s.conf===confF);
  const states=["All",...new Set(filteredByDivConf.map(s=>s.state))].filter(Boolean).sort();
  const fil=schools.filter(s=>{const q=search.toLowerCase();return(!q||[s.name,s.state,s.conf].some(v=>v&&v.toLowerCase().includes(q)))&&(divF==="All"||s.div===divF)&&(confF==="All"||s.conf===confF)&&(stateF==="All"||s.state===stateF);});
  const campConfs=["All",...new Set(schools.filter(s=>s.camps.length>0).map(s=>s.conf))].filter(Boolean);
  const campStates=["All",...new Set(schools.filter(s=>s.camps.length>0).map(s=>s.state)).values()].filter(Boolean).sort();
  const allCamps=schools.flatMap(sch=>sch.camps.map(c=>({c,sch}))).filter(({c,sch})=>{const q=campSrch.toLowerCase();return(!q||[c.title,sch.name,c.loc].some(v=>v&&v.toLowerCase().includes(q)))&&(campDiv==="All"||sch.div===campDiv)&&(campConf==="All"||sch.conf===campConf)&&(campState==="All"||sch.state===campState);});
  const tT=allT.length,tE=[pip.emailed,pip.viewed||[],pip.replied,pip.camped,pip.offer].flat().length,tC=cReqs.length,tO=pip.offer.length;
  const fn=user?.first||"Marcus",ln=user?.last||"Johnson",pos=(user?.positions||["Point Guard"]).join(", "),aEmail=user?.email||"athlete@email.com";
  const slug=`${fn}-${ln}`.toLowerCase().replace(/\s+/g,"-");
  const inTV=tab==="messages"&&msg.active;
  const TABS=[{id:"profile",label:"Profile",Ic:Ic.user},{id:"schools",label:"Schools",Ic:Ic.search},{id:"camps",label:"Camps",Ic:Ic.camp},{id:"messages",label:"Messages",Ic:Ic.msg},{id:"tracker",label:"Tracker",Ic:Ic.bars}];

  return <div style={{display:"flex",flexDirection:"column",height:"100vh",background:GR,overflow:"hidden",textAlign:"left"}}>
    <style>{CSS}</style>
    {!gender&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:16}}>
      <div style={{width:"min(430px, 100%)",background:W,border:`1px solid ${BD}`,borderRadius:14,padding:18,boxShadow:"0 24px 70px rgba(0,0,0,.25)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <Logo sz={26} purple/>
          <div>
            <div style={{fontWeight:900,color:T,fontSize:16,letterSpacing:-.3}}>Choose your program list</div>
            <div style={{color:TL,fontSize:12,marginTop:2}}>This filters schools by men’s vs women’s soccer programs.</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <button onClick={()=>{localStorage.setItem('ft_gender','man');setGender('man');}} style={{border:`1px solid ${BD}`,background:GR,borderRadius:12,padding:"12px 12px",cursor:"pointer",textAlign:"left"}}>
            <div style={{fontWeight:800,color:T}}>Men</div>
            <div style={{fontSize:12,color:TL,marginTop:2}}>Show mens_programs</div>
          </button>
          <button onClick={()=>{localStorage.setItem('ft_gender','woman');setGender('woman');}} style={{border:`1px solid ${BD}`,background:GR,borderRadius:12,padding:"12px 12px",cursor:"pointer",textAlign:"left"}}>
            <div style={{fontWeight:800,color:T}}>Women</div>
            <div style={{fontSize:12,color:TL,marginTop:2}}>Show womens_programs</div>
          </button>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
          <button onClick={()=>{localStorage.removeItem('ft_gender');setGender('');}} style={{background:"none",border:"none",color:TM,fontWeight:700,fontSize:12,cursor:"pointer",padding:0}}>Reset</button>
          <div style={{fontSize:11,color:TL}}>You can change this later by clearing site storage.</div>
        </div>
      </div>
    </div>}
    {/* TOP BAR */}
    <div style={{background:W,borderBottom:`1px solid ${BD}`,padding:"0 20px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
      {inTV?<button onClick={()=>msg.setA(null)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0}}><Ic.back size={18} color={B}/><span style={{fontSize:12,fontWeight:600,color:B}}>Messages</span></button>:<Logo sz={22}/>}
      {inTV?<div style={{textAlign:"center",flex:1}}><p style={{fontSize:13,fontWeight:700,color:T,margin:0}}>{msg.active.cName}</p><p style={{fontSize:10,color:TL,margin:0}}>{msg.active.school}</p></div>:<Pill ch="Athlete" color={B} bg={BL}/>}
      {inTV?<button style={{background:"none",border:"none",cursor:"pointer",padding:0}} onClick={()=>notify(`Connected: ${msg.active.cEmail}`)}><Ic.info size={18} color={TM}/></button>:<button onClick={()=>setSettingsOpen(true)} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",alignItems:"center"}}><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={TM} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>}
    </div>
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
      {/* PROFILE */}
      {tab==="profile"&&<DarkProfile
        user={user} posts={posts} tapeOrder={tapeOrder} setTapeOrder={setTapeOrder} metricValues={metricValues}
        setEditMetric={setEditMetric} setSelPost={setSelPost}
        followers={followers} following={following}
        followReqs={followReqs} accepted={accepted}
        setFollowOpen={setFollowOpen} setTab={setTab}
        setEditOpen={setEditOpen}
        coachContacts={coachContacts}
        removeCoachContact={removeCoachContact}
        coachDraft={coachDraft}
        setCoachDraft={setCoachDraft}
        startCoachDraft={startCoachDraft}
        saveCoachDraft={saveCoachDraft}
        cancelCoachDraft={cancelCoachDraft}
        expandedCoachId={expandedCoachId}
        toggleCoach={toggleCoach}
        coachEditDraft={coachEditDraft}
        setCoachEditDraft={setCoachEditDraft}
        saveCoachEdits={saveCoachEdits}
        cancelCoachEdits={cancelCoachEdits}
      />}

            {/* SCHOOLS */}
      {tab==="schools"&&<div className="fade" style={{flex:1}}>
          <div style={{background:W,borderBottom:`1px solid ${BD}`,padding:"6px 14px 6px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,background:GR,border:`1px solid ${BD}`,borderRadius:6,padding:"0 10px",marginBottom:5,height:30}}>
              <Ic.search size={12} color={TL}/>
              <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,border:"none",fontSize:12,color:T,background:"transparent",outline:"none"}}/>
              {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,lineHeight:1,display:"flex"}}><Ic.x size={11} color={TL}/></button>}
            </div>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              <FilterPill label="Division" value={divF} options={["All","D1","D2","D3","NAIA","JUCO"]} onChange={v=>{setDivF(v);setConfF("All");setStateF("All");}}/>
              <FilterPill label="Conference" value={confF} options={confs} onChange={v=>{setConfF(v);setStateF("All");}}/>
              <FilterPill label="State" value={stateF} options={states} onChange={setStateF}/>
              <span style={{marginLeft:"auto",fontSize:10,color:TL,flexShrink:0}}>{fil.length} schools</span>
            </div>
          </div>
          <div style={{background:W}}>
            {schoolsLoading&&<p style={{padding:"36px 17px",textAlign:"center",color:TL,fontSize:13}}>Loading schools…</p>}
            {!schoolsLoading&&fil.map(s=>{const tr=inP(s.id);return <div key={s.id} className="sr" onClick={()=>setSelSch(s)} style={{padding:"8px 14px"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:12,fontWeight:700,color:T}}>{s.name}</span>
                  <span style={{fontSize:10,fontWeight:600,color:B,background:BL,padding:"1px 6px",borderRadius:3}}>{s.div}</span>
                  {tr&&<span style={{fontSize:10,color:G,fontWeight:600}}>✓</span>}
                </div>
                <p style={{fontSize:10,color:TM,margin:0}}>{s.conf} · {s.state}</p>
              </div>
              <button onClick={e=>{e.stopPropagation();save(s);}} style={{background:tr?GL:GR,border:`1px solid ${tr?GBR:BD}`,cursor:"pointer",fontSize:11,fontWeight:600,color:tr?G:TM,padding:"4px 10px",borderRadius:5,flexShrink:0}}>{tr?"Saved":"Save"}</button>
            </div>;})}
            {!schoolsLoading&&!fil.length&&<p style={{padding:"36px 17px",textAlign:"center",color:TL,fontSize:13}}>No schools match your search.</p>}
          </div>
      </div>}

      {/* CAMPS TAB */}
      {tab==="camps"&&<div className="fade" style={{flex:1}}>
          <div style={{background:W,borderBottom:`1px solid ${BD}`,padding:"6px 14px 6px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,background:GR,border:`1px solid ${BD}`,borderRadius:6,padding:"0 10px",marginBottom:5,height:30}}>
              <Ic.search size={12} color={TL}/>
              <input placeholder="Search…" value={campSrch} onChange={e=>setCampSrch(e.target.value)} style={{flex:1,border:"none",fontSize:12,color:T,background:"transparent",outline:"none"}}/>
              {campSrch&&<button onClick={()=>setCampSrch("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,lineHeight:1,display:"flex"}}><Ic.x size={11} color={TL}/></button>}
            </div>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              <FilterPill label="Division" value={campDiv} options={["All","D1","D2","D3","NAIA","JUCO"]} onChange={setCampDiv}/>
              <FilterPill label="Conference" value={campConf} options={campConfs} onChange={setCampConf}/>
              <FilterPill label="State" value={campState} options={campStates} onChange={setCampState}/>
              <span style={{marginLeft:"auto",fontSize:10,color:TL,flexShrink:0}}>{allCamps.length}</span>
            </div>
          </div>
          {!allCamps.length&&<div style={{padding:"40px 17px",textAlign:"center"}}><p style={{fontSize:14,fontWeight:700,color:T,marginBottom:4}}>No camps found</p><p style={{fontSize:12,color:TM}}>Try adjusting your filters.</p></div>}
          <div style={{padding:"8px 12px"}}>
            {allCamps.map(({c,sch})=>{
              const req=cReqs.includes(c.id);const pct=((c.total-c.spots)/c.total)*100;
              return <div key={c.id} onClick={()=>setSelCamp({c,sch})} style={{background:W,border:`1px solid ${BD}`,borderRadius:6,padding:"9px 12px",marginBottom:6,cursor:"pointer",transition:"border-color .12s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=B}
                onMouseLeave={e=>e.currentTarget.style.borderColor=BD}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                  <div style={{flex:1,marginRight:10}}>
                    <p style={{fontSize:12,fontWeight:700,color:T,margin:0,marginBottom:2,lineHeight:1.2}}>{c.title}</p>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <span style={{fontSize:10,fontWeight:600,color:B,background:BL,padding:"1px 6px",borderRadius:3}}>{sch.div}</span>
                      <span style={{fontSize:11,color:TM,fontWeight:600}}>{sch.name}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <p style={{fontSize:14,fontWeight:700,color:T,margin:0,marginBottom:2}}>{c.cost}</p>
                    {req&&<span style={{fontSize:9,color:G,fontWeight:700,letterSpacing:.3}}>REQUESTED</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:10,marginBottom:4}}>
                  <p style={{fontSize:10,color:TM,margin:0}}><span style={{color:TL}}>Date </span>{c.date}</p>
                  <p style={{fontSize:10,color:TM,margin:0,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}><span style={{color:TL}}>Loc </span>{c.loc}</p>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <span style={{fontSize:9,color:c.spots<=5?"#dc2626":TL}}>{c.spots} of {c.total} spots left</span>
                  {c.video&&<span style={{fontSize:10,color:B,fontWeight:600}}>Film available</span>}
                </div>
                <div style={{background:GR,borderRadius:2,height:2,overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,background:c.spots<=3?"#dc2626":B,width:`${pct}%`,transition:"width .3s"}}/></div>
              </div>;
            })}
          </div>
      </div>}

      {/* MESSAGES LIST */}
      {tab==="messages"&&!msg.active&&<div className="fade" style={{flex:1}}>
        <div style={{background:W,padding:"12px 17px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
          <div><p style={{fontSize:13,fontWeight:700,color:T,margin:0,marginBottom:1}}>Messages</p><p style={{fontSize:11,color:TL,margin:0}}>Connected to your email · syncs both ways</p></div>
          <div style={{display:"flex",gap:7}}>
            <Btn ch="AI Draft" sm v="o" onClick={()=>{resetAi();setAiOpen(true);}}/>
            <Btn ch="New Message" sm onClick={()=>setNmo(true)}/>
          </div>
        </div>
        <div style={{background:BL,borderBottom:`1px solid ${BR}`,padding:"7px 17px",display:"flex",alignItems:"center",gap:6}}><Ic.mail size={12} active/><p style={{fontSize:11,color:"#C4622A",margin:0}}>Sending from <strong>{aEmail}</strong></p></div>
        {!msg.threads.length&&<div style={{padding:"36px 17px",textAlign:"center"}}><p style={{fontSize:13,fontWeight:700,color:T,marginBottom:4}}>No messages yet</p><Btn ch="Message a Coach" onClick={()=>setNmo(true)}/></div>}
        {msg.threads.map(t=>{
          const last=t.msgs[t.msgs.length-1];
          const coachViewed=t.viewed||viewedThreads[t.id];
          const hasCoachReply=t.msgs.some(m=>m.from==="coach");
          const lastAthleteMsg=t.msgs.filter(m=>m.from==="athlete").pop();
          // Show viewed indicator only on threads where last athlete msg hasn't been replied to
          const showViewed=coachViewed&&!hasCoachReply;
          const showReplied=hasCoachReply;
          return <div key={t.id} className="tr" onClick={()=>openThread(t)}>
            <div style={{position:"relative",flexShrink:0}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:t.unread?BL:GR,border:`1px solid ${t.unread?BR:BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:t.unread?B:TM}}>{t.cName.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
              {/* Status dot */}
              {(coachViewed||hasCoachReply)&&<div style={{position:"absolute",bottom:1,right:1,width:10,height:10,borderRadius:"50%",background:showReplied?"#00875a":B,border:`1.5px solid ${W}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={6} height={6} viewBox="0 0 24 24" fill="none" stroke={W} strokeWidth={3} strokeLinecap="round">{showReplied?<><polyline points="20 6 9 17 4 12"/></>:<path d="M12 5v7m0 4v.5"/>}</svg>
              </div>}
            </div>
            <div style={{flex:1,minWidth:0,marginLeft:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}>
                <p style={{fontSize:12,fontWeight:t.unread?700:600,color:T,margin:0}}>{t.cName}</p>
                <p style={{fontSize:9,color:TL,margin:0,flexShrink:0,marginLeft:6}}>{last.time}</p>
              </div>
              <p style={{fontSize:10,color:TM,margin:0,marginBottom:1,fontWeight:600}}>{t.school}</p>
              {/* Viewed / replied status line */}
              {(showViewed||showReplied)&&<p style={{fontSize:9,color:showReplied?"#00875a":B,fontWeight:600,margin:"0 0 1px",display:"flex",alignItems:"center",gap:3}}>
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">{showReplied?<polyline points="20 6 9 17 4 12"/>:<><circle cx="12" cy="12" r="2"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20"/></>}</svg>
                {showReplied?"Coach replied":coachViewed?`Opened · ${t.viewed?.label||"recently"}`:""}
              </p>}
              <p style={{fontSize:11,color:t.unread?T:TL,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{last.from==="athlete"?"You: ":""}{last.text}</p>
            </div>
            {t.unread>0&&<div style={{width:15,height:15,borderRadius:"50%",background:B,color:W,fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:6}}>{t.unread}</div>}
          </div>;})}
      </div>}

      {/* MESSAGE THREAD */}
      {tab==="messages"&&msg.active&&<ThreadUI thread={msg.active} inp={msg.inp} setInp={msg.setInp} onSend={()=>msg.send("athlete",msg.active.cName)} endRef={msg.ref} ac={B} fromLabel={msg.active.cName} fromEmail={aEmail} onAttach={()=>notify("Attach tape coming soon")}/>}

      {/* TRACKER */}
      {tab==="tracker"&&<div className="fade" style={{flex:1}}>
        <div style={{background:W,padding:"15px 17px",marginBottom:1}}>
          <p style={{fontSize:11,fontWeight:700,color:TL,letterSpacing:.3,textTransform:"uppercase",marginBottom:11}}>Overview</p>
          <div style={{display:"flex",background:GR,border:`1px solid ${BD}`,borderRadius:6,overflow:"hidden"}}>{[[tT,"Schools"],[tE,"Contacted"],[tC,"Camps"],[tO,"Offers"]].map(([v,l],i,a)=><div key={l} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRight:i<a.length-1?`1px solid ${BD}`:"none"}}><p style={{fontSize:17,fontWeight:700,color:T,margin:0,lineHeight:1,letterSpacing:-.4}}>{v}</p><p style={{fontSize:9,color:TL,fontWeight:500,marginTop:3,textTransform:"uppercase",letterSpacing:.4,margin:0}}>{l}</p></div>)}</div>
        </div>
        <div style={{background:W,padding:"15px 0 15px 17px",marginBottom:1}}>
          <p style={{fontSize:11,fontWeight:700,color:TL,letterSpacing:.3,textTransform:"uppercase",marginBottom:11,paddingRight:17}}>Pipeline</p>
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingRight:14,paddingBottom:4}}>
            {STG.map(st=>{const items=pip[st.id]||[];return <div key={st.id} style={{flexShrink:0,width:112,background:GR,border:`1px solid ${BD}`,borderRadius:6,padding:"8px 7px"}}>
              <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:7,paddingBottom:5,borderBottom:`1px solid ${BD}`}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:st.c,flexShrink:0}}/>
                <span style={{fontSize:8.5,fontWeight:700,color:TM,letterSpacing:.4,textTransform:"uppercase",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{st.label}</span>
                <span style={{fontSize:10,fontWeight:800,color:st.c,flexShrink:0}}>{items.length}</span>
              </div>
              {items.map(s=><div key={s.id} className="sc" style={{padding:"6px 7px",marginBottom:4,background:st.gold?"#fffbeb":"",border:st.gold?"1px solid #fde68a":""}} onClick={()=>setMoveOpen({school:s,fromStage:st.id})}><p style={{fontSize:10,fontWeight:600,color:st.gold?"#92400e":T,marginBottom:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</p><p style={{fontSize:9,color:st.gold?"#b45309":TL,margin:0}}>{s.state} · {s.div}</p></div>)}
              {!items.length&&<div style={{textAlign:"center",padding:"6px 0",fontSize:9,color:TL,borderTop:`1px dashed ${BD}`}}>—</div>}
            </div>;})}
          </div>
        </div>
        <div style={{background:W,marginBottom:1}}>
          <div style={{padding:"13px 17px 8px"}}><p style={{fontSize:11,fontWeight:700,color:TL,letterSpacing:.3,textTransform:"uppercase",margin:0}}>Schools Contacted ({tE})</p></div>
          {![...pip.emailed,...pip.viewed||[],...pip.replied,...pip.camped,...pip.offer].length?<p style={{padding:"18px 17px",textAlign:"center",color:TL,fontSize:12}}>None yet. <span style={{color:B,fontWeight:600,cursor:"pointer"}} onClick={()=>setTab("schools")}>Find schools</span></p>
          :[...pip.emailed,...pip.viewed||[],...pip.replied,...pip.camped,...pip.offer].map((s,i,arr)=>{const st=STG.find(x=>pip[x.id]?.find(y=>y.id===s.id));return <div key={`${s.id}-${i}`} style={{padding:"9px 16px",borderBottom:i<arr.length-1?`1px solid ${GR}`:"none",display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,minWidth:0}}><p style={{fontSize:12,fontWeight:600,color:T,margin:0,marginBottom:1}}>{s.name}</p><p style={{fontSize:10,color:TM,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.email}</p></div>
            {st&&<span style={{fontSize:10,fontWeight:600,color:st.c,background:st.c+"15",padding:"2px 7px",borderRadius:4,flexShrink:0}}>{st.label}</span>}
          </div>;})}
        </div>
        <div style={{background:W,marginBottom:8}}>
          <div style={{padding:"13px 17px 8px"}}><p style={{fontSize:11,fontWeight:700,color:TL,letterSpacing:.3,textTransform:"uppercase",margin:0}}>Camps Requested ({cReqs.length})</p></div>
          {!cReqs.length?<p style={{padding:"18px 17px",textAlign:"center",color:TL,fontSize:12}}>None yet. <span style={{color:B,fontWeight:600,cursor:"pointer"}} onClick={()=>setTab("schools")}>Browse camps</span></p>
          :schools.flatMap(s=>s.camps.filter(c=>cReqs.includes(c.id)).map(c=>({c,sch:s}))).map(({c,sch},i,arr)=><div key={c.id} style={{padding:"9px 16px",borderBottom:i<arr.length-1?`1px solid ${GR}`:"none",display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,minWidth:0}}><p style={{fontSize:12,fontWeight:600,color:T,margin:0,marginBottom:1}}>{c.title}</p><p style={{fontSize:10,color:TM,margin:0}}>{sch.name} · {c.date}</p></div>
            <div style={{textAlign:"right",flexShrink:0}}><p style={{fontSize:12,fontWeight:700,color:T,margin:0,marginBottom:2}}>{c.cost}</p><span style={{fontSize:10,color:G,fontWeight:600}}>Requested</span></div>
          </div>)}
        </div>
      </div>}
    </div>

    {/* BOTTOM NAV */}
    <nav className="nav-app">
      {TABS.map(({id,label,Ic:Icon})=>{const a=tab===id,badge=id==="messages"?msg.total:0;return <button key={id} className="nav-btn" onClick={()=>{setTab(id);if(id!=="messages")msg.setA(null);}}>
        <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",width:28,height:a?22:26}}>
          <Icon active={a} color={a?B:"var(--nav-icon)"} size={a?19:21}/>
          {badge>0&&<div style={{position:"absolute",top:-2,right:-4,width:13,height:13,borderRadius:"50%",background:"#ef4444",color:W,fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${W}`}}>{badge}</div>}
        </div>
        {a&&<span className="nav-label" style={{color:B}}>{label}</span>}
      </button>;})}
    </nav>


    {/* CAMP DETAIL SHEET */}
    {selCamp&&<div onClick={e=>{if(e.target===e.currentTarget)setSelCamp(null)}} style={{position:"fixed",inset:0,background:"rgba(17,24,39,.5)",zIndex:300,display:"flex",alignItems:"flex-end",backdropFilter:"blur(6px)"}}>
      <div style={{background:W,borderRadius:"16px 16px 0 0",width:"100%",maxWidth:430,margin:"0 auto",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 -4px 32px rgba(0,0,0,.12)"}}>
        {/* Handle */}
        <div style={{width:36,height:4,background:BD,borderRadius:2,margin:"12px auto 0"}}/>
        {/* Camp hero */}
        <div style={{padding:"16px 20px 14px",borderBottom:`1px solid ${BD}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{flex:1,marginRight:12}}>
              <p style={{fontSize:16,fontWeight:800,color:T,margin:0,marginBottom:4,letterSpacing:-.2,lineHeight:1.2}}>{selCamp.c.title}</p>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:10,fontWeight:700,color:B,background:BL,padding:"2px 7px",borderRadius:3}}>{selCamp.sch.div}</span>
                <span style={{fontSize:12,color:TM,fontWeight:600}}>{selCamp.sch.name}</span>
                <span style={{fontSize:11,color:TL}}>· {selCamp.sch.conf}</span>
              </div>
            </div>
            <p style={{fontSize:20,fontWeight:800,color:T,margin:0,flexShrink:0}}>{selCamp.c.cost}</p>
          </div>
          {/* Stats row */}
          <div style={{display:"flex",background:GR,border:`1px solid ${BD}`,borderRadius:6,overflow:"hidden"}}>
            {[["Date",selCamp.c.date],["Spots",`${selCamp.c.spots} left`],["Total",selCamp.c.total]].map(([l,v],i,a)=>(
              <div key={l} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRight:i<a.length-1?`1px solid ${BD}`:"none"}}>
                <p style={{fontSize:13,fontWeight:700,color:T,margin:0,lineHeight:1}}>{v}</p>
                <p style={{fontSize:9,color:TL,fontWeight:500,marginTop:2,textTransform:"uppercase",letterSpacing:.3,margin:0}}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Details */}
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${BD}`}}>
          <p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",marginBottom:8}}>Camp Details</p>
          <div style={{background:GR,border:`1px solid ${BD}`,borderRadius:6,padding:"2px 14px",marginBottom:12}}>
            <DRow label="Location" value={selCamp.c.loc}/>
            <DRow label="Date" value={selCamp.c.date}/>
            <DRow label="Recording" value={selCamp.c.video?"Available":"Not available"} last/>
          </div>
          {selCamp.c.desc&&<p style={{fontSize:13,color:TM,lineHeight:1.65,margin:0}}>{selCamp.c.desc}</p>}
        </div>
        {/* Spots bar */}
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${BD}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,color:TM,fontWeight:500}}>{selCamp.c.spots} spots remaining</span>
            <span style={{fontSize:12,fontWeight:700,color:selCamp.c.spots<=5?"#dc2626":T}}>{Math.round(((selCamp.c.total-selCamp.c.spots)/selCamp.c.total)*100)}% full</span>
          </div>
          <div style={{background:GR,borderRadius:3,height:4,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:selCamp.c.spots<=3?"#dc2626":B,width:`${((selCamp.c.total-selCamp.c.spots)/selCamp.c.total)*100}%`,transition:"width .3s"}}/></div>
        </div>
        {/* School info */}
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${BD}`}}>
          <p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",marginBottom:8}}>About the School</p>
          <div style={{background:GR,border:`1px solid ${BD}`,borderRadius:6,padding:"2px 14px",marginBottom:10}}>
            <DRow label="Coach" value={selCamp.sch.coach}/>
            <DRow label="Conference" value={selCamp.sch.conf}/>
            <DRow label="State" value={selCamp.sch.state}/>
            <DRow label="Founded" value={selCamp.sch.founded}/>
            <DRow label="Enrollment" value={selCamp.sch.enroll} last/>
          </div>
          <button onClick={()=>{navigator.clipboard?.writeText(selCamp.sch.email).catch(()=>{});notify("Email copied");}} style={{width:"100%",padding:"10px",borderRadius:6,border:`1px solid ${BD}`,background:GR,color:TM,fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            <Ic.mail size={13} color={TM}/>{selCamp.sch.email}
          </button>
        </div>
        {/* Actions */}
        <div style={{padding:"14px 20px 36px",display:"flex",gap:9}}>
          <button onClick={()=>{setSelSch(selCamp.sch);setSelCamp(null);}} style={{flex:1,padding:"11px 0",borderRadius:7,border:`1px solid ${BD}`,background:GR,color:TM,fontSize:13,fontWeight:600,cursor:"pointer"}}>View School</button>
          <button onClick={()=>{reqCamp(selCamp.c.id,selCamp.sch);setSelCamp(null);}} style={{flex:2,padding:"11px 0",borderRadius:7,border:"none",background:cReqs.includes(selCamp.c.id)?GL:B,color:cReqs.includes(selCamp.c.id)?G:W,fontSize:13,fontWeight:700,cursor:"pointer"}}>
            {cReqs.includes(selCamp.c.id)?"✓ Spot Requested":"Request a Spot"}
          </button>
        </div>
      </div>
    </div>}

    {/* SCHOOL DETAIL SHEET */}
    <Sheet open={!!selSch} onClose={()=>setSelSch(null)} title={selSch?.name} sub={selSch?`${selSch.div} · ${selSch.conf} · ${selSch.state}`:""} ch={selSch&&<>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:13}}><Btn ch={inP(selSch.id)?"Saved":"Save School"} sm v={inP(selSch.id)?"o":"p"} onClick={()=>{save(selSch);setSelSch(null);}}/></div>
      <div style={{background:GR,border:`1px solid ${BD}`,borderRadius:5,padding:"3px 14px",marginBottom:14}}>{[["Founded",selSch.founded],["Enrollment",selSch.enroll],["Colors",selSch.colors]].map(([l,v],i,a)=><DRow key={l} label={l} value={v} last={i===a.length-1}/>)}</div>
      <div style={{background:BL,border:`1px solid ${BR}`,borderRadius:5,padding:"11px 14px",marginBottom:14}}>
        <p style={{fontSize:10,fontWeight:700,color:B,letterSpacing:.7,textTransform:"uppercase",marginBottom:7}}>Head Coach</p>
        <p style={{fontSize:13,fontWeight:700,color:T,marginBottom:2}}>{selSch.coach}</p>
        <p style={{fontSize:12,color:B,fontFamily:"monospace",marginBottom:11}}>{selSch.email}</p>
        <div style={{display:"flex",gap:7}}>
          <Btn ch={copied===selSch.id?"Copied":"Copy Email"} sm v="o" sx={{flex:1}} onClick={()=>copyE(selSch.email,selSch.id)}/>
          <Btn ch="Message" sm sx={{flex:1}} onClick={()=>{setNmSch(selSch.id);setNmo(true);setSelSch(null);}}/>
        </div>
      </div>
      {selSch.camps.length>0?<>
        <p style={{fontSize:12,fontWeight:700,color:T,marginBottom:11}}>Camps ({selSch.camps.length})</p>
        {selSch.camps.map(c=><div key={c.id} style={{border:`1px solid ${BD}`,borderRadius:5,padding:13,marginBottom:9}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><p style={{fontSize:13,fontWeight:700,color:T,flex:1,marginRight:8}}>{c.title}</p><p style={{fontSize:14,fontWeight:800,color:B,margin:0}}>{c.cost}</p></div>
          <p style={{fontSize:12,color:TM,marginBottom:2}}>{c.date}</p><p style={{fontSize:12,color:TM,marginBottom:9}}>{c.loc}</p>
          <p style={{fontSize:12,color:"#374151",lineHeight:1.6,marginBottom:10}}>{c.desc}</p>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,color:TM}}>{c.spots} of {c.total} spots remaining</span>{c.video&&<span style={{fontSize:11,color:B,fontWeight:600}}>Recording available</span>}</div>
          <div style={{background:GR,borderRadius:999,height:4,overflow:"hidden",marginBottom:11}}><div style={{height:"100%",borderRadius:999,background:c.spots<=3?"#dc2626":G,width:`${((c.total-c.spots)/c.total)*100}%`}}/></div>
          <Btn ch={cReqs.includes(c.id)?"Spot Requested":"Request a Spot"} sm full v={cReqs.includes(c.id)?"o":"p"} sx={{color:cReqs.includes(c.id)?G:undefined,borderColor:cReqs.includes(c.id)?"#6ee7b7":undefined}} onClick={()=>reqCamp(c.id,selSch)}/>
        </div>)}
      </>:<div style={{background:GR,border:`1px solid ${BD}`,borderRadius:5,padding:16,textAlign:"center"}}><p style={{fontSize:13,color:TL}}>No camps currently listed.</p></div>}
    </>}/>

    {/* MOVE STAGE SHEET */}
    <Sheet open={!!moveOpen} onClose={()=>setMoveOpen(null)} title={moveOpen?.school.name} sub="Update recruitment stage" ch={moveOpen&&STG.map(st=>{const cur=st.id===moveOpen.fromStage;return <div key={st.id} onClick={()=>{if(!cur)moveSt(moveOpen.school,moveOpen.fromStage,st.id);}} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 12px",borderRadius:5,marginBottom:6,cursor:cur?"default":"pointer",background:cur?BL:st.gold?"#fffbeb":GR,border:`1px solid ${cur?B:st.gold?"#fde68a":BD}`,transition:"all .15s"}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:cur?B:BD,flexShrink:0}}/><span style={{flex:1,fontSize:13,fontWeight:cur?600:400,color:cur?B:T}}>{st.label}</span>
      {cur&&<Pill ch="Current" color={B} bg={BL}/>}
    </div>;})}/>

    {/* AI DRAFT PANEL */}
    {aiOpen&&<div style={{position:"fixed",inset:0,background:"#050505",zIndex:400}}>
      <div style={{width:"100%",maxWidth:430,height:"100%",margin:"0 auto",background:W,display:"flex",flexDirection:"column"}}>
        {/* Top bar */}
        <div style={{background:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <button onClick={resetAi} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0}}>
            <Ic.back size={18} color={B}/><span style={{fontSize:13,fontWeight:600,color:B}}>Messages</span>
          </button>
          <span style={{fontSize:14,fontWeight:700,color:T}}>AI Draft</span>
          <div style={{width:72}}/>
        </div>
        {/* Mode toggle — step 0 & 1 only */}
        {aiStep<2&&<div style={{padding:"14px 16px 0",flexShrink:0}}>
          <div style={{display:"flex",background:GR,border:`1px solid ${BD}`,borderRadius:8,padding:3}}>
            {[["single","Single School"],["broadcast","Broadcast"]].map(([mode,label])=>{
              const on=(mode==="broadcast")===aiBroadcast;
              return <button key={mode} onClick={()=>{setAiBroadcast(mode==="broadcast");setAiSch(null);setAiBcList([]);setAiStep(0);setAiDrafts([]);}}
                style={{flex:1,padding:"7px 0",borderRadius:6,border:"none",background:on?W:"transparent",color:on?T:TM,fontSize:12,fontWeight:on?700:500,cursor:"pointer",boxShadow:on?"0 1px 3px rgba(0,0,0,.08)":"none",transition:"all .15s"}}>
                {label}
              </button>;
            })}
          </div>
        </div>}
        <div style={{flex:1,overflowY:"auto",padding:"16px 16px 40px"}}>

          {/* ── STEP 0: SETUP ── */}
          {aiStep===0&&<>
            {/* All / Saved toggle */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <p style={{fontSize:12,fontWeight:600,color:T,margin:0}}>School{aiBroadcast?"s":""}</p>
              <div style={{display:"flex",background:GR,border:`1px solid ${BD}`,borderRadius:6,padding:2}}>
                {[["all","All"],["saved","Saved"]].map(([mode,label])=>{
                  const on=mode==="saved"?aiSavedOnly:!aiSavedOnly;
                  const savedCount=allT.length;
                  return <button key={mode} onClick={()=>{setAiSavedOnly(mode==="saved");setAiSch(null);setAiBcList([]);}}
                    style={{padding:"4px 10px",borderRadius:4,border:"none",background:on?W:"transparent",color:on?B:TM,fontSize:11,fontWeight:on?700:500,cursor:"pointer",boxShadow:on?"0 1px 2px rgba(0,0,0,.08)":"none",transition:"all .12s",whiteSpace:"nowrap"}}>
                    {label}{mode==="saved"&&savedCount>0?` (${savedCount})`:""}</button>;
                })}
              </div>
            </div>
            {aiSavedOnly&&allT.length===0&&<div style={{background:GR,border:`1px solid ${BD}`,borderRadius:6,padding:"12px 14px",marginBottom:14,textAlign:"center"}}>
              <p style={{fontSize:12,color:TM,margin:0}}>No saved schools yet — save schools from the Schools tab first.</p>
            </div>}
            {(!aiSavedOnly||allT.length>0)&&<>
            {!aiBroadcast&&<>
              <FSel value={aiSch||""} onChange={e=>setAiSch(Number(e.target.value))} ch={[<option key="" value="" disabled>Select a school…</option>,...(aiSavedOnly?schools.filter(s=>inP(s.id)):schools).map(s=><option key={s.id} value={s.id}>{s.name} ({s.div} · {s.state})</option>)]} style={{marginBottom:12}}/>
              {aiSch&&(()=>{const s=schools.find(x=>x.id===aiSch);return s?<div style={{background:BL,border:`1px solid ${BR}`,borderRadius:6,padding:"9px 12px",marginBottom:16,display:"flex",gap:10,alignItems:"center"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:BR,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:B,flexShrink:0}}>{s.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                <div><p style={{fontSize:12,fontWeight:700,color:T,margin:0}}>{s.name}</p><p style={{fontSize:11,color:TM,margin:0}}>{s.div} · {s.conf} · {s.coach||"Coach TBD"}</p></div>
              </div>:null;})()}
            </>}
            {aiBroadcast&&<>
              <div style={{border:`1px solid ${BD}`,borderRadius:8,overflow:"hidden",marginBottom:aiBcList.length?8:16,maxHeight:240,overflowY:"auto"}}>
                {(aiSavedOnly?schools.filter(s=>inP(s.id)):schools).map(s=>{
                  const on=aiBcList.includes(s.id);
                  return <div key={s.id} onClick={()=>setAiBcList(l=>on?l.filter(id=>id!==s.id):[...l,s.id])}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderBottom:`1px solid ${BD}`,cursor:"pointer",background:on?BL:W,transition:"background .1s"}}>
                    <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${on?B:BD}`,background:on?B:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .12s"}}>
                      {on&&<svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={W} strokeWidth={3} strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:12,fontWeight:600,color:on?B:T,margin:0,marginBottom:1}}>{s.name}</p>
                      <p style={{fontSize:10,color:TM,margin:0}}>{s.coach||"Coach TBD"} · {s.div} · {s.state}</p>
                    </div>
                  </div>;
                })}
              </div>
              {aiBcList.length>0&&<p style={{fontSize:11,color:B,fontWeight:600,marginBottom:16}}>{aiBcList.length} school{aiBcList.length!==1?"s":""} selected</p>}
            </>}
            </>}
            <FL label="Context" hint="(optional)" ch={<div style={{border:`1.5px solid ${BD}`,borderRadius:8,padding:"9px 12px"}} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor=BD}>
              <textarea rows={4} placeholder="Share anything that will help — recent highlights, why this school interests you, your stats, upcoming events…" value={aiCtx} onChange={e=>setAiCtx(e.target.value)} style={{background:"transparent",width:"100%",border:"none",outline:"none",fontSize:13,color:T,lineHeight:1.6,fontFamily:"inherit"}}/>
            </div>}/>
            <div style={{background:BL,border:`1px solid ${BR}`,borderRadius:6,padding:"8px 12px",marginBottom:16,display:"flex",gap:6}}>
              <Ic.info size={12} active/><p style={{fontSize:11,color:"#C4622A",margin:0,lineHeight:1.5}}>A personalized draft will be generated for each school using your profile and optional context.</p>
            </div>
            <Btn ch={aiBroadcast?"Generate Drafts →":"Generate Draft →"} full dis={aiBroadcast?aiBcList.length===0:!aiSch} onClick={launchAI}/>
          </>}

          {/* ── STEP 1: GENERATING ── */}
          {aiStep===1&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:320,gap:16}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:BL,border:`2px solid ${BR}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </svg>
            </div>
            <div style={{textAlign:"center"}}>
              <p style={{fontSize:14,fontWeight:700,color:T,margin:0,marginBottom:4}}>{aiBroadcast?`Generating ${aiBcList.length} draft${aiBcList.length!==1?"s":""}…`:"Generating your draft…"}</p>
              <p style={{fontSize:12,color:TM,margin:0}}>Personalizing for each coach</p>
            </div>
          </div>}

          {/* ── STEP 2: PREVIEW & EDIT ── */}
          {aiStep===2&&<>
            <div style={{marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <p style={{fontSize:13,fontWeight:700,color:T,margin:0}}>{aiBroadcast?`${aiDrafts.length} Draft${aiDrafts.length!==1?"s":""} Ready`:"Your Draft"}</p>
              <button onClick={()=>{setAiStep(0);setAiDrafts([]);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:TM,fontWeight:500,padding:0}}>Edit Setup</button>
            </div>
            {/* Single mode */}
            {!aiBroadcast&&aiDrafts[0]&&<>
              <div style={{border:`1.5px solid ${BD}`,borderRadius:8,padding:"12px 14px",marginBottom:14}} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor=BD} tabIndex={-1}>
                <textarea rows={14} value={aiDrafts[0].text} onChange={e=>setAiDrafts([{...aiDrafts[0],text:e.target.value}])} style={{background:"transparent",width:"100%",border:"none",outline:"none",fontSize:13,color:T,lineHeight:1.65,fontFamily:"inherit"}}/>
              </div>
              <div style={{background:BL,border:`1px solid ${BR}`,borderRadius:6,padding:"8px 12px",marginBottom:14,display:"flex",gap:6}}>
                <Ic.info size={12} active/><p style={{fontSize:11,color:"#C4622A",margin:0}}>Edit freely — this is your message, the AI just got you started.</p>
              </div>
              <Btn ch="Send Message" full dis={!aiDrafts[0].text.trim()} onClick={sendAiDrafts}/>
            </>}
            {/* Broadcast mode */}
            {aiBroadcast&&<>
              {aiDrafts.map(({schoolId,text},idx)=>{
                const s=schools.find(x=>x.id===schoolId);if(!s)return null;
                const editing=aiEditIdx===idx;
                const init=s.name.split(" ").map(n=>n[0]).join("").slice(0,2);
                return <div key={schoolId} style={{border:`1.5px solid ${editing?B:BD}`,borderRadius:10,marginBottom:12,overflow:"hidden",transition:"border-color .15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:editing?BL:GR,borderBottom:`1px solid ${editing?BR:BD}`}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:editing?BR:BD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:editing?B:TM,flexShrink:0}}>{init}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:12,fontWeight:700,color:T,margin:0}}>To: {s.coach||"Coach"}</p>
                      <p style={{fontSize:10,color:TM,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name} · {s.div} · {s.conf}</p>
                    </div>
                    <button onClick={()=>setAiEditIdx(editing?null:idx)} style={{background:"none",border:`1px solid ${editing?B:BD}`,borderRadius:5,padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:600,color:editing?B:TM,flexShrink:0}}>{editing?"Done":"Edit"}</button>
                  </div>
                  <div style={{padding:"10px 14px",background:W}}>
                    {editing
                      ?<textarea rows={10} autoFocus value={text} onChange={e=>setAiDrafts(ds=>ds.map((d,i)=>i===idx?{...d,text:e.target.value}:d))} style={{background:"transparent",width:"100%",border:"none",outline:"none",fontSize:12,color:T,lineHeight:1.65,fontFamily:"inherit"}}/>
                      :<p style={{fontSize:12,color:TM,margin:0,lineHeight:1.65,whiteSpace:"pre-wrap",maxHeight:100,overflow:"hidden",WebkitMaskImage:"linear-gradient(180deg,#000 50%,transparent)"}}>{text}</p>
                    }
                  </div>
                </div>;
              })}
              <div style={{marginTop:4,marginBottom:14,background:BL,border:`1px solid ${BR}`,borderRadius:6,padding:"8px 12px",display:"flex",gap:6}}>
                <Ic.info size={12} active/><p style={{fontSize:11,color:"#C4622A",margin:0}}>Each message is personalized. Tap Edit on any card to modify before sending.</p>
              </div>
              <Btn ch={`Send to ${aiDrafts.length} School${aiDrafts.length!==1?"s":""}`} full dis={aiDrafts.some(d=>!d.text.trim())} onClick={sendAiDrafts}/>
            </>}
          </>}

        </div>
      </div>
    </div>}

    {/* NEW MESSAGE SHEET */}
    <Sheet open={nmo} onClose={()=>{setNmo(false);setNmSch(null);setNmTxt("");}} title="New Message" ch={<>
      <FL label="To" ch={<><FSel ch={[<option key="" value="" disabled>Select a school…</option>,...schools.map(s=><option key={s.id} value={s.id}>{s.name} ({s.div} · {s.state})</option>)]} value={nmSch||""} onChange={e=>setNmSch(Number(e.target.value))}/>{nmSch&&<p style={{fontSize:11,color:TM,marginTop:4}}>You can connect with <span style={{color:B,fontWeight:600}}>{schools.find(s=>s.id===nmSch)?.name}</span></p>}</>}/>
      <FL label="Message" ch={<div style={{border:`1.5px solid ${BD}`,borderRadius:4,padding:"9px 12px"}} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor=BD}><textarea rows={5} placeholder="Write your message…" value={nmTxt} onChange={e=>setNmTxt(e.target.value)} style={{background:"transparent",width:"100%",border:"none",outline:"none",fontSize:13,color:T}}/></div>}/>
      <div style={{background:BL,border:`1px solid ${BR}`,borderRadius:4,padding:"8px 12px",marginBottom:15,display:"flex",gap:6}}><Ic.info size={12} active/><p style={{fontSize:11,color:"#C4622A",margin:0,lineHeight:1.5}}>Sends as a real email and creates a thread in the coach's inbox.</p></div>
      <Btn ch="Send Message" full dis={!nmSch||!nmTxt.trim()} onClick={startMsg}/>
    </>}/>

    {/* EDIT SHEET */}
    <Sheet open={editOpen} onClose={()=>setEditOpen(false)} title="Edit Profile" ch={<>
      <div style={{display:"flex",gap:9}}><FL label="First Name" ch={<FIn defaultValue={fn}/>}/><FL label="Last Name" ch={<FIn defaultValue={ln}/>}/></div>
      <div style={{display:"flex",gap:9}}><FL label="Height" ch={<FIn defaultValue={user?.height||""} placeholder='6&apos;2"'/>}/><FL label="Weight" ch={<FIn defaultValue={user?.weight||""} placeholder="185"/>}/><FL label="GPA" ch={<FIn defaultValue={user?.gpa||""} placeholder="3.4"/>}/></div>
      <FL label="High School" ch={<FIn defaultValue={user?.school||""}/>}/>
      <FL label="Graduation Year" ch={<FSel ch={[<option key="" value="" disabled>Select year</option>,...GY.map(y=><option key={y}>{y}</option>)]} defaultValue={user?.gradYear||""}/>}/>
      <Btn ch="Save Changes" full sx={{marginTop:4}} onClick={()=>{setEditOpen(false);notify("Profile updated");}}/>
    </>}/>

    {notif&&<div className="toast">{notif}</div>}

    {/* CLIP VIEWER */}
    {selPost&&<div onClick={()=>setSelPost(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:400,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 17px",flexShrink:0}}>
        <button onClick={()=>setSelPost(null)} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Ic.x size={16} color={W}/></button>
        <p style={{fontSize:13,fontWeight:700,color:W,margin:0}}>{selPost.type}</p>
        <button onClick={e=>{e.stopPropagation();notify("Link copied");}} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Ic.share size={15} color={W}/></button>
      </div>
      {/* Video area */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 17px"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:"100%",maxWidth:400}}>
          <div style={{borderRadius:6,overflow:"hidden",background:`linear-gradient(145deg,${selPost.thumb},#0f172a)`,aspectRatio:"16/9",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,position:"relative"}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(255,255,255,.2)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid rgba(255,255,255,.3)",cursor:"pointer"}} onClick={()=>notify("Video playback coming with Mux integration")}>
              <Ic.play size={26} color={W}/>
            </div>
            <div style={{position:"absolute",bottom:10,right:12,background:"rgba(0,0,0,.5)",borderRadius:5,padding:"3px 8px"}}><span style={{fontSize:11,color:W,fontWeight:600}}>{selPost.duration}</span></div>
          </div>
          <p style={{fontSize:16,fontWeight:800,color:W,margin:0,marginBottom:5,letterSpacing:-.2}}>{selPost.title}</p>
          <p style={{fontSize:13,color:"rgba(255,255,255,.6)",margin:0,marginBottom:14,lineHeight:1.55}}>{selPost.desc}</p>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[[selPost.views,"Views"],[selPost.likes,"Likes"],[selPost.duration,"Length"]].map(([v,l])=>(
              <div key={l} style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:4,padding:"9px 6px",textAlign:"center"}}>
                <p style={{fontSize:15,fontWeight:800,color:W,lineHeight:1,margin:0}}>{v}</p>
                <p style={{fontSize:9,color:"rgba(255,255,255,.5)",fontWeight:600,marginTop:3,letterSpacing:.5,textTransform:"uppercase",margin:0}}>{l}</p>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setPosts(ps=>ps.map(p=>p.id===selPost.id?{...p,featured:true}:{...p,featured:false}));notify("Set as featured clip");setSelPost(null);}}
              style={{flex:1,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.15)",borderRadius:4,padding:"10px 0",cursor:"pointer",fontSize:12,fontWeight:700,color:W}}>
              {selPost.featured?"Featured":"Set Featured"}
            </button>
            <button onClick={()=>{notify(`Sharing: fasttrack.app/${slug}`);}}
              style={{flex:1,background:B,border:"none",borderRadius:4,padding:"10px 0",cursor:"pointer",fontSize:12,fontWeight:700,color:W}}>
              Share Clip
            </button>
          </div>
          <button onClick={()=>{setPosts(ps=>ps.filter(p=>p.id!==selPost.id));setTapeOrder(o=>o.filter(id=>id!==selPost.id));setSelPost(null);notify("Clip removed");}}
            style={{width:"100%",marginTop:8,background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",borderRadius:4,padding:"10px 0",cursor:"pointer",fontSize:12,fontWeight:700,color:"#fca5a5"}}>
            Remove Clip
          </button>
        </div>
      </div>
      <div style={{height:24,flexShrink:0}}/>
    </div>}

    {/* POST NEW CLIP SHEET */}
    {(()=>{
      const closePost=()=>{setPostOpen(false);setPostPhase("form");setPendingPostId(null);setNewPost({title:"",desc:"",type:"Highlight"});};
      return <Sheet open={postOpen} onClose={closePost}
        title={postPhase==="form"?"Post a Clip":"Clip Posted!"}
        sub={postPhase==="form"?"Share a highlight or full tape to your profile":"Add it to your Highlight Tape?"}
        ch={postPhase==="form"?(<>
          <div onClick={()=>notify("Video upload ready at launch")} style={{border:`1.5px dashed ${BD}`,borderRadius:6,padding:"28px 20px",textAlign:"center",cursor:"pointer",marginBottom:16,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=B;e.currentTarget.style.background=BL}} onMouseLeave={e=>{e.currentTarget.style.borderColor=BD;e.currentTarget.style.background=W}}>
            <div style={{width:46,height:46,background:BL,border:`1px solid ${BR}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 11px"}}>
              <Ic.film size={22} active/>
            </div>
            <p style={{fontSize:14,fontWeight:700,color:T,margin:0,marginBottom:3}}>Upload Video</p>
            <p style={{fontSize:12,color:TM,margin:0}}>{user?.sport==="Soccer"?"Full match video or highlights — MP4, MOV up to 2GB":"MP4, MOV — up to 500 MB"}</p>
            <div style={{marginTop:12,display:"inline-block",background:B,color:W,padding:"8px 22px",borderRadius:4,fontSize:12,fontWeight:700}}>Choose File</div>
          </div>
          <FL label="Clip Title" ch={<FIn placeholder="e.g. Game-Winner vs Lincoln HS" value={newPost.title} onChange={e=>setNewPost(p=>({...p,title:e.target.value}))}/>}/>
          <FL label="Description" ch={<div style={{border:`1.5px solid ${BD}`,borderRadius:4,padding:"9px 12px"}} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor=BD}><textarea rows={3} placeholder="What happened in this clip? What does it show?" value={newPost.desc} onChange={e=>setNewPost(p=>({...p,desc:e.target.value}))} style={{background:"transparent",width:"100%",border:"none",outline:"none",fontSize:13,color:T}}/></div>}/>
          <FL label="Clip Type" ch={<FSel ch={(user?.sport==="Soccer"?["Highlight","Full Match","Training Clip","Defensive Clip","Attacking Play","Set Piece","Goals Reel","Assists Reel"]:["Highlight","Game Clip","Tape","Defense","Scoring","Passing","IQ"]).map(t=><option key={t}>{t}</option>)} value={newPost.type} onChange={e=>setNewPost(p=>({...p,type:e.target.value}))}/>}/>
          <div style={{background:BL,border:`1px solid ${BR}`,borderRadius:4,padding:"8px 12px",marginBottom:16,display:"flex",gap:6}}>
            <Ic.info size={12} active/>
            <p style={{fontSize:11,color:"#C4622A",margin:0,lineHeight:1.5}}>This clip will appear on your public profile at <strong>fasttrack.app/{slug}</strong> and be visible to all coaches.</p>
          </div>
          <Btn ch="Post to Profile" full dis={!newPost.title.trim()} onClick={()=>{
            const colors=["#1e3a5f","#C4622A","#1e3a8a","#172554","#1d4ed8","#2563eb"];
            const newId=Date.now();
            const p={id:newId,title:newPost.title,desc:newPost.desc||"New clip posted.",type:newPost.type,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),views:0,likes:0,duration:"0:30",thumb:colors[Math.floor(Math.random()*colors.length)],featured:false};
            setPosts(ps=>[p,...ps]);
            setPendingPostId(newId);
            setPostPhase("tape");
            notify("Clip posted to your profile!");
          }}/>
        </>):(
          <>
            {/* Success check */}
            <div style={{textAlign:"center",padding:"8px 0 20px"}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(0,135,90,.15)",border:"1.5px solid rgba(87,217,163,.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#57d9a3" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{fontSize:15,fontWeight:800,color:T,margin:"0 0 4px"}}>Posted to Media!</p>
              <p style={{fontSize:12,color:TM,margin:0,lineHeight:1.5}}>Your tape is what coaches open when they get your link. Add this clip?</p>
            </div>
            {/* Tape prompt options */}
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              <button onClick={()=>{setTapeOrder(o=>[pendingPostId,...o]);closePost();notify("Added to beginning of tape!");}} style={{background:GR,border:`1.5px solid ${BD}`,borderRadius:8,padding:"13px 16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:6,background:BL,border:`1px solid ${BR}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth={2.5}><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
                </div>
                <div>
                  <p style={{fontSize:13,fontWeight:700,color:T,margin:0}}>Add to Beginning</p>
                  <p style={{fontSize:11,color:TM,margin:0}}>This clip plays first — great for your best highlight</p>
                </div>
              </button>
              <button onClick={()=>{setTapeOrder(o=>[...o,pendingPostId]);closePost();notify("Added to end of tape!");}} style={{background:GR,border:`1.5px solid ${BD}`,borderRadius:8,padding:"13px 16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:6,background:BL,border:`1px solid ${BR}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth={2.5}><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
                </div>
                <div>
                  <p style={{fontSize:13,fontWeight:700,color:T,margin:0}}>Add to End</p>
                  <p style={{fontSize:11,color:TM,margin:0}}>Appended after your current clips</p>
                </div>
              </button>
              <button onClick={()=>{setTapeOrder(o=>[...o,pendingPostId]);closePost();setTab("profile");notify("Clip added — open Tape Editor to place it");}} style={{background:GR,border:`1.5px solid ${BD}`,borderRadius:8,padding:"13px 16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:6,background:BL,border:`1px solid ${BR}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth={2.5}><line x1={12} y1={5} x2={12} y2={19}/><line x1={5} y1={12} x2={19} y2={12}/></svg>
                </div>
                <div>
                  <p style={{fontSize:13,fontWeight:700,color:T,margin:0}}>Place Manually</p>
                  <p style={{fontSize:11,color:TM,margin:0}}>Opens the Tape Editor so you can drag it where you want</p>
                </div>
              </button>
            </div>
            <button onClick={closePost} style={{width:"100%",background:"none",border:"none",cursor:"pointer",fontSize:13,color:TM,padding:"8px 0",fontWeight:500}}>No thanks, maybe later</button>
          </>
        )}/>;
    })()}

    {/* FOLLOW SHEET */}
    {followOpen&&(()=>{
      const PEOPLE=[
        {id:"a1",init:"MJ",name:"Marcus Johnson",   sub:"PG · Class of 2027 · Lincoln HS",     type:"athlete",sport:"Basketball"},
        {id:"a2",init:"CR",name:"Caleb Rivers",      sub:"PG · Class of 2026 · Rice HS",          type:"athlete",sport:"Basketball"},
        {id:"a3",init:"IT",name:"Isaiah Torres",     sub:"CB · Class of 2026 · Paul VI HS",       type:"athlete",sport:"Soccer"},
        {id:"a4",init:"DM",name:"Devon Mitchell",    sub:"SG · Class of 2027 · Stepinac",         type:"athlete",sport:"Basketball"},
        {id:"a5",init:"TK",name:"Tariq King",        sub:"ST · Class of 2027 · St. Benedict's",  type:"athlete",sport:"Soccer"},
        {id:"a6",init:"JR",name:"Jordan Reed",       sub:"CB · Class of 2027 · Bergen Catholic",  type:"athlete",sport:"Soccer"},
        {id:"a7",init:"LM",name:"Luis Morales",      sub:"CDM · Class of 2028 · Seton Hall Prep", type:"athlete",sport:"Soccer"},
        {id:"a8",init:"DW",name:"David Wong",        sub:"RW · Class of 2026 · Don Bosco",        type:"athlete",sport:"Soccer"},
        {id:"c1",init:"KN",name:"Kyle Neptune",      sub:"Head Coach · Fordham · D1",             type:"coach",school:"Fordham"},
        {id:"c2",init:"RP",name:"Rick Pitino",       sub:"Head Coach · St. John's · D1",          type:"coach",school:"St. John's"},
        {id:"c3",init:"SC",name:"Speedy Claxton",    sub:"Head Coach · Hofstra · D1",             type:"coach",school:"Hofstra"},
        {id:"c4",init:"BK",name:"Brian Kim",         sub:"Asst. Coach · Bryant · D1",             type:"coach",school:"Bryant"},
        {id:"c5",init:"MR",name:"Mike Rhoades",      sub:"Head Coach · Penn State · D1",          type:"coach",school:"Penn State"},
      ];
      const[fSrch,setFSrch]=useState("");
      const[sent,setSent]=useState([]);
      const[unfollowed,setUnfollowed]=useState([]);
      const FOLLOWING_IDS=["a1","a2","a3","a4","a5","a6","c1","c2"];
      const isFollowing=id=>FOLLOWING_IDS.includes(id)&&!unfollowed.includes(id);
      const hasSent=id=>sent.includes(id);
      const filt=PEOPLE.filter(p=>{
        const q=fSrch.toLowerCase();
        return !q||p.name.toLowerCase().includes(q)||p.sub.toLowerCase().includes(q);
      });
      const TABS=["search","followers","following","requests"];
      return(
      <div onClick={e=>{if(e.target===e.currentTarget)setFollowOpen(false)}} style={{position:"fixed",inset:0,background:"rgba(17,24,39,.5)",zIndex:300,display:"flex",alignItems:"flex-end",backdropFilter:"blur(6px)"}}>
        <div style={{background:W,borderRadius:"16px 16px 0 0",width:"100%",maxWidth:430,margin:"0 auto",maxHeight:"86vh",display:"flex",flexDirection:"column"}}>
          <div style={{width:36,height:4,background:BD,borderRadius:2,margin:"12px auto 8px",flexShrink:0}}/>
          {/* Tabs */}
          <div style={{display:"flex",borderBottom:`1px solid ${BD}`,flexShrink:0}}>
            {TABS.map(t=>{
              const label=t==="requests"?`Requests (${followReqs.filter(r=>!accepted.includes(r.id)).length})`:t.charAt(0).toUpperCase()+t.slice(1);
              return <button key={t} onClick={()=>setFollowOpen(t)} style={{flex:1,background:"none",border:"none",borderBottom:`2px solid ${followOpen===t?B:"transparent"}`,padding:"10px 0",cursor:"pointer",fontSize:11,fontWeight:followOpen===t?700:500,color:followOpen===t?B:TM,transition:"all .12s"}}>{label}</button>;
            })}
          </div>

          <div style={{flex:1,overflowY:"auto",paddingBottom:36}}>

            {/* ── SEARCH TAB ── */}
            {followOpen==="search"&&<>
              <div style={{padding:"10px 16px",borderBottom:`1px solid ${BD}`,position:"sticky",top:0,background:W,zIndex:2}}>
                <div style={{display:"flex",alignItems:"center",gap:8,background:GR,border:`1px solid ${BD}`,borderRadius:8,padding:"0 12px",height:36}}>
                  <Ic.search size={13} color={TL}/>
                  <input autoFocus placeholder="Search athletes or coaches…" value={fSrch} onChange={e=>setFSrch(e.target.value)} style={{flex:1,border:"none",fontSize:13,color:T,background:"transparent",outline:"none"}}/>
                  {fSrch&&<button onClick={()=>setFSrch("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex"}}><Ic.x size={12} color={TL}/></button>}
                </div>
              </div>
              {!fSrch&&<p style={{fontSize:11,color:TL,textAlign:"center",padding:"28px 20px"}}>Search by name, sport, school, or position to find athletes and coaches to follow.</p>}
              {fSrch&&filt.length===0&&<p style={{fontSize:13,color:TL,textAlign:"center",padding:"28px 20px"}}>No results for "{fSrch}"</p>}
              {fSrch&&filt.map(p=>{
                const following=isFollowing(p.id);
                const requested=hasSent(p.id);
                return(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 20px",borderBottom:`1px solid ${GR}`}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:p.type==="coach"?BL:GR,border:`1px solid ${p.type==="coach"?BR:BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:p.type==="coach"?B:TM,flexShrink:0}}>{p.init}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:1}}>
                      <span style={{fontSize:13,fontWeight:600,color:T}}>{p.name}</span>
                      <span style={{fontSize:9,fontWeight:600,color:p.type==="coach"?B:TL,background:p.type==="coach"?BL:GR,padding:"1px 5px",borderRadius:3,border:`1px solid ${p.type==="coach"?BR:BD}`}}>{p.type==="coach"?"Coach":"Athlete"}</span>
                    </div>
                    <p style={{fontSize:11,color:TL,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.sub}</p>
                  </div>
                  {following
                    ?<button onClick={()=>setUnfollowed(u=>[...u,p.id])} style={{fontSize:11,fontWeight:600,color:TM,background:GR,border:`1px solid ${BD}`,padding:"5px 10px",borderRadius:5,cursor:"pointer",flexShrink:0}}>Following</button>
                    :requested
                    ?<span style={{fontSize:11,fontWeight:600,color:TL,background:GR,border:`1px solid ${BD}`,padding:"5px 10px",borderRadius:5,flexShrink:0}}>Requested</span>
                    :<button onClick={()=>setSent(s=>[...s,p.id])} style={{fontSize:11,fontWeight:600,color:W,background:B,border:"none",padding:"5px 10px",borderRadius:5,cursor:"pointer",flexShrink:0}}>Follow</button>
                  }
                </div>
              );})}
            </>}

            {/* ── FOLLOWERS TAB ── */}
            {followOpen==="followers"&&<>
              {[
                {init:"KN",name:"Kyle Neptune",   sub:"Head Coach · Fordham · D1",              type:"coach"},
                {init:"RP",name:"Rick Pitino",     sub:"Head Coach · St. John's · D1",           type:"coach"},
                {init:"SC",name:"Speedy Claxton",  sub:"Head Coach · Hofstra · D1",              type:"coach"},
                {init:"BK",name:"Brian Kim",       sub:"Asst. Coach · Bryant · D1",              type:"coach"},
                {init:"MR",name:"Mike Rhoades",    sub:"Head Coach · Penn State · D1",           type:"coach"},
                {init:"TK",name:"Tariq King",      sub:"ST · Class of 2027 · St. Benedict's",   type:"athlete"},
                {init:"JR",name:"Jordan Reed",     sub:"CB · Class of 2027 · Bergen Catholic",   type:"athlete"},
                {init:"LM",name:"Luis Morales",    sub:"CDM · Class of 2028 · Seton Hall Prep",  type:"athlete"},
              ].concat(accepted.map(id=>followReqs.find(r=>r.id===id)).filter(Boolean).map(r=>({init:r.name.split(" ").map(n=>n[0]).join(""),name:r.name,sub:`${r.sport} · ${r.school}`,type:"athlete"}))).map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 20px",borderBottom:`1px solid ${GR}`}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:p.type==="coach"?BL:GR,border:`1px solid ${p.type==="coach"?BR:BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:p.type==="coach"?B:TM,flexShrink:0}}>{p.init}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:1}}>{p.name}</p>
                    <p style={{fontSize:11,color:TL,margin:0}}>{p.sub}</p>
                  </div>
                  <span style={{fontSize:9,fontWeight:600,color:p.type==="coach"?B:TL,background:p.type==="coach"?BL:GR,padding:"2px 7px",borderRadius:3,border:`1px solid ${p.type==="coach"?BR:BD}`,flexShrink:0}}>{p.type==="coach"?"Coach":"Athlete"}</span>
                </div>
              ))}
            </>}

            {/* ── FOLLOWING TAB ── */}
            {followOpen==="following"&&<>
              {[
                {id:"c1",init:"KN",name:"Kyle Neptune",   sub:"Head Coach · Fordham · D1",           type:"coach"},
                {id:"c2",init:"RP",name:"Rick Pitino",    sub:"Head Coach · St. John's · D1",        type:"coach"},
                {id:"a1",init:"MJ",name:"Marcus Johnson", sub:"PG · Class of 2027 · Lincoln HS",     type:"athlete"},
                {id:"a2",init:"CR",name:"Caleb Rivers",   sub:"PG · Class of 2026 · Rice HS",        type:"athlete"},
                {id:"a3",init:"IT",name:"Isaiah Torres",  sub:"CB · Class of 2026 · Paul VI HS",     type:"athlete"},
                {id:"a4",init:"DM",name:"Devon Mitchell", sub:"SG · Class of 2027 · Stepinac",       type:"athlete"},
                {id:"a5",init:"TK",name:"Tariq King",     sub:"ST · Class of 2027 · St. Benedict's", type:"athlete"},
                {id:"a6",init:"JR",name:"Jordan Reed",    sub:"CB · Class of 2027 · Bergen Catholic", type:"athlete"},
              ].filter(p=>!unfollowed.includes(p.id)).map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 20px",borderBottom:`1px solid ${GR}`}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:p.type==="coach"?BL:GR,border:`1px solid ${p.type==="coach"?BR:BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:p.type==="coach"?B:TM,flexShrink:0}}>{p.init}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:1}}>{p.name}</p>
                    <p style={{fontSize:11,color:TL,margin:0}}>{p.sub}</p>
                  </div>
                  <button onClick={()=>setUnfollowed(u=>[...u,p.id])} style={{fontSize:11,fontWeight:600,color:TM,background:GR,border:`1px solid ${BD}`,padding:"4px 10px",borderRadius:5,cursor:"pointer",flexShrink:0}}>Following</button>
                </div>
              ))}
              {sent.length>0&&<>
                <p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.5,textTransform:"uppercase",padding:"12px 20px 6px",margin:0}}>Requested</p>
                {PEOPLE.filter(p=>sent.includes(p.id)).map((p,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 20px",borderBottom:`1px solid ${GR}`}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:GR,border:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:TM,flexShrink:0}}>{p.init}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:1}}>{p.name}</p>
                      <p style={{fontSize:11,color:TL,margin:0}}>{p.sub}</p>
                    </div>
                    <span style={{fontSize:11,color:TL,background:GR,border:`1px solid ${BD}`,padding:"4px 10px",borderRadius:5,flexShrink:0}}>Requested</span>
                  </div>
                ))}
              </>}
            </>}

            {/* ── REQUESTS TAB ── */}
            {followOpen==="requests"&&<>
              {followReqs.filter(r=>!accepted.includes(r.id)).length===0
                ?<p style={{fontSize:13,color:TL,textAlign:"center",padding:"40px 20px"}}>No pending requests</p>
                :followReqs.filter(r=>!accepted.includes(r.id)).map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:`1px solid ${GR}`}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:GR,border:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:TM,flexShrink:0}}>{r.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:1}}>
                      <p style={{fontSize:13,fontWeight:600,color:T,margin:0}}>{r.name}</p>
                      {r.mutual&&<span style={{fontSize:9,color:TL,background:GR,border:`1px solid ${BD}`,padding:"1px 5px",borderRadius:3}}>Mutual</span>}
                    </div>
                    <p style={{fontSize:11,color:TL,margin:0}}>{r.sport} · {r.school}</p>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button onClick={()=>setAccepted(a=>[...a,r.id])} style={{padding:"5px 12px",borderRadius:5,border:"none",background:B,color:W,fontSize:11,fontWeight:600,cursor:"pointer"}}>Accept</button>
                    <button style={{padding:"5px 10px",borderRadius:5,border:`1px solid ${BD}`,background:W,color:TM,fontSize:11,fontWeight:500,cursor:"pointer"}}>Decline</button>
                  </div>
                </div>
              ))}
            </>}

          </div>
        </div>
      </div>
    );})()} 

    {/* SETTINGS */}
    {settingsOpen&&<div style={{position:"fixed",inset:0,background:"#050505",zIndex:400}}>
      <div style={{width:"100%",maxWidth:430,height:"100%",margin:"0 auto",background:W,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <div style={{background:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <button onClick={()=>setSettingsOpen(false)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0}}><Ic.back size={18} color={B}/><span style={{fontSize:13,fontWeight:600,color:B}}>Back</span></button>
        <span style={{fontSize:14,fontWeight:700,color:T}}>Settings</span>
        <div style={{width:60}}/>
      </div>
      <div style={{padding:"0 0 40px"}}>
        <div style={{padding:"20px 16px 8px"}}><p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",margin:0}}>Account</p></div>
        {[["Edit Profile","Update your name, photo, and bio"],["Change Email","Update your email address"],["Change Password","Update your password"],["Notification Preferences","Control what you get notified about"],["Recruiting Preferences","Set your target divisions and sports"]].map(([t,s])=>(
          <div key={t} onClick={()=>notify("Coming soon")} style={{padding:"13px 16px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div><p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:2}}>{t}</p><p style={{fontSize:11,color:TL,margin:0}}>{s}</p></div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div style={{padding:"20px 16px 8px"}}><p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",margin:0}}>Profile & Privacy</p></div>
        {[["Profile Visibility","Control who can see your profile"],["Film Privacy","Control who can view your highlight clips"],["Block / Report","Manage blocked accounts"],["Data & Downloads","Download a copy of your data"]].map(([t,s])=>(
          <div key={t} onClick={()=>notify("Coming soon")} style={{padding:"13px 16px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div><p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:2}}>{t}</p><p style={{fontSize:11,color:TL,margin:0}}>{s}</p></div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div style={{padding:"20px 16px 8px"}}><p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",margin:0}}>Subscription</p></div>
        {[["Current Plan","Free — Athlete Basic"],["Upgrade to Verified","$29 one-time · Verified badge + visibility boost"],["Upgrade to Elite","$49 one-time · Analytics + priority camp registration"]].map(([t,s])=>(
          <div key={t} onClick={()=>notify("Coming soon")} style={{padding:"13px 16px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div><p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:2}}>{t}</p><p style={{fontSize:11,color:TL,margin:0}}>{s}</p></div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div style={{padding:"20px 16px 8px"}}><p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",margin:0}}>Legal</p></div>
        {[["Terms of Service","Read our full terms of service"],["Privacy Policy","How we collect and use your data"],["Cookie Policy","Our cookie usage policy"],["NCAA Compliance","Recruiting rules and compliance information"],["Accessibility Statement","Our commitment to accessibility"]].map(([t,s])=>(
          <div key={t} onClick={()=>notify("Opening...")} style={{padding:"13px 16px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div><p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:2}}>{t}</p><p style={{fontSize:11,color:TL,margin:0}}>{s}</p></div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div style={{padding:"20px 16px 8px"}}><p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",margin:0}}>Support</p></div>
        {[["Help Center","FAQs and guides"],["Contact Support","Get help from our team"],["Send Feedback","Help us improve FastTrack"],["Rate the App","Leave a review on the App Store"]].map(([t,s])=>(
          <div key={t} onClick={()=>notify("Coming soon")} style={{padding:"13px 16px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div><p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:2}}>{t}</p><p style={{fontSize:11,color:TL,margin:0}}>{s}</p></div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div style={{padding:"20px 16px"}}>
          <button onClick={()=>notify("Signed out")} style={{width:"100%",padding:"12px",borderRadius:8,border:`1px solid #fecaca`,background:"#fff5f5",color:"#dc2626",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:8}}>Sign Out</button>
          <button onClick={()=>notify("Account deletion requested")} style={{width:"100%",padding:"12px",borderRadius:8,border:"none",background:"none",color:TL,fontSize:12,fontWeight:500,cursor:"pointer"}}>Delete Account</button>
          <p style={{fontSize:10,color:TL,textAlign:"center",marginTop:16}}>FastTrack v1.0.0 · © 2026 FastTrack Recruitment Inc.</p>
        </div>
      </div>
      </div>
    </div>}
  </div>;
}

// ── COACH APP ──
function CoachApp({user=null}){
  const[tab,setTab]=useState("dashboard");
  const[notif,setNotif]=useState(null);
  const[gf,setGf]=useState("All");const[pf,setPf]=useState("All");const[sf,setSf]=useState("All");const[df,setDf]=useState("All");const[sq,setSq]=useState("");
  const[selA,setSelA]=useState(null);
  const[board,setBoard]=useState({identified:[ADB[1],ADB[4]],contacted:[ADB[0],ADB[5]],called:[ADB[2],ADB[3]],visited:[],offered:[ADB[7]],committed:[]});
  const[moveOpen,setMoveOpen]=useState(null);
  const[camps,setCamps]=useState(SCAMPS);
  const[campOpen,setCampOpen]=useState(false);const[selCamp,setSelCamp]=useState(null);
  const[cf,setCf]=useState({title:"",date:"",loc:"",cost:"",total:"",sport:"Basketball",desc:""});
  const[nmo,setNmo]=useState(false);const[nma,setNma]=useState(null);const[nmt,setNmt]=useState("");const[favs,setFavs]=useState([]);const[followed,setFollowed]=useState([]);const[settingsOpen,setSettingsOpen]=useState(false);
  const[caiOpen,setCaiOpen]=useState(false);
  const[caiAth,setCaiAth]=useState(null);
  const[caiCtx,setCaiCtx]=useState("");
  const[caiStep,setCaiStep]=useState(0);
  const[caiDraft,setCaiDraft]=useState("");
  const msg=useMsgs(SC);
  const notify=m=>{setNotif(m);setTimeout(()=>setNotif(null),3e3);};
  const allB=Object.values(board).flat();
  const onB=id=>allB.find(a=>a.id===id);
  const saveB=(a,st="identified")=>{if(onB(a.id)){notify("Already on board");return;}setBoard(b=>({...b,[st]:[...b[st],a]}));notify(`${a.first} ${a.last} added to board`);};
  const moveB=(a,from,to)=>{setBoard(b=>({...b,[from]:b[from].filter(x=>x.id!==a.id),[to]:[...b[to],a]}));setMoveOpen(null);notify(`Moved to ${CST.find(s=>s.id===to).label}`);};
  const startMsg=()=>{
    if(!nma||!nmt.trim())return;
    const a=ADB.find(x=>x.id===nma);const ex=msg.threads.find(t=>t.athId===a.id);
    const now=new Date();const ts=`${now.toLocaleDateString("en-US",{month:"short",day:"numeric"})}, ${now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}`;
    const m={id:Date.now(),from:"coach",text:nmt.trim(),time:ts};
    if(ex){msg.setT(ts=>ts.map(t=>t.id===ex.id?{...t,msgs:[...t.msgs,m]}:t));msg.setA({...ex,msgs:[...ex.msgs,m]});}
    else{const t={id:Date.now(),athId:a.id,athName:`${a.first} ${a.last}`,school:a.school,athEmail:`${a.first.toLowerCase()}@email.com`,unread:0,msgs:[m]};msg.setT(ts=>[t,...ts]);msg.setA(t);if(!onB(a.id))saveB(a,"contacted");}
    setNmo(false);setNma(null);setNmt("");setTab("messages");notify(`Message sent to ${a.first} ${a.last}`);
  };
  const resetCai=()=>{setCaiOpen(false);setCaiAth(null);setCaiCtx("");setCaiStep(0);setCaiDraft("");};
  const genDraftCoach=(ath,coach,ctx)=>{
    const coachFirst=(coach?.first||"Coach");
    const coachLast=(coach?.last||"");
    const pos=(ath?.positions||["athlete"])[0];
    const schName=coach?.school||"our program";
    const div=coach?.div||"";
    const sport=coach?.sport||"";
    const ctxPara=ctx?.trim()||`After reviewing your profile and highlights, I'm impressed by what I see. Your game translates well to what we look for in our system.`;
    return `Dear ${ath?.first||"Athlete"},\n\nMy name is Coach ${coachLast||coachFirst} from ${schName}'s ${div} ${sport} program. I came across your recruiting profile and wanted to reach out personally.\n\n${ctxPara}\n\nWe believe you could be an excellent fit here at ${schName} and I'd love to schedule a call to tell you more about our program and learn more about your goals and recruiting timeline.\n\nAre you available for a call this week?\n\nCoach ${coachLast||coachFirst}\n${schName} ${sport} | ${div}`;
  };
  const launchCAI=()=>{
    if(!caiAth){notify("Select an athlete");return;}
    setCaiStep(1);
    setTimeout(()=>{
      const ath=ADB.find(a=>a.id===caiAth);
      setCaiDraft(genDraftCoach(ath,user,caiCtx));
      setCaiStep(2);
    },1500);
  };
  const sendCaiDraft=()=>{
    const ath=ADB.find(a=>a.id===caiAth);if(!ath||!caiDraft.trim())return;
    const now=new Date();
    const ts=`${now.toLocaleDateString("en-US",{month:"short",day:"numeric"})}, ${now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}`;
    const m={id:Date.now(),from:"coach",text:caiDraft.trim(),time:ts};
    const ex=msg.threads.find(t=>t.athId===ath.id);
    if(ex){msg.setT(ts=>ts.map(t=>t.id===ex.id?{...t,msgs:[...t.msgs,m]}:t));}
    else{const t={id:Date.now(),athId:ath.id,athName:`${ath.first} ${ath.last}`,school:ath.school,athEmail:`${ath.first.toLowerCase()}@email.com`,unread:0,msgs:[m]};msg.setT(ts=>[t,...ts]);if(!onB(ath.id))saveB(ath,"contacted");}
    resetCai();setTab("messages");notify(`Sent to ${ath.first} ${ath.last}`);
  };
  const postCamp=()=>{
    if(!cf.title||!cf.date||!cf.loc)return;
    const c={...cf,id:Date.now(),total:parseInt(cf.total)||20,spots:parseInt(cf.total)||20,reqs:[]};
    setCamps(cs=>[c,...cs]);setCampOpen(false);setCf({title:"",date:"",loc:"",cost:"",total:"",sport:"Basketball",desc:""});
    notify("Camp posted successfully");
  };
  const updReq=(cid,aid,status)=>{
    setCamps(cs=>cs.map(c=>{if(c.id!==cid)return c;const reqs=c.reqs.map(r=>r.athId===aid?{...r,status}:r);const spots=status==="accepted"?Math.max(0,c.spots-1):c.spots;return{...c,reqs,spots};}));
    if(selCamp?.id===cid) setSelCamp(c=>({...c,reqs:c.reqs.map(r=>r.athId===aid?{...r,status}:r)}));
    notify(status==="accepted"?"Spot accepted — athlete notified":"Athlete declined");
  };
  const allPos=["All",...new Set(ADB.flatMap(a=>a.positions))];
  const allSt=["All",...new Set(ADB.map(a=>a.state))].sort();
  const fil=ADB.filter(a=>{const q=sq.toLowerCase();return(!q||`${a.first} ${a.last} ${a.school} ${a.state}`.toLowerCase().includes(q))&&(gf==="All"||a.gradYear===gf)&&(pf==="All"||a.positions.includes(pf))&&(sf==="All"||a.state===sf)&&(df==="All"||a.div===df);});
  const tReq=camps.reduce((a,c)=>a+c.reqs.filter(r=>r.status==="pending").length,0);
  const cName=user?`${user.first} ${user.last}`:"Kyle Neptune";
  const cSchool=user?.school||"Fordham University";
  const cRole=user?.role||"Head Coach";
  const cSport=user?.sport||"Basketball";
  const cEmail=user?.email||"neptune@fordham.edu";
  const cDiv=user?.div||"D1";
  const cInit=cName.split(" ").map(n=>n[0]).join("").slice(0,2);
  const inTV=tab==="messages"&&msg.active;
  const inCD=tab==="camps"&&selCamp;
  const TABS=[{id:"dashboard",label:"Home",Ic:Ic.grid},{id:"athletes",label:"Athletes",Ic:Ic.users},{id:"board",label:"Board",Ic:Ic.board},{id:"camps",label:"Camps",Ic:Ic.camp},{id:"messages",label:"Messages",Ic:Ic.msg}];

  return <div style={{display:"flex",flexDirection:"column",height:"100vh",background:GR,overflow:"hidden",textAlign:"left"}}>
    <style>{CSS}</style>
    {/* TOP BAR */}
    <div style={{background:W,borderBottom:`1px solid ${BD}`,padding:"0 20px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
      {inTV?<button onClick={()=>msg.setA(null)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0}}><Ic.back size={18} color={B}/><span style={{fontSize:12,fontWeight:600,color:B}}>Messages</span></button>
       :inCD?<button onClick={()=>setSelCamp(null)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0}}><Ic.back size={18} color={B}/><span style={{fontSize:12,fontWeight:600,color:B}}>Camps</span></button>
       :<Logo sz={21}/>}
      {inTV?<div style={{textAlign:"center",flex:1}}><p style={{fontSize:13,fontWeight:700,color:T,margin:0}}>{msg.active.athName}</p><p style={{fontSize:10,color:TL,margin:0}}>{msg.active.school}</p></div>
       :inCD?<p style={{fontSize:13,fontWeight:700,color:T,margin:0,flex:1,textAlign:"center"}}>{selCamp.title}</p>
       :<div style={{display:"flex",alignItems:"center",gap:7}}><Pill ch="Coach" color={B} bg={BL}/><div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:5,height:5,borderRadius:"50%",background:G}}/><span style={{fontSize:11,color:G,fontWeight:600}}>Verified</span></div></div>}
      {inTV?<button style={{background:"none",border:"none",cursor:"pointer",padding:0}} onClick={()=>notify(`Connected: ${msg.active.athEmail}`)}><Ic.info size={18}/></button>
       :<button onClick={()=>setSettingsOpen(true)} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",alignItems:"center"}}><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={TM} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>}
    </div>

    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
      {/* DASHBOARD */}
      {tab==="dashboard"&&<div className="fade" style={{flex:1}}>

        {/* Coach Identity Header */}
        <div style={{background:W,borderBottom:`1px solid ${BD}`,padding:"18px 17px 16px",marginBottom:1}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:GR,border:`1.5px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:T,flexShrink:0}}>{cInit}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                <p style={{fontSize:14,fontWeight:700,color:T,letterSpacing:-.2,margin:0}}>{cName}</p>
                <div style={{display:"flex",alignItems:"center",gap:3,background:GL,border:`1px solid ${GBR}`,borderRadius:4,padding:"2px 8px"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:G}}/><span style={{fontSize:10,color:G,fontWeight:700,letterSpacing:.3}}>VERIFIED</span>
                </div>
              </div>
              <p style={{fontSize:12,color:TM,margin:0}}>{cRole} · {cSchool} · {cDiv}</p>
              <p style={{fontSize:11,color:TL,margin:"2px 0 0"}}>{cSport} · {cEmail}</p>
            </div>
          </div>
          {/* Quick action buttons */}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setTab("athletes")} style={{flex:1,background:B,border:"none",borderRadius:6,padding:"9px 0",cursor:"pointer",fontSize:12,fontWeight:600,color:W}}>Find Athletes</button>
            <button onClick={()=>setTab("messages")} style={{flex:1,background:W,border:`1.5px solid ${BD}`,borderRadius:6,padding:"9px 0",cursor:"pointer",fontSize:12,fontWeight:600,color:T,position:"relative"}}>
              Messages{msg.total>0&&<span style={{position:"absolute",top:-5,right:-5,width:16,height:16,borderRadius:"50%",background:"#ef4444",color:W,fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{msg.total}</span>}
            </button>
            <button onClick={()=>setCampOpen(true)} style={{flex:1,background:W,border:`1.5px solid ${BD}`,borderRadius:6,padding:"9px 0",cursor:"pointer",fontSize:12,fontWeight:600,color:T}}>Post Camp</button>
          </div>
        </div>

        {/* KPI row */}
        <div style={{background:W,padding:"10px 16px",marginBottom:1}}>
          <p style={{fontSize:10,fontWeight:600,color:TL,letterSpacing:.3,textTransform:"uppercase",marginBottom:8}}>Overview</p>
          <div style={{display:"flex",background:GR,border:`1px solid ${BD}`,borderRadius:6,overflow:"hidden"}}>{[[allB.length,"On Board"],[board.contacted?.length||0,"Contacted"],[tReq,"Pending"],[board.offered?.length||0,"Offered"]].map(([v,l],i,a)=><div key={l} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRight:i<a.length-1?`1px solid ${BD}`:"none"}}><p style={{fontSize:17,fontWeight:700,color:T,margin:0,lineHeight:1,letterSpacing:-.4}}>{v}</p><p style={{fontSize:9,color:TL,fontWeight:500,marginTop:3,textTransform:"uppercase",letterSpacing:.4,margin:0}}>{l}</p></div>)}</div>
        </div>

        {/* Pipeline progress bar */}
        <div style={{background:W,padding:"14px 17px",marginBottom:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <p style={{fontSize:11,fontWeight:700,color:TL,letterSpacing:.3,textTransform:"uppercase",margin:0}}>Recruiting Pipeline</p>
            <button onClick={()=>setTab("board")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:B}}>View Board</button>
          </div>
          {CST.map(st=>{const n=board[st.id]?.length||0;const pct=allB.length>0?(n/allB.length)*100:0;return <div key={st.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:11,color:TM,width:80,flexShrink:0}}>{st.label}</span>
            <div style={{flex:1,background:GR,borderRadius:2,height:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:n>0?B:BD,borderRadius:2,transition:"width .3s"}}/>
            </div>
            <span style={{fontSize:11,fontWeight:600,color:n>0?T:TL,width:14,textAlign:"right"}}>{n}</span>
          </div>;})}
        </div>

        {/* Pending camp requests */}
        {tReq>0&&<div style={{background:W,marginBottom:1}}>
          <div style={{padding:"12px 17px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontSize:11,fontWeight:700,color:TL,letterSpacing:.3,textTransform:"uppercase",margin:0}}>Camp Requests Pending</p>
            <button onClick={()=>setTab("camps")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:B}}>View Camps</button>
          </div>
          {camps.filter(c=>c.reqs.some(r=>r.status==="pending")).map(camp=>{
            const pend=camp.reqs.filter(r=>r.status==="pending");
            return <div key={camp.id} className="trc" onClick={()=>{setSelCamp(camp);setTab("camps");}}>
              <div style={{width:36,height:36,borderRadius:5,background:GR,border:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic.camp size={15} color={TM}/></div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:700,color:T,margin:0,marginBottom:1}}>{camp.title}</p>
                <p style={{fontSize:11,color:TM,margin:0}}>{camp.date} · {camp.spots} spots left</p>
              </div>
              <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:6,padding:"3px 9px",flexShrink:0}}>
                <span style={{fontSize:11,color:"#92400e",fontWeight:700}}>{pend.length} pending</span>
              </div>
            </div>;
          })}
        </div>}

        {/* Recent messages */}
        <div style={{background:W,marginBottom:1}}>
          <div style={{padding:"12px 17px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontSize:11,fontWeight:700,color:TL,letterSpacing:.3,textTransform:"uppercase",margin:0}}>Recent Messages</p>
            <button onClick={()=>setTab("messages")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:B}}>View All</button>
          </div>
          {!msg.threads.length&&<p style={{padding:"14px 17px",fontSize:13,color:TL,textAlign:"center"}}>No messages yet.</p>}
          {msg.threads.map(t=>{const last=t.msgs[t.msgs.length-1];return <div key={t.id} className="trc" onClick={()=>{msg.open(t);setTab("messages");}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:GR,border:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:TM,flexShrink:0}}>{t.athName.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1}}>
                <p style={{fontSize:13,fontWeight:t.unread?700:600,color:T,margin:0}}>{t.athName}</p>
                <p style={{fontSize:10,color:TL,margin:0,flexShrink:0,marginLeft:8}}>{last.time}</p>
              </div>
              <p style={{fontSize:11,color:TM,margin:0,marginBottom:1,fontWeight:500}}>{t.school}</p>
              <p style={{fontSize:12,color:t.unread?T:TL,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{last.from==="coach"?"You: ":""}{last.text}</p>
            </div>
            {t.unread>0&&<div style={{width:16,height:16,borderRadius:"50%",background:B,color:W,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:8}}>{t.unread}</div>}
          </div>;})}
        </div>

        {/* New athletes - compact */}
        <div style={{background:W,marginBottom:8}}>
          <div style={{padding:"12px 17px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontSize:11,fontWeight:700,color:TL,letterSpacing:.3,textTransform:"uppercase",margin:0}}>Newly Verified Athletes</p>
            <button onClick={()=>setTab("athletes")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:B}}>Browse All</button>
          </div>
          {ADB.filter(a=>a.verified).slice(0,3).map(a=>{const sv=onB(a.id);return <div key={a.id} className="ar">
            <div style={{width:35,height:35,borderRadius:"50%",background:GR,border:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:TM,flexShrink:0}}>{a.first[0]}{a.last[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:1}}>
                <p style={{fontSize:13,fontWeight:700,color:T,margin:0}}>{a.first} {a.last}</p>
                <div style={{width:11,height:11,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic.check size={6} color={W}/></div>
              </div>
              <p style={{fontSize:11,color:TM,margin:0}}>{a.positions[0]} · Class of {a.gradYear} · {a.school}, {a.state}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
              <Pill ch={a.div} color={B} bg={BL}/>
              <button onClick={e=>{e.stopPropagation();saveB(a);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:sv?G:B,padding:0}}>{sv?"Saved":"Save"}</button>
            </div>
          </div>;})}
        </div>

      </div>}

      {/* ATHLETES */}
      {tab==="athletes"&&<div className="fade" style={{flex:1}}>
        <div style={{background:W,borderBottom:`1px solid ${BD}`,padding:"8px 14px 7px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,background:GR,border:`1px solid ${BD}`,borderRadius:6,padding:"0 10px",marginBottom:6,height:32}}>
            <Ic.search size={12} color={TL}/>
            <input placeholder="Search…" value={sq} onChange={e=>setSq(e.target.value)} style={{flex:1,border:"none",fontSize:12,color:T,background:"transparent",outline:"none"}}/>
            {sq&&<button onClick={()=>setSq("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,lineHeight:1,display:"flex"}}><Ic.x size={11} color={TL}/></button>}
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <FilterPill label="Class" value={gf} options={["All",...GY]} onChange={setGf}/>
            <FilterPill label="Position" value={pf} options={allPos} onChange={setPf}/>
            <FilterPill label="State" value={sf} options={allSt} onChange={setSf}/>
            <span style={{marginLeft:"auto",fontSize:10,color:TL,flexShrink:0}}>{fil.length} athletes</span>
          </div>
        </div>
        <div style={{background:W}}>
          {fil.map(a=>{const sv=onB(a.id);return <div key={a.id} className="sr" style={{padding:"10px 16px",alignItems:"center"}} onClick={()=>setSelA(a)}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                <span style={{fontSize:13,fontWeight:700,color:T}}>{a.first} {a.last}</span>
                {a.verified&&<div style={{width:11,height:11,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic.check size={7} color={W}/></div>}
                <span style={{fontSize:10,fontWeight:600,color:B,background:BL,padding:"1px 6px",borderRadius:3,marginLeft:1}}>{a.div}</span>
              </div>
              <p style={{fontSize:11,color:TM,margin:0,marginBottom:1}}>{a.positions.join(", ")} · {a.gradYear} · {a.school}, {a.state}</p>
              <p style={{fontSize:10,color:TL,margin:0}}>{a.height} · {a.weight} lbs · GPA {a.gpa} · {a.views} views</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0,alignItems:"flex-end"}}>
              <button onClick={e=>{e.stopPropagation();saveB(a);}} style={{background:sv?BL:GR,border:`1px solid ${sv?BR:BD}`,cursor:"pointer",fontSize:11,fontWeight:600,color:sv?B:TM,padding:"4px 10px",borderRadius:5}}>{sv?"Saved":"Save"}</button>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <button onClick={e=>{e.stopPropagation();setFollowed(f=>f.includes(a.id)?f.filter(x=>x!==a.id):[...f,a.id]);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:followed.includes(a.id)?TM:B,padding:0}}>{followed.includes(a.id)?"Following":"Follow"}</button>
                <button onClick={e=>{e.stopPropagation();setNma(a.id);setNmo(true);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:B,padding:0}}>Message</button>
              </div>
            </div>
          </div>;})}
          {!fil.length&&<p style={{padding:"36px 0",textAlign:"center",color:TL,fontSize:13}}>No athletes match your filters.</p>}
        </div>
      </div>}

      {/* BOARD */}
      {tab==="board"&&<div className="fade" style={{flex:1}}>
        <div style={{background:W,padding:"12px 17px 10px",borderBottom:`1px solid ${BD}`,position:"sticky",top:0,zIndex:10}}>
          <p style={{fontSize:13,fontWeight:700,color:T,margin:0,marginBottom:1}}>Recruiting Board</p>
          <p style={{fontSize:11,color:TL,margin:0}}>Tap any athlete card to move stages</p>
        </div>
        <div style={{padding:"12px 0 12px 13px",overflowX:"auto"}}>
          <div style={{display:"flex",gap:9,paddingRight:13,minWidth:"min-content"}}>
            {CST.map(st=>{const items=board[st.id]||[];return <div key={st.id} style={{flexShrink:0,width:120,background:GR,border:`1px solid ${BD}`,borderRadius:6,padding:"8px 7px"}}>
              <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:7,paddingBottom:5,borderBottom:`1px solid ${BD}`}}>
                <span style={{fontSize:9,fontWeight:700,color:TM,letterSpacing:.4,textTransform:"uppercase",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{st.label}</span>
                <span style={{fontSize:10,fontWeight:700,color:T}}>{items.length}</span>
              </div>
              {items.map(a=><div key={a.id} className="bc" style={{padding:"6px 7px",marginBottom:4}} onClick={()=>setMoveOpen({athlete:a,fromStage:st.id})}><p style={{fontSize:10,fontWeight:600,color:T,marginBottom:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.first} {a.last}</p><p style={{fontSize:9,color:TL,margin:0}}>{a.positions[0]} · {a.gradYear}</p></div>)}
              {!items.length&&<div style={{textAlign:"center",padding:"6px 0",fontSize:9,color:TL}}>—</div>}
            </div>;})}
          </div>
        </div>
        <div style={{background:W,marginTop:1,padding:"13px 17px"}}>
          <p style={{fontSize:11,fontWeight:700,color:TL,letterSpacing:.3,textTransform:"uppercase",marginBottom:10}}>Board Summary</p>
          {CST.map(st=>{const n=board[st.id]?.length||0;const p=allB.length>0?(n/allB.length)*100:0;return <div key={st.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:11,color:TM,width:82,flexShrink:0}}>{st.label}</span>
            <div style={{flex:1,background:GR,borderRadius:2,height:3,overflow:"hidden"}}><div style={{height:"100%",width:`${p}%`,background:n>0?B:BD,borderRadius:2,transition:"width .3s"}}/></div>
            <span style={{fontSize:11,fontWeight:600,color:n>0?T:TL,width:13,textAlign:"right"}}>{n}</span>
          </div>;})}
        </div>
      </div>}

      {/* CAMPS LIST */}
      {tab==="camps"&&!selCamp&&<div className="fade" style={{flex:1}}>
        <div style={{background:W,padding:"12px 17px",borderBottom:`1px solid ${BD}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
          <div><p style={{fontSize:14,fontWeight:700,color:T,margin:0,marginBottom:1}}>My Camps</p><p style={{fontSize:11,color:TL,margin:0}}>Manage camps and review requests</p></div>
          <Btn ch="Post Camp" sm ac={B} onClick={()=>setCampOpen(true)}/>
        </div>
        {!camps.length&&<div style={{padding:"36px 17px",textAlign:"center"}}><p style={{fontSize:14,fontWeight:700,color:T,marginBottom:4}}>No camps posted yet</p><Btn ch="Post Your First Camp" ac={B} onClick={()=>setCampOpen(true)}/></div>}
        <div style={{padding:"11px 13px",display:"flex",flexDirection:"column",gap:9}}>
          {camps.map(c=>{const pend=c.reqs.filter(r=>r.status==="pending").length,acc=c.reqs.filter(r=>r.status==="accepted").length,pct=((c.total-c.spots)/c.total)*100;return <div key={c.id} className="cc" onClick={()=>setSelCamp(c)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}><p style={{fontSize:14,fontWeight:700,color:T,margin:0}}>{c.title}</p><p style={{fontSize:14,fontWeight:700,color:T,margin:0,flexShrink:0,marginLeft:7}}>{c.cost||"—"}</p></div>
            <p style={{fontSize:12,color:TM,marginBottom:1}}>{c.date}</p><p style={{fontSize:12,color:TM,marginBottom:11}}>{c.loc}</p>
            <div style={{display:"flex",gap:14,marginBottom:10}}>{[["Spots Left",c.spots],["Requests",c.reqs.length],["Accepted",acc]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><p style={{fontSize:16,fontWeight:700,color:T,lineHeight:1,margin:0}}>{v}</p><p style={{fontSize:9,color:TL,fontWeight:600,marginTop:2,letterSpacing:.5,textTransform:"uppercase",margin:0}}>{l}</p></div>)}</div>
            <div style={{background:GR,borderRadius:999,height:4,overflow:"hidden",marginBottom:9}}><div style={{height:"100%",borderRadius:999,background:c.spots<=2?"#dc2626":B,width:`${pct}%`,transition:"width .3s"}}/></div>
            {pend>0&&<div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:4,padding:"6px 11px",fontSize:11,color:"#92400e",fontWeight:600}}>{pend} pending request{pend>1?"s":""} · tap to review</div>}
          </div>;})}
        </div>
      </div>}

      {/* CAMP DETAIL */}
      {inCD&&<div className="fade" style={{flex:1,overflowY:"auto"}}>
        <div style={{padding:"13px 17px",display:"flex",flexDirection:"column",gap:11}}>
          <div style={{background:W,border:`1px solid ${BD}`,borderRadius:6,padding:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:11}}>
              {[["Date",selCamp.date],["Location",selCamp.loc],["Cost",selCamp.cost||"—"],["Spots",`${selCamp.spots} remaining`]].map(([l,v])=><div key={l} style={{background:GR,borderRadius:4,padding:"8px 10px"}}><p style={{fontSize:9,fontWeight:700,color:TL,letterSpacing:.6,textTransform:"uppercase",margin:0,marginBottom:2}}>{l}</p><p style={{fontSize:12,fontWeight:600,color:T,margin:0}}>{v}</p></div>)}
            </div>
            {selCamp.desc&&<p style={{fontSize:12,color:"#374151",lineHeight:1.65,margin:0}}>{selCamp.desc}</p>}
          </div>
          <p style={{fontSize:11,fontWeight:700,color:TL,letterSpacing:.3,textTransform:"uppercase"}}>Spot Requests ({selCamp.reqs.length})</p>
          {!selCamp.reqs.length&&<p style={{textAlign:"center",color:TL,fontSize:13,padding:"14px 0"}}>No requests yet.</p>}
          {selCamp.reqs.map(req=>{
            const a=ADB.find(x=>x.id===req.athId)||{first:req.name.split(" ")[0],last:req.name.split(" ").slice(1).join(" ")||"",positions:["—"],gradYear:"—",school:"—",state:"—"};
            return <div key={req.athId} style={{background:W,border:`1px solid ${BD}`,borderRadius:6,padding:13}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:11}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:GR,border:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:TM,flexShrink:0}}>{a.first[0]}{(a.last||" ")[0]}</div>
                <div style={{flex:1}}><p style={{fontSize:13,fontWeight:700,color:T,margin:0,marginBottom:2}}>{a.first} {a.last}</p><p style={{fontSize:11,color:TM,margin:0}}>{a.positions?.[0]||"—"} · {a.gradYear} · {a.school}, {a.state}</p></div>
                {req.status==="pending"&&<Pill ch="Pending" color="#d97706" bg="#fffbeb"/>}
                {req.status==="accepted"&&<Pill ch="Accepted" color={G} bg={GL}/>}
                {req.status==="declined"&&<Pill ch="Declined" color="#dc2626" bg="#fef2f2"/>}
              </div>
              {req.status==="pending"?<div style={{display:"flex",gap:7}}><Btn ch="Decline" sm full v="g" sx={{flex:1,color:"#dc2626",borderColor:"#fecaca"}} onClick={()=>updReq(selCamp.id,req.athId,"declined")}/><Btn ch="Accept" sm ac={B} sx={{flex:2}} onClick={()=>updReq(selCamp.id,req.athId,"accepted")}/></div>
              :<Btn ch="Send Message" sm full v="g" onClick={()=>{setNma(req.athId||null);setNmo(true);}}/>}
            </div>;
          })}
        </div>
      </div>}

      {/* MESSAGES LIST */}
      {tab==="messages"&&!msg.active&&<div className="fade" style={{flex:1}}>
        {/* Header */}
        <div style={{background:W,padding:"12px 17px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
          <div><p style={{fontSize:13,fontWeight:700,color:T,margin:0,marginBottom:1}}>Messages</p><p style={{fontSize:11,color:TL,margin:0}}>Connected to {cEmail}</p></div>
          <div style={{display:"flex",gap:7}}>
            <Btn ch="AI Draft" sm v="o" ac={B} onClick={()=>{resetCai();setCaiOpen(true);}}/>
            <Btn ch="New Message" sm ac={B} onClick={()=>setNmo(true)}/>
          </div>
        </div>
        <div style={{background:GR,borderBottom:`1px solid ${BD}`,padding:"7px 17px",display:"flex",alignItems:"center",gap:6}}><Ic.mail size={12} color={TM}/><p style={{fontSize:11,color:TM,margin:0}}>Sending from <strong style={{color:T}}>{cEmail}</strong></p></div>

        {!msg.threads.length&&<div style={{padding:"36px 17px",textAlign:"center"}}><p style={{fontSize:13,fontWeight:700,color:T,marginBottom:4}}>No messages yet</p><Btn ch="Message an Athlete" ac={B} onClick={()=>setNmo(true)}/></div>}

        {/* Favorited chats */}
        {favs.length>0&&<>
          <div style={{padding:"11px 17px 7px",background:GR,borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",gap:7}}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill={B} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <p style={{fontSize:10,fontWeight:600,color:TM,letterSpacing:.3,textTransform:"uppercase",margin:0}}>Favorites ({favs.length})</p>
          </div>
          {msg.threads.filter(t=>favs.includes(t.id)).map(t=>{const last=t.msgs[t.msgs.length-1];const isFav=favs.includes(t.id);return <div key={t.id} className="trc" style={{background:"#faf8ff"}}>
            <div onClick={()=>msg.open(t)} style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:GR,border:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:TM,flexShrink:0}}>{t.athName.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}><p style={{fontSize:13,fontWeight:700,color:T,margin:0}}>{t.athName}</p><p style={{fontSize:9,color:TL,margin:0,flexShrink:0,marginLeft:6}}>{last.time}</p></div>
                <p style={{fontSize:11,color:TM,margin:0,marginBottom:1}}>{t.school}</p>
                <p style={{fontSize:12,color:TL,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{last.from==="coach"?"You: ":""}{last.text}</p>
              </div>
            </div>
            <button onClick={e=>{e.stopPropagation();setFavs(f=>f.filter(id=>id!==t.id));notify("Removed from favorites");}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 6px",flexShrink:0}}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill={B} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
          </div>;})}
        </>}

        {/* All messages */}
        {msg.threads.length>0&&<>
          <div style={{padding:"11px 17px 7px",background:GR,borderBottom:`1px solid ${BD}`}}>
            <p style={{fontSize:11,fontWeight:700,color:TL,letterSpacing:.3,textTransform:"uppercase",margin:0}}>All Messages ({msg.threads.length})</p>
          </div>
          {msg.threads.map(t=>{const last=t.msgs[t.msgs.length-1];const isFav=favs.includes(t.id);return <div key={t.id} className="trc">
            <div onClick={()=>msg.open(t)} style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:GR,border:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:TM,flexShrink:0}}>{t.athName.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}><p style={{fontSize:13,fontWeight:t.unread?700:600,color:T,margin:0}}>{t.athName}</p><p style={{fontSize:9,color:TL,margin:0,flexShrink:0,marginLeft:6}}>{last.time}</p></div>
                <p style={{fontSize:11,color:TM,margin:0,marginBottom:1}}>{t.school}</p>
                <p style={{fontSize:12,color:t.unread?T:TL,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{last.from==="coach"?"You: ":""}{last.text}</p>
              </div>
              {t.unread>0&&<div style={{width:15,height:15,borderRadius:"50%",background:B,color:W,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:6}}>{t.unread}</div>}
            </div>
            <button onClick={e=>{e.stopPropagation();setFavs(f=>isFav?f.filter(id=>id!==t.id):[...f,t.id]);notify(isFav?"Removed from favorites":"Added to favorites");}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 6px",flexShrink:0,marginLeft:4}}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill={isFav?B:"none"} stroke={isFav?B:BD} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
          </div>;})}
        </>}
      </div>}

      {/* MESSAGE THREAD */}
      {tab==="messages"&&msg.active&&<ThreadUI thread={msg.active} inp={msg.inp} setInp={msg.setInp} onSend={()=>msg.send("coach",msg.active.athName)} endRef={msg.ref} ac={B} fromLabel={msg.active.athName} fromEmail={cEmail} onAttach={()=>notify("Attach coming soon")}/>}
    </div>

    {/* BOTTOM NAV */}
    <nav className="nav-app">
      {TABS.map(({id,label,Ic:Icon})=>{const a=tab===id,badge=id==="messages"?msg.total:id==="camps"?tReq:0;return <button key={id} className="nav-btn" onClick={()=>{setTab(id);if(id!=="messages")msg.setA(null);if(id!=="camps")setSelCamp(null);}}>
        <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",width:28,height:a?22:26}}>
          <Icon active={a} color={a?B:"var(--nav-icon)"} size={a?19:21}/>
          {badge>0&&<div style={{position:"absolute",top:-2,right:-4,width:13,height:13,borderRadius:"50%",background:"#ef4444",color:W,fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${W}`}}>{badge}</div>}
        </div>
        {a&&<span className="nav-label" style={{color:B}}>{label}</span>}
      </button>;})}
    </nav>

    {/* SHEETS */}
    <Sheet open={!!selA} onClose={()=>setSelA(null)} title={selA?`${selA.first} ${selA.last}`:""} sub={selA?`${selA.positions.join(", ")} · Class of ${selA.gradYear} · ${selA.school}, ${selA.state}`:""} ch={selA&&<>
      <div style={{display:"flex",gap:7,marginBottom:14}}>
        {[["Ht",selA.height],["Wt",selA.weight+" lbs"],["GPA",selA.gpa],["Views",selA.views]].map(([l,v])=><div key={l} style={{flex:1,background:GR,border:`1px solid ${BD}`,borderRadius:4,padding:"10px 5px",textAlign:"center"}}><p style={{fontSize:14,fontWeight:700,color:T,lineHeight:1,margin:0}}>{v}</p><p style={{fontSize:9,color:TL,fontWeight:600,marginTop:2,letterSpacing:.4,margin:0}}>{l}</p></div>)}
      </div>
      <div style={{background:GR,border:`1px solid ${BD}`,borderRadius:5,padding:"3px 13px",marginBottom:14}}>
        {[["Height",selA.height],["Weight",selA.weight+" lbs"],["GPA",selA.gpa],["Division",selA.div],["Tape Views",selA.views],["Verified",selA.verified?"Yes":"Pending"]].map(([l,v],i,a)=><DRow key={l} label={l} value={v} last={i===a.length-1}/>)}
      </div>
      <div style={{background:BL,border:`1px solid ${BR}`,borderRadius:5,padding:"11px 13px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}><Ic.play size={13} color={B}/><p style={{fontSize:12,color:B,margin:0}}>Highlight film available on their FastTrack profile</p></div>
      <div style={{display:"flex",gap:7}}>
        <Btn ch="Close" v="g" sx={{flex:1}} onClick={()=>setSelA(null)}/>
        <Btn ch="Message" v="o" ac={B} sx={{flex:1}} onClick={()=>{setNma(selA.id);setNmo(true);setSelA(null);}}/>
        <Btn ch={onB(selA.id)?"On Board":"Save to Board"} ac={B} sx={{flex:2,background:onB(selA.id)?BL:B,color:onB(selA.id)?B:W,border:onB(selA.id)?`1px solid ${BR}`:"none"}} onClick={()=>{saveB(selA);setSelA(null);}}/>
      </div>
    </>}/>

    <Sheet open={!!moveOpen} onClose={()=>setMoveOpen(null)} title={moveOpen?`${moveOpen.athlete.first} ${moveOpen.athlete.last}`:""} sub="Move to a different stage" ch={moveOpen&&CST.map(st=>{const cur=st.id===moveOpen.fromStage;return <div key={st.id} onClick={()=>{if(!cur)moveB(moveOpen.athlete,moveOpen.fromStage,st.id);}} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 12px",borderRadius:5,marginBottom:6,cursor:cur?"default":"pointer",background:cur?BL:GR,border:`1px solid ${cur?B:BD}`,transition:"all .15s"}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:st.gold?"#f59e0b":cur?B:BD,flexShrink:0}}/><span style={{flex:1,fontSize:13,fontWeight:cur?600:400,color:st.gold?"#92400e":cur?B:T}}>{st.label}{st.gold?" 🏆":""}</span>{cur&&<Pill ch="Current" color={B} bg={BL}/>}
    </div>;})}/>

    <Sheet open={campOpen} onClose={()=>setCampOpen(false)} title="Post a Camp" ch={<>
      <FL label="Camp Title" ch={<FIn ac={B} value={cf.title} onChange={e=>setCf(f=>({...f,title:e.target.value}))} placeholder="Elite Guard Camp 2026"/>}/>
      <div style={{display:"flex",gap:9}}><FL label="Date" ch={<FIn ac={B} value={cf.date} onChange={e=>setCf(f=>({...f,date:e.target.value}))} placeholder="Jun 21, 2026"/>}/><FL label="Cost" ch={<FIn ac={B} value={cf.cost} onChange={e=>setCf(f=>({...f,cost:e.target.value}))} placeholder="$125"/>}/></div>
      <FL label="Location" ch={<FIn ac={B} value={cf.loc} onChange={e=>setCf(f=>({...f,loc:e.target.value}))} placeholder="Gymnasium, City, State"/>}/>
      <div style={{display:"flex",gap:9}}><FL label="Sport" ch={<FSel ch={Object.keys(SP).map(s=><option key={s}>{s}</option>)} value={cf.sport} onChange={e=>setCf(f=>({...f,sport:e.target.value}))} style={{width:"100%"}}/>}/><FL label="Spots" ch={<FIn ac={B} type="number" value={cf.total} onChange={e=>setCf(f=>({...f,total:e.target.value}))} placeholder="24"/>}/></div>
      <FL label="Description" ch={<textarea rows={3} value={cf.desc} onChange={e=>setCf(f=>({...f,desc:e.target.value}))} placeholder="What will athletes experience?" style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${BD}`,borderRadius:4,fontSize:13,color:T,background:W,outline:"none"}} onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor=BD}/>}/>
      <Btn ch="Post Camp" full ac={B} dis={!cf.title||!cf.date||!cf.loc} onClick={postCamp}/>
    </>}/>

    {/* COACH AI DRAFT PANEL */}
    {caiOpen&&<div style={{position:"fixed",inset:0,background:"#050505",zIndex:400}}>
      <div style={{width:"100%",maxWidth:430,height:"100%",margin:"0 auto",background:W,display:"flex",flexDirection:"column"}}>
        <div style={{background:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <button onClick={resetCai} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0}}>
            <Ic.back size={18} color={B}/><span style={{fontSize:13,fontWeight:600,color:B}}>Messages</span>
          </button>
          <span style={{fontSize:14,fontWeight:700,color:T}}>AI Draft</span>
          <div style={{width:72}}/>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 16px 40px"}}>

          {/* ── STEP 0: SETUP ── */}
          {caiStep===0&&<>
            <FL label="Athlete" ch={<FSel value={caiAth||""} onChange={e=>setCaiAth(Number(e.target.value))} ch={[<option key="" value="" disabled>Select an athlete…</option>,...ADB.map(a=><option key={a.id} value={a.id}>{a.first} {a.last} — {a.positions[0]} · Class of {a.gradYear}</option>)]}/>}/>
            {caiAth&&(()=>{const a=ADB.find(x=>x.id===caiAth);return a?<div style={{background:BL,border:`1px solid ${BR}`,borderRadius:6,padding:"9px 12px",marginTop:-8,marginBottom:16,display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:BR,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:B,flexShrink:0}}>{a.first[0]}{a.last[0]}</div>
              <div>
                <p style={{fontSize:12,fontWeight:700,color:T,margin:0}}>{a.first} {a.last}</p>
                <p style={{fontSize:11,color:TM,margin:0}}>{a.positions[0]} · Class of {a.gradYear} · {a.school}, {a.state} · GPA {a.gpa}</p>
              </div>
            </div>:null;})()}
            <FL label="Context" hint="(optional)" ch={<div style={{border:`1.5px solid ${BD}`,borderRadius:8,padding:"9px 12px"}} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor=BD}>
              <textarea rows={4} placeholder="Why are you reaching out? Any specific film you liked, a recent tournament, mutual connection, scholarship interest…" value={caiCtx} onChange={e=>setCaiCtx(e.target.value)} style={{background:"transparent",width:"100%",border:"none",outline:"none",fontSize:13,color:T,lineHeight:1.6,fontFamily:"inherit"}}/>
            </div>}/>
            <div style={{background:BL,border:`1px solid ${BR}`,borderRadius:6,padding:"8px 12px",marginBottom:16,display:"flex",gap:6}}>
              <Ic.info size={12} active/><p style={{fontSize:11,color:"#C4622A",margin:0,lineHeight:1.5}}>AI will personalize the message using the athlete's profile — position, grad year, school, and GPA.</p>
            </div>
            <Btn ch="Generate Draft →" full dis={!caiAth} onClick={launchCAI}/>
          </>}

          {/* ── STEP 1: GENERATING ── */}
          {caiStep===1&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:320,gap:16}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:BL,border:`2px solid ${BR}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </svg>
            </div>
            <div style={{textAlign:"center"}}>
              <p style={{fontSize:14,fontWeight:700,color:T,margin:0,marginBottom:4}}>Generating your draft…</p>
              <p style={{fontSize:12,color:TM,margin:0}}>Personalizing for this athlete</p>
            </div>
          </div>}

          {/* ── STEP 2: EDIT & SEND ── */}
          {caiStep===2&&<>
            <div style={{marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <p style={{fontSize:13,fontWeight:700,color:T,margin:0}}>Your Draft</p>
              <button onClick={()=>{setCaiStep(0);setCaiDraft("");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:TM,fontWeight:500,padding:0}}>Edit Setup</button>
            </div>
            {caiAth&&(()=>{const a=ADB.find(x=>x.id===caiAth);return a?<div style={{background:GR,border:`1px solid ${BD}`,borderRadius:6,padding:"7px 12px",marginBottom:12,display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:BD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:TM,flexShrink:0}}>{a.first[0]}{a.last[0]}</div>
              <p style={{fontSize:11,color:TM,margin:0}}>To: <span style={{fontWeight:700,color:T}}>{a.first} {a.last}</span> · {a.positions[0]} · {a.school}</p>
            </div>:null;})()}
            <div style={{border:`1.5px solid ${BD}`,borderRadius:8,padding:"12px 14px",marginBottom:14}} tabIndex={-1} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor=BD}>
              <textarea rows={14} value={caiDraft} onChange={e=>setCaiDraft(e.target.value)} style={{background:"transparent",width:"100%",border:"none",outline:"none",fontSize:13,color:T,lineHeight:1.65,fontFamily:"inherit"}}/>
            </div>
            <div style={{background:BL,border:`1px solid ${BR}`,borderRadius:6,padding:"8px 12px",marginBottom:14,display:"flex",gap:6}}>
              <Ic.info size={12} active/><p style={{fontSize:11,color:"#C4622A",margin:0}}>Edit freely — this is your message, the AI just got you started.</p>
            </div>
            <Btn ch="Send Message" full dis={!caiDraft.trim()} ac={B} onClick={sendCaiDraft}/>
          </>}

        </div>
      </div>
    </div>}

    <Sheet open={nmo} onClose={()=>{setNmo(false);setNma(null);setNmt("");}} title="New Message" ch={<>
      <FL label="To — Select Athlete" ch={<><FSel ch={[<option key="" value="" disabled>Select an athlete…</option>,...ADB.map(a=><option key={a.id} value={a.id}>{a.first} {a.last} — {a.school}, {a.state}</option>)]} value={nma||""} onChange={e=>setNma(Number(e.target.value))}/>{nma&&<p style={{fontSize:11,color:TM,marginTop:4}}>Sends to <span style={{color:B,fontWeight:600}}>{ADB.find(a=>a.id===nma)?.first.toLowerCase()}@email.com</span></p>}</>}/>
      <FL label="Message" ch={<div style={{border:`1.5px solid ${BD}`,borderRadius:4,padding:"9px 12px"}} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor=BD}><textarea rows={5} value={nmt} onChange={e=>setNmt(e.target.value)} placeholder="Write your message…" style={{background:"transparent",width:"100%",border:"none",outline:"none",fontSize:13,color:T}}/></div>}/>
      <div style={{background:BL,border:`1px solid ${BR}`,borderRadius:4,padding:"8px 12px",marginBottom:14,display:"flex",gap:6}}><Ic.info size={12} color={B}/><p style={{fontSize:11,color:B,margin:0,lineHeight:1.5}}>Sends as a real email and creates a thread in the athlete's inbox.</p></div>
      <Btn ch="Send Message" full ac={B} dis={!nma||!nmt.trim()} onClick={startMsg}/>
    </>}/>

    {notif&&<div className="ctoast">{notif}</div>}

    {/* SETTINGS */}
    {settingsOpen&&<div style={{position:"fixed",inset:0,background:"#050505",zIndex:400}}>
      <div style={{width:"100%",maxWidth:430,height:"100%",margin:"0 auto",background:W,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <div style={{background:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <button onClick={()=>setSettingsOpen(false)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0}}><Ic.back size={18} color={B}/><span style={{fontSize:13,fontWeight:600,color:B}}>Back</span></button>
        <span style={{fontSize:14,fontWeight:700,color:T}}>Settings</span>
        <div style={{width:60}}/>
      </div>
      <div style={{padding:"0 0 40px"}}>
        <div style={{padding:"20px 16px 8px"}}><p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",margin:0}}>Account</p></div>
        {[["Edit Profile","Update your name, school, and role"],["Change Email","Update your email address"],["Change Password","Update your password"],["Notification Preferences","Control what you get notified about"],["Recruiting Preferences","Set filters for athlete discovery"]].map(([t,s])=>(
          <div key={t} onClick={()=>notify("Coming soon")} style={{padding:"13px 16px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:W}}>
            <div><p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:2}}>{t}</p><p style={{fontSize:11,color:TL,margin:0}}>{s}</p></div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div style={{padding:"20px 16px 8px"}}><p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",margin:0}}>Program & Subscription</p></div>
        {[["Current Plan","Basic Coach — $19/month"],["Upgrade to Pro","$39/month · Full database + advanced filters"],["Upgrade to Program","$79/month · Multiple staff logins + priority support"],["Billing & Invoices","View and download invoices"],["Cancel Subscription","Manage your subscription"]].map(([t,s])=>(
          <div key={t} onClick={()=>notify("Coming soon")} style={{padding:"13px 16px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:W}}>
            <div><p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:2}}>{t}</p><p style={{fontSize:11,color:TL,margin:0}}>{s}</p></div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div style={{padding:"20px 16px 8px"}}><p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",margin:0}}>Privacy & Security</p></div>
        {[["Profile Visibility","Control who can view your coach profile"],["Data & Downloads","Download a copy of your data"],["Block / Report","Manage blocked accounts"],["Two-Factor Authentication","Add extra security to your account"]].map(([t,s])=>(
          <div key={t} onClick={()=>notify("Coming soon")} style={{padding:"13px 16px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:W}}>
            <div><p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:2}}>{t}</p><p style={{fontSize:11,color:TL,margin:0}}>{s}</p></div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div style={{padding:"20px 16px 8px"}}><p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",margin:0}}>Legal</p></div>
        {[["Terms of Service","Read our full terms of service"],["Privacy Policy","How we collect and use your data"],["Cookie Policy","Our cookie usage policy"],["NCAA Compliance","Recruiting rules and compliance information"],["Accessibility Statement","Our commitment to accessibility"]].map(([t,s])=>(
          <div key={t} onClick={()=>notify("Opening...")} style={{padding:"13px 16px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:W}}>
            <div><p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:2}}>{t}</p><p style={{fontSize:11,color:TL,margin:0}}>{s}</p></div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div style={{padding:"20px 16px 8px"}}><p style={{fontSize:10,fontWeight:700,color:TL,letterSpacing:.8,textTransform:"uppercase",margin:0}}>Support</p></div>
        {[["Help Center","FAQs and guides for coaches"],["Contact Support","Get help from our team"],["Send Feedback","Help us improve FastTrack"],["Rate the App","Leave a review on the App Store"]].map(([t,s])=>(
          <div key={t} onClick={()=>notify("Coming soon")} style={{padding:"13px 16px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:W}}>
            <div><p style={{fontSize:13,fontWeight:600,color:T,margin:0,marginBottom:2}}>{t}</p><p style={{fontSize:11,color:TL,margin:0}}>{s}</p></div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div style={{padding:"20px 16px"}}>
          <button onClick={()=>notify("Signed out")} style={{width:"100%",padding:"12px",borderRadius:8,border:`1px solid #fecaca`,background:"#fff5f5",color:"#dc2626",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:8}}>Sign Out</button>
          <button onClick={()=>notify("Account deletion requested")} style={{width:"100%",padding:"12px",borderRadius:8,border:"none",background:"none",color:TL,fontSize:12,fontWeight:500,cursor:"pointer"}}>Delete Account</button>
          <p style={{fontSize:10,color:TL,textAlign:"center",marginTop:16}}>FastTrack v1.0.0 · © 2026 FastTrack Recruitment Inc.</p>
        </div>
      </div>
      </div>
    </div>}
  </div>;
}

function SignIn({onBack,onSuccess}){
  const[email,setEmail]=useState("");
  const[pw,setPw]=useState("");
  const[err,setErr]=useState("");
  const[busy,setBusy]=useState(false);
  const submit=async()=>{
    if(!email||!pw)return;
    setBusy(true);setErr("");
    const{data,error}=await supabase.auth.signInWithPassword({email,password:pw});
    setBusy(false);
    if(error){setErr(error.message);}
    else{const m=data.user.user_metadata;onSuccess(m?.role||"athlete",m||{});}
  };
  return <div style={{minHeight:"100vh",background:"#0D0D0D",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 22px",textAlign:"left"}}><style>{CSS}</style>
    <div style={{width:"100%",maxWidth:360}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:52,height:52,background:B,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 8px 32px ${B}40`}}>
          <svg width={26} height={26} viewBox="0 0 20 20" fill="none"><path d="M10 2L13 8H19L14 12L16 18L10 14.5L4 18L6 12L1 8H7L10 2Z" fill="white"/></svg>
        </div>
        <h1 style={{fontSize:22,fontWeight:800,color:"#f0f0f0",letterSpacing:-.6,margin:0,marginBottom:6}}>Welcome back</h1>
        <p style={{fontSize:12,color:"#666",margin:0}}>Sign in to your FastTrack account</p>
      </div>
      <div style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:"24px 20px"}}>
        <FL label="Email" ch={<FIn type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>}/>
        <FL label="Password" ch={<FIn type="password" placeholder="Your password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>}/>
        {err&&<p style={{fontSize:12,color:"#ef4444",margin:"0 0 12px",lineHeight:1.4}}>{err}</p>}
        <Btn ch={busy?"Signing in…":"Sign In"} full dis={busy||!email||!pw} onClick={submit}/>
      </div>
      <p style={{fontSize:12,color:"#444",textAlign:"center",marginTop:20}}>Don't have an account? <span style={{color:B,fontWeight:600,cursor:"pointer"}} onClick={onBack}>Get started</span></p>
    </div>
  </div>;
}

export default function Root(){
  const[screen,setScreen]=useState("loading");
  const[uData,setUD]=useState(null);
  const[cData,setCD]=useState(null);
  useEffect(()=>{
    // #region agent log
    fetch('http://127.0.0.1:7282/ingest/8e43e297-ecf0-462e-bc78-418cef0f1596',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'edb537'},body:JSON.stringify({sessionId:'edb537',location:'App.jsx:Root',message:'screen snapshot',data:{screen,uRole:uData?.role??null,cRole:cData?.role??null},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  },[screen,uData,cData]);
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme','dark');
    supabase.auth.getSession().then(({data:{session}})=>{
      // #region agent log
      fetch('http://127.0.0.1:7282/ingest/8e43e297-ecf0-462e-bc78-418cef0f1596',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'edb537'},body:JSON.stringify({sessionId:'edb537',location:'App.jsx:getSession',message:'getSession resolved',data:{hasSession:!!session,metaRole:session?.user?.user_metadata?.role??null},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      if(session){
        const m=session.user.user_metadata;
        if(m?.role==="athlete"){
          if(m?.gender==="Male")localStorage.setItem("ft_gender","man");
          else if(m?.gender==="Female")localStorage.setItem("ft_gender","woman");
          setUD(m);setScreen("athlete-app");
        }
        else if(m?.role==="coach"){setCD(m);setScreen("coach-app");}
        else{setScreen("role");}
      }else{
        // #region agent log
        fetch('http://127.0.0.1:7282/ingest/8e43e297-ecf0-462e-bc78-418cef0f1596',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'edb537'},body:JSON.stringify({sessionId:'edb537',location:'App.jsx:getSession',message:'no session -> guarded setScreen (only from loading)',data:{},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        setScreen(s=>s==="loading"?"role":s);
      }
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      // #region agent log
      fetch('http://127.0.0.1:7282/ingest/8e43e297-ecf0-462e-bc78-418cef0f1596',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'edb537'},body:JSON.stringify({sessionId:'edb537',location:'App.jsx:onAuthStateChange',message:'auth event',data:{event,hasSession:!!session,metaRole:session?.user?.user_metadata?.role??null},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if(event==="SIGNED_OUT"||event==="USER_DELETED"){
        setScreen("role");
        setUD(null);
        setCD(null);
        return;
      }
      if(session){
        const m=session.user.user_metadata;
        if(m?.role==="athlete"){
          if(m?.gender==="Male")localStorage.setItem("ft_gender","man");
          else if(m?.gender==="Female")localStorage.setItem("ft_gender","woman");
          setUD(m);
          setScreen("athlete-app");
        }else if(m?.role==="coach"){
          setCD(m);
          setScreen("coach-app");
        }
      }
    });
    return()=>subscription.unsubscribe();
  },[]);
  const jump=r=>{if(r==="athlete"){setUD(DA);setScreen("athlete-app");}else{setCD(DC);setScreen("coach-app");}};
  useEffect(()=>{
    let meta=document.querySelector("meta[name=viewport]");
    if(!meta){meta=document.createElement("meta");meta.name="viewport";document.head.appendChild(meta);}
    meta.content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover";
    const noZoom=e=>{if(e.touches&&e.touches.length>1)e.preventDefault();};
    document.addEventListener("touchmove",noZoom,{passive:false});
    document.addEventListener("gesturestart",e=>e.preventDefault());
    document.addEventListener("gesturechange",e=>e.preventDefault());
    return()=>document.removeEventListener("touchmove",noZoom);
  },[]);
  const content=
    screen==="loading"?<div style={{minHeight:"100vh",background:"#0D0D0D",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#555",fontSize:13}}>Loading…</p></div>:
    screen==="role"?<RoleSelect onSelect={r=>{if(r==="athlete")localStorage.removeItem(FT_ATHLETE_ONBOARD_DRAFT);setScreen(`${r}-onboard`);}} onJump={jump} onSignIn={()=>setScreen("sign-in")}/>:
    screen==="sign-in"?<SignIn onBack={()=>setScreen("role")} onSuccess={(role,data)=>{if(role==="athlete"){if(data?.gender==="Male")localStorage.setItem("ft_gender","man");else if(data?.gender==="Female")localStorage.setItem("ft_gender","woman");setUD(data);setScreen("athlete-app");}else{setCD(data);setScreen("coach-app");}}}/>:
    screen==="athlete-onboard"?<AthleteOnboard onComplete={d=>{
      // #region agent log
      fetch('http://127.0.0.1:7282/ingest/8e43e297-ecf0-462e-bc78-418cef0f1596',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'edb537'},body:JSON.stringify({sessionId:'edb537',location:'App.jsx:onComplete athlete',message:'onComplete handler',data:{hasRole:!!d?.role,role:String(d?.role||'')},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      setUD(d);setScreen("athlete-app");
    }} onSignIn={()=>setScreen("sign-in")}/>:
    screen==="coach-onboard"?<CoachOnboard onComplete={d=>{setCD(d);setScreen("coach-app");}} onSignIn={()=>setScreen("sign-in")}/>:
    screen==="athlete-app"?<AthleteApp user={uData}/>:
    screen==="coach-app"?<CoachApp user={cData}/>:null;
  return <div style={{background:"#050505",minHeight:"100vh",display:"flex",alignItems:"flex-start",justifyContent:"center"}}>
    <div style={{width:"100%",maxWidth:430,minHeight:"100vh",position:"relative",background:"#0a0a0a",boxShadow:"0 0 60px rgba(0,0,0,.4)"}}>
      {content}
    </div>
  </div>;
}

export const App = Root;
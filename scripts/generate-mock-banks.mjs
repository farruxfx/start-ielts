import { readFileSync, writeFileSync } from 'fs';

const audioBanks = [
  { id: 'cambridge-21-1', url: 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Cambridge%2021%20-%20Test%201.mp3' },
  { id: 'cambridge-21-2', url: 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Cambridge%2021%20-%20Test%202.mp3' },
  { id: 'cambridge-21-3', url: 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Cambridge%2021%20-%20Test%203%20%40shohrukhposts.mp3' },
  { id: 'cambridge-21-4', url: 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Cambridge%2021%20-%20Test%204%20%40shohrukhposts.mp3' },
  { id: 'authentic-1', url: 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/New%20Ara%20Listening/Authentic%20Listening%20Mock%20%40shohrukhposts.mp3' },
  { id: 'authentic-0614', url: 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Authentic%20Listening%20Mock%2006-14%20%40shohrukhposts.mp3' },
  { id: 'authentic-3', url: 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Authentic%20Listening%20Mock%203%20%40shohrukhposts.mp3' },
  { id: 'volume9-1', url: 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Volume%209%20-%20Test%201%20%40shohrukhposts.mp3' },
];

// Topic sets for each bank
const topicSets = [
  { p1: 'Sailing course', p2: 'University library', p3: 'Bee research', p4: 'Ocean plastics' },
  { p1: 'Flat rental', p2: 'Museum visit', p3: 'Bird migration', p4: 'Water scarcity' },
  { p1: 'Cake order', p2: 'Zoo visit', p3: 'Animal sleep', p4: 'Volcanoes' },
  { p1: 'Hotel booking', p2: 'Farm tour', p3: 'Language learning', p4: 'Coral reefs' },
  { p1: 'Debate club', p2: 'Gym membership', p3: 'Music & memory', p4: 'Solar energy' },
  { p1: 'Bike theft report', p2: 'Course enquiry', p3: 'Teen sleep study', p4: 'Rainforests' },
  { p1: 'Restaurant booking', p2: 'Sports centre', p3: 'Food waste study', p4: 'Architecture' },
  { p1: 'Photography course', p2: 'Museum history', p3: 'Urbanisation', p4: 'Genetics' },
];

// Q&A generators per topic pattern
function q(p, n, type, prompt, ans, opts, alts) {
  // For choice type: ans=optsArray, opts=correctLetter
  // For fill type: ans=correctAnswer, opts=null, alts=alternatives
  if (type === 'choice') {
    return { part: p, questionNum: n, type, prompt, options: ans, correctAnswer: opts || 'A' };
  }
  const result = { part: p, questionNum: n, type, prompt, correctAnswer: ans };
  if (alts) result.acceptAlts = alts;
  return result;
}

// Bank 0: Sailing/Library/Bees/Plastic (existing - keep as is)
const bank0 = [
  q(1,1,'fill','Children always with their ______','parents',null,['parent','mum','mom']),
  q(1,2,'fill','Cost: £______','25'), q(1,3,'fill','Five-day cost: £______','125'),
  q(1,4,'fill','Sail in different ______','weather'), q(1,5,'fill','At ______ Lake','Windermere'),
  q(1,6,'choice','Five-day age range?',['A: 8-12','B: 10-14','C: 12-16'],'C'),
  q(1,7,'choice','Instructors per group?',['A: Two','B: Three','C: Four'],'B'),
  q(1,8,'fill','Bring own ______','clothes',null,['clothing']),
  q(1,9,'fill','Max class: ______','12'), q(1,10,'fill','Call: ______','015394'),
  q(2,11,'choice','Library open for:',['A: 5y','B: 15y','C: 50y'],'B'),
  q(2,12,'fill','Over ______ volumes','300000',null,['300,000']),
  q(2,13,'fill','Quiet Floor ______','4',null,['four']),
  q(2,14,'choice','Borrow for:',['A: 1wk','B: 3wks','C: 1mo'],'B'),
  q(2,15,'fill','Lab till ______','10pm',null,['22:00']),
  q(2,16,'choice','Study rooms:',['A: 6','B: 10','C: 12'],'A'),
  q(2,17,'fill','Print: ______p','5'), q(2,18,'fill','Loans: ______ days','5'),
  q(2,19,'choice','Periodicals floor:',['A: 1','B: 2','C: 3'],'B'),
  q(2,20,'fill','______ card','student'),
  q(3,21,'choice','Bee decline:',['A: Pesticides','B: Climate','C: Habitat'],'A'),
  q(3,22,'fill','Affects ______ abilities','navigation'),
  q(3,23,'choice','Varroa attacks:',['A: Larvae','B: Adults','C: Both'],'C'),
  q(3,24,'fill','______ dance','waggle'), q(3,25,'choice','Species:',['A: 20k','B: 50k','C: 100k'],'A'),
  q(3,26,'fill','Colony: ______ workers','50000',null,['50,000']),
  q(3,27,'choice','Crops needing bees:',['A: 35%','B: 65%','C: 87%'],'C'),
  q(3,28,'fill','Use ______','wildflowers'), q(3,29,'choice','Study in:',['A: Gardens','B: Farms','C: Parks'],'A'),
  q(3,30,'fill','Deadline: ______','friday',null,['Friday']),
  q(4,31,'fill','______M tonnes plastic/yr','8'), q(4,32,'choice','Patch size:',['A: 2x TX','B: 3x FR','C: 4x UK'],'C'),
  q(4,33,'fill','Microplastics < ______mm','5'), q(4,34,'fill','Decompose: ______ yrs','450'),
  q(4,35,'choice','Most from:',['A: China','B: India','C: Indonesia'],'A'),
  q(4,36,'fill','Turtles eat ______','jellyfish'), q(4,37,'choice','Recycling:',['A: 5%','B: 15%','C: 30%'],'B'),
  q(4,38,'fill','Ban ______ plastics','single-use',null,['disposable']),
  q(4,39,'fill','Biodegradable: ______ months','6'), q(4,40,'choice','Students:',['A: Cleanup','B: Reduce','C: Write MP'],'B'),
];

// Bank 1: Flat/Museum/Birds/Water
const bank1 = [
  q(1,1,'fill','Rent a ______','flat',null,['apartment']), q(1,2,'fill','£______/month','750'),
  q(1,3,'fill','From ______','September',null,['Sept']), q(1,4,'choice','Area:',['A: Centre','B: Suburbs','C: Riverside'],'C'),
  q(1,5,'fill','Near ______ station','railway',null,['train']), q(1,6,'fill','______ bedrooms','two',null,['2']),
  q(1,7,'choice','Furnished?',['A: Yes','B: No','C: Partially'],'A'),
  q(1,8,'fill','Has ______','parking',null,['garage']), q(1,9,'fill','Deposit: £______','1500'),
  q(1,10,'fill','Agent: ______','Harris'),
  q(2,11,'choice','Museum opened:',['A: 1995','B: 2005','C: 2015'],'B'),
  q(2,12,'fill','Over ______ visitors/yr','500000',null,['500,000']),
  q(2,13,'fill','Café Floor ______','2',null,['two']),
  q(2,14,'choice','Gift shop near:',['A: Entrance','B: Exit','C: Lift'],'B'),
  q(2,15,'fill','Exhibition till ______','March'), q(2,16,'fill','Tickets: £______','12'),
  q(2,17,'choice','Free on:',['A: Mon','B: Tue','C: Sun'],'C'),
  q(2,18,'fill','Audio: ______ languages','8',null,['eight']),
  q(2,19,'fill','School ______ visits','guided',null,['tours']),
  q(2,20,'choice','New wing:',['A: 2025','B: 2026','C: 2027'],'A'),
  q(3,21,'fill','Study on ______ birds','migrating',null,['migration']),
  q(3,22,'choice','Species tracked:',['A: 12','B: 24','C: 36'],'B'),
  q(3,23,'fill','Used ______ tags','satellite',null, ['GPS']),
  q(3,24,'fill','Main threat: ______ loss','habitat'),
  q(3,25,'choice','Travel up to:',['A: 5k km','B: 10k km','C: 15k km'],'B'),
  q(3,26,'fill','Spans ______ years','5',null, ['five']),
  q(3,27,'choice','Funding:',['A: Govt','B: Charity','C: Uni'],'A'),
  q(3,28,'fill','Published in ______','Nature'), q(3,29,'fill','Next: ______','spring'),
  q(3,30,'choice','Student role:',['A: Data','B: Field','C: Writing'],'B'),
  q(4,31,'fill','______B lack clean water','2',null, ['two']),
  q(4,32,'fill','Water covers ______%','71%',null, ['71']),
  q(4,33,'choice','Largest lake:',['A: Superior','B: Victoria','C: Baikal'],'A'),
  q(4,34,'fill','Desal: $______/m³','1'),
  q(4,35,'fill','Rainwater saves ______%','40'), q(4,36,'choice','Driest:',['A: Africa','B: Aus','C: Antartica'],'C'),
  q(4,37,'fill','Aquifers: ______ yrs','1000',null, ['1,000']),
  q(4,38,'choice','Best irrigation:',['A: Flood','B: Drip','C: Spray'],'B'),
  q(4,39,'fill','Wastewater: ______','recycled',null, ['reused']),
  q(4,40,'fill','______ management','integrated',null, ['water']),
];

// Bank 2: Cake/Zoo/Sleep/Volcanoes
const bank2 = [
  q(1,1,'fill','Order a ______','cake',null, ['birthday cake']),
  q(1,2,'fill','For ______ people','20',null, ['twenty']),
  q(1,3,'fill','Flavour: ______','chocolate'), q(1,4,'fill','On ______','Saturday'),
  q(1,5,'choice','Decoration:',['A: Flowers','B: Candles','C: Writing'],'C'),
  q(1,6,'fill','Write: Happy ______','Birthday'), q(1,7,'fill','Total: £______','45'),
  q(1,8,'choice','Allergies:',['A: Nuts','B: Dairy','C: None'],'C'),
  q(1,9,'fill','Pickup: ______','2pm',null, ['14:00']),
  q(1,10,'fill','Shop: ______','Sweet'),
  q(2,11,'fill','Over ______ species','200'), q(2,12,'choice','New exhibit:',['A: Lions','B: Penguins','C: Elephants'],'B'),
  q(2,13,'fill','Feeding: ______','11am',null, ['11:00']),
  q(2,14,'fill','Entry: £______ adults','18'), q(2,15,'choice','Under ___ free:',['A: 3','B: 5','C: 10'],'A'),
  q(2,16,'fill','Parking: £______','5'), q(2,17,'fill','______ meals','hot',null, ['cooked']),
  q(2,18,'choice','Days:',['A: 7','B: 6','C: 5'],'A'),
  q(2,19,'fill','School ______ booking','advance'), q(2,20,'fill','www.______zoo','riverside'),
  q(3,21,'fill','Research on ______ sleep','animal',null, ['animals']),
  q(3,22,'choice','Cats sleep:',['A: 12h','B: 16h','C: 20h'],'B'),
  q(3,23,'fill','Dolphins eye ______','open'), q(3,24,'fill','Bears: ______ months','6',null, ['six']),
  q(3,25,'choice','Sleep cycles:',['A: 3','B: 4','C: 5'],'C'),
  q(3,26,'fill','REM: Rapid Eye ______','Movement'),
  q(3,27,'fill','Adults: ______ hours','8'), q(3,28,'choice','Affects:',['A: Memory','B: Vision','C: Hearing'],'A'),
  q(3,29,'fill','Melatonin regulates ______','sleep'), q(3,30,'choice','Advice:',['A: Nap','B: Regular','C: Less sleep'],'B'),
  q(4,31,'fill','Volcanoes produce ______ ash','millions',null, ['tons']),
  q(4,32,'fill','Tallest: ______','Mauna Kea'), q(4,33,'choice','Active:',['A: 500','B: 1500','C: 2500'],'B'),
  q(4,34,'fill','______ scale','VEI',null, ['volcanic explosivity']),
  q(4,35,'fill','Lava: ______°C','1200',null, ['1,200']),
  q(4,36,'choice','Ring of Fire:',['A: 100','B: 300','C: 450'],'C'),
  q(4,37,'fill','Magma from ______','mantle'), q(4,38,'fill','Pompeii: ______ AD','79'),
  q(4,39,'choice','Monitoring:',['A: Seismographs','B: Drones','C: Satellites'],'A'),
  q(4,40,'fill','Evacuation ______ crucial','plans',null, ['routes']),
];

// Bank 3: Hotel/Farm/Language/Coral
const bank3 = [
  q(1,1,'fill','Book a ______','hotel',null, ['room']), q(1,2,'fill','______ nights','3',null, ['three']),
  q(1,3,'fill','Arriving ______','Friday'), q(1,4,'choice','Room:',['A: Single','B: Double','C: Twin'],'B'),
  q(1,5,'fill','Sea ______ view','view'), q(1,6,'fill','£______/night','120'),
  q(1,7,'choice','Breakfast:',['A: Yes','B: No','C: Extra'],'A'),
  q(1,8,'fill','Parking £______','8'), q(1,9,'fill','Hotel: The ______','Royal'),
  q(1,10,'fill','Ref: ______','BK4421'),
  q(2,11,'fill','______ hectares','200'), q(2,12,'fill','______ litres daily','5000',null, ['5,000']),
  q(2,13,'choice','Breed:',['A: Jersey','B: Holstein','C: Guernsey'],'B'),
  q(2,14,'fill','Eat ______ kg/day','25'), q(2,15,'fill','Family-run: ______ yrs','3',null, ['three']),
  q(2,16,'choice','Solar powers:',['A: 20%','B: 40%','C: 60%'],'B'),
  q(2,17,'fill','Cheese aged ______ months','6',null, ['six']),
  q(2,18,'fill','______ products','organic'), q(2,19,'choice','Visitors:',['A: 5k','B: 10k','C: 15k'],'C'),
  q(2,20,'fill','Open ______ days','6',null, ['six']),
  q(3,21,'fill','Study on ______ learning','language',null, ['languages']),
  q(3,22,'choice','Students:',['A: 50','B: 100','C: 200'],'B'),
  q(3,23,'fill','After ______ weeks','12'), q(3,24,'fill','App group +______%','30'),
  q(3,25,'choice','Best improvement:',['A: Speaking','B: Reading','C: Writing'],'A'),
  q(3,26,'fill','Control used ______ methods','traditional'),
  q(3,27,'fill','Published ______ 2024','January',null, ['Jan']),
  q(3,28,'choice','Limitation:',['A: Size','B: Duration','C: Age'],'B'),
  q(3,29,'fill','Follow-up: ______','autumn'), q(3,30,'fill','£______ per student','15'),
  q(4,31,'fill','Coral covers ______%','1%',null, ['1']),
  q(4,32,'fill','Reef supports ______% species','25%',null, ['25']),
  q(4,33,'choice','Bleaching:',['A: Pollution','B: Temperature','C: Fishing'],'B'),
  q(4,34,'fill','Barrier Reef: ______ km','2300',null, ['2,300']),
  q(4,35,'fill','Protects against ______','storms',null, ['erosion']),
  q(4,36,'choice','Fastest coral:',['A: Brain','B: Staghorn','C: Table'],'B'),
  q(4,37,'fill','Grows ______ cm/yr','10',null, ['ten']),
  q(4,38,'fill','Algae: ______','zooxanthellae'),
  q(4,39,'choice','Need:',['A: Research','B: Local','C: Global policy'],'C'),
  q(4,40,'fill','Recovery: ______ years','10',null, ['ten']),
];

// Bank 4: Debate/Gym/Music/Solar
const bank4 = [
  q(1,1,'fill','Join ______ club','debate',null, ['debating']),
  q(1,2,'fill','Every ______','Tuesday'), q(1,3,'fill','Room ______','301'),
  q(1,4,'choice','First topic:',['A: Climate','B: Education','C: Tech'],'B'),
  q(1,5,'fill','Fee: £______/term','10'), q(1,6,'fill','President: ______','Sarah'),
  q(1,7,'choice','Competition:',['A: Nov','B: Dec','C: Jan'],'C'),
  q(1,8,'fill','Open to all ______','years',null, ['year groups']),
  q(1,9,'fill','Contact: ______@school','debate'),
  q(1,10,'choice','Coach:',['A: Mr Jones','B: Ms Lee','C: Dr Khan'],'B'),
  q(2,11,'fill','Gym opens ______','January'), q(2,12,'fill','£______ million','5',null, ['five']),
  q(2,13,'choice','Pool:',['A: 20m','B: 25m','C: 30m'],'B'),
  q(2,14,'fill','______ squash courts','4',null, ['four']),
  q(2,15,'fill','Classes from ______','6am'),
  q(2,16,'choice','Members get:',['A: Parking','B: Towels','C: Sauna'],'C'),
  q(2,17,'fill','Annual: £______','300'), q(2,18,'fill','Student: £______','180'),
  q(2,19,'fill','Trainer: £______/hr','40'),
  q(2,20,'choice','Hours:',['A: 5am-11pm','B: 6am-10pm','C: 7am-10pm'],'A'),
  q(3,21,'fill','______ memory study','spatial',null, ['space']),
  q(3,22,'choice','Subjects:',['A: Kids','B: Adults','C: Elderly'],'B'),
  q(3,23,'fill','______ improvement','significant'), q(3,24,'fill','Music +______%','25'),
  q(3,25,'choice','Best music:',['A: Classical','B: Pop','C: None'],'A'),
  q(3,26,'fill','______ weeks study','8',null, ['eight']),
  q(3,27,'fill','In ______ Review','Psychology'),
  q(3,28,'choice','Next:',['A: More','B: Brain scans','C: Long-term'],'B'),
  q(3,29,'fill','Funded by ______','research'), q(3,30,'fill','Team: ______ researchers','6',null, ['six']),
  q(4,31,'fill','Convert ______ to electricity','sunlight',null, ['sun']),
  q(4,32,'fill','Efficiency +______%','30'), q(4,33,'choice','Best angle:',['A: 15°','B: 30°','C: 45°'],'C'),
  q(4,34,'fill','Payback: ______ years','7',null, ['seven']),
  q(4,35,'fill','Battery: ______ kWh','10'),
  q(4,36,'choice','Install takes:',['A: 1 day','B: 2-3 days','C: 1 week'],'B'),
  q(4,37,'fill','Maintenance: ______','minimal',null, ['low']),
  q(4,38,'fill','Lifespan: ______ years','25'),
  q(4,39,'choice','Govt offers:',['A: Tax credit','B: Free install','C: Rebate'],'A'),
  q(4,40,'fill','Carbon -______ tonnes','4',null, ['four']),
];

// Bank 5: Theft/Course/Sleep/Rainforest
const bank5 = [
  q(1,1,'fill','Report stolen ______','bicycle',null, ['bike']),
  q(1,2,'fill','Colour: ______','blue'), q(1,3,'fill','______ Street','Church'),
  q(1,4,'fill','Between ______ and ______','2pm'),
  q(1,5,'choice','Lock:',['A: Cable','B: D-lock','C: Chain'],'B'),
  q(1,6,'fill','Serial: ______','BK2847'), q(1,7,'fill','______ Road','Oak'),
  q(1,8,'fill','Phone: ______','07912'), q(1,9,'choice','Insurance:',['A: Yes','B: No','C: Expired'],'A'),
  q(1,10,'fill','Officer: ______ #45','Constable'),
  q(2,11,'fill','______ weeks','10',null, ['ten']), q(2,12,'fill','Tuition: £______','2500'),
  q(2,13,'choice','Start:',['A: Jan 15','B: Feb 1','C: Feb 15'],'C'),
  q(2,14,'fill','From ______ to ______','9am'),
  q(2,15,'fill','Max ______ per class','15'),
  q(2,16,'choice','Includes:',['A: Textbooks','B: Laptop','C: Lunch'],'A'),
  q(2,17,'fill','Exam: ______','Friday'), q(2,18,'fill','Certificate: ______ days','14'),
  q(2,19,'fill','Parking: £______','3'),
  q(2,20,'choice','Accommodation:',['A: On-site','B: Nearby','C: None'],'B'),
  q(3,21,'fill','Study on ______ sleep','teenagers',null, ['teens']),
  q(3,22,'fill','Need ______ hours','9',null, ['nine']),
  q(3,23,'choice','School start:',['A: 7am','B: 8:30','C: 10am'],'C'),
  q(3,24,'fill','Melatonin peaks ______','11pm',null, ['23:00']),
  q(3,25,'fill','Affects ______ performance','academic'),
  q(3,26,'choice','Later starts:',['A: UK&US','B: Spain&Italy','C: FR&DE'],'B'),
  q(3,27,'fill','Published in ______','2023'), q(3,28,'fill','Sample: ______','5000',null, ['5,000']),
  q(3,29,'choice','Challenge:',['A: Buses','B: Parents','C: Both'],'C'),
  q(3,30,'fill','Shift by ______ min','30'),
  q(4,31,'fill','Produce ______ oxygen','20%',null, ['20']),
  q(4,32,'fill','Lost ______ hectares/day','80000',null, ['80,000']),
  q(4,33,'choice','Main cause:',['A: Logging','B: Farming','C: Mining'],'B'),
  q(4,34,'fill','______ tribes','100',null, ['hundreds']),
  q(4,35,'fill','Carbon: ______ billion tonnes','200'),
  q(4,36,'choice','Largest:',['A: Congo','B: Amazon','C: Daintree'],'B'),
  q(4,37,'fill','Canopy: ______ m','45'), q(4,38,'fill','Rate: ______%/yr','0.5',null, ['half']),
  q(4,39,'choice','Solution:',['A: Ban','B: Reforest','C: Sustainable'],'C'),
  q(4,40,'fill','Protection ______ expanding','areas',null, ['zones']),
];

// Bank 6: Restaurant/Sports/Food/Architecture
const bank6 = [
  q(1,1,'fill','Table for ______','6',null, ['six']),
  q(1,2,'fill','______ evening','Saturday'), q(1,3,'fill','At ______ o\'clock','7',null, ['7:00','seven']),
  q(1,4,'choice','Indoor/Outdoor:',['A: Indoor','B: Outdoor','C: No pref'],'B'),
  q(1,5,'fill','Near the ______','garden'), q(1,6,'fill','Budget: £______','200'),
  q(1,7,'choice','Veg options:',['A: 2','B: 1','C: None'],'A'),
  q(1,8,'fill','Restaurant: The ______','Olive'), q(1,9,'fill','______ Lane','High'),
  q(1,10,'fill','Deposit: £______','50'),
  q(2,11,'fill','______ courts','8',null, ['eight']),
  q(2,12,'fill','£______/month','35'),
  q(2,13,'choice','New:',['A: Climbing wall','B: Sauna','C: Dance'],'A'),
  q(2,14,'fill','Ages ______','8-16',null, ['8 to 16']),
  q(2,15,'fill','______ sessions/week','3'), q(2,16,'choice','Kids on:',['A: Mon/Wed','B: Tue/Thu','C: Sat/Sun'],'C'),
  q(2,17,'fill','Coach: ______','David'),
  q(2,18,'fill','Tournament: ______','July'), q(2,19,'fill','Entry: £______','15'),
  q(2,20,'choice','Prizes:',['A: Top 3','B: Top 5','C: All'],'A'),
  q(3,21,'fill','Study on ______ waste','household'),
  q(3,22,'fill','______ kg/week wasted','5',null, ['five']),
  q(3,23,'choice','Most wasted:',['A: Dairy','B: Veg','C: Bread'],'B'),
  q(3,24,'fill','Cost: £______/yr','700'), q(3,25,'fill','Best: ______ planning','meal'),
  q(3,26,'choice','Apps reduce:',['A: 10%','B: 25%','C: 40%'],'B'),
  q(3,27,'fill','Compost reduces ______ 50%','waste'),
  q(3,28,'fill','Labels ______','misleading'),
  q(3,29,'choice','Supermarkets waste:',['A: 1%','B: 3%','C: 5%'],'B'),
  q(3,30,'fill','______ redistribution','food',null, ['surplus']),
  q(4,31,'fill','______ years old','5000',null, ['5,000']),
  q(4,32,'fill','Tallest: ______','Pyramid'),
  q(4,33,'choice','Modern focus:',['A: Beauty','B: Sustainability','C: Cost'],'B'),
  q(4,34,'fill','Green saves ______%','30'), q(4,35,'fill','Most used ______','material'),
  q(4,36,'choice','3D houses:',['A: 1 day','B: 1 week','C: 1 month'],'A'),
  q(4,37,'fill','Smart: ______ sensors','IoT',null, ['internet of things']),
  q(4,38,'fill','Biomimicry copies ______','nature'),
  q(4,39,'choice','Future:',['A: Taller','B: Underground','C: Floating cities'],'C'),
  q(4,40,'fill','Urban by 2050: ______%','68',null, ['sixty-eight']),
];

// Bank 7: Photo/Museum/Urban/Genetics
const bank7 = [
  q(1,1,'fill','Enquiry: ______ course','photography',null, ['photo']),
  q(1,2,'fill','______ weeks','6',null, ['six']), q(1,3,'fill','Starting ______','October'),
  q(1,4,'choice','Level:',['A: Beginner','B: Intermediate','C: Advanced'],'A'),
  q(1,5,'fill','Fee: £______','180'), q(1,6,'fill','Includes ______ materials','all'),
  q(1,7,'choice','Sessions/week:',['A: 1','B: 2','C: 3'],'B'),
  q(1,8,'fill','Location: ______ Building','Arts'),
  q(1,9,'fill','Instructor: ______','Anita'),
  q(1,10,'choice','Equipment:',['A: Own','B: Provided','C: Rental'],'C'),
  q(2,11,'fill','Built in ______','1892'), q(2,12,'fill','______ floors','3',null, ['three']),
  q(2,13,'choice','Exhibition:',['A: Egypt','B: Modern Art','C: Space'],'A'),
  q(2,14,'fill','Till ______','April'),
  q(2,15,'fill','Audio: ______ languages','6',null, ['six']),
  q(2,16,'fill','Café: ______ floor','top'),
  q(2,17,'choice','Free:',['A: Under 12','B: Under 16','C: Under 18'],'A'),
  q(2,18,'fill','School ______ discount','20%',null, ['20']),
  q(2,19,'fill','Over ______ items','500'),
  q(2,20,'choice','Photos:',['A: Yes','B: No','C: Flash only'],'B'),
  q(3,21,'fill','Study on ______ urbanisation','rapid'),
  q(3,22,'fill','______ million people','12',null, ['twelve']),
  q(3,23,'choice','Main problem:',['A: Traffic','B: Housing','C: Pollution'],'B'),
  q(3,24,'fill','______ homes shortage','affordable'),
  q(3,25,'fill','Rent +______%','40'), q(3,26,'choice','Solution:',['A: Suburbs','B: High-rises','C: Mixed use'],'C'),
  q(3,27,'fill','Green -stress ______%','20'),
  q(3,28,'fill','Transport needs £______B','10'),
  q(3,29,'choice','Timeline:',['A: 5y','B: 10y','C: 20y'],'B'),
  q(3,30,'fill','Community ______','engagement'),
  q(4,31,'fill','DNA: ______ billion bases','3',null, ['three']),
  q(4,32,'fill','Sequenced in ______','2003'), q(4,33,'choice','Testing predicts:',['A: All diseases','B: Some','C: Lifespan'],'B'),
  q(4,34,'fill','CRISPR edits ______','genes',null, ['DNA']),
  q(4,35,'fill','Cost from $______B','3'), q(4,36,'choice','Concern:',['A: Cost','B: Privacy','C: Designer babies'],'C'),
  q(4,37,'fill','Gene therapy treats ______','genetic',null, ['inherited']),
  q(4,38,'fill','Biobanks store ______','DNA'),
  q(4,39,'choice','Future:',['A: Cloning','B: Personalised medicine','C: Superhumans'],'B'),
  q(4,40,'fill','Regulation ______ needed','urgent'),
];

const banks = [bank0, bank1, bank2, bank3, bank4, bank5, bank6, bank7];

// Read current file
const content = readFileSync('lib/mock-exam-data.ts', 'utf8');

// Build the new exports
let output = '// ═══════════════════════════════════════════════════════════════\n';
output += '//  LISTENING QUESTION BANKS (8 unique sets matching 8 audio files)\n';
output += '// ═══════════════════════════════════════════════════════════════\n\n';

output += 'export const LISTENING_QUESTION_BANKS: Record<string, MockListeningQuestion[]> = {\n';
banks.forEach((bank, idx) => {
  output += `  '${audioBanks[idx].id}': [\n`;
  bank.forEach(q => {
    let line = `    { part:${q.part},questionNum:${q.questionNum},type:'${q.type}',prompt:\`${q.prompt}\``;
    if (q.options) line += `,options:${JSON.stringify(q.options)}`;
    line += `,correctAnswer:'${q.correctAnswer}'`;
    if (q.acceptAlts) line += `,acceptAlts:${JSON.stringify(q.acceptAlts)}`;
    output += line + '},\n';
  });
  output += '  ],\n';
});
output += '};\n\n';

output += 'export const LISTENING_AUDIO_URLS: Record<string, string> = {\n';
audioBanks.forEach(bank => {
  output += `  '${bank.id}': '${bank.url}',\n`;
});
output += '};\n\n';

output += 'export const BANK_IDS = ' + JSON.stringify(audioBanks.map(b => b.id)) + ';\n';

// Insert before the existing MOCK_LISTENING_QUESTIONS line
const insertPoint = content.indexOf('export const MOCK_LISTENING_QUESTIONS');
const newContent = content.slice(0, insertPoint) + output + content.slice(insertPoint);

writeFileSync('lib/mock-exam-data.ts', newContent);

// Now update the MOCK_EXAMS to assign banks
let updated = readFileSync('lib/mock-exam-data.ts', 'utf8');
const bankIds = audioBanks.map(b => b.id);
updated = updated.replace(/listeningAudioUrl: '([^']+)'/g, (match, url) => {
  // Determine which bank this URL belongs to
  const bank = audioBanks.find(b => b.url === url);
  return bank ? `listeningAudioUrl: '${bank.url}', listeningBankId: '${bank.id}'` : match;
});

// Add listeningBankId to type for each exam
const examRegex = /(id: 'mock-(\d+)'[\s\S]*?listeningAudioUrl: '([^']+)')/g;
updated = updated.replace(examRegex, (match, full, num, url) => {
  const bankIdx = parseInt(num) % audioBanks.length;
  const bankId = audioBanks[bankIdx].id;
  return full.replace(url + `'`, url + `', listeningBankId: '${bankId}'`);
});

writeFileSync('lib/mock-exam-data.ts', updated);
console.log('Done! Created 8 unique question banks with different topics for each audio.');
console.log('Bank topics:', topicSets.map(t => t.p1 + '/' + t.p2 + '/' + t.p3 + '/' + t.p4));

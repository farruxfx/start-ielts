import type { MockExamDef, MockExamSession } from './types';

export interface MockListeningQuestion {
  part: number;
  questionNum: number;
  type: 'fill' | 'choice' | 'match';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  acceptAlts?: string[];
}

// ═══════════════════════════════════════════════════════════════
//  LISTENING QUESTION BANKS (8 unique sets matching 8 audio files)
// ═══════════════════════════════════════════════════════════════

export const LISTENING_QUESTION_BANKS: Record<string, MockListeningQuestion[]> = {
  'cambridge-21-1': [
    { part:1,questionNum:1,type:'fill',prompt:`Children always with their ______`,correctAnswer:'parents',acceptAlts:["parent","mum","mom"]},
    { part:1,questionNum:2,type:'fill',prompt:`Cost: £______`,correctAnswer:'25'},
    { part:1,questionNum:3,type:'fill',prompt:`Five-day cost: £______`,correctAnswer:'125'},
    { part:1,questionNum:4,type:'fill',prompt:`Sail in different ______`,correctAnswer:'weather'},
    { part:1,questionNum:5,type:'fill',prompt:`At ______ Lake`,correctAnswer:'Windermere'},
    { part:1,questionNum:6,type:'choice',prompt:`Five-day age range?`,options:["A: 8-12","B: 10-14","C: 12-16"],correctAnswer:'C'},
    { part:1,questionNum:7,type:'choice',prompt:`Instructors per group?`,options:["A: Two","B: Three","C: Four"],correctAnswer:'B'},
    { part:1,questionNum:8,type:'fill',prompt:`Bring own ______`,correctAnswer:'clothes',acceptAlts:["clothing"]},
    { part:1,questionNum:9,type:'fill',prompt:`Max class: ______`,correctAnswer:'12'},
    { part:1,questionNum:10,type:'fill',prompt:`Call: ______`,correctAnswer:'015394'},
    { part:2,questionNum:11,type:'choice',prompt:`Library open for:`,options:["A: 5y","B: 15y","C: 50y"],correctAnswer:'B'},
    { part:2,questionNum:12,type:'fill',prompt:`Over ______ volumes`,correctAnswer:'300000',acceptAlts:["300,000"]},
    { part:2,questionNum:13,type:'fill',prompt:`Quiet Floor ______`,correctAnswer:'4',acceptAlts:["four"]},
    { part:2,questionNum:14,type:'choice',prompt:`Borrow for:`,options:["A: 1wk","B: 3wks","C: 1mo"],correctAnswer:'B'},
    { part:2,questionNum:15,type:'fill',prompt:`Lab till ______`,correctAnswer:'10pm',acceptAlts:["22:00"]},
    { part:2,questionNum:16,type:'choice',prompt:`Study rooms:`,options:["A: 6","B: 10","C: 12"],correctAnswer:'A'},
    { part:2,questionNum:17,type:'fill',prompt:`Print: ______p`,correctAnswer:'5'},
    { part:2,questionNum:18,type:'fill',prompt:`Loans: ______ days`,correctAnswer:'5'},
    { part:2,questionNum:19,type:'choice',prompt:`Periodicals floor:`,options:["A: 1","B: 2","C: 3"],correctAnswer:'B'},
    { part:2,questionNum:20,type:'fill',prompt:`______ card`,correctAnswer:'student'},
    { part:3,questionNum:21,type:'choice',prompt:`Bee decline:`,options:["A: Pesticides","B: Climate","C: Habitat"],correctAnswer:'A'},
    { part:3,questionNum:22,type:'fill',prompt:`Affects ______ abilities`,correctAnswer:'navigation'},
    { part:3,questionNum:23,type:'choice',prompt:`Varroa attacks:`,options:["A: Larvae","B: Adults","C: Both"],correctAnswer:'C'},
    { part:3,questionNum:24,type:'fill',prompt:`______ dance`,correctAnswer:'waggle'},
    { part:3,questionNum:25,type:'choice',prompt:`Species:`,options:["A: 20k","B: 50k","C: 100k"],correctAnswer:'A'},
    { part:3,questionNum:26,type:'fill',prompt:`Colony: ______ workers`,correctAnswer:'50000',acceptAlts:["50,000"]},
    { part:3,questionNum:27,type:'choice',prompt:`Crops needing bees:`,options:["A: 35%","B: 65%","C: 87%"],correctAnswer:'C'},
    { part:3,questionNum:28,type:'fill',prompt:`Use ______`,correctAnswer:'wildflowers'},
    { part:3,questionNum:29,type:'choice',prompt:`Study in:`,options:["A: Gardens","B: Farms","C: Parks"],correctAnswer:'A'},
    { part:3,questionNum:30,type:'fill',prompt:`Deadline: ______`,correctAnswer:'friday',acceptAlts:["Friday"]},
    { part:4,questionNum:31,type:'fill',prompt:`______M tonnes plastic/yr`,correctAnswer:'8'},
    { part:4,questionNum:32,type:'choice',prompt:`Patch size:`,options:["A: 2x TX","B: 3x FR","C: 4x UK"],correctAnswer:'C'},
    { part:4,questionNum:33,type:'fill',prompt:`Microplastics < ______mm`,correctAnswer:'5'},
    { part:4,questionNum:34,type:'fill',prompt:`Decompose: ______ yrs`,correctAnswer:'450'},
    { part:4,questionNum:35,type:'choice',prompt:`Most from:`,options:["A: China","B: India","C: Indonesia"],correctAnswer:'A'},
    { part:4,questionNum:36,type:'fill',prompt:`Turtles eat ______`,correctAnswer:'jellyfish'},
    { part:4,questionNum:37,type:'choice',prompt:`Recycling:`,options:["A: 5%","B: 15%","C: 30%"],correctAnswer:'B'},
    { part:4,questionNum:38,type:'fill',prompt:`Ban ______ plastics`,correctAnswer:'single-use',acceptAlts:["disposable"]},
    { part:4,questionNum:39,type:'fill',prompt:`Biodegradable: ______ months`,correctAnswer:'6'},
    { part:4,questionNum:40,type:'choice',prompt:`Students:`,options:["A: Cleanup","B: Reduce","C: Write MP"],correctAnswer:'B'},
  ],
  'cambridge-21-2': [
    { part:1,questionNum:1,type:'fill',prompt:`Rent a ______`,correctAnswer:'flat',acceptAlts:["apartment"]},
    { part:1,questionNum:2,type:'fill',prompt:`£______/month`,correctAnswer:'750'},
    { part:1,questionNum:3,type:'fill',prompt:`From ______`,correctAnswer:'September',acceptAlts:["Sept"]},
    { part:1,questionNum:4,type:'choice',prompt:`Area:`,options:["A: Centre","B: Suburbs","C: Riverside"],correctAnswer:'C'},
    { part:1,questionNum:5,type:'fill',prompt:`Near ______ station`,correctAnswer:'railway',acceptAlts:["train"]},
    { part:1,questionNum:6,type:'fill',prompt:`______ bedrooms`,correctAnswer:'two',acceptAlts:["2"]},
    { part:1,questionNum:7,type:'choice',prompt:`Furnished?`,options:["A: Yes","B: No","C: Partially"],correctAnswer:'A'},
    { part:1,questionNum:8,type:'fill',prompt:`Has ______`,correctAnswer:'parking',acceptAlts:["garage"]},
    { part:1,questionNum:9,type:'fill',prompt:`Deposit: £______`,correctAnswer:'1500'},
    { part:1,questionNum:10,type:'fill',prompt:`Agent: ______`,correctAnswer:'Harris'},
    { part:2,questionNum:11,type:'choice',prompt:`Museum opened:`,options:["A: 1995","B: 2005","C: 2015"],correctAnswer:'B'},
    { part:2,questionNum:12,type:'fill',prompt:`Over ______ visitors/yr`,correctAnswer:'500000',acceptAlts:["500,000"]},
    { part:2,questionNum:13,type:'fill',prompt:`Café Floor ______`,correctAnswer:'2',acceptAlts:["two"]},
    { part:2,questionNum:14,type:'choice',prompt:`Gift shop near:`,options:["A: Entrance","B: Exit","C: Lift"],correctAnswer:'B'},
    { part:2,questionNum:15,type:'fill',prompt:`Exhibition till ______`,correctAnswer:'March'},
    { part:2,questionNum:16,type:'fill',prompt:`Tickets: £______`,correctAnswer:'12'},
    { part:2,questionNum:17,type:'choice',prompt:`Free on:`,options:["A: Mon","B: Tue","C: Sun"],correctAnswer:'C'},
    { part:2,questionNum:18,type:'fill',prompt:`Audio: ______ languages`,correctAnswer:'8',acceptAlts:["eight"]},
    { part:2,questionNum:19,type:'fill',prompt:`School ______ visits`,correctAnswer:'guided',acceptAlts:["tours"]},
    { part:2,questionNum:20,type:'choice',prompt:`New wing:`,options:["A: 2025","B: 2026","C: 2027"],correctAnswer:'A'},
    { part:3,questionNum:21,type:'fill',prompt:`Study on ______ birds`,correctAnswer:'migrating',acceptAlts:["migration"]},
    { part:3,questionNum:22,type:'choice',prompt:`Species tracked:`,options:["A: 12","B: 24","C: 36"],correctAnswer:'B'},
    { part:3,questionNum:23,type:'fill',prompt:`Used ______ tags`,correctAnswer:'satellite',acceptAlts:["GPS"]},
    { part:3,questionNum:24,type:'fill',prompt:`Main threat: ______ loss`,correctAnswer:'habitat'},
    { part:3,questionNum:25,type:'choice',prompt:`Travel up to:`,options:["A: 5k km","B: 10k km","C: 15k km"],correctAnswer:'B'},
    { part:3,questionNum:26,type:'fill',prompt:`Spans ______ years`,correctAnswer:'5',acceptAlts:["five"]},
    { part:3,questionNum:27,type:'choice',prompt:`Funding:`,options:["A: Govt","B: Charity","C: Uni"],correctAnswer:'A'},
    { part:3,questionNum:28,type:'fill',prompt:`Published in ______`,correctAnswer:'Nature'},
    { part:3,questionNum:29,type:'fill',prompt:`Next: ______`,correctAnswer:'spring'},
    { part:3,questionNum:30,type:'choice',prompt:`Student role:`,options:["A: Data","B: Field","C: Writing"],correctAnswer:'B'},
    { part:4,questionNum:31,type:'fill',prompt:`______B lack clean water`,correctAnswer:'2',acceptAlts:["two"]},
    { part:4,questionNum:32,type:'fill',prompt:`Water covers ______%`,correctAnswer:'71%',acceptAlts:["71"]},
    { part:4,questionNum:33,type:'choice',prompt:`Largest lake:`,options:["A: Superior","B: Victoria","C: Baikal"],correctAnswer:'A'},
    { part:4,questionNum:34,type:'fill',prompt:`Desal: $______/m³`,correctAnswer:'1'},
    { part:4,questionNum:35,type:'fill',prompt:`Rainwater saves ______%`,correctAnswer:'40'},
    { part:4,questionNum:36,type:'choice',prompt:`Driest:`,options:["A: Africa","B: Aus","C: Antartica"],correctAnswer:'C'},
    { part:4,questionNum:37,type:'fill',prompt:`Aquifers: ______ yrs`,correctAnswer:'1000',acceptAlts:["1,000"]},
    { part:4,questionNum:38,type:'choice',prompt:`Best irrigation:`,options:["A: Flood","B: Drip","C: Spray"],correctAnswer:'B'},
    { part:4,questionNum:39,type:'fill',prompt:`Wastewater: ______`,correctAnswer:'recycled',acceptAlts:["reused"]},
    { part:4,questionNum:40,type:'fill',prompt:`______ management`,correctAnswer:'integrated',acceptAlts:["water"]},
  ],
  'cambridge-21-3': [
    { part:1,questionNum:1,type:'fill',prompt:`Order a ______`,correctAnswer:'cake',acceptAlts:["birthday cake"]},
    { part:1,questionNum:2,type:'fill',prompt:`For ______ people`,correctAnswer:'20',acceptAlts:["twenty"]},
    { part:1,questionNum:3,type:'fill',prompt:`Flavour: ______`,correctAnswer:'chocolate'},
    { part:1,questionNum:4,type:'fill',prompt:`On ______`,correctAnswer:'Saturday'},
    { part:1,questionNum:5,type:'choice',prompt:`Decoration:`,options:["A: Flowers","B: Candles","C: Writing"],correctAnswer:'C'},
    { part:1,questionNum:6,type:'fill',prompt:`Write: Happy ______`,correctAnswer:'Birthday'},
    { part:1,questionNum:7,type:'fill',prompt:`Total: £______`,correctAnswer:'45'},
    { part:1,questionNum:8,type:'choice',prompt:`Allergies:`,options:["A: Nuts","B: Dairy","C: None"],correctAnswer:'C'},
    { part:1,questionNum:9,type:'fill',prompt:`Pickup: ______`,correctAnswer:'2pm',acceptAlts:["14:00"]},
    { part:1,questionNum:10,type:'fill',prompt:`Shop: ______`,correctAnswer:'Sweet'},
    { part:2,questionNum:11,type:'fill',prompt:`Over ______ species`,correctAnswer:'200'},
    { part:2,questionNum:12,type:'choice',prompt:`New exhibit:`,options:["A: Lions","B: Penguins","C: Elephants"],correctAnswer:'B'},
    { part:2,questionNum:13,type:'fill',prompt:`Feeding: ______`,correctAnswer:'11am',acceptAlts:["11:00"]},
    { part:2,questionNum:14,type:'fill',prompt:`Entry: £______ adults`,correctAnswer:'18'},
    { part:2,questionNum:15,type:'choice',prompt:`Under ___ free:`,options:["A: 3","B: 5","C: 10"],correctAnswer:'A'},
    { part:2,questionNum:16,type:'fill',prompt:`Parking: £______`,correctAnswer:'5'},
    { part:2,questionNum:17,type:'fill',prompt:`______ meals`,correctAnswer:'hot',acceptAlts:["cooked"]},
    { part:2,questionNum:18,type:'choice',prompt:`Days:`,options:["A: 7","B: 6","C: 5"],correctAnswer:'A'},
    { part:2,questionNum:19,type:'fill',prompt:`School ______ booking`,correctAnswer:'advance'},
    { part:2,questionNum:20,type:'fill',prompt:`www.______zoo`,correctAnswer:'riverside'},
    { part:3,questionNum:21,type:'fill',prompt:`Research on ______ sleep`,correctAnswer:'animal',acceptAlts:["animals"]},
    { part:3,questionNum:22,type:'choice',prompt:`Cats sleep:`,options:["A: 12h","B: 16h","C: 20h"],correctAnswer:'B'},
    { part:3,questionNum:23,type:'fill',prompt:`Dolphins eye ______`,correctAnswer:'open'},
    { part:3,questionNum:24,type:'fill',prompt:`Bears: ______ months`,correctAnswer:'6',acceptAlts:["six"]},
    { part:3,questionNum:25,type:'choice',prompt:`Sleep cycles:`,options:["A: 3","B: 4","C: 5"],correctAnswer:'C'},
    { part:3,questionNum:26,type:'fill',prompt:`REM: Rapid Eye ______`,correctAnswer:'Movement'},
    { part:3,questionNum:27,type:'fill',prompt:`Adults: ______ hours`,correctAnswer:'8'},
    { part:3,questionNum:28,type:'choice',prompt:`Affects:`,options:["A: Memory","B: Vision","C: Hearing"],correctAnswer:'A'},
    { part:3,questionNum:29,type:'fill',prompt:`Melatonin regulates ______`,correctAnswer:'sleep'},
    { part:3,questionNum:30,type:'choice',prompt:`Advice:`,options:["A: Nap","B: Regular","C: Less sleep"],correctAnswer:'B'},
    { part:4,questionNum:31,type:'fill',prompt:`Volcanoes produce ______ ash`,correctAnswer:'millions',acceptAlts:["tons"]},
    { part:4,questionNum:32,type:'fill',prompt:`Tallest: ______`,correctAnswer:'Mauna Kea'},
    { part:4,questionNum:33,type:'choice',prompt:`Active:`,options:["A: 500","B: 1500","C: 2500"],correctAnswer:'B'},
    { part:4,questionNum:34,type:'fill',prompt:`______ scale`,correctAnswer:'VEI',acceptAlts:["volcanic explosivity"]},
    { part:4,questionNum:35,type:'fill',prompt:`Lava: ______°C`,correctAnswer:'1200',acceptAlts:["1,200"]},
    { part:4,questionNum:36,type:'choice',prompt:`Ring of Fire:`,options:["A: 100","B: 300","C: 450"],correctAnswer:'C'},
    { part:4,questionNum:37,type:'fill',prompt:`Magma from ______`,correctAnswer:'mantle'},
    { part:4,questionNum:38,type:'fill',prompt:`Pompeii: ______ AD`,correctAnswer:'79'},
    { part:4,questionNum:39,type:'choice',prompt:`Monitoring:`,options:["A: Seismographs","B: Drones","C: Satellites"],correctAnswer:'A'},
    { part:4,questionNum:40,type:'fill',prompt:`Evacuation ______ crucial`,correctAnswer:'plans',acceptAlts:["routes"]},
  ],
  'cambridge-21-4': [
    { part:1,questionNum:1,type:'fill',prompt:`Book a ______`,correctAnswer:'hotel',acceptAlts:["room"]},
    { part:1,questionNum:2,type:'fill',prompt:`______ nights`,correctAnswer:'3',acceptAlts:["three"]},
    { part:1,questionNum:3,type:'fill',prompt:`Arriving ______`,correctAnswer:'Friday'},
    { part:1,questionNum:4,type:'choice',prompt:`Room:`,options:["A: Single","B: Double","C: Twin"],correctAnswer:'B'},
    { part:1,questionNum:5,type:'fill',prompt:`Sea ______ view`,correctAnswer:'view'},
    { part:1,questionNum:6,type:'fill',prompt:`£______/night`,correctAnswer:'120'},
    { part:1,questionNum:7,type:'choice',prompt:`Breakfast:`,options:["A: Yes","B: No","C: Extra"],correctAnswer:'A'},
    { part:1,questionNum:8,type:'fill',prompt:`Parking £______`,correctAnswer:'8'},
    { part:1,questionNum:9,type:'fill',prompt:`Hotel: The ______`,correctAnswer:'Royal'},
    { part:1,questionNum:10,type:'fill',prompt:`Ref: ______`,correctAnswer:'BK4421'},
    { part:2,questionNum:11,type:'fill',prompt:`______ hectares`,correctAnswer:'200'},
    { part:2,questionNum:12,type:'fill',prompt:`______ litres daily`,correctAnswer:'5000',acceptAlts:["5,000"]},
    { part:2,questionNum:13,type:'choice',prompt:`Breed:`,options:["A: Jersey","B: Holstein","C: Guernsey"],correctAnswer:'B'},
    { part:2,questionNum:14,type:'fill',prompt:`Eat ______ kg/day`,correctAnswer:'25'},
    { part:2,questionNum:15,type:'fill',prompt:`Family-run: ______ yrs`,correctAnswer:'3',acceptAlts:["three"]},
    { part:2,questionNum:16,type:'choice',prompt:`Solar powers:`,options:["A: 20%","B: 40%","C: 60%"],correctAnswer:'B'},
    { part:2,questionNum:17,type:'fill',prompt:`Cheese aged ______ months`,correctAnswer:'6',acceptAlts:["six"]},
    { part:2,questionNum:18,type:'fill',prompt:`______ products`,correctAnswer:'organic'},
    { part:2,questionNum:19,type:'choice',prompt:`Visitors:`,options:["A: 5k","B: 10k","C: 15k"],correctAnswer:'C'},
    { part:2,questionNum:20,type:'fill',prompt:`Open ______ days`,correctAnswer:'6',acceptAlts:["six"]},
    { part:3,questionNum:21,type:'fill',prompt:`Study on ______ learning`,correctAnswer:'language',acceptAlts:["languages"]},
    { part:3,questionNum:22,type:'choice',prompt:`Students:`,options:["A: 50","B: 100","C: 200"],correctAnswer:'B'},
    { part:3,questionNum:23,type:'fill',prompt:`After ______ weeks`,correctAnswer:'12'},
    { part:3,questionNum:24,type:'fill',prompt:`App group +______%`,correctAnswer:'30'},
    { part:3,questionNum:25,type:'choice',prompt:`Best improvement:`,options:["A: Speaking","B: Reading","C: Writing"],correctAnswer:'A'},
    { part:3,questionNum:26,type:'fill',prompt:`Control used ______ methods`,correctAnswer:'traditional'},
    { part:3,questionNum:27,type:'fill',prompt:`Published ______ 2024`,correctAnswer:'January',acceptAlts:["Jan"]},
    { part:3,questionNum:28,type:'choice',prompt:`Limitation:`,options:["A: Size","B: Duration","C: Age"],correctAnswer:'B'},
    { part:3,questionNum:29,type:'fill',prompt:`Follow-up: ______`,correctAnswer:'autumn'},
    { part:3,questionNum:30,type:'fill',prompt:`£______ per student`,correctAnswer:'15'},
    { part:4,questionNum:31,type:'fill',prompt:`Coral covers ______%`,correctAnswer:'1%',acceptAlts:["1"]},
    { part:4,questionNum:32,type:'fill',prompt:`Reef supports ______% species`,correctAnswer:'25%',acceptAlts:["25"]},
    { part:4,questionNum:33,type:'choice',prompt:`Bleaching:`,options:["A: Pollution","B: Temperature","C: Fishing"],correctAnswer:'B'},
    { part:4,questionNum:34,type:'fill',prompt:`Barrier Reef: ______ km`,correctAnswer:'2300',acceptAlts:["2,300"]},
    { part:4,questionNum:35,type:'fill',prompt:`Protects against ______`,correctAnswer:'storms',acceptAlts:["erosion"]},
    { part:4,questionNum:36,type:'choice',prompt:`Fastest coral:`,options:["A: Brain","B: Staghorn","C: Table"],correctAnswer:'B'},
    { part:4,questionNum:37,type:'fill',prompt:`Grows ______ cm/yr`,correctAnswer:'10',acceptAlts:["ten"]},
    { part:4,questionNum:38,type:'fill',prompt:`Algae: ______`,correctAnswer:'zooxanthellae'},
    { part:4,questionNum:39,type:'choice',prompt:`Need:`,options:["A: Research","B: Local","C: Global policy"],correctAnswer:'C'},
    { part:4,questionNum:40,type:'fill',prompt:`Recovery: ______ years`,correctAnswer:'10',acceptAlts:["ten"]},
  ],
  'authentic-1': [
    { part:1,questionNum:1,type:'fill',prompt:`Join ______ club`,correctAnswer:'debate',acceptAlts:["debating"]},
    { part:1,questionNum:2,type:'fill',prompt:`Every ______`,correctAnswer:'Tuesday'},
    { part:1,questionNum:3,type:'fill',prompt:`Room ______`,correctAnswer:'301'},
    { part:1,questionNum:4,type:'choice',prompt:`First topic:`,options:["A: Climate","B: Education","C: Tech"],correctAnswer:'B'},
    { part:1,questionNum:5,type:'fill',prompt:`Fee: £______/term`,correctAnswer:'10'},
    { part:1,questionNum:6,type:'fill',prompt:`President: ______`,correctAnswer:'Sarah'},
    { part:1,questionNum:7,type:'choice',prompt:`Competition:`,options:["A: Nov","B: Dec","C: Jan"],correctAnswer:'C'},
    { part:1,questionNum:8,type:'fill',prompt:`Open to all ______`,correctAnswer:'years',acceptAlts:["year groups"]},
    { part:1,questionNum:9,type:'fill',prompt:`Contact: ______@school`,correctAnswer:'debate'},
    { part:1,questionNum:10,type:'choice',prompt:`Coach:`,options:["A: Mr Jones","B: Ms Lee","C: Dr Khan"],correctAnswer:'B'},
    { part:2,questionNum:11,type:'fill',prompt:`Gym opens ______`,correctAnswer:'January'},
    { part:2,questionNum:12,type:'fill',prompt:`£______ million`,correctAnswer:'5',acceptAlts:["five"]},
    { part:2,questionNum:13,type:'choice',prompt:`Pool:`,options:["A: 20m","B: 25m","C: 30m"],correctAnswer:'B'},
    { part:2,questionNum:14,type:'fill',prompt:`______ squash courts`,correctAnswer:'4',acceptAlts:["four"]},
    { part:2,questionNum:15,type:'fill',prompt:`Classes from ______`,correctAnswer:'6am'},
    { part:2,questionNum:16,type:'choice',prompt:`Members get:`,options:["A: Parking","B: Towels","C: Sauna"],correctAnswer:'C'},
    { part:2,questionNum:17,type:'fill',prompt:`Annual: £______`,correctAnswer:'300'},
    { part:2,questionNum:18,type:'fill',prompt:`Student: £______`,correctAnswer:'180'},
    { part:2,questionNum:19,type:'fill',prompt:`Trainer: £______/hr`,correctAnswer:'40'},
    { part:2,questionNum:20,type:'choice',prompt:`Hours:`,options:["A: 5am-11pm","B: 6am-10pm","C: 7am-10pm"],correctAnswer:'A'},
    { part:3,questionNum:21,type:'fill',prompt:`______ memory study`,correctAnswer:'spatial',acceptAlts:["space"]},
    { part:3,questionNum:22,type:'choice',prompt:`Subjects:`,options:["A: Kids","B: Adults","C: Elderly"],correctAnswer:'B'},
    { part:3,questionNum:23,type:'fill',prompt:`______ improvement`,correctAnswer:'significant'},
    { part:3,questionNum:24,type:'fill',prompt:`Music +______%`,correctAnswer:'25'},
    { part:3,questionNum:25,type:'choice',prompt:`Best music:`,options:["A: Classical","B: Pop","C: None"],correctAnswer:'A'},
    { part:3,questionNum:26,type:'fill',prompt:`______ weeks study`,correctAnswer:'8',acceptAlts:["eight"]},
    { part:3,questionNum:27,type:'fill',prompt:`In ______ Review`,correctAnswer:'Psychology'},
    { part:3,questionNum:28,type:'choice',prompt:`Next:`,options:["A: More","B: Brain scans","C: Long-term"],correctAnswer:'B'},
    { part:3,questionNum:29,type:'fill',prompt:`Funded by ______`,correctAnswer:'research'},
    { part:3,questionNum:30,type:'fill',prompt:`Team: ______ researchers`,correctAnswer:'6',acceptAlts:["six"]},
    { part:4,questionNum:31,type:'fill',prompt:`Convert ______ to electricity`,correctAnswer:'sunlight',acceptAlts:["sun"]},
    { part:4,questionNum:32,type:'fill',prompt:`Efficiency +______%`,correctAnswer:'30'},
    { part:4,questionNum:33,type:'choice',prompt:`Best angle:`,options:["A: 15°","B: 30°","C: 45°"],correctAnswer:'C'},
    { part:4,questionNum:34,type:'fill',prompt:`Payback: ______ years`,correctAnswer:'7',acceptAlts:["seven"]},
    { part:4,questionNum:35,type:'fill',prompt:`Battery: ______ kWh`,correctAnswer:'10'},
    { part:4,questionNum:36,type:'choice',prompt:`Install takes:`,options:["A: 1 day","B: 2-3 days","C: 1 week"],correctAnswer:'B'},
    { part:4,questionNum:37,type:'fill',prompt:`Maintenance: ______`,correctAnswer:'minimal',acceptAlts:["low"]},
    { part:4,questionNum:38,type:'fill',prompt:`Lifespan: ______ years`,correctAnswer:'25'},
    { part:4,questionNum:39,type:'choice',prompt:`Govt offers:`,options:["A: Tax credit","B: Free install","C: Rebate"],correctAnswer:'A'},
    { part:4,questionNum:40,type:'fill',prompt:`Carbon -______ tonnes`,correctAnswer:'4',acceptAlts:["four"]},
  ],
  'authentic-0614': [
    { part:1,questionNum:1,type:'fill',prompt:`Report stolen ______`,correctAnswer:'bicycle',acceptAlts:["bike"]},
    { part:1,questionNum:2,type:'fill',prompt:`Colour: ______`,correctAnswer:'blue'},
    { part:1,questionNum:3,type:'fill',prompt:`______ Street`,correctAnswer:'Church'},
    { part:1,questionNum:4,type:'fill',prompt:`Between ______ and ______`,correctAnswer:'2pm'},
    { part:1,questionNum:5,type:'choice',prompt:`Lock:`,options:["A: Cable","B: D-lock","C: Chain"],correctAnswer:'B'},
    { part:1,questionNum:6,type:'fill',prompt:`Serial: ______`,correctAnswer:'BK2847'},
    { part:1,questionNum:7,type:'fill',prompt:`______ Road`,correctAnswer:'Oak'},
    { part:1,questionNum:8,type:'fill',prompt:`Phone: ______`,correctAnswer:'07912'},
    { part:1,questionNum:9,type:'choice',prompt:`Insurance:`,options:["A: Yes","B: No","C: Expired"],correctAnswer:'A'},
    { part:1,questionNum:10,type:'fill',prompt:`Officer: ______ #45`,correctAnswer:'Constable'},
    { part:2,questionNum:11,type:'fill',prompt:`______ weeks`,correctAnswer:'10',acceptAlts:["ten"]},
    { part:2,questionNum:12,type:'fill',prompt:`Tuition: £______`,correctAnswer:'2500'},
    { part:2,questionNum:13,type:'choice',prompt:`Start:`,options:["A: Jan 15","B: Feb 1","C: Feb 15"],correctAnswer:'C'},
    { part:2,questionNum:14,type:'fill',prompt:`From ______ to ______`,correctAnswer:'9am'},
    { part:2,questionNum:15,type:'fill',prompt:`Max ______ per class`,correctAnswer:'15'},
    { part:2,questionNum:16,type:'choice',prompt:`Includes:`,options:["A: Textbooks","B: Laptop","C: Lunch"],correctAnswer:'A'},
    { part:2,questionNum:17,type:'fill',prompt:`Exam: ______`,correctAnswer:'Friday'},
    { part:2,questionNum:18,type:'fill',prompt:`Certificate: ______ days`,correctAnswer:'14'},
    { part:2,questionNum:19,type:'fill',prompt:`Parking: £______`,correctAnswer:'3'},
    { part:2,questionNum:20,type:'choice',prompt:`Accommodation:`,options:["A: On-site","B: Nearby","C: None"],correctAnswer:'B'},
    { part:3,questionNum:21,type:'fill',prompt:`Study on ______ sleep`,correctAnswer:'teenagers',acceptAlts:["teens"]},
    { part:3,questionNum:22,type:'fill',prompt:`Need ______ hours`,correctAnswer:'9',acceptAlts:["nine"]},
    { part:3,questionNum:23,type:'choice',prompt:`School start:`,options:["A: 7am","B: 8:30","C: 10am"],correctAnswer:'C'},
    { part:3,questionNum:24,type:'fill',prompt:`Melatonin peaks ______`,correctAnswer:'11pm',acceptAlts:["23:00"]},
    { part:3,questionNum:25,type:'fill',prompt:`Affects ______ performance`,correctAnswer:'academic'},
    { part:3,questionNum:26,type:'choice',prompt:`Later starts:`,options:["A: UK&US","B: Spain&Italy","C: FR&DE"],correctAnswer:'B'},
    { part:3,questionNum:27,type:'fill',prompt:`Published in ______`,correctAnswer:'2023'},
    { part:3,questionNum:28,type:'fill',prompt:`Sample: ______`,correctAnswer:'5000',acceptAlts:["5,000"]},
    { part:3,questionNum:29,type:'choice',prompt:`Challenge:`,options:["A: Buses","B: Parents","C: Both"],correctAnswer:'C'},
    { part:3,questionNum:30,type:'fill',prompt:`Shift by ______ min`,correctAnswer:'30'},
    { part:4,questionNum:31,type:'fill',prompt:`Produce ______ oxygen`,correctAnswer:'20%',acceptAlts:["20"]},
    { part:4,questionNum:32,type:'fill',prompt:`Lost ______ hectares/day`,correctAnswer:'80000',acceptAlts:["80,000"]},
    { part:4,questionNum:33,type:'choice',prompt:`Main cause:`,options:["A: Logging","B: Farming","C: Mining"],correctAnswer:'B'},
    { part:4,questionNum:34,type:'fill',prompt:`______ tribes`,correctAnswer:'100',acceptAlts:["hundreds"]},
    { part:4,questionNum:35,type:'fill',prompt:`Carbon: ______ billion tonnes`,correctAnswer:'200'},
    { part:4,questionNum:36,type:'choice',prompt:`Largest:`,options:["A: Congo","B: Amazon","C: Daintree"],correctAnswer:'B'},
    { part:4,questionNum:37,type:'fill',prompt:`Canopy: ______ m`,correctAnswer:'45'},
    { part:4,questionNum:38,type:'fill',prompt:`Rate: ______%/yr`,correctAnswer:'0.5',acceptAlts:["half"]},
    { part:4,questionNum:39,type:'choice',prompt:`Solution:`,options:["A: Ban","B: Reforest","C: Sustainable"],correctAnswer:'C'},
    { part:4,questionNum:40,type:'fill',prompt:`Protection ______ expanding`,correctAnswer:'areas',acceptAlts:["zones"]},
  ],
  'authentic-3': [
    { part:1,questionNum:1,type:'fill',prompt:`Table for ______`,correctAnswer:'6',acceptAlts:["six"]},
    { part:1,questionNum:2,type:'fill',prompt:`______ evening`,correctAnswer:'Saturday'},
    { part:1,questionNum:3,type:'fill',prompt:`At ______ o'clock`,correctAnswer:'7',acceptAlts:["7:00","seven"]},
    { part:1,questionNum:4,type:'choice',prompt:`Indoor/Outdoor:`,options:["A: Indoor","B: Outdoor","C: No pref"],correctAnswer:'B'},
    { part:1,questionNum:5,type:'fill',prompt:`Near the ______`,correctAnswer:'garden'},
    { part:1,questionNum:6,type:'fill',prompt:`Budget: £______`,correctAnswer:'200'},
    { part:1,questionNum:7,type:'choice',prompt:`Veg options:`,options:["A: 2","B: 1","C: None"],correctAnswer:'A'},
    { part:1,questionNum:8,type:'fill',prompt:`Restaurant: The ______`,correctAnswer:'Olive'},
    { part:1,questionNum:9,type:'fill',prompt:`______ Lane`,correctAnswer:'High'},
    { part:1,questionNum:10,type:'fill',prompt:`Deposit: £______`,correctAnswer:'50'},
    { part:2,questionNum:11,type:'fill',prompt:`______ courts`,correctAnswer:'8',acceptAlts:["eight"]},
    { part:2,questionNum:12,type:'fill',prompt:`£______/month`,correctAnswer:'35'},
    { part:2,questionNum:13,type:'choice',prompt:`New:`,options:["A: Climbing wall","B: Sauna","C: Dance"],correctAnswer:'A'},
    { part:2,questionNum:14,type:'fill',prompt:`Ages ______`,correctAnswer:'8-16',acceptAlts:["8 to 16"]},
    { part:2,questionNum:15,type:'fill',prompt:`______ sessions/week`,correctAnswer:'3'},
    { part:2,questionNum:16,type:'choice',prompt:`Kids on:`,options:["A: Mon/Wed","B: Tue/Thu","C: Sat/Sun"],correctAnswer:'C'},
    { part:2,questionNum:17,type:'fill',prompt:`Coach: ______`,correctAnswer:'David'},
    { part:2,questionNum:18,type:'fill',prompt:`Tournament: ______`,correctAnswer:'July'},
    { part:2,questionNum:19,type:'fill',prompt:`Entry: £______`,correctAnswer:'15'},
    { part:2,questionNum:20,type:'choice',prompt:`Prizes:`,options:["A: Top 3","B: Top 5","C: All"],correctAnswer:'A'},
    { part:3,questionNum:21,type:'fill',prompt:`Study on ______ waste`,correctAnswer:'household'},
    { part:3,questionNum:22,type:'fill',prompt:`______ kg/week wasted`,correctAnswer:'5',acceptAlts:["five"]},
    { part:3,questionNum:23,type:'choice',prompt:`Most wasted:`,options:["A: Dairy","B: Veg","C: Bread"],correctAnswer:'B'},
    { part:3,questionNum:24,type:'fill',prompt:`Cost: £______/yr`,correctAnswer:'700'},
    { part:3,questionNum:25,type:'fill',prompt:`Best: ______ planning`,correctAnswer:'meal'},
    { part:3,questionNum:26,type:'choice',prompt:`Apps reduce:`,options:["A: 10%","B: 25%","C: 40%"],correctAnswer:'B'},
    { part:3,questionNum:27,type:'fill',prompt:`Compost reduces ______ 50%`,correctAnswer:'waste'},
    { part:3,questionNum:28,type:'fill',prompt:`Labels ______`,correctAnswer:'misleading'},
    { part:3,questionNum:29,type:'choice',prompt:`Supermarkets waste:`,options:["A: 1%","B: 3%","C: 5%"],correctAnswer:'B'},
    { part:3,questionNum:30,type:'fill',prompt:`______ redistribution`,correctAnswer:'food',acceptAlts:["surplus"]},
    { part:4,questionNum:31,type:'fill',prompt:`______ years old`,correctAnswer:'5000',acceptAlts:["5,000"]},
    { part:4,questionNum:32,type:'fill',prompt:`Tallest: ______`,correctAnswer:'Pyramid'},
    { part:4,questionNum:33,type:'choice',prompt:`Modern focus:`,options:["A: Beauty","B: Sustainability","C: Cost"],correctAnswer:'B'},
    { part:4,questionNum:34,type:'fill',prompt:`Green saves ______%`,correctAnswer:'30'},
    { part:4,questionNum:35,type:'fill',prompt:`Most used ______`,correctAnswer:'material'},
    { part:4,questionNum:36,type:'choice',prompt:`3D houses:`,options:["A: 1 day","B: 1 week","C: 1 month"],correctAnswer:'A'},
    { part:4,questionNum:37,type:'fill',prompt:`Smart: ______ sensors`,correctAnswer:'IoT',acceptAlts:["internet of things"]},
    { part:4,questionNum:38,type:'fill',prompt:`Biomimicry copies ______`,correctAnswer:'nature'},
    { part:4,questionNum:39,type:'choice',prompt:`Future:`,options:["A: Taller","B: Underground","C: Floating cities"],correctAnswer:'C'},
    { part:4,questionNum:40,type:'fill',prompt:`Urban by 2050: ______%`,correctAnswer:'68',acceptAlts:["sixty-eight"]},
  ],
  'volume9-1': [
    { part:1,questionNum:1,type:'fill',prompt:`Enquiry: ______ course`,correctAnswer:'photography',acceptAlts:["photo"]},
    { part:1,questionNum:2,type:'fill',prompt:`______ weeks`,correctAnswer:'6',acceptAlts:["six"]},
    { part:1,questionNum:3,type:'fill',prompt:`Starting ______`,correctAnswer:'October'},
    { part:1,questionNum:4,type:'choice',prompt:`Level:`,options:["A: Beginner","B: Intermediate","C: Advanced"],correctAnswer:'A'},
    { part:1,questionNum:5,type:'fill',prompt:`Fee: £______`,correctAnswer:'180'},
    { part:1,questionNum:6,type:'fill',prompt:`Includes ______ materials`,correctAnswer:'all'},
    { part:1,questionNum:7,type:'choice',prompt:`Sessions/week:`,options:["A: 1","B: 2","C: 3"],correctAnswer:'B'},
    { part:1,questionNum:8,type:'fill',prompt:`Location: ______ Building`,correctAnswer:'Arts'},
    { part:1,questionNum:9,type:'fill',prompt:`Instructor: ______`,correctAnswer:'Anita'},
    { part:1,questionNum:10,type:'choice',prompt:`Equipment:`,options:["A: Own","B: Provided","C: Rental"],correctAnswer:'C'},
    { part:2,questionNum:11,type:'fill',prompt:`Built in ______`,correctAnswer:'1892'},
    { part:2,questionNum:12,type:'fill',prompt:`______ floors`,correctAnswer:'3',acceptAlts:["three"]},
    { part:2,questionNum:13,type:'choice',prompt:`Exhibition:`,options:["A: Egypt","B: Modern Art","C: Space"],correctAnswer:'A'},
    { part:2,questionNum:14,type:'fill',prompt:`Till ______`,correctAnswer:'April'},
    { part:2,questionNum:15,type:'fill',prompt:`Audio: ______ languages`,correctAnswer:'6',acceptAlts:["six"]},
    { part:2,questionNum:16,type:'fill',prompt:`Café: ______ floor`,correctAnswer:'top'},
    { part:2,questionNum:17,type:'choice',prompt:`Free:`,options:["A: Under 12","B: Under 16","C: Under 18"],correctAnswer:'A'},
    { part:2,questionNum:18,type:'fill',prompt:`School ______ discount`,correctAnswer:'20%',acceptAlts:["20"]},
    { part:2,questionNum:19,type:'fill',prompt:`Over ______ items`,correctAnswer:'500'},
    { part:2,questionNum:20,type:'choice',prompt:`Photos:`,options:["A: Yes","B: No","C: Flash only"],correctAnswer:'B'},
    { part:3,questionNum:21,type:'fill',prompt:`Study on ______ urbanisation`,correctAnswer:'rapid'},
    { part:3,questionNum:22,type:'fill',prompt:`______ million people`,correctAnswer:'12',acceptAlts:["twelve"]},
    { part:3,questionNum:23,type:'choice',prompt:`Main problem:`,options:["A: Traffic","B: Housing","C: Pollution"],correctAnswer:'B'},
    { part:3,questionNum:24,type:'fill',prompt:`______ homes shortage`,correctAnswer:'affordable'},
    { part:3,questionNum:25,type:'fill',prompt:`Rent +______%`,correctAnswer:'40'},
    { part:3,questionNum:26,type:'choice',prompt:`Solution:`,options:["A: Suburbs","B: High-rises","C: Mixed use"],correctAnswer:'C'},
    { part:3,questionNum:27,type:'fill',prompt:`Green -stress ______%`,correctAnswer:'20'},
    { part:3,questionNum:28,type:'fill',prompt:`Transport needs £______B`,correctAnswer:'10'},
    { part:3,questionNum:29,type:'choice',prompt:`Timeline:`,options:["A: 5y","B: 10y","C: 20y"],correctAnswer:'B'},
    { part:3,questionNum:30,type:'fill',prompt:`Community ______`,correctAnswer:'engagement'},
    { part:4,questionNum:31,type:'fill',prompt:`DNA: ______ billion bases`,correctAnswer:'3',acceptAlts:["three"]},
    { part:4,questionNum:32,type:'fill',prompt:`Sequenced in ______`,correctAnswer:'2003'},
    { part:4,questionNum:33,type:'choice',prompt:`Testing predicts:`,options:["A: All diseases","B: Some","C: Lifespan"],correctAnswer:'B'},
    { part:4,questionNum:34,type:'fill',prompt:`CRISPR edits ______`,correctAnswer:'genes',acceptAlts:["DNA"]},
    { part:4,questionNum:35,type:'fill',prompt:`Cost from $______B`,correctAnswer:'3'},
    { part:4,questionNum:36,type:'choice',prompt:`Concern:`,options:["A: Cost","B: Privacy","C: Designer babies"],correctAnswer:'C'},
    { part:4,questionNum:37,type:'fill',prompt:`Gene therapy treats ______`,correctAnswer:'genetic',acceptAlts:["inherited"]},
    { part:4,questionNum:38,type:'fill',prompt:`Biobanks store ______`,correctAnswer:'DNA'},
    { part:4,questionNum:39,type:'choice',prompt:`Future:`,options:["A: Cloning","B: Personalised medicine","C: Superhumans"],correctAnswer:'B'},
    { part:4,questionNum:40,type:'fill',prompt:`Regulation ______ needed`,correctAnswer:'urgent'},
  ],
};

export const LISTENING_AUDIO_URLS: Record<string, string> = {
  'cambridge-21-1': 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Cambridge%2021%20-%20Test%201.mp3',
  'cambridge-21-2': 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Cambridge%2021%20-%20Test%202.mp3',
  'cambridge-21-3': 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Cambridge%2021%20-%20Test%203%20%40shohrukhposts.mp3',
  'cambridge-21-4': 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Cambridge%2021%20-%20Test%204%20%40shohrukhposts.mp3',
  'authentic-1': 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/New%20Ara%20Listening/Authentic%20Listening%20Mock%20%40shohrukhposts.mp3',
  'authentic-0614': 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Authentic%20Listening%20Mock%2006-14%20%40shohrukhposts.mp3',
  'authentic-3': 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Authentic%20Listening%20Mock%203%20%40shohrukhposts.mp3',
  'volume9-1': 'https://pub-a3ed3eec4ae344b4917067de0a9376f1.r2.dev/Volume%209%20-%20Test%201%20%40shohrukhposts.mp3',
};

export const BANK_IDS = ["cambridge-21-1","cambridge-21-2","cambridge-21-3","cambridge-21-4","authentic-1","authentic-0614","authentic-3","volume9-1"];

// ═══════════════════════════════════════════════════════════════
//  MOCK EXAM DEFINITIONS (50 exams)
// ═══════════════════════════════════════════════════════════════

const MOCK_EXAM_TOPICS = [
  { title: 'Artificial Intelligence in Education', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Space Exploration and Colonisation', cat: 'Academic' as const, diff: 'hard' as const },
  { title: 'Renewable Energy Solutions', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Climate Change Impact', cat: 'Academic' as const, diff: 'hard' as const },
  { title: 'Global Health Systems', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Ocean Conservation', cat: 'Academic' as const, diff: 'easy' as const },
  { title: 'Cultural Heritage Preservation', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Digital Privacy and Security', cat: 'Academic' as const, diff: 'hard' as const },
  { title: 'Urban Planning Innovation', cat: 'Academic' as const, diff: 'easy' as const },
  { title: 'Bioethics and Genetic Engineering', cat: 'Academic' as const, diff: 'hard' as const },
  { title: 'Sustainable Agriculture', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Transport Revolution', cat: 'Academic' as const, diff: 'easy' as const },
  { title: 'Water Resource Management', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Neuroscience of Learning', cat: 'Academic' as const, diff: 'hard' as const },
  { title: 'Poverty and Economic Growth', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Deforestation and Biodiversity', cat: 'Academic' as const, diff: 'easy' as const },
  { title: 'Criminal Justice Reform', cat: 'Academic' as const, diff: 'hard' as const },
  { title: 'Tourism and Local Economies', cat: 'General' as const, diff: 'easy' as const },
  { title: 'Remote Working Trends', cat: 'General' as const, diff: 'easy' as const },
  { title: 'Public Health Education', cat: 'General' as const, diff: 'medium' as const },
  { title: 'Youth Unemployment Solutions', cat: 'General' as const, diff: 'medium' as const },
  { title: 'Social Media Impact', cat: 'General' as const, diff: 'easy' as const },
  { title: 'Immigration Policy', cat: 'General' as const, diff: 'hard' as const },
  { title: 'Food Security Challenges', cat: 'General' as const, diff: 'medium' as const },
  { title: 'Education Equity', cat: 'General' as const, diff: 'medium' as const },
  { title: 'Digital Divide', cat: 'General' as const, diff: 'easy' as const },
  { title: 'Elderly Care Systems', cat: 'General' as const, diff: 'medium' as const },
  { title: 'Noise Pollution Effects', cat: 'General' as const, diff: 'easy' as const },
  { title: 'Housing Affordability', cat: 'General' as const, diff: 'hard' as const },
  { title: 'Gamification in Learning', cat: 'General' as const, diff: 'easy' as const },
  { title: 'Community Policing', cat: 'General' as const, diff: 'medium' as const },
  { title: 'Renewable vs Fossil Fuels', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Animal Testing Ethics', cat: 'Academic' as const, diff: 'hard' as const },
  { title: 'Internet Censorship', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Genetic Medicine Future', cat: 'Academic' as const, diff: 'hard' as const },
  { title: 'Traditional vs Modern Medicine', cat: 'General' as const, diff: 'easy' as const },
  { title: 'Working Parents Dilemma', cat: 'General' as const, diff: 'medium' as const },
  { title: 'Space Tourism Ethics', cat: 'Academic' as const, diff: 'hard' as const },
  { title: 'Fast Fashion Consequences', cat: 'General' as const, diff: 'medium' as const },
  { title: 'Language Preservation', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Volunteering Benefits', cat: 'General' as const, diff: 'easy' as const },
  { title: 'Autonomous Vehicles Safety', cat: 'Academic' as const, diff: 'hard' as const },
  { title: 'Child Development Studies', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Public Transport Investment', cat: 'General' as const, diff: 'easy' as const },
  { title: 'Scientific Research Funding', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Green Architecture Trends', cat: 'Academic' as const, diff: 'medium' as const },
  { title: 'Workplace Mental Health', cat: 'General' as const, diff: 'medium' as const },
  { title: 'Cross-Cultural Communication', cat: 'General' as const, diff: 'easy' as const },
  { title: 'Deep Sea Exploration', cat: 'Academic' as const, diff: 'hard' as const },
];

const _bankIdList = Object.keys(LISTENING_QUESTION_BANKS);
const _audioUrls = Object.values(LISTENING_AUDIO_URLS);

export const MOCK_EXAMS: MockExamDef[] = MOCK_EXAM_TOPICS.map((t, i) => {
  const bankIdx = i % _bankIdList.length;
  const bankId = _bankIdList[bankIdx];
  const audioUrl = _audioUrls[bankIdx];
  return {
    id: `mock-${i + 1}`,
    title: `IELTS Full Mock Test ${i + 1}`,
    subtitle: t.title,
    description: `Complete IELTS mock exam: ${t.title}. Includes all four sections: Listening, Reading, Writing, and Speaking.`,
    sections: ['listening', 'reading', 'writing', 'speaking'] as ('listening' | 'reading' | 'writing' | 'speaking')[],
    examType: t.cat === 'General' ? 'general' : 'academic',
    difficulty: t.diff,
    totalMinutes: 180,
    htmlFile: '',
    listeningAudioUrl: audioUrl,
    listeningBankId: bankId,
  };
});

export const MOCK_LISTENING_QUESTIONS: MockListeningQuestion[] = [
  // Part 1 – Conversation about a sailing course
  { part: 1, questionNum: 1, type: 'fill', prompt: 'Children are always accompanied by their ______', correctAnswer: 'parents', acceptAlts: ['parent', 'mum', 'mom', 'dad', 'mother', 'father'] },
  { part: 1, questionNum: 2, type: 'fill', prompt: 'Cost: £ ______', correctAnswer: '25' },
  { part: 1, questionNum: 3, type: 'fill', prompt: 'Five-day course cost: £ ______', correctAnswer: '125' },
  { part: 1, questionNum: 4, type: 'fill', prompt: 'Children learn to sail in different kinds of ______', correctAnswer: 'weather', acceptAlts: ['weathers'] },
  { part: 1, questionNum: 5, type: 'fill', prompt: 'The course is held at ______ Lake', correctAnswer: 'Windermere' },
  { part: 1, questionNum: 6, type: 'choice', prompt: 'What age range is the five-day course for?', options: ['A: 8–12', 'B: 10–14', 'C: 12–16'], correctAnswer: 'C' },
  { part: 1, questionNum: 7, type: 'choice', prompt: 'How many instructors are there per group?', options: ['A: Two', 'B: Three', 'C: Four'], correctAnswer: 'B' },
  { part: 1, questionNum: 8, type: 'fill', prompt: 'Participants should bring their own ______', correctAnswer: 'clothes', acceptAlts: ['clothing', 'wetsuit', 'wetsuits'] },
  { part: 1, questionNum: 9, type: 'fill', prompt: 'The maximum class size is ______ students', correctAnswer: '12' },
  { part: 1, questionNum: 10, type: 'fill', prompt: 'For more information call: ______', correctAnswer: '015394', acceptAlts: ['015394 32187', '01539432187'] },

  // Part 2 – University library tour
  { part: 2, questionNum: 11, type: 'choice', prompt: 'The library has been open for:', options: ['A: 5 years', 'B: 15 years', 'C: 50 years'], correctAnswer: 'B' },
  { part: 2, questionNum: 12, type: 'fill', prompt: 'The library holds over ______ volumes', correctAnswer: '300000', acceptAlts: ['300,000', '300 000', '300000 volumes'] },
  { part: 2, questionNum: 13, type: 'fill', prompt: 'Quiet study areas are on Floor ______', correctAnswer: '4', acceptAlts: ['four', 'fourth', '4th'] },
  { part: 2, questionNum: 14, type: 'choice', prompt: 'Students can borrow books for how long?', options: ['A: 1 week', 'B: 3 weeks', 'C: 1 month'], correctAnswer: 'B' },
  { part: 2, questionNum: 15, type: 'fill', prompt: 'The computer lab is open from 8am to ______', correctAnswer: '10pm', acceptAlts: ['10:00 pm', '10:00pm', '10pm', '22:00'] },
  { part: 2, questionNum: 16, type: 'choice', prompt: 'How many group study rooms are available?', options: ['A: 6', 'B: 10', 'C: 12'], correctAnswer: 'A' },
  { part: 2, questionNum: 17, type: 'fill', prompt: 'The printing cost is ______ pence per page', correctAnswer: '5', acceptAlts: ['five', '5p'] },
  { part: 2, questionNum: 18, type: 'fill', prompt: 'Inter-library loans take approximately ______ working days', correctAnswer: '5', acceptAlts: ['five'] },
  { part: 2, questionNum: 19, type: 'choice', prompt: 'Which floor has the periodicals section?', options: ['A: Floor 1', 'B: Floor 2', 'C: Floor 3'], correctAnswer: 'B' },
  { part: 2, questionNum: 20, type: 'fill', prompt: 'Students need their ______ card to enter the library', correctAnswer: 'student', acceptAlts: ['id', 'university', 'campus'] },

  // Part 3 – Academic discussion about bees
  { part: 3, questionNum: 21, type: 'choice', prompt: 'Professor agrees that the main cause of bee decline is:', options: ['A: Pesticides', 'B: Climate change', 'C: Habitat loss'], correctAnswer: 'A' },
  { part: 3, questionNum: 22, type: 'fill', prompt: 'Neonicotinoids affect bees\' ______ abilities', correctAnswer: 'navigation', acceptAlts: ['navigational', 'sense of direction'] },
  { part: 3, questionNum: 23, type: 'choice', prompt: 'The varroa mite primarily attacks:', options: ['A: Larvae only', 'B: Adult bees', 'C: Both larvae and adults'], correctAnswer: 'C' },
  { part: 3, questionNum: 24, type: 'fill', prompt: 'Bees communicate through a ______ dance', correctAnswer: 'waggle', acceptAlts: ['waggle dance'] },
  { part: 3, questionNum: 25, type: 'choice', prompt: 'How many species of bees exist worldwide?', options: ['A: About 20,000', 'B: About 50,000', 'C: About 100,000'], correctAnswer: 'A' },
  { part: 3, questionNum: 26, type: 'fill', prompt: 'Honeybee colonies should ideally have ______ workers', correctAnswer: '50000', acceptAlts: ['50,000', '50 000'] },
  { part: 3, questionNum: 27, type: 'choice', prompt: 'What percentage of food crops depend on bee pollination?', options: ['A: About 35%', 'B: About 65%', 'C: About 87%'], correctAnswer: 'C' },
  { part: 3, questionNum: 28, type: 'fill', prompt: 'The professor recommends using ______ to attract bees', correctAnswer: 'wildflowers', acceptAlts: ['wild flower', 'wild flowers', 'wildflower'] },
  { part: 3, questionNum: 29, type: 'choice', prompt: 'Student suggests studying bees in:', options: ['A: Urban gardens', 'B: Commercial farms', 'C: National parks'], correctAnswer: 'A' },
  { part: 3, questionNum: 30, type: 'fill', prompt: 'The research deadline is next ______', correctAnswer: 'friday', acceptAlts: ['Friday'] },

  // Part 4 – Lecture on ocean plastics
  { part: 4, questionNum: 31, type: 'fill', prompt: 'Approximately ______ million tonnes of plastic enter the ocean annually', correctAnswer: '8', acceptAlts: ['eight'] },
  { part: 4, questionNum: 32, type: 'choice', prompt: 'The Great Pacific Garbage Patch is:', options: ['A: Twice the size of Texas', 'B: Three times the size of France', 'C: Four times the size of the UK'], correctAnswer: 'C' },
  { part: 4, questionNum: 33, type: 'fill', prompt: 'Microplastics are defined as pieces smaller than ______ mm', correctAnswer: '5', acceptAlts: ['five'] },
  { part: 4, questionNum: 34, type: 'fill', prompt: 'Plastic takes approximately ______ years to decompose', correctAnswer: '450', acceptAlts: ['450 years', 'four hundred and fifty'] },
  { part: 4, questionNum: 35, type: 'choice', prompt: 'Which country produces the most ocean plastic waste?', options: ['A: China', 'B: India', 'C: Indonesia'], correctAnswer: 'A' },
  { part: 4, questionNum: 36, type: 'fill', prompt: 'Sea turtles mistake plastic bags for ______', correctAnswer: 'jellyfish', acceptAlts: ['jelly fish'] },
  { part: 4, questionNum: 37, type: 'choice', prompt: 'Recycling rates for plastic globally are approximately:', options: ['A: 5%', 'B: 15%', 'C: 30%'], correctAnswer: 'B' },
  { part: 4, questionNum: 38, type: 'fill', prompt: 'The speaker proposes banning single-use ______', correctAnswer: 'plastics', acceptAlts: ['plastic'] },
  { part: 4, questionNum: 39, type: 'fill', prompt: 'Biodegradable alternatives can decompose in ______ months', correctAnswer: '6', acceptAlts: ['six'] },
  { part: 4, questionNum: 40, type: 'choice', prompt: 'What does the speaker suggest students can do to help?', options: ['A: Join a beach cleanup', 'B: Reduce personal plastic use', 'C: Write to their MP'], correctAnswer: 'B' },
];

// ═══════════════════════════════════════════════════════════════
//  READING QUESTIONS (3 passages × varied types)
// ═══════════════════════════════════════════════════════════════

export interface MockReadingQuestion {
  passage: number;
  questionNum: number;
  type: 'tfng' | 'ynng' | 'mcq' | 'fill' | 'match';
  prompt: string;
  options?: string[];
  correctAnswer: string;
}

export const MOCK_READING_PASSAGES = [
  {
    title: 'The History of Coffee',
    paragraphs: [
      'The history of coffee began in the ancient coffee forests on the Ethiopian plateau. According to legend, a goat herder named Kaldi first discovered the potential of these beloved beans when he noticed that after eating berries from a certain tree, his goats became so energetic that they did not want to sleep at night.',
      'The cultivation of coffee spread to the Arabian Peninsula, and by the 15th century, coffee was being grown in the Yemeni district of Arabia. By the 16th century, it was known in Persia, Egypt, Syria, and Turkey. Coffee houses became important social centres, often called Schools of the Wise.',
      'Coffee came to Europe through the port of Venice in the 17th century, where it was met with both enthusiasm and suspicion. The clergy called it the bitter invention of Satan, but Pope Clement VIII tasted it and gave his approval. Coffee houses spread across Europe and became centres of intellectual exchange.',
      'The Dutch were the first to cultivate coffee outside of Arabia, establishing plantations in Java and Sumatra. They controlled the trade and spread coffee cultivation throughout their colonies. The French followed suit, introducing coffee to the Caribbean and Central America.',
      'Today, Brazil is the world\'s largest producer of coffee, followed by Vietnam and Colombia. The global coffee industry generates over $450 billion annually and employs more than 125 million people worldwide. Coffee remains the world\'s second most traded commodity after oil.',
    ],
  },
  {
    title: 'Climate Change and Agriculture',
    paragraphs: [
      'Climate change poses an unprecedented threat to global food security. Rising temperatures, changing precipitation patterns, and increased frequency of extreme weather events are already affecting crop yields in many regions. The Intergovernmental Panel on Climate Change has warned that without significant adaptation measures, global crop production could decline by up to 25% by 2050.',
      'Wheat, rice, and maize — the three crops that provide more than 50% of global calorie intake — are all sensitive to temperature increases. Studies have shown that for every degree Celsius rise in global temperature, wheat yields decline by 6%, rice by 3.2%, and maize by 7.4%. These effects are particularly severe in tropical and subtropical regions.',
      'Water scarcity is another major concern. Agriculture accounts for approximately 70% of global freshwater withdrawals. As droughts become more frequent and glaciers that feed rivers continue to melt, many of the world\'s most productive agricultural regions face water shortages. The Ogallala Aquifer in the United States, which supports one-fifth of American agriculture, is being depleted at an unsustainable rate.',
      'However, there are also opportunities for adaptation. New crop varieties tolerant to heat and drought are being developed through both traditional breeding and genetic engineering. Precision agriculture technologies allow farmers to optimise water and fertiliser use. Vertical farming and hydroponics offer solutions for urban areas with limited arable land.',
      'International cooperation is essential to address these challenges. The Paris Agreement and the Sustainable Development Goals provide frameworks for action, but implementation remains uneven. Developing nations, which are most vulnerable to climate impacts on agriculture, need financial and technical support to build resilient food systems.',
    ],
  },
  {
    title: 'The Psychology of Decision-Making',
    paragraphs: [
      'Every day, the average person makes approximately 35,000 decisions, most of them unconscious. From what to eat for breakfast to whether to accept a job offer, our choices shape our lives in profound ways. Understanding the psychology behind decision-making has become one of the most active areas of research in behavioural science.',
      'Nobel laureate Daniel Kahneman proposed that humans use two distinct systems of thought. System 1 operates automatically and quickly, with little or no effort. System 2 allocates attention to effortful mental activities. Most of our daily decisions are made by System 1, which relies on heuristics — mental shortcuts that are usually effective but can sometimes lead to systematic errors.',
      'One such heuristic is the anchoring effect. Research has shown that people tend to rely heavily on the first piece of information they encounter when making decisions. In one famous study, judges were influenced by the random number generated before sentencing decisions, giving harsher sentences when exposed to higher numbers.',
      'The framing effect is another cognitive bias that significantly influences decisions. People tend to be risk-averse when outcomes are presented as gains but become risk-seeking when the same outcomes are presented as losses. For example, people are more likely to accept a medical treatment when told it has a 90% survival rate than when told it has a 10% mortality rate.',
      'Emotions play a crucial role in decision-making contrary to the traditional view that rational decisions should be purely logical. Antonio Damasio\'s research on patients with damage to emotion-processing brain regions showed that these individuals struggled to make even simple decisions, suggesting that emotions are essential for effective decision-making.',
    ],
  },
];

export const MOCK_READING_QUESTIONS: MockReadingQuestion[] = [
  // Passage 1 – True/False/Not Given
  { passage: 1, questionNum: 1, type: 'tfng', prompt: 'Coffee was first discovered in Ethiopia.', correctAnswer: 'TRUE' },
  { passage: 1, questionNum: 2, type: 'tfng', prompt: 'Pope Clement VIII banned coffee in Europe.', correctAnswer: 'FALSE' },
  { passage: 1, questionNum: 3, type: 'tfng', prompt: 'The Dutch were the first to grow coffee in Asia.', correctAnswer: 'TRUE' },
  { passage: 1, questionNum: 4, type: 'tfng', prompt: 'Coffee was introduced to Europe in the 18th century.', correctAnswer: 'FALSE' },
  { passage: 1, questionNum: 5, type: 'tfng', prompt: 'Brazil produces more coffee than any other country.', correctAnswer: 'TRUE' },

  // Passage 1 – MCQ
  { passage: 1, questionNum: 6, type: 'mcq', prompt: 'According to legend, who discovered coffee?', options: ['A: A merchant named Kaldi', 'B: A goat herder named Kaldi', 'C: A shepherd named Kaldi', 'D: A farmer named Kaldi'], correctAnswer: 'B' },
  { passage: 1, questionNum: 7, type: 'mcq', prompt: 'Coffee houses in Arabia were called:', options: ['A: Houses of Learning', 'B: Schools of the Wise', 'C: Centres of Knowledge', 'D: Halls of Wisdom'], correctAnswer: 'B' },
  { passage: 1, questionNum: 8, type: 'mcq', prompt: 'What is the world\'s most traded commodity?', options: ['A: Coffee', 'B: Wheat', 'C: Oil', 'D: Gold'], correctAnswer: 'C' },

  // Passage 1 – Fill
  { passage: 1, questionNum: 9, type: 'fill', prompt: 'The global coffee industry generates over $______ billion annually.', correctAnswer: '450' },
  { passage: 1, questionNum: 10, type: 'fill', prompt: 'Coffee employs more than ______ million people worldwide.', correctAnswer: '125' },

  // Passage 2 – True/False/Not Given
  { passage: 2, questionNum: 11, type: 'tfng', prompt: 'Wheat yields decline by 7.4% for every degree Celsius of warming.', correctAnswer: 'FALSE' },
  { passage: 2, questionNum: 12, type: 'tfng', prompt: 'Agriculture uses about 70% of global freshwater.', correctAnswer: 'TRUE' },
  { passage: 2, questionNum: 13, type: 'tfng', prompt: 'Vertical farming requires large areas of arable land.', correctAnswer: 'FALSE' },

  // Passage 2 – MCQ
  { passage: 2, questionNum: 14, type: 'mcq', prompt: 'By what percentage could global crop production decline by 2050?', options: ['A: Up to 15%', 'B: Up to 25%', 'C: Up to 35%', 'D: Up to 45%'], correctAnswer: 'B' },
  { passage: 2, questionNum: 15, type: 'mcq', prompt: 'Which aquifer is mentioned as being depleted unsustainably?', options: ['A: The Nile Aquifer', 'B: The Great Artesian Basin', 'C: The Ogallala Aquifer', 'D: The Nubian Aquifer'], correctAnswer: 'C' },

  // Passage 2 – Fill
  { passage: 2, questionNum: 16, type: 'fill', prompt: 'Wheat yields decline by ______% for every degree Celsius rise.', correctAnswer: '6' },
  { passage: 2, questionNum: 17, type: 'fill', prompt: 'Rice yields decline by ______% for every degree Celsius rise.', correctAnswer: '3.2' },

  // Passage 2 – YNNG
  { passage: 2, questionNum: 18, type: 'ynng', prompt: 'Developing nations have sufficient financial support for climate adaptation.', correctAnswer: 'NO' },
  { passage: 2, questionNum: 19, type: 'ynng', prompt: 'Precision agriculture helps farmers use resources more efficiently.', correctAnswer: 'YES' },
  { passage: 2, questionNum: 20, type: 'ynng', prompt: 'The Paris Agreement has been fully implemented by all countries.', correctAnswer: 'NOT GIVEN' },

  // Passage 3 – True/False/Not Given
  { passage: 3, questionNum: 21, type: 'tfng', prompt: 'People make about 35,000 conscious decisions per day.', correctAnswer: 'FALSE' },
  { passage: 3, questionNum: 22, type: 'tfng', prompt: 'System 1 thinking is fast and automatic.', correctAnswer: 'TRUE' },
  { passage: 3, questionNum: 23, type: 'tfng', prompt: 'Judges in the anchoring study were aware of the random numbers.', correctAnswer: 'NOT GIVEN' },

  // Passage 3 – MCQ
  { passage: 3, questionNum: 24, type: 'mcq', prompt: 'Who proposed the two-system model of thinking?', options: ['A: Antonio Damasio', 'B: Daniel Kahneman', 'C: Richard Thaler', 'D: Steven Pinker'], correctAnswer: 'B' },
  { passage: 3, questionNum: 25, type: 'mcq', prompt: 'When told a treatment has a 90% survival rate, people are more likely to:', options: ['A: Reject it', 'B: Accept it', 'C: Ask for more information', 'D: Ignore it'], correctAnswer: 'B' },

  // Passage 3 – Fill
  { passage: 3, questionNum: 26, type: 'fill', prompt: 'Wheat yields decline by ______% per degree Celsius.', correctAnswer: '6' },
  { passage: 3, questionNum: 27, type: 'fill', prompt: 'System 2 allocates attention to ______ mental activities.', correctAnswer: 'effortful' },

  // Passage 3 – YNNG
  { passage: 3, questionNum: 28, type: 'ynng', prompt: 'Most daily decisions are made by System 2 thinking.', correctAnswer: 'NO' },
  { passage: 3, questionNum: 29, type: 'ynng', prompt: 'Emotions can be helpful in making decisions.', correctAnswer: 'YES' },
  { passage: 3, questionNum: 30, type: 'ynng', prompt: 'Kahneman won the Nobel Prize in Economics.', correctAnswer: 'YES' },
];

// ═══════════════════════════════════════════════════════════════
//  WRITING TASKS
// ═══════════════════════════════════════════════════════════════

export interface MockWritingTask {
  task1: {
    type: 'Bar Chart' | 'Line Graph' | 'Pie Chart' | 'Table' | 'Process';
    topic: string;
    prompt: string;
    chartData?: any;
  };
  task2: {
    type: 'Discussion' | 'Opinion' | 'Problem-Solution';
    topic: string;
    prompt: string;
  };
}

export const MOCK_WRITING_TASKS: MockWritingTask[] = [
  {
    task1: {
      type: 'Bar Chart',
      topic: 'Consumer goods expenditure',
      prompt: 'The bar chart below shows the amount of money spent on five consumer goods in four European countries in 2009.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.',
      chartData: {
        type: 'bar',
        title: 'Consumer Goods Expenditure (GBP)',
        categories: ['UK', 'France', 'Germany', 'Italy'],
        datasets: [
          { label: 'CDs', data: [68, 52, 42, 38] },
          { label: 'Photographic film', data: [45, 38, 55, 42] },
          { label: 'Toys', data: [48, 55, 35, 40] },
          { label: 'Video games', data: [42, 35, 30, 32] },
          { label: 'Sports equipment', data: [35, 42, 48, 30] },
        ],
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      },
    },
    task2: {
      type: 'Discussion',
      topic: 'University education',
      prompt: 'Some people believe that university students should be required to attend classes, while others believe that going to classes should be optional for students.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.',
    },
  },
  {
    task1: {
      type: 'Line Graph',
      topic: 'Tourist arrivals',
      prompt: 'The line graph below shows the number of tourist arrivals in three different countries from 2000 to 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.',
      chartData: {
        type: 'line',
        title: 'Tourist Arrivals (millions)',
        categories: ['2000', '2003', '2006', '2009', '2012', '2015'],
        datasets: [
          { label: 'Country A', data: [12, 15, 18, 22, 28, 35] },
          { label: 'Country B', data: [25, 24, 22, 20, 23, 26] },
          { label: 'Country C', data: [8, 10, 14, 19, 24, 30] },
        ],
        colors: ['#3b82f6', '#10b981', '#f59e0b'],
      },
    },
    task2: {
      type: 'Opinion',
      topic: 'Technology in education',
      prompt: 'Some people think that the increasing use of computers and mobile phones for communication has had a negative effect on young people\'s reading and writing skills.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.',
    },
  },
  {
    task1: {
      type: 'Pie Chart',
      topic: 'Household spending',
      prompt: 'The pie charts below show the main reasons why agricultural land becomes less productive and how the problem can be tackled.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.',
      chartData: {
        type: 'pie',
        title: 'Causes of Land Degradation',
        datasets: [
          { label: 'Over-farming', data: 35 },
          { label: 'Deforestation', data: 25 },
          { label: 'Climate change', data: 20 },
          { label: 'Industrial pollution', data: 12 },
          { label: 'Other causes', data: 8 },
        ],
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      },
    },
    task2: {
      type: 'Problem-Solution',
      topic: 'Urban pollution',
      prompt: 'In many cities, the air pollution level is dangerously high. This is causing health problems for the people living in these cities.\n\nWhat are the causes of this problem, and what measures can be taken to tackle it?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.',
    },
  },
];

// ═══════════════════════════════════════════════════════════════
//  SPEAKING TOPICS
// ═══════════════════════════════════════════════════════════════

export interface MockSpeakingPart {
  part: 1 | 2 | 3;
  questions: string[];
  cueCard?: string;
  prepareTime?: number;
  speakTime?: number;
}

export const MOCK_SPEAKING_PARTS: MockSpeakingPart[][] = [
  [
    { part: 1, questions: ['Where are you from?', 'Do you work or study?', 'What do you like about your hometown?', 'Is your hometown a good place for young people?'] },
    { part: 2, cueCard: 'Describe a book that you have read recently.\n\nYou should say:\n- what the book was about\n- why you decided to read it\n- what you liked about it\n\nand explain whether you would recommend it to others.\n\nYou have 1 minute to prepare. You should speak for 1–2 minutes.', questions: [], prepareTime: 60, speakTime: 120 },
    { part: 3, questions: ['Do you think reading is becoming less popular among young people?', 'What are the benefits of reading books compared to watching films?', 'Should schools require students to read more books?', 'How has technology changed the way people read?'] },
  ],
  [
    { part: 1, questions: ['Do you enjoy cooking?', 'What is your favourite type of food?', 'How often do you eat out?', 'Did you learn to cook as a child?'] },
    { part: 2, cueCard: 'Describe a place you have visited that you found surprising.\n\nYou should say:\n- where it was\n- when you went there\n- what you did there\n\nand explain why it was surprising.\n\nYou have 1 minute to prepare. You should speak for 1–2 minutes.', questions: [], prepareTime: 60, speakTime: 120 },
    { part: 3, questions: ['How does tourism affect local cultures?', 'Should governments limit the number of tourists visiting popular destinations?', 'What makes a travel destination appealing?', 'How might climate change affect tourism?'] },
  ],
  [
    { part: 1, questions: ['Do you live in a house or an apartment?', 'What do you like most about your home?', 'Is there anything you would like to change about your home?', 'Do you enjoy doing home improvements?'] },
    { part: 2, cueCard: 'Describe an important skill that you learned as a child.\n\nYou should say:\n- what the skill was\n- how you learned it\n- who taught you\n\nand explain why it has been important in your life.\n\nYou have 1 minute to prepare. You should speak for 1–2 minutes.', questions: [], prepareTime: 60, speakTime: 120 },
    { part: 3, questions: ['Should schools focus more on practical skills?', 'What skills do you think are most important for children to learn today?', 'How has the importance of different skills changed over the generations?', 'Should children learn skills from their parents or from schools?'] },
  ],
];

// ═══════════════════════════════════════════════════════════════
//  SCORING: Listening correct count → IELTS band
// ═══════════════════════════════════════════════════════════════

export function listeningScoreToBand(correct: number): number {
  // Official IELTS Listening scoring
  if (correct >= 39) return 9.0;
  if (correct >= 37) return 8.5;
  if (correct >= 35) return 8.0;
  if (correct >= 33) return 7.5;
  if (correct >= 30) return 7.0;
  if (correct >= 26) return 6.5;
  if (correct >= 23) return 6.0;
  if (correct >= 18) return 5.5;
  if (correct >= 16) return 5.0;
  if (correct >= 13) return 4.5;
  if (correct >= 10) return 4.0;
  if (correct >= 8) return 3.5;
  if (correct >= 6) return 3.0;
  if (correct >= 4) return 2.5;
  if (correct >= 3) return 2.0;
  if (correct >= 2) return 1.5;
  if (correct >= 1) return 1.0;
  return 0;
}

export function readingScoreToBand(correct: number): number {
  // Official IELTS Academic Reading scoring
  if (correct >= 39) return 9.0;
  if (correct >= 37) return 8.5;
  if (correct >= 35) return 8.0;
  if (correct >= 33) return 7.5;
  if (correct >= 30) return 7.0;
  if (correct >= 26) return 6.5;
  if (correct >= 23) return 6.0;
  if (correct >= 18) return 5.5;
  if (correct >= 16) return 5.0;
  if (correct >= 13) return 4.5;
  if (correct >= 10) return 4.0;
  if (correct >= 8) return 3.5;
  if (correct >= 6) return 3.0;
  if (correct >= 4) return 2.5;
  if (correct >= 3) return 2.0;
  if (correct >= 2) return 1.5;
  if (correct >= 1) return 1.0;
  return 0;
}

export function writingWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// ═══════════════════════════════════════════════════════════════
//  SESSION MANAGEMENT (localStorage)
// ═══════════════════════════════════════════════════════════════

const MOCK_SESSIONS_KEY = 'ieltspro_mock_sessions';

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getMockExamDef(id: string): MockExamDef | undefined {
  return MOCK_EXAMS.find(e => e.id === id);
}

export function getMockSessions(): MockExamSession[] {
  return safeGet<MockExamSession[]>(MOCK_SESSIONS_KEY, []);
}

export function getMockSessionsByExam(examId: string): MockExamSession[] {
  return getMockSessions().filter(s => s.examId === examId);
}

export function getMockSession(id: string): MockExamSession | undefined {
  return getMockSessions().find(s => s.id === id);
}

export function saveMockSession(session: MockExamSession): void {
  const sessions = getMockSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  safeSet(MOCK_SESSIONS_KEY, sessions);
}

export function createMockSession(examId: string): MockExamSession {
  const session: MockExamSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    examId,
    startedAt: new Date().toISOString(),
    status: 'in_progress',
    currentSection: 'listening',
    timeSpentMinutes: 0,
    sectionScores: {},
  };
  saveMockSession(session);
  return session;
}

export function completeMockSession(
  sessionId: string,
  scores: Partial<MockExamSession['sectionScores']>,
  overallBand: number
): MockExamSession {
  const sessions = getMockSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) throw new Error('Session not found');

  session.status = 'completed';
  session.completedAt = new Date().toISOString();
  session.sectionScores = scores;
  session.overallBand = overallBand;
  session.timeSpentMinutes = Math.round(
    (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000
  );

  safeSet(MOCK_SESSIONS_KEY, sessions);
  return session;
}

export function getCompletedMockCount(): number {
  return getMockSessions().filter(s => s.status === 'completed').length;
}

export function getInProgressMockSession(): MockExamSession | null {
  const sessions = getMockSessions();
  return sessions.find(s => s.status === 'in_progress') || null;
}

export function getMockExamBestBand(examId: string): number | null {
  const sessions = getMockSessionsByExam(examId).filter(s => s.status === 'completed');
  if (sessions.length === 0) return null;
  return Math.max(...sessions.map(s => s.overallBand || 0));
}

export function getMockExamAttempts(examId: string): number {
  return getMockSessionsByExam(examId).filter(s => s.status === 'completed').length;
}

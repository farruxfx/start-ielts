// ══════════════════════════════════════
//  CHART DATA FOR IELTS WRITING TASK 1
// ══════════════════════════════════════

const chartDataMap: Record<string, any> = {
  // ── BAR CHARTS ──
  'tourism-expenditure-by-country': {
    type: 'bar',
    labels: ['USA', 'Spain', 'France', 'Italy', 'UK'],
    datasets: [
      { name: '2009', values: [120, 60, 55, 45, 40], color: '#3b82f6' },
      { name: '2019', values: [185, 80, 75, 65, 55], color: '#f43f5e' },
    ],
  },
  'energy-consumption-by-source': {
    type: 'bar',
    labels: ['Sweden', 'Germany', 'UK', 'USA', 'China'],
    datasets: [
      { name: 'Renewable %', values: [55, 35, 30, 18, 12], color: '#22c55e' },
      { name: 'Non-renewable %', values: [45, 65, 70, 82, 88], color: '#94a3b8' },
    ],
  },
  'consumer-goods-expenditure': {
    type: 'bar',
    labels: ['Stereos', 'Toys', 'CDs', 'Videos', 'Games'],
    datasets: [
      { name: 'UK', values: [160, 140, 135, 125, 120], color: '#3b82f6' },
      { name: 'France', values: [145, 120, 125, 115, 110], color: '#f43f5e' },
      { name: 'Germany', values: [130, 110, 115, 105, 100], color: '#f59e0b' },
      { name: 'Italy', values: [120, 105, 100, 95, 90], color: '#22c55e' },
    ],
  },
  'unemployment-rates': {
    type: 'bar',
    labels: ['USA', 'UK', 'Germany', 'France', 'Spain', 'Japan'],
    datasets: [
      { name: '2005', values: [5.1, 4.8, 11.2, 9.0, 9.2, 4.4], color: '#3b82f6' },
      { name: '2015', values: [5.3, 5.4, 4.9, 10.4, 22.1, 3.4], color: '#f43f5e' },
    ],
  },
  'water-usage-by-sector': {
    type: 'bar',
    labels: ['USA', 'China', 'India', 'Brazil', 'Japan', 'UK'],
    datasets: [
      { name: 'Agriculture', values: [40, 65, 80, 70, 62, 30], color: '#22c55e' },
      { name: 'Industry', values: [35, 22, 10, 15, 20, 40], color: '#3b82f6' },
      { name: 'Domestic', values: [25, 13, 10, 15, 18, 30], color: '#f59e0b' },
    ],
  },

  // ── LINE GRAPHS ──
  'internet-users-growth': {
    type: 'line',
    labels: ['1995', '2000', '2005', '2010', '2015'],
    datasets: [
      { name: 'USA', values: [10, 43, 68, 78, 88], color: '#3b82f6' },
      { name: 'UK', values: [5, 27, 70, 85, 92], color: '#f43f5e' },
      { name: 'Japan', values: [8, 30, 66, 79, 91], color: '#f59e0b' },
      { name: 'Brazil', values: [1, 5, 21, 41, 59], color: '#22c55e' },
    ],
  },
  'co2-emissions-trends': {
    type: 'line',
    labels: ['1967', '1977', '1987', '1997', '2007'],
    datasets: [
      { name: 'USA', values: [16, 19, 20, 21, 20], color: '#3b82f6' },
      { name: 'UK', values: [11, 10, 9, 8, 7], color: '#f43f5e' },
      { name: 'Germany', values: [12, 13, 12, 11, 10], color: '#f59e0b' },
      { name: 'France', values: [8, 9, 8, 7, 6], color: '#22c55e' },
    ],
  },
  'average-temperature-changes': {
    type: 'line',
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    datasets: [
      { name: 'London', values: [5, 8, 13, 22, 17, 8], color: '#3b82f6' },
      { name: 'Cairo', values: [13, 18, 25, 35, 28, 18], color: '#f43f5e' },
      { name: 'Sydney', values: [23, 21, 16, 12, 16, 20], color: '#f59e0b' },
    ],
  },
  'electricity-generation-sources': {
    type: 'line',
    labels: ['1980', '1990', '2000', '2010', '2020'],
    datasets: [
      { name: 'Coal', values: [40, 38, 35, 30, 20], color: '#64748b' },
      { name: 'Gas', values: [15, 18, 22, 25, 28], color: '#f59e0b' },
      { name: 'Nuclear', values: [10, 17, 18, 16, 14], color: '#8b5cf6' },
      { name: 'Renewable', values: [5, 8, 12, 20, 35], color: '#22c55e' },
    ],
  },
  'birth-and-death-rates': {
    type: 'line',
    labels: ['1950', '1960', '1970', '1980', '1990', '2000'],
    datasets: [
      { name: 'Birth Rate', values: [35, 32, 28, 22, 18, 14], color: '#3b82f6' },
      { name: 'Death Rate', values: [25, 20, 15, 12, 10, 9], color: '#f43f5e' },
    ],
  },

  // ── PIE CHARTS ──
  'household-spending-patterns': {
    type: 'pie',
    segments: [
      { name: 'Housing', value: 30, color: '#3b82f6' },
      { name: 'Food', value: 25, color: '#22c55e' },
      { name: 'Transport', value: 15, color: '#f59e0b' },
      { name: 'Education', value: 12, color: '#8b5cf6' },
      { name: 'Healthcare', value: 10, color: '#f43f5e' },
      { name: 'Other', value: 8, color: '#94a3b8' },
    ],
  },
  'land-use-changes': {
    type: 'pie',
    segments: [
      { name: 'Residential', value: 35, color: '#3b82f6' },
      { name: 'Industrial', value: 25, color: '#64748b' },
      { name: 'Commercial', value: 20, color: '#f59e0b' },
      { name: 'Agricultural', value: 12, color: '#22c55e' },
      { name: 'Green Space', value: 8, color: '#86efac' },
    ],
  },
  'government-spending-allocation': {
    type: 'pie',
    segments: [
      { name: 'Healthcare', value: 28, color: '#f43f5e' },
      { name: 'Education', value: 22, color: '#3b82f6' },
      { name: 'Defence', value: 18, color: '#64748b' },
      { name: 'Infrastructure', value: 15, color: '#f59e0b' },
      { name: 'Social Services', value: 12, color: '#8b5cf6' },
      { name: 'Other', value: 5, color: '#94a3b8' },
    ],
  },
  'modes-of-transport': {
    type: 'pie',
    segments: [
      { name: 'Car', value: 45, color: '#3b82f6' },
      { name: 'Public Transit', value: 30, color: '#22c55e' },
      { name: 'Bicycle', value: 12, color: '#f59e0b' },
      { name: 'Walking', value: 8, color: '#8b5cf6' },
      { name: 'Other', value: 5, color: '#94a3b8' },
    ],
  },

  // ── TABLES ──
  'car-ownership-statistics': {
    type: 'table',
    headers: ['Country', '1990', '2000', '2010', '2020'],
    rows: [
      ['USA', '620', '685', '750', '810'],
      ['UK', '350', '420', '475', '520'],
      ['Germany', '420', '490', '510', '530'],
      ['France', '380', '445', '480', '510'],
      ['Japan', '340', '420', '500', '590'],
    ],
  },
  'student-satisfaction-survey': {
    type: 'table',
    headers: ['Aspect', 'UK', 'USA', 'Australia', 'Canada'],
    rows: [
      ['Teaching Quality', '8.2', '7.8', '8.5', '8.0'],
      ['Facilities', '7.5', '8.1', '7.9', '7.6'],
      ['Support Services', '6.8', '7.2', '7.4', '7.0'],
      ['Social Life', '7.9', '8.3', '7.7', '7.5'],
      ['Value for Money', '6.2', '6.5', '7.1', '6.8'],
    ],
  },
  'internet-access-by-age-group': {
    type: 'table',
    headers: ['Age Group', 'UK', 'USA', 'Japan', 'Brazil', 'India'],
    rows: [
      ['16-24', '99%', '97%', '98%', '85%', '65%'],
      ['25-34', '98%', '96%', '97%', '78%', '55%'],
      ['35-44', '95%', '92%', '94%', '65%', '40%'],
      ['45-54', '88%', '85%', '88%', '50%', '28%'],
      ['55-64', '75%', '72%', '78%', '35%', '18%'],
    ],
  },
  'employment-by-industry': {
    type: 'table',
    headers: ['Industry', 'UK 2005', 'UK 2015', 'USA 2005', 'USA 2015'],
    rows: [
      ['Services', '72%', '78%', '75%', '80%'],
      ['Manufacturing', '15%', '10%', '13%', '9%'],
      ['Agriculture', '2%', '1%', '3%', '2%'],
      ['Construction', '7%', '6%', '6%', '5%'],
      ['Mining', '4%', '5%', '3%', '4%'],
    ],
  },

  // ── PROCESS ──
  'cement-production': {
    type: 'process',
    steps: ['Limestone & Clay Extraction', 'Crushing & Grinding', 'Mixing in Proportions', 'Heating in Kiln (1450°C)', 'Cooling', 'Grinding to Fine Powder', 'Packaging & Distribution'],
  },
  'water-treatment-process': {
    type: 'process',
    steps: ['Raw Water Collection', 'Coagulation & Flocculation', 'Sedimentation', 'Filtration', 'Disinfection (Chlorine)', 'Storage & Distribution'],
  },
  'chocolate-production': {
    type: 'process',
    steps: ['Cocoa Bean Harvesting', 'Fermentation (5-7 days)', 'Drying in Sun', 'Roasting at 120-140°C', 'Shell Removal', 'Nibs Ground to Paste', 'Mixing with Sugar & Milk', 'Tempering & Moulding'],
  },

  // ── MAPS ──
  'town-development': {
    type: 'map',
    year1: '1950', year2: '2010',
    before: ['Main school building', 'Playground', 'Small car park', 'Trees along perimeter'],
    after: ['New science block', 'Sports centre', 'Large car park', 'Cafeteria', 'Swimming pool', 'Computer lab'],
  },
  'island-tourism-development': {
    type: 'map',
    year1: 'Before', year2: 'After',
    before: ['Sandy beach', 'Palm trees', 'Freshwater lake', 'Coral reef', 'Small village'],
    after: ['Hotel complex', 'Restaurant', 'Jetty', 'Swimming pool', 'Sailing club', 'Shop'],
  },
  'city-centre-changes': {
    type: 'map',
    year1: '1965', year2: '2015',
    before: ['Market square', 'Small shops', 'Church', 'Residential area', 'Open fields'],
    after: ['Shopping mall', 'Office towers', 'Car park', 'Bus station', 'Pedestrian zone', 'Park'],
  },
};

const chartTopicMap: Record<string, string> = {
  'tourism expenditure by country': 'tourism-expenditure-by-country',
  'energy consumption by source': 'energy-consumption-by-source',
  'consumer goods expenditure': 'consumer-goods-expenditure',
  'unemployment rates': 'unemployment-rates',
  'water usage by sector': 'water-usage-by-sector',
  'internet users growth': 'internet-users-growth',
  'co2 emissions trends': 'co2-emissions-trends',
  'average temperature changes': 'average-temperature-changes',
  'electricity generation sources': 'electricity-generation-sources',
  'birth and death rates': 'birth-and-death-rates',
  'household spending patterns': 'household-spending-patterns',
  'land use changes': 'land-use-changes',
  'government spending allocation': 'government-spending-allocation',
  'modes of transport': 'modes-of-transport',
  'car ownership statistics': 'car-ownership-statistics',
  'student satisfaction survey': 'student-satisfaction-survey',
  'internet access by age group': 'internet-access-by-age-group',
  'employment by industry': 'employment-by-industry',
  'cement production': 'cement-production',
  'water treatment process': 'water-treatment-process',
  'chocolate production': 'chocolate-production',
  'town development': 'town-development',
  'island tourism development': 'island-tourism-development',
  'city centre changes': 'city-centre-changes',
};

export function getChartData(topic: string): any {
  const key = chartTopicMap[topic.toLowerCase()];
  return key ? chartDataMap[key] : null;
}

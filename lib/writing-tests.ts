import { getChartData } from './writing-chart-data';

export interface WritingTest {
  id: string;
  name: string;
  slug: string;
  task1: {
    type: string;
    topic: string;
    prompt: string;
    chartDescription?: string;
  chartData?: any;
  };
  task2: {
    type: string;
    topic: string;
    prompt: string;
  };
  duration: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const task1Types = [
  'Bar Chart', 'Line Graph', 'Pie Chart', 'Table', 'Process', 'Map', 'Diagram',
  'Mixed Chart', 'Stacked Bar', 'Multiple Graph',
];

const task1Topics: Array<{ type: string; topic: string; prompt: string; chartDescription: string }> = [
  { type: 'Bar Chart', topic: 'Tourism expenditure by country', prompt: 'The bar chart below shows the amount of money spent on international tourism in five different countries in 2009 and 2019.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'International Tourism Expenditure (billions USD)' },
  { type: 'Bar Chart', topic: 'Energy consumption by source', prompt: 'The bar chart shows the percentage of total energy consumption from renewable sources in five countries in 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Renewable Energy Consumption (%)' },
  { type: 'Bar Chart', topic: 'Consumer goods expenditure', prompt: 'The bar chart below shows the amount of money spent on five consumer goods in four European countries in 2009.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Consumer Goods Expenditure (GBP)' },
  { type: 'Bar Chart', topic: 'Unemployment rates', prompt: 'The bar chart illustrates the unemployment rates in six different countries between 2005 and 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Unemployment Rates (%)' },
  { type: 'Bar Chart', topic: 'Water usage by sector', prompt: 'The bar chart shows how water is used in three different sectors across six countries.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Water Usage by Sector (billion litres)' },
  { type: 'Line Graph', topic: 'Internet users growth', prompt: 'The line graph shows the percentage of the population using the Internet in four different countries from 1995 to 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Internet Users (% of population)' },
  { type: 'Line Graph', topic: 'CO2 emissions trends', prompt: 'The line graph below shows changes in the amount of CO2 emitted per person in four European countries from 1967 to 2007.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'CO2 Emissions Per Person (tonnes)' },
  { type: 'Line Graph', topic: 'Average temperature changes', prompt: 'The line graph shows the average monthly temperatures in three different cities over a 12-month period.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Average Monthly Temperature (°C)' },
  { type: 'Line Graph', topic: 'Electricity generation sources', prompt: 'The line graph illustrates the main sources of electricity generation from 1980 to 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Electricity Generation (TWh)' },
  { type: 'Line Graph', topic: 'Birth and death rates', prompt: 'The line graph shows the birth rate and death rate in a particular country from 1950 to 2000.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Birth and Death Rates (per 1000)' },
  { type: 'Pie Chart', topic: 'Household spending patterns', prompt: 'The pie charts show the main reasons why students chose a particular university and how satisfied they were with different aspects of their experience.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'University Choice Factors & Satisfaction' },
  { type: 'Pie Chart', topic: 'Land use changes', prompt: 'The two pie charts show the main reasons for agricultural land loss in a particular region in 1990 and 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Agricultural Land Loss (1990 vs 2010)' },
  { type: 'Pie Chart', topic: 'Government spending allocation', prompt: 'The pie charts illustrate how government expenditure was allocated across different sectors in 2000 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Government Spending Allocation (%)' },
  { type: 'Pie Chart', topic: 'Modes of transport', prompt: 'The pie charts compare the main modes of transport used by commuters in three different cities.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Commuter Transport Modes (%)' },
  { type: 'Table', topic: 'Car ownership statistics', prompt: 'The table below gives data about car ownership in five countries between 1990 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Car Ownership (per 1000 people)' },
  { type: 'Table', topic: 'Student satisfaction survey', prompt: 'The table shows the results of a survey of student satisfaction with different aspects of university life in four countries.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Student Satisfaction Ratings (1-10)' },
  { type: 'Table', topic: 'Internet access by age group', prompt: 'The table gives information about Internet access by age group in five countries in 2019.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Internet Access by Age Group (%)' },
  { type: 'Table', topic: 'Employment by industry', prompt: 'The table shows the percentage of employment in different industry sectors in three countries in 2005 and 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Employment by Industry (%)' },
  { type: 'Process', topic: 'Cement production', prompt: 'The diagram below shows the process of cement production.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Cement Manufacturing Process' },
  { type: 'Process', topic: 'Water treatment process', prompt: 'The diagram shows the stages involved in the process of drinking water treatment.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Water Treatment Stages' },
  { type: 'Process', topic: 'Chocolate production', prompt: 'The diagram illustrates the process of making chocolate from cocoa beans.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Chocolate Production Process' },
  { type: 'Map', topic: 'Town development', prompt: 'The maps below show the changes that took place in West Park Secondary School between 1950 and 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'West Park Secondary School (1950 vs 2010)' },
  { type: 'Map', topic: 'Island tourism development', prompt: 'The maps show an island before and after the construction of tourist facilities.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'Island Development Plan' },
  { type: 'Map', topic: 'City centre changes', prompt: 'The maps show the changes that have taken place in the centre of a town between 1965 and 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.', chartDescription: 'City Centre Transformation' },
];

const task2Topics = [
  { type: 'Discussion', topic: 'University education', prompt: 'Some people believe that university students should be required to attend classes, while others believe that going to classes should be optional for students.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Opinion', topic: 'Technology in education', prompt: 'Some people think that the increasing use of computers and mobile phones for communication has had a negative effect on young people\'s reading and writing skills.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Work-life balance', prompt: 'In many countries, people are now living longer than ever before. Some say an ageing population is a problem, while others say it is not a problem.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Traffic congestion', prompt: 'In many cities around the world, traffic congestion is a growing problem.\n\nWhat are the causes of this problem, and what measures could be taken to address it?' },
  { type: 'Opinion', topic: 'Remote work', prompt: 'Since the COVID-19 pandemic, many companies have allowed employees to work from home. Some people think this is a positive development, while others disagree.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Children and screen time', prompt: 'Many children spend too much time watching television and playing video games.\n\nWhat are the effects of this on children and their families? What solutions can you suggest?' },
  { type: 'Opinion', topic: 'Social media impact', prompt: 'Social media has become an integral part of modern life. Some people believe it has brought people closer together, while others think it has made them more isolated.\n\nTo what extent do you agree or disagree?' },
  { type: 'Problem-Solution', topic: 'Environmental pollution', prompt: 'Air pollution is becoming a major problem in many cities around the world.\n\nWhat are the causes of this problem, and what measures could governments and individuals take to tackle it?' },
  { type: 'Discussion', topic: 'Animal rights', prompt: 'Some people believe that animals should not be kept in zoos and other captive facilities, while others believe these institutions serve important purposes.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Opinion', topic: 'Globalisation', prompt: 'Some people believe that the increasing globalisation of trade and industry is entirely positive, while others think it has negative consequences.\n\nTo what extent do you agree or disagree?' },
  { type: 'Problem-Solution', topic: 'Housing shortage', prompt: 'In many cities around the world, there is a shortage of affordable housing.\n\nWhat are the causes of this problem, and what solutions can you suggest?' },
  { type: 'Discussion', topic: 'Education methods', prompt: 'Some people believe that traditional classroom-based learning is more effective than online learning, while others think the opposite is true.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Opinion', topic: 'Space exploration', prompt: 'Some people think that governments should spend money on space exploration, while others believe this money should be spent on solving problems on Earth.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Cultural preservation', prompt: 'Some people believe that it is important to preserve traditional cultures and customs, while others think that modernisation is more important.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Obesity epidemic', prompt: 'Obesity rates have been rising dramatically in many countries around the world.\n\nWhat are the causes of this problem, and what measures can be taken to address it?' },
  { type: 'Opinion', topic: 'Criminal justice', prompt: 'Some people believe that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Sports and society', prompt: 'Some people think that competitive sports are beneficial for children, while others believe it can have negative effects.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Water scarcity', prompt: 'In many parts of the world, access to clean drinking water is a major problem.\n\nWhat are the causes of water scarcity, and what solutions can be implemented?' },
  { type: 'Opinion', topic: 'Internet and privacy', prompt: 'The Internet has made it easier for governments and companies to monitor people\'s activities.\n\nTo what extent do you agree or disagree that this is a positive development?' },
  { type: 'Discussion', topic: 'Fast fashion', prompt: 'Fast fashion has become increasingly popular in recent years. Some people argue it provides affordable clothing, while others believe it has serious environmental and ethical costs.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Mental health', prompt: 'Mental health problems are becoming more common, especially among young people.\n\nWhat are the causes of this trend, and what solutions can you suggest?' },
  { type: 'Opinion', topic: 'Urbanisation', prompt: 'More and more people are moving to cities, leaving rural areas behind.\n\nTo what extent do you think this is a positive or negative development?' },
  { type: 'Discussion', topic: 'Food waste', prompt: 'Around one-third of all food produced globally is wasted each year. Some people believe the government should take action, while others think it is the responsibility of individuals.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Deforestation', prompt: 'Deforestation is occurring at an alarming rate in many tropical countries.\n\nWhat are the causes of this problem, and what measures can be taken to prevent further deforestation?' },
  { type: 'Opinion', topic: 'Artificial intelligence', prompt: 'Artificial intelligence is becoming increasingly advanced and is expected to transform many industries.\n\nTo what extent do you think this is a positive or negative development?' },
  { type: 'Discussion', topic: 'Gap year', prompt: 'Some people believe that young people should take a year off between school and university to travel or work, while others think they should continue their studies immediately.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Noise pollution', prompt: 'Noise pollution is becoming an increasingly serious problem in many urban areas.\n\nWhat are the causes of this issue, and what solutions can be proposed?' },
  { type: 'Opinion', topic: 'Organic food', prompt: 'Some people believe that organic food is better for our health and the environment, while others think it is just a marketing trend.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Multinational companies', prompt: 'Multinational companies have a significant impact on the countries in which they operate. Some people believe they bring economic benefits, while others think they cause more harm than good.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Overpopulation', prompt: 'The world\'s population continues to grow rapidly, placing increasing pressure on resources and the environment.\n\nWhat problems does overpopulation cause, and what solutions can be suggested?' },
  { type: 'Opinion', topic: 'Traditional vs modern medicine', prompt: 'Some people prefer to use traditional medicine, while others prefer modern medical treatments.\n\nTo what extent do you agree or disagree with using traditional medicine?' },
  { type: 'Discussion', topic: 'Work satisfaction', prompt: 'Some people believe that job satisfaction is more important than salary, while others think a high salary is the most important factor.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Illegal immigration', prompt: 'Illegal immigration is a contentious issue in many countries.\n\nWhat are the causes of illegal immigration, and what measures can governments take to address it?' },
  { type: 'Opinion', topic: 'Nuclear energy', prompt: 'Nuclear energy is a controversial topic. Some people believe it is a necessary source of clean energy, while others think it is too dangerous.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Digital literacy', prompt: 'In today\'s digital age, some people believe that digital literacy is just as important as traditional literacy skills.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Drug abuse', prompt: 'Drug abuse is a growing problem in many societies, affecting people of all ages.\n\nWhat are the causes of drug abuse, and what solutions can be implemented?' },
  { type: 'Opinion', topic: 'Gender equality', prompt: 'Despite significant progress, gender equality has not been fully achieved in many parts of the world.\n\nTo what extent do you agree or disagree that more needs to be done?' },
  { type: 'Discussion', topic: 'Tourism impact', prompt: 'Tourism can bring economic benefits to a country, but it can also have negative effects on the local environment and culture.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Cybercrime', prompt: 'Cybercrime is increasing rapidly as more of our lives move online.\n\nWhat are the causes of this trend, and what measures can be taken to combat it?' },
  { type: 'Opinion', topic: 'Volunteer work', prompt: 'Some people believe that all young people should be required to do volunteer work, while others think it should be a personal choice.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Telemedicine', prompt: 'Telemedicine has become increasingly popular, especially since the pandemic. Some people believe it is a positive development, while others have concerns about its limitations.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Homelessness', prompt: 'Homelessness is a growing problem in many cities around the world.\n\nWhat are the causes of homelessness, and what solutions can you suggest?' },
  { type: 'Opinion', topic: 'Public transport', prompt: 'Some people believe that governments should invest more in public transportation, while others think private vehicles should be prioritised.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Language learning', prompt: 'Some people believe that children should start learning a foreign language at primary school, while others think it should be introduced at secondary school.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Urban sprawl', prompt: 'Cities around the world are expanding rapidly, leading to urban sprawl.\n\nWhat problems does this cause, and what solutions can be proposed?' },
  { type: 'Opinion', topic: 'Vaccination', prompt: 'Some people believe that vaccination should be compulsory for all children, while others think parents should have the right to choose.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Consumer culture', prompt: 'Modern society is increasingly characterised by consumerism. Some people believe this is a negative trend, while others see it as a natural part of economic progress.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Teacher shortage', prompt: 'Many countries are facing a shortage of qualified teachers, particularly in science and mathematics.\n\nWhat are the causes of this problem, and what solutions can be suggested?' },
  { type: 'Opinion', topic: 'Renewable energy', prompt: 'Some people believe that governments should invest heavily in renewable energy sources, while others think other priorities are more important.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Ageing population', prompt: 'In many developed countries, the population is getting older. Some people see this as a problem, while others believe it presents opportunities.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Litter and waste', prompt: 'Litter and waste management are growing concerns in many communities.\n\nWhat are the causes of this problem, and what measures can be taken to address it?' },
  { type: 'Opinion', topic: 'Online shopping', prompt: 'Online shopping has become increasingly popular, leading to the decline of traditional high street shops.\n\nTo what extent do you think this is a positive or negative development?' },
  { type: 'Discussion', topic: 'Media bias', prompt: 'Some people believe that the media always presents a biased view of the news, while others think media organisations try to be objective.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Child labour', prompt: 'Child labour remains a serious problem in many developing countries.\n\nWhat are the causes of child labour, and what solutions can be implemented?' },
  { type: 'Opinion', topic: 'Sports funding', prompt: 'Some people believe that professional sports receive too much funding, while essential public services are underfunded.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Academic pressure', prompt: 'Students today face increasing academic pressure. Some people believe this is necessary for success, while others think it has harmful effects.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Traffic accidents', prompt: 'Traffic accidents cause thousands of deaths every year around the world.\n\nWhat are the main causes of traffic accidents, and what measures can be taken to reduce them?' },
  { type: 'Opinion', topic: 'Foreign aid', prompt: 'Some people believe that wealthy countries should provide more foreign aid to developing nations, while others think this money should be spent domestically.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Censorship', prompt: 'Some people believe that censorship is necessary to protect society, while others argue that it restricts freedom of expression.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Urban poverty', prompt: 'Despite economic growth, poverty remains a significant issue in many urban areas.\n\nWhat are the causes of urban poverty, and what solutions can be proposed?' },
  { type: 'Opinion', topic: 'Space tourism', prompt: 'Space tourism has recently become a reality, with several companies offering trips to space.\n\nTo what extent do you think space tourism is a positive or negative development?' },
  { type: 'Discussion', topic: 'Genetic engineering', prompt: 'Genetic engineering has the potential to transform medicine and agriculture. Some people welcome this development, while others have ethical concerns.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Overconsumption', prompt: 'People in many developed countries consume far more than they need, placing enormous strain on the environment.\n\nWhat are the causes of overconsumption, and what solutions can be suggested?' },
  { type: 'Opinion', topic: 'University ranking', prompt: 'Some people believe that university rankings are useful for students choosing where to study, while others think they are misleading.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'History education', prompt: 'Some people believe that studying history is essential for understanding the present, while others think it is a waste of time.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Air pollution', prompt: 'Air pollution is a serious problem in many cities around the world, causing health problems and environmental damage.\n\nWhat are the causes of air pollution, and what solutions can be implemented?' },
  { type: 'Opinion', topic: 'Gambling industry', prompt: 'Some people believe that the gambling industry should be banned because of its social costs, while others argue that adults should be free to make their own choices.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Performing arts', prompt: 'Some people believe that government funding should support the performing arts, while others think it should be spent on more essential services.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Illegal logging', prompt: 'Illegal logging is destroying forests in many parts of the world.\n\nWhat are the causes of this problem, and what measures can be taken to stop it?' },
  { type: 'Opinion', topic: 'Teleworking', prompt: 'Teleworking has become increasingly common. Some people believe it benefits both employees and employers, while others see disadvantages.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Fashion industry', prompt: 'The fashion industry has a significant environmental impact. Some people believe consumers should change their habits, while others think the industry itself must take responsibility.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Teenage crime', prompt: 'Teenage crime is a growing concern in many countries.\n\nWhat are the causes of teenage crime, and what solutions can be proposed?' },
  { type: 'Opinion', topic: 'Asteroid mining', prompt: 'Some people believe that asteroid mining could provide valuable resources and solve resource scarcity, while others think it is too risky and expensive.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Advertising', prompt: 'Some people believe that advertising should be banned for products that are harmful to health, while others think companies should have the right to advertise any legal product.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Ocean pollution', prompt: 'Ocean pollution is threatening marine ecosystems around the world.\n\nWhat are the main causes of ocean pollution, and what measures can be taken to address it?' },
  { type: 'Opinion', topic: 'Autonomous vehicles', prompt: 'Self-driving cars are expected to become mainstream in the near future. Some people welcome this development, while others have concerns about safety and job losses.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Music education', prompt: 'Some people believe that music education should be a compulsory subject in schools, while others think it should be optional.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Soil erosion', prompt: 'Soil erosion is a major environmental problem in many agricultural regions.\n\nWhat are the causes of soil erosion, and what solutions can be implemented?' },
  { type: 'Opinion', topic: 'Biotechnology', prompt: 'Biotechnology has the potential to revolutionise healthcare and agriculture. Some people are enthusiastic about its possibilities, while others have concerns about safety and ethics.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Punishment vs rehabilitation', prompt: 'Some people believe that the purpose of prison is to punish criminals, while others think it should focus on rehabilitation.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Job automation', prompt: 'Automation and artificial intelligence are expected to replace many jobs in the coming decades.\n\nWhat problems might this cause, and what solutions can be suggested?' },
  { type: 'Opinion', topic: 'Wind farms', prompt: 'Some people believe that wind farms are an effective way to generate clean energy, while others think they have negative effects on the landscape and wildlife.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Cultural identity', prompt: 'In an increasingly globalised world, some people believe that cultural identity is being lost, while others think it is being preserved and even strengthened.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Plastic waste', prompt: 'Plastic waste is a major environmental problem, with millions of tonnes ending up in landfills and oceans each year.\n\nWhat are the causes of plastic waste, and what solutions can be implemented?' },
  { type: 'Opinion', topic: 'Universal basic income', prompt: 'Some people believe that governments should introduce a universal basic income for all citizens, while others think it would be too expensive and discourage work.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Standardised testing', prompt: 'Standardised testing is widely used in education systems around the world. Some people believe it is an effective way to measure student achievement, while others think it has significant limitations.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Lack of green spaces', prompt: 'Many cities have insufficient green spaces, which can negatively affect residents\' health and well-being.\n\nWhat are the causes of this problem, and what solutions can be proposed?' },
  { type: 'Opinion', topic: 'GMO foods', prompt: 'Genetically modified organisms (GMOs) have the potential to increase food production and solve hunger problems. However, some people have concerns about their safety and environmental impact.\n\nTo what extent do you agree or disagree with the use of GMOs in food production?' },
  { type: 'Discussion', topic: 'Political participation', prompt: 'Voter turnout has been declining in many democracies. Some people believe this is because citizens are disillusioned with politics, while others think it is because voting should not be compulsory.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Infectious diseases', prompt: 'Infectious diseases can spread rapidly and cause devastating effects on populations.\n\nWhat measures can governments and individuals take to prevent the spread of infectious diseases?' },
  { type: 'Opinion', topic: 'Telecommunications', prompt: 'The rapid expansion of telecommunications infrastructure has transformed how people communicate and access information. Some people see this as entirely positive, while others have concerns.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Competition in education', prompt: 'Some people believe that competition between students is beneficial for their development, while others think it creates unnecessary pressure.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Energy crisis', prompt: 'Many countries are facing an energy crisis as demand continues to grow while traditional sources become depleted.\n\nWhat are the causes of this problem, and what solutions can be implemented?' },
  { type: 'Opinion', topic: 'Peer pressure', prompt: 'Peer pressure has a significant influence on young people\'s behaviour. Some believe it can be positive, while others think it is mostly harmful.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Privatisation', prompt: 'Some people believe that essential services like water, electricity, and healthcare should be publicly owned, while others think privatisation leads to better efficiency.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Acid rain', prompt: 'Acid rain has caused significant damage to forests, lakes, and buildings in many parts of the world.\n\nWhat are the causes of acid rain, and what measures can be taken to reduce it?' },
  { type: 'Opinion', topic: 'Surveillance', prompt: 'The use of CCTV cameras and other surveillance technologies has increased dramatically in recent years. Some people believe this improves public safety, while others think it invades privacy.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Artificial sweeteners', prompt: 'Artificial sweeteners are increasingly used as sugar substitutes. Some people believe they are a healthy alternative, while others think they may have harmful effects.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Soil degradation', prompt: 'Soil degradation is threatening food production in many parts of the world.\n\nWhat are the causes of soil degradation, and what solutions can be implemented?' },
  { type: 'Opinion', topic: 'Genetic testing', prompt: 'Genetic testing can reveal information about a person\'s health risks and ancestry. Some people believe this information should be freely available, while others have concerns about privacy and discrimination.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Online education', prompt: 'Online education has become increasingly popular, especially since the pandemic. Some people believe it is as effective as traditional classroom learning, while others have doubts.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Deforestation in tropics', prompt: 'Deforestation in tropical rainforests is occurring at an alarming rate.\n\nWhat are the main causes of this problem, and what solutions can be proposed?' },
  { type: 'Opinion', topic: 'Self-driving cars', prompt: 'Autonomous vehicles are expected to transform transportation. Some people welcome this development, while others have concerns about safety and job losses.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Cultural exchange', prompt: 'Some people believe that cultural exchange programmes between countries promote understanding and tolerance, while others think they can lead to cultural erosion.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Noise pollution in cities', prompt: 'Noise pollution is a growing problem in many urban areas, affecting people\'s health and quality of life.\n\nWhat are the causes of noise pollution, and what solutions can be suggested?' },
  { type: 'Opinion', topic: 'Gene editing', prompt: 'Gene editing technologies like CRISPR have the potential to eliminate genetic diseases. Some people welcome this possibility, while others have ethical concerns.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Gender roles', prompt: 'Traditional gender roles are changing in many societies. Some people believe this is a positive development, while others think it is causing social problems.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Food insecurity', prompt: 'Millions of people around the world do not have access to sufficient, nutritious food.\n\nWhat are the causes of food insecurity, and what solutions can be implemented?' },
  { type: 'Opinion', topic: 'Digital divide', prompt: 'The digital divide between those with access to technology and those without is growing. Some people believe governments should take action to bridge this gap, while others think market forces will resolve it naturally.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Compulsory voting', prompt: 'Some people believe that voting should be compulsory in all democratic countries, while others think citizens should have the right to choose whether or not to vote.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Urban heat island effect', prompt: 'Many cities experience significantly higher temperatures than surrounding rural areas, a phenomenon known as the urban heat island effect.\n\nWhat are the causes of this problem, and what solutions can be proposed?' },
  { type: 'Opinion', topic: 'Social welfare', prompt: 'Some people believe that governments should provide a generous social welfare system, while others think it discourages people from working.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Environmental education', prompt: 'Some people believe that environmental education should be a compulsory subject in schools, while others think other subjects are more important.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Terrorism', prompt: 'Terrorism remains a serious threat to global security.\n\nWhat are the root causes of terrorism, and what measures can governments take to combat it?' },
  { type: 'Opinion', topic: 'Direct democracy', prompt: 'Some people believe that modern technology makes direct democracy possible and desirable, allowing citizens to vote on issues directly rather than through representatives.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Traditional crafts', prompt: 'Traditional crafts and artisanal skills are declining in many countries. Some people believe this is a natural consequence of progress, while others think efforts should be made to preserve them.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Landfill crisis', prompt: 'Landfills are reaching capacity in many countries, creating a growing waste management problem.\n\nWhat are the causes of this problem, and what solutions can be implemented?' },
  { type: 'Opinion', topic: 'Social entrepreneurship', prompt: 'Social enterprises aim to address social problems while operating as businesses. Some people believe they are more effective than traditional charities, while others disagree.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Cultural tourism', prompt: 'Cultural tourism can bring economic benefits to communities, but it can also lead to the commercialisation and degradation of cultural heritage.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Teacher burnout', prompt: 'Teacher burnout is becoming increasingly common in many education systems.\n\nWhat are the causes of teacher burnout, and what solutions can be proposed?' },
  { type: 'Opinion', topic: 'Microplastics', prompt: 'Microplastics have been found in water supplies, food, and even human blood. Some people believe immediate action is needed, while others think more research is required before taking drastic measures.\n\nTo what extent do you agree or disagree?' },
  { type: 'Discussion', topic: 'Indigenous knowledge', prompt: 'Some people believe that indigenous knowledge systems have valuable contributions to make to modern science, while others think they are outdated.\n\nDiscuss both views and give your own opinion.' },
  { type: 'Problem-Solution', topic: 'Urban migration', prompt: 'Large numbers of people are migrating from rural areas to cities, creating problems for both urban and rural communities.\n\nWhat are the causes of this migration, and what solutions can be suggested?' },
  { type: 'Opinion', topic: 'Sharing economy', prompt: 'The sharing economy, exemplified by companies like Uber and Airbnb, has disrupted traditional industries. Some people welcome this change, while others have concerns about regulation and worker rights.\n\nTo what extent do you agree or disagree?' },
];

// Generate 130 tests
function generateTests(): WritingTest[] {
  const tests: WritingTest[] = [];

  // Fill from task1Topics × task2Topics combinations (first 130)
  for (let i = 0; i < 130; i++) {
    const t1 = task1Topics[i % task1Topics.length];
    const t2 = task2Topics[i % task2Topics.length];
    const name = `IELTS Writing Test ${i + 1}`;
    tests.push({
      id: `writing-test-${i + 1}`,
      name,
      slug: `writing-test-${i + 1}`,
      task1: {
        type: t1.type,
        topic: t1.topic,
        prompt: t1.prompt,
        chartDescription: t1.chartDescription,
        chartData: getChartData(t1.topic),
      },
      task2: {
        type: t2.type,
        topic: t2.topic,
        prompt: t2.prompt,
      },
      duration: 60,
      difficulty: i < 40 ? 'Easy' : i < 90 ? 'Medium' : 'Hard',
    });
  }

  return tests;
}

export const WRITING_TESTS: WritingTest[] = generateTests();

export function getWritingTest(id: string): WritingTest | undefined {
  return WRITING_TESTS.find(t => t.id === id || t.slug === id);
}

export const WRITING_CATEGORIES = ['Bar Chart', 'Line Graph', 'Pie Chart', 'Table', 'Process', 'Map', 'Discussion', 'Opinion', 'Problem-Solution'];

// ═══════════════════════════════════════════════════════════════
//  IELTS SPEAKING PRACTICE DATA — Web Speech API
// ═══════════════════════════════════════════════════════════════

export interface SpeakingTopic {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  part1: {
    questions: string[];
    sampleAnswer: string;
  };
  part2: {
    cueCard: {
      topic: string;
      prompts: string[];
      notes: string;
    };
    sampleAnswer: string;
  };
  part3: {
    questions: string[];
    sampleAnswer: string;
  };
}

export const SPEAKING_CATEGORIES = [
  'All Topics',
  'Daily Life',
  'Education',
  'Technology',
  'Environment',
  'Culture & Society',
  'Health & Sport',
  'Travel & Places',
];

export const SPEAKING_TOPICS: SpeakingTopic[] = [
  // ═══ DAILY LIFE ═══
  {
    id: 'sp-1',
    title: 'Your Hometown',
    category: 'Daily Life',
    difficulty: 'easy',
    part1: {
      questions: [
        'Where is your hometown?',
        'What do you like most about your hometown?',
        'Is your hometown a good place for young people?',
        'Has your hometown changed much over the years?',
        'What is the weather like in your hometown?',
      ],
      sampleAnswer: "I come from Samarkand, which is one of the oldest cities in Central Asia. It's famous for its stunning Registan Square and rich history along the Silk Road. The weather is continental — very hot in summer and quite cold in winter. What I love most is the warm, welcoming people and the delicious traditional food.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a place in your hometown that you enjoy visiting',
        prompts: [
          'Where is it?',
          'How often do you go there?',
          'What do you do there?',
          'Why do you enjoy going there?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "I'd like to talk about the Siab Bazaar, which is one of the largest and most vibrant markets in my hometown. It's located near the famous Bibi-Khanym Mosque and has been operating for centuries. I try to go there at least once a week, usually on weekends with my family. We buy fresh fruits, vegetables, and the incredible Samarkand non — a type of flatbread that's absolutely delicious. The atmosphere is always lively, with vendors calling out prices and the smell of fresh bread filling the air. I enjoy going there because it gives me a sense of connection to my culture and traditions. It's also a great place to practice bargaining skills and meet interesting people from different walks of life.",
    },
    part3: {
      questions: [
        'How do cities change over time?',
        "Do you think it's important to preserve historical buildings in cities?",
        'What problems do large cities face?',
        'How can governments make cities better places to live?',
      ],
      sampleAnswer: "Cities evolve constantly due to population growth, economic development, and technological advancement. I believe preserving historical buildings is crucial because they maintain a city's cultural identity and attract tourism. However, governments need to balance preservation with modern infrastructure needs. They can achieve this by implementing smart urban planning, investing in public transport, and creating green spaces that benefit residents' quality of life.",
    },
  },
  {
    id: 'sp-2',
    title: 'Daily Routine',
    category: 'Daily Life',
    difficulty: 'easy',
    part1: {
      questions: [
        'What does your typical day look like?',
        'Do you prefer mornings or evenings?',
        'What is the busiest part of your day?',
        'Do you follow a strict daily routine?',
        'What would you like to change about your daily routine?',
      ],
      sampleAnswer: "My typical day starts around 7 AM when I get up and have breakfast. I usually study English in the morning when my mind is freshest. Afternoons are for attending classes or working on projects. The busiest part is definitely late morning when I have back-to-back lectures. I'm not very strict with my routine, but I try to maintain consistency. I'd love to add more exercise time — perhaps morning jogs.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a habit or routine that you have',
        prompts: [
          'What is the habit?',
          'How long have you had this habit?',
          'How often do you do it?',
          'Is it a good or bad habit?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "I'd like to talk about my habit of reading before bed. Every night, without fail, I spend about 30 minutes reading before I go to sleep. I've had this habit for about three years now, since my university professor recommended it as a way to improve vocabulary and reduce screen time. I usually read a variety of books — sometimes fiction, sometimes non-fiction about history or science. I consider this a very good habit because it helps me relax after a long day, and I've noticed significant improvement in my English vocabulary and comprehension. It's also much healthier than scrolling through social media before sleeping. The only downside is that sometimes I get so absorbed in a book that I end up staying up later than planned.",
    },
    part3: {
      questions: [
        'Why do people develop habits?',
        'Are habits important for success?',
        'How can people break bad habits?',
        'Do children develop habits differently from adults?',
      ],
      sampleAnswer: "People develop habits because our brains naturally seek efficiency and routine to reduce decision fatigue. Habits are indeed crucial for success because they create consistency and discipline. Breaking bad habits requires awareness, replacement strategies, and often professional support. Children develop habits differently because their prefrontal cortex — the part responsible for self-control — is still developing, making them more influenced by their environment and role models.",
    },
  },
  {
    id: 'sp-3',
    title: 'Food & Cooking',
    category: 'Daily Life',
    difficulty: 'easy',
    part1: {
      questions: [
        'Do you enjoy cooking?',
        'What is your favourite food?',
        'How often do you eat out?',
        'Is there any food you dislike?',
        'Who usually cooks in your family?',
      ],
      sampleAnswer: "I quite enjoy cooking, though I'm not an expert by any means. My favourite food is probably pilaf — it's a traditional Uzbek dish with rice, meat, and vegetables. We eat out maybe once or twice a week, usually at local chaikhana restaurants. I'm not a big fan of overly spicy food. In my family, my mother does most of the cooking, but I've been learning to cook a few dishes myself.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a dish that you know how to cook',
        prompts: [
          'What is the dish?',
          'How did you learn to cook it?',
          'How often do you cook it?',
          'Who do you usually cook it for?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "I'd like to describe how I make manti, which are traditional Central Asian dumplings. It's quite a labour-intensive dish but absolutely worth the effort. I learned to make them from my grandmother when I was about 15 years old. She patiently taught me the proper way to make the dough from scratch and how to fold each dumpling into its distinctive shape. The filling is usually ground lamb with onions and cumin. I typically make manti about once a month, usually when we have family gatherings or special occasions. I cook them for my family and close friends — everyone seems to love them. The steaming process takes about 40 minutes, and they're served with sour cream and fresh herbs. It's a dish that brings everyone together around the table.",
    },
    part3: {
      questions: [
        'How has the way people cook changed over the years?',
        'Do you think cooking skills are important?',
        'Why do some young people prefer eating fast food?',
        'Will home cooking disappear in the future?',
      ],
      sampleAnswer: "Cooking has changed dramatically — convenience foods and delivery apps have made it easier to avoid cooking entirely. I believe cooking skills remain important for health, budgeting, and cultural preservation. Young people gravitate towards fast food mainly due to time pressure and the aggressive marketing of these brands. While home cooking may decline in frequency, I don't think it will disappear because of the cultural and emotional connections people have with homemade meals.",
    },
  },

  // ═══ EDUCATION ═══
  {
    id: 'sp-4',
    title: 'Learning English',
    category: 'Education',
    difficulty: 'medium',
    part1: {
      questions: [
        'Why are you learning English?',
        'What is the most difficult part of learning English?',
        'How do you practise your English?',
        'Do you think English is important?',
        'Would you like to live in an English-speaking country?',
      ],
      sampleAnswer: "I'm learning English primarily for my career prospects and to access global knowledge. The most challenging aspect is definitely pronunciation — some sounds simply don't exist in my native language. I practise by watching English films with subtitles, reading English articles daily, and having conversations with language exchange partners. English is absolutely essential in today's interconnected world. I'd love to spend some time in the UK or Australia to fully immerse myself.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a teacher who has influenced your education',
        prompts: [
          'Who was this teacher?',
          'What subject did they teach?',
          'What was special about them?',
          'How did they influence you?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "I'd like to talk about my English teacher, Mr. Rahimov, who taught me during secondary school. He taught English literature and language for about 15 years at our school. What made him truly special was his incredible passion and creativity. Instead of just making us memorise grammar rules, he would use songs, movies, and even role-playing games to teach us new concepts. He would bring in newspaper articles and have us debate current events in English. His influence on me was profound — he completely changed my attitude towards learning English from a boring school subject to something I genuinely enjoyed. He also taught me the importance of persistence and not being afraid of making mistakes. Even now, years later, I still remember his advice that every mistake is a stepping stone towards improvement.",
    },
    part3: {
      questions: [
        'What qualities make a good teacher?',
        'How has education changed with technology?',
        'Do you think online learning is as effective as classroom learning?',
        'Should students be allowed to choose their subjects?',
      ],
      sampleAnswer: "A good teacher needs patience, subject expertise, and the ability to adapt their teaching style to different learners. Technology has transformed education enormously — online resources, interactive apps, and virtual classrooms have expanded access. Online learning can be effective for self-motivated students, but it lacks the immediate feedback and social interaction of classroom learning. I think students should have some choice in subjects, especially at higher levels, as this promotes intrinsic motivation and deeper learning.",
    },
  },
  {
    id: 'sp-5',
    title: 'University Life',
    category: 'Education',
    difficulty: 'medium',
    part1: {
      questions: [
        'What are you studying at university?',
        'Why did you choose this subject?',
        'Do you enjoy studying at university?',
        'What is the most interesting thing you have learned?',
        'What are your plans after graduation?',
      ],
      sampleAnswer: "I'm currently studying Computer Science at university. I chose this field because I've always been fascinated by how technology can solve real-world problems. I genuinely enjoy my studies, especially the practical programming courses. The most interesting thing I've learned is about artificial intelligence and how machine learning algorithms work. After graduation, I plan to either pursue a master's degree or start working as a software developer at a tech company.",
    },
    part2: {
      cueCard: {
        topic: 'Describe an important skill you learned at university',
        prompts: [
          'What was the skill?',
          'How did you learn it?',
          'Why was it important?',
          'How do you use it now?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "The most important skill I learned at university was teamwork and collaboration. This wasn't a formal course but something developed through group projects and lab work. In my second year, we had a major software development project where five students had to work together to build a complete web application. Initially, it was chaotic — everyone had different ideas and working styles. But through regular meetings, task delegation, and constructive feedback, we learned to combine our strengths. This skill has been invaluable in my professional life. Whether it's coordinating with colleagues on coding projects or presenting findings to clients, the ability to work effectively with others has opened many doors for me.",
    },
    part3: {
      questions: [
        'Is university education necessary for success?',
        'What skills are most important for the modern workplace?',
        'How can universities better prepare students for employment?',
        'Do you think practical experience is more valuable than theoretical knowledge?',
      ],
      sampleAnswer: "University education isn't strictly necessary for success — many successful entrepreneurs are self-taught — but it provides structured learning and networking opportunities. The most important modern skills are adaptability, digital literacy, and effective communication. Universities should incorporate more internships and industry partnerships to bridge the gap between theory and practice. I believe both practical experience and theoretical knowledge are essential; theory provides the foundation while practice develops problem-solving abilities.",
    },
  },

  // ═══ TECHNOLOGY ═══
  {
    id: 'sp-6',
    title: 'Social Media',
    category: 'Technology',
    difficulty: 'medium',
    part1: {
      questions: [
        'Do you use social media?',
        'Which social media platform do you use most?',
        'How much time do you spend on social media?',
        'Do you think social media is a good thing?',
        'Has social media changed the way people communicate?',
      ],
      sampleAnswer: "Yes, I use social media quite regularly, mainly Instagram and Telegram. I probably spend about an hour or two daily on these platforms. Social media has both positive and negative aspects — it helps us stay connected and access information quickly, but it can also be addictive and misleading. It has certainly changed communication — people now prefer texting over calling, and we share life updates publicly rather than privately.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a social media platform that you find useful',
        prompts: [
          'What platform is it?',
          'How do you use it?',
          'What kind of content do you see on it?',
          'Why do you find it useful?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "I'd like to talk about Telegram, which is incredibly popular in my country. I use it daily for both communication and learning. It serves as my primary messaging app, but more importantly, I follow several educational channels that share English learning resources, technology news, and study materials. The content ranges from short grammar tips and vocabulary lists to longer articles and video tutorials. I find it extremely useful because it combines instant messaging with content consumption in one app. The file-sharing feature is also excellent — I regularly download study materials and share documents with classmates. Unlike some other platforms, Telegram doesn't overwhelm you with advertisements, which makes the user experience much more pleasant.",
    },
    part3: {
      questions: [
        'What are the dangers of social media?',
        'Should children be allowed to use social media?',
        'How can people protect their privacy online?',
        'Do you think social media companies have too much power?',
      ],
      sampleAnswer: "Social media poses several risks including cyberbullying, misinformation, privacy violations, and addiction. Children should be allowed limited, supervised access rather than being completely excluded, as digital literacy is essential. People can protect their privacy by using strong passwords, enabling two-factor authentication, and being cautious about what they share publicly. Social media companies do wield enormous power through their control of information flow and user data, which is why proper regulation is essential.",
    },
  },
  {
    id: 'sp-7',
    title: 'Artificial Intelligence',
    category: 'Technology',
    difficulty: 'hard',
    part1: {
      questions: [
        'Do you use any AI tools or applications?',
        'What do you think about artificial intelligence?',
        'How has AI changed your daily life?',
        'Do you think AI will replace human jobs?',
        'Would you like to learn more about AI?',
      ],
      sampleAnswer: "Yes, I use AI tools quite frequently — ChatGPT for writing assistance, translation apps, and even AI-powered photo editing. I'm both amazed and slightly concerned about artificial intelligence. It has made daily tasks much more efficient, from voice assistants to smart recommendations. While AI will certainly automate many routine jobs, I believe it will create new types of employment as well. I'd absolutely love to study AI in more depth at the postgraduate level.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a piece of technology that has changed your life',
        prompts: [
          'What is the technology?',
          'When did you start using it?',
          'How does it help you?',
          'How would life be different without it?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "I'd like to talk about the smartphone, which has fundamentally transformed how I live, work, and communicate. I got my first smartphone about seven years ago when I started university. It has become indispensable for virtually everything — from accessing online lectures and researching for assignments to staying in touch with family and managing my schedule. The camera allows me to document important moments, and navigation apps help me explore new places. Without my smartphone, life would be incredibly inconvenient. I'd have to carry separate devices for calls, music, maps, and a camera. More importantly, I'd lose access to countless educational resources that I rely on daily. It's fascinating to think that a device smaller than my hand has become so central to modern existence.",
    },
    part3: {
      questions: [
        'Will robots be common in households in the future?',
        'Should governments regulate AI development?',
        'What jobs are least likely to be replaced by AI?',
        'How can we ensure AI benefits everyone equally?',
      ],
      sampleAnswer: "Robots will likely become more common in households for tasks like cleaning, cooking, and elderly care, though full autonomy is still far off. Governments should definitely regulate AI development to prevent misuse and ensure ethical standards. Creative, empathetic, and complex decision-making jobs — like therapists, artists, and strategic leaders — are least likely to be replaced. To ensure AI benefits everyone, we need universal digital literacy programs, open-source AI research, and policies that prevent wealth concentration in tech companies.",
    },
  },

  // ═══ ENVIRONMENT ═══
  {
    id: 'sp-8',
    title: 'Climate Change',
    category: 'Environment',
    difficulty: 'hard',
    part1: {
      questions: [
        'Do you care about the environment?',
        'What can individuals do to help the environment?',
        'Is pollution a big problem in your city?',
        'Do you recycle?',
        'What do you think about climate change?',
      ],
      sampleAnswer: "Absolutely — I'm quite concerned about environmental issues. Individuals can contribute by reducing plastic use, recycling, using public transport, and conserving water. Pollution is definitely a problem in major cities here, with vehicle emissions being the main culprit. I do recycle, though I admit the system here could be much better. Climate change is perhaps the most critical challenge facing humanity, and I believe urgent collective action is needed.",
    },
    part2: {
      cueCard: {
        topic: 'Describe an environmental problem in your area',
        prompts: [
          'What is the problem?',
          'What causes it?',
          'How does it affect people?',
          'What should be done about it?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "The most pressing environmental problem in my area is air pollution, particularly during winter months. The primary causes are the burning of coal and natural gas for heating, vehicle emissions from increasingly congested roads, and industrial activity on the outskirts of the city. This pollution affects people in numerous ways — respiratory problems have increased significantly, especially among children and the elderly. On particularly smoggy days, outdoor activities become unpleasant and even risky. To address this, the government should invest in modernising the heating infrastructure to reduce coal dependence, expand public transportation to decrease car usage, and enforce stricter emission standards for factories. Public awareness campaigns about environmental protection would also help encourage individual action.",
    },
    part3: {
      questions: [
        'Should developing countries prioritize economic growth or environmental protection?',
        'What role should companies play in protecting the environment?',
        'Do you think individual actions can make a difference?',
        'How will climate change affect future generations?',
      ],
      sampleAnswer: "Developing countries should pursue sustainable development rather than choosing between growth and environment — green technology can drive economic growth. Companies must take responsibility by reducing emissions, adopting sustainable practices, and investing in clean technology. Individual actions may seem small but collectively they create significant impact — think of how plastic bag usage has decreased. Future generations will face more extreme weather, rising sea levels, food insecurity, and climate migration if we fail to act decisively now.",
    },
  },
  {
    id: 'sp-9',
    title: 'Animals & Wildlife',
    category: 'Environment',
    difficulty: 'medium',
    part1: {
      questions: [
        'Do you like animals?',
        'Do you have a pet?',
        'What is your favourite animal?',
        'Are there many wild animals in your area?',
        "Do you think it's important to protect endangered species?",
      ],
      sampleAnswer: "I love animals, especially dogs and horses. I don't currently have a pet, but I grew up with a dog named Bruno. My favourite animal is the eagle — I admire its power and freedom. In my area, there are some wild animals, mainly foxes and various bird species. Protecting endangered species is absolutely crucial — each species plays a vital role in maintaining ecological balance.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a time you saw a wild animal',
        prompts: [
          'Where did you see it?',
          'What animal was it?',
          'What was it doing?',
          'How did you feel about it?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "I remember seeing a fox during a hiking trip in the mountains near my hometown about two years ago. My friends and I were trekking through a forested area when we noticed something moving near a stream. It turned out to be a beautiful red fox drinking water. It was completely unaware of our presence at first. We stopped walking and watched quietly. The fox looked up, noticed us, and quickly darted into the bushes. I felt a mixture of excitement and wonder — it was such a magical moment to see this elegant creature in its natural habitat. The experience deepened my appreciation for wildlife and reminded me how important it is to preserve natural spaces where animals can thrive.",
    },
    part3: {
      questions: [
        'Why do some people oppose zoos?',
        'How can we protect wildlife in urban areas?',
        'Should countries work together to protect endangered species?',
        'What impact does human development have on wildlife?',
      ],
      sampleAnswer: "Many people oppose zoos because they believe keeping animals in captivity for entertainment is unethical, regardless of conservation benefits. Protecting urban wildlife requires creating green corridors, urban parks, and wildlife-friendly building designs. International cooperation is essential because animals migrate across borders and ecosystems are interconnected. Human development has devastating impacts on wildlife — habitat destruction, pollution, and climate change are driving species to extinction at an unprecedented rate.",
    },
  },

  // ═══ CULTURE & SOCIETY ═══
  {
    id: 'sp-10',
    title: 'Festivals & Celebrations',
    category: 'Culture & Society',
    difficulty: 'easy',
    part1: {
      questions: [
        'What is the most popular festival in your country?',
        'How do people celebrate it?',
        'Do you enjoy celebrations?',
        'What is your favourite festival?',
        'Are festivals important for culture?',
      ],
      sampleAnswer: "Navruz, the Persian New Year, is the most widely celebrated festival in Uzbekistan. People celebrate with traditional foods like sumalak, visit family and friends, and organise outdoor festivities. I absolutely love celebrations — they bring people together and create wonderful memories. My favourite is definitely Navruz because it marks the beginning of spring and new beginnings. Festivals are essential for preserving cultural identity and passing traditions to younger generations.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a festival or celebration that is important in your culture',
        prompts: [
          'What is the celebration?',
          'When does it take place?',
          'How do people celebrate it?',
          'Why is it important?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "I'd like to describe Navruz, which is celebrated on the 21st of March and marks the spring equinox and the beginning of the new year in many Central Asian cultures. In Uzbekistan, preparations begin weeks in advance — people thoroughly clean their homes, buy new clothes, and prepare special dishes. The centrepiece is sumalak, a traditional sweet pudding made from wheat sprouts that's stirred continuously by the whole community for an entire night. Families gather to share elaborate meals, children receive gifts and money, and public parks are filled with music, dancing, and traditional games. Navruz is important because it symbolises renewal and hope, strengthens community bonds, and keeps centuries-old traditions alive. It's a time when even distant relatives make an effort to reconnect.",
    },
    part3: {
      questions: [
        'Are traditional festivals losing their significance?',
        'How do festivals contribute to tourism?',
        'Should governments support cultural festivals?',
        'How have celebrations changed over time?',
      ],
      sampleAnswer: "Some traditional festivals are losing significance as globalisation spreads Western holidays, but many communities actively work to preserve them. Festivals contribute enormously to tourism — events like Rio Carnival and Oktoberfest attract millions of visitors and generate substantial revenue. Governments should absolutely support cultural festivals through funding and promotion as they strengthen national identity. Celebrations have evolved with technology — social media sharing, virtual participation, and commercialisation have all changed how we experience traditional events.",
    },
  },
  {
    id: 'sp-11',
    title: 'Music & Entertainment',
    category: 'Culture & Society',
    difficulty: 'medium',
    part1: {
      questions: [
        'What kind of music do you listen to?',
        'Do you play any musical instruments?',
        'How often do you listen to music?',
        'Has your taste in music changed over the years?',
        'Do you prefer live concerts or listening at home?',
      ],
      sampleAnswer: "I listen to a wide variety of music — pop, hip-hop, and some traditional Uzbek music. I played the guitar for a few years in secondary school, though I haven't kept up with it recently. I listen to music almost every day, especially while studying or commuting. My taste has definitely evolved — I used to prefer fast-paced pop songs, but now I appreciate more varied genres. I much prefer live concerts because the energy and atmosphere are incomparable.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a song or piece of music you enjoy',
        prompts: [
          'What is the song?',
          'Who performs it?',
          'When did you first hear it?',
          'Why do you like it?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "I'd like to talk about a song called 'Shape of You' by Ed Sheeran, which I first heard in 2017 when it was released. A friend played it during a road trip, and I immediately fell in love with it. The catchy melody, rhythmic beat, and relatable lyrics about meeting someone special made it an instant favourite. What I particularly appreciate is how Ed Sheeran blends pop with subtle dancehall influences, creating something that's both commercially appealing and musically interesting. This song reminds me of a wonderful summer spent with friends, and whenever I hear it, those happy memories come flooding back. I still listen to it regularly on my playlist, and it never fails to lift my mood.",
    },
    part3: {
      questions: [
        'How has the music industry changed with streaming services?',
        'Do you think music has the power to bring people together?',
        'Should governments support local musicians?',
        'Will AI-generated music replace human musicians?',
      ],
      sampleAnswer: "Streaming services have democratised music distribution but made it harder for artists to earn a living from recordings alone. Music absolutely has the power to unite people across cultural and language barriers — concerts and festivals demonstrate this beautifully. Governments should support local musicians through grants, cultural programmes, and education to maintain musical diversity. While AI can compose technically proficient music, it currently lacks the emotional depth and lived experience that make human music truly meaningful.",
    },
  },

  // ═══ HEALTH & SPORT ═══
  {
    id: 'sp-12',
    title: 'Sports & Exercise',
    category: 'Health & Sport',
    difficulty: 'easy',
    part1: {
      questions: [
        'Do you play any sports?',
        'How often do you exercise?',
        'What is your favourite sport to watch?',
        'Do you prefer team sports or individual sports?',
        'Has COVID changed the way you exercise?',
      ],
      sampleAnswer: "I play football regularly with friends, usually twice a week. I try to exercise at least three times a week, combining football with jogging. My favourite sport to watch is Champions League football — the atmosphere is incredible. I prefer team sports because I enjoy the social aspect and camaraderie. COVID definitely changed things — I started home workouts and running outdoors instead of going to the gym.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a sport or physical activity you enjoy',
        prompts: [
          'What is the sport?',
          'How often do you do it?',
          'How did you start doing it?',
          'Why do you enjoy it?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "I'd like to talk about running, which has become my favourite form of exercise over the past two years. I go running three to four times a week, usually in the early morning before the city gets too busy. I started running during the pandemic when gyms were closed, and I needed an outdoor activity to stay fit. Initially, I could barely run for 10 minutes without stopping, but gradually I built up my stamina and now I regularly complete 5-kilometre runs. I enjoy running because it gives me both physical and mental benefits. The fresh morning air clears my mind and helps me start the day with energy. It's also incredibly satisfying to see my times improve over weeks and months. Running has taught me discipline and the value of consistent effort — small improvements accumulate into remarkable progress.",
    },
    part3: {
      questions: [
        'Why do some people not exercise regularly?',
        'Should physical education be compulsory in schools?',
        'How can governments encourage people to be more active?',
        'Do you think competitive sport is too stressful for young people?',
      ],
      sampleAnswer: "Many people skip exercise due to time constraints, lack of motivation, or simply not finding an activity they enjoy. Physical education should absolutely be compulsory — it instils healthy habits from an early age and improves concentration in other subjects. Governments can encourage activity through better cycling infrastructure, affordable sports facilities, and workplace wellness programmes. While competition can be stressful, learning to handle pressure in sports actually prepares young people for real-life challenges.",
    },
  },
  {
    id: 'sp-13',
    title: 'Health & Wellbeing',
    category: 'Health & Sport',
    difficulty: 'medium',
    part1: {
      questions: [
        'How do you keep yourself healthy?',
        'Do you eat a balanced diet?',
        'How important is sleep for health?',
        'Do you visit the doctor regularly?',
        'What do you do when you feel stressed?',
      ],
      sampleAnswer: "I try to maintain a healthy lifestyle through regular exercise, eating plenty of fruits and vegetables, and getting enough sleep. My diet isn't always perfectly balanced — I sometimes indulge in sweets and fast food — but overall I eat reasonably well. Sleep is incredibly important for health, and I aim for seven to eight hours nightly. I go for regular check-ups, perhaps twice a year. When I'm stressed, I go for a run or listen to music — both help me clear my mind.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a time you had to take care of someone',
        prompts: [
          'Who did you take care of?',
          'What happened?',
          'What did you do?',
          'How did you feel about it?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "Last winter, my younger sister got quite sick with a severe cold and fever, and our parents were away visiting relatives. I had to take care of her for about three days. I prepared warm soups and herbal teas, made sure she took her medicine on time, and kept her company. I also had to manage the household — cooking, cleaning, and making sure everything ran smoothly. It was challenging because I was also studying for exams, but I managed to balance both responsibilities. The experience made me feel genuinely proud and more mature. It also taught me how much our parents do for us every day, and I gained a deeper appreciation for their efforts. By the third day, she was feeling much better, and we bonded even more through the experience.",
    },
    part3: {
      questions: [
        'Should the government spend more on healthcare?',
        'How has the healthcare system changed in recent years?',
        'Is mental health as important as physical health?',
        'How can we improve healthcare in developing countries?',
      ],
      sampleAnswer: "Government healthcare spending should increase significantly — prevention is always more cost-effective than treatment. Healthcare systems have improved dramatically through telemedicine, electronic records, and advanced diagnostics. Mental health is absolutely as important as physical health, though stigma still prevents many people from seeking help. Developing countries need investment in basic healthcare infrastructure, trained medical professionals, and public health education to bridge the gap.",
    },
  },

  // ═══ TRAVEL & PLACES ═══
  {
    id: 'sp-14',
    title: 'Travel & Holidays',
    category: 'Travel & Places',
    difficulty: 'easy',
    part1: {
      questions: [
        'Do you like travelling?',
        'Where was the last place you visited?',
        'Do you prefer travelling alone or with others?',
        'What do you usually do when you travel?',
        'Is there anywhere you would like to visit in the future?',
      ],
      sampleAnswer: "I absolutely love travelling — it's one of my favourite things to do. The last place I visited was Tashkent, our capital city, for a short weekend trip. I usually prefer travelling with friends or family because sharing experiences makes them more memorable. When I travel, I enjoy exploring local food, visiting historical sites, and taking photographs. I'd love to visit Turkey someday — Istanbul looks absolutely fascinating with its blend of European and Asian cultures.",
    },
    part2: {
      cueCard: {
        topic: 'Describe a memorable trip you have taken',
        prompts: [
          'Where did you go?',
          'Who did you go with?',
          'What did you do there?',
          'Why was it memorable?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "The most memorable trip I've taken was a week-long journey to Bukhara with my university classmates about a year ago. There were eight of us, and we travelled by train, which was an adventure in itself. Bukhara is an ancient city filled with stunning medieval architecture, including the famous Po-i-Kalyan complex and numerous madrasas. We spent our days exploring the old city's winding alleys, visiting museums, bargaining in the traditional bazaars, and trying local delicacies like shashlik and cotton sweets. The evenings were spent on rooftop restaurants overlooking the illuminated historical centre. What made this trip truly memorable was the combination of breathtaking historical sites and the wonderful company. We shared so many laughs, took hundreds of photographs, and created memories that still bring smiles to our faces. The trip deepened my appreciation for our country's rich cultural heritage.",
    },
    part3: {
      questions: [
        'How has tourism changed your country?',
        'Is mass tourism harmful to local communities?',
        'Should tourists learn about local customs before visiting?',
        'Will virtual reality replace physical travel?',
      ],
      sampleAnswer: "Tourism has brought economic benefits to Uzbekistan, particularly with the Silk Road heritage sites gaining UNESCO recognition, though it has also led to some commercialisation of local culture. Mass tourism can indeed harm communities through environmental damage and cultural erosion, which is why sustainable tourism practices are essential. Tourists should definitely research local customs to show respect and enhance their own experience. While virtual reality offers impressive previews, it cannot replace the sensory richness and spontaneous human connections of physical travel.",
    },
  },
  {
    id: 'sp-15',
    title: 'Your Neighbourhood',
    category: 'Travel & Places',
    difficulty: 'easy',
    part1: {
      questions: [
        'Where do you live?',
        'Is your neighbourhood quiet or noisy?',
        'What facilities are near your home?',
        'Do you feel safe in your neighbourhood?',
        'Would you like to move to a different area?',
      ],
      sampleAnswer: "I live in a residential area on the outskirts of Samarkand. It's quite quiet and peaceful, especially compared to the city centre. There are several shops, a park, and a school within walking distance. I feel very safe — crime rates are quite low and neighbours look out for each other. I wouldn't mind moving to a busier area eventually, as it would be more convenient for work and social life.",
    },
    part2: {
      cueCard: {
        topic: 'Describe your ideal home',
        prompts: [
          'Where would it be?',
          'What would it look like?',
          'What rooms would it have?',
          'Why would it be your ideal home?',
        ],
        notes: 'You have 1 minute to prepare. Speak for 1-2 minutes.',
      },
      sampleAnswer: "My ideal home would be a modern apartment in a central location, close to public transport, parks, and cafes. The design would be minimalist with plenty of natural light — large windows, neutral colours, and wooden accents. It would have a spacious open-plan kitchen and living area for entertaining, a comfortable bedroom with a reading nook, and a dedicated home office space for studying and working. There would also be a small balcony where I could enjoy morning coffee while looking out over the city. This would be my ideal home because it combines functionality with aesthetics. The central location means I can easily access everything I need, while the modern design creates a calm and organised environment that helps me stay productive and relaxed.",
    },
    part3: {
      questions: [
        'How has housing changed in your country?',
        'Is it better to rent or buy a home?',
        'How does where you live affect your quality of life?',
        'What makes a good neighbourhood?',
      ],
      sampleAnswer: "Housing in my country has transformed significantly — modern apartment complexes are replacing traditional homes as urbanisation accelerates. The rent-versus-buy decision depends on personal circumstances, though owning provides long-term stability and investment value. Your neighbourhood directly impacts wellbeing through access to services, safety, community connections, and environmental quality. A good neighbourhood needs safe streets, essential amenities, green spaces, friendly community, and good transport links.",
    },
  },
];

// ═══ Scoring helpers ═══

export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getFluencyScore(wordCount: number, durationSeconds: number, pauses: number): number {
  // Words per minute
  const wpm = durationSeconds > 0 ? (wordCount / durationSeconds) * 60 : 0;
  let score = 5.0;
  // WPM scoring (IELTS fluent speakers: ~150-180 wpm)
  if (wpm >= 160) score += 2.0;
  else if (wpm >= 130) score += 1.5;
  else if (wpm >= 100) score += 1.0;
  else if (wpm >= 70) score += 0.5;
  else score -= 0.5;
  // Penalize long pauses
  if (pauses > 5) score -= 0.5;
  if (pauses > 10) score -= 1.0;
  return Math.min(9.0, Math.max(4.0, Math.round(score * 2) / 2));
}

export function getLexicalScore(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words);
  const lexicalDiversity = words.length > 0 ? uniqueWords.size / words.length : 0;

  // Check for advanced vocabulary markers
  const advancedWords = [
    'furthermore', 'moreover', 'additionally', 'consequently', 'nevertheless',
    'significantly', 'substantial', 'predominantly', 'fundamentally', 'contemporary',
    'sophisticated', 'comprehensive', 'exemplary', 'indispensable', 'overwhelming',
    'particularly', 'essential', 'crucial', 'remarkable', 'unprecedented',
  ];
  const advancedCount = words.filter(w => advancedWords.includes(w)).length;

  let score = 5.0;
  if (lexicalDiversity >= 0.75) score += 2.0;
  else if (lexicalDiversity >= 0.65) score += 1.5;
  else if (lexicalDiversity >= 0.55) score += 1.0;
  else if (lexicalDiversity >= 0.45) score += 0.5;

  score += Math.min(1.0, advancedCount * 0.15);

  return Math.min(9.0, Math.max(4.0, Math.round(score * 2) / 2));
}

export function getGrammarScore(text: string): number {
  let score = 5.5;

  // Check for complex sentence structures
  const sentenceEnders = text.split(/[.!?]+/).filter(s => s.trim());
  const avgWordsPerSentence = sentenceEnders.length > 0
    ? text.split(/\s+/).length / sentenceEnders.length
    : 0;

  if (avgWordsPerSentence >= 15) score += 1.0;
  else if (avgWordsPerSentence >= 10) score += 0.5;

  // Check for subordinating conjunctions (complex sentences)
  const complexMarkers = ['although', 'because', 'since', 'while', 'whereas', 'unless', 'despite', 'however', 'moreover', 'furthermore', 'nevertheless'];
  const used = complexMarkers.filter(m => text.toLowerCase().includes(m)).length;
  score += Math.min(1.5, used * 0.3);

  // Check for variety in tenses (simple heuristic)
  const tenseMarkers = ['have', 'has', 'had', 'will', 'would', 'could', 'should', 'was', 'were', 'being'];
  const tensesUsed = tenseMarkers.filter(t => text.toLowerCase().split(/\s+/).includes(t)).length;
  score += Math.min(0.5, tensesUsed * 0.1);

  return Math.min(9.0, Math.max(4.0, Math.round(score * 2) / 2));
}

export function getPronunciationScore(wordCount: number, durationSeconds: number): number {
  // Estimate based on words-per-minute and natural speaking rate
  if (durationSeconds === 0) return 5.0;
  const wpm = (wordCount / durationSeconds) * 60;
  let score = 5.5;
  // Natural pace suggests better pronunciation
  if (wpm >= 120 && wpm <= 180) score += 1.5;
  else if (wpm >= 90 && wpm <= 200) score += 1.0;
  else if (wpm < 60 || wpm > 220) score -= 0.5;
  return Math.min(9.0, Math.max(4.0, Math.round(score * 2) / 2));
}

export function evaluateSpeaking(
  transcript: string,
  durationSeconds: number,
  pauseCount: number,
): {
  overallBand: number;
  fluency: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
} {
  const wordCount = getWordCount(transcript);

  const fluency = getFluencyScore(wordCount, durationSeconds, pauseCount);
  const lexical = getLexicalScore(transcript);
  const grammar = getGrammarScore(transcript);
  const pronunciation = getPronunciationScore(wordCount, durationSeconds);

  const overallBand = Math.round(((fluency + lexical + grammar + pronunciation) / 4) * 2) / 2;

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (fluency >= 7) strengths.push('Natural speaking pace with good flow');
  else if (fluency < 6) improvements.push('Try to speak more fluently with fewer long pauses');

  if (lexical >= 7) strengths.push('Rich vocabulary with advanced word choices');
  else if (lexical < 6) improvements.push('Use more varied vocabulary and less common words');

  if (grammar >= 7) strengths.push('Complex sentence structures used effectively');
  else if (grammar < 6) improvements.push('Try using more complex grammar structures (although, because, whereas)');

  if (pronunciation >= 7) strengths.push('Good pronunciation with natural intonation');
  else if (pronunciation < 6) improvements.push('Work on pronunciation clarity and natural rhythm');

  if (wordCount < 50) improvements.push('Try to speak for longer — aim for at least 50-100 words');
  if (wordCount > 200) strengths.push('Good use of extended responses');

  let feedback = '';
  if (overallBand >= 7.5) feedback = 'Excellent performance! You demonstrate strong English speaking skills with good fluency, vocabulary, and grammar.';
  else if (overallBand >= 6.5) feedback = 'Good performance! You communicate effectively but there\'s room to expand vocabulary and improve fluency.';
  else if (overallBand >= 5.5) feedback = 'Fair performance. You can communicate but need to work on fluency, vocabulary range, and sentence complexity.';
  else feedback = 'Keep practising! Focus on speaking more fluently, using varied vocabulary, and constructing complex sentences.';

  if (strengths.length === 0) strengths.push('You attempted the task and produced a response');
  if (improvements.length === 0) improvements.push('Keep practising to maintain your level');

  return { overallBand, fluency, lexicalResource: lexical, grammaticalRange: grammar, pronunciation, feedback, strengths, improvements };
}

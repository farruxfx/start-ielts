import { readFileSync, writeFileSync } from 'fs';

const files = [
  'public/mock-exams/full-mock-test-9.html',
  'public/mock-exams/full-mock-test-10.html'
];

for (const file of files) {
  let html = readFileSync(file, 'utf8');
  
  // Fix the extra closing brace after doLogin
  // The buggy pattern is:
  //     if(scHub) scHub.classList.add('hidden');
  //     }
  //   }         <-- extra brace
  // 
  // Should be:
  //     if(scHub) scHub.classList.add('hidden');
  //   }
  
  const buggy = `      if(scHub) scHub.classList.add('hidden');
    }
  }

/* ======================= hub ======================= */`;
  
  const fixed = `      if(scHub) scHub.classList.add('hidden');
  }

/* ======================= hub ======================= */`;
  
  if (html.includes(buggy)) {
    html = html.replace(buggy, fixed);
    writeFileSync(file, html, 'utf8');
    console.log(`Fixed extra brace in ${file}`);
  } else {
    console.log(`No extra brace found in ${file} (may already be fixed)`);
  }
}

// Verify
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  let allOk = true;
  scripts.forEach((s, i) => {
    const content = s.replace(/<\/?script[^>]*>/gi, '');
    try { new Function(content); }
    catch(e) { 
      console.log(`  ${file} Script ${i+1}: ERROR - ${e.message.substring(0, 100)}`); 
      allOk = false;
    }
  });
  if (allOk) console.log(`  ${file}: All scripts OK ✓`);
}

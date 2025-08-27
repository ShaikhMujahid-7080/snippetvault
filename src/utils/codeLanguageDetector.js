// Simple language detection based on common patterns
export const detectLanguage = (code) => {
  const patterns = {
    javascript: [
      /function\s+\w+/,
      /const\s+\w+\s*=/,
      /=>\s*{/,
      /console\.log/,
      /import\s+.*from/,
      /export\s+(default\s+)?/,
      /\.map\s*\(/,
      /\.filter\s*\(/,
      /useState|useEffect/
    ],
    python: [
      /def\s+\w+/,
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /print\s*\(/,
      /if\s+__name__\s*==\s*['""]__main__['"]/,
      /class\s+\w+:/,
      /elif\s+/,
      /:\s*$/m
    ],
    css: [
      /\.\w+\s*{/,
      /@media/,
      /display\s*:/,
      /background\s*:/,
      /margin\s*:/,
      /padding\s*:/,
      /color\s*:/,
      /font-size\s*:/,
      /transform\s*:/
    ],
    html: [
      /<html/i,
      /<div/i,
      /<p>/i,
      /<script/i,
      /<style/i,
      /<head>/i,
      /<body>/i,
      /<img/i,
      /<a\s+href/i
    ],
    json: [
      /^\s*{/,
      /"\w+"\s*:/,
      /^\s*\[/,
      /},\s*{/,
      /],\s*"/,
      /null|true|false/
    ],
    markdown: [
      /^#+\s/m,
      /\*\*.+\*\*/,
      /\[.+\]\(.+\)/,
      /^\s*-\s+/m,
      /^\s*\*\s+/m,
      /^\s*\d+\.\s+/m,
      /^>/m,
      /``` /
    ],
    sql: [
      /SELECT\s+/i,
      /FROM\s+/i,
      /WHERE\s+/i,
      /INSERT\s+INTO/i,
      /UPDATE\s+/i,
      /DELETE\s+FROM/i,
      /CREATE\s+TABLE/i,
      /ALTER\s+TABLE/i
    ],
    bash: [
      /^#!/,
      /sudo\s+/,
      /apt\s+/,
      /cd\s+/,
      /ls\s+/,
      /grep\s+/,
      /chmod\s+/,
      /export\s+\w+=/,
      /\$\w+/
    ],
    php: [
      /<\?php/,
      /\$\w+/,
      /echo\s+/,
      /function\s+\w+\s*$$/,
      /class\s+\w+/,
      /->\w+/,
      /::[\w$]+/
    ],
    java: [
      /public\s+class/,
      /public\s+static\s+void\s+main/,
      /System\.out\.println/,
      /import\s+java\./,
      /private\s+\w+\s+\w+/,
      /public\s+\w+\s+\w+\s*$$/
    ],
    c: [
      /#include\s*</,
      /int\s+main\s*$$/,
      /printf\s*$$/,
      /scanf\s*$$/,
      /malloc\s*$$/,
      /free\s*$$/,
      /struct\s+\w+/
    ],
    cpp: [
      /#include\s*</,
      /using\s+namespace\s+std/,
      /cout\s*<</,
      /cin\s*>>/,
      /std::/,
      /class\s+\w+/,
      /template\s*</
    ],
    go: [
      /package\s+main/,
      /import\s*$$/,
      /func\s+main\s*$$/,
      /fmt\.Print/,
      /var\s+\w+\s+\w+/,
      /:=\s*/,
      /go\s+\w+$$/
    ],
    rust: [
      /fn\s+main\s*$$/,
      /println!\s*$$/,
      /let\s+mut\s+/,
      /match\s+\w+/,
      /impl\s+\w+/,
      /struct\s+\w+/,
      /use\s+std::/
    ],
    yaml: [
      /^\s*\w+:\s*$/m,
      /^\s*-\s+\w+:/m,
      /version:\s*['"]?\d+/,
      /apiVersion:/,
      /kind:/,
      /metadata:/
    ],
    xml: [
      /<\?xml/,
      /<\/\w+>/,
      /<\w+\s+.*=/,
      /xmlns:/,
      /CDATA/
    ],
    dockerfile: [
      /FROM\s+\w+/i,
      /RUN\s+/i,
      /COPY\s+/i,
      /ADD\s+/i,
      /WORKDIR\s+/i,
      /EXPOSE\s+\d+/i,
      /CMD\s+/i,
      /ENTRYPOINT\s+/i
    ]
  };

  // Clean the code for better detection
  const cleanCode = code.trim().toLowerCase();
  
  for (const [lang, regexes] of Object.entries(patterns)) {
    let matchCount = 0;
    
    for (const regex of regexes) {
      if (regex.test(code)) {
        matchCount++;
      }
    }
    
    // If multiple patterns match, it's likely this language
    if (matchCount >= 2) {
      return lang;
    }
  }
  
  // Fallback: check for single strong indicators
  for (const [lang, regexes] of Object.entries(patterns)) {
    if (regexes.some(regex => regex.test(code))) {
      return lang;
    }
  }
  
  return 'text';
};

// Helper function to get a more readable language name
export const getLanguageDisplayName = (lang) => {
  const displayNames = {
    javascript: 'JavaScript',
    python: 'Python',
    css: 'CSS',
    html: 'HTML',
    json: 'JSON',
    markdown: 'Markdown',
    sql: 'SQL',
    bash: 'Bash/Shell',
    php: 'PHP',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    go: 'Go',
    rust: 'Rust',
    yaml: 'YAML',
    xml: 'XML',
    dockerfile: 'Dockerfile',
    text: 'Plain Text'
  };
  
  return displayNames[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
};

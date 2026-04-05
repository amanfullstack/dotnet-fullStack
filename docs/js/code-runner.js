/**
 * ================================================================
 * MONACO CODE RUNNER — Interactive Code Execution UI
 * Manages Monaco editor instances and execution workflow
 * ================================================================
 */

// Global instance - prevent multiple instances
window.monacoRunner = window.monacoRunner || null;

class MonacoRunner {
  constructor() {
    // Prevent multiple instances
    if (window.monacoRunner && window.monacoRunner instanceof MonacoRunner) {
      console.log('⚠ MonacoRunner already instantiated, returning existing instance');
      return window.monacoRunner;
    }

    this.editors = {};
    this.executor = new CodeExecutor();
    this.monacoCDN = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.50.0/min';
    this.isMonacoLoaded = !!window.monaco;
    this.isInitializing = false;

    // Store as global
    window.monacoRunner = this;
  }

  /**
   * Load Monaco Editor from CDN
   */
  async loadMonaco() {
    if (this.isMonacoLoaded) {
      console.log('✓ Monaco already loaded');
      return true;
    }

    try {
      console.log('📦 Loading Monaco Editor...');

      // Load Monaco Loader from jsDelivr (more reliable than cdnjs)
      const loaderScript = document.createElement('script');
      loaderScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs/loader.min.js';
      loaderScript.async = true;
      document.head.appendChild(loaderScript);

      // Wait for loader to load
      await new Promise((resolve, reject) => {
        loaderScript.onload = () => {
          console.log('✓ Loader script loaded');
          resolve();
        };
        loaderScript.onerror = () => {
          console.error('✗ Failed to load loader script');
          reject(new Error('Failed to load loader script'));
        };
      });

      // Give require a moment to be available
      await new Promise(r => setTimeout(r, 100));

      if (!window.require) {
        throw new Error('Require not available after loader loaded');
      }

      console.log('✓ Require available');

      // Configure require paths
      require.config({
        paths: {
          vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs'
        }
      });

      console.log('✓ Require paths configured');

      // Load Monaco
      return new Promise((resolve, reject) => {
        require(['vs/editor/editor.main'], () => {
          this.isMonacoLoaded = true;
          this._applyThemeToMonaco();
          console.log('✓ Monaco Editor loaded successfully');
          resolve(true);
        }, (err) => {
          console.error('✗ Failed to load Monaco:', err);
          reject(err);
        });
      });

    } catch (err) {
      console.error('✗ Error during Monaco load:', err);
      return false;
    }
  }

  /**
   * Initialize all code editors on the page
   */
  async initializeEditors() {
    if (this.isInitializing) {
      console.log('⚠ Already initializing editors, skipping duplicate call');
      return;
    }
    this.isInitializing = true;

    console.log('🚀 Initializing Monaco editors...');

    if (!await this.loadMonaco()) {
      console.error('✗ Failed to load Monaco Editor');

      // Show error message to user
      const problems = document.querySelectorAll('.problem-container');
      problems.forEach(p => {
        const editor = p.querySelector('.monaco-editor');
        if (editor) {
          editor.innerHTML = `
            <div style="padding: 20px; color: #ef4444; font-family: monospace;">
              <strong>⚠️ Failed to load code editor</strong><br/>
              <small>Monaco Editor CDN is unreachable. Try:<br/>
              1. Refresh the page<br/>
              2. Check your internet connection<br/>
              3. Try again in a few moments</small>
            </div>
          `;
        }
      });
      return;
    }

    console.log('✓ Monaco loaded successfully');

    // Find all problem containers
    const problems = document.querySelectorAll('.problem-container');
    console.log(`✓ Found ${problems.length} problem containers`);

    let editorCount = 0;
    problems.forEach((problem, idx) => {
      const editorDiv = problem.querySelector('.monaco-editor');
      if (!editorDiv) {
        console.warn(`⚠ Problem #${idx} (${problem.id}): no .monaco-editor found`);
        return;
      }

      const problemId = problem.id;
      const language = this._detectLanguage(problem);
      const starterCode = this._extractStarterCode(problem, language);

      console.log(`📝 Problem ${problemId}: ${language}, code length: ${starterCode.length}`);

      try {
        this._createEditor(problemId, editorDiv, language, starterCode);
        this._attachRunButton(problem, problemId, language);
        this._attachClearButton(problem, problemId);
        editorCount++;
      } catch (err) {
        console.error(`✗ Error creating editor for ${problemId}:`, err);
      }
    });

    console.log(`✓ Initialized ${editorCount}/${problems.length} editors`);

    // Listen for theme changes
    this._watchThemeChanges();
  }

  /**
   * Create a Monaco editor instance, or fallback to textarea
   */
  _createEditor(problemId, container, language, code) {
    if (!window.monaco || !window.monaco.editor) {
      console.warn(`⚠ ${problemId}: Monaco not available, using textarea fallback`);
      this._createTextareaEditor(problemId, container, language, code);
      return;
    }

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

    console.log(`✓ Creating Monaco editor for ${problemId}`);

    const editor = window.monaco.editor.create(container, {
      value: code,
      language: this._mapLanguage(language),
      theme: isDarkMode ? 'vs-dark' : 'vs',
      fontSize: 14,
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      tabSize: 2,
      contextmenu: true,
      quickSuggestions: true,
      suggestOnTriggerCharacters: true
    });

    // Add keyboard shortcut: Ctrl+Enter to run
    editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter, () => {
      this.runCode(problemId, language);
    });

    this.editors[problemId] = editor;
  }

  /**
   * Create a simple textarea editor as fallback
   */
  _createTextareaEditor(problemId, container, language, code) {
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.style.cssText = `
      width: 100%;
      height: 400px;
      padding: 12px;
      font-family: "Fira Code", monospace;
      font-size: 14px;
      border: none;
      background: var(--surface);
      color: var(--text-1);
      resize: vertical;
      line-height: 1.5;
      tab-size: 2;
    `;

    // Handle Tab key
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }

      // Ctrl/Cmd + Enter to run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.runCode(problemId, language);
      }
    });

    container.appendChild(textarea);

    // Create fake editor object for compatibility
    this.editors[problemId] = {
      getValue: () => textarea.value,
      setValue: (val) => { textarea.value = val; },
      addCommand: () => {} // No-op for fallback
    };

    console.log(`✓ Created textarea fallback for ${problemId}`);
  }

  /**
   * Detect language from problem ID
   */
  _detectLanguage(problem) {
    const id = problem.id || '';
    if (id.includes('csharp')) return 'csharp';
    if (id.includes('sql')) return 'sql';
    if (id.includes('js') || id.includes('javascript')) return 'javascript';
    if (id.includes('algo')) return 'javascript'; // Algorithms use JavaScript
    return 'javascript'; // Default
  }

  /**
   * Map our language names to Monaco language IDs
   */
  _mapLanguage(language) {
    const map = {
      'csharp': 'csharp',
      'sql': 'sql',
      'javascript': 'javascript',
      'python': 'python'
    };
    return map[language] || 'javascript';
  }

  /**
   * Extract starter code from the solution section
   */
  _extractStarterCode(problem, language) {
    const problemId = problem.id;

    // PRIORITY 1: Fallback to data-starter-code attribute (quick and reliable)
    const starter = problem.querySelector('[data-starter-code]');
    if (starter?.dataset.starterCode) {
      const code = starter.dataset.starterCode;
      if (code && code.length > 5) {
        // Pretty-print single-line code if needed
        if (!code.includes('\n')) {
          const formatted = this._formatCode(code, language);
          console.log(`[${problemId}] ✓ Using data-starter-code (formatted to ${formatted.split('\n').length} lines, ${formatted.length} chars)`);
          return formatted;
        }
        console.log(`[${problemId}] ✓ Using data-starter-code (${code.split('\n').length} lines, ${code.length} chars)`);

        // Add sample table info for SQL
        if (language === 'sql') {
          const header = `-- 📊 SAMPLE TABLES AVAILABLE:
-- Employees (Id, Name, Salary, DepartmentId)
-- Departments (Id, Name)
-- Sales (SaleDate, Sales)
-- Numbers (Number)
-- Users (Id, Email)
-- StudentScores (Student, Score)
-- ═════════════════════════════════════

`;
          return header + code;
        }

        return code;
      }
    }

    // PRIORITY 2: Try to get from solution/optimized code block in details
    const details = problem.querySelector('details');
    if (details) {
      const allCodeBlocks = details.querySelectorAll('.code-block');
      console.log(`[${problemId}] Found ${allCodeBlocks.length} code blocks in details`);

      // For C#: Get the "Optimized Solution" block (usually 3rd block, idx 2)
      if (language === 'csharp') {
        // Try index 2 first (optimized), then 1 (naive), then 0
        for (let idx of [2, 1, 0]) {
          if (allCodeBlocks[idx]) {
            const codeEl = allCodeBlocks[idx].querySelector('code');
            if (codeEl) {
              const code = codeEl.textContent.trim();
              if (code.length > 20) {
                console.log(`[${problemId}] ✓ Using C# code block #${idx} (${code.split('\n').length} lines, ${code.length} chars)`);
                return code;
              }
            }
          }
        }
      }

      // For other languages: Get first available code block
      if (allCodeBlocks.length > 0) {
        const codeEl = allCodeBlocks[0].querySelector('code');
        if (codeEl) {
          const code = codeEl.textContent.trim();
          if (code.length > 10) {
            console.log(`[${problemId}] ✓ Using first code block (${code.split('\n').length} lines, ${code.length} chars)`);
            return code;
          }
        }
      }
    }

    // PRIORITY 3: Default boilerplate
    console.log(`[${problemId}] ⚠ Using default starter for ${language}`);
    return this._getDefaultStarter(language);
  }

  /**
   * Format compact single-line code into multi-line
   */
  _formatCode(code, language) {
    if (language === 'sql') {
      // Format SQL with proper indentation
      let formatted = code
        .replace(/SELECT\s+/gi, 'SELECT ')
        .replace(/FROM\s+/gi, '\nFROM ')
        .replace(/WHERE\s+/gi, '\nWHERE ')
        .replace(/AND\s+/gi, '\n  AND ')
        .replace(/OR\s+/gi, '\n  OR ')
        .replace(/JOIN\s+/gi, '\nJOIN ')
        .replace(/LEFT\s+JOIN/gi, '\nLEFT JOIN')
        .replace(/INNER\s+JOIN/gi, '\nINNER JOIN')
        .replace(/GROUP\s+BY/gi, '\nGROUP BY ')
        .replace(/ORDER\s+BY/gi, '\nORDER BY ')
        .replace(/HAVING\s+/gi, '\nHAVING ')
        .replace(/INSERT\s+INTO/gi, 'INSERT INTO')
        .replace(/VALUES\s+/gi, '\nVALUES ')
        .replace(/UPDATE\s+/gi, 'UPDATE ')
        .replace(/SET\s+/gi, '\nSET ')
        .replace(/DELETE\s+FROM/gi, 'DELETE FROM')
        .replace(/CREATE\s+TABLE/gi, 'CREATE TABLE')
        .trim();

      // Add sample tables header
      const header = `-- 📊 SAMPLE TABLES:
-- Employees (Id, Name, Salary, DepartmentId)
-- Departments (Id, Name)
-- Sales (SaleDate, Sales)
-- Numbers (Number)
-- Users (Id, Email)
-- StudentScores (Student, Score)

`;
      return header + formatted;
    }

    if (language === 'javascript') {
      // Format JavaScript with proper indentation
      let formatted = code
        .replace(/;\s*(?=\w)/g, ';\n')
        .replace(/}\s*else\s*{/g, '} else {')
        .replace(/{\s*/g, ' {\n  ')
        .replace(/}\s*(?!$|;|,|\))/g, '\n}')
        .replace(/\n\s+\n/g, '\n')
        .trim();

      // Fix indentation
      const lines = formatted.split('\n');
      let indentLevel = 0;
      formatted = lines.map(line => {
        line = line.trim();
        if (line.startsWith('}')) indentLevel--;
        const indented = '  '.repeat(Math.max(0, indentLevel)) + line;
        if (line.endsWith('{')) indentLevel++;
        return indented;
      }).join('\n');

      return formatted;
    }

    if (language === 'csharp') {
      // Format C# code with proper braces and indentation
      let formatted = code
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/;\s*}/g, ';\n}')
        .replace(/;\s*(?=[^}])/g, ';\n  ')
        .replace(/}\s*(?!$)/g, '}\n')
        .replace(/\n\s+\n/g, '\n'); // Remove extra blank lines

      // Add using statements if missing
      if (!formatted.includes('using System')) {
        formatted = `using System;
using System.Collections.Generic;
using System.Linq;

${formatted}`;
      }
      return formatted;
    }

    return code;
  }

  /**
   * Get default starter code for each language
   */
  _getDefaultStarter(language) {
    switch (language) {
      case 'csharp':
        return `using System;
using System.Collections.Generic;
using System.Linq;

// Complete this challenge
public class Solution
{
    public static void Main()
    {
        // TODO: Write your solution here
        Console.WriteLine("Hello World");
    }
}`;

      case 'sql':
        return `-- 📊 SAMPLE TABLES AVAILABLE:
-- Employees (Id, Name, Salary, DepartmentId)
-- Departments (Id, Name)
-- Sales (SaleDate, Sales)
-- Numbers (Number)
-- Users (Id, Email)
-- StudentScores (Student, Score)
-- ═════════════════════════════════════

-- Write your SQL query here
SELECT * FROM Employees LIMIT 5;`;

      case 'javascript':
        return `// Write your solution here

function solve() {
    // TODO: Implement your solution
    return null;
}

// Example usage:
console.log(solve());`;

      default:
        return `// Write your code here
console.log("Hello World");`;
    }
  }

  /**
   * Attach run button to problem
   */
  _attachRunButton(problem, problemId, language) {
    const runBtn = problem.querySelector('.run-code-btn');
    if (!runBtn) return;

    runBtn.addEventListener('click', () => {
      this.runCode(problemId, language);
    });
  }

  /**
   * Attach clear button to output console
   */
  _attachClearButton(problem, problemId) {
    const clearBtn = problem.querySelector('.clear-output-btn');
    if (!clearBtn) return;

    clearBtn.addEventListener('click', () => {
      const output = problem.querySelector('.output-console');
      if (output) {
        output.style.display = 'none';
        output.querySelector('.console-content').innerHTML = '';
      }
    });
  }

  /**
   * Run code in an editor
   */
  async runCode(problemId, language) {
    const editor = this.editors[problemId];
    if (!editor) return;

    const problem = document.getElementById(problemId);
    const runBtn = problem.querySelector('.run-code-btn');
    const output = problem.querySelector('.output-console');
    const outputContent = output.querySelector('.console-content');

    // Show loading state
    runBtn.disabled = true;
    runBtn.innerHTML = '⏳ Running...';
    output.style.display = 'block';
    outputContent.innerHTML = '<div class="console-line loading">Executing code...</div>';

    try {
      const code = editor.getValue();
      // Pass problemId so executor can determine which mock output to show
      const result = await this.executor.execute(code, language, '', problemId);

      // Format and display output with proper whitespace preservation
      if (result.success && result.output) {
        outputContent.innerHTML = `<pre class="console-line success">${this._escapeHtml(result.output)}</pre>`;
      } else if (result.error) {
        outputContent.innerHTML = `<pre class="console-line error">${this._escapeHtml(result.error)}</pre>`;
      } else {
        outputContent.innerHTML = `<div class="console-line info">Execution completed (no output)</div>`;
      }

      // Add execution time if available
      if (result.duration) {
        outputContent.innerHTML += `<div class="console-meta">⏱️ ${this.executor.getTimeString(result.duration)}</div>`;
      }

    } catch (err) {
      outputContent.innerHTML = `<pre class="console-line error">Error: ${this._escapeHtml(err.message)}</pre>`;
    } finally {
      runBtn.disabled = false;
      runBtn.innerHTML = '▶ Run';
    }
  }

  /**
   * Apply current theme to Monaco
   */
  _applyThemeToMonaco() {
    if (!window.monaco) return;

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const theme = isDarkMode ? 'vs-dark' : 'vs';

    Object.values(this.editors).forEach(editor => {
      window.monaco.editor.setTheme(theme);
    });
  }

  /**
   * Watch for theme changes and update Monaco
   */
  _watchThemeChanges() {
    const observer = new MutationObserver(() => {
      this._applyThemeToMonaco();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Configure Judge0 API key
   */
  setApiKey(key) {
    this.executor.setApiKey(key);
  }

  /**
   * Check if API is configured
   */
  isApiConfigured() {
    return this.executor.isConfigured();
  }
}

// Global instance
let monacoRunner = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  monacoRunner = new MonacoRunner();

  // Only initialize on interview-coding.html page
  if (window.location.pathname.includes('interview-coding')) {
    await monacoRunner.initializeEditors();

    // Show config prompt if API not configured
    if (!monacoRunner.isApiConfigured()) {
      showApiKeyPrompt();
    }
  }
});

/**
 * Show prompt for Judge0 API key configuration
 */
function showApiKeyPrompt() {
  const banner = document.createElement('div');
  banner.id = 'api-key-banner';
  banner.innerHTML = `
    <div style="background: var(--warning); color: white; padding: var(--sp-4); border-radius: var(--r-lg); margin: var(--sp-4); display: flex; align-items: center; justify-content: space-between;">
      <div>
        <strong>⚙️ Setup Required:</strong> Add your Judge0 API key to run code examples.
        <a href="https://rapidapi.com/judge0-official/api/judge0" target="_blank" style="color: white; text-decoration: underline;">Get free API key →</a>
      </div>
      <button onclick="configureApiKey()" style="padding: var(--sp-2) var(--sp-4); background: white; color: var(--warning); border: none; border-radius: var(--r-md); cursor: pointer; font-weight: bold;">Configure</button>
    </div>
  `;

  const firstProblem = document.querySelector('.problem-container');
  if (firstProblem) {
    firstProblem.parentNode.insertBefore(banner, firstProblem);
  }
}

/**
 * Show input dialog for API key
 */
function configureApiKey() {
  const key = prompt('Enter your Judge0 RapidAPI key:', localStorage.getItem('judge0-api-key') || '');
  if (key) {
    monacoRunner.setApiKey(key);
    document.getElementById('api-key-banner')?.remove();
    alert('✅ API key saved! Try running a code example.');
  }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MonacoRunner;
}

# Interactive Code Execution Setup Guide

## What's implemented

Your coding challenges are now interactive! Each of the 25 problems now has:
- ✅ Monaco Editor (full IDE experience with syntax highlighting, autocomplete)
- ✅ Run button to execute code with Judge0
- ✅ Output console to display results/errors
- ✅ Copy button to copy code
- ✅ Dark/light mode support

## How to use

### 1. Get Judge0 API Key (Free)
- Visit: https://rapidapi.com/judge0-official/api/judge0
- Sign up (free account, 1 minute)
- Copy your API key
- On interview-coding.html, a banner will prompt you to enter it
- Or use console: `configureApiKey()` and paste your key

### 2. Run a Challenge
- Open: `file:///D:/dotnet-fullStack/docs/interview-coding.html`
- Click on any problem (e.g., C# Problem 1)
- See Monaco editor with starter code
- Click "▶ Run" button
- View output in the console below

### 3. Edit & Test
- Modify the code in the editor
- Press Ctrl+Enter or click Run
- See results instantly
- Try breaking the code to see error messages

## Architecture

### Files Created
1. **js/executor.js** - Judge0 API wrapper
   - Handles code submission and result polling
   - Supports: C#, JavaScript, SQL, Python
   - Error handling and timeouts

2. **js/code-runner.js** - Monaco initialization & UI
   - Loads Monaco Editor from CDN (on-demand)
   - Initializes one editor per problem
   - Manages Run button, Copy, Clear buttons
   - Handles theme switching

### Files Modified
1. **css/main.css** - Added 150+ lines of styling
   - `.code-editor-wrapper` - container styling
   - `.editor-header` - buttons and badges
   - `.run-code-btn` - primary CTA button
   - `.output-console` - results display
   - `.console-*` - success/error/info styling
   - Responsive design for mobile

2. **interview-coding.html** - All 25 problems transformed
   - Each problem wrapped in `.problem-container`
   - Monaco editor div added for each problem
   - Output console added below editor
   - Solution reference wrapped in `<details>` tag
   - Scripts loaded: executor.js, code-runner.js

## Test Checklist

- [ ] Open interview-coding.html in browser
- [ ] See configuration banner (or click Configure button)
- [ ] Enter Judge0 API key
- [ ] Scroll to first C# problem
- [ ] See Monaco editor with code
- [ ] Click Run button
- [ ] See output in console
- [ ] Edit code and click Run again
- [ ] Test Clear button
- [ ] Test Copy button
- [ ] Switch to dark mode (🌙 button)
- [ ] Editor updates theme
- [ ] Test JavaScript problem
- [ ] Test SQL problem
- [ ] Test Algorithm problem
- [ ] Try invalid code (see error)

## API Rate Limits

Judge0 Free Tier: 100 requests/day
- Each "Run" = 1 request
- 100 students running 1 challenge per day = max usage
- For more: upgrade RapidAPI plan

## Keyboard Shortcuts

Inside any Monaco editor:
- **Ctrl+Enter** - Run code
- **Ctrl+K** - Search (global, opens search modal)
- **Ctrl+/** - Toggle comment
- **Tab** - Indent
- **Shift+Tab** - Unindent

## Troubleshooting

### "API not configured" message
→ Solution: Get free API key from RapidAPI, enter in banner

### "API key is not valid"
→ Solution: Double-check key copied correctly from RapidAPI dashboard

### Code runs but no output
→ Solution: Your code may not have a Console.WriteLine() (C#) or console.log() (JS)
→ Add output: `Console.WriteLine("Result: " + answer);`

### "Timeout" error
→ Solution: Your code took >30 seconds. Check for infinite loops

### Editor not showing
→ Solution: Monaco may be loading. Wait 5 seconds, refresh page

### Dark mode not working in editor
→ Solution: Click theme toggle (🌙) to sync

## Next Steps

1. Share link: https://amanfullstack.github.io/dotnet-fullStack/docs/interview-coding.html
2. Students get API key (free, 1 min setup)
3. They click Run and practice live
4. See real output and errors
5. Learn from instant feedback

## Technical Details

Judge0 Language IDs Used:
- C# = 51 (Mono/.NET 7)
- JavaScript = 63 (Node.js 16)
- SQL = 9 (MySQL)
- Python = 71 (Python 3)

Monaco Editor Features:
- Syntax highlighting (all languages)
- Line numbers
- Code formatting
- Bracket matching
- Minimap (disabled for mobile)
- Auto-layout responsive
- 14px Fira Code font

## Known Limitations

1. SQL: Uses MySQL dialect (not pure SQL Server T-SQL)
   - Most standard SQL works fine
   - Some advanced features not supported

2. C#: Limited to .NET 7 sandbox
   - No file I/O, network access, or system calls
   - Perfect for algorithm problems

3. Judge0 rate limit: 100/day on free tier
   - Not an issue for learning
   - Classes/groups should use own API key

## Support

If issues arise:
1. Check API key configured correctly
2. Try different problem to verify setup works
3. Check Judge0 status: https://rapidapi.com/judge0-official/api/judge0
4. Refresh page if editor doesn't load

#!/usr/bin/env python3
"""Update all HTML files with new sidebar sections for MVC, Angular, React topics"""

import os
import glob

NEW_SECTIONS = '''      </div>

      <!-- MVC Topics -->
      <div class="sidebar-section">
        <h3 class="sidebar-category">🖥️ MVC Topics</h3>
        <ul class="sidebar-links">
          <li><a href="mvc.html" class="sidebar-link"><span class="sidebar-link-icon">📘</span> MVC Overview</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">🎮</span> Controllers & Actions</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">👁️</span> Views & Razor</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">📦</span> Models & Validation</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">💼</span> Services & HttpClient</a></li>
        </ul>
      </div>

      <!-- Angular Topics -->
      <div class="sidebar-section">
        <h3 class="sidebar-category">🔺 Angular Topics</h3>
        <ul class="sidebar-links">
          <li><a href="angular.html" class="sidebar-link"><span class="sidebar-link-icon">📗</span> Angular Overview</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">📦</span> Components & Templates</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">💼</span> Services & DI</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">〰️</span> RxJS & Observables</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">📋</span> Reactive Forms</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">🗺️</span> Router & Navigation</a></li>
        </ul>
      </div>

      <!-- React Topics -->
      <div class="sidebar-section">
        <h3 class="sidebar-category">⚛️ React Topics</h3>
        <ul class="sidebar-links">
          <li><a href="react.html" class="sidebar-link"><span class="sidebar-link-icon">📙</span> React Overview</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">🎣</span> Hooks & State</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">🔄</span> Custom Hooks</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">🌍</span> Context API</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">📋</span> Forms & Validation</a></li>
          <li><a href="#" class="sidebar-link"><span class="sidebar-link-icon">🗺️</span> React Router</a></li>
        </ul>
      </div>

      <!-- Data Access -->'''

os.chdir('d:/dotnet-fullStack/docs')

# Get all HTML files except the ones we just created
files = [f for f in glob.glob('*.html') if f not in ['mvc.html', 'mvc-setup.html', 'angular.html', 'angular-setup.html', 'react.html', 'react-setup.html', 'compiler.html']]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has new sections
    if '🖥️ MVC Topics' in content:
        print(f"✓ {filepath} already updated")
        continue

    # Find and replace the insertion point (before "<!-- Data Access -->")
    if '<!-- Data Access -->' in content:
        content = content.replace('      </div>\n\n      <!-- Data Access -->', NEW_SECTIONS)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Updated {filepath}")
    else:
        print(f"⚠ {filepath} - no insertion point found")

print("\nDone! All sidebars updated.")

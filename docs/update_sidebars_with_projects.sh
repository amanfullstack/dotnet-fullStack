#!/bin/bash

# Update sidebar in all HTML files to include MVC, Angular, React Topics sections

SIDEBAR_SECTIONS='      </div>

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
      </div>'

cd "d:/dotnet-fullStack/docs"

# Find all HTML files except index.html
for file in *.html; do
  # Skip if it's index.html or already has the new sections
  if [[ "$file" != "index.html" ]] && ! grep -q "🖥️ MVC Topics" "$file"; then
    echo "Updating $file..."
    # Insert before "<!-- Data Access -->"
    sed -i "s|^\([[:space:]]*\)<!-- Data Access -->|\
$SIDEBAR_SECTIONS\
\n\n      <!-- Data Access -->|" "$file"
  fi
done

echo "Done updating sidebars!"

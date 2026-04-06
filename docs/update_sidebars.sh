#!/bin/bash

# Update all HTML files' sidebars
# Change MVC, Angular, React from "Coming Soon" to "✨" and add proper links

for file in *.html; do
  echo "Updating: $file"
  
  # Replace MVC link and badge
  sed -i 's|<li>\s*<a href="#" class="sidebar-link"><span class="sidebar-link-icon">🖥️<\/span> MVC\s*<span class="badge badge-soon">Coming Soon<\/span><\/a>\s*<\/li>|<li><a href="mvc.html" class="sidebar-link"><span class="sidebar-link-icon">🖥️</span> MVC <span class="badge badge-done">✨</span></a></li>|g' "$file"
  
  # Replace Angular link and badge  
  sed -i 's|<li>\s*<a href="#" class="sidebar-link"><span class="sidebar-link-icon">🔺<\/span> Angular\s*<span class="badge badge-soon">Coming Soon<\/span><\/a>\s*<\/li>|<li><a href="angular.html" class="sidebar-link"><span class="sidebar-link-icon">🔺</span> Angular <span class="badge badge-done">✨</span></a></li>|g' "$file"
  
  # Replace React link and badge
  sed -i 's|<li>\s*<a href="#" class="sidebar-link"><span class="sidebar-link-icon">⚛️<\/span> React\s*<span class="badge badge-soon">Coming Soon<\/span><\/a>\s*<\/li>|<li><a href="react.html" class="sidebar-link"><span class="sidebar-link-icon">⚛️</span> React <span class="badge badge-done">✨</span></a></li>|g' "$file"
done

echo "All files updated!"

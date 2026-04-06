#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Sidebar structure with collapsible projects
const newSidebarStructure = `      <!-- Home -->
      <div class="sidebar-section">
        <ul class="sidebar-links">
          <li>
            <a href="index.html" class="sidebar-link">
              <span class="sidebar-link-icon">🏠</span> Home
            </a>
          </li>
        </ul>
      </div>

      <!-- Projects -->
      <div class="sidebar-section" style="margin-bottom: var(--sp-4);">
        <h3 class="sidebar-category" style="margin-bottom: var(--sp-2);">📦 Projects</h3>

        <!-- Web API Project -->
        <div class="sidebar-project">
          <div class="sidebar-project-header" data-project="webapi">
            <span class="toggle-icon">▼</span>
            <span class="sidebar-link-icon">🌐</span> Web API
            <span class="badge badge-done" style="margin-left: auto; margin-right: 0;">✨</span>
          </div>
          <div class="sidebar-project-topics">
            <div class="sidebar-project-topic">
              <a href="webapi-architecture.html" class="sidebar-link"><span style="margin-right: 4px;">🏗️</span> Architecture</a>
            </div>
            <div class="sidebar-project-topic">
              <a href="webapi-controllers.html" class="sidebar-link"><span style="margin-right: 4px;">🎮</span> Controllers &amp; REST</a>
            </div>
            <div class="sidebar-project-topic">
              <a href="webapi-models.html" class="sidebar-link"><span style="margin-right: 4px;">📦</span> Models &amp; DTOs</a>
            </div>
            <div class="sidebar-project-topic">
              <a href="webapi-di.html" class="sidebar-link"><span style="margin-right: 4px;">💉</span> Dependency Injection</a>
            </div>
            <div class="sidebar-project-topic">
              <a href="webapi-middleware.html" class="sidebar-link"><span style="margin-right: 4px;">⚙️</span> Middleware</a>
            </div>
            <div class="sidebar-project-topic">
              <a href="webapi-caching.html" class="sidebar-link"><span style="margin-right: 4px;">⚡</span> Caching Strategies</a>
            </div>
            <div class="sidebar-project-topic">
              <a href="webapi-error-handling.html" class="sidebar-link"><span style="margin-right: 4px;">🚨</span> Error Handling</a>
            </div>
            <div class="sidebar-project-topic">
              <a href="webapi-graphql.html" class="sidebar-link"><span style="margin-right: 4px;">🌐</span> GraphQL</a>
            </div>
          </div>
        </div>

        <!-- MVC Project -->
        <div class="sidebar-project">
          <div class="sidebar-project-header" data-project="mvc">
            <span class="toggle-icon">▼</span>
            <span class="sidebar-link-icon">🖥️</span> MVC
            <span class="badge badge-done" style="margin-left: auto; margin-right: 0;">✨</span>
          </div>
          <div class="sidebar-project-topics">
            <div class="sidebar-project-topic">
              <a href="mvc.html" class="sidebar-link"><span style="margin-right: 4px;">📘</span> Overview</a>
            </div>
            <div class="sidebar-project-topic">
              <a href="mvc-setup.html" class="sidebar-link"><span style="margin-right: 4px;">⚙️</span> Setup &amp; Install</a>
            </div>
          </div>
        </div>

        <!-- Angular Project -->
        <div class="sidebar-project">
          <div class="sidebar-project-header" data-project="angular">
            <span class="toggle-icon">▼</span>
            <span class="sidebar-link-icon">🔺</span> Angular
            <span class="badge badge-done" style="margin-left: auto; margin-right: 0;">✨</span>
          </div>
          <div class="sidebar-project-topics">
            <div class="sidebar-project-topic">
              <a href="angular.html" class="sidebar-link"><span style="margin-right: 4px;">📗</span> Overview</a>
            </div>
            <div class="sidebar-project-topic">
              <a href="angular-setup.html" class="sidebar-link"><span style="margin-right: 4px;">⚙️</span> Setup &amp; Install</a>
            </div>
          </div>
        </div>

        <!-- React Project -->
        <div class="sidebar-project">
          <div class="sidebar-project-header" data-project="react">
            <span class="toggle-icon">▼</span>
            <span class="sidebar-link-icon">⚛️</span> React
            <span class="badge badge-done" style="margin-left: auto; margin-right: 0;">✨</span>
          </div>
          <div class="sidebar-project-topics">
            <div class="sidebar-project-topic">
              <a href="react.html" class="sidebar-link"><span style="margin-right: 4px;">📙</span> Overview</a>
            </div>
            <div class="sidebar-project-topic">
              <a href="react-setup.html" class="sidebar-link"><span style="margin-right: 4px;">⚙️</span> Setup &amp; Install</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Access -->
      <div class="sidebar-section">
        <h3 class="sidebar-category">🟢 Data Access</h3>
        <ul class="sidebar-links">
          <li><a href="ef-core.html" class="sidebar-link"><span style="margin-right: 4px;">🗄️</span> Entity Framework Core</a></li>
          <li><a href="ado-net.html" class="sidebar-link"><span style="margin-right: 4px;">💾</span> ADO.NET</a></li>
          <li><a href="linq.html" class="sidebar-link"><span style="margin-right: 4px;">🔗</span> LINQ &amp; Filtering</a></li>
          <li><a href="collections.html" class="sidebar-link"><span style="margin-right: 4px;">📊</span> Collections</a></li>
        </ul>
      </div>

      <!-- Interview Prep -->
      <div class="sidebar-section">
        <h3 class="sidebar-category">🎓 Interview Prep</h3>
        <ul class="sidebar-links">
          <li><a href="interview.html" class="sidebar-link"><span style="margin-right: 4px;">💡</span> All Questions</a></li>
          <li><a href="interview-solid.html" class="sidebar-link"><span style="margin-right: 4px;">📐</span> SOLID Principles</a></li>
          <li><a href="interview-patterns.html" class="sidebar-link"><span style="margin-right: 4px;">🎨</span> Design Patterns</a></li>
          <li><a href="interview-mvc-extended.html" class="sidebar-link"><span style="margin-right: 4px;">🖥️</span> ASP.NET MVC</a></li>
          <li><a href="interview-angular-extended.html" class="sidebar-link"><span style="margin-right: 4px;">🔺</span> Angular</a></li>
          <li><a href="interview-react-extended.html" class="sidebar-link"><span style="margin-right: 4px;">⚛️</span> React</a></li>
        </ul>
      </div>

      <!-- Tools -->
      <div class="sidebar-section">
        <h3 class="sidebar-category">🛠️ Tools</h3>
        <ul class="sidebar-links">
          <li><a href="compiler.html" class="sidebar-link"><span style="margin-right: 4px;">🚀</span> Interactive Compiler</a></li>
        </ul>
      </div>`;

// Determine which project page we're on
function getProjectFromPagePath(filePath) {
  const fileName = path.basename(filePath);
  if (fileName.includes('mvc')) return 'mvc';
  if (fileName.includes('angular')) return 'angular';
  if (fileName.includes('react')) return 'react';
  if (fileName.includes('webapi') || fileName.includes('ef-core') || fileName.includes('ado-net') || fileName.includes('linq') || fileName.includes('collections') || fileName.includes('csharp')) return 'webapi';
  return null;
}

// Update all HTML files
const docsDir = 'd:/dotnet-fullStack/docs';
const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.html'));

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(docsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Find and replace the sidebar-inner content
  const sidebarMatch = content.match(/<aside class="sidebar"[^>]*>[\s\S]*?<div class="sidebar-inner">([\s\S]*?)<\/div>\s*<\/aside>/);

  if (!sidebarMatch) {
    console.log('⚠', file, '- no sidebar found');
    skipped++;
    return;
  }

  // Replace the old sidebar structure with new one
  const currentProject = getProjectFromPagePath(file);
  let updatedContent = newSidebarStructure;

  // Add active classes based on current page
  if (currentProject) {
    updatedContent = updatedContent.replace(
      new RegExp(`data-project="${currentProject}"`),
      `data-project="${currentProject}" style="font-weight: 700; color: var(--primary);"`
    );

    // Mark current page link as active
    if (currentProject === 'webapi') {
      updatedContent = updatedContent.replace(
        `href="${file}"`,
        `href="${file}" class="sidebar-link active"`
      );
    } else if (currentProject === 'mvc' && file.includes('mvc')) {
      updatedContent = updatedContent.replace(
        `href="mvc.html"`,
        `href="mvc.html" class="sidebar-link active"`
      );
    } else if (currentProject === 'angular' && file.includes('angular')) {
      updatedContent = updatedContent.replace(
        `href="angular.html"`,
        `href="angular.html" class="sidebar-link active"`
      );
    } else if (currentProject === 'react' && file.includes('react')) {
      updatedContent = updatedContent.replace(
        `href="react.html"`,
        `href="react.html" class="sidebar-link active"`
      );
    }
  }

  // Mark home as active if it's index.html
  if (file === 'index.html') {
    updatedContent = updatedContent.replace(
      `href="index.html"`,
      `href="index.html" class="sidebar-link active"`
    );
  }

  // Replace in full document
  content = content.replace(
    /<aside class="sidebar"[^>]*>[\s\S]*?<div class="sidebar-inner">[\s\S]*?<\/div>\s*<\/aside>/,
    `<aside class="sidebar" id="sidebar">
    <div class="sidebar-inner">
${updatedContent}
    </div>
  </aside>`
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✓', file, 'updated');
  updated++;
});

console.log(`\n✓ Updated ${updated} files, skipped ${skipped}`);

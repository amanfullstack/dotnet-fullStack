#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// New sidebar structure with tabs
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

      <!-- Project Tabs (Modern Tab Navigation) -->
      <div class="project-tabs-section">
        <div class="project-tabs">
          <button class="project-tab active" data-project="webapi" title="Web API topics">
            <span class="project-tab-icon">🌐</span> Web API
          </button>
          <button class="project-tab" data-project="mvc" title="MVC topics">
            <span class="project-tab-icon">🖥️</span> MVC
          </button>
          <button class="project-tab" data-project="angular" title="Angular topics">
            <span class="project-tab-icon">🔺</span> Angular
          </button>
          <button class="project-tab" data-project="react" title="React topics">
            <span class="project-tab-icon">⚛️</span> React
          </button>
        </div>

        <!-- Web API Topics -->
        <div class="project-topics-list" data-topics="webapi" style="display: flex;">
          <a href="webapi-architecture.html" class="sidebar-link"><span style="margin-right: 4px;">🏗️</span> Architecture</a>
          <a href="webapi-controllers.html" class="sidebar-link"><span style="margin-right: 4px;">🎮</span> Controllers &amp; REST</a>
          <a href="webapi-models.html" class="sidebar-link"><span style="margin-right: 4px;">📦</span> Models &amp; DTOs</a>
          <a href="webapi-di.html" class="sidebar-link"><span style="margin-right: 4px;">💉</span> Dependency Injection</a>
          <a href="webapi-middleware.html" class="sidebar-link"><span style="margin-right: 4px;">⚙️</span> Middleware</a>
          <a href="webapi-caching.html" class="sidebar-link"><span style="margin-right: 4px;">⚡</span> Caching Strategies</a>
          <a href="webapi-error-handling.html" class="sidebar-link"><span style="margin-right: 4px;">🚨</span> Error Handling</a>
          <a href="webapi-graphql.html" class="sidebar-link"><span style="margin-right: 4px;">🌐</span> GraphQL</a>
        </div>

        <!-- MVC Topics -->
        <div class="project-topics-list" data-topics="mvc" style="display: none;">
          <a href="mvc.html" class="sidebar-link"><span style="margin-right: 4px;">📘</span> Overview</a>
          <a href="mvc-setup.html" class="sidebar-link"><span style="margin-right: 4px;">⚙️</span> Setup &amp; Install</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">🎮</span> Controllers &amp; Actions</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">👁️</span> Views &amp; Razor</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">📦</span> Models &amp; Validation</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">💼</span> Services &amp; HttpClient</a>
        </div>

        <!-- Angular Topics -->
        <div class="project-topics-list" data-topics="angular" style="display: none;">
          <a href="angular.html" class="sidebar-link"><span style="margin-right: 4px;">📗</span> Overview</a>
          <a href="angular-setup.html" class="sidebar-link"><span style="margin-right: 4px;">⚙️</span> Setup &amp; Install</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">📦</span> Components &amp; Templates</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">💼</span> Services &amp; DI</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">〰️</span> RxJS &amp; Observables</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">📋</span> Reactive Forms</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">🗺️</span> Router &amp; Navigation</a>
        </div>

        <!-- React Topics -->
        <div class="project-topics-list" data-topics="react" style="display: none;">
          <a href="react.html" class="sidebar-link"><span style="margin-right: 4px;">📙</span> Overview</a>
          <a href="react-setup.html" class="sidebar-link"><span style="margin-right: 4px;">⚙️</span> Setup &amp; Install</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">🎣</span> Hooks &amp; State</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">🔄</span> Custom Hooks</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">🌍</span> Context API</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">📋</span> Forms &amp; Validation</a>
          <a href="#" class="sidebar-link"><span style="margin-right: 4px;">🗺️</span> React Router</a>
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
  return 'webapi';
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

  // Determine which project tab should be active
  const currentProject = getProjectFromPagePath(file);
  let updatedContent = newSidebarStructure;

  // Make correct tab active based on current page
  updatedContent = updatedContent.replace(
    `<button class="project-tab active" data-project="webapi"`,
    currentProject === 'webapi' ?
      `<button class="project-tab active" data-project="webapi"` :
      `<button class="project-tab" data-project="webapi"`
  );

  updatedContent = updatedContent.replace(
    `<button class="project-tab" data-project="mvc"`,
    currentProject === 'mvc' ?
      `<button class="project-tab active" data-project="mvc"` :
      `<button class="project-tab" data-project="mvc"`
  );

  updatedContent = updatedContent.replace(
    `<button class="project-tab" data-project="angular"`,
    currentProject === 'angular' ?
      `<button class="project-tab active" data-project="angular"` :
      `<button class="project-tab" data-project="angular"`
  );

  updatedContent = updatedContent.replace(
    `<button class="project-tab" data-project="react"`,
    currentProject === 'react' ?
      `<button class="project-tab active" data-project="react"` :
      `<button class="project-tab" data-project="react"`
  );

  // Set correct topics list to display
  if (currentProject === 'webapi') {
    updatedContent = updatedContent.replace(
      `<div class="project-topics-list" data-topics="webapi" style="display: flex;">`,
      `<div class="project-topics-list" data-topics="webapi" style="display: flex;">`
    );
  } else {
    updatedContent = updatedContent.replace(
      `<div class="project-topics-list" data-topics="webapi" style="display: flex;">`,
      `<div class="project-topics-list" data-topics="webapi" style="display: none;">`
    );
  }

  if (currentProject === 'mvc') {
    updatedContent = updatedContent.replace(
      `<div class="project-topics-list" data-topics="mvc" style="display: none;">`,
      `<div class="project-topics-list" data-topics="mvc" style="display: flex;">`
    );
  }

  if (currentProject === 'angular') {
    updatedContent = updatedContent.replace(
      `<div class="project-topics-list" data-topics="angular" style="display: none;">`,
      `<div class="project-topics-list" data-topics="angular" style="display: flex;">`
    );
  }

  if (currentProject === 'react') {
    updatedContent = updatedContent.replace(
      `<div class="project-topics-list" data-topics="react" style="display: none;">`,
      `<div class="project-topics-list" data-topics="react" style="display: flex;">`
    );
  }

  // Mark active links in current project topics
  if (file === 'index.html') {
    updatedContent = updatedContent.replace(
      `<a href="index.html" class="sidebar-link">`,
      `<a href="index.html" class="sidebar-link active">`
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
  console.log('✓', file);
  updated++;
});

console.log(`\n✓ Updated ${updated} files, skipped ${skipped}`);

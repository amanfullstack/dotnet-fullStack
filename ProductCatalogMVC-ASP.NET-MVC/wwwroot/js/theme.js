// Theme Toggle Script
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themIcon');

    // Initialize theme on page load
    const savedTheme = localStorage.getItem('docsTheme') || 'light';
    setTheme(savedTheme);

    // Theme toggle button click
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        // Update HTML attribute
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);

        // Update icon
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }

        // Save preference
        localStorage.setItem('docsTheme', theme);

        // Update Bootstrap theme (if using Bootstrap color modes)
        if (theme === 'dark') {
            document.body.removeAttribute('data-bs-theme');
            document.body.setAttribute('data-bs-theme', 'dark');
        } else {
            document.body.removeAttribute('data-bs-theme');
        }
    }
});

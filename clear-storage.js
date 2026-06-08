// Copy and paste this into your browser console (F12 → Console tab):

// Clear all CSP localStorage data
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('csp.')) {
    localStorage.removeItem(key);
  }
});

// Reload the page
location.reload();

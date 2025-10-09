// Cleanup on page unload to prevent lingering listeners
window.addEventListener('beforeunload', () => {
  // Import and call cleanup function
  import('./utils/firebaseSnippets').then(({ cleanupAllListeners }) => {
    cleanupAllListeners();
  });
});

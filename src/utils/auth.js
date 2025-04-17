export const handleLoginRedirect = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store the token in localStorage or your preferred storage
      localStorage.setItem('token', token);
      
      // Remove the token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Redirect to home page
      window.location.href = '/';
    }
  };

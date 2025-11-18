import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const ThemeProvider = ({ children }) => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return children;
};

export default ThemeProvider;
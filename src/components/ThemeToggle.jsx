import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg glass-effect hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-300"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MdDarkMode className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <MdLightMode className="w-5 h-5 text-yellow-500" />
      )}
    </button>
  );
};

export default ThemeToggle;

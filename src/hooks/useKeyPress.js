import { useEffect } from 'react';

export default function useKeyPress(targetKey, callback) {
  useEffect(() => {
    function handleKeyPress(event) {
      if (event.key === targetKey) {
        callback(event);
      }
    }

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [targetKey, callback]);
}

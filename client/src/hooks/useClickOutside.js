import { useEffect } from 'react';

/**
 * Custom hook to handle clicks outside specified element(s).
 * @param {React.RefObject | React.RefObject[]} ref - Ref or array of refs to monitor
 * @param {Function} handler - Callback to invoke when a click outside occurs
 */
export default function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      const refs = Array.isArray(ref) ? ref : [ref];
      const isOutside = refs.every(
        (r) => !r.current || !r.current.contains(event.target)
      );

      if (isOutside) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

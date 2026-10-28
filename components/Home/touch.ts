import { useEffect, useState } from 'react';

/**
 * Whether the screen is touched rather than pointed at: it can't hover. A
 * phone, or a tablet with no mouse. There, what a pointer would hover, a tap
 * opens; and what buttons would step through, a swipe does.
 */
const TOUCH = '(hover: none)';

export const useTouch = () => {
  const [touch, setTouch] = useState(() => window.matchMedia(TOUCH).matches);
  useEffect(() => {
    const query = window.matchMedia(TOUCH);
    const onChange = () => setTouch(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return touch;
};

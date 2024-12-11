import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

export const sanitizeText = (text: string) => {
  const { window } = new JSDOM('');
  const domPurify = DOMPurify(window);

  return domPurify.sanitize(text);
};

import { ReactElement, useEffect, useRef } from 'react';

export default function Comments(): ReactElement {
  const commentsSection = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('repo', 'rafaelcastan/Challenge01-Chapter03');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'Comentários');
    script.setAttribute('theme', 'github-dark');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');

    commentsSection.current.appendChild(script);
  }, []);

  return <div ref={commentsSection} />;
}

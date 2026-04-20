'use client';
import { useEffect, useState } from 'react';

export default function RoadmapGamifier({ slug, children }) {
  const [progress, setProgress] = useState(0);
  const [hideAdvanced, setHideAdvanced] = useState(false);

  useEffect(() => {
    const storageKey = 'skillbun_progress_' + slug;
    let savedProgress = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) savedProgress = JSON.parse(raw);
    } catch(e) {}

    const checkboxes = document.querySelectorAll('.topic-checkbox');

    const updateProgressUI = () => {
      let total = 0;
      let checked = 0;

      checkboxes.forEach(cb => {
        const isAdvanced = cb.closest('.topic-advanced');
        // If hiding advanced, don't count advanced topics
        if (!(hideAdvanced && isAdvanced)) {
          total++;
          if (cb.checked) checked++;
        }
      });

      const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
      setProgress(pct);
    };

    const handleChange = (e) => {
      const id = e.target.dataset.id;
      const card = e.target.closest('.topic-card');
      
      if (e.target.checked) {
        if(!savedProgress.includes(id)) savedProgress.push(id);
        card.classList.add('completed');
      } else {
        savedProgress = savedProgress.filter(item => item !== id);
        card.classList.remove('completed');
      }
      
      localStorage.setItem(storageKey, JSON.stringify(savedProgress));
      updateProgressUI();
    };

    checkboxes.forEach(cb => {
      if (savedProgress.includes(cb.dataset.id)) {
        cb.checked = true;
        cb.closest('.topic-card').classList.add('completed');
      }
      cb.addEventListener('change', handleChange);
    });

    updateProgressUI();

    return () => {
      checkboxes.forEach(cb => cb.removeEventListener('change', handleChange));
    };
  }, [slug, hideAdvanced]);

  useEffect(() => {
    if (hideAdvanced) {
      document.body.classList.add('hide-advanced');
    } else {
      document.body.classList.remove('hide-advanced');
    }
  }, [hideAdvanced]);

  return (
    <>
      <div className="progress-container">
        <div className="progress-label" id="progress-text">Progress: {progress}%</div>
        <div className="progress-track">
            <div className="progress-fill" id="progress-fill" style={{ width: \`\${progress}%\` }}></div>
        </div>
        <div className="roadmap-controls">
            <button 
              className={\`btn-toggle-advanced \${hideAdvanced ? 'active' : ''}\`} 
              onClick={() => setHideAdvanced(!hideAdvanced)}
            >
              {hideAdvanced ? "Show Advanced" : "Hide Advanced"}
            </button>
        </div>
      </div>
      <main id="main-content">
        {children}
      </main>
    </>
  );
}

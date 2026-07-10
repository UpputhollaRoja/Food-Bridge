'use client';

import { useEffect } from 'react';

export default function ClientScrollAnimations() {
  useEffect(() => {
    // Bouncy micro-interactions for cards
    document.querySelectorAll('.hover-lift').forEach((card) => {
      const htmlCard = card as HTMLElement;
      htmlCard.addEventListener('mouseenter', () => {
        htmlCard.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      });
    });

    // Simple scroll observer for animations
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
      section.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}

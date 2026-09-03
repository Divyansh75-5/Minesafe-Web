import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const questions = [
  {
    question: 'What is the first action when discovering a fire in a confined workspace?',
    options: [
      'Attempt to extinguish immediately',
      'Raise alarm and evacuate personnel',
      'Open all windows for ventilation',
      'Call the supervisor only',
    ],
    correct: 1,
  },
  {
    question: 'Which extinguisher type is suitable for electrical fires?',
    options: [
      'Water-based extinguisher',
      'Foam extinguisher',
      'CO2 or dry chemical powder extinguisher',
      'Sand bucket only',
    ],
    correct: 2,
  },
  {
    question: 'What reading indicates an immediately dangerous gas concentration?',
    options: [
      'Below 10 PPM',
      '10-25 PPM',
      '25-50 PPM',
      'Above 50 PPM for toxic gases',
    ],
    correct: 3,
  },
  {
    question: 'When entering a confined space for rescue, what is mandatory?',
    options: [
      'Hold your breath briefly',
      'Self-contained breathing apparatus and buddy system',
      'Carry a flashlight only',
      'Wait for the gas to dissipate naturally',
    ],
    correct: 1,
  },
  {
    question: 'What does the PASS technique stand for in fire extinguisher use?',
    options: [
      'Pull, Aim, Squeeze, Sweep',
      'Push, Aim, Spray, Sweep',
      'Pull, Alert, Squeeze, Stop',
      'Press, Aim, Spray, Secure',
    ],
    correct: 0,
  },
];

export default function AssessmentScreen() {
  const { completeModule, state, t } = useApp();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const q = questions[currentQ];
  const isCorrect = selected === q.correct;
  const progress = ((currentQ + (answered ? 1 : 0)) / questions.length) * 100;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      completeModule(state.modules.find(m => m.status === 'in-progress')?.id || 'fire');
    }
  };

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-800 px-5 pt-6 pb-8">
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <p className="text-muted text-xs font-semibold uppercase tracking-wider">
            {t('question')} {currentQ + 1} {t('of')} {questions.length}
          </p>
          <p className="text-accent text-xs font-bold">
            {score}/{questions.length}
          </p>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill bg-gradient-to-r from-accent to-caution" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="surface-card mb-6 animate-slide-up">
        <p className="text-white font-bold text-lg leading-snug">{q.question}</p>
      </div>

      <div className="space-y-3 flex-1">
        {q.options.map((opt, idx) => {
          let style = 'bg-surface-600 border-white/[0.06] text-white';
          if (answered) {
            if (idx === q.correct) style = 'bg-safe/10 border-safe/40 text-safe';
            else if (idx === selected && !isCorrect) style = 'bg-danger/10 border-danger/40 text-danger';
            else style = 'bg-surface-600 border-white/[0.04] text-muted';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${style} ${!answered ? 'active:scale-[0.98] hover:bg-surface-500 cursor-pointer' : 'cursor-default'}`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    backgroundColor: answered && idx === q.correct ? 'rgba(34,197,94,0.2)' :
                      answered && idx === selected && !isCorrect ? 'rgba(239,68,68,0.2)' :
                      'rgba(255,255,255,0.06)',
                  }}
                >
                  {answered && idx === q.correct ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : answered && idx === selected && !isCorrect ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  ) : (
                    String.fromCharCode(65 + idx)
                  )}
                </div>
                <span className="text-sm font-medium leading-snug">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-6 animate-slide-up">
          <div className={`flex items-center gap-2 mb-3 px-1 ${isCorrect ? 'text-safe' : 'text-danger'}`}>
            {isCorrect ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
              </svg>
            )}
            <span className="text-sm font-bold">{isCorrect ? t('correct') : t('incorrect')}</span>
          </div>
          <button onClick={handleNext} className="btn-primary">
            {currentQ < questions.length - 1 ? t('nextQuestion') : 'Finish Assessment'}
          </button>
        </div>
      )}
    </div>
  );
}

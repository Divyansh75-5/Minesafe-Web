import Icon from './Icon';
import { useApp } from '../../context/AppContext';

const tabs = [
  { id: 'home', icon: 'home', labelKey: 'home' },
  { id: 'modules', icon: 'training', labelKey: 'training' },
  { id: 'certificates', icon: 'certificate', labelKey: 'certificates' },
  { id: 'profile', icon: 'profile', labelKey: 'profile' },
];

export default function BottomNav() {
  const { state, setScreen, t } = useApp();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface-800/95 backdrop-blur-lg border-t border-white/[0.06] z-50">
      <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
        {tabs.map(tab => {
          const active = state.screen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.id)}
              className={`nav-item ${active ? 'nav-item-active' : ''}`}
            >
              <Icon name={tab.icon} size={22} className={active ? 'text-accent' : ''} />
              <span className={`text-[10px] font-semibold ${active ? 'text-accent' : 'text-muted'}`}>
                {t(tab.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

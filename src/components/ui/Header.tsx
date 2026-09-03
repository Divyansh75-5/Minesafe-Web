import Icon from './Icon';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export default function Header({ title, showBack = false, rightAction, transparent = false }: HeaderProps) {
  const { setScreen } = useApp();

  return (
    <div className={`flex items-center justify-between px-5 py-4 ${transparent ? '' : 'bg-surface-800/80 backdrop-blur-sm'}`}>
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => setScreen('home')}
            className="p-2 -ml-2 rounded-xl text-subtle hover:text-white hover:bg-surface-500 transition-colors active:scale-95"
          >
            <Icon name="back" size={22} />
          </button>
        )}
        <h1 className="text-lg font-bold text-white truncate">{title}</h1>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
}

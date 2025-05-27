import React, { lazy, Suspense } from 'react';

// Icon loading fallback
const IconFallback = () => <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />;

// Lazy load icons
const iconComponents = {
  LayoutDashboard: lazy(() => import('lucide-react').then(mod => ({ default: mod.LayoutDashboard }))),
  User: lazy(() => import('lucide-react').then(mod => ({ default: mod.User }))),
  BookOpen: lazy(() => import('lucide-react').then(mod => ({ default: mod.BookOpen }))),
  LogOut: lazy(() => import('lucide-react').then(mod => ({ default: mod.LogOut }))),
  Menu: lazy(() => import('lucide-react').then(mod => ({ default: mod.Menu }))),
  X: lazy(() => import('lucide-react').then(mod => ({ default: mod.X }))),
  Star: lazy(() => import('lucide-react').then(mod => ({ default: mod.Star }))),
  CheckCircle: lazy(() => import('lucide-react').then(mod => ({ default: mod.CheckCircle }))),
  MapPin: lazy(() => import('lucide-react').then(mod => ({ default: mod.MapPin }))),
  Book: lazy(() => import('lucide-react').then(mod => ({ default: mod.Book }))),
  Search: lazy(() => import('lucide-react').then(mod => ({ default: mod.Search }))),
  ChevronDown: lazy(() => import('lucide-react').then(mod => ({ default: mod.ChevronDown }))),
  Settings: lazy(() => import('lucide-react').then(mod => ({ default: mod.Settings }))),
  AlertCircle: lazy(() => import('lucide-react').then(mod => ({ default: mod.AlertCircle }))),
  Mail: lazy(() => import('lucide-react').then(mod => ({ default: mod.Mail }))),
  Lock: lazy(() => import('lucide-react').then(mod => ({ default: mod.Lock }))),
  Chrome: lazy(() => import('lucide-react').then(mod => ({ default: mod.Chrome }))),
  Facebook: lazy(() => import('lucide-react').then(mod => ({ default: mod.Facebook }))),
  Twitter: lazy(() => import('lucide-react').then(mod => ({ default: mod.Twitter }))),
  Instagram: lazy(() => import('lucide-react').then(mod => ({ default: mod.Instagram }))),
  Phone: lazy(() => import('lucide-react').then(mod => ({ default: mod.Phone }))),
  Filter: lazy(() => import('lucide-react').then(mod => ({ default: mod.Filter }))),
  Award: lazy(() => import('lucide-react').then(mod => ({ default: mod.Award }))),
  HomeIcon: lazy(() => import('lucide-react').then(mod => ({ default: mod.Home }))),
};

type IconName = keyof typeof iconComponents;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, className = '', color }) => {
  const IconComponent = iconComponents[name];

  return (
    <Suspense fallback={<IconFallback />}>
      <IconComponent
        size={size}
        className={className}
        color={color}
      />
    </Suspense>
  );
};

export default Icon; 
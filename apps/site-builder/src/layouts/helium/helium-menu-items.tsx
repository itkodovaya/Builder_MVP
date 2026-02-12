import { routes } from '@/config/routes';
import {
  PiHouseLine,
  PiRocketLaunch,
  PiFolder,
} from 'react-icons/pi';

export interface MenuItem {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  dropdownItems?: Array<{ name: string; href: string; badge?: string }>;
}

export const menuItems: MenuItem[] = [
  {
    name: 'Панель управления',
    href: routes.dashboard,
    icon: <PiHouseLine />,
  },
  {
    name: 'Создать сайт',
    href: routes.wizard.step1,
    icon: <PiRocketLaunch />,
  },
  {
    name: 'Мои сайты',
    href: routes.dashboard,
    icon: <PiFolder />,
  },
];


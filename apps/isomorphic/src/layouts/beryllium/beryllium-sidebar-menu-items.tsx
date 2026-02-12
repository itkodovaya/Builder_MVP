import { routes } from '@/config/routes';
import {
  PiHouseLine,
  PiCodesandboxLogo,
  PiUserGear,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const berylliumSidebarMenuItems = [
  {
    name: 'Главная',
    href: routes.dashboard,
    icon: <PiHouseLine />,
  },
  {
    name: 'Конструктор',
    href: routes.frappeBuilder,
    icon: <PiCodesandboxLogo />,
  },
  {
    name: 'Аккаунт',
    href: routes.forms.profileSettings,
    icon: <PiUserGear />,
  },
];

import { routes } from '@/config/routes';
import {
  PiHouseLineDuotone,
  PiCodesandboxLogoDuotone,
  PiUserGearDuotone,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  {
    name: 'Главная',
    href: routes.dashboard,
    icon: PiHouseLineDuotone,
  },
  {
    name: 'Конструктор',
    href: routes.frappeBuilder,
    icon: PiCodesandboxLogoDuotone,
  },
  {
    name: 'Аккаунт',
    href: routes.forms.profileSettings,
    icon: PiUserGearDuotone,
  },
];

import { IconType } from 'react-icons/lib';
import { atom } from 'jotai';
import {
  PiHouse,
  PiFolder,
  PiPlus,
  PiGear,
  PiShieldCheck,
} from 'react-icons/pi';
import { routes } from '@/config/routes';

export interface SubMenuItemType {
  name: string;
  description?: string;
  href: string;
  badge?: string;
}

export interface ItemType {
  name: string;
  icon: IconType;
  href?: string;
  description?: string;
  badge?: string;
  subMenuItems?: SubMenuItemType[];
}

export interface MenuItemsType {
  id: string;
  name: string;
  title: string;
  icon: IconType;
  menuItems: ItemType[];
}

export const berylliumMenuItems: MenuItemsType[] = [
  {
    id: '1',
    name: 'Главная',
    title: 'Обзор',
    icon: PiHouse,
    menuItems: [
      {
        name: 'Дашборд',
        href: routes.dashboard,
        icon: PiFolder,
      },
      {
        name: 'Создать сайт',
        href: routes.wizard.step1,
        icon: PiPlus,
      },
    ],
  },
  {
    id: '2',
    name: 'Админ',
    title: 'Администрирование',
    icon: PiShieldCheck,
    menuItems: [
      {
        name: 'Админ-панель',
        href: routes.admin.home,
        icon: PiShieldCheck,
      },
      {
        name: 'Пользователи',
        href: routes.admin.users,
        icon: PiFolder,
      },
      {
        name: 'Сайты',
        href: routes.admin.sites,
        icon: PiFolder,
      },
      {
        name: 'Шаблоны',
        href: routes.admin.templates,
        icon: PiFolder,
      },
      {
        name: 'Черновики',
        href: routes.admin.drafts,
        icon: PiFolder,
      },
      {
        name: 'Статистика',
        href: routes.admin.stats,
        icon: PiGear,
      },
    ],
  },
];

export const berylliumMenuItemAtom = atom<MenuItemsType>(berylliumMenuItems[0]);


'use client';

import { atom, useAtom } from 'jotai';
import { MenuItemsType } from './beryllium-menu-items';

const LOCAL_STORAGE_KEY = 'site-builder-beryllium-sidebar-left-expanded';

const berylliumSidebarLeftExpandedAtom = atom(
  typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : 'true'
);

const berylliumSidebarLeftExpandedAtomWithPersistence = atom(
  (get) => get(berylliumSidebarLeftExpandedAtom),
  (get, set, newStorage: any) => {
    set(berylliumSidebarLeftExpandedAtom, newStorage);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, newStorage);
    }
  }
);

export function useBerylliumSidebars() {
  const [expandedLeft, setExpandedLeft] = useAtom(
    berylliumSidebarLeftExpandedAtomWithPersistence
  );

  return {
    expandedLeft: !!(expandedLeft === null
      ? true
      : expandedLeft === 'true'),
    setExpandedLeft: (value: boolean) => setExpandedLeft(String(value)),
  };
}

export function getActiveMainMenuIndex(
  pathname: string,
  menuItems: MenuItemsType[]
) {
  let activeIndex = 0;
  for (let i = 0; i < menuItems.length; i++) {
    const menuItem = menuItems[i];
    for (let j = 0; j < menuItem.menuItems.length; j++) {
      const items = menuItem.menuItems[j];
      if (items.href === pathname) {
        activeIndex = i;
        break;
      } else {
        if (items.subMenuItems) {
          for (let k = 0; k < items.subMenuItems.length; k++) {
            const subMenuItem = items.subMenuItems[k];
            if (subMenuItem.href === pathname) {
              activeIndex = i;
              break;
            }
          }
        }
      }
    }
  }
  return activeIndex;
}


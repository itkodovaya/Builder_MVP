'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ActionIcon,
  Empty,
  Button,
  Input,
} from 'rizzui';
import {
  PiMagnifyingGlassBold,
  PiXBold,
} from 'react-icons/pi';

export default function SearchList({ onClose }: { onClose?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
    }
    return () => {
      if (inputRef.current) {
        inputRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className="flex items-center px-5 py-4">
        <Input
          variant="flat"
          value={searchText}
          ref={inputRef}
          onChange={(e) => setSearchText(() => e.target.value)}
          placeholder="Поиск страниц..."
          className="flex-1"
          prefix={
            <PiMagnifyingGlassBold className="h-[18px] w-[18px] text-gray-600" />
          }
          suffix={
            searchText && (
              <Button
                size="sm"
                variant="text"
                className="h-auto w-auto px-0"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchText(() => '');
                }}
              >
                Очистить
              </Button>
            )
          }
        />
        <ActionIcon
          variant="text"
          size="sm"
          className="ms-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <PiXBold className="h-5 w-5" />
        </ActionIcon>
      </div>

      <div className="custom-scrollbar max-h-[60vh] overflow-y-auto border-t border-gray-300 px-2 py-4 dark:border-gray-700">
        {searchText.length === 0 ? (
          <Empty
            text="Начните вводить для поиска..."
            className="h-32"
          />
        ) : (
          <Empty
            text="Ничего не найдено"
            className="h-32"
          />
        )}
      </div>
    </>
  );
}


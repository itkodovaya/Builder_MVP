/**
 * Logo Upload Step Component
 * 
 * Step 3: Logo file upload
 */

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { WizardStep } from './WizardStep';

interface LogoUploadStepProps {
  onSubmit: (file: File) => void;
  onBack: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

export function LogoUploadStep({ onSubmit, onBack, onSkip, isLoading = false }: LogoUploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    
    if (!uploadedFile) return;

    if (uploadedFile.size > MAX_FILE_SIZE) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    if (!ACCEPTED_TYPES.includes(uploadedFile.type)) {
      setError('Поддерживаются только изображения: JPEG, PNG, SVG, WebP');
      return;
    }

    setError('');
    setFile(uploadedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.svg', '.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Загрузите логотип или пропустите этот шаг');
      return;
    }

    setError('');
    onSubmit(file);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <WizardStep
      title="Логотип вашего бренда"
      description="Загрузите логотип вашей компании (опционально)"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'}
              ${error ? 'border-red-500' : ''}
            `}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Выбран файл: {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  {isDragActive
                    ? 'Отпустите файл здесь'
                    : 'Перетащите файл сюда или нажмите для выбора'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  JPEG, PNG, SVG, WebP (макс. 5MB)
                </p>
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Назад
          </button>
          <div className="flex gap-2">
            {onSkip && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Пропустить
              </button>
            )}
            <button
              type="submit"
              disabled={!file || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Загрузка...' : 'Завершить'}
            </button>
          </div>
        </div>
      </form>
    </WizardStep>
  );
}


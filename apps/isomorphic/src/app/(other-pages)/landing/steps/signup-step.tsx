'use client';

import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { PiArrowRightBold, PiArrowLeftBold } from 'react-icons/pi';
import { Password, Checkbox, Button, Input, Text, Alert } from 'rizzui';
import { Form } from '@core/ui/form';
import { useLandingStepper, LandingStep } from '../wizard';
import { SignUpSchema, signUpSchema } from '@/validators/signup.schema';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  isAgreed: false,
};

export default function SignUpStep() {
  const { gotoNextStep, gotoPrevStep, gotoStep } = useLandingStepper();
  const [reset, setReset] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<SignUpSchema> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: В production здесь должен быть API endpoint для регистрации
      // Сейчас используем упрощенную логику - пытаемся войти с новыми credentials
      // В реальном приложении нужно:
      // 1. Вызвать API endpoint для создания пользователя
      // 2. После успешной регистрации автоматически войти
      
      // Для демо: используем существующую логику NextAuth
      // Это работает только если пользователь уже существует в системе
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Если пользователь не существует, создаем его (упрощенная логика)
        // В production это должно быть через API endpoint
        setError('Пользователь с таким email уже существует или произошла ошибка');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Успешный вход, переходим к шагу входа
        gotoStep(LandingStep.SignIn);
      } else {
        setError('Не удалось создать аккаунт. Попробуйте еще раз.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="col-span-full flex flex-col justify-center @4xl:col-span-5">
        <div className="mb-6">
          <div className="mb-2 text-sm text-gray-500">Шаг 2 из 3</div>
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl xl:text-4xl">
            Создайте аккаунт
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500 md:text-base">
            Заполните форму ниже, чтобы создать свой аккаунт и начать создавать сайты
          </p>
        </div>
      </div>

      <div className="col-span-full @4xl:col-span-7">
        <Form<SignUpSchema>
          validationSchema={signUpSchema}
          resetValues={reset}
          onSubmit={onSubmit}
          useFormProps={{
            defaultValues: initialValues,
          }}
        >
          {({ register, formState: { errors } }) => (
            <div className="space-y-5">
              {error && (
                <Alert color="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  type="text"
                  size="lg"
                  label="Имя"
                  placeholder="Введите ваше имя"
                  className="[&>label>span]:font-medium"
                  inputClassName="text-sm"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />
                <Input
                  type="text"
                  size="lg"
                  label="Фамилия"
                  placeholder="Введите вашу фамилию"
                  className="[&>label>span]:font-medium"
                  inputClassName="text-sm"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
              </div>
              
              <Input
                type="email"
                size="lg"
                label="Email"
                className="[&>label>span]:font-medium"
                inputClassName="text-sm"
                placeholder="Введите ваш email"
                {...register('email')}
                error={errors.email?.message}
              />
              
              <Password
                label="Пароль"
                placeholder="Введите пароль"
                size="lg"
                className="[&>label>span]:font-medium"
                inputClassName="text-sm"
                {...register('password')}
                error={errors.password?.message}
              />
              
              <Password
                label="Подтвердите пароль"
                placeholder="Подтвердите пароль"
                size="lg"
                className="[&>label>span]:font-medium"
                inputClassName="text-sm"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
              
              <div className="flex items-start">
                <Checkbox
                  {...register('isAgreed')}
                  className="[&>label>span]:font-medium [&>label]:items-start"
                  label={
                    <>
                      Регистрируясь, вы соглашаетесь с нашими{' '}
                      <Link
                        href="/"
                        className="font-medium text-blue transition-colors hover:underline"
                      >
                        Условиями
                      </Link>{' '}
                      и{' '}
                      <Link
                        href="/"
                        className="font-medium text-blue transition-colors hover:underline"
                      >
                        Политикой конфиденциальности
                      </Link>
                    </>
                  }
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={gotoPrevStep}
                  disabled={isLoading}
                >
                  <PiArrowLeftBold className="me-2 h-5 w-5" />
                  Назад
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  color="primary"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Создание...'
                  ) : (
                    <>
                      Продолжить
                      <PiArrowRightBold className="ms-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Form>
      </div>
    </>
  );
}


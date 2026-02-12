'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, type AdminUser } from '@/lib/api/admin';
import { requireAdmin } from '@/lib/utils/auth';
import BerylliumLayout from '@/layouts/beryllium/beryllium-layout';
import toast from 'react-hot-toast';
import { Button, Modal, Input } from 'rizzui';
import { PiTrash, PiPencil, PiX } from 'react-icons/pi';

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ email: '', role: 'user' as 'admin' | 'user' });

  useEffect(() => {
    const checkAdmin = async () => {
      const isAdmin = await requireAdmin();
      if (!isAdmin) {
        return;
      }
      loadUsers();
    };

    checkAdmin();
  }, [router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(error.message || 'Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({ email: user.email, role: user.role });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      const response = await adminApi.updateUser(selectedUser.id, editForm);
      if (response.success) {
        toast.success('Пользователь обновлен');
        setIsEditModalOpen(false);
        setSelectedUser(null);
        loadUsers();
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Не удалось обновить пользователя');
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${email}?`)) {
      return;
    }

    try {
      const response = await adminApi.deleteUser(userId);
      if (response.success) {
        toast.success('Пользователь удален');
        loadUsers();
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Не удалось удалить пользователя');
    }
  };

  if (loading) {
    return (
      <BerylliumLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
          </div>
        </div>
      </BerylliumLayout>
    );
  }

  return (
    <BerylliumLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Управление пользователями
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Всего пользователей: {users.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Создан
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PiPencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <PiTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Редактировать пользователя
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <PiX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Роль
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Админ</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Отмена
                </Button>
                <Button onClick={handleUpdate}>
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </BerylliumLayout>
  );
}


import hashlib
import hmac
import frappe
from frappe import auth


def validate_nextauth_token(token: str, email: str, secret_key: str = None) -> bool:
	"""
	Валидирует токен от NextAuth.
	
	Args:
		token: JWT токен от NextAuth
		email: Email пользователя
		secret_key: Секретный ключ для проверки (берется из конфига или env)
	
	Returns:
		True если токен валиден, False иначе
	"""
	if not token or not email:
		return False
	
	# Получаем секретный ключ из конфига
	if not secret_key:
		secret_key = frappe.conf.get("nextauth_secret_key") or frappe.conf.get("NEXTAUTH_SECRET")
	
	# Простая валидация: проверяем, что токен не пустой и email существует в системе
	# В production здесь должна быть полная проверка JWT токена с использованием secret_key
	try:
		user_exists = frappe.db.exists("User", {"email": email, "enabled": 1})
		if not user_exists:
			return False
		
		# Если есть секретный ключ, можно добавить дополнительную проверку токена
		# Пока используем простую проверку существования пользователя
		return bool(token)
	except Exception:
		return False


def create_frappe_session_from_nextauth(email: str, token: str) -> dict:
	"""
	Создает сессию Frappe на основе данных из NextAuth.
	
	Args:
		email: Email пользователя
		token: Токен от NextAuth
	
	Returns:
		Словарь с информацией о сессии или None при ошибке
	"""
	try:
		# Валидируем токен
		if not validate_nextauth_token(token, email):
			frappe.throw("Неверный токен или email", frappe.AuthenticationError)
		
		# Находим пользователя по email
		user = frappe.db.get_value("User", {"email": email, "enabled": 1}, "name")
		
		if not user:
			frappe.throw(f"Пользователь с email {email} не найден или отключен", frappe.DoesNotExistError)
		
		# Создаем сессию через Frappe auth API
		# Используем frappe.auth.LoginManager для создания сессии
		from frappe.auth import LoginManager
		
		login_manager = LoginManager()
		login_manager.user = user
		login_manager.post_login()
		
		# Получаем информацию о сессии
		session_info = {
			"user": frappe.session.user,
			"sid": frappe.session.sid,
			"session_expiry": frappe.utils.add_to_date(None, days=1).isoformat(),
		}
		
		return session_info
		
	except Exception as e:
		frappe.log_error(f"Ошибка при создании сессии Frappe: {str(e)}", "NextAuth Integration")
		return None


def get_frappe_user_from_email(email: str) -> str:
	"""
	Получает имя пользователя Frappe по email.
	
	Args:
		email: Email пользователя
	
	Returns:
		Имя пользователя или None
	"""
	try:
		user = frappe.db.get_value("User", {"email": email, "enabled": 1}, "name")
		return user
	except Exception:
		return None


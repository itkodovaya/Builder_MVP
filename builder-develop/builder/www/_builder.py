import frappe
from frappe.integrations.frappe_providers.frappecloud_billing import is_fc_site
from frappe.pulse.utils import get_app_version
from frappe.utils.telemetry import capture

from builder.hooks import builder_path

no_cache = 1


def get_context(context):
	# Проверяем наличие сессии
	if frappe.session.user == "Guest":
		# Пытаемся создать сессию из токена NextAuth, если он передан
		nextauth_token = frappe.request.headers.get("X-NextAuth-Token")
		nextauth_email = frappe.request.headers.get("X-NextAuth-Email")
		
		if nextauth_token and nextauth_email:
			try:
				from builder.auth import create_frappe_session_from_nextauth
				session_info = create_frappe_session_from_nextauth(nextauth_email, nextauth_token)
				if not session_info:
					# Не удалось создать сессию - возвращаем ошибку доступа
					frappe.local.response["type"] = "http"
					frappe.local.response["http_status_code"] = 403
					frappe.local.response["message"] = "Access denied. Please login through the control panel."
					return
			except Exception as e:
				frappe.log_error(f"Failed to create session from NextAuth token: {str(e)}", "NextAuth Integration")
				# Ошибка при создании сессии - возвращаем ошибку доступа
				frappe.local.response["type"] = "http"
				frappe.local.response["http_status_code"] = 403
				frappe.local.response["message"] = "Access denied. Please login through the control panel."
				return
		else:
			# Нет токена NextAuth - Builder доступен только для авторизованных пользователей
			# Возвращаем ошибку доступа
			frappe.local.response["type"] = "http"
			frappe.local.response["http_status_code"] = 403
			frappe.local.response["message"] = "Access denied. Please login through the control panel."
			return
	
	csrf_token = frappe.sessions.get_csrf_token()
	frappe.db.commit()
	context.csrf_token = csrf_token
	context.site_name = frappe.local.site
	context.builder_path = builder_path
	context.builder_version = get_app_version("builder")
	# developer mode
	context.is_developer_mode = frappe.conf.developer_mode
	context.is_fc_site = is_fc_site()
	if frappe.session.user != "Guest":
		capture("active_site", "builder")

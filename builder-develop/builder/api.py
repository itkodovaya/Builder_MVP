import os
from io import BytesIO
from types import FunctionType, MethodType, ModuleType
from typing import Any
from urllib.parse import unquote

import frappe
import frappe.utils
import requests
from frappe.apps import get_apps as get_permitted_apps
from frappe.core.doctype.file.file import get_local_image
from frappe.core.doctype.file.utils import delete_file
from frappe.model.document import Document
from frappe.utils.caching import redis_cache
from frappe.utils.safe_exec import NamespaceDict, get_safe_globals
from frappe.utils.telemetry import POSTHOG_HOST_FIELD, POSTHOG_PROJECT_FIELD
from PIL import Image
from werkzeug.wrappers import Response

from builder import builder_analytics
from builder.builder.doctype.builder_page.builder_page import BuilderPageRenderer


@frappe.whitelist()
def get_posthog_settings():
	can_record_session = False
	if start_time := frappe.db.get_default("session_recording_start"):
		time_difference = (
			frappe.utils.now_datetime() - frappe.utils.get_datetime(start_time)
		).total_seconds()
		if time_difference < 86400:  # 1 day
			can_record_session = True

	return {
		"posthog_project_id": frappe.conf.get(POSTHOG_PROJECT_FIELD),
		"posthog_host": frappe.conf.get(POSTHOG_HOST_FIELD),
		"enable_telemetry": frappe.get_system_settings("enable_telemetry"),
		"telemetry_site_age": frappe.utils.telemetry.site_age(),
		"record_session": can_record_session,
		"posthog_identifier": frappe.local.site,
	}


@frappe.whitelist(allow_guest=True)
def get_page_preview_html(page: str, **kwarg) -> Response:
	"""
	Получить preview HTML для Builder Page.
	Доступно для гостевых пользователей для показа preview до регистрации.
	"""
	# Проверяем существование страницы
	try:
		page_doc = frappe.get_cached_doc("Builder Page", page)
	except frappe.DoesNotExistError:
		frappe.throw(f"Страница Builder Page '{page}' не найдена", frappe.DoesNotExistError)
	
	# Для гостевых пользователей разрешаем preview только опубликованных страниц
	if frappe.session.user == "Guest":
		if not page_doc.published:
			frappe.throw("Эта страница не опубликована", frappe.PermissionError)
	else:
		# Для авторизованных пользователей проверяем права доступа
		if not frappe.has_permission("Builder Page", "read", page):
			frappe.throw("Нет прав для просмотра этой страницы")

	# для загрузки preview без публикации
	frappe.form_dict.update(kwarg)
	frappe.local.request.for_preview = True
	renderer = BuilderPageRenderer(path="")
	renderer.docname = page
	renderer.doctype = "Builder Page"
	frappe.local.no_cache = 1
	renderer.init_context()
	response = renderer.render()
	
	# Генерируем preview изображение асинхронно (только для авторизованных пользователей)
	if frappe.session.user != "Guest":
		frappe.enqueue_doc(
			page_doc.doctype,
			page_doc.name,
			"generate_page_preview_image",
			html=str(response.data, "utf-8"),
			queue="short",
		)
	return response


@frappe.whitelist()
def upload_builder_asset():
	from frappe.handler import upload_file

	image_file = upload_file()
	if image_file.file_url.endswith((".png", ".jpeg", ".jpg")) and frappe.get_cached_value(
		"Builder Settings", "Builder Settings", "auto_convert_images_to_webp"
	):
		convert_to_webp(file_doc=image_file)
	return image_file


@frappe.whitelist()
def convert_to_webp(image_url: str | None = None, file_doc: Document | None = None) -> str:
	"""BETA: Преобразовать изображение в формат webp"""

	CONVERTIBLE_IMAGE_EXTENSIONS = ["png", "jpeg", "jpg"]

	def is_external_image(image_url):
		return image_url.startswith("http") or image_url.startswith("https")

	def can_convert_image(extn):
		return extn.lower() in CONVERTIBLE_IMAGE_EXTENSIONS

	def get_extension(filename):
		return filename.split(".")[-1].lower()

	def convert_and_save_image(image, path):
		image.save(path, "WEBP")
		return path

	def update_file_doc_with_webp(file_doc, image, extn):
		webp_path = file_doc.get_full_path().replace(extn, "webp")
		convert_and_save_image(image, webp_path)
		delete_file(file_doc.get_full_path())
		file_doc.file_url = f"{file_doc.file_url.replace(extn, 'webp')}"
		file_doc.save()
		return file_doc.file_url

	def create_new_webp_file_doc(file_url, image, extn):
		files = frappe.get_all("File", filters={"file_url": file_url}, fields=["name"], limit=1)
		if files:
			_file = frappe.get_doc("File", files[0].name)
			webp_path = _file.get_full_path().replace(extn, "webp")
			convert_and_save_image(image, webp_path)
			new_file = frappe.copy_doc(_file)
			new_file.file_name = f"{_file.file_name.replace(extn, 'webp')}"
			new_file.file_url = f"{_file.file_url.replace(extn, 'webp')}"
			new_file.save()
			return new_file.file_url
		return file_url

	def handle_image_from_url(image_url):
		image_url = unquote(image_url)
		response = requests.get(image_url)
		image = Image.open(BytesIO(response.content))
		filename = image_url.split("/")[-1]
		extn = get_extension(filename)
		if can_convert_image(extn) or is_external_image(image_url):
			_file = frappe.get_doc(
				{
					"doctype": "File",
					"file_name": f"{filename.replace(extn, 'webp')}",
					"file_url": f"/files/{filename.replace(extn, 'webp')}",
				}
			)
			webp_path = _file.get_full_path()
			convert_and_save_image(image, webp_path)
			_file.save()
			return _file.file_url
		return image_url

	if not image_url and not file_doc:
		return ""

	if file_doc:
		if file_doc.file_url.startswith("/files"):
			image, filename, extn = get_local_image(file_doc.file_url)
			if can_convert_image(extn):
				return update_file_doc_with_webp(file_doc, image, extn)
		return file_doc.file_url

	image_url = image_url or ""
	if image_url.startswith("/files"):
		image, filename, extn = get_local_image(image_url)
		if can_convert_image(extn):
			return create_new_webp_file_doc(image_url, image, extn)
		return image_url

	if image_url.startswith("/builder_assets"):
		image_path = os.path.abspath(frappe.get_app_path("builder", "www", image_url.lstrip("/")))
		image_path = image_path.replace("_", "-")
		image_path = image_path.replace("/builder-assets", "/builder_assets")

		image = Image.open(image_path)
		extn = get_extension(image_path)
		if can_convert_image(extn):
			webp_path = image_path.replace(extn, "webp")
			convert_and_save_image(image, webp_path)
			return image_url.replace(extn, "webp")
		return image_url

	if image_url.startswith("http"):
		return handle_image_from_url(image_url)

	return image_url


def check_app_permission():
	if frappe.session.user == "Administrator":
		return True

	if frappe.has_permission("Builder Page", ptype="write"):
		return True

	return False


@frappe.whitelist()
@redis_cache()
def get_apps():
	apps = get_permitted_apps()
	app_list = [
		{
			"name": "frappe",
			"logo": "/assets/builder/images/desk.png",
			"title": "Desk",
			"route": "/app",
		}
	]
	app_list += filter(lambda app: app.get("name") != "builder", apps)

	return app_list


@frappe.whitelist()
def update_page_folder(pages: list[str], folder_name: str) -> None:
	if not frappe.has_permission("Builder Page", ptype="write"):
		frappe.throw("У вас нет прав для обновления папки страницы.")
	for page in pages:
		frappe.db.set_value("Builder Page", page, "project_folder", folder_name, update_modified=False)


@frappe.whitelist()
def duplicate_page(page_name: str):
	if not frappe.has_permission("Builder Page", ptype="write"):
		frappe.throw("У вас нет прав для дублирования страницы.")
	page = frappe.get_doc("Builder Page", page_name)
	new_page = frappe.copy_doc(page)
	del new_page.page_name
	new_page.route = None
	client_scripts = page.client_scripts
	new_page.client_scripts = []
	for script in client_scripts:
		builder_script = frappe.get_doc("Builder Client Script", script.builder_script)
		new_script = frappe.copy_doc(builder_script)
		new_script.name = f"{builder_script.name}-{frappe.generate_hash(length=5)}"
		new_script.insert(ignore_permissions=True)
		new_page.append("client_scripts", {"builder_script": new_script.name})
	new_page.insert()
	return new_page


@frappe.whitelist()
def delete_folder(folder_name: str) -> None:
	if not frappe.has_permission("Builder Project Folder", ptype="write"):
		frappe.throw("У вас нет прав для удаления папки.")

	# удаляем папку из всех страниц
	pages = frappe.get_all("Builder Page", filters={"project_folder": folder_name}, fields=["name"])
	for page in pages:
		frappe.db.set_value("Builder Page", page.name, "project_folder", "", update_modified=False)

	frappe.db.delete("Builder Project Folder", {"folder_name": folder_name})


@frappe.whitelist()
def sync_component(component_id: str):
	if not frappe.has_permission("Builder Page", ptype="write"):
		frappe.throw("У вас нет прав для синхронизации компонента.")

	component = frappe.get_doc("Builder Component", component_id)
	component.sync_component()


@frappe.whitelist()
def get_page_analytics(
	route=None, interval: str = "daily", from_date=None, to_date=None, route_filter_type: str = "wildcard"
):
	return builder_analytics.get_page_analytics(
		route=route,
		interval=interval,
		from_date=from_date,
		to_date=to_date,
		route_filter_type=route_filter_type,
	)


@frappe.whitelist()
def get_overall_analytics(
	interval: str = "daily", route=None, from_date=None, to_date=None, route_filter_type: str = "wildcard"
):
	return builder_analytics.get_overall_analytics(
		interval=interval,
		route=route,
		from_date=from_date,
		to_date=to_date,
		route_filter_type=route_filter_type,
	)


def get_keys_for_autocomplete(
	key: str,
	value: Any,
	depth: int = 0,
	max_depth: int | None = None,
):
	if max_depth and depth > max_depth:
		return None  # Or some other sentinel value to indicate termination

	if key.startswith("_"):
		return None

	if isinstance(value, NamespaceDict | dict) and value:
		result = {}
		for k, v in value.items():
			nested_result = get_keys_for_autocomplete(
				k,
				v,
				depth + 1,
				max_depth=max_depth,
			)
			if nested_result is not None:  # Only add if not terminated
				result[k] = nested_result
		return result if result else None  # Return None if the dictionary is empty

	else:
		if isinstance(value, type) and issubclass(value, Exception):
			var_type = "type"  # Exceptions are types
		elif isinstance(value, ModuleType):
			var_type = "namespace"
		elif isinstance(value, FunctionType | MethodType):
			var_type = "function"
		elif isinstance(value, type):
			var_type = "type"
		elif isinstance(value, dict):
			var_type = "property"  # Assuming dict should be mapped to other
		else:
			var_type = "property"  # Default to text if no other type matches
		return {"true_type": type(value).__name__, "type": var_type}


@frappe.whitelist()
@redis_cache()
def get_codemirror_completions():
	return get_keys_for_autocomplete(
		key="",
		value=get_safe_globals(),
	)


@frappe.whitelist()
def reorder_client_scripts(script_order):
	if not frappe.has_permission("Builder Page", ptype="write"):
		frappe.throw("У вас нет прав для изменения порядка клиентских скриптов")

	if isinstance(script_order, str):
		script_order = frappe.parse_json(script_order)

	for idx, script_name in enumerate(script_order, start=1):
		frappe.db.set_value("Builder Page Client Script", script_name, "idx", idx)


@frappe.whitelist(allow_guest=True)
def create_session_from_token(email: str, token: str):
	"""
	Создает сессию Frappe на основе токена от NextAuth.
	Используется для единой аутентификации между Next.js панелью и Frappe Builder.
	
	Args:
		email: Email пользователя из NextAuth
		token: JWT токен от NextAuth
	
	Returns:
		Словарь с информацией о созданной сессии
	"""
	from builder.auth import create_frappe_session_from_nextauth
	
	if not email or not token:
		frappe.throw("Требуются email и токен", frappe.ValidationError)
	
	# Создаем сессию
	session_info = create_frappe_session_from_nextauth(email, token)
	
	if not session_info:
		frappe.throw("Не удалось создать сессию", frappe.AuthenticationError)
	
	# Возвращаем информацию о сессии
	# Сессия уже установлена через frappe.local.login_manager
	return {
		"success": True,
		"user": session_info.get("user"),
		"sid": session_info.get("sid"),
		"message": "Сессия успешно создана",
	}


@frappe.whitelist(allow_guest=True)
def create_site_from_wizard(brand_name: str, business_area: str, logo_url: str | None = None):
	"""
	Создает Builder Page в Frappe на основе данных из визарда.
	
	Args:
		brand_name: Название бренда
		business_area: Сфера деятельности
		logo_url: URL логотипа (опционально)
	
	Returns:
		Словарь с информацией о созданной странице (name, route)
	"""
	import json
	import frappe.utils
	
	try:
		if not brand_name or not business_area:
			frappe.throw("Требуются название бренда и сфера деятельности", frappe.ValidationError)
		
		# Генерируем уникальные ID для блоков
		def generate_block_id():
			return frappe.generate_hash(length=8)
	
		# Создаем базовую структуру страницы с Hero блоком
		hero_block_id = generate_block_id()
		wrapper_id = generate_block_id()
		heading_id = generate_block_id()
		paragraph_id = generate_block_id()
		
		# Hero блок с названием бренда
		hero_block = {
			"attributes": {},
			"baseStyles": {
				"alignItems": "center",
				"display": "flex",
				"flexDirection": "column",
				"flexShrink": 0,
				"gap": "20px",
				"justifyContent": "center",
				"overflow": "hidden",
				"paddingBottom": "100px",
				"paddingTop": "100px",
				"position": "static",
				"width": "100%",
				"background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
			},
			"blockId": hero_block_id,
			"blockName": "hero",
		"children": [
			{
				"attributes": {},
				"baseStyles": {
					"alignItems": "center",
					"display": "flex",
					"flexDirection": "column",
					"flexShrink": 0,
					"gap": "20px",
					"justifyContent": "center",
					"maxWidth": "1200px",
					"overflow": "hidden",
					"paddingBottom": "40px",
					"paddingTop": "40px",
					"position": "static",
					"width": "100%"
				},
				"blockId": wrapper_id,
				"blockName": "wrapper",
				"children": [
					{
						"attributes": {},
						"baseStyles": {
							"color": "#FFFFFF",
							"fontFamily": "",
							"fontSize": "48px",
							"fontWeight": "bold",
							"height": "fit-content",
							"letterSpacing": "0.48px",
							"lineHeight": "140%",
							"minWidth": "10px",
							"textAlign": "center",
							"width": "fit-content"
						},
						"blockId": heading_id,
						"children": [],
						"classes": [],
						"customAttributes": {},
						"dataKey": None,
						"element": "h1",
						"innerHTML": f"<h1>{frappe.utils.escape_html(brand_name)}</h1>",
						"mobileStyles": {
							"fontSize": "32px",
							"paddingLeft": "20px",
							"paddingRight": "20px"
						},
						"rawStyles": {},
						"tabletStyles": {
							"fontSize": "40px"
						}
					},
					{
						"attributes": {},
						"baseStyles": {
							"color": "#F0F0F0",
							"fontFamily": "",
							"fontSize": "18px",
							"fontWeight": "400",
							"height": "fit-content",
							"letterSpacing": "-0.08px",
							"lineHeight": "150%",
							"maxWidth": "600px",
							"minWidth": "10px",
							"textAlign": "center",
							"width": "fit-content"
						},
						"blockId": paragraph_id,
						"children": [],
						"classes": [],
						"customAttributes": {},
						"dataKey": None,
						"element": "p",
						"innerHTML": f"<p>Добро пожаловать в {frappe.utils.escape_html(brand_name)}. Мы специализируемся в области {frappe.utils.escape_html(business_area)}.</p>",
						"mobileStyles": {
							"paddingLeft": "20px",
							"paddingRight": "20px"
						},
						"rawStyles": {},
						"tabletStyles": {}
					}
				],
				"classes": [],
				"customAttributes": {},
				"dataKey": None,
				"element": "section",
				"mobileStyles": {},
				"rawStyles": {},
				"tabletStyles": {}
			}
		],
			"classes": [],
			"customAttributes": {},
			"dataKey": None,
			"element": "section",
			"mobileStyles": {},
			"rawStyles": {},
			"tabletStyles": {}
		}
		
		# Если есть логотип, добавляем его в hero
		if logo_url:
			logo_id = generate_block_id()
			logo_block = {
				"attributes": {
					"src": logo_url,
					"alt": brand_name
				},
				"baseStyles": {
					"height": "80px",
					"width": "auto",
					"maxWidth": "200px",
					"objectFit": "contain"
				},
				"blockId": logo_id,
				"children": [],
				"classes": [],
				"customAttributes": {},
				"dataKey": None,
				"element": "img",
				"mobileStyles": {},
				"rawStyles": {},
				"tabletStyles": {}
			}
			# Вставляем логотип перед заголовком
			hero_block["children"][0]["children"].insert(0, logo_block)
		
		# Создаем Builder Page документ
		page_name = f"site-{frappe.generate_hash(length=8)}"
		
		# Передаем блоки как список - Frappe сам сериализует их в before_insert
		page_doc = frappe.get_doc({
			"doctype": "Builder Page",
			"page_name": page_name,
			"page_title": brand_name,
			"route": f"pages/{page_name}",
			"blocks": [hero_block],  # Передаем как список, не JSON строку
			"published": 1,  # Публикуем сразу
			"meta_description": f"Сайт {brand_name} - {business_area}",
		})
		
		# Вставляем документ с игнорированием разрешений для гостевых пользователей
		page_doc.insert(ignore_permissions=True)
		
		# Сохраняем изменения (если нужно)
		page_doc.save(ignore_permissions=True)
		
		return {
			"success": True,
			"page_name": page_doc.name,
			"page_title": page_doc.page_title,
			"route": page_doc.route,
			"message": "Сайт успешно создан",
		}
	except Exception as e:
		# Логируем ошибку для отладки
		frappe.log_error(
			title="Ошибка при создании сайта из визарда",
			message=f"Бренд: {brand_name}, Сфера деятельности: {business_area}, Ошибка: {str(e)}"
		)
		# Пробрасываем ошибку дальше
		frappe.throw(f"Не удалось создать сайт: {str(e)}", frappe.ValidationError)

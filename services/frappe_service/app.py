"""
Frappe Service Application

Minimal Frappe application for rendering pages
"""

import os
import sys

# Add builder-develop to path if needed
builder_path = os.environ.get('BUILDER_PATH', '../builder-develop')
if os.path.exists(builder_path):
    sys.path.insert(0, builder_path)

import frappe
from frappe.app import application

# Initialize Frappe
frappe.init(site='frappe.localhost')
frappe.connect()

# Create application
app = application()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)


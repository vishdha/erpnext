import frappe, json

def execute():
	from erpnext.setup.setup_wizard.operations.install_fixtures import add_status_data

	frappe.reload_doc("setup", "doctype", "Status")
	add_status_data()
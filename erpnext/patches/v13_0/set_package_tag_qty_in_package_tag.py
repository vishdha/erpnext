import frappe

def execute():
	frappe.reload_doc('compliance', 'doctype', 'package_tag', force=True)
	package_tags = frappe.get_all("Package Tag")

	for package_tag in package_tags:
		package_tag_qty = frappe.db.get_value("Stock Ledger Entry", {"docstatus": 1, "package_tag": package_tag.name}, "sum(actual_qty)")
		if package_tag_qty:
			frappe.db.set_value("Package Tag", package_tag.name, "package_tag_qty", package_tag_qty)
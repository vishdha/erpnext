import frappe

def execute():
	for dt in ('BOM', 'Work Order', 'Stock Entry'):
		frappe.reload_doctype(dt)
		frappe.db.sql("""
			UPDATE
				`tab%s`
			SET
				manufacturing_type = "Discrete"
			WHERE
				manufacturing_type IS NULL
		"""% (dt))

from __future__ import unicode_literals
import frappe

def execute():
	if frappe.db.table_exists("Bank Reconciliation"):
		frappe.rename_doc('DocType', 'Bank Reconciliation', 'Bank Clearance', force=True, ignore_if_exists=True)
		frappe.reload_doc('accounts', 'doctype', 'bank_clearance')

		frappe.rename_doc('DocType', 'Bank Reconciliation Detail', 'Bank Clearance Detail', force=True, ignore_if_exists=True)
		frappe.reload_doc('accounts', 'doctype', 'bank_clearance_detail')

	frappe.delete_doc_if_exists("DocType", "Bank Reconciliation")
	frappe.delete_doc_if_exists("DocType", "Bank Reconciliation Detail")
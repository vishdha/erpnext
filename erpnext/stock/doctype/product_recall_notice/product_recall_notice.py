# -*- coding: utf-8 -*-
# Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import json
import frappe
from frappe import _
from frappe.model.document import Document

class ProductRecallNotice(Document):
	pass

@frappe.whitelist()
def create_stock_entry_from_product_recall_notice(product_recall_notice):
	"""
	Create Stock Entry to put items in recall warehouse.

	Args:
		product_recall_notice (doc): Product Recall Notice Doc to create Stock Entry

	Returns:
		stock_entry: returns name of stock entry created with link to its form
	"""
	product_recall_notice = json.loads(product_recall_notice)
	se_items = []

	for item in product_recall_notice.get("items"):
		# only append items if it is not received ie items against which stock entry is not created
		if item.get("qty") != item.get("received_qty"):
			se_items.append({
				"item_code":item.get("item_code"),
				"qty": item.get("qty"),
				"batch_no": item.get("batch_no"),
				"s_warehouse": item.get("warehouse") if product_recall_notice.get("recall_from") == "Warehouse" else None,
				"t_warehouse": product_recall_notice.get("recall_warehouse"),
				"product_recall_notice": product_recall_notice.get("name"),
				"product_recall_notice_item": item.get("name")
			})

	if se_items:
		stock_entry_doc = frappe.new_doc("Stock Entry")
		if product_recall_notice.get("recall_from") == "Warehouse":
			stock_entry_doc.stock_entry_type = "Material Transfer"
		else:
			stock_entry_doc.stock_entry_type = "Material Receipt"

		stock_entry_doc.update({
			"items": se_items
		})

		stock_entry_doc.run_method("set_missing_values")
		stock_entry_doc.save(ignore_permissions=True)
		stock_entry_doc.submit()

		for se_item in stock_entry_doc.get("items"):
			if se_item.get("product_recall_notice_item"):
				frappe.db.set_value("Product Recall Notice Item", se_item.get("product_recall_notice_item"), "received_qty", se_item.get("qty"))

	else:
		frappe.throw(_("The Stock entry has been already created for this Product Recall Notice."))
	return {
		"stock_entry": frappe.utils.get_link_to_form('Stock Entry', stock_entry_doc.name)
	}

# -*- coding: utf-8 -*-
# Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe import _
from frappe.model.document import Document

class Harvest(Document):
	pass

@frappe.whitelist()
def create_stock_entry(harvest):
	harvest = frappe.get_doc(json.loads(harvest))
	if stock_entry_exists(harvest.get('name')):
		return frappe.msgprint(_('Stock Entry {0} has been already created against this harvest.').format(frappe.utils.get_link_to_form("Stock Entry", harvest.get('name'))))

	stock_entry = frappe.new_doc('Stock Entry')
	stock_entry.harvest = harvest.get('name')
	stock_entry.purpose = harvest.get('purpose')
	stock_entry.stock_entry_type = 'Harvest'

	if harvest.get('strain'):
		stock_entry = update_stock_entry_based_on_strain(harvest, stock_entry)

	stock_entry.set_incoming_rate()
	stock_entry.set_actual_qty()
	stock_entry.calculate_rate_and_amount(update_finished_item_rate=False)

	return stock_entry.as_dict()


def stock_entry_exists(harvest_name):
	return frappe.db.exists('Stock Entry', {
		'harvest': harvest_name
	})


def update_stock_entry_based_on_strain(harvest, stock_entry):
	strain = frappe.get_doc("Strain", harvest.get('strain'))

	stock_entry.to_warehouse = strain.target_warehouse

	for strain_item in strain.produced_items + strain.byproducts:
		item = frappe._dict()
		item.item_code = strain_item.item_code
		item.t_warehouse = strain.target_warehouse
		stock_entry.append('items', item)

	return stock_entry

# -*- coding: utf-8 -*-
# Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from bloomstack_core.bloomtrace import make_integration_request

class Harvest(Document):
	pass

@frappe.whitelist()
def finish_harvest(harvest):
	frappe.db.set_value("Harvest", harvest, "is_finished", 1)
	make_integration_request("Harvest", harvest)
	return True

@frappe.whitelist()
def unfinish_harvest(harvest):
	frappe.db.set_value("Harvest", harvest, "is_finished", 0)
	make_integration_request("Harvest", harvest)
	return True
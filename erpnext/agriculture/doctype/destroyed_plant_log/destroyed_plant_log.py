# -*- coding: utf-8 -*-
# Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document

class DestroyedPlantLog(Document):
	def on_submit(self):
		if self.category_type == "Plant Batch":
			doc = frappe.get_doc('Plant Batch', self.category)
			doc.validate_plant_batch_quantities(self.destroy_count)
		elif self.category_type == "Plant":
			doc = frappe.get_doc('Plant', self.category)
			doc.validate_plant_quantities(self.destroy_count)
		doc.untracked_count -= int(self.destroy_count)
		doc.destroyed_count += int(self.destroy_count)
		doc.save()
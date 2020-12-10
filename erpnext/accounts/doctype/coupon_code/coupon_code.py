# -*- coding: utf-8 -*-
# Copyright (c) 2018, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import (strip)
class CouponCode(Document):
	def autoname(self):
		self.coupon_name = strip(self.coupon_name)
		self.name = self.coupon_name

		if not self.coupon_code:
			if self.coupon_type == "Promotional":
				self.coupon_code =''.join([i for i in self.coupon_name if not i.isdigit()])[0:8].upper()
			elif self.coupon_type == "Gift Card":
				self.coupon_code = frappe.generate_hash()[:10].upper()
		
	def validate(self):
		if self.coupon_type == "Gift Card":
			self.maximum_use = 1
			if not self.customer:
				frappe.throw(_("Please select the customer."))

	def get_brackets_meta(self):
		from erpnext.bloombrackets.coupon_commands import build_context_meta
		ctx = {
			"#META": {}
		}

		build_context_meta(ctx.get("#META"), "Quotation")

def apply_coupon(doc):
	code = frappe.get_value("Coupon Code", doc.coupon_name, "brackets_code")

	if code:
		from erpnext.bloombrackets import run_script
		from erpnext.bloombrackets.coupon_commands import build_context
		try:
			code = JSON.loads(code)
		except:
			return

		ctx = {
			"#VARS": {
				"doc": doc,
				[doc.doctype]: doc
			},
			"#CALLS": calls
		}

		build_context(ctx, doc.doctype, skip_meta=True)
		run_script(code, ctx)


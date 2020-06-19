# Copyright (c) 2013, Web Notes Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import cint, flt, nowdate, getdate

def execute():
	update_overdue_status()


def update_overdue_status():
	frappe.db.sql("""
		update
			`tabSales Order`
		set status = (Case when per_delivered < 100 and delivery_date < CURDATE() and docstatus = 1 and skip_delivery_note = 0 then 'Overdue'
		End)""")
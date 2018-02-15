# Copyright (c) 2013, Web Notes Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe

def execute():
	frappe.db.sql(""" update `tabSingles` set 'b2c_limit' = 250000 where doctype = 'GST Settings'""")
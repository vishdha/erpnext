import frappe
from frappe.utils import flt
from erpnext.bloombrackets.coupon_commands.utils import flat_item_group_tree_list

NET_TOTAL = "Net Total"
GRAND_TOTAL = "Grand Total"

CMD_SET_DISCOUNT_GRAND_TOTAL_BASIS = "Set Discount Grand Total Basis"
CMD_SET_DISCOUNT_NET_TOTAL_BASIS = "Set Discount Net Total Basis"

CMD_ADD_DISCOUNT = "Add Discount"

CMD_APPLY_DISCOUNT = "Apply Discount"
CMD_APPLY_DISCOUNT_PERCENT = "Apply Discount Percent"
CMD_APPLY_NET_DISCOUNT = "Apply Net Discount"
CMD_APPLY_NET_DISCOUNT_PERCENT = "Apply Net Discount Percent"

CMD_ADD_ITEM_DISCOUNT = "Add Item Discount"
CMD_ADD_ITEM_DISCOUNT_PERCENT = "Add Item Discount Percent"

CMD_ADD_ITEM_GROUP_DISCOUNT = "Add Item Group Discount"
CMD_ADD_ITEM_GROUP_DISCOUNT_PERCENT = "Add Item Group Discount Percent"

def discount_amount_total_guard(doc):
	if doc.apply_discount_on == "Net Total":
		if doc.discount_amount > doc.net_total:
			doc.discount_amount = doc.net_total

	else:
		if doc.discount_amount > doc.grand_total:
			doc.discount_amount = doc.grand_total

	if doc.additional_discount_percentage > 100:
		doc.additional_discount_percentage = 100


def load_commands(commands, for_doctype):

	def set_discount_grand_total_basis(args, ctx):
		doc = ctx["#VARS"]["doc"]
		doc.apply_discount_on = GRAND_TOTAL
		doc.run_method("calculate_taxes_and_totals")

	def set_discount_net_total_basis(args, ctx):
		doc = ctx["#VARS"]["doc"]
		doc.apply_discount_on = NET_TOTAL
		doc.run_method("calculate_taxes_and_totals")

		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_SET_DISCOUNT_GRAND_TOTAL_BASIS]
		)

	def add_discount(args, ctx):
		value = flt(args[0])
		doc = ctx["#VARS"]["doc"]

		doc.discount_amount = (doc.discount_amount or 0) + value
		discount_amount_total_guard(doc)

		doc.additional_discount_percentage = 0
		doc.run_method("calculate_taxes_and_totals")

		# How we undo this script's data
		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_APPLY_DISCOUNT, 0]
		)

	def add_item_discount(args, ctx):
		doc = ctx["#VARS"]["doc"]
		item_name = args[0]
		discount = flt(args[1])
		total_discount = 0

		for item in doc.items:
			if item.item_code == item_name:
				# prevent going negative on discount values
				discount_value = discount if discount <= item.amount else item.amount
				total_discount = total_discount + discount_value
		
		if total_discount > 0:
			doc.discount_amount = doc.discount_amount + total_discount
			doc.additional_discount_percentage = 0
			discount_amount_total_guard(doc)
			doc.run_method("calculate_taxes_and_totals")

			ctx["#VARS"]["undo_script"].append(
				["CALL", CMD_APPLY_DISCOUNT, 0]
			)

	def add_item_group_discount(args, ctx):
		doc = ctx["#VARS"]["doc"]
		group = args[0]
		discount = flt(args[1])
		total_discount = 0

		valid_item_groups = flat_item_group_tree_list(group)

		for item in doc.items:
			item_group = frappe.get_value("Item", item.item_name, "item_group")

			if item_group in valid_item_groups:
				# prevent going negative on discount values
				discount_value = discount if discount <= item.amount else item.amount
				total_discount = total_discount + discount_value
		
		if total_discount > 0:
			doc.discount_amount = doc.discount_amount + total_discount
			doc.additional_discount_percentage = 0
			discount_amount_total_guard(doc)
			doc.run_method("calculate_taxes_and_totals")

			ctx["#VARS"]["undo_script"].append(
				["CALL", CMD_APPLY_DISCOUNT, 0]
			)

	def add_item_discount_percent(args, ctx):
		item_name = args[0]
		percent = flt(args[1])
		total_discount = 0
		doc = ctx["#VARS"]["doc"]

		if percent < 0:
			percent = 0
		if percent > 100:
			percent = 100

		for item in doc.items:
			if item.item_code == item_name:
				discount_value = (item.amount * percent) / 100
				if discount_value > 0:
					total_discount = total_discount + discount_value
		
		if total_discount > 0:
			doc.discount_amount = flt(doc.discount_amount) + total_discount
			doc.additional_discount_percentage = 0
			discount_amount_total_guard(doc)
			doc.run_method("calculate_taxes_and_totals")

			ctx["#VARS"]["undo_script"].append(
				["CALL", CMD_APPLY_DISCOUNT, 0]
			)

	def add_item_group_discount_percent(args, ctx):
		group = args[0]
		percent = flt(args[1])
		total_discount = 0
		doc = ctx["#VARS"]["doc"]

		valid_item_groups = flat_item_group_tree_list(group)

		if percent < 0:
			percent = 0
		if percent > 100:
			percent = 100

		for item in doc.items:
			item_group = frappe.get_value("Item", item.item_code, "item_group")

			if item_group in valid_item_groups:
				discount_value = (item.amount * percent) / 100
				if discount_value > 0:
					total_discount = total_discount + discount_value
		
		if total_discount > 0:
			doc.discount_amount = doc.discount_amount + total_discount
			doc.additional_discount_percentage = 0
			discount_amount_total_guard(doc)
			doc.run_method("calculate_taxes_and_totals")

			ctx["#VARS"]["undo_script"].append(
				["CALL", CMD_APPLY_DISCOUNT, 0]
			)

	def apply_discount(args, ctx):
		value = flt(args[0])
		doc = ctx["#VARS"]["doc"]
		doc.discount_amount = value
		doc.additional_discount_percentage = 0
		doc.apply_discount_on = GRAND_TOTAL
		discount_amount_total_guard(doc)
		doc.run_method("calculate_taxes_and_totals")

		# How we undo this script's data
		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_APPLY_DISCOUNT, 0]
		)
	
	def apply_discount_percent(args, ctx):
		percent = flt(args[0])
		doc = ctx["#VARS"]["doc"]
		doc.discount_amount = 0
		doc.additional_discount_percentage = percent
		doc.apply_discount_on = GRAND_TOTAL
		discount_amount_total_guard(doc)
		doc.run_method("calculate_taxes_and_totals")

		# How we undo this script's data
		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_APPLY_DISCOUNT, 0]
		)

	def apply_net_discount(args, ctx):
		value = flt(args[0])
		doc = ctx["#VARS"]["doc"]
		doc.discount_amount = value
		doc.additional_discount_percentage = 0
		doc.apply_discount_on = NET_TOTAL
		doc.run_method("calculate_taxes_and_totals")

		# How we undo this script's data
		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_APPLY_DISCOUNT, 0]
		)
	
	def apply_net_discount_percent(args, ctx):
		percent = flt(args[0])
		doc = ctx["#VARS"]["doc"]
		discount = (doc.net_total * percent) / 100
		doc.discount_amount = 0
		doc.additional_discount_percentage = percent
		doc.apply_discount_on = NET_TOTAL
		doc.run_method("calculate_taxes_and_totals")

		# How we undo this script's data
		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_APPLY_DISCOUNT, 0]
		)

	commands.update({
		CMD_SET_DISCOUNT_GRAND_TOTAL_BASIS: set_discount_grand_total_basis,
		CMD_SET_DISCOUNT_NET_TOTAL_BASIS: set_discount_net_total_basis,

		CMD_ADD_DISCOUNT: add_discount,
		CMD_ADD_ITEM_DISCOUNT: add_item_discount,
		CMD_ADD_ITEM_DISCOUNT_PERCENT: add_item_discount_percent,
		CMD_ADD_ITEM_GROUP_DISCOUNT: add_item_group_discount,
		CMD_ADD_ITEM_GROUP_DISCOUNT_PERCENT: add_item_group_discount_percent,

		CMD_APPLY_DISCOUNT: apply_discount,
		CMD_APPLY_DISCOUNT_PERCENT: apply_discount_percent,
		CMD_APPLY_NET_DISCOUNT: apply_discount,
		CMD_APPLY_NET_DISCOUNT_PERCENT: apply_discount_percent,
	})

def load_commands_meta(meta, for_doctype):
	meta.update({
		CMD_SET_DISCOUNT_GRAND_TOTAL_BASIS: {
			"description": "Sets the discount 'Apply On' basis to 'Grand Total'",
			"args": []
		},

		CMD_SET_DISCOUNT_NET_TOTAL_BASIS: {
			"description": "Sets the discount 'Apply On' basis to 'Net Total'",
			"args": []
		},

		CMD_ADD_DISCOUNT: {
			"description": "Adds a discount value to the existing discount in a quotation.",
			"args": [{
				"name": "discount",
				"description": "A discount value",
				"fieldtype": "Currency"
			}]
		},

		CMD_ADD_ITEM_DISCOUNT: {
			"description": "Adds a discount value to the existing discount per matching item.",
			"args": [{
				"name": "item_name",
				"description": "The item name to match",
				"fieldtype": "Link",
				"options": "Item"
			}, {
				"name": "discount",
				"description": "A discount value",
				"fieldtype": "Currency"
			}]
		},

		CMD_ADD_ITEM_DISCOUNT_PERCENT: {
			"description": "Adds a discount percent to the existing discount per matching item.",
			"args": [{
				"name": "item_name",
				"description": "The item name to match",
				"fieldtype": "Link",
				"options": "Item"
			}, {
				"name": "percent",
				"description": "A discount percent",
				"fieldtype": "Currency"
			}]
		},
		CMD_ADD_ITEM_GROUP_DISCOUNT: {
			"description": "Adds a discount value to the existing discount per matching item group.",
			"args": [{
				"name": "group_name",
				"description": "The item group name to match",
				"fieldtype": "Link",
				"options": "Item Group"
			}, {
				"name": "discount",
				"description": "A discount value",
				"fieldtype": "Currency"
			}]
		},

		CMD_ADD_ITEM_GROUP_DISCOUNT_PERCENT: {
			"description": "Adds a discount percent to the existing discount per matching item group.",
			"args": [{
				"name": "group_name",
				"description": "The item group name to match",
				"fieldtype": "Link",
				"options": "Item Group"
			}, {
				"name": "percent",
				"description": "A discount percent",
				"fieldtype": "Currency"
			}]
		},

		CMD_APPLY_DISCOUNT: {
			"description": "Applies discount value to a quotation based on its grand total.",
			"args": [{
				"name": "discount",
				"description": "A discount value",
				"fieldtype": "Currency"
			}]
		},

		CMD_APPLY_NET_DISCOUNT: {
			"description": "Applies discount value to a quotation based on its net total.",
			"args": [{
				"name": "discount",
				"description": "A discount value",
				"fieldtype": "Currency"
			}]
		},

		CMD_APPLY_DISCOUNT_PERCENT: {
			"description": "Applies discount percentage to a quotation based on its grand total.",
			"args": [{
				"name": "percent",
				"description": "A discount percent value",
				"fieldtype": "float"
			}]
		},

		CMD_APPLY_NET_DISCOUNT_PERCENT: {
			"description": "Applies discount percentage to a quotation based on its net total.",
			"args": [{
				"name": "percent",
				"description": "A discount percent value",
				"fieldtype": "float"
			}]
		}
	})


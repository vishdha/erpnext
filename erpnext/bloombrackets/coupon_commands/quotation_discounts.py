from frappe.utils import flt

NET_TOTAL = "Net Total"
GRAND_TOTAL = "Grand Total"

CMD_APPLY_DISCOUNT = "Apply Discount"
CMD_APPLY_DISCOUNT_PERCENT = "Apply Discount Percent"
CMD_APPLY_NET_DISCOUNT = "Apply Net Discount"
CMD_APPLY_NET_DISCOUNT_PERCENT = "Apply Net Discount Percent"

def load_commands(commands, for_doctype):

	def apply_discount(args, ctx):
		value = flt(args[0])
		ctx["#VARS"]["doc"].discount_amount = value
		ctx["#VARS"]["doc"].additional_discount_percentage = 0
		ctx["#VARS"]["doc"].apply_discount_on = GRAND_TOTAL
		ctx["#VARS"]["doc"].run_method("calculate_taxes_and_totals")

		# How we undo this script's data
		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_APPLY_DISCOUNT, 0]
		)
	
	def apply_discount_percent(args, ctx):
		percent = flt(args[0])
		#discount = (ctx["#VARS"]["doc"].grand_total * percent) / 100
		ctx["#VARS"]["doc"].discount_amount = 0
		ctx["#VARS"]["doc"].additional_discount_percentage = percent
		ctx["#VARS"]["doc"].apply_discount_on = GRAND_TOTAL
		ctx["#VARS"]["doc"].run_method("calculate_taxes_and_totals")

		# How we undo this script's data
		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_APPLY_DISCOUNT, 0]
		)

	def apply_net_discount(args, ctx):
		value = flt(args[0])
		ctx["#VARS"]["doc"].discount_amount = value
		ctx["#VARS"]["doc"].additional_discount_percentage = 0
		ctx["#VARS"]["doc"].apply_discount_on = NET_TOTAL
		ctx["#VARS"]["doc"].run_method("calculate_taxes_and_totals")

		# How we undo this script's data
		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_APPLY_DISCOUNT, 0]
		)
	
	def apply_net_discount_percent(args, ctx):
		percent = flt(args[0])
		discount = (ctx["#VARS"]["doc"].net_total * percent) / 100
		ctx["#VARS"]["doc"].discount_amount = 0
		ctx["#VARS"]["doc"].additional_discount_percentage = percent
		ctx["#VARS"]["doc"].apply_discount_on = NET_TOTAL
		ctx["#VARS"]["doc"].run_method("calculate_taxes_and_totals")

		# How we undo this script's data
		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_APPLY_DISCOUNT, 0]
		)

	commands.update({
		CMD_APPLY_DISCOUNT: apply_discount,
		CMD_APPLY_DISCOUNT_PERCENT: apply_discount_percent,
		CMD_APPLY_NET_DISCOUNT: apply_discount,
		CMD_APPLY_NET_DISCOUNT_PERCENT: apply_discount_percent,
	})

def load_commands_meta(meta, for_doctype):
	meta.update({
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


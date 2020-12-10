from frappe import flt

CMD_HAS_ITEM = "Find Item"
CMD_HAS_ITEM_MIN_QTY = "Find Item Min Qty"
CMD_HAS_ITEM_TOTAL_MIN_QTY = "Find Item Total Min Qty"

def load_commands(commands):

	def find_item(args, ctx):
		item_name = args[1]
		for item in ctx["#VAR"]["quotation"].items:
			if item.item_name == item_name:
				return True

		return False
	
	def find_item_min_qty(args, ctx):
		item_name = args[1]
		min_qty = args[2]
		for item in ctx["#VAR"]["quotation"].items:
			if item.item_name == item_name and item.qty >= min_qty:
				return True

		return False

	def find_item_total_min_qty(args, ctx):
		item_name = args[1]
		min_qty = args[2]
		total_qty = 0
		for item in ctx["#VAR"]["quotation"].items:
			if item.item_name == item_name:
				total_qty = total_qty + item.qty

		return True if total_qty >= min_qty else False


	commands.update({
		[CMD_HAS_ITEM]: find_item,
		[CMD_HAS_ITEM_MIN_QTY]: find_item_min_qty,
		[CMD_HAS_ITEM_TOTAL_MIN_QTY]: find_item_total_min_qty,
	})

def load_commands_meta(meta):
	meta.update({
		[CMD_HAS_ITEM]: {
			"description": "Finds item in document.",
			"returns": "boolean",
			"args": [{
				"name": "item_name",
				"description": "The item's name",
				"fieldtype": "Link"
				"options": "Item"
			}]
		},
		
		[CMD_HAS_ITEM_MIN_QTY]: {
			"description": "Finds item in document with a minimum qty value.",
			"returns": "boolean",
			"args": [{
				"name": "item_name",
				"description": "The item's name",
				"fieldtype": "Link"
				"options": "Item"
			}, {
				"name": "qty",
				"description", "The minimum qty to should match.",
				"fieldtype": "int"
			}]
		},

		[CMD_HAS_ITEM_TOTAL_MIN_QTY]: {
			"description": "Returns true when the total qty of all items match is equal or above the min qty provided.",
			"returns": "boolean",
			"args": [{
				"name": "item_name",
				"description": "The item's name",
				"fieldtype": "Link"
				"options": "Item"
			}, {
				"name": "qty",
				"description", "The minimum qty to should match.",
				"fieldtype": "int"
			}]
		},
	})


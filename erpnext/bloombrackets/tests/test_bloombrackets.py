import frappe
import unittest

from erpnext.bloombrackets import resolve_expression
from erpnext.bloombrackets.commands import *

def create_script():
	return [
		[""]
	]

class TestBloomBrackets(unittest.TestCase):
	def test_reduce_cmd(self):
		array_values = [1, 2, 3, 4]
		value = resolve_expression([CMD_ARRAY, 1, 2, 3, 4], {})

		self.assertTrue(value == array_values, "{} == {}".format(value, array_values))

	def test_arithmetic(self):
		self.assertTrue(resolve_expression([CMD_ADD, 1, 2], {}) == 3, "1 + 2")
		self.assertTrue(resolve_expression([CMD_SUBSTRACT, 1, 2], {}) == -1, "1 - 2")
		self.assertTrue(resolve_expression([CMD_MULTIPLY, 1, 2], {}) == 2, "1 * 2")
		self.assertTrue(resolve_expression([CMD_DIVIDE, 1, 2], {}) == .5, "1 / 2")

	def test_conditionals(self):
		self.assertTrue(resolve_expression([CMD_TRUE, 1, 1], {}) == True, "1 == 1")
		self.assertTrue(resolve_expression([CMD_TRUE, 1, 1, 1], {}) == True, "1 == 1 == 1")
		self.assertTrue(resolve_expression([CMD_FALSE, 1, 2], {}) == True, "1 != 2")
		self.assertTrue(resolve_expression([CMD_FALSE, 1, 2, 3], {}) == True, "1 != 2 != 3")
		self.assertTrue(resolve_expression([CMD_EQUALS, 1, 1], {}) == True, "1 == 1")
		self.assertTrue(resolve_expression([CMD_EQUALS, 1, 1, 1], {}) == True, "1 == 1 == 1")
		self.assertTrue(resolve_expression([CMD_NOT_EQUALS, 1, 2], {}) == True, "1 != 2")
		self.assertTrue(resolve_expression([CMD_NOT_EQUALS, 1, 2, 3], {}) == True, "1 != 2 != 3")

	def test_comparison(self):
		self.assertTrue(resolve_expression([CMD_GREATER_THAN, 2, 1], {}) == True, "2 > 1")
		self.assertTrue(resolve_expression([CMD_GREATER_THAN, 1, 2], {}) == False, "1 > 2")
		self.assertTrue(resolve_expression([CMD_GREATER_AND_EQUAL, 2, 1], {}) == True, "2 >= 1")
		self.assertTrue(resolve_expression([CMD_GREATER_AND_EQUAL, 1, 2], {}) == False, "1 >= 2")
		self.assertTrue(resolve_expression([CMD_LESS_THAN, 1, 2], {}) == True, "1 < 2")
		self.assertTrue(resolve_expression([CMD_LESS_THAN, 2, 1], {}) == False, "2 < 1")
		self.assertTrue(resolve_expression([CMD_LESS_AND_EQUAL, 1, 2], {}) == True, "1 <= 2")
		self.assertTrue(resolve_expression([CMD_LESS_AND_EQUAL, 2, 1], {}) == False, "2 <= 1")

	def test_bitwise_and(self):
		self.assertTrue(resolve_expression([CMD_AND, True, True], {}) == True, "True and True")
		self.assertTrue(resolve_expression([CMD_AND, True, False], {}) == False, "True and False")
		self.assertTrue(resolve_expression([CMD_AND, False, True], {}) == False, "False and True")
		self.assertTrue(resolve_expression([CMD_AND, False, False], {}) == False, "False and False")

	def test_bitwise_or(self):
		self.assertTrue(resolve_expression([CMD_OR, True, True], {}) == True, "True or True")
		self.assertTrue(resolve_expression([CMD_OR, True, False], {}) == True, "True or False")
		self.assertTrue(resolve_expression([CMD_OR, False, True], {}) == True, "False or True")
		self.assertTrue(resolve_expression([CMD_OR, False, False], {}) == False, "False or False")

	def test_bitwise_xor(self):
		self.assertTrue(resolve_expression([CMD_XOR, True, True], {}) == False, "True xor True")
		self.assertTrue(resolve_expression([CMD_XOR, True, False], {}) == True, "True xor False")
		self.assertTrue(resolve_expression([CMD_XOR, False, True], {}) == True, "False xor True")
		self.assertTrue(resolve_expression([CMD_XOR, False, False], {}) == False, "False xor False")

	def test_bitwise_not(self):
		self.assertTrue(resolve_expression([CMD_NOT, True, True], {}) == False, "True not True")
		self.assertTrue(resolve_expression([CMD_NOT, True, False], {}) == True, "True not False")
		self.assertTrue(resolve_expression([CMD_NOT, False, True], {}) == True, "False not True")
		self.assertTrue(resolve_expression([CMD_NOT, False, False], {}) == True, "False not False")

	def test_deep_resolve_expression(self):
		complex_bool_array = [CMD_ARRAY, [CMD_EQUALS, 1, 1], [CMD_EQUALS, 1, 2]]
		complex_int_array = [CMD_ARRAY, [CMD_ADD, 1, 1], 3]
		complex_mixed_array = [CMD_ARRAY, [CMD_ADD, 1, [CMD_ADD, 1, 1]], 4, 5]

		self.assertTrue(resolve_expression(complex_bool_array, {}) == [True, False])
		self.assertTrue(resolve_expression(complex_int_array, {}) == [2, 3])
		self.assertTrue(resolve_expression(complex_mixed_array, {}) == [3, 4, 5])

	def test_if_then_else(self):

		script = [CMD_IF, [CMD_NOT_EQUALS, [CMD_VAR, "foo"], "bar"], [
			[CMD_SET, "foo", "bar"]
		], [
			[CMD_SET, "foo", "nvm"],
			[CMD_SET, "foo_set", True]
		]]

		ctx1 = {}
		resolve_expression(script, ctx1)
		self.assertTrue(ctx1.get("foo") == "bar" and ctx1.get("foo_set") == None, ctx1)

		ctx2 = { "foo": "bar"}
		resolve_expression(script, ctx2)
		self.assertTrue(ctx2.get("foo") == "nvm" and ctx2.get("foo_set") == True, ctx2)

	def test_if_no_else(self):
		script = [CMD_IF, [CMD_NOT_EQUALS, [CMD_VAR, "foo"], "bar"], [
			[CMD_SET, "bar", "foo"]
		]]

		ctx1 = { "foo": "bar"}
		resolve_expression(script, ctx1)
		self.assertTrue(ctx1.get("foo") == "bar" and ctx1.get("bar") == None, ctx1)

	def test_var_resolve(self):
		
		ctx = { "doc": frappe.new_doc("Quotation", {

		}) }
		print(ctx)

		name = resolve_expression([CMD_SET, "foo", [CMD_VAR, "doc", "name"]], ctx)
		print(name)
		print(resolve_expression([CMD_VAR, "doc", "status"], ctx))

		self.assertTrue(name != None)

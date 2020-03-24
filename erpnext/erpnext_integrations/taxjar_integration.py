import traceback

import pycountry
import taxjar

import frappe
from erpnext import get_default_company
from frappe import _
from frappe.contacts.doctype.address.address import get_company_address

TAX_ACCOUNT_HEAD = frappe.db.get_single_value("TaxJar Settings", "tax_account_head")
SHIP_ACCOUNT_HEAD = frappe.db.get_single_value("TaxJar Settings", "shipping_account_head")

def create_transaction(doc, method):
	# Allow skipping creation of transaction for dev environment
	# if taxjar_create_transactions isn't defined in site_config we assume
	# we DO NOT want to create transactions all the time, except on production.

	if not frappe.local.conf.get("taxjar_create_transactions"):
		return

	sales_tax = 0

	for tax in doc.taxes:
		if tax.account_head == TAX_ACCOUNT_HEAD:
			sales_tax = tax.tax_amount

	if not sales_tax:
		return

	tax_dict = get_tax_data(doc)

	if not tax_dict:
		return

	tax_dict['transaction_id'] = doc.name
	tax_dict['transaction_date'] = frappe.utils.today()
	tax_dict['sales_tax'] = sales_tax
	tax_dict['amount'] = doc.total + tax_dict['shipping']

	client = get_client()

	try:
		client.create_order(tax_dict)
	except taxjar.exceptions.TaxJarResponseError as err:
		frappe.throw(_(sanitize_error_response(err)))
	except Exception as ex:
		print(traceback.format_exc(ex))


def delete_transaction(doc, method):
	client = get_client()
	client.delete_order(doc.name)


def get_client():
	taxjar_settings = frappe.get_single("TaxJar Settings")

	if not taxjar_settings.api_key:
		frappe.throw(_("The TaxJar API key is missing."), frappe.AuthenticationError)

	api_key = taxjar_settings.get_password("api_key")
	return taxjar.Client(api_key=api_key)


def get_shipping_address(doc):
	company_address = get_company_address(get_default_company()).company_address
	company_address = frappe.get_doc("Address", company_address)
	shipping_address = None

	if company_address:
		if doc.shipping_address_name:
			shipping_address = frappe.get_doc("Address", doc.shipping_address_name)
		else:
			shipping_address = company_address

	return shipping_address


def get_tax_data(doc):
	shipping_address = get_shipping_address(doc)

	if not shipping_address:
		return

	if shipping_address.country:
		country_code = frappe.db.get_value("Country", shipping_address.country, "code")
		country_code = country_code.upper()
	else:
		frappe.throw(_("Please select a country!"))

	if country_code != "US":
		return

	shipping = 0

	for tax in doc.taxes:
		if tax.account_head == SHIP_ACCOUNT_HEAD:
			shipping += tax.tax_amount

	shipping_state = shipping_address.get("state")

	if shipping_state is not None:
		# Handle shipments to military addresses
		if shipping_state.upper() in ("AE", "AA", "AP"):
			frappe.throw(_("""For shipping to overseas US bases, please
							contact us with your order details."""))
		else:
			shipping_state = validate_state(shipping_address)

	tax_dict = {
		'to_country': country_code,
		'to_zip': shipping_address.pincode,
		'to_city': shipping_address.city,
		'to_state': shipping_state,
		'shipping': shipping,
		'amount': doc.net_total
	}

	return tax_dict


def sanitize_error_response(response):
	response = response.full_response.get("detail")
	response = response.replace("_", " ")

	sanitized_responses = {
		"to zip": "Zipcode",
		"to city": "City",
		"to state": "State",
		"to country": "Country"
	}

	for k, v in sanitized_responses.items():
		response = response.replace(k, v)

	return response


def set_sales_tax(doc, method):
	if not doc.items:
		return

	# Allow skipping calculation of tax for dev environment
	# if taxjar_calculate_tax isn't defined in site_config we assume
	# we DO want to calculate tax all the time.
	if not frappe.local.conf.get("taxjar_calculate_tax", 1):
		return

	if doc.exempt_from_sales_tax or frappe.db.get_value("Customer", doc.customer, "exempt_from_sales_tax"):
		for tax in doc.taxes:
			if tax.account_head == TAX_ACCOUNT_HEAD:
				tax.tax_amount = 0
				break

		doc.run_method("calculate_taxes_and_totals")
		return

	tax_dict = get_tax_data(doc)

	if not tax_dict:
		# Remove existing tax rows if address is changed from a taxable state/country
		setattr(doc, "taxes", [tax for tax in doc.taxes if tax.account_head != TAX_ACCOUNT_HEAD])
		return

	tax_data = validate_tax_request(tax_dict)

	if tax_data is not None:
		if not tax_data.amount_to_collect:
			setattr(doc, "taxes", [tax for tax in doc.taxes if tax.account_head != TAX_ACCOUNT_HEAD])
		elif tax_data.amount_to_collect > 0:
			# Loop through tax rows for existing Sales Tax entry
			# If none are found, add a row with the tax amount
			for tax in doc.taxes:
				if tax.account_head == TAX_ACCOUNT_HEAD:
					tax.tax_amount = tax_data.amount_to_collect

					doc.run_method("calculate_taxes_and_totals")
					break
			else:
				doc.append("taxes", {
					"charge_type": "Actual",
					"description": "Sales Tax",
					"account_head": TAX_ACCOUNT_HEAD,
					"tax_amount": tax_data.amount_to_collect
				})

			doc.run_method("calculate_taxes_and_totals")


def validate_address(doc, address):
	# Validate address using PyCountry
	tax_dict = get_tax_data(doc)

	if tax_dict:
		# Validate address using TaxJar
		validate_tax_request(tax_dict)


def validate_tax_request(tax_dict):
	client = get_client()

	try:
		tax_data = client.tax_for_order(tax_dict)
		print("tax_data", tax_data)
	except taxjar.exceptions.TaxJarResponseError as err:
		frappe.throw(_(sanitize_error_response(err)))
	else:
		return tax_data


def validate_state(address):
	country_code = frappe.db.get_value("Country", address.get("country"), "code")

	error_message = _("""{} is not a valid state! Check for typos or enter the ISO code for your state.""".format(address.get("state")))
	state = address.get("state").upper().strip()

	# The max length for ISO state codes is 3, excluding the country code
	if len(state) <= 3:
		address_state = (country_code + "-" + state).upper()  # PyCountry returns state code as {country_code}-{state-code} (e.g. US-FL)

		states = pycountry.subdivisions.get(country_code=country_code.upper())
		states = [pystate.code for pystate in states]

		if address_state in states:
			return state

		frappe.throw(error_message)
	else:
		try:
			lookup_state = pycountry.subdivisions.lookup(state)
		except LookupError:
			frappe.throw(error_message)
		else:
			return lookup_state.code.split('-')[1]

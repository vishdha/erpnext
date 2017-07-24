$.extend(frappe.test_data, {
	// "Fiscal Year": {
	// 	"2017-18": [
	// 		{"year": "2017-18"},
	// 		{"year_start_date": "2017-04-01"},
	// 		{"year_end_date": "2018-03-31"},
	// 	]
	// },
	"Customer": {
		"Test Customer 1": [
			{customer_name: "Test Customer 1"}
		],
		"Test Customer 2": [
			{customer_name: "Test Customer 2"}
		],
		"Test Customer 3": [
			{customer_name: "Test Customer 3"}
		],
	},
	"Item": {
		"Test Product 1": [
			{item_code: "Test Product 1"},
			{item_group: "Products"},
			{is_stock_item: 1},
			{standard_rate: 100},
			{opening_stock: 100},
		],
		"Test Product 2": [
			{item_code: "Test Product 2"},
			{item_group: "Products"},
			{is_stock_item: 1},
			{standard_rate: 150},
			{opening_stock: 200},
		],
		"Test Product 3": [
			{item_code: "Test Product 3"},
			{item_group: "Products"},
			{is_stock_item: 1},
			{standard_rate: 250},
			{opening_stock: 100},
		],
		"Test Service 1": [
			{item_code: "Test Service 1"},
			{item_group: "Services"},
			{is_stock_item: 0},
			{standard_rate: 200}
		],
		"Test Service 2": [
			{item_code: "Test Service 2"},
			{item_group: "Services"},
			{is_stock_item: 0},
			{standard_rate: 300}
		],
		"Test Product 4": [
			{item_code: "Test Product 4"},
			{item_group: "Products"},
			{is_stock_item: 1},
			{has_batch_no: 1},
			{create_new_batch: 1},
			{has_serial_no: 1},
			{standard_rate: 100},
			{opening_stock: 100},
		]
	},
	"Lead": {
		"LEAD-00001": [
			{lead_name: "Test Lead 1"}
		],
		"LEAD-00002": [
			{lead_name: "Test Lead 2"}
		],
		"LEAD-00003": [
			{lead_name: "Test Lead 3"}
		]
	},
	"Address": {
		"Test1-Billing": [
			{address_title:"Test1"},
			{address_type: "Billing"},
			{address_line1: "Billing Street 1"},
			{city: "Billing City 1"},
			{links: [
				[
					{link_doctype: "Customer"},
					{link_name: "Test Customer 1"}
				]
			]}
		],
		"Test1-Shipping": [
			{address_title:"Test1"},
			{address_type: "Shipping"},
			{address_line1: "Shipping Street 1"},
			{city: "Shipping City 1"},
			{links: [
				[
					{link_doctype: "Customer"},
					{link_name: "Test Customer 1"}
				]
			]}
		],
		"Test1-Warehouse": [
			{address_title:"Test1"},
			{address_type: "Warehouse"},
			{address_line1: "Warehouse Street 1"},
			{city: "Warehouse City 1"},
			{links: [
				[
					{link_doctype: "Customer"},
					{link_name: "Test Customer 1"}
				]
			]}
		],
		"Test2-Billing": [
			{address_title:"Test2"},
			{address_type: "Billing"},
			{address_line1: "Billing Street 2"},
			{city: "Billing City 2"},
			{links: [
				[
					{link_doctype: "Customer"},
					{link_name: "Test Customer 2"}
				]
			]}
		],
		"Test2-Shipping": [
			{address_title:"Test2"},
			{address_type: "Shipping"},
			{address_line1: "Shipping Street 2"},
			{city: "Shipping City 2"},
			{links: [
				[
					{link_doctype: "Customer"},
					{link_name: "Test Customer 2"}
				]
			]}
		],
		"Test2-Warehouse": [
			{address_title:"Test2"},
			{address_type: "Warehouse"},
			{address_line1: "Warehouse Street 2"},
			{city: "Warehouse City 2"},
			{links: [
				[
					{link_doctype: "Customer"},
					{link_name: "Test Customer 2"}
				]
			]}
		]
	},
	"Contact": {
		"Contact 1-Test Customer 1": [
			{first_name: "Contact 1"},
			{links: [
				[
					{link_doctype: "Customer"},
					{link_name: "Test Customer 1"}
				]
			]}
		],
		"Contact 2-Test Customer 1": [
			{first_name: "Contact 2"},
			{links: [
				[
					{link_doctype: "Customer"},
					{link_name: "Test Customer 1"}
				]
			]}
		],
		"Contact 1-Test Customer 2": [
			{first_name: "Contact 1"},
			{links: [
				[
					{link_doctype: "Customer"},
					{link_name: "Test Customer 2"}
				]
			]}
		],
		"Contact 2-Test Customer 2": [
			{first_name: "Contact 2"},
			{links: [
				[
					{link_doctype: "Customer"},
					{link_name: "Test Customer 2"}
				]
			]}
		],
	},
	"Price List": {
		"Test-Buying-USD": [
			{price_list_name: "Test-Buying-USD"},
			{currency: "USD"},
			{buying: "1"}
		],
		"Test-Buying-EUR": [
			{price_list_name: "Test-Buying-EUR"},
			{currency: "EUR"},
			{buying: "1"}
		],
		"Test-Selling-USD": [
			{price_list_name: "Test-Selling-USD"},
			{currency: "USD"},
			{selling: "1"}
		],
		"Test-Selling-EUR": [
			{price_list_name: "Test-Selling-EUR"},
			{currency: "EUR"},
			{selling: "1"}
		],
	},
	"Terms and Conditions": {
		"Test Term 1": [
			{title: "Test Term 1"},
			{terms: "Test 1"}

		],
		"Test Term 2": [
			{title: "Test Term 2"},
			{terms: "Test 2"}

		]
	},
	"Sales Taxes and Charges Template": {
		"TEST In State GST": [
			{title: "TEST In State GST"},
			{taxes:[
				[
					{charge_type:"On Net Total"},
					{account_head:"CGST - "+frappe.get_abbr(frappe.defaults.get_default("Company")) }
				],
				[
					{charge_type:"On Net Total"},
					{account_head:"SGST - "+frappe.get_abbr(frappe.defaults.get_default("Company")) }
				]
			]}
		]
	}
});


// this is a script that creates all fixtures
// called as a test
QUnit.module('fixture');

QUnit.test('Make fixtures', assert => {
	// create all fixtures first
	assert.expect(0);
	let done = assert.async();
	let tasks = [];
	Object.keys(frappe.test_data).forEach(function(doctype) {
		tasks.push(function() { return frappe.tests.setup_doctype(doctype); });
	});
	frappe.run_serially(tasks).then(() => done());
});

// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.ui.form.on('Sales Person', {
	refresh: function(frm) {
		// read-only for root sales group
		frm.set_root_read_only("parent_sales_person");
		if(frm.doc.__onload && frm.doc.__onload.dashboard_info) {
			var info = frm.doc.__onload.dashboard_info;
			frm.dashboard.add_indicator(__('Total Contribution Amount: {0}',
				[format_currency(info.allocated_amount, info.currency)]), 'blue');
		}
	},

	employee: function(frm) {
		frm.toggle_enable("sales_person_name", !frm.doc.employee);
		if (!frm.doc.employee) {
			frm.set_value("sales_person_name", "");
		}
	},

	setup: function(frm) {
		frm.fields_dict["targets"].grid.get_field("distribution_id").get_query = function(doc, cdt, cdn){
			var row = locals[cdt][cdn];
			return {
				filters: {
					'fiscal_year': row.fiscal_year
				}
			}
		};

		frm.fields_dict['parent_sales_person'].get_query = function(doc) {
			return{
				filters: [
					['Sales Person', 'is_group', '=', 1],
					['Sales Person', 'name', '!=', doc.sales_person_name]
				]
			}
		};

		frm.fields_dict.employee.get_query = function() {
			return { query: "erpnext.controllers.queries.employee_query" }
		}
	
		frm.make_methods = {
			'Sales Order': () => frappe.new_doc("Sales Order")
				.then(() => frm.add_child("sales_team", {"sales_person": frm.doc.name}))
		}
	}
});

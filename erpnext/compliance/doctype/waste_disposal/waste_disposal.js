/* global frappe, erpnext, __ */

// Copyright (c) 2020, Bloom Stack, Inc and contributors
// For license information, please see license.txt

frappe.ui.form.on("Waste Disposal", {
	setup: function(frm) {
		erpnext.queries.setup_queries(frm, "Warehouse", function() {
			return erpnext.queries.warehouse(frm.doc);
		});

		frm.set_query('batch_no', 'items', (frm, cdt, cdn) => {
			const row = locals[cdt][cdn];
			if (!row.warehouse) {
				frappe.throw(__("Row #{0}: Please select a warehouse.", [row.idx]));
			}
			return {
				query: 'erpnext.controllers.queries.get_batch_no',
				filters: {
					item_code: row.item_code,
					warehouse: row.warehouse
				},
			};
		});
	},

	refresh: function(frm) {
		// Add button to retrieve items for disposal
		if (frm.doc.docstatus < 1) {
			frm.add_custom_button(__("Get Items from Warehouse"), function () {
				frm.events.get_items(frm);
			});
		}

		frm.fields_dict.items.grid.get_field("item_code").get_query = function () {
			return erpnext.queries.item({ is_stock_item: 1 });
		};
	},

	before_submit: (frm) => {
		frappe.call({
			method: "erpnext.compliance.doctype.waste_disposal.waste_disposal.create_stock_entry_for_waste_disposal",
			args: {
				doc: frm.doc
			},
			callback: (r) => {
				if (!r.exc) {
					frm.set_value("stock_entry", r.message);

					let stock_entry_link = frappe.utils.get_form_link("Stock Entry", r.message);
					frappe.msgprint(__(`Stock Entry <a href="${stock_entry_link}">${r.message}</a> was created`));
					frm.refresh();
				}
			}
		});
	},

	get_items: function (frm) {
		frappe.prompt({
			label: "Warehouse",
			fieldname: "warehouse",
			fieldtype: "Link",
			options: "Warehouse",
			default: frm.doc.s_warehouse,
			reqd: 1
		},
		function (data) {
			frappe.call({
				method: "erpnext.compliance.doctype.waste_disposal.waste_disposal.get_items",
				args: {
					warehouse: data.warehouse,
					posting_date: frm.doc.disposal_date || frappe.datetime.now_date(),
					posting_time: frm.doc.disposal_time || frappe.datetime.now_time(),
					company: frappe.boot.sysdefaults.company
				},
				callback: function (r) {
					frm.clear_table("items");
					for (let item of r.message) {
						frm.add_child("items", item);
					}
					frm.refresh_field("items");
				}
			});
		}, __("Get Items from Warehouse"), __("Update"));
	},
});

// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Harvest', {
	refresh: (frm) => {
		if (frm.doc.docstatus === 1) {
			frm.add_custom_button(__('Stock Entry'), () => frm.trigger('create_stock_entry'), __('Create'));
			frm.page.set_inner_btn_group_as_primary(__('Create'));
		}
	},
	create_stock_entry: (frm) => {
		frappe.xcall('erpnext.agriculture.doctype.harvest.harvest.create_stock_entry', {
			'harvest': frm.doc.name,
		}).then(stock_entry => {
			frappe.model.sync(stock_entry);
			frappe.set_route("Form", 'Stock Entry', stock_entry.name);
		});
	},
});

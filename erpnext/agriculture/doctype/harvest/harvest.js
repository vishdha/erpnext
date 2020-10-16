// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Harvest', {
	refresh: function (frm) {
		if (frm.doc.docstatus === 1) {
			frm.add_custom_button(__("Finish"), () => {
				frappe.call({
					method: 'erpnext.agriculture.doctype.harvest.harvest.finish_harvest',
					args: { 'harvest': frm.doc.name },
					callback: (r) => {
						if (r.message) {
							frm.reload_doc();
						}
					}
				})
			});

			frm.add_custom_button(__("UnFinish"), () => {
				frappe.call({
					method: 'erpnext.agriculture.doctype.harvest.harvest.unfinish_harvest',
					args: { 'harvest': frm.doc.name },
					callback: (r) => {
						if (r.message) {
							frm.reload_doc();
						}
					}
				})
			});
		}
	}
});

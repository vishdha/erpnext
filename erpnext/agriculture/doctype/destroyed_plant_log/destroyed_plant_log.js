// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Destroyed Plant Log', {
	setup: function(frm){
		frm.set_query("category", function () {
			return { "filters": { "name": ["in", ["Plant Batch", "Plant"]] } }
		});
	},
	refresh: function(frm){
		frm.trigger('set_dynamic_field_lable');
	},
	category: function(frm){
		frm.trigger('set_dynamic_field_lable');
	},
	set_dynamic_field_lable: function(frm){
		if (frm.doc.category) {
			frm.set_df_property("plant", "label", frm.doc.category);
		}
	}
});

// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Destroyed Plant Log', {
	category: function(frm){
		frm.toggle_display('plant', frm.doc.category === "Plant");
		frm.set_df_property('plant', 'reqd', frm.doc.category === "Plant");
		frm.toggle_display('plant_batch', frm.doc.category === "Plant Batch");
		frm.set_df_property('plant_batch', 'reqd', frm.doc.category === "Plant Batch");
	}
});

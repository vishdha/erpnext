// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.ui.form.on("Territory", {
	setup: function(frm) {
		frm.fields_dict["targets"].grid.get_field("distribution_id").get_query = function(doc, cdt, cdn){
			var row = locals[cdt][cdn];
			return {
				filters: {
					'fiscal_year': row.fiscal_year
				}
			}
		};
		frm.fields_dict['parent_territory'].get_query = function(doc) {
			return{
				filters:[
					['Territory', 'is_group', '=', 1],
					['Territory', 'name', "!=", doc.territory_name]
				]
			}
		}
	},
	refresh: function(frm) {
		frm.trigger("set_root_readonly");
	},
	set_root_readonly: function(frm) {
		// read-only for root Sales group
		if(!frm.doc.parent_territory && !frm.is_new()) {
			frm.set_read_only();
			frm.set_intro(__("This is a root Territory and cannot be edited."), true);
		}
	}
});
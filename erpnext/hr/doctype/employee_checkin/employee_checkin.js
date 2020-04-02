// Copyright (c) 2019, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Employee Checkin', {
	before_load: function(frm) {
		var update_tz_select = function(user_language) {
			frm.set_df_property("time_zone", "options", [""].concat(frappe.all_timezones));
		};

		if(!frappe.all_timezones) {
			frappe.call({
				method: "frappe.core.doctype.user.user.get_timezones",
				callback: function(r) {
					frappe.all_timezones = r.message.timezones;
					update_tz_select();
				}
			});
		} else {
			update_tz_select();
		}

	},
	setup: (frm) => {
		if(!frm.doc.time) {
			console.log("yes");
			frm.set_value("time", frappe.datetime.convert_to_user_tz(frappe.datetime.now_datetime()));
		}
		// else {
		// 	frm.set_value("time", frappe.datetime.now_datetime());
		// }
	}
});

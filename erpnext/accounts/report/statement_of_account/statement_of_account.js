// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Statement of Account"] = {
	filters: [
		{
			fieldname: "company",
			label: __("Company"),
			fieldtype: "Link",
			options: "Company",
			default: frappe.defaults.get_user_default("Company"),
			reqd: 1,
			on_change: (report) => {
				get_addresses(report);
			},
		},
		{
			fieldname: "finance_book",
			label: __("Finance Book"),
			fieldtype: "Link",
			options: "Finance Book",
		},
		{
			fieldname: "from_date",
			label: __("From Date"),
			fieldtype: "Date",
			default: frappe.datetime.add_months(frappe.datetime.get_today(), -1),
			reqd: 1,
			width: "60px",
		},
		{
			fieldname: "to_date",
			label: __("To Date"),
			fieldtype: "Date",
			default: frappe.datetime.get_today(),
			reqd: 1,
			width: "60px",
		},
		{
			fieldname: "account",
			label: __("Account"),
			fieldtype: "Link",
			options: "Account",
			get_query: function () {
				var company = frappe.query_report.get_filter_value("company");
				return {
					doctype: "Account",
					filters: {
						company: company,
					},
				};
			},
		},
		{
			fieldtype: "Break",
		},
		{
			fieldname: "party_type",
			label: __("Party Type"),
			fieldtype: "Link",
			options: "Party Type",
			default: "",
			on_change: function (report) {
				frappe.query_report.set_filter_value("party", "");
				get_addresses(report);
			},
		},
		{
			fieldname: "party",
			label: __("Party"),
			fieldtype: "MultiSelectList",
			get_data: function (txt) {
				if (!frappe.query_report.filters) {
					return true;
				}
				let party_type = frappe.query_report.get_filter_value("party_type");
				if (!party_type) {
					return true;
				}

				return frappe.db.get_link_options(party_type, txt);
			},
			on_change: function (report) {
				var party_type = frappe.query_report.get_filter_value("party_type");
				var parties = frappe.query_report.get_filter_value("party");

				if (!party_type || parties.length === 0 || parties.length > 1) {
					frappe.query_report.set_filter_value("party_name", "");
					return;
				} else {
					var party = parties[0];
					var fieldname = erpnext.utils.get_party_name(party_type) || "name";
					frappe.db.get_value(party_type, party, fieldname, function (value) {
						frappe.query_report.set_filter_value(
							"party_name",
							value[fieldname]
						);
					});
				}

				get_addresses(report);
			},
		},
		{
			fieldname: "party_name",
			label: __("Party Name"),
			fieldtype: "Data",
			hidden: 1,
		},
	],
	onload: function(report) {
		console.log("reprt", report)
		report.page.add_inner_button(__("Notify Party via Email"), function() {
			var filters = report.get_values();
			let reporter = frappe.query_reports["Statement of Account"];

			//Always make a new one so that the latest values get updated
			reporter.notify_party(report, filters);
		});
	},

	// email_report: (print_settings) => {
	// 	const base_url = frappe.urllib.get_base_url();
	// 	const print_css = frappe.boot.print_css;
	// 	const landscape = print_settings.orientation == 'Landscape';

	// 	const custom_format = this.report_settings.html_format || null;
	// 	const columns = this.get_columns_for_print(print_settings, custom_format);
	// 	const data = this.get_data_for_print();
	// 	const applied_filters = this.get_filter_values();

	// 	const filters_html = this.get_filters_html_for_print();
	// 	const template =
	// 		print_settings.columns || !custom_format ? 'print_grid' : custom_format;
	// 	const content = frappe.render_template(template, {
	// 		title: __(this.report_name),
	// 		subtitle: filters_html,
	// 		filters: applied_filters,
	// 		data: data,
	// 		original_data: this.data,
	// 		columns: columns,
	// 		report: this
	// 	});
		

	// 	// Render Report in HTML
	// 	const html = frappe.render_template('print_template', {
	// 		title: __(this.report_name),
	// 		content: content,
	// 		base_url: base_url,
	// 		print_css: print_css,
	// 		print_settings: print_settings,
	// 		landscape: landscape,
	// 		columns: columns
	// 	});
	// 	console.log("html", html);
	// },

	get_visible_columns() {
		const visible_column_ids = this.datatable.datamanager.getColumns(true).map(col => col.id);

		return visible_column_ids
			.map(id => this.columns.find(col => col.id === id))
			.filter(Boolean);
	},
	notify_party: function (report, filters) {
		function email_report(report, print_settings) {
			let html = report.pdf_report(print_settings, true);
			let report_pdf = frappe.render_pdf(html, print_settings)
			console.log("rep", report_pdf)
		}
		if (!filters.party.length) {
			frappe.throw(__("Missing Party filter value."));
		} else {
			frappe.confirm(__("Do you want to notify the party by email?"), function () {
				let dialog = frappe.ui.get_print_settings(
					false,
					print_settings => email_report(report, print_settings),
					report.report_doc.letter_head,
					report.get_visible_columns()
				);
				// report.add_portrait_warning(dialog);

			
				
			

				frappe.call({
					method: "erpnext.accounts.report.statement_of_account.statement_of_account.notify_party",
					args: {
						"filters": filters,
						"report": report.report_doc
					},
					callback: function (r) {
						if (!r.exc) {
							console.log("r", r.message)
						}
					}
				});
			});
		}
	}
};

erpnext.utils.add_dimensions("Statement of Account", 15);

function get_addresses(report) {
	let filters = report.get_filter_values();

	if (!filters.company || !filters.party_type || !filters.party[0]) {
		return;
	}

	frappe.call({
		method:
			"erpnext.accounts.report.statement_of_account.statement_of_account.get_addresses",
		args: {
			company: filters.company,
			party_type: filters.party_type,
			party: filters.party[0],
		},
		callback: function (r) {
			report.addresses = r.message;
		},
	});
}

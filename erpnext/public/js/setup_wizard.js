frappe.provide("erpnext.setup");

frappe.pages['setup-wizard'].on_page_load = function(wrapper) {
	if(frappe.sys_defaults.company) {
		frappe.set_route("desk");
		return;
	}
};

var erpnext_slides = [
	{
		// Domain
		name: 'domain',
		domains: ["all"],
		title: __('Select your Domain'),
		fields: [
			{
				fieldname: 'domain', label: __('Domain'), fieldtype: 'Select',
				options: [
					{ "label": __("Distribution"), "value": "Distribution" },
					{ "label": __("Education"), "value": "Education" },
					{ "label": __("Manufacturing"), "value": "Manufacturing" },
					{ "label": __("Retail"), "value": "Retail" },
					{ "label": __("Services"), "value": "Services" }
				], reqd: 1
			},
		],
		help: __('Select the nature of your business.'),
		onload: function (slide) {
			slide.get_input("domain").on("change", function () {
				frappe.setup.domain = $(this).val();
				frappe.wizard.refresh_slides();
			});
		},
	},

	{
		// Brand
		name: 'brand',
		domains: ["all"],
		icon: "fa fa-bookmark",
		title: __("The Brand"),
		help: __('Upload your letter head and logo. (you can edit them later).'),
		fields: [
			{
				fieldtype: "Attach Image", fieldname: "attach_logo",
				label: __("Attach Logo"),
				description: __("100px by 100px"),
				is_private: 0
			},
			{
				fieldname: 'company_name',
				label: frappe.setup.domain === 'Education' ?
					__('Institute Name') : __('Company Name'),
				fieldtype: 'Data', reqd: 1
			},
			{
				fieldname: 'company_abbr',
				label: frappe.setup.domain === 'Education' ?
					__('Institute Abbreviation') : __('Company Abbreviation'),
				fieldtype: 'Data'
			}
		],
		onload: function(slide) {
			this.bind_events(slide);
		},
		bind_events: function (slide) {
			slide.get_input("company_name").on("change", function () {
				var parts = slide.get_input("company_name").val().split(" ");
				var abbr = $.map(parts, function (p) { return p ? p.substr(0, 1) : null }).join("");
				slide.get_field("company_abbr").set_input(abbr.slice(0, 5).toUpperCase());
			}).val(frappe.boot.sysdefaults.company_name || "").trigger("change");

			slide.get_input("company_abbr").on("change", function () {
				if (slide.get_input("company_abbr").val().length > 5) {
					frappe.msgprint("Company Abbreviation cannot have more than 5 characters");
					slide.get_field("company_abbr").set_input("");
				}
			});
		}
	},
	{
		// Organisation
		name: 'organisation',
		domains: ["all"],
		title: __("Your Organization"),
		icon: "fa fa-building",
		help: (frappe.setup.domain === 'Education' ?
			__('The name of the institute for which you are setting up this system.') :
			__('The name of your company for which you are setting up this system.')),
		fields: [
			{
				fieldname: 'company_tagline',
				label: __('What does it do?'),
				fieldtype: 'Data',
				placeholder: frappe.setup.domain === 'Education' ?
					__('e.g. "Primary School" or "University"') :
					__('e.g. "Build tools for builders"'),
				reqd: 1
			},
			{ fieldname: 'bank_account', label: __('Bank Name'), fieldtype: 'Data', reqd: 1 },
			{
				fieldname: 'chart_of_accounts', label: __('Chart of Accounts'),
				options: "", fieldtype: 'Select'
			},

			{ fieldtype: "Section Break", label: "Financial Year" },
			{ fieldname: 'fy_start_date', label: __('Start Date'), fieldtype: 'Date', reqd: 1 },
			{ fieldtype: "Column Break" },
			{ fieldname: 'fy_end_date', label: __('End Date'), fieldtype: 'Date', reqd: 1 },
		],

		onload: function (slide) {
			this.load_chart_of_accounts(slide);
			this.bind_events(slide);
			this.set_fy_dates(slide);
		},

		validate: function () {
			// validate fiscal year start and end dates
			if (this.values.fy_start_date == 'Invalid date' || this.values.fy_end_date == 'Invalid date') {
				frappe.msgprint(__("Please enter valid Financial Year Start and End Dates"));
				return false;
			}

			if ((this.values.company_name || "").toLowerCase() == "company") {
				frappe.msgprint(__("Company Name cannot be Company"));
				return false;
			}

			return true;
		},

		set_fy_dates: function (slide) {
			var country = frappe.wizard.values.country;

			if (country) {
				var fy = erpnext.setup.fiscal_years[country];
				var current_year = moment(new Date()).year();
				var next_year = current_year + 1;
				if (!fy) {
					fy = ["01-01", "31-12"];
					next_year = current_year;
				}

				var year_start_date = current_year + "-" + fy[0];
				if (year_start_date > frappe.datetime.get_today()) {
					next_year = current_year
					current_year -= 1;
				}
				slide.get_field("fy_start_date").set_value(fy[0] + "-" + current_year);
				slide.get_field("fy_end_date").set_value(fy[1] + "-" + next_year);
			}

		},


		load_chart_of_accounts: function (slide) {
			var country = frappe.wizard.values.country;

			if (country) {
				frappe.call({
					method: "erpnext.accounts.doctype.account.chart_of_accounts.chart_of_accounts.get_charts_for_country",
					args: { "country": country },
					callback: function (r) {
						if (r.message) {
							slide.get_input("chart_of_accounts").empty()
								.add_options(r.message);

							if (r.message.length === 1) {
								var field = slide.get_field("chart_of_accounts");
								field.set_value(r.message[0]);
								field.df.hidden = 1;
								field.refresh();
							}
						}
					}
				})
			}
		},

		bind_events: function (slide) {

			// TODO remove this
			slide.get_input("fy_start_date").on("change", function () {
				var year_end_date =
					frappe.datetime.add_days(frappe.datetime.add_months(
						frappe.datetime.user_to_obj(slide.get_input("fy_start_date").val()), 12), -1);
				slide.form.fields_dict.fy_end_date.set_value(frappe.datetime.obj_to_user(year_end_date));
			});
		}
	},


	{
		// Taxes
		name: 'taxes',
		domains: ['manufacturing', 'services', 'retail', 'distribution'],
		icon: "fa fa-money",
		title: __("Add Taxes"),
		help: __("List your tax heads (e.g. VAT, Customs etc; they should have unique names) and their standard rates. This will create a standard template, which you can edit and add more later."),
		add_more: 1,
		max_count: 4,
		fields: [
			{fieldtype:"Section Break"},
			{fieldtype:"Data", fieldname:"tax", label:__("Tax"),
				placeholder:__("e.g. VAT")},
			{fieldtype:"Column Break"},
			{fieldtype:"Float", fieldname:"tax_rate", label:__("Rate (%)"), placeholder:__("e.g. 5")}
		]
	},

	{
		// Customers
		name: 'customers',
		domains: ['manufacturing', 'services', 'retail', 'distribution'],
		icon: "fa fa-group",
		title: __("Add Customers"),
		help: __("List a few of your customers. They could be organizations or individuals."),
		add_more: 1,
		max_count: 6,
		fields: [
			{fieldtype:"Section Break"},
			{fieldtype:"Data", fieldname:"customer", label:__("Customer"),
				placeholder:__("Customer Name")},
			{fieldtype:"Column Break"},
			{fieldtype:"Data", fieldname:"customer_contact",
				label:__("Contact Name"), placeholder:__("Contact Name")}
		],
	},

	{
		// Suppliers
		name: 'suppliers',
		domains: ['manufacturing', 'services', 'retail', 'distribution'],
		icon: "fa fa-group",
		title: __("Your Suppliers"),
		help: __("List a few of your suppliers. They could be organizations or individuals."),
		add_more: 1,
		max_count: 6,
		fields: [
			{fieldtype:"Section Break"},
			{fieldtype:"Data", fieldname:"supplier", label:__("Supplier"),
				placeholder:__("Supplier Name")},
			{fieldtype:"Column Break"},
			{fieldtype:"Data", fieldname:"supplier_contact",
				label:__("Contact Name"), placeholder:__("Contact Name")},
		]
	},

	{
		// Products
		name: 'products',
		domains: ['manufacturing', 'services', 'retail', 'distribution'],
		icon: "fa fa-barcode",
		title: __("Your Products or Services"),
		help: __("List your products or services that you buy or sell. Make sure to check the Item Group, Unit of Measure and other properties when you start."),
		add_more: 1,
		max_count: 6,
		fields: [
			{fieldtype:"Section Break", show_section_border: true},
			{fieldtype:"Data", fieldname:"item", label:__("Item"),
				placeholder:__("A Product or Service")},
			{fieldtype:"Select", label:__("Group"), fieldname:"item_group",
				options:[__("Products"), __("Services"),
					__("Raw Material"), __("Consumable"), __("Sub Assemblies")],
				"default": __("Products")},
			{fieldtype:"Select", fieldname:"item_uom", label:__("UOM"),
				options:[__("Unit"), __("Nos"), __("Box"), __("Pair"), __("Kg"), __("Set"),
					__("Hour"), __("Minute"), __("Litre"), __("Meter"), __("Gram")],
				"default": __("Unit")},
			{fieldtype: "Check", fieldname: "is_sales_item", label:__("We sell this Item"), default: 1},
			{fieldtype: "Check", fieldname: "is_purchase_item", label:__("We buy this Item")},
			{fieldtype:"Column Break"},
			{fieldtype:"Currency", fieldname:"item_price", label:__("Rate")},
			{fieldtype:"Attach Image", fieldname:"item_img", label:__("Attach Image"), is_private: 0},
		],
		get_item_count: function() {
			return this.item_count;
		}
	},

	{
		// Program
		name: 'program',
		domains: ["education"],
		title: __("Program"),
		help: __("Example: Masters in Computer Science"),
		add_more: 1,
		max_count: 6,
		fields: [
			{fieldtype:"Section Break", show_section_border: true},
			{fieldtype:"Data", fieldname:"program", label:__("Program"), placeholder: __("Program Name")},
		],
	},

	{
		// Course
		name: 'course',
		domains: ["education"],
		title: __("Course"),
		help: __("Example: Basic Mathematics"),
		add_more: 1,
		max_count: 6,
		fields: [
			{fieldtype:"Section Break", show_section_border: true},
			{fieldtype:"Data", fieldname:"course", label:__("Course"),  placeholder: __("Course Name")},
		]
	},

	{
		// Instructor
		name: 'instructor',
		domains: ["education"],
		title: __("Instructor"),
		help: __("People who teach at your organisation"),
		add_more: 1,
		max_count: 6,
		fields: [
			{fieldtype:"Section Break", show_section_border: true},
			{fieldtype:"Data", fieldname:"instructor", label:__("Instructor"),  placeholder: __("Instructor Name")},
		]
	},

	{
		// Room
		name: 'room',
		domains: ["education"],
		title: __("Room"),
		help: __("Classrooms/ Laboratories etc where lectures can be scheduled."),
		add_more: 1,
		max_count: 4,
		fields: [
			{fieldtype:"Section Break", show_section_border: true},
			{fieldtype:"Data", fieldname:"room", label:__("Room")},
			{fieldtype:"Column Break"},
			{fieldtype:"Int", fieldname:"room_capacity", label:__("Room") + " Capacity"},
		]
	},

	{
		// last slide: Bootstrap
		name: 'bootstrap',
		domains: ["all"],
		title: __("Bootstrap"),
		fields: [{fieldtype: "Section Break"},
			{fieldtype: "Check", fieldname: "add_sample_data",
				label: __("Add a few sample records"), "default": 1},
			{fieldtype: "Check", fieldname: "setup_website",
				label: __("Setup a simple website for my organization"), "default": 1}
		]
	}
];

// Source: https://en.wikipedia.org/wiki/Fiscal_year
// default 1st Jan - 31st Dec

erpnext.setup.fiscal_years = {
	"Afghanistan": ["20-12", "21-12"],
	"Australia": ["01-07", "30-06"],
	"Bangladesh": ["01-07", "30-06"],
	"Canada": ["01-04", "31-03"],
	"Costa Rica": ["01-10", "30-09"],
	"Egypt": ["01-07", "30-06"],
	"Hong Kong": ["01-04", "31-03"],
	"India": ["01-04", "31-03"],
	"Iran": ["23-06", "22-06"],
	"Italy": ["01-07", "30-06"],
	"Myanmar": ["01-04", "31-03"],
	"New Zealand": ["01-04", "31-03"],
	"Pakistan": ["01-07", "30-06"],
	"Singapore": ["01-04", "31-03"],
	"South Africa": ["01-03", "28-02"],
	"Thailand": ["01-10", "30-09"],
	"United Kingdom": ["01-04", "31-03"],
};

frappe.setup.on("before_load", function () {
	erpnext_slides.map(frappe.setup.add_slide);

	// change header brand
	let $brand = $('header .setup-wizard-brand');
	if($brand.find('.erpnext-icon').length === 0) {
		$brand.find('.frappe-icon').hide();
		$brand.append(`<span>
			<img src="/assets/erpnext/images/erp-icon.svg" class="brand-icon erpnext-icon"
			style="width:36px;"><span class="brand-name">ERPNext</span></span>`);
	}
});

var test_values_edu = {
	"language": "english",
	"domain": "Education",
	"country": "India",
	"timezone": "Asia/Kolkata",
	"currency": "INR",
	"first_name": "Tester",
	"email": "test@example.com",
	"password": "test",
	"company_name": "Hogwarts",
	"company_abbr": "HS",
	"company_tagline": "School for magicians",
	"bank_account": "Gringotts Wizarding Bank",
	"fy_start_date": "2016-04-01",
	"fy_end_date": "2017-03-31"
}

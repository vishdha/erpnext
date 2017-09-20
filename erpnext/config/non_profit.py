from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Chapter"),
			"icon": "fa fa-star",
			"items": [
				{
					"type": "doctype",
					"name": "Chapter",
					"description": _("Chapter information."),
				},
				{
					"type": "doctype",
					"name": "Chapter Message",
					"description": _("Chapter Message."),
				},
			]
		},
		{
			"label": _("Membership"),
			"items": [
				{
					"type": "doctype",
					"name": "Member",
					"description": _("Member information."),
				},
				{
					"type": "doctype",
					"name": "Membership",
					"description": _("Memebership Details"),
				},
				{
					"type": "doctype",
					"name": "Membership Type",
					"description": _("Memebership Type Details"),
				},
			]
		},
		{
			"label": _("Volunteer"),
			"items": [
				{
					"type": "doctype",
					"name": "Volunteer",
					"description": _("Volunteer information."),
				},
				{
					"type": "doctype",
					"name": "Volunteer Type",
					"description": _("Volunteer Type information."),
				}
			]
		},
		{
			"label": _("Donor"),
			"items": [
				{
					"type": "doctype",
					"name": "Donor",
					"description": _("Donor information."),
				},
				{
					"type": "doctype",
					"name": "Donor Type",
					"description": _("Donor Type information."),
				}
			]
		},
		{
			"label": _("Event"),
			"items": [
				{
					"type": "doctype",
					"name": "Member",
					"description": _("Member information."),
				}
			]
		},
		{
			"label": _("Setup Meeting"),
			"items": [
				{
					"type": "doctype",
					"name": "Member",
					"description": _("Member information."),
				}
			]
		},
	]

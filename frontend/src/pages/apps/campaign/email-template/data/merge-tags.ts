const example = [
  {
    name: "Contact",
    mergeTags: [
      { name: "Email", value: "{{ email }}" },
      { name: "Name", value: "{{ name }}" },
      { name: "Mobile Phone", value: "{{ mobile_phone }}" },
      { name: "Address Line 1", value: "{{ address_line_1 }}" },
      { name: "Address Line 2", value: "{{ address_line_2 }}" },
      { name: "Country", value: "{{ country }}" },
      { name: "Province", value: "{{ province }}" },
      { name: "City", value: "{{ city }}" },
      { name: "Postal Code", value: "{{ postal_code }}" },
    ],
  },
  {
    name: "Organization",
    mergeTags: [
      { name: "Name", value: "{{ org_name }}" },
      { name: "Address", value: "{{ org_address }}" },
      { name: "Telephone", value: "{{ org_telephone }}" },
      { name: "Fax", value: "{{ org_fax }}" },
    ],
  },
];

export default example;

// Copyright (c) 2023, Frappe Technologies Pvt Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on("Builder Settings", {
  refresh(frm) {
      frm.add_custom_button(__("Заменить компонент"), () => {
      frappe.call({
        method:
          "builder.builder.doctype.builder_settings.builder_settings.get_components",
        callback: (r) => {
          const components = r.message;
          let filter_group = null;
          // modal to select target component and component to replace with
          const d = new frappe.ui.Dialog({
            title: __("Заменить компонент"),
            fields: [
              {
                fieldtype: "HTML",
                fieldname: "filter_area",
                label: "Фильтр страниц Builder",
                description: "Ограничивает страницы, где компонент будет заменен",
              },
              {
                fieldname: "target_component",
                label: __("Целевой компонент"),
                fieldtype: "Select",
                options: components,
                reqd: 1,
                onchange: function () {
                  frappe.call({
                    method:
                      "builder.builder.doctype.builder_settings.builder_settings.get_component_usage_count",
                    args: {
                      component_id: this.get_value(),
                      filters: filter_group?.get_filters(),
                    },
                    callback: (r) => {
                      const field = d.get_field("target_component");
                      const { count, pages } = r.message;
                      const message =
                        count === 0
                          ? __("Не используется ни на одной странице")
                          : count === 1
                            ? __("Используется на 1 странице")
                            : __("Используется на {0} страницах", [count]);
                      field.set_description(message);
                    },
                  });
                },
              },
              {
                fieldname: "replace_with",
                label: __("Заменить на"),
                fieldtype: "Select",
                options: components,
                reqd: 1,
              },
            ],
          });

          frappe.model.with_doctype("Builder Page", () => {
            filter_group = new frappe.ui.FilterGroup({
              parent: d.get_field("filter_area").$wrapper,
              doctype: "Builder Page",
              on_change: () => {},
            });
            filter_group.wrapper.prepend(
              "<h5>Фильтр страниц Builder</h5><p>Ограничивает страницы, где компонент будет заменен</p><br>",
            );
            filter_group.wrapper.append("<br><br>");
          });
          d.set_primary_action(__("Заменить"), (values) => {
            frappe.confirm(
              __("Вы уверены, что хотите заменить {0} на {1}?", [
                values.target_component,
                values.replace_with,
              ]),
              () => {
                frappe.call({
                  method:
                    "builder.builder.doctype.builder_settings.builder_settings.replace_component",
                  args: {
                    target_component: values.target_component,
                    replace_with: values.replace_with,
                    filters: filter_group.get_filters(),
                  },
                  callback: (r) => {
                    frappe.msgprint(__("Компонент успешно заменен"));
                    d.hide();
                  },
                });
              },
            );
          });
          d.show();
        },
      });
    });
  },
});

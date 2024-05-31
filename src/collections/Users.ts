import { CollectionConfig } from "payload/types";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    verify: {
      generateEmailHTML: ({ token }) => {
        return `<p>Hello! Please verify.</p>`;
      }
    }
  },
  access: {
    read: () => true,
    create: () => true
  },
  fields: [
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" }
      ],
      defaultValue: "user",
      required: true
    }
  ],
}

import { CollectionConfig } from "payload/types";
import { PRODUCT_CATEGORIES } from "../../config";

export const Products: CollectionConfig = {
  slug: "products",
  access: {},
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      hasMany: false,
      required: true,
      admin: {
        condition: () => false
      }
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true
    },
    {
      name: "description",
      label: "Product details",
      type: "textarea",
    },
    {
      name: "price",
      label: "Price (USD)",
      type: "number",
      min: 0,
      max: 1000,
      required: true
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: PRODUCT_CATEGORIES.map(({ label, value }) => ({ label, value })),
      required: true
    },
    // {
    //   name: "productFiles",
    //   label: "Product file(s)",
    //   type: "relationship",
    //   relationTo: "productFiles",
    //   hasMany: false,
    //   required: true
    // },
    {
      name: "approvedForSale",
      label: "Product status",
      access: {
        create: ({ req }) => req.user.role === "admin",
        read: ({ req }) => req.user.role === "admin",
        update: ({ req }) => req.user.role === "admin",
      },
      type: "select",
      options: [
        { label: "Pending verification", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
      defaultValue: "pending"
    },
    {
      name: "priceId",
      access: {
        create: () => false,
        read: () => false,
        update: () => false
      },
      type: "text",
      admin: {
        hidden: true
      }
    },
    {
      name: "stripeId",
      access: {
        create: () => false,
        read: () => false,
        update: () => false
      },
      type: "text",
      admin: {
        hidden: true
      }
    },
    {
      name: "images",
      label: "Product images",
      type: "array",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true
        }
      ],
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: {
        singular: "Image",
        plural: "Images"
      }
    }
  ],
  admin: {
    useAsTitle: "name"
  },
}

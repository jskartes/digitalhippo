import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { CollectionConfig } from "payload/types";
import { PRODUCT_CATEGORIES } from "../../config";
import { stripe } from "../../lib/stripe";
import { Product } from "../../payloadTypes";

const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
  const user = req.user;

  return { ...data, user: user.id };
}

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
    {
      name: "productFiles",
      label: "Product file(s)",
      type: "relationship",
      relationTo: "productFiles",
      hasMany: false,
      required: true
    },
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
  hooks: {
    beforeChange: [
      addUser,
      async (args) => {
        if (args.operation === "create") {
          const data = args.data as Product;
          const createdProduct = await stripe.products.create({
            name: data.name,
            default_price_data: {
              currency: "USD",
              unit_amount: Math.round(data.price * 100)
            }
          });
          const updated: Product = {
            ...data,
            stripeId: createdProduct.id,
            priceId: createdProduct.default_price as string
          };

          return updated;
        } else if (args.operation === "update") {
          const data = args.data as Product;
          const updatedProduct = await stripe.products.update(
            data.stripeId!,
            {
              name: data.name,
              default_price: data.priceId!
            }
          );
          const updated: Product = {
            ...data,
            stripeId: updatedProduct.id,
            priceId: updatedProduct.default_price as string
          };

          return updated;
        }
      }
    ]
  },
  admin: {
    useAsTitle: "name"
  },
}

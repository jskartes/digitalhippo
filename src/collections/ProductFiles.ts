import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Access, CollectionConfig } from "payload/types";
import { User } from "../payloadTypes";

const addUser: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;

  return { ...data, user: user?.id };
}

const yourOwnAndPurchased: Access = async ({ req }) => {
  const user = req.user as User | null;
  if (!user) return false;
  if (user.role === "admin") return true;

  const { docs: products } = await req.payload.find({
    collection: "products",
    depth: 0,
    where: {
      user: {
        equals: user.id
  }}});
  const ownProductFileIds = products.map(product => product.productFiles).flat();

  const { docs: orders } = await req.payload.find({
    collection: "orders",
    depth: 2,
    where: {
      user: {
        equals: user.id
  }}});
  const purchasedProductFileIds = orders.map(order => {
    return order.products.map(product => {
      if (typeof product === "string") {
        return req.payload.logger.error("Search depth not sufficient to find purchased file IDs");
      }
      return typeof product.productFiles === "string" ? product.productFiles : product.productFiles.id;
    });
  }).filter(Boolean).flat();

  return {
    id: {
      in: [...ownProductFileIds, ...purchasedProductFileIds]
    }
  };
}

export const ProductFiles: CollectionConfig = {
  slug: "productFiles",
  access: {
    read: yourOwnAndPurchased,
    update: ({ req }) => req.user.role === "admin",
    delete: ({ req }) => req.user.role === "admin",
  },
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
    }
  ],
  hooks: {
    beforeChange: [addUser]
  },
  upload: {
    staticURL: "/product-files",
    staticDir: "productFiles",
    mimeTypes: ["image/*", "font/*", "application/postscript"]
  },
  admin: {
    hidden: ({ user }) => user.role !== "admin"
  }
}

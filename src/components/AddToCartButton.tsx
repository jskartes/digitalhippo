"use client";

import { useCart } from "@/hooks/useCart";
import { Product } from "@/payloadTypes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const AddToCartButton = ({ product }: { product: Product }) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { addItem } = useCart();

  useEffect(() => {
    const timeout = setTimeout(() => setIsSuccess(false), 2000);

    return () => clearTimeout(timeout);
  }, [isSuccess]);

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={() => {
        addItem(product);
        setIsSuccess(true);
      }}
    >
      {isSuccess ? "Added!" : "Add to cart"}
    </Button>
  );
}

export default AddToCartButton;

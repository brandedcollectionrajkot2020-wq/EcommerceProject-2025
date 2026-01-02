"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* --------------------------------- */
/* -------- CATEGORY DATA ----------- */
/* --------------------------------- */

const CATEGORY_MAP = {
  clothes: {
    Shirts: [
      "Half Sleeve",
      "Full Sleeve",
      "Linen",
      "Embroidered",
      "Designer",
      "Office Wear",
      "Check",
      "Plain",
      "Imported",
      "Denim",
    ],
    "Polo T-Shirts": [],
    "Round Neck T-Shirts": ["Crew Neck", "Drop Shoulder", "Oversized"],
    "Winter Wear": ["Jackets", "Sweaters", "Sweatshirts"],
    Denim: [
      "Ankle Fit",
      'Straight Fit (14")',
      "Comfort Narrow",
      'Regular Fit (16", 18")',
      "Baggy Fit",
    ],
    "Cotton / Chinos": ["Ankle Fit", "Comfort Fit"],
    "Formal Pants": ["Ankle Fit", "Straight Fit", "Comfort Fit"],
    "Track Pants": [
      "Dry Fit Fabric",
      "Cotton Fleece Fabric",
      "Ankle Fit",
      "Straight Fit",
    ],
    "Dry Fit T-Shirts": ["Round Neck", "Collar Free"],
  },

  shoes: {
    Shoes: ["Sports Shoes", "Sneakers"],
    Slippers: ["Flip Flops", "Strap Slippers"],
    Crocs: ["Men", "Women"],
  },

  accessories: {
    "Perfume / Deo": ["Replica", "Indian Made", "Premium Collection"],
    Deodorants: ["Gas Deo", "Water Deo"],
    Watches: ["Analog", "Battery", "Automatic"],
  },
};

const SIZE_MAP = {
  clothes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  shoes: ["6", "7", "8", "9", "10", "11", "12"],
  accessories: ["General"],
};

/* --------------------------------- */
/* -------- TABS -------------------- */
/* --------------------------------- */

const TABS = {
  LIST: "list",
  CREATE: "create",
  EDIT: "edit",
};

/* --------------------------------- */
/* -------- MAIN PAGE --------------- */
/* --------------------------------- */

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState(TABS.LIST);
  const [editProductId, setEditProductId] = useState(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#4a2e1f]">Products</h1>

      <div className="flex gap-3 border-b border-[#ead7c5]">
        <Tab
          active={activeTab === TABS.LIST}
          onClick={() => setActiveTab(TABS.LIST)}
        >
          Product Listing
        </Tab>

        <Tab
          active={activeTab === TABS.CREATE}
          onClick={() => {
            setEditProductId(null);
            setActiveTab(TABS.CREATE);
          }}
        >
          Create Product
        </Tab>

        {activeTab === TABS.EDIT && <Tab active>Edit Product</Tab>}
      </div>

      {activeTab === TABS.LIST && (
        <ProductList
          onEdit={(id) => {
            setEditProductId(id);
            setActiveTab(TABS.EDIT);
          }}
        />
      )}

      {(activeTab === TABS.CREATE || activeTab === TABS.EDIT) && (
        <CreateProduct
          productId={editProductId}
          onSuccess={() => {
            setEditProductId(null);
            setActiveTab(TABS.LIST);
          }}
        />
      )}
    </div>
  );
}

/* --------------------------------- */
/* -------- PRODUCT LIST ------------ */
/* --------------------------------- */

function ProductList({ onEdit }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, []);

  return (
    <div className="bg-white border border-[#ead7c5] rounded-xl overflow-hidden">
      <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-[#fdf7f2] text-sm font-medium">
        <div>Product</div>
        <div>Category</div>
        <div>Price</div>
        <div>Stock</div>
        <div>Status</div>
        <div className="text-right">Actions</div>
      </div>

      {products.map((p) => (
        <div
          key={p._id}
          className="grid grid-cols-6 gap-4 px-4 py-3 border-t text-sm"
        >
          <div className="font-medium">{p.name}</div>
          <div>{p.category}</div>
          <div>₹{p.price?.current}</div>
          <div>{p.sizes?.reduce((sum, s) => sum + s.quantity, 0) || 0}</div>
          <div className="text-xs">
            {p.isNewArrival && "New "}
            {p.isBestseller && "Best "}
            {p.featured && "Featured"}
          </div>
          <div className="text-right">
            <button onClick={() => onEdit(p._id)} className="underline">
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- */
/* -------- CREATE / EDIT ----------- */
/* --------------------------------- */

function CreateProduct({ productId, onSuccess }) {
  const isEdit = !!productId;
  const [product, setProduct] = useState(null);

  const [mainCategory, setMainCategory] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [sizes, setSizes] = useState([]);

  const [flags, setFlags] = useState({
    isNewArrival: false,
    isBestseller: false,
    featured: false,
  });

  useEffect(() => {
    if (!productId) return;

    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.product;
        setProduct(p);
        setMainCategory(p.mainCategory || "");
        setCategory(p.category || "");
        setSubcategory(p.subcategory || "");

        const allowedSizes = SIZE_MAP[p.mainCategory] || [];
        setSizes(
          allowedSizes.map((s) => ({
            size: s,
            quantity: p.sizes?.find((x) => x.size === s)?.quantity || 0,
          }))
        );

        setFlags({
          isNewArrival: !!p.isNewArrival,
          isBestseller: !!p.isBestseller,
          featured: !!p.featured,
        });
      });
  }, [productId]);

  useEffect(() => {
    if (!mainCategory) {
      setSizes([]);
      return;
    }
    setSizes(SIZE_MAP[mainCategory].map((s) => ({ size: s, quantity: 0 })));
  }, [mainCategory]);

  async function handleSubmit(e) {
    e.preventDefault();
    const f = e.target;
    const fd = new FormData();

    if (f.imageFront?.files[0]) fd.append("imageFront", f.imageFront.files[0]);
    if (f.imageBack?.files[0]) fd.append("imageBack", f.imageBack.files[0]);

    if (f.galleryImages?.files?.length) {
      [...f.galleryImages.files].forEach((img) =>
        fd.append("galleryImages", img)
      );
    }

    const productData = {
      name: f.name.value,
      brand: f.brand.value,
      mainCategory,
      category,
      subcategory,
      price: {
        current: Number(f.priceCurrent.value),
        old: Number(f.priceOld.value),
        discountText: f.discountText.value,
      },
      sizes: sizes.filter((s) => s.quantity > 0),
      salesCount: Number(f.salesCount.value),
      description: f.description.value,
      ...flags,
    };

    fd.append("productData", JSON.stringify(productData));
    if (isEdit) fd.append("productId", productId);

    const res = await fetch("/api/products", {
      method: isEdit ? "PUT" : "POST",
      body: fd,
    });

    if (!res.ok) return toast.error("Failed to save product");

    toast.success(isEdit ? "Product Updated" : "Product Created");
    onSuccess();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-xl p-6 space-y-6"
    >
      <p className="text-xs text-gray-500">
        <span className="text-red-500">*</span> Required fields
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          name="name"
          label={<FieldLabel required>Product Name</FieldLabel>}
          defaultValue={product?.name}
        />
        <Input
          name="brand"
          label={<FieldLabel optional>Brand</FieldLabel>}
          defaultValue={product?.brand}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Select
          label={<FieldLabel required>Main Category</FieldLabel>}
          value={mainCategory}
          onChange={(e) => setMainCategory(e.target.value)}
        >
          <option value="">Select</option>
          <option value="clothes">Clothes</option>
          <option value="shoes">Shoes</option>
          <option value="accessories">Accessories</option>
        </Select>

        <Select
          label={<FieldLabel required>Category</FieldLabel>}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select</option>
          {mainCategory &&
            Object.keys(CATEGORY_MAP[mainCategory]).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </Select>

        <Select
          label={<FieldLabel optional>Sub Category</FieldLabel>}
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
        >
          <option value="">Optional</option>
          {mainCategory &&
            category &&
            CATEGORY_MAP[mainCategory][category]?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
        </Select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Input
          name="priceCurrent"
          label={<FieldLabel required>Current Price</FieldLabel>}
          type="number"
          defaultValue={product?.price?.current}
        />
        <Input
          name="priceOld"
          label={<FieldLabel optional>Old Price</FieldLabel>}
          type="number"
          defaultValue={product?.price?.old}
        />
        <Input
          name="discountText"
          label={<FieldLabel optional>Discount Text</FieldLabel>}
          defaultValue={product?.price?.discountText}
        />
      </div>

      {sizes.length > 0 && (
        <div>
          <label className="text-sm font-medium block mb-2">
            <FieldLabel required>Size Wise Stock</FieldLabel>
          </label>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {sizes.map((s) => (
              <div key={s.size} className="flex items-center gap-2">
                <span className="w-8 text-sm">{s.size}</span>
                <input
                  type="number"
                  min="0"
                  value={s.quantity}
                  onChange={(e) =>
                    setSizes((prev) =>
                      prev.map((x) =>
                        x.size === s.size
                          ? { ...x, quantity: Number(e.target.value) }
                          : x
                      )
                    )
                  }
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Input
        name="salesCount"
        label={<FieldLabel optional>Sales Count</FieldLabel>}
        type="number"
        defaultValue={product?.salesCount}
      />

      <Textarea
        name="description"
        label={<FieldLabel optional>Description</FieldLabel>}
        defaultValue={product?.description}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <FileInput
          name="imageFront"
          label={<FieldLabel required>Front Image</FieldLabel>}
        />
        <FileInput
          name="imageBack"
          label={<FieldLabel optional>Back Image</FieldLabel>}
        />
      </div>

      <FileInput
        name="galleryImages"
        label={<FieldLabel optional>Gallery Images</FieldLabel>}
        multiple
      />

      <div className="flex gap-6 text-sm">
        <Checkbox
          label="New Arrival"
          checked={flags.isNewArrival}
          onChange={(e) =>
            setFlags({ ...flags, isNewArrival: e.target.checked })
          }
        />
        <Checkbox
          label="Best Seller"
          checked={flags.isBestseller}
          onChange={(e) =>
            setFlags({ ...flags, isBestseller: e.target.checked })
          }
        />
        <Checkbox
          label="Featured"
          checked={flags.featured}
          onChange={(e) => setFlags({ ...flags, featured: e.target.checked })}
        />
      </div>

      <button className="bg-[#4a2e1f] text-white px-6 py-2 rounded">
        {isEdit ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}

/* --------------------------------- */
/* -------- UI HELPERS -------------- */
/* --------------------------------- */

function FieldLabel({ children, required = false, optional = false }) {
  return (
    <span className="flex items-center gap-1">
      {children}
      {required && <span className="text-red-500">*</span>}
      {optional && <span className="text-xs text-gray-400">(Optional)</span>}
    </span>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input {...props} className="w-full border px-3 py-2 rounded" />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <textarea
        {...props}
        rows={4}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <select {...props} className="w-full border px-3 py-2 rounded">
        {children}
      </select>
    </div>
  );
}

function FileInput({ label, ...props }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input type="file" {...props} />
    </div>
  );
}

function Checkbox({ label, ...props }) {
  return (
    <label className="flex gap-2 items-center">
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}

function Tab({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-t ${
        active ? "bg-[#4a2e1f] text-white" : ""
      }`}
    >
      {children}
    </button>
  );
}

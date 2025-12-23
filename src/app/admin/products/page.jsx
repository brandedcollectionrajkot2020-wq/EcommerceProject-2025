"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* --------------------------------- */
/* --------- TABS ------------------ */
/* --------------------------------- */

const TABS = {
  LIST: "list",
  CREATE: "create",
  EDIT: "edit",
};

/* --------------------------------- */
/* --------- MAIN PAGE ------------- */
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
/* --------- PRODUCT LIST ---------- */
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

      {products.length === 0 && (
        <div className="px-4 py-10 text-center text-gray-500 text-sm">
          No products found
        </div>
      )}

      {products.map((p) => (
        <div
          key={p._id}
          className="grid grid-cols-6 gap-4 px-4 py-3 border-t text-sm"
        >
          <div className="font-medium">{p.name}</div>
          <div>{p.category}</div>
          <div>₹{p.price?.current}</div>
          <div>{p.stock}</div>
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
/* --------- CREATE / EDIT ---------- */
/* --------------------------------- */

function CreateProduct({ productId, onSuccess }) {
  const isEdit = !!productId;
  const [product, setProduct] = useState(null);

  const [flags, setFlags] = useState({
    isNewArrival: false,
    isBestseller: false,
    featured: false,
  });

  /* ---------- LOAD PRODUCT ---------- */
  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setFlags({
        isNewArrival: false,
        isBestseller: false,
        featured: false,
      });
      return;
    }

    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d.product);
        setFlags({
          isNewArrival: !!d.product.isNewArrival,
          isBestseller: !!d.product.isBestseller,
          featured: !!d.product.featured,
        });
      });
  }, [productId]);

  /* ---------- DELETE IMAGE ---------- */
  async function deleteImage(productId, fileId, type) {
    if (!confirm("Remove this image?")) return;

    const res = await fetch(
      `/api/images/${fileId}?productId=${productId}&type=${type}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      alert("Failed to delete image");
      return;
    }

    const refreshed = await fetch(`/api/products/${productId}`).then((r) =>
      r.json()
    );
    setProduct(refreshed.product);
  }

  /* ---------- SUBMIT ---------- */
  async function handleSubmit(e) {
    e.preventDefault();
    const f = e.target;
    const fd = new FormData();

    // SAFE FILE ACCESS
    const front = f.elements.namedItem("imageFront");
    if (front?.files?.[0]) fd.append("imageFront", front.files[0]);

    const back = f.elements.namedItem("imageBack");
    if (back?.files?.[0]) fd.append("imageBack", back.files[0]);

    const gallery = f.elements.namedItem("galleryImages");
    if (gallery?.files?.length) {
      [...gallery.files].forEach((file) => fd.append("galleryImages", file));
    }

    const productData = {
      name: f.name.value,
      brand: f.brand.value,
      category: f.category.value,
      subcategory: f.subcategory.value,
      mainCategory: f.mainCategory.value,
      price: {
        current: Number(f.priceCurrent.value),
        old: Number(f.priceOld.value),
        discountText: f.discountText.value,
      },
      stock: Number(f.stock.value),
      salesCount: Number(f.salesCount.value),
      description: f.description.value,
      isNewArrival: flags.isNewArrival,
      isBestseller: flags.isBestseller,
      featured: flags.featured,
    };

    fd.append("productData", JSON.stringify(productData));
    if (isEdit) fd.append("productId", productId);

    const res = await fetch("/api/products", {
      method: isEdit ? "PUT" : "POST",
      body: fd,
    });
    console.log(res);

    if (!res.ok) {
      alert("Failed to save product");
      return;
    }

    toast.success("Product Created");
    onSuccess();
  }

  /* ---------- FORM ---------- */
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-xl p-6 space-y-6"
    >
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit Product" : "Create Product"}
      </h2>

      {/* BASIC */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input name="name" label="Product Name" defaultValue={product?.name} />
        <Input name="brand" label="Brand" defaultValue={product?.brand} />
      </div>

      {/* CATEGORY */}
      <div className="grid md:grid-cols-3 gap-4">
        <Select
          name="mainCategory"
          label="Main Category"
          defaultValue={product?.mainCategory}
        >
          <option value="clothes">Clothes</option>
          <option value="shoes">Shoes</option>
          <option value="accessories">Accessories</option>
        </Select>
        <Input
          name="category"
          label="Category"
          defaultValue={product?.category}
        />
        <Input
          name="subcategory"
          label="Sub Category"
          defaultValue={product?.subcategory}
        />
      </div>

      {/* PRICING */}
      <div className="grid md:grid-cols-3 gap-4">
        <Input
          name="priceCurrent"
          label="Current Price"
          type="number"
          defaultValue={product?.price?.current}
        />
        <Input
          name="priceOld"
          label="Old Price"
          type="number"
          defaultValue={product?.price?.old}
        />
        <Input
          name="discountText"
          label="Discount Text"
          defaultValue={product?.price?.discountText}
        />
      </div>

      {/* STOCK */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          name="stock"
          label="Stock Quantity"
          type="number"
          defaultValue={product?.stock}
        />
        <Input
          name="salesCount"
          label="Sales Count"
          type="number"
          defaultValue={product?.salesCount}
        />
      </div>

      <Textarea
        name="description"
        label="Description"
        defaultValue={product?.description}
      />

      {/* IMAGES */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <FileInput name="imageFront" label="Front Image" />
          {product?.imageFrontFileId && (
            <ImagePreview
              fileId={product.imageFrontFileId}
              onDelete={() =>
                deleteImage(product._id, product.imageFrontFileId, "front")
              }
            />
          )}
        </div>

        <div>
          <FileInput name="imageBack" label="Back Image" />
          {product?.imageBackFileId && (
            <ImagePreview
              fileId={product.imageBackFileId}
              onDelete={() =>
                deleteImage(product._id, product.imageBackFileId, "back")
              }
            />
          )}
        </div>
      </div>

      <div>
        <FileInput name="galleryImages" label="Gallery Images" multiple />
        <div className="flex gap-2 mt-2 flex-wrap">
          {product?.gallery?.map((g) => (
            <ImagePreview
              key={g.fileId}
              fileId={g.fileId}
              onDelete={() => deleteImage(product._id, g.fileId, "gallery")}
              small
            />
          ))}
        </div>
      </div>

      {/* FLAGS */}
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
/* --------- UI HELPERS ------------ */
/* --------------------------------- */

function ImagePreview({ fileId, onDelete, small }) {
  return (
    <div className="relative inline-block mt-2">
      <img
        src={`/api/images/${fileId}`}
        className={`${small ? "h-20" : "h-24"} rounded border`}
      />
      <button
        type="button"
        onClick={onDelete}
        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
      >
        ✕
      </button>
    </div>
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

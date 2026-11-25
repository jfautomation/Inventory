
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Pencil,
  Check,
  X,
  Trash2,
} from "lucide-react";

import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";
import { ProductListingService } from "../../services/productListingService";
import { ProductService } from "../../services/productService";

import type {
  Product,
  ProductPayload,
  ProductListingPayload,
} from "../../types";

import InventoryDetail from "../UI/Detail/InventoryDetail";
import StatCard from "../UI/Detail/StatCard";
import DetailCard from "../UI/Detail/DetailCard";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openProductForListing } = useModal();

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [savingProductId, setSavingProductId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  const [productDraft, setProductDraft] = useState({
    serial_number: "",
    work_order: "",
    inventory_status: "active" as "active" | "sold" | "archived",
    test_status: false,
    test_date: "",
  });

  const {
    productListings,
    products,
    parts,
    brands,
    categories,
    conditions,
    isLoading,
    fetchProductListings,
    fetchProducts,
  } = useInventory();

  const listing = productListings.find(
    (item) => Number(item.id) === Number(id)
  );

  if (isLoading) {
    return <div>Loading inventory...</div>;
  }

  if (!listing) {
    return (
      <div className="p-6">
        <p>Product Listing not found.</p>
        <button onClick={() => navigate("/")}>
          Back to Inventory
        </button>
      </div>
    );
  }

  const part = parts.find(
    (item) => Number(item.id) === Number(listing.part_id)
  );

  const brand = brands.find(
    (item) => Number(item.id) === Number(part?.brand_id)
  );

  const category = categories.find(
    (item) => Number(item.id) === Number(part?.category_id)
  );

  const listingProducts = products.filter(
    (product) =>
      Number(product.product_listing_id) === Number(listing.id)
  );

  // DELETE PRODUCT LISTING
  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listing.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await ProductListingService.delete(Number(listing.id));
      await fetchProductListings();
      navigate("/");
    } catch (error: unknown) {
      const apiMessage = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      )?.response?.data?.message;

      setDeleteError(
        apiMessage || "Unable to delete this Product Listing."
      );
    } finally {
      setDeleting(false);
    }
  };

  // UPDATE PRODUCT LISTING
  // Only variation-specific fields are sent.
  const handleUpdateListing = async (
    updates: Partial<ProductListingPayload>
  ) => {
    const payload: ProductListingPayload = {
      sku: listing.sku,
      part_id: listing.part_id,
      condition_id: listing.condition_id,
      price_mode: listing.price_mode ?? "automatic",
      list_price: listing.list_price,
      status: listing.status ?? "publish",
      ...updates,
    };

    await ProductListingService.update(Number(listing.id), payload);
    await fetchProductListings();
  };

  // EDIT SERIALIZED PRODUCT
  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);

    setProductDraft({
      serial_number: product.serial_number || "",
      work_order: product.work_order || "",
      inventory_status: product.inventory_status || "active",
      test_status: product.test_status ?? false,
      test_date: product.test_date
        ? product.test_date.slice(0, 10)
        : "",
    });
  };

  // CANCEL SERIALIZED PRODUCT EDIT
  const handleCancelEdit = () => {
    setEditingProductId(null);

    setProductDraft({
      serial_number: "",
      work_order: "",
      inventory_status: "active",
      test_status: false,
      test_date: "",
    });
  };

  // SAVE SERIALIZED PRODUCT
  const handleSaveProduct = async (product: Product) => {
    if (!productDraft.serial_number.trim()) {
      alert("Serial Number is required.");
      return;
    }

    setSavingProductId(product.id);

    try {
      const payload: ProductPayload = {
        product_listing_id: Number(listing.id),
        serial_number: productDraft.serial_number.trim(),
        work_order: productDraft.work_order.trim(),
        inventory_status: productDraft.inventory_status,
        test_status: productDraft.test_status,
        test_date: productDraft.test_date,
        notes: product.notes || "",
        shelf: product.shelf?.map((item) => item.id) || [],
        image_id: product.image_id ?? null,
        status: "publish",
      };

      await ProductService.update(product.id, payload);
      await fetchProducts();

      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update serialized product:", error);
      alert("Unable to update serialized product.");
    } finally {
      setSavingProductId(null);
    }
  };

  // DELETE SERIALIZED PRODUCT
  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete serialized product "${product.serial_number || product.id}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingProductId(product.id);

    try {
      await ProductService.delete(product.id);
      await fetchProducts();

      if (editingProductId === product.id) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error("Failed to delete serialized product:", error);
      alert("Unable to delete serialized product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  // UPDATE SERIALIZED PRODUCT FORM
  const updateDraft = (field: string, value: string | boolean) => {
    setProductDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <InventoryDetail
      title="Product Listing Details"
      deleting={deleting}
      image={listing.image_url || undefined}
      additionalImages={listing.additional_image_urls || []}
      imageAlt={listing.title}
      statsColumns={4}
      onDelete={handleDelete}
      onEdit={() => {
        console.log("Product Listing edit not implemented yet.");
      }}
      onAdd={() => openProductForListing(Number(listing.id))}
      addButtonLabel="Add Product"
      stats={
        <>
          <StatCard label="Brand" value={brand?.name || "-"} />
          <StatCard label="Category" value={category?.name || "-"} />
          <StatCard
            label="Quantity"
            value={listing.quantity ?? listingProducts.length}
            type="stock"
          />
        </>
      }
      productsContent={
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <h3 className="mb-4 text-lg font-semibold">
            Serialized Products ({listingProducts.length})
          </h3>

          {listingProducts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No serialized products have been added to this listing yet.
            </p>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-gray-500">
                      <th className="p-3">Serial Number</th>
                      <th className="p-3">Work Order</th>
                      <th className="p-3">Shelf</th>
                      <th className="p-3">Inventory Status</th>
                      <th className="p-3">Test Status</th>
                      <th className="p-3">Test Date</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {listingProducts.map((product) => {
                      const isEditing = editingProductId === product.id;
                      const isSaving = savingProductId === product.id;
                      const isDeleting = deletingProductId === product.id;

                      return (
                        <tr key={product.id} className="border-b">
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                value={productDraft.serial_number}
                                onChange={(e) =>
                                  updateDraft("serial_number", e.target.value)
                                }
                                className="w-40 rounded border px-2 py-1"
                              />
                            ) : (
                              product.serial_number || "-"
                            )}
                          </td>

                          <td className="p-3">
                            {isEditing ? (
                              <input
                                value={productDraft.work_order}
                                onChange={(e) =>
                                  updateDraft("work_order", e.target.value)
                                }
                                className="w-32 rounded border px-2 py-1"
                              />
                            ) : (
                              product.work_order || "-"
                            )}
                          </td>

                          <td className="p-3">
                            {product.shelf?.[0]?.name || "-"}
                          </td>

                          <td className="p-3">
                            {isEditing ? (
                              <select
                                value={productDraft.inventory_status}
                                onChange={(e) =>
                                  updateDraft("inventory_status", e.target.value)
                                }
                                className="rounded border px-2 py-1"
                              >
                                <option value="active">In Stock</option>
                                <option value="sold">Sold</option>
                                <option value="archived">Archived</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                  product.inventory_status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : product.inventory_status === "sold"
                                      ? "bg-blue-100 text-blue-800"
                                      : product.inventory_status === "archived"
                                        ? "bg-gray-100 text-gray-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {product.inventory_status === "active"
                                  ? "In Stock"
                                  : product.inventory_status === "sold"
                                    ? "Sold"
                                    : product.inventory_status === "archived"
                                      ? "Archived"
                                      : "Unknown"}
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            {isEditing ? (
                              <select
                                value={String(productDraft.test_status)}
                                onChange={(e) =>
                                  updateDraft(
                                    "test_status",
                                    e.target.value === "true"
                                  )
                                }
                                className="rounded border px-2 py-1"
                              >
                                <option value="false">Not tested</option>
                                <option value="true">Tested</option>
                              </select>
                            ) : (
                              product.test_status ? "Tested" : "Not tested"
                            )}
                          </td>

                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="date"
                                value={productDraft.test_date}
                                onChange={(e) =>
                                  updateDraft("test_date", e.target.value)
                                }
                                className="rounded border px-2 py-1"
                              />
                            ) : (
                              product.test_date || "-"
                            )}
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-3 whitespace-nowrap">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    title="Save changes"
                                    aria-label="Save changes"
                                    disabled={isSaving}
                                    onClick={() => handleSaveProduct(product)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <Check size={18} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Cancel editing"
                                    aria-label="Cancel editing"
                                    onClick={handleCancelEdit}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X size={18} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  title="Edit product"
                                  aria-label="Edit product"
                                  disabled={editingProductId !== null}
                                  onClick={() => handleEditProduct(product)}
                                  className="text-blue-600 hover:text-blue-800 disabled:opacity-40"
                                >
                                  <Pencil size={18} />
                                </button>
                              )}

                              <button
                                type="button"
                                title="Delete product"
                                aria-label="Delete product"
                                disabled={isDeleting || isSaving}
                                onClick={() => handleDeleteProduct(product)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="space-y-3 md:hidden">
                {listingProducts.map((product) => {
                  const isEditing = editingProductId === product.id;
                  const isSaving = savingProductId === product.id;
                  const isDeleting = deletingProductId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="rounded-lg border border-gray-200 p-3"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="mb-1 block text-xs text-gray-500">
                              Serial Number
                            </label>
                            <input
                              value={productDraft.serial_number}
                              onChange={(e) =>
                                updateDraft("serial_number", e.target.value)
                              }
                              className="w-full rounded border px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-gray-500">
                              Work Order
                            </label>
                            <input
                              value={productDraft.work_order}
                              onChange={(e) =>
                                updateDraft("work_order", e.target.value)
                              }
                              className="w-full rounded border px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-gray-500">
                              Inventory Status
                            </label>
                            <select
                              value={productDraft.inventory_status}
                              onChange={(e) =>
                                updateDraft("inventory_status", e.target.value)
                              }
                              className="w-full rounded border px-3 py-2 text-sm"
                            >
                              <option value="active">In Stock</option>
                              <option value="sold">Sold</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-gray-500">
                              Test Status
                            </label>
                            <select
                              value={String(productDraft.test_status)}
                              onChange={(e) =>
                                updateDraft(
                                  "test_status",
                                  e.target.value === "true"
                                )
                              }
                              className="w-full rounded border px-3 py-2 text-sm"
                            >
                              <option value="false">Not tested</option>
                              <option value="true">Tested</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-gray-500">
                              Test Date
                            </label>
                            <input
                              type="date"
                              value={productDraft.test_date}
                              onChange={(e) =>
                                updateDraft("test_date", e.target.value)
                              }
                              className="w-full rounded border px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <span className="break-all font-semibold text-gray-900">
                              {product.serial_number || "No Serial Number"}
                            </span>

                            <span
                              className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                                product.inventory_status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : product.inventory_status === "sold"
                                    ? "bg-blue-100 text-blue-800"
                                    : product.inventory_status === "archived"
                                      ? "bg-gray-100 text-gray-700"
                                      : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {product.inventory_status === "active"
                                ? "In Stock"
                                : product.inventory_status === "sold"
                                  ? "Sold"
                                  : product.inventory_status === "archived"
                                    ? "Archived"
                                    : "Unknown"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-500">Work Order</p>
                              <p className="break-words font-medium">
                                {product.work_order || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Shelf</p>
                              <p className="font-medium">
                                {product.shelf?.[0]?.name || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Test Status</p>
                              <p className="font-medium">
                                {product.test_status ? "Tested" : "Not tested"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Test Date</p>
                              <p className="font-medium">
                                {product.test_date || "-"}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              title={isSaving ? "Saving..." : "Save changes"}
                              aria-label="Save changes"
                              disabled={isSaving}
                              onClick={() => handleSaveProduct(product)}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              <Check size={18} />
                            </button>

                            <button
                              type="button"
                              title="Cancel editing"
                              aria-label="Cancel editing"
                              disabled={isSaving}
                              onClick={handleCancelEdit}
                              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            title="Edit product"
                            aria-label="Edit product"
                            disabled={editingProductId !== null}
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-40"
                          >
                            <Pencil size={18} />
                          </button>
                        )}

                        <button
                          type="button"
                          title={isDeleting ? "Deleting..." : "Delete product"}
                          aria-label="Delete product"
                          disabled={isDeleting || isSaving}
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      }
    >
      {deleteError && (
        <div className="mb-5 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      <DetailCard
        title={listing.title}
        titleLabel="Listing Title"
        editableFields={[
          {
            label: "Part",
            value: part?.name || "-",
          },
          {
            label: "Part Number",
            value: part?.part_number || "-",
          },
          {
            label: "SKU",
            value: listing.sku,
            onSave: (value) =>
              handleUpdateListing({ sku: value }),
          },
          {
            label: "Condition",
            value:
              conditions.find(
                (item) => Number(item.id) === Number(listing.condition_id)
              )?.name || "-",
            type: "select",
            options: conditions.map((item) => ({
              label: item.name,
              value: String(item.id),
            })),
            onSave: (value) =>
              handleUpdateListing({
                condition_id: Number(value),
              }),
          },
          {
            label: "Price Mode",
            value: listing.price_mode ?? "automatic",
            type: "select",
            options: [
              { label: "Automatic", value: "automatic" },
              { label: "Manual", value: "manual" },
            ],
            onSave: (value) =>
              handleUpdateListing({
                price_mode: value as "automatic" | "manual",
              }),
          },
          {
            label: "Price",
            value: listing.list_price,
            type: "number",
            onSave: (value) => {
              const price = Number(value);

              if (
                value.trim() === "" ||
                !Number.isFinite(price) ||
                price < 0
              ) {
                throw new Error("Please enter a valid price.");
              }

              return handleUpdateListing({
                list_price: price,
              });
            },
          },
        ]}
        shortDescription={listing.short_description}
        longDescription={listing.long_description}
      />
    </InventoryDetail>
  );
};

export default ProductDetail;

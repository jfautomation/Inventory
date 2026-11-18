
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";
import { ProductListingService } from "../../services/productListingService";

import EditableField from "../UI/EditableField";
import type { ProductListingPayload } from "../../types";

import InventoryDetail from "../UI/Detail/InventoryDetail";
import StatCard from "../UI/Detail/StatCard";
import DetailCard from "../UI/Detail/DetailCard";
import SEOCard from "../UI/Detail/SEOCard";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openProductForListing } = useModal();

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const {
    productListings,
    products,
    parts,
    brands,
    categories,
    conditions,
    isLoading,
    fetchProductListings,
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

  const handleUpdateListing = async (
    updates: Partial<ProductListingPayload>
  ) => {
    const payload: ProductListingPayload = {
      title: listing.title,
      sku: listing.sku,
      part_id: listing.part_id,
      condition_id: listing.condition_id,
      price_mode: listing.price_mode ?? "automatic",
      list_price: listing.list_price,
      short_description: listing.short_description,
      long_description: listing.long_description,
      seo_title: listing.seo_title,
      meta_description: listing.meta_description,
      search_terms: listing.search_terms,
      image_id: listing.image_id,
      additional_image_ids: listing.additional_image_ids,
      status: listing.status ?? "publish",
      ...updates,
    };

    await ProductListingService.update(Number(listing.id), payload);
    await fetchProductListings();
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
          <StatCard
            label="Brand"
            value={brand?.name || "-"}
          />

          <StatCard
            label="Category"
            value={category?.name || "-"}
          />

          <StatCard
            label="Quantity"
            value={listing.quantity ?? listingProducts.length}
            type="stock"
          />
        </>
      }
      bottomContent={
        <SEOCard
          customSeoTitle={
            <EditableField
              label="SEO Title"
              value={listing.seo_title}
              onSave={(value) =>
                handleUpdateListing({ seo_title: value })
              }
            />
          }
          customMetaDescription={
            <EditableField
              label="Meta Description"
              value={listing.meta_description}
              type="textarea"
              onSave={(value) =>
                handleUpdateListing({ meta_description: value })
              }
            />
          }
          customSearchTerms={
            <EditableField
              label="Search Terms"
              value={listing.search_terms}
              type="textarea"
              onSave={(value) =>
                handleUpdateListing({ search_terms: value })
              }
            />
          }
        />
      }
      productsContent={
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-lg font-semibold">
            Serialized Products ({listingProducts.length})
          </h3>

          {listingProducts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No serialized products have been added to this listing yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-500">
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Work Order</th>
                    <th className="p-3">Shelf</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Tested</th>
                  </tr>
                </thead>

                <tbody>
                  {listingProducts.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-3">
                        {product.serial_number || "-"}
                      </td>
                      <td className="p-3">
                        {product.work_order || "-"}
                      </td>
                      <td className="p-3">
                        {product.shelf?.[0]?.name || "-"}
                      </td>
                      <td className="p-3">
                        {product.inventory_status || "-"}
                      </td>
                      <td className="p-3">
                        {product.test_status ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        onSaveTitle={async (value) => {
          if (!value.trim()) {
            throw new Error("Title is required.");
          }

          await handleUpdateListing({
            title: value.trim(),
          });
        }}
        
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
        onSaveShortDescription={(value) =>
          handleUpdateListing({
            short_description: value,
          })
        }
        longDescription={listing.long_description}
        onSaveLongDescription={(value) =>
          handleUpdateListing({
            long_description: value,
          })
        }
      />

    </InventoryDetail>
  );
};

export default ProductDetail;

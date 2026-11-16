
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useInventory } from "../../context/InventoryContext";
import { ProductListingService } from "../../services/productListingService";

import InventoryDetail from "../UI/Detail/InventoryDetail";
import DetailCard from "../UI/Detail/DetailCard";
import StatCard from "../UI/Detail/StatCard";
import SEOCard from "../UI/Detail/SEOCard";
import ConditionPill from "../UI/ConditionPill";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const part = parts.find(
    (item) => Number(item.id) === Number(listing.part_id)
  );

  const brand = brands.find(
    (item) => Number(item.id) === Number(part?.brand_id)
  );

  const category = categories.find(
    (item) => Number(item.id) === Number(part?.category_id)
  );

  const condition = conditions.find(
    (item) => Number(item.id) === Number(listing.condition_id)
  );

  const listingProducts = products.filter(
    (product) =>
      Number(product.product_listing_id) === Number(listing.id)
  );

  return (
    <InventoryDetail
      title="Product Listing Details"
      onEdit={() => {
        console.log("Product Listing edit not implemented yet.");
      }}
      onDelete={handleDelete}
      deleting={deleting}
      onAdd={() => {
        navigate("/products/new");
      }}
      addButtonLabel="Add Serialized Product"
      stats={
        <>
          <StatCard
            label="SKU"
            value={listing.sku}
          />
          <StatCard
            label="Condition"
            value={condition?.name ?? "-"}
          />
          <StatCard
            label="Price"
            value={
              listing.list_price != null
                ? `$${Number(listing.list_price).toLocaleString()}`
                : "-"
            }
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
          seoTitle={listing.seo_title}
          metaDescription={listing.meta_description}
          searchTerms={listing.search_terms}
        />
      }
    >
      <div className="space-y-6">
        {deleteError && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {deleteError}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-xl font-semibold">
            {listing.title}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Part
              </p>
              <p>{part?.name ?? "-"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Part Number
              </p>
              <p>{part?.part_number ?? "-"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Brand
              </p>
              <p>{brand?.name ?? "-"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Category
              </p>
              <p>{category?.name ?? "-"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Condition
              </p>
              {condition ? (
                <ConditionPill condition={condition.name} />
              ) : "-"}
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Price Mode
              </p>
              <p>{listing.price_mode ?? "-"}</p>
            </div>
          </div>

          <div className="mt-6 border-t pt-5">
            <h3 className="mb-2 font-semibold">Short Description</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-600">
              {listing.short_description || "No short description added."}
            </p>
          </div>

          <div className="mt-5 border-t pt-5">
            <h3 className="mb-2 font-semibold">Long Description</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-600">
              {listing.long_description || "No long description added."}
            </p>
          </div>
        </div>

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
                      <td className="p-3">{product.serial_number || "-"}</td>
                      <td className="p-3">{product.work_order || "-"}</td>
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
      </div>
    </InventoryDetail>
  );
};

export default ProductDetail;

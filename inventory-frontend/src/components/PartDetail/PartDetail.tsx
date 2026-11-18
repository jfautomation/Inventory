
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useInventory } from "../../context/InventoryContext";
import { TaxonomyService } from "../../services/taxonomyService";

import InventoryDetail from "../UI/Detail/InventoryDetail";
import StatCard from "../UI/Detail/StatCard";
import DetailCard from "../UI/Detail/DetailCard";
import SEOCard from "../UI/Detail/SEOCard";
import EditableField from "../UI/EditableField";

import type { Part } from "../../types";

type PartUpdate = Parameters<typeof TaxonomyService.updatePart>[1];

const PartDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    parts,
    brands,
    categories,
    series,
    fetchParts,
  } = useInventory();

  const [part, setPart] = useState<Part | null>(null);
  const [deleting, setDeleting] = useState(false);

  // LOAD PART
  useEffect(() => {
    if (!id) {
      setPart(null);
      return;
    }

    const partId = Number(id);
    const existingPart = parts.find((p) => p.id === partId) || null;

    setPart(existingPart);
  }, [id, parts]);

  if (!part) {
    return <div>Loading part...</div>;
  }

  // RELATED TAXONOMIES
  const brand = brands.find(
    (b) => b.id === Number(part.brand_id)
  );

  const category = categories.find(
    (c) => c.id === Number(part.category_id)
  );

  const partSeries = series.find(
    (s) => s.id === Number(part.series_id)
  );

  // UPDATE PART
  const handleUpdatePart = async (data: PartUpdate) => {
    await TaxonomyService.updatePart(part.id, data);
    await fetchParts();
  };

  // DELETE
  const handleDeletePart = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${part.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await TaxonomyService.deletePart(part.id);
      await fetchParts();

      navigate("/parts");
    } catch (err) {
      console.error("Delete part failed:", err);
      alert("Failed to delete part.");
    } finally {
      setDeleting(false);
    }
  };

  // BRAND OPTIONS
  const brandOptions = brands.map((item) => ({
    label: item.name,
    value: String(item.id),
  }));

  // CATEGORY OPTIONS
  const categoryOptions = categories.map((item) => ({
    label: item.name,
    value: String(item.id),
  }));

  // SERIES OPTIONS
  const seriesOptions = [
    { label: "No Series", value: "" },
    ...series.map((item) => ({
      label: item.name,
      value: String(item.id),
    })),
  ];

  return (
    <InventoryDetail
      title="Part Details"
      addButtonLabel="Add Part"
      deleting={deleting}
      image={part.image_url || undefined}
      statsColumns={4}
      additionalImages={part.additional_image_urls || []}
      imageAlt={part.name}
      onDelete={handleDeletePart}
      onAdd={() => navigate("/parts/new")}
      onEdit={() => {}}
      stats={
        <>
          <StatCard label="Brand" value={brand?.name || "-"} />
          <StatCard label="Category" value={category?.name || "-"} />
          <StatCard label="Series" value={partSeries?.name || "-"} />
        </>
      }
      bottomContent={
        <SEOCard
          customSeoTitle={
            <EditableField
              label="SEO Title"
              value={part.seo_title}
              onSave={(value) =>
                handleUpdatePart({ seo_title: value })
              }
            />
          }
          customMetaDescription={
            <EditableField
              label="Meta Description"
              value={part.meta_description}
              type="textarea"
              onSave={(value) =>
                handleUpdatePart({ meta_description: value })
              }
            />
          }
          customSearchTerms={
            <EditableField
              label="Search Terms"
              value={part.search_terms}
              type="textarea"
              onSave={(value) =>
                handleUpdatePart({ search_terms: value })
              }
            />
          }
        />
      }
    >
      <DetailCard
        part={part}
        brand={brand}
        category={category}
        title={part.name}
        titleLabel="Part Name"
        onSaveTitle={async (value) => {
          if (!value.trim()) {
            throw new Error("Part name is required.");
          }

          await handleUpdatePart({ name: value.trim() });
        }}
        editableFields={[
          {
            label: "Part Number",
            value: part.part_number,
            onSave: (value) => {
              if (!value.trim()) {
                throw new Error("Part Number is required.");
              }

              return handleUpdatePart({
                part_number: value.trim(),
              });
            },
          },
          {
            label: "Brand",
            value: brand?.name || "-",
            editValue: String(part.brand_id),
            type: "select",
            options: brandOptions,
            onSave: (value) =>
              handleUpdatePart({ brand_id: Number(value) }),
          },
          {
            label: "Category",
            value: category?.name || "-",
            editValue: String(part.category_id),
            type: "select",
            options: categoryOptions,
            onSave: (value) =>
              handleUpdatePart({ category_id: Number(value) }),
          },
          {
            label: "Series",
            value: partSeries?.name || "No Series",
            editValue: part.series_id
              ? String(part.series_id)
              : "",
            type: "select",
            options: seriesOptions,
            onSave: (value) =>
              handleUpdatePart({
                series_id: value ? Number(value) : null,
              }),
          },
          {
            label: "Base Price",
            value:
              part.base_price != null
                ? `$${Number(part.base_price).toLocaleString()}`
                : "-",
            editValue: part.base_price ?? "",
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

              return handleUpdatePart({ base_price: price });
            },
          },
        ]}
        shortDescription={part.short_description}
        onSaveShortDescription={(value) =>
          handleUpdatePart({ short_description: value })
        }
        longDescription={part.long_description}
        onSaveLongDescription={(value) =>
          handleUpdatePart({ long_description: value })
        }
      />
    </InventoryDetail>
  );
};

export default PartDetail;


import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useInventory } from "../../context/InventoryContext";
import { useModal } from "../../context/ModalContext";
import { TaxonomyService } from "../../services/taxonomyService";

import InventoryDetail from "../UI/Detail/InventoryDetail";
import StatCard from "../UI/Detail/StatCard";
import DetailCard from "../UI/Detail/DetailCard";
import SEOCard from "../UI/Detail/SEOCard";

import type { Part } from "../../types";

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

  const {
    openEditPart,
  } = useModal();

  const [part, setPart] = useState<Part | null>(null);
  const [deleting, setDeleting] = useState(false);

  // =========================================================
  // LOAD PART
  // =========================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    const partId = Number(id);

    const existingPart =
      parts.find(
        (p) => p.id === partId
      ) || null;

    setPart(existingPart);

  }, [id, parts]);


  // =========================================================
  // LOADING
  // =========================================================

  if (!part) {
    return (
      <div>
        Loading part...
      </div>
    );
  }


  // =========================================================
  // RELATED TAXONOMIES
  // =========================================================

  const brand =
    brands.find(
      (b) =>
        b.id === Number(part.brand_id)
    );

  const category =
    categories.find(
      (c) =>
        c.id === Number(part.category_id)
    );

  const partSeries =
    series.find(
      (s) =>
        s.id === Number(part.series_id)
    );


  // =========================================================
  // DELETE
  // =========================================================

  const handleDeletePart = async () => {

    const confirmed = window.confirm(
      `Are you sure you want to delete "${part.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {

      setDeleting(true);

      await TaxonomyService.deletePart(
        part.id
      );

      await fetchParts();

      navigate("/parts");

    } catch (err) {

      console.error(
        "Delete part failed:",
        err
      );

      alert(
        "Failed to delete part."
      );

    } finally {

      setDeleting(false);

    }
  };


  // =========================================================
  // EDIT
  // =========================================================

  const handleEditPart = () => {
    openEditPart(part);
  };


  // =========================================================
  // UI
  // =========================================================



  return (
    <InventoryDetail
      title="Part Details"
      deleteLabel="Delete Part"
      deleting={deleting}
      addLabel="Add New Part"
      editLabel="Edit Part Details"
      image={part.image_url}
      statsColumns={4}
      additionalImages={
        part.additional_image_urls || []
      }
      imageAlt={part.name}

      onDelete={handleDeletePart}
      onEdit={handleEditPart}
      onAdd={() => {
        navigate("/parts");
      }}

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
            label="Series"
            value={partSeries?.name || "-"}
          />

          <StatCard
            label="Base Price"
            value={
              part.base_price != null
                ? `$${Number(
                  part.base_price
                ).toLocaleString()}`
                : "-"
            }
          />
        </>
      }

      bottomContent={
        <SEOCard
          seoTitle={part.seo_title}
          metaDescription={part.meta_description}
          searchTerms={part.search_terms}
        />
      }
    >

      <DetailCard
        part={part}
        brand={brand}
        category={category}
      />

    </InventoryDetail>
  );
};

export default PartDetail;
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useInventory } from "../../context/InventoryContext";
import { useModal } from "../../context/ModalContext";
import { TaxonomyService } from "../../services/taxonomyService";

import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import Button from "../UI/Button/Button";

import DetailImageCard from "../UI/Detail/DetailImageCard";
import StatCard from "../UI/Detail/StatCard";
import DetailActions from "../UI/Detail/DetailActions";

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

  }, [
    id,
    parts,
  ]);


  // =========================================================
  // LOADING
  // =========================================================

  if (!part) {
    return (
      <PageContainer>
        <div className="p-6">
          Loading part...
        </div>
      </PageContainer>
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
    <PageContainer>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageHeader title="Part Details">

        <Button
          variant="danger"
          onClick={handleDeletePart}
          disabled={deleting}
        >
          {deleting
            ? "Deleting..."
            : "Delete Part"}
        </Button>

      </PageHeader>


      {/* =====================================================
          MAIN DETAIL AREA
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-[35%_65%]
          gap-6
          p-6
        "
      >

        {/* IMAGE */}

        <DetailImageCard
          image={part.image_url || ""}
        />


        {/* PART DETAILS */}

        <div
          className="
            bg-white
            border
            border-gray-200
            rounded-xl
            p-6
          "
        >

          <div className="mb-6">

            <p
              className="
                text-sm
                text-gray-500
                mb-2
              "
            >
              Part Number / Name
            </p>

            <h1
              className="
                text-2xl
                font-semibold
                text-gray-900
              "
            >
              {part.name}
            </h1>

          </div>


          <div className="space-y-5">

            <div>

              <p className="text-sm text-gray-500">
                Brand
              </p>

              <p className="font-medium text-gray-900">
                {brand?.name || "-"}
              </p>

            </div>


            <div>

              <p className="text-sm text-gray-500">
                Category
              </p>

              <p className="font-medium text-gray-900">
                {category?.name || "-"}
              </p>

            </div>


            <div>

              <p className="text-sm text-gray-500">
                Series
              </p>

              <p className="font-medium text-gray-900">
                {partSeries?.name || "-"}
              </p>

            </div>


            <div>

              <p className="text-sm text-gray-500">
                Base Price
              </p>

              <p className="font-medium text-gray-900">
                {part.base_price != null
                  ? `$${Number(
                      part.base_price
                    ).toLocaleString()}`
                  : "-"}
              </p>

            </div>


            <div>

              <p className="text-sm text-gray-500">
                Description
              </p>

              <p className="
                text-gray-700
                whitespace-pre-wrap
              ">
                {part.description || "-"}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          STATS
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-2
          xl:grid-cols-4
          gap-4
          mx-6
          p-5
          border
          border-gray-200
          rounded-xl
          bg-white
        "
      >

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

      </div>


      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="mt-3">

        <DetailActions
          onAdd={() => {
            navigate("/parts");
          }}
          onEdit={handleEditPart}
        />

      </div>

    </PageContainer>
  );
};

export default PartDetail;


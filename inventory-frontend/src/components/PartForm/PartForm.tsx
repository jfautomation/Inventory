import React, { useState } from "react";
import { Term } from "../../types";
import { TaxonomyService } from "../../services/taxonomyService";

type Props = {
  brands: Term[];
};

const PartForm: React.FC<Props> = ({ brands }) => {

  const [selectedBrand, setSelectedBrand] = useState<Term | null>(null);

  const [partName, setPartName] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    if (!selectedBrand || !partName.trim()) {
      alert("Brand and part name are required.");
      return;
    }

    try {

      setLoading(true);

      const res = await TaxonomyService.createPart({
        name: partName,
        brand_id: selectedBrand.id,
      });

      console.log("PART CREATED:", res);

      alert("Part created successfully.");

      // reset form
      setPartName("");
      setSelectedBrand(null);

    } catch (err) {

      console.error("Create part failed:", err);

      alert("Failed to create part.");
    }

    finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <h2>Create Part</h2>

      {/* BRAND */}
      <div style={{ marginBottom: 12 }}>

        <label>Brand</label>

        <select
          value={selectedBrand?.id ?? ""}
          onChange={(e) => {

            const brand =
              brands.find(
                (b) => b.id === Number(e.target.value)
              ) || null;

            setSelectedBrand(brand);
          }}
        >
          <option value="">
            Select Brand
          </option>

          {brands.map((brand) => (
            <option
              key={brand.id}
              value={brand.id}
            >
              {brand.name}
            </option>
          ))}
        </select>

      </div>

      {/* PART NAME */}
      <div style={{ marginBottom: 12 }}>

        <label>Part Number / Name</label>

        <input
          type="text"
          placeholder="Enter part number"
          value={partName}
          onChange={(e) => setPartName(e.target.value)}
        />

      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading
          ? "Creating..."
          : "Create Part"}
      </button>

    </div>
  );
};

export default PartForm;
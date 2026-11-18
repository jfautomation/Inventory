import PageContainer from "../PageContainer";
import PageHeader from "../PageHeader";
import Button from "../Button/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";

import DetailImageCard from "./DetailImageCard";

type InventoryDetailProps = {
    title: string;
    deleting: boolean;
    addButtonLabel?: string;

    image?: string | null;
    additionalImages?: string[];
    imageAlt?: string;

    onDelete: () => void;
    onEdit: () => void;
    onAdd: () => void;

    children: React.ReactNode;
    stats: React.ReactNode;
    statsColumns?: 4 | 5;
    bottomContent?: React.ReactNode;
    productsContent?: React.ReactNode;

};

export default function InventoryDetail({
    title,
    deleting,
    image,
    additionalImages = [],
    imageAlt,
    onDelete,
    onEdit,
    onAdd,
    children,
    bottomContent,
    statsColumns = 4,
    stats,
    productsContent,
    addButtonLabel = "Add",
}: InventoryDetailProps) {
    return (
        <PageContainer>
            {/* PAGE HEADER AND ACTIONS */}

            <PageHeader
                title={title}
                actions={
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                            variant="primary"
                            onClick={onAdd}
                        >
                            <Plus size={16} className="mr-2" />
                            {addButtonLabel}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={onDelete}
                            disabled={deleting}
                        >
                            <Trash2 size={16} className="mr-2" />
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                }
            />


            {/* TOP SECTION: IMAGE GALLERY AND DETAILS */}
            <section className="
  mx-2 mt-2 rounded-xl border border-gray-200 bg-white p-2
  sm:mx-3 sm:mt-3 sm:p-3
  md:mx-4 md:mt-3 md:p-4
  lg:mx-5 lg:mt-4 lg:p-4
  xl:mx-6 xl:mt-4 xl:p-5
">
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="min-w-0">
                        <DetailImageCard
                            image={image}
                            additionalImages={additionalImages}
                            alt={imageAlt}
                        />
                    </div>

                    <div className="min-w-0">
                        {children}
                    </div>
                </div>
            </section>

            {/* SUMMARY STATS */}
            <section
                className={`mx-6 mt-4 grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5 ${statsColumns === 5
                    ? "lg:grid-cols-5"
                    : "lg:grid-cols-4"
                    }`}
            >
                {stats}
            </section>

            {/* ADDITIONAL CONTENT, INCLUDING SEO */}
            {bottomContent && (
                <section className="mx-6 mt-4">
                    {bottomContent}
                </section>
            )}

            {/* ASSOCIATED SERIALIZED PRODUCTS - LAST SECTION */}
            {productsContent && (
                <section className="mx-6 mt-4">
                    {productsContent}
                </section>
            )}
        </PageContainer>
    );
}

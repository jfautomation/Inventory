import PageContainer from "../PageContainer";
import PageHeader from "../PageHeader";
import Button from "../Button/Button";

import DetailImageCard from "./DetailImageCard";
import DetailActions from "./DetailActions";

type InventoryDetailProps = {
    title: string;
    deleteLabel: string;
    deleting: boolean;

    image?: string | null;
    additionalImages?: string[];
    imageAlt?: string;

    onDelete: () => void;
    onEdit: () => void;
    onAdd: () => void;

    addLabel: string;
    editLabel: string;

    children: React.ReactNode;
    stats: React.ReactNode;
    statsColumns?: 4 | 5;
};

export default function InventoryDetail({
    title,
    deleteLabel,
    deleting,

    image,
    additionalImages = [],
    imageAlt,

    onDelete,
    onEdit,
    onAdd,

    addLabel,
    editLabel,

    children,
    statsColumns = 4,
    stats,


}: InventoryDetailProps) {
    return (
        <PageContainer>

            {/* HEADER */}

            <PageHeader title={title}>
                <Button
                    variant="danger"
                    onClick={onDelete}
                    disabled={deleting}
                >
                    {deleting ? "Deleting..." : deleteLabel}
                </Button>
            </PageHeader>


            {/* MAIN DETAIL AREA */}

            <div
                className="
          grid
          grid-cols-1
          xl:grid-cols-[35%_65%]
          gap-6
          p-6
        "
            >

                <DetailImageCard
                    image={image}
                    additionalImages={additionalImages}
                    alt={imageAlt}
                />

                {children}

            </div>


            {/* STATS */}

            <div
                className={`
        grid
        grid-cols-2
        ${statsColumns === 5
                        ? "xl:grid-cols-5"
                        : "xl:grid-cols-4"
                    }
        gap-4
        mx-6
        p-5
        border
        border-gray-200
        rounded-xl
        bg-white
    `}
            >
                {stats}
            </div>


            {/* ACTIONS */}

            <div className="mt-3">

                <DetailActions
                    onAdd={onAdd}
                    onEdit={onEdit}
                    addLabel={addLabel}
                    editLabel={editLabel}
                />

            </div>

        </PageContainer>
    );
}
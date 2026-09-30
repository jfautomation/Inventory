type SEOCardProps = {
    seoTitle?: string;
    metaDescription?: string;
    searchTerms?: string;
};

export default function SEOCard({
    seoTitle,
    metaDescription,
    searchTerms,
}: SEOCardProps) {
    return (
        <div
            className="
        border
        border-gray-200
        rounded-xl
        p-5
        bg-white
      "
        >


            <div
                className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-5
        "
            >
                <div>
                    <div className="text-sm text-gray-500 mb-1">
                        SEO Title
                    </div>

                    <div className="font-medium text-gray-900">
                        {seoTitle || "-"}
                    </div>
                </div>

                <div>
                    <div className="text-sm text-gray-500 mb-1">
                        Meta Description
                    </div>

                    <div className="font-medium text-gray-900">
                        {metaDescription || "-"}
                    </div>
                </div>

                <div>
                    <div className="text-sm text-gray-500 mb-1">
                        Search Terms
                    </div>

                    <div className="font-medium text-gray-900">
                        {searchTerms || "-"}
                    </div>
                </div>
            </div>
        </div>
    );
}
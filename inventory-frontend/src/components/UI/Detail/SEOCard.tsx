
import type { ReactNode } from "react";

type SEOCardProps = {
  seoTitle?: string;
  metaDescription?: string;
  searchTerms?: string;
  customSeoTitle?: ReactNode;
  customMetaDescription?: ReactNode;
  customSearchTerms?: ReactNode;
};

export default function SEOCard({
  seoTitle,
  metaDescription,
  searchTerms,
  customSeoTitle,
  customMetaDescription,
  customSearchTerms,
}: SEOCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div>
          {customSeoTitle ?? (
            <>
              <div className="text-sm text-gray-500 mb-1">
                SEO Title
              </div>
              <div className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                {seoTitle || "-"}
              </div>
            </>
          )}
        </div>

        <div>
          {customMetaDescription ?? (
            <>
              <div className="text-sm text-gray-500 mb-1">
                Meta Description
              </div>
              <div className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                {metaDescription || "-"}
              </div>
            </>
          )}
        </div>

        <div>
          {customSearchTerms ?? (
            <>
              <div className="text-sm text-gray-500 mb-1">
                Search Terms
              </div>
              <div className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                {searchTerms || "-"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

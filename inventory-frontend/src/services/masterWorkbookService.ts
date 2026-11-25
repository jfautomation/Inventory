
import ExcelJS from "exceljs";

import type {
    Part,
    ProductListing,
    Product,
} from "../types";


// ============================================================
// HELPERS
// ============================================================

const getTermNames = (value: any): string => {
    if (!value) return "";

    if (!Array.isArray(value)) {
        return typeof value === "string"
            ? value
            : value.name ?? "";
    }

    return value
        .map((term) => {
            if (typeof term === "string") return term;
            return term?.name ?? "";
        })
        .filter(Boolean)
        .join("; ");
};


const getAdditionalImageIds = (value: any): string => {
    if (!Array.isArray(value)) return "";

    return value.join(";");
};


// ============================================================
// WORKSHEET FORMATTING
// ============================================================

const formatWorksheet = (
    worksheet: ExcelJS.Worksheet
) => {
    worksheet.views = [
        {
            state: "frozen",
            ySplit: 1,
        },
    ];

    worksheet.getRow(1).font = {
        bold: true,
    };

    worksheet.getRow(1).alignment = {
        vertical: "middle",
        wrapText: true,
    };

    worksheet.autoFilter = {
        from: {
            row: 1,
            column: 1,
        },
        to: {
            row: 1,
            column: worksheet.columnCount,
        },
    };
};


// ============================================================
// MASTER WORKBOOK EXPORT
// ============================================================

export const exportMasterWorkbook = async (
    parts: Part[],
    listings: ProductListing[],
    products: Product[]
): Promise<void> => {

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "JF Automation";
    workbook.lastModifiedBy = "JF Automation";
    workbook.created = new Date();
    workbook.modified = new Date();

    workbook.properties.date1904 = false;


    // ========================================================
    // WORKSHEET 1: PARTS
    // ========================================================

    const partsSheet = workbook.addWorksheet("Parts");

    partsSheet.columns = [
        { header: "Part ID", key: "id", width: 12 },
        { header: "Part Name", key: "name", width: 35 },
        { header: "Part Number", key: "part_number", width: 22 },
        { header: "Brand ID", key: "brand_id", width: 12 },
        { header: "Category ID", key: "category_id", width: 14 },
        { header: "Series ID", key: "series_id", width: 12 },
        { header: "Base Price", key: "base_price", width: 15 },
        { header: "GTIN", key: "gtin", width: 20 },
        {
            header: "Google Product Category",
            key: "google_product_category",
            width: 28,
        },
        { header: "Description", key: "description", width: 40 },
        {
            header: "Short Description",
            key: "short_description",
            width: 40,
        },
        {
            header: "Long Description",
            key: "long_description",
            width: 50,
        },
        { header: "Image ID", key: "image_id", width: 14 },
        {
            header: "Additional Image IDs",
            key: "additional_image_ids",
            width: 25,
        },
        { header: "SEO Title", key: "seo_title", width: 35 },
        {
            header: "Meta Description",
            key: "meta_description",
            width: 45,
        },
        { header: "Search Terms", key: "search_terms", width: 40 },
    ];

    parts.forEach((part) => {
        partsSheet.addRow({
            id: part.id,
            name: part.name ?? "",
            part_number: part.part_number ?? "",
            brand_id: part.brand_id ?? "",
            category_id: part.category_id ?? "",
            series_id: part.series_id ?? "",
            base_price: part.base_price ?? "",
            gtin: part.gtin ?? "",
            google_product_category:
                part.google_product_category ?? "",
            description: part.description ?? "",
            short_description: part.short_description ?? "",
            long_description: part.long_description ?? "",
            image_id: part.image_id ?? "",
            additional_image_ids: getAdditionalImageIds(
                part.additional_image_ids
            ),
            seo_title: part.seo_title ?? "",
            meta_description: part.meta_description ?? "",
            search_terms: part.search_terms ?? "",
        });
    });

    formatWorksheet(partsSheet);


    // ========================================================
    // WORKSHEET 2: PRODUCT VARIATIONS
    // ========================================================

    const listingsSheet = workbook.addWorksheet(
        "Product Variations"
    );

    listingsSheet.columns = [
        { header: "Listing ID", key: "id", width: 14 },
        { header: "Part ID", key: "part_id", width: 12 },
        { header: "Condition ID", key: "condition_id", width: 15 },
        { header: "SKU", key: "sku", width: 18 },
        { header: "Price Mode", key: "price_mode", width: 15 },
        { header: "List Price", key: "list_price", width: 15 },
        { header: "Status", key: "status", width: 15 },
    ];

    listings.forEach((listing) => {
        listingsSheet.addRow({
            id: listing.id,
            part_id: listing.part_id,
            condition_id: listing.condition_id,
            sku: listing.sku ?? "",
            price_mode: listing.price_mode ?? "automatic",
            list_price: listing.list_price ?? "",
            status: listing.status ?? "publish",
        });
    });

    formatWorksheet(listingsSheet);


    // ========================================================
    // WORKSHEET 3: SERIALIZED PRODUCTS
    // ========================================================

    const productsSheet = workbook.addWorksheet(
        "Serialized Products"
    );

    productsSheet.columns = [
        { header: "Product ID", key: "id", width: 14 },
        {
            header: "Product Listing ID",
            key: "product_listing_id",
            width: 20,
        },
        { header: "Product Title", key: "title", width: 35 },
        { header: "Serial Number", key: "serial_number", width: 22 },
        { header: "Work Order", key: "work_order", width: 20 },
        { header: "Part", key: "part", width: 25 },
        { header: "Brand", key: "brand", width: 22 },
        { header: "Category", key: "category", width: 22 },
        { header: "Condition", key: "condition", width: 18 },
        { header: "Shelf", key: "shelf", width: 18 },
        {
            header: "Inventory Status",
            key: "inventory_status",
            width: 18,
        },
        { header: "Test Status", key: "test_status", width: 15 },
        { header: "Test Date", key: "test_date", width: 18 },
        { header: "Notes", key: "notes", width: 45 },
    ];

    products.forEach((product) => {
        productsSheet.addRow({
            id: product.id,
            product_listing_id: product.product_listing_id,
            title: product.title ?? "",
            serial_number: product.serial_number ?? "",
            work_order: product.work_order ?? "",
            part: getTermNames(product.part),
            brand: getTermNames(product.brand),
            category: getTermNames(product.inventory_category),
            condition: getTermNames(product.condition),
            shelf: getTermNames(product.shelf),
            inventory_status: product.inventory_status ?? "",
            test_status: product.test_status ? "Yes" : "No",
            test_date: product.test_date ?? "",
            notes: product.notes ?? "",
        });
    });

    formatWorksheet(productsSheet);


    // ========================================================
    // DOWNLOAD WORKBOOK
    // ========================================================

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob(
        [buffer as BlobPart],
        {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "JF_Automation_Master_Inventory.xlsx";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);

};

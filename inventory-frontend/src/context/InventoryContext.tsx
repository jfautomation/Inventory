
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";

import { api } from "../api/client";
import { ProductListingService } from "../services/productListingService";

import type {
    Product,
    ProductListing,
    Part,
    Term,
} from "../types";


// ============================================================
// CONTEXT TYPE
// ============================================================

type InventoryContextType = {
    isLoading: boolean;

    products: Product[];
    productListings: ProductListing[];
    parts: Part[];

    brands: Term[];
    shelves: Term[];
    conditions: Term[];
    categories: Term[];
    series: Term[];

    // Initial load
    fetchBootstrap: () => Promise<void>;

    // Individual inventory refreshes
    fetchProducts: () => Promise<void>;
    fetchProductListings: () => Promise<void>;
    fetchParts: () => Promise<void>;

    // Taxonomies
    fetchBrands: () => Promise<void>;
    fetchShelves: () => Promise<void>;
    fetchConditions: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    fetchSeries: () => Promise<void>;
};


// ============================================================
// BOOTSTRAP RESPONSE
// ============================================================

type BootstrapResponse = {
    products: Product[];
    product_listings: ProductListing[];
    parts: Part[];

    brands: Term[];
    shelves: Term[];
    conditions: Term[];
    categories: Term[];
    series: Term[];
};


// ============================================================
// CONTEXT
// ============================================================

const InventoryContext = createContext<
    InventoryContextType | undefined
>(undefined);


// ============================================================
// PROVIDER
// ============================================================

export const InventoryProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {

    const [products, setProducts] = useState<Product[]>([]);
    const [productListings, setProductListings] = useState<ProductListing[]>([]);
    const [parts, setParts] = useState<Part[]>([]);

    const [brands, setBrands] = useState<Term[]>([]);
    const [shelves, setShelves] = useState<Term[]>([]);
    const [conditions, setConditions] = useState<Term[]>([]);
    const [categories, setCategories] = useState<Term[]>([]);
    const [series, setSeries] = useState<Term[]>([]);

    const [isLoading, setIsLoading] = useState(true);


    // ========================================================
    // INITIAL BOOTSTRAP
    // ONE REQUEST FOR EVERYTHING
    // ========================================================

    const fetchBootstrap = useCallback(async () => {
        try {
            console.log("BOOTSTRAP: START");

            const response = await api.get<BootstrapResponse>(
                "/inventory/v1/bootstrap",
                {
                    timeout: 10000,
                }
            );

            const data = response.data;

            setProducts(data?.products ?? []);
            setProductListings(data?.product_listings ?? []);
            setParts(data?.parts ?? []);

            setBrands(data?.brands ?? []);
            setShelves(data?.shelves ?? []);
            setConditions(data?.conditions ?? []);
            setCategories(data?.categories ?? []);
            setSeries(data?.series ?? []);

            console.log("BOOTSTRAP: COMPLETE");
            console.log("PRODUCTS:", data?.products?.length ?? 0);
            console.log("PRODUCT LISTINGS:", data?.product_listings?.length ?? 0);
            console.log("PARTS:", data?.parts?.length ?? 0);

        } catch (err: any) {
            console.error(
                "BOOTSTRAP FAILED:",
                err?.response?.data ||
                err?.message ||
                err
            );

            throw err;
        }
    }, []);


    // ========================================================
    // PRODUCTS ONLY
    // ========================================================

    const fetchProducts = useCallback(async () => {
        try {
            const response = await api.get<Product[]>(
                "/wp/v2/product"
            );

            setProducts(response.data ?? []);

        } catch (err: any) {
            console.error(
                "fetchProducts failed:",
                err?.response?.data ||
                err?.message ||
                err
            );

            throw err;
        }
    }, []);


    // ========================================================
    // PRODUCT LISTINGS ONLY
    // ========================================================

    const fetchProductListings = useCallback(async () => {
        try {
            const listings = await ProductListingService.getAll();

            setProductListings(listings ?? []);

        } catch (err: any) {
            console.error(
                "fetchProductListings failed:",
                err?.response?.data ||
                err?.message ||
                err
            );

            throw err;
        }
    }, []);


    // ========================================================
    // PARTS ONLY
    // ========================================================

    const fetchParts = useCallback(async () => {
        try {
            const response = await api.get<Part[]>(
                "/inventory/v1/parts",
                {
                    timeout: 10000,
                }
            );

            setParts(response.data ?? []);

        } catch (err: any) {
            console.error(
                "fetchParts failed:",
                err?.response?.data ||
                err?.message ||
                err
            );

            throw err;
        }
    }, []);


    // ========================================================
    // TAXONOMIES
    // ========================================================

    const fetchBrands = useCallback(async () => {
        const response = await api.get<Term[]>(
            "/wp/v2/brand?per_page=100"
        );

        setBrands(response.data ?? []);
    }, []);


    const fetchShelves = useCallback(async () => {
        const response = await api.get<Term[]>(
            "/wp/v2/shelf?per_page=100"
        );

        setShelves(response.data ?? []);
    }, []);


    const fetchConditions = useCallback(async () => {
        const response = await api.get<Term[]>(
            "/wp/v2/condition?per_page=100"
        );

        setConditions(response.data ?? []);
    }, []);


    const fetchCategories = useCallback(async () => {
        const response = await api.get<Term[]>(
            "/wp/v2/inventory_category?per_page=100"
        );

        setCategories(response.data ?? []);
    }, []);


    const fetchSeries = useCallback(async () => {
        const response = await api.get<Term[]>(
            "/wp/v2/series?per_page=100"
        );

        setSeries(response.data ?? []);
    }, []);


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setIsLoading(true);

            try {
                await fetchBootstrap();
            } catch (err) {
                console.error(
                    "INITIAL INVENTORY LOAD FAILED:",
                    err
                );
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [fetchBootstrap]);


    // ========================================================
    // PROVIDER
    // ========================================================

    return (
        <InventoryContext.Provider
            value={{
                isLoading,

                products,
                productListings,
                parts,

                brands,
                shelves,
                conditions,
                categories,
                series,

                fetchBootstrap,

                fetchProducts,
                fetchProductListings,
                fetchParts,

                fetchBrands,
                fetchShelves,
                fetchConditions,
                fetchCategories,
                fetchSeries,
            }}
        >
            {children}
        </InventoryContext.Provider>
    );
};


// ============================================================
// HOOK
// ============================================================

export const useInventory = () => {
    const ctx = useContext(InventoryContext);

    if (!ctx) {
        throw new Error(
            "useInventory must be used inside InventoryProvider"
        );
    }

    return ctx;
};

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";

import { api } from "../api/client";

import type {
    Product,
    Part,
    Term,
} from "../types";


// ============================================================
// CONTEXT TYPE
// ============================================================

type InventoryContextType = {

    // Loading
    isLoading: boolean;

    // Inventory
    products: Product[];
    parts: Part[];

    // Taxonomies
    brands: Term[];
    shelves: Term[];
    conditions: Term[];
    categories: Term[];
    series: Term[];

    // Bootstrap
    fetchBootstrap: () => Promise<void>;

    // Individual fetches
    fetchProducts: () => Promise<void>;
    fetchParts: () => Promise<void>;

    fetchBrands: () => Promise<void>;
    fetchShelves: () => Promise<void>;
    fetchConditions: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    fetchSeries: () => Promise<void>;

    // Refresh
    refreshInventory: () => Promise<void>;
    refreshTaxonomies: () => Promise<void>;
    refreshEverything: () => Promise<void>;
};


// ============================================================
// BOOTSTRAP RESPONSE
// ============================================================

type BootstrapResponse = {
    products: Product[];
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

    // ========================================================
    // STATE
    // ========================================================

    const [products, setProducts] = useState<Product[]>([]);
    const [parts, setParts] = useState<Part[]>([]);

    const [brands, setBrands] = useState<Term[]>([]);
    const [shelves, setShelves] = useState<Term[]>([]);
    const [conditions, setConditions] = useState<Term[]>([]);
    const [categories, setCategories] = useState<Term[]>([]);
    const [series, setSeries] = useState<Term[]>([]);

    const [isLoading, setIsLoading] = useState(true);


    // ========================================================
    // BOOTSTRAP
    //
    // ONE REQUEST loads:
    //
    // products
    // parts
    // brands
    // shelves
    // conditions
    // categories
    // series
    // ========================================================

    const fetchBootstrap = useCallback(async () => {

        const start = performance.now();

        try {

            console.log("========================================");
            console.log("BOOTSTRAP: START");

            const response = await api.get<BootstrapResponse>(
                "/inventory/v1/bootstrap",
                {
                    timeout: 10000,
                }
            );

            const data = response.data;

            // =================================================
            // UPDATE ALL STATE
            // =================================================

            setProducts(data?.products ?? []);
            setParts(data?.parts ?? []);

            setBrands(data?.brands ?? []);
            setShelves(data?.shelves ?? []);
            setConditions(data?.conditions ?? []);
            setCategories(data?.categories ?? []);
            setSeries(data?.series ?? []);


            const elapsed = performance.now() - start;

            console.log("BOOTSTRAP: COMPLETE");
            console.log(
                "TIME:",
                elapsed.toFixed(2),
                "ms"
            );

            console.log(
                "PRODUCTS:",
                data?.products?.length ?? 0
            );

            console.log(
                "PARTS:",
                data?.parts?.length ?? 0
            );

            console.log(
                "BRANDS:",
                data?.brands?.length ?? 0
            );

            console.log(
                "SHELVES:",
                data?.shelves?.length ?? 0
            );

            console.log(
                "CONDITIONS:",
                data?.conditions?.length ?? 0
            );

            console.log(
                "CATEGORIES:",
                data?.categories?.length ?? 0
            );

            console.log(
                "SERIES:",
                data?.series?.length ?? 0
            );

            console.log(
                "RESPONSE SIZE:",
                JSON.stringify(data).length,
                "bytes"
            );

            console.log("========================================");

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
    // PRODUCTS
    //
    // Keep this available for situations where you only
    // specifically need products.
    // ========================================================

    const fetchProducts = useCallback(async () => {

        const start = performance.now();

        try {

            const response = await api.get<Product[]>(
                "/wp/v2/product"
            );

            setProducts(response.data ?? []);

            console.log(
                "FETCH PRODUCTS:",
                (performance.now() - start).toFixed(2),
                "ms"
            );

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
    // PARTS
    // ========================================================

    const fetchParts = useCallback(async () => {

        const start = performance.now();

        try {

            const response = await api.get<Part[]>(
                "/inventory/v1/parts",
                {
                    timeout: 10000,
                }
            );

            setParts(response.data ?? []);

            console.log(
                "FETCH PARTS:",
                (performance.now() - start).toFixed(2),
                "ms"
            );

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
    // BRANDS
    // ========================================================

    const fetchBrands = useCallback(async () => {

        try {

            const response = await api.get<Term[]>(
                "/wp/v2/brand?per_page=100"
            );

            setBrands(response.data ?? []);

        } catch (err: any) {

            console.error(
                "fetchBrands failed:",
                err?.response?.data ||
                err?.message ||
                err
            );

            throw err;

        }

    }, []);


    // ========================================================
    // SHELVES
    // ========================================================

    const fetchShelves = useCallback(async () => {

        try {

            const response = await api.get<Term[]>(
                "/wp/v2/shelf?per_page=100"
            );

            setShelves(response.data ?? []);

        } catch (err: any) {

            console.error(
                "fetchShelves failed:",
                err?.response?.data ||
                err?.message ||
                err
            );

            throw err;

        }

    }, []);


    // ========================================================
    // CONDITIONS
    // ========================================================

    const fetchConditions = useCallback(async () => {

        try {

            const response = await api.get<Term[]>(
                "/wp/v2/condition?per_page=100"
            );

            setConditions(response.data ?? []);

        } catch (err: any) {

            console.error(
                "fetchConditions failed:",
                err?.response?.data ||
                err?.message ||
                err
            );

            throw err;

        }

    }, []);


    // ========================================================
    // CATEGORIES
    // ========================================================

    const fetchCategories = useCallback(async () => {

        try {

            const response = await api.get<Term[]>(
                "/wp/v2/inventory_category?per_page=100"
            );

            setCategories(response.data ?? []);

        } catch (err: any) {

            console.error(
                "fetchCategories failed:",
                err?.response?.data ||
                err?.message ||
                err
            );

            throw err;

        }

    }, []);


    // ========================================================
    // SERIES
    // ========================================================

    const fetchSeries = useCallback(async () => {

        try {

            const response = await api.get<Term[]>(
                "/wp/v2/series?per_page=100"
            );

            setSeries(response.data ?? []);

        } catch (err: any) {

            console.error(
                "fetchSeries failed:",
                err?.response?.data ||
                err?.message ||
                err
            );

            throw err;

        }

    }, []);


    // ========================================================
    // REFRESH INVENTORY
    //
    // ONLY products + parts
    // ========================================================

    const refreshInventory = useCallback(async () => {

        await Promise.all([
            fetchProducts(),
            fetchParts(),
        ]);

    }, [
        fetchProducts,
        fetchParts,
    ]);


    // ========================================================
    // REFRESH TAXONOMIES
    //
    // ONLY taxonomy data
    // ========================================================

    const refreshTaxonomies = useCallback(async () => {

        await Promise.all([
            fetchBrands(),
            fetchShelves(),
            fetchConditions(),
            fetchCategories(),
            fetchSeries(),
        ]);

    }, [
        fetchBrands,
        fetchShelves,
        fetchConditions,
        fetchCategories,
        fetchSeries,
    ]);


    // ========================================================
    // REFRESH EVERYTHING
    //
    // IMPORTANT:
    //
    // One bootstrap request.
    // ========================================================

    const refreshEverything = useCallback(async () => {

        await fetchBootstrap();

    }, [
        fetchBootstrap,
    ]);


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        let mounted = true;

        const loadInventory = async () => {

            const start = performance.now();

            console.log("========================================");
            console.log("INVENTORY INITIAL LOAD: START");

            setIsLoading(true);

            try {

                await fetchBootstrap();

            } catch (err) {

                console.error(
                    "INITIAL INVENTORY LOAD FAILED:",
                    err
                );

            } finally {

                if (!mounted) {
                    return;
                }

                setIsLoading(false);

                console.log(
                    "INVENTORY INITIAL LOAD:",
                    (performance.now() - start).toFixed(2),
                    "ms"
                );

                console.log("========================================");
            }

        };

        loadInventory();

        return () => {
            mounted = false;
        };

    }, [
        fetchBootstrap,
    ]);


    // ========================================================
    // PROVIDER
    // ========================================================

    return (
        <InventoryContext.Provider
            value={{

                // Loading
                isLoading,

                // Inventory
                products,
                parts,

                // Taxonomies
                brands,
                shelves,
                conditions,
                categories,
                series,

                // Bootstrap
                fetchBootstrap,

                // Individual fetches
                fetchProducts,
                fetchParts,

                fetchBrands,
                fetchShelves,
                fetchConditions,
                fetchCategories,
                fetchSeries,

                // Refresh
                refreshInventory,
                refreshTaxonomies,
                refreshEverything,

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
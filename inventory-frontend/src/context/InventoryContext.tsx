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

    // Inventory fetches
    fetchProducts: () => Promise<void>;
    fetchParts: () => Promise<void>;

    // Taxonomy fetches
    fetchBrands: () => Promise<void>;
    fetchShelves: () => Promise<void>;
    fetchConditions: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    fetchSeries: () => Promise<void>;

    // Refresh helpers
    refreshInventory: () => Promise<void>;
    refreshTaxonomies: () => Promise<void>;
    refreshEverything: () => Promise<void>;
};


const InventoryContext = createContext<InventoryContextType | undefined>(
    undefined
);


export const InventoryProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {


    // =========================
    // INVENTORY STATE
    // =========================

    const [products, setProducts] = useState<Product[]>([]);
    const [parts, setParts] = useState<Part[]>([]);

    const [isLoading, setIsLoading] = useState(true);



    // =========================
    // TAXONOMY STATE
    // =========================

    const [brands, setBrands] = useState<any[]>([]);
    const [shelves, setShelves] = useState<any[]>([]);
    const [conditions, setConditions] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [series, setSeries] = useState<any[]>([]);



    // =========================
    // PRODUCTS
    // =========================

    const fetchProducts = useCallback(async () => {

        try {



            const res = await api.get("/wp/v2/product");





            setProducts(res.data || []);

        } catch (err) {

            console.error(
                "fetchProducts failed:",
                err
            );

        }

    }, []);



    // =========================
    // PARTS
    // =========================

    const fetchParts = useCallback(async () => {

        try {

            console.time("FETCH PARTS");



            const url =
                "/inventory/v1/parts";



            const res = await api.get(
                url,
                {
                    timeout: 10000,
                }
            );




            console.timeEnd("FETCH PARTS");


            setParts(
                res.data || []
            );


        } catch (err: any) {

            console.error(
                "fetchParts failed:",
                err.response?.data || err.message || err
            );


        }

    }, []);




    // =========================
    // BRANDS
    // =========================

    const fetchBrands = useCallback(async () => {

        try {

            const res = await api.get(
                "/wp/v2/brand?per_page=100"
            );

            setBrands(res.data || []);

        } catch (err) {

            console.error(
                "fetchBrands failed:",
                err
            );

        }

    }, []);



    // =========================
    // SHELVES
    // =========================

    const fetchShelves = useCallback(async () => {

        try {

            const res = await api.get(
                "/wp/v2/shelf?per_page=100"
            );

            setShelves(res.data || []);

        } catch (err) {

            console.error(
                "fetchShelves failed:",
                err
            );

        }

    }, []);




    // =========================
    // CONDITIONS
    // =========================

    const fetchConditions = useCallback(async () => {

        try {

            const res = await api.get(
                "/wp/v2/condition?per_page=100"
            );

            setConditions(res.data || []);

        } catch (err) {

            console.error(
                "fetchConditions failed:",
                err
            );

        }

    }, []);




    // =========================
    // CATEGORIES
    // =========================

    const fetchCategories = useCallback(async () => {

        try {

            const res = await api.get(
                "/wp/v2/inventory_category?per_page=100"
            );

            setCategories(res.data || []);

        } catch (err) {

            console.error(
                "fetchCategories failed:",
                err
            );

        }

    }, []);




    // =========================
    // SERIES
    // =========================

    const fetchSeries = useCallback(async () => {

        try {

            const res = await api.get(
                "/wp/v2/series?per_page=100"
            );

            setSeries(res.data || []);

        } catch (err) {

            console.error(
                "fetchSeries failed:",
                err
            );

        }

    }, []);




    // =========================
    // REFRESH INVENTORY
    // =========================

    const refreshInventory = useCallback(async () => {

        await fetchProducts();

        await fetchParts();

    }, [
        fetchProducts,
        fetchParts,
    ]);




    // =========================
    // REFRESH TAXONOMIES
    // =========================

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




    // =========================
    // REFRESH EVERYTHING
    // =========================

    const refreshEverything = useCallback(async () => {

        await Promise.all([
            refreshInventory(),
            refreshTaxonomies(),
        ]);

    }, [
        refreshInventory,
        refreshTaxonomies,
    ]);




    // =========================
    // INITIAL APP LOAD
    // =========================

    useEffect(() => {

        const loadInventory = async () => {



            setIsLoading(true);

            await refreshEverything();

            setIsLoading(false);

        };


        loadInventory();


    }, [
        refreshEverything,
    ]);




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


                // Fetch functions
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




export const useInventory = () => {

    const ctx = useContext(InventoryContext);


    if (!ctx) {

        throw new Error(
            "useInventory must be used inside InventoryProvider"
        );

    }


    return ctx;

};
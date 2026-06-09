// export async function uploadImage(file: File): Promise<number> {
//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch(
//         "http://jf-auto-inventory-clone-2.local/wp-json/wp/v2/media",
//         {
//             method: "POST",
//             body: formData,

//             credentials: "include",

//             headers: {
//                 "X-WP-Nonce": (window as any).wpApiSettings?.nonce,
//             },
//         }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//         console.error(data);
//         throw new Error(data.message || "Upload failed");
//     }

//     return data.id;
// }

import { api } from "../api/client";

export async function uploadImage(file: File): Promise<number> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(
        "/wp/v2/media",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data.id;
}
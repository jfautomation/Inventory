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
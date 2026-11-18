
import { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";

type EditableFieldProps = {
    label: string;
    value: string | number | null | undefined;
    onSave: (value: string) => Promise<void>;
    type?: "text" | "number" | "textarea" | "select";
    placeholder?: string;
    options?: { label: string; value: string }[];
    valueClassName?: string;
    editValue?: string | number | null;
};

export default function EditableField({
    type = "text",
    placeholder,
    options = [],
    label,
    value,
    editValue,
    onSave,
    valueClassName = "text-sm font-semibold text-gray-900",
}: EditableFieldProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(
        String(editValue ?? value ?? "")
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!editing) {
            setDraft(String(editValue ?? value ?? ""));
        }
    }, [value, editValue, editing]);

    const handleCancel = () => {
        setDraft(String(editValue ?? value ?? ""));
        setError("");
        setEditing(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");

        try {
            await onSave(draft);
            setEditing(false);
        } catch {
            setError("Unable to save this field.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-w-0 border-b border-gray-100 py-3 last:border-b-0">
            {/* Label and pencil */}
            <div className="mb-1 flex items-center gap-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {label}
                </p>

                {!editing && (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        title={`Edit ${label}`}
                    >
                        <Pencil size={13} />
                    </button>
                )}
            </div>

            {editing ? (
                <div className="space-y-2">
                    {type === "textarea" ? (
                        <textarea
                            value={draft}
                            placeholder={placeholder}
                            onChange={(e) => setDraft(e.target.value)}
                            rows={4}
                            disabled={saving}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    ) : type === "select" ? (
                        <select
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            disabled={saving}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={type}
                            value={draft}
                            placeholder={placeholder}
                            onChange={(e) => setDraft(e.target.value)}
                            disabled={saving}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Check size={15} />
                            {saving ? "Saving..." : "Save"}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            <X size={15} />
                            Cancel
                        </button>
                    </div>

                    {error && (
                        <p className="text-xs text-red-600">{error}</p>
                    )}
                </div>
            ) : (
                <p className={`whitespace-pre-wrap break-words ${valueClassName}`}>
                    {value !== null && value !== undefined && value !== ""
                        ? value
                        : "-"}
                </p>
            )}
        </div>
    );
}

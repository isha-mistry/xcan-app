"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Building2,
    Loader2,
    MapPinned,
    Save,
} from "lucide-react";
import { AdminPageHero } from "@/components/BuilderPods/ui";

interface RegionOption {
    _id: string;
    name: string;
    showcaseCity: string;
    stateCodes: string[];
}

interface StateCodeOption {
    code: string;
    regionId: string;
}

export default function AddCollegePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingRegions, setLoadingRegions] = useState(true);
    const [regions, setRegions] = useState<RegionOption[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "",
        podName: "",
        city: "",
        state: "",
        stateCode: "",
        regionId: "",
        facultyName: "",
    });

    useEffect(() => {
        let active = true;

        const loadRegions = async () => {
            try {
                setLoadingRegions(true);
                const response = await fetch("/api/admin/builder-pods/events", {
                    credentials: "include",
                });
                const payload = await response.json();

                if (!response.ok || !payload?.success) {
                    throw new Error(payload?.error || "Failed to load seeded regions");
                }

                if (active) {
                    setRegions(payload.regions ?? []);
                }
            } catch (err) {
                if (active) {
                    setError((err as Error).message || "Failed to load regions");
                }
            } finally {
                if (active) {
                    setLoadingRegions(false);
                }
            }
        };

        loadRegions();

        return () => {
            active = false;
        };
    }, []);

    const slugPreview = useMemo(
        () =>
            form.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim(),
        [form.name]
    );

    const stateCodeOptions = useMemo(() => {
        const seen = new Set<string>();

        return regions.flatMap((region) =>
            (region.stateCodes ?? [])
                .map((code) => code.trim().toUpperCase())
                .filter((code) => {
                    if (!code || seen.has(code)) return false;
                    seen.add(code);
                    return true;
                })
                .map((code) => ({
                    code,
                    regionId: region._id,
                }))
        );
    }, [regions]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const nextValue = name === "stateCode" ? value.toUpperCase() : value;

        setForm((prev) => ({
            ...prev,
            [name]: nextValue,
            ...(name === "stateCode"
                ? {
                      regionId:
                          stateCodeOptions.find(
                              (option) => option.code === nextValue
                          )?.regionId ?? "",
                  }
                : {}),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const regionId =
                stateCodeOptions.find((option) => option.code === form.stateCode)
                    ?.regionId ?? form.regionId;

            if (!regionId) {
                setError("Please select a supported state code");
                setLoading(false);
                return;
            }

            const payload = {
                name: form.name.trim(),
                podName: form.podName.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                stateCode: form.stateCode.trim(),
                regionId,
                facultyName: form.facultyName.trim() || undefined,
            };

            const res = await fetch("/api/admin/builder-pods/colleges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => null);

            if (res.ok) {
                router.push("/admin/builder-pods/colleges");
                return;
            }

            setError(data?.error || "Failed to create college");
        } catch (err) {
            console.error(err);
            setError("Failed to create college");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods/colleges" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Colleges
            </Link>
            <AdminPageHero
                accent="green"
                title="Add College"
                description="Create a new college workspace and map it to a regional showcase zone."
                showBack={false}
            />

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-container rounded-2xl p-6 max-w-2xl"
            >
                <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                        <MapPinned className="mt-0.5 h-4 w-4 text-cyan-400/70" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-robotoMono">
                                Setup Notes
                            </p>
                            <p className="text-xs text-white/70 font-robotoMono">
                                Colleges are created as <span className="text-white">inactive</span> by default.
                                After saving, activate the college from the management screen before using the
                                public registration flow. The selected state code is mapped to the correct
                                Builder Pods region automatically.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-white/75 font-robotoMono mb-1.5">
                            College Name <span className="text-red-400/70">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. IIT Bombay"
                            required
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono placeholder:text-white/70 focus:outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-white/75 font-robotoMono mb-1.5">
                            URL Slug Preview
                        </label>
                        <div className="w-full px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-white/60 font-robotoMono">
                            {slugPreview || "Generated from the college name"}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-white/75 font-robotoMono mb-1.5">
                            Pod Name <span className="text-red-400/70">*</span>
                        </label>
                        <input
                            type="text"
                            name="podName"
                            value={form.podName}
                            onChange={handleChange}
                            placeholder="e.g. Chain Architects"
                            required
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono placeholder:text-white/70 focus:outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-white/75 font-robotoMono mb-1.5">
                            City <span className="text-red-400/70">*</span>
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="e.g. Mumbai"
                            required
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono placeholder:text-white/70 focus:outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-white/75 font-robotoMono mb-1.5">
                            State <span className="text-red-400/70">*</span>
                        </label>
                        <input
                            type="text"
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                            placeholder="e.g. Maharashtra"
                            required
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono placeholder:text-white/70 focus:outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-white/75 font-robotoMono mb-1.5">
                            State Code <span className="text-red-400/70">*</span>
                        </label>
                        <select
                            name="stateCode"
                            value={form.stateCode}
                            onChange={handleChange}
                            required
                            disabled={loadingRegions || stateCodeOptions.length === 0}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#0a0f17] border border-white/[0.06] text-xs text-white/80 font-robotoMono focus:outline-none focus:border-white/15 transition-colors disabled:opacity-50"
                        >
                            <option value="">
                                {loadingRegions
                                    ? "Loading state codes..."
                                    : "Select a state code"}
                            </option>
                            {stateCodeOptions.map((option) => (
                                <option key={option.code} value={option.code}>
                                    {option.code}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-white/75 font-robotoMono mb-1.5">
                            Faculty Coordinator
                        </label>
                        <input
                            type="text"
                            name="facultyName"
                            value={form.facultyName}
                            onChange={handleChange}
                            placeholder="Full name"
                            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono placeholder:text-white/70 focus:outline-none focus:border-white/15 transition-colors"
                        />
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-300 font-robotoMono">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={
                            loading || loadingRegions || stateCodeOptions.length === 0
                        }
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-bold font-robotoMono transition-all border border-green-500/10 disabled:opacity-30"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Create College
                    </button>
                </div>
            </motion.form>
        </div>
    );
}

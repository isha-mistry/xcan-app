"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Building2,
    Loader2,
    Save,
} from "lucide-react";

export default function AddCollegePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        slug: "",
        podName: "",
        city: "",
        state: "",
        stateCode: "",
        regionId: "",
        facultyName: "",
        facultyEmail: "",
        maxMembers: 30,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "maxMembers" ? parseInt(value) || 0 : value,
            ...(name === "name" ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") } : {}),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/admin/builder-pods/colleges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });
            if (res.ok) {
                router.push("/admin/builder-pods/colleges");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { name: "name", label: "College Name", placeholder: "e.g. IIT Bombay", required: true },
        { name: "slug", label: "URL Slug", placeholder: "auto-generated", required: true },
        { name: "podName", label: "Pod Name", placeholder: "e.g. Chain Architects", required: false },
        { name: "city", label: "City", placeholder: "e.g. Mumbai", required: true },
        { name: "state", label: "State", placeholder: "e.g. Maharashtra", required: true },
        { name: "stateCode", label: "State Code", placeholder: "e.g. MH", required: false },
        { name: "regionId", label: "Region ID", placeholder: "MongoDB Region ObjectId", required: false },
        { name: "facultyName", label: "Faculty Coordinator", placeholder: "Full name", required: false },
        { name: "facultyEmail", label: "Faculty Email", placeholder: "email@college.edu", required: false },
        { name: "maxMembers", label: "Max Members", placeholder: "30", required: false },
    ];

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods/colleges" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white/80 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Colleges
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <Building2 className="w-5 h-5 text-green-400/70" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    Add College
                </h1>
            </div>

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-container rounded-2xl p-6 max-w-2xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map((field) => (
                        <div key={field.name} className={field.name === "name" ? "md:col-span-2" : ""}>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-white/75 font-robotoMono mb-1.5">
                                {field.label} {field.required && <span className="text-red-400/70">*</span>}
                            </label>
                            <input
                                type={field.name === "maxMembers" ? "number" : field.name === "facultyEmail" ? "email" : "text"}
                                name={field.name}
                                value={(form as any)[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                required={field.required}
                                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono placeholder:text-white/70 focus:outline-none focus:border-white/15 transition-colors"
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
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

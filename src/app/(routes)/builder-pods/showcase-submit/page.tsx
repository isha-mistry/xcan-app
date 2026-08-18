"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trophy,
  Github,
  ExternalLink,
  Code2,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Lock,
  Sparkles,
} from "lucide-react";
import { useIsSuperAdmin } from "@/app/hooks/useRoleCheck";
import { PageShell, BackLink, PageHero } from "@/components/BuilderPods/ui";

interface ShowcaseEvent {
  _id: string;
  name: string;
  status: string;
  regionSnapshot?: { name: string; showcaseCity: string };
}

/** Primary membership from /members/me (raw PodMember + populated college). */
interface PrimaryMembership {
  role?: string;
  status?: string;
  collegeId?: { slug?: string; name?: string } | null;
}

/** Serialized profile membership: { member, college, projectCount }. */
interface SerializedMembership {
  member?: { role?: string | null; status?: string | null } | null;
  college?: { slug?: string | null; name?: string | null } | null;
}

function resolveMembershipRoleStatus(
  primary: PrimaryMembership | null,
  serialized: SerializedMembership[],
  collegeSlug: string
): { role: string | null; status: string | null } {
  if (collegeSlug) {
    const match = serialized.find((m) => m.college?.slug === collegeSlug);
    if (match?.member) {
      return {
        role: match.member.role ?? null,
        status: match.member.status ?? null,
      };
    }
  }

  if (primary && (!collegeSlug || primary.collegeId?.slug === collegeSlug)) {
    return {
      role: primary.role ?? null,
      status: primary.status ?? null,
    };
  }

  // Fall back to any active pod_lead membership
  const lead = serialized.find(
    (m) => m.member?.status === "active" && m.member?.role === "pod_lead"
  );
  if (lead?.member) {
    return {
      role: lead.member.role ?? null,
      status: lead.member.status ?? null,
    };
  }

  return { role: primary?.role ?? null, status: primary?.status ?? null };
}

export default function ShowcaseSubmitPage() {
  const { user, ready, authenticated, login } = usePrivy();
  const walletAddress = user?.wallet?.address ?? null;
  const { isSuperAdmin } = useIsSuperAdmin(Boolean(walletAddress));

  const [showcases, setShowcases] = useState<ShowcaseEvent[]>([]);
  const [colleges, setColleges] = useState<{ slug: string; name: string }[]>(
    []
  );
  const [projects, setProjects] = useState<
    { _id: string; name: string; teamLeader?: string }[]
  >([]);
  const [membership, setMembership] = useState<PrimaryMembership | null>(null);
  const [memberships, setMemberships] = useState<SerializedMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [form, setForm] = useState({
    showcaseEventId: "",
    collegeSlug: "",
    projectId: "",
    demoLink: "",
    githubRepo: "",
    contractAddress: "",
    pitchDeckUrl: "",
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/builder-pods/showcases").then((r) => r.json()),
      fetch("/api/builder-pods/register").then((r) => r.json()),
      fetch("/api/builder-pods/members/me", { credentials: "include" })
        .then((r) => r.json())
        .catch(() => ({ success: false })),
    ])
      .then(([showcaseData, collegeData, profileData]) => {
        if (showcaseData.success) {
          setShowcases(
            (showcaseData.showcases as ShowcaseEvent[]).filter(
              (s) => s.status === "open"
            )
          );
        }
        if (collegeData.success) setColleges(collegeData.colleges);

        if (profileData.success) {
          setMembership(profileData.membership ?? null);
          setMemberships(profileData.memberships ?? []);
          if (profileData.membership?.collegeId?.slug) {
            setForm((f) => ({
              ...f,
              collegeSlug: profileData.membership.collegeId.slug,
            }));
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeRoleStatus = useMemo(
    () =>
      resolveMembershipRoleStatus(membership, memberships, form.collegeSlug),
    [membership, memberships, form.collegeSlug]
  );

  const isPodLeadForCollege =
    activeRoleStatus.status === "active" &&
    activeRoleStatus.role === "pod_lead";

  const canSubmitRole = isSuperAdmin || isPodLeadForCollege;

  // Load projects when college selected — only team-leader projects for non-admins
  useEffect(() => {
    if (!form.collegeSlug || !walletAddress) {
      setProjects([]);
      return;
    }
    fetch(`/api/builder-pods/colleges/${form.collegeSlug}/projects`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const wallet = walletAddress.toLowerCase();
          const eligible = (data.projects as any[]).filter((p) => {
            const isLeader = p.teamLeader?.toLowerCase() === wallet;
            if (isSuperAdmin) {
              return (
                isLeader ||
                p.teamMembers?.some(
                  (m: any) => m.walletAddress?.toLowerCase() === wallet
                )
              );
            }
            // Pod leads may only submit projects they lead
            return isLeader;
          });
          setProjects(eligible);
          if (eligible.length === 1) {
            setForm((f) => ({ ...f, projectId: eligible[0]._id }));
          } else {
            setForm((f) =>
              eligible.some((p) => p._id === f.projectId)
                ? f
                : { ...f, projectId: "" }
            );
          }
        }
      })
      .catch(console.error);
  }, [form.collegeSlug, walletAddress, isSuperAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return;
    if (!canSubmitRole) {
      setResult({
        success: false,
        message:
          "Only an active pod lead can submit to a showcase for this college",
      });
      return;
    }
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/builder-pods/showcases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setResult({
          success: true,
          message:
            "Showcase submission received! It is now visible on the public gallery (Pending Review).",
        });
        setForm({
          showcaseEventId: "",
          collegeSlug: form.collegeSlug,
          projectId: "",
          demoLink: "",
          githubRepo: "",
          contractAddress: "",
          pitchDeckUrl: "",
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Submission failed",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/45 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all";
  const labelClass =
    "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 font-robotoMono mb-2";

  return (
    <PageShell>
      <BackLink href="/builder-pods/showcase">Public Showcase Gallery</BackLink>

      <PageHero
        accent="amber"
        badge="Pod lead only"
        BadgeIcon={Sparkles}
        title="Showcase Submission"
        description="Submit your project for a Regional Showcase event. Accepted entries appear immediately on the public gallery."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-container mx-auto max-w-2xl rounded-2xl border border-white/[0.06] p-6 md:p-8"
      >
        <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-[10px] leading-relaxed text-amber-200/70 font-robotoMono sm:text-xs">
            <strong className="text-amber-400">Who can submit:</strong> You must
            be an <span className="text-white">active Pod Lead</span> for the
            college <span className="text-white">and</span> the{" "}
            <span className="text-white">project team lead</span>. Regular team
            members cannot submit.
          </p>
        </div>

        {!ready ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-white/50" />
          </div>
        ) : !walletAddress || !authenticated ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-10 text-center">
            <Lock className="mx-auto mb-3 h-6 w-6 text-white/35" />
            <p className="mb-4 text-sm text-white/70 font-robotoMono">
              Connect your wallet to submit a showcase entry.
            </p>
            <button
              type="button"
              onClick={() => login()}
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-black transition-all hover:shadow-lg hover:shadow-white/10 font-robotoMono"
            >
              Connect wallet
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-white/50" />
          </div>
        ) : !canSubmitRole ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <ShieldAlert className="mx-auto mb-3 h-7 w-7 text-red-400/80" />
            <h3 className="mb-2 text-sm font-bold text-white font-robotoMono">
              Submission restricted
            </h3>
            <p className="mx-auto mb-4 max-w-md text-[11px] leading-relaxed text-white/55 font-robotoMono">
              Only an active{" "}
              <span className="text-white">Pod Lead</span> can submit projects
              to regional showcases
              {activeRoleStatus.role
                ? `. Your current role is “${String(activeRoleStatus.role).replace("_", " ")}”.`
                : ", and you do not have an active pod-lead membership for this college."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/builder-pods/showcase"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-bold text-white/70 transition-all hover:bg-white/[0.08] font-robotoMono"
              >
                Browse public gallery
              </Link>
              {form.collegeSlug && (
                <Link
                  href={`/builder-pods/${form.collegeSlug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[10px] font-bold text-blue-300 transition-all hover:bg-blue-500/20 font-robotoMono"
                >
                  Go to your pod
                </Link>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>
                <Trophy className="h-3 w-3" />
                Showcase Event *
              </label>
              <select
                required
                value={form.showcaseEventId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, showcaseEventId: e.target.value }))
                }
                className={inputClass}
              >
                <option value="" className="bg-[#0a0d12]">
                  {showcases.length
                    ? "Select open showcase"
                    : "No open showcases"}
                </option>
                {showcases.map((s) => (
                  <option key={s._id} value={s._id} className="bg-[#0a0d12]">
                    {s.name}
                    {s.regionSnapshot?.showcaseCity
                      ? ` — ${s.regionSnapshot.showcaseCity}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>College *</label>
              <select
                required
                value={form.collegeSlug}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    collegeSlug: e.target.value,
                    projectId: "",
                  }))
                }
                className={inputClass}
              >
                <option value="" className="bg-[#0a0d12]">
                  Select college
                </option>
                {colleges.map((c) => (
                  <option key={c.slug} value={c.slug} className="bg-[#0a0d12]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                <FileText className="h-3 w-3" />
                Project *{" "}
                <span className="font-normal normal-case tracking-normal text-white/40">
                  (only projects you lead)
                </span>
              </label>
              <select
                required
                value={form.projectId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, projectId: e.target.value }))
                }
                className={inputClass}
              >
                <option value="" className="bg-[#0a0d12]">
                  {!form.collegeSlug
                    ? "Select college first"
                    : projects.length === 0
                      ? "No projects you lead in this pod"
                      : "Select project"}
                </option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id} className="bg-[#0a0d12]">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                <Github className="h-3 w-3" />
                GitHub Repo *
              </label>
              <input
                type="url"
                required
                value={form.githubRepo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, githubRepo: e.target.value }))
                }
                placeholder="https://github.com/..."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                <ExternalLink className="h-3 w-3" />
                Demo Link
              </label>
              <input
                type="url"
                value={form.demoLink}
                onChange={(e) =>
                  setForm((f) => ({ ...f, demoLink: e.target.value }))
                }
                placeholder="https://..."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                <Code2 className="h-3 w-3" />
                Contract Address
              </label>
              <input
                type="text"
                value={form.contractAddress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contractAddress: e.target.value }))
                }
                placeholder="0x..."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                <FileText className="h-3 w-3" />
                Pitch Deck URL
              </label>
              <input
                type="url"
                value={form.pitchDeckUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pitchDeckUrl: e.target.value }))
                }
                placeholder="Cloudinary or Google Slides link"
                className={inputClass}
              />
            </div>

            {result && (
              <div
                className={`flex items-start gap-2 rounded-xl border p-4 text-sm font-robotoMono ${
                  result.success
                    ? "border-green-500/20 bg-green-500/5 text-green-400"
                    : "border-red-500/20 bg-red-500/5 text-red-400"
                }`}
              >
                {result.success ? (
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <div>
                  <p>{result.message}</p>
                  {result.success && (
                    <Link
                      href="/builder-pods/showcase"
                      className="mt-2 inline-flex text-[11px] font-bold text-green-300 underline-offset-2 hover:underline"
                    >
                      Open public gallery →
                    </Link>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                !form.showcaseEventId ||
                !form.collegeSlug ||
                !form.projectId ||
                !form.githubRepo
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-black transition-all hover:shadow-lg hover:shadow-white/10 disabled:cursor-not-allowed disabled:opacity-30 font-robotoMono"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit to Showcase"
              )}
            </button>
          </form>
        )}
      </motion.div>
    </PageShell>
  );
}

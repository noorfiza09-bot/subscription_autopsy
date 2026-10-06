"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Nav } from "@/components/Nav";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();

    setPasswordLoading(false);

    if (!res.ok) {
      setPasswordError(data.error ?? "Something went wrong.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setPasswordSuccess(true);
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteLoading(true);
    setDeleteError(null);

    const res = await fetch("/api/user/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      setDeleteLoading(false);
      setDeleteError(data.error ?? "Something went wrong.");
      return;
    }

    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen px-6 py-10 max-w-lg mx-auto">
        <p className="text-sm font-medium text-brand mb-2">
          account settings
        </p>
        <h1 className="font-display text-3xl font-bold mb-10">Account settings</h1>

        {/* Change password */}
        <section className="mb-12">
          <h2 className="font-display text-lg font-medium mb-4">Change password</h2>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Current password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-soft border border-black/10 rounded-lg px-4 py-3 text-main placeholder:text-slate focus:outline-none focus:border-brand"
            />
            <input
              type="password"
              placeholder="New password (min 8 characters)"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-soft border border-black/10 rounded-lg px-4 py-3 text-main placeholder:text-slate focus:outline-none focus:border-brand"
            />

            {passwordError && <p className="text-sm text-coral">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-sage">Password updated.</p>}

            <button
              type="submit"
              disabled={passwordLoading}
              className="mt-1 self-start rounded-lg bg-brand px-5 py-2.5 font-display font-medium text-white disabled:opacity-40 hover:bg-brand-dark transition-colors"
            >
              {passwordLoading ? "Updating…" : "Update password"}
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className="border border-coral/30 rounded-lg p-5">
          <h2 className="font-display text-lg font-medium text-coral mb-2">Danger zone</h2>
          <p className="text-slate text-sm mb-4">
            Deleting your account permanently removes your statements, transactions, and
            detected subscriptions. This can't be undone.
          </p>

          {!showDeleteForm ? (
            <button
              onClick={() => setShowDeleteForm(true)}
              className="text-xs font-body px-4 py-2 border border-coral/40 text-coral rounded-lg hover:bg-coral/10 transition-colors"
            >
              Delete my account
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="flex flex-col gap-3">
              <label className="text-xs text-slate">
                Type <span className="font-body text-main">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="bg-soft border border-coral/30 rounded-lg px-4 py-2.5 text-main focus:outline-none focus:border-coral/60"
              />
              <input
                type="password"
                placeholder="Confirm your password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="bg-soft border border-coral/30 rounded-lg px-4 py-2.5 text-main placeholder:text-slate focus:outline-none focus:border-coral/60"
              />

              {deleteError && <p className="text-sm text-coral">{deleteError}</p>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={deleteConfirmText !== "DELETE" || deleteLoading}
                  className="text-xs font-body px-4 py-2 bg-coral text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-coral/90 transition-colors"
                >
                  {deleteLoading ? "Deleting…" : "Permanently delete account"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteForm(false)}
                  className="text-xs font-body px-4 py-2 border border-black/10 rounded-lg hover:bg-soft transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </>
  );
}

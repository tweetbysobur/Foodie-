"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Banknote, Bell, Camera, ChevronRight, Heart, History, Image as ImageIcon, LogOut, MapPin, UserRound } from "lucide-react";
import { PAYMENT_METHODS } from "@/lib/payments";
import { useCatalog } from "@/store/catalog";
import { useStore } from "@/store/app-store";
import { useToast } from "@/store/toast";
import { AddressSheet, formatAddress } from "@/components/shell";
import { Button, Field, PageHeader, Sheet, cx, inputClass } from "@/components/ui";

/** Shrinks a chosen photo to 256px so it fits in local storage. */
function toAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const size = 256;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const s = Math.min(img.width, img.height);
      c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("That file is not an image we can read."));
    img.src = URL.createObjectURL(file);
  });
}

export default function ProfilePage() {
  const { state, dispatch, address } = useStore();
  const toast = useToast();
  const file = useRef<HTMLInputElement>(null);
  const catalog = useCatalog();
  const menu = catalog.state.status === "ready" ? catalog.state.data.menu : [];
  const [sheet, setSheet] = useState<null | "edit" | "address" | "payment" | "credits" | "logout">(null);
  const p = state.profile!;
  const row = "flex min-h-[60px] w-full items-center gap-3.5 px-1 text-left text-[16px] text-ink";

  return (
    <main className="pb-nav flex flex-col gap-5 px-5 pt-[calc(env(safe-area-inset-top)+20px)] md:mx-auto md:w-full md:max-w-2xl md:px-0 md:pt-8">
      <PageHeader title="Profile" back={false} />

      <section className="flex items-center gap-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft">
        <button onClick={() => file.current?.click()} aria-label="Change profile photo" className="relative grid size-[72px] shrink-0 place-items-center overflow-hidden rounded-full bg-green text-[28px] font-bold text-white">
          {p.photo ? <Image src={p.photo} alt="" fill sizes="72px" className="object-cover" unoptimized /> : p.name[0]?.toUpperCase()}
          <span className="absolute bottom-0 right-0 grid size-6 place-items-center rounded-full bg-orange-strong text-white ring-2 ring-surface">
            <Camera className="size-3.5" />
          </span>
        </button>
        <input
          ref={file}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              dispatch({ type: "updateProfile", patch: { photo: await toAvatar(f) } });
              toast("Profile photo updated");
            } catch (err) {
              toast((err as Error).message, "error");
            }
            e.target.value = "";
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[20px] font-bold text-ink">{p.name}</p>
          <p className="truncate text-[14px] text-muted-ink">{p.phone || "No phone number yet"}</p>
        </div>
        <Button variant="secondary" onClick={() => setSheet("edit")}>Edit</Button>
      </section>

      <nav aria-label="Account" className="flex flex-col divide-y divide-line rounded-[var(--radius-card)] bg-surface px-4 shadow-soft">
        <button className={row} onClick={() => setSheet("address")}>
          <MapPin className="size-5 text-green" />
          <span className="min-w-0 flex-1">
            Saved addresses
            <span className="block truncate text-[13px] text-muted-ink">{address ? formatAddress(address) : "None yet"}</span>
          </span>
          <span className="tabular text-[14px] text-muted-ink">{state.addresses.length}</span>
          <ChevronRight className="size-5 text-muted" />
        </button>
        <Link className={row} href="/orders">
          <History className="size-5 text-green" />
          <span className="flex-1">Order history</span>
          <span className="tabular text-[14px] text-muted-ink">{state.orders.length}</span>
          <ChevronRight className="size-5 text-muted" />
        </Link>
        <Link className={row} href="/favourites">
          <Heart className="size-5 text-green" />
          <span className="flex-1">Favourite meals</span>
          <span className="tabular text-[14px] text-muted-ink">{state.favourites.length}</span>
          <ChevronRight className="size-5 text-muted" />
        </Link>
        <button className={row} onClick={() => setSheet("payment")}>
          <Banknote className="size-5 text-green" />
          <span className="flex-1">Payment preference</span>
          <span className="text-[14px] text-muted-ink">{PAYMENT_METHODS.find((m) => m.id === p.preferredPayment)?.label}</span>
          <ChevronRight className="size-5 text-muted" />
        </button>
        <div className={cx(row, "text-muted-ink")} aria-disabled="true">
          <Bell className="size-5" />
          <span className="flex-1">Notifications</span>
          <span className="rounded-full bg-cream px-2.5 py-1 text-[12px] font-semibold">Soon</span>
        </div>
        <button className={row} onClick={() => setSheet("edit")}>
          <UserRound className="size-5 text-green" />
          <span className="flex-1">Account settings</span>
          <ChevronRight className="size-5 text-muted" />
        </button>
        <button className={row} onClick={() => setSheet("credits")}>
          <ImageIcon className="size-5 text-green" />
          <span className="flex-1">Photo credits</span>
          <ChevronRight className="size-5 text-muted" />
        </button>
      </nav>

      <Button variant="danger" size="lg" onClick={() => setSheet("logout")}>
        <LogOut className="size-5" /> Log out
      </Button>

      {sheet === "address" && <AddressSheet onClose={() => setSheet(null)} />}
      {sheet === "edit" && <EditProfile onClose={() => setSheet(null)} />}
      {sheet === "payment" && (
        <Sheet title="Payment preference" onClose={() => setSheet(null)}>
          <div className="flex flex-col gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                disabled={!m.available}
                onClick={() => {
                  dispatch({ type: "updateProfile", patch: { preferredPayment: m.id } });
                  setSheet(null);
                }}
                className={cx("flex min-h-16 items-center justify-between gap-3 rounded-[var(--radius-tile)] px-4 text-left", p.preferredPayment === m.id ? "bg-sage" : "bg-cream", !m.available && "opacity-60")}
              >
                <span>
                  <span className="block font-semibold text-ink">{m.label}</span>
                  <span className="block text-[13px] text-muted-ink">{m.detail}</span>
                </span>
                {!m.available && <span className="rounded-full bg-surface px-2.5 py-1 text-[12px] font-semibold text-muted-ink">Soon</span>}
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {sheet === "credits" && (
        <Sheet title="Photo credits" onClose={() => setSheet(null)}>
          <p className="mb-4 text-[14px] text-muted-ink">Dish photos come from Wikimedia Commons under open licences.</p>
          <ul className="flex flex-col gap-3">
            {menu.map((m) => (
              <li key={m.id} className="text-[14px]">
                <span className="block font-semibold text-ink">{m.name}</span>
                <a href={m.photo.credit.url} target="_blank" rel="noreferrer" className="text-muted-ink underline underline-offset-2">
                  {m.photo.credit.author}, {m.photo.credit.licence}
                </a>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
      {sheet === "logout" && (
        <Sheet title="Log out?" onClose={() => setSheet(null)}>
          <p className="text-[15px] leading-relaxed text-muted-ink">This removes your profile, addresses, cart, favourites and order history from this device.</p>
          <div className="mt-5 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setSheet(null)}>Stay</Button>
            <Button className="flex-1" onClick={() => dispatch({ type: "logOut" })}>Log out</Button>
          </div>
        </Sheet>
      )}
    </main>
  );
}

function EditProfile({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [name, setName] = useState(state.profile!.name);
  const [phone, setPhone] = useState(state.profile!.phone);
  return (
    <Sheet title="Account settings" onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          dispatch({ type: "updateProfile", patch: { name: name.trim(), phone: phone.trim() } });
          toast("Profile saved");
          onClose();
        }}
      >
        <Field label="First name">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" required />
        </Field>
        <Field label="Phone number">
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" />
        </Field>
        {state.profile!.photo && (
          <Button variant="secondary" onClick={() => dispatch({ type: "updateProfile", patch: { photo: null } })}>
            Remove profile photo
          </Button>
        )}
        <Button type="submit" size="lg" disabled={!name.trim()}>Save</Button>
      </form>
    </Sheet>
  );
}

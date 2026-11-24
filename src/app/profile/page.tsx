"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { PAYMENT_METHODS } from "@/lib/payments";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { AddressSheet, formatAddress, validPhone } from "@/components/shell";
import { BoardHeading, Button, Field, PageHeader, Sheet, TextInput, cx } from "@/components/ui";

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

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title}>
      <BoardHeading>{title}</BoardHeading>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

const rowBase = "flex min-h-[56px] w-full items-center gap-3 border-b border-line text-left transition-colors";

function Row({ label, value, onClick, href, soon }: { label: string; value?: string; onClick?: () => void; href?: string; soon?: boolean }) {
  const inner = (
    <>
      <span className={cx("min-w-0 flex-1 text-[16px]", soon ? "text-muted-ink" : "text-ink")}>{label}</span>
      {value && <span className="t-support max-w-[50%] truncate text-muted-ink">{value}</span>}
      {soon ? <span className="t-support font-semibold text-muted-ink">Soon</span> : <ChevronRight className="size-5 shrink-0 text-muted-ink" aria-hidden />}
    </>
  );
  if (soon)
    return (
      <div className={rowBase} aria-disabled="true">
        {inner}
      </div>
    );
  if (href)
    return (
      <Link href={href} className={cx(rowBase, "hover:text-green")}>
        {inner}
      </Link>
    );
  return (
    <button onClick={onClick} className={cx(rowBase, "hover:text-green")}>
      {inner}
    </button>
  );
}

export default function ProfilePage() {
  const { state, dispatch } = useStore();
  const catalog = useCatalog();
  const toast = useToast();
  const file = useRef<HTMLInputElement>(null);
  const [sheet, setSheet] = useState<null | "edit" | "address" | "payment" | "credits" | "logout">(null);
  const p = state.profile!;
  const photographed = catalog.state.status === "ready" ? catalog.state.data.menu.filter((m) => m.photo) : [];

  return (
    <main className="pb-nav px-5 pt-[calc(env(safe-area-inset-top)+16px)] md:mx-auto md:w-full md:max-w-2xl md:px-0 md:pt-10">
      <PageHeader title={p.name} back={false} subtitle={p.phone || "No phone number yet"} />

      <div className="mt-5 flex items-center gap-4">
        <div aria-hidden className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-[6px] bg-green font-[family-name:var(--font-display)] text-[28px] font-extrabold text-cream">
          {p.photo ? <Image src={p.photo} alt="" fill sizes="64px" className="object-cover" unoptimized /> : p.name[0]?.toUpperCase()}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="h-10 min-h-0" onClick={() => setSheet("edit")}>
            Edit details
          </Button>
          <Button variant="ghost" className="h-10 min-h-0" onClick={() => file.current?.click()}>
            {p.photo ? "Change photo" : "Add a photo"}
          </Button>
        </div>
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
      </div>

      <div className="mt-10 flex flex-col gap-10">
        <Group title="Your details">
          <Row label="Name" value={p.name} onClick={() => setSheet("edit")} />
          <Row label="Phone number" value={p.phone || "Add"} onClick={() => setSheet("edit")} />
          <Row label="Email" value={p.email || "Add"} onClick={() => setSheet("edit")} />
        </Group>

        <Group title="Addresses">
          {state.addresses.map((a) => (
            <Row key={a.id} label={a.id === state.selectedAddressId ? `${a.label} (default)` : a.label} value={formatAddress(a)} onClick={() => setSheet("address")} />
          ))}
          <button onClick={() => setSheet("address")} className={cx(rowBase, "t-button text-green")}>
            Add or edit addresses
          </button>
        </Group>

        <Group title="Activity">
          <Row label="Order history" value={`${state.orders.length}`} href="/orders" />
          <Row label="Saved dishes" value={`${state.favourites.length}`} href="/favourites" />
        </Group>

        <Group title="Preferences">
          <Row label="Payment method" value={PAYMENT_METHODS.find((m) => m.id === p.preferredPayment)?.label} onClick={() => setSheet("payment")} />
          <Row label="Notifications" soon />
        </Group>

        <Group title="More">
          <Row label="Help and support" soon />
          <Row label="Terms and conditions" soon />
          <Row label="Privacy policy" soon />
          <Row label="Photo credits" onClick={() => setSheet("credits")} />
        </Group>

        <Button variant="danger" size="lg" onClick={() => setSheet("logout")}>
          Log out
        </Button>
      </div>

      {sheet === "address" && <AddressSheet onClose={() => setSheet(null)} />}
      {sheet === "edit" && <EditProfile onClose={() => setSheet(null)} />}
      {sheet === "payment" && (
        <Sheet title="Payment method" onClose={() => setSheet(null)}>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              disabled={!m.available}
              onClick={() => {
                dispatch({ type: "updateProfile", patch: { preferredPayment: m.id } });
                setSheet(null);
                toast("Payment preference saved");
              }}
              className={cx("flex min-h-16 w-full items-center justify-between gap-3 border-b border-dashed border-leader text-left", !m.available && "cursor-not-allowed")}
            >
              <span>
                <span className={cx("t-card block", m.available ? "text-ink" : "text-muted-ink")}>
                  {m.label}
                  {p.preferredPayment === m.id && <span className="t-support ml-2 font-semibold text-green">Selected</span>}
                </span>
                <span className="t-support block text-muted-ink">{m.detail}</span>
              </span>
              {!m.available && <span className="t-support font-semibold text-muted-ink">Soon</span>}
            </button>
          ))}
        </Sheet>
      )}
      {sheet === "credits" && (
        <Sheet title="Photo credits" onClose={() => setSheet(null)}>
          <p className="t-body mb-3 text-muted-ink">Dish photos come from Wikimedia Commons under open licences.</p>
          <ul>
            {photographed.map((m) => (
              <li key={m.id} className="border-b border-line py-2.5">
                <span className="t-card block text-[15px] text-ink">{m.name}</span>
                <a href={m.photo!.credit.url} target="_blank" rel="noreferrer" className="t-support text-muted-ink underline underline-offset-2 hover:text-green">
                  {m.photo!.credit.author}, {m.photo!.credit.licence}
                </a>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
      {sheet === "logout" && (
        <Sheet
          title="Log out?"
          onClose={() => setSheet(null)}
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setSheet(null)}>
                Stay
              </Button>
              <Button className="flex-1" onClick={() => dispatch({ type: "logOut" })}>
                Log out
              </Button>
            </div>
          }
        >
          <p className="t-body text-[15px] text-muted-ink">This removes your profile, addresses, cart, saved dishes and order history from this device.</p>
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
  const [email, setEmail] = useState(state.profile!.email ?? "");
  const [tried, setTried] = useState(false);
  const errors = {
    name: !name.trim() ? "Enter your first name." : "",
    phone: phone.trim() && !validPhone(phone) ? "Enter a Nigerian number, for example 0803 123 4567." : "",
    email: email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? "Enter a valid email address." : "",
  };
  return (
    <Sheet
      title="Your details"
      onClose={onClose}
      footer={
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            setTried(true);
            if (Object.values(errors).some(Boolean)) return;
            dispatch({ type: "updateProfile", patch: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined } });
            toast("Details saved");
            onClose();
          }}
        >
          Save
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="First name" id="p-name" error={tried ? errors.name : ""}>
          <TextInput id="p-name" error={tried ? errors.name : ""} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
        </Field>
        <Field label="Phone number" id="p-phone" error={tried ? errors.phone : ""}>
          <TextInput id="p-phone" error={tried ? errors.phone : ""} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" />
        </Field>
        <Field label="Email" id="p-email" hint="Optional. For receipts once they are available." error={tried ? errors.email : ""}>
          <TextInput id="p-email" error={tried ? errors.email : ""} value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" />
        </Field>
        {state.profile!.photo && (
          <Button variant="secondary" onClick={() => dispatch({ type: "updateProfile", patch: { photo: null } })}>
            Remove profile photo
          </Button>
        )}
      </div>
    </Sheet>
  );
}

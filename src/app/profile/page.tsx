"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { Banknote, Bell, Camera, ChevronRight, FileText, Heart, History, Image as ImageIcon, LifeBuoy, LogOut, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { PAYMENT_METHODS } from "@/lib/payments";
import { useStore } from "@/store/app-store";
import { useCatalog } from "@/store/catalog";
import { useToast } from "@/store/toast";
import { AddressSheet, formatAddress, validPhone } from "@/components/shell";
import { Button, Field, PageHeader, Sheet, TextInput, cx } from "@/components/ui";

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

const rowBase = "flex min-h-[58px] w-full items-center gap-3.5 px-4 text-left transition-colors";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <h2 className="t-card px-1 text-muted-ink">{title}</h2>
      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-soft">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, label, value, onClick, href, soon }: { icon: typeof Mail; label: string; value?: string; onClick?: () => void; href?: string; soon?: boolean }) {
  const inner = (
    <>
      <Icon className={cx("size-5 shrink-0", soon ? "text-muted" : "text-green")} aria-hidden />
      <span className={cx("t-body min-w-0 flex-1 text-[15px]", soon ? "text-muted-ink" : "text-ink")}>{label}</span>
      {value && <span className="t-support max-w-[45%] truncate text-muted-ink">{value}</span>}
      {soon ? <span className="t-support font-medium text-muted-ink">Soon</span> : <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />}
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
      <Link href={href} className={cx(rowBase, "hover:bg-cream")}>
        {inner}
      </Link>
    );
  return (
    <button onClick={onClick} className={cx(rowBase, "hover:bg-cream")}>
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
  const menu = catalog.state.status === "ready" ? catalog.state.data.menu : [];

  return (
    <main className="pb-nav flex flex-col gap-7 px-5 pt-[calc(env(safe-area-inset-top)+20px)] md:mx-auto md:w-full md:max-w-2xl md:px-0 md:pt-10">
      <PageHeader title="Profile" back={false} />

      <section className="flex items-center gap-4">
        <div aria-hidden className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-green text-[30px] font-extrabold text-white ring-4 ring-surface shadow-soft">
          {p.photo ? <Image src={p.photo} alt="" fill sizes="80px" className="object-cover" unoptimized /> : p.name[0]?.toUpperCase()}
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
        <div className="min-w-0 flex-1">
          <p className="t-section truncate text-ink">{p.name}</p>
          <p className="t-support truncate text-muted-ink">{p.phone || "No phone number yet"}</p>
          <button onClick={() => file.current?.click()} className="t-support mt-0.5 inline-flex items-center gap-1 font-medium text-green">
            <Camera className="size-3.5" aria-hidden /> {p.photo ? "Change photo" : "Add a photo"}
          </button>
        </div>
        <Button variant="secondary" className="h-10 min-h-0 px-4" onClick={() => setSheet("edit")}>
          Edit
        </Button>
      </section>

      <Group title="Personal information">
        <Row icon={UserRound} label="Name" value={p.name} onClick={() => setSheet("edit")} />
        <Row icon={Phone} label="Phone number" value={p.phone || "Add"} onClick={() => setSheet("edit")} />
        <Row icon={Mail} label="Email" value={p.email || "Add"} onClick={() => setSheet("edit")} />
      </Group>

      <Group title="Saved addresses">
        {state.addresses.map((a) => (
          <button key={a.id} onClick={() => setSheet("address")} className={cx(rowBase, "hover:bg-cream")}>
            <MapPin className="size-5 shrink-0 text-green" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="t-body block text-[15px] text-ink">
                {a.label}
                {a.id === state.selectedAddressId && <span className="t-support ml-2 text-green">Default</span>}
              </span>
              <span className="t-support block truncate text-muted-ink">{formatAddress(a)}</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
          </button>
        ))}
        <button onClick={() => setSheet("address")} className={cx(rowBase, "t-button text-green hover:bg-cream")}>
          + Add or edit addresses
        </button>
      </Group>

      <Group title="Activity">
        <Row icon={History} label="Order history" value={`${state.orders.length}`} href="/orders" />
        <Row icon={Heart} label="Favourite meals" value={`${state.favourites.length}`} href="/favourites" />
      </Group>

      <Group title="Preferences">
        <Row icon={Banknote} label="Payment method" value={PAYMENT_METHODS.find((m) => m.id === p.preferredPayment)?.label} onClick={() => setSheet("payment")} />
        <Row icon={Bell} label="Notifications" soon />
      </Group>

      <Group title="More">
        <Row icon={LifeBuoy} label="Help and support" soon />
        <Row icon={FileText} label="Terms and conditions" soon />
        <Row icon={ShieldCheck} label="Privacy policy" soon />
        <Row icon={ImageIcon} label="Photo credits" onClick={() => setSheet("credits")} />
      </Group>

      <Button variant="danger" size="lg" onClick={() => setSheet("logout")}>
        <LogOut className="size-5" /> Log out
      </Button>

      {sheet === "address" && <AddressSheet onClose={() => setSheet(null)} />}
      {sheet === "edit" && <EditProfile onClose={() => setSheet(null)} />}
      {sheet === "payment" && (
        <Sheet title="Payment method" onClose={() => setSheet(null)}>
          <div className="flex flex-col gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                disabled={!m.available}
                onClick={() => {
                  dispatch({ type: "updateProfile", patch: { preferredPayment: m.id } });
                  setSheet(null);
                  toast("Payment preference saved");
                }}
                className={cx(
                  "flex min-h-16 items-center justify-between gap-3 rounded-[var(--radius-tile)] px-4 text-left",
                  p.preferredPayment === m.id ? "bg-sage shadow-[inset_0_0_0_2px_var(--color-green)]" : "bg-cream",
                  !m.available && "cursor-not-allowed",
                )}
              >
                <span>
                  <span className={cx("t-card block", m.available ? "text-ink" : "text-muted-ink")}>{m.label}</span>
                  <span className="t-support block text-muted-ink">{m.detail}</span>
                </span>
                {!m.available && <span className="t-support font-medium text-muted-ink">Soon</span>}
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {sheet === "credits" && (
        <Sheet title="Photo credits" onClose={() => setSheet(null)}>
          <p className="t-body mb-4 text-muted-ink">Dish photos come from Wikimedia Commons under open licences.</p>
          <ul className="flex flex-col gap-3">
            {menu.map((m) => (
              <li key={m.id}>
                <span className="t-card block text-[15px] text-ink">{m.name}</span>
                <a href={m.photo.credit.url} target="_blank" rel="noreferrer" className="t-support text-muted-ink underline underline-offset-2 hover:text-green">
                  {m.photo.credit.author}, {m.photo.credit.licence}
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
          <p className="t-body text-[15px] text-muted-ink">This removes your profile, addresses, cart, favourites and order history from this device.</p>
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
      title="Personal information"
      onClose={onClose}
      footer={
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            setTried(true);
            if (Object.values(errors).some(Boolean)) return;
            dispatch({ type: "updateProfile", patch: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined } });
            toast("Profile saved");
            onClose();
          }}
        >
          Save changes
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

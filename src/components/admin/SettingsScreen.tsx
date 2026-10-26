"use client";

import { useActionState, useRef, useState } from "react";
import { saveAppearance } from "@/actions/settings";
import { FormMessage } from "@/components/forms/FormMessage";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { BrandLogo } from "@/components/worldcompassholiday/BrandLogo";
import { isHexColor, normalizeHex, type SiteSettings } from "@/lib/brand";
import { initialFormState } from "@/lib/forms";
import type { UploadedImage } from "@/lib/storage/types";
import "./settings-desk.css";

const presets = [
  { label: "Compass blue", value: "#3554d1" },
  { label: "Ocean", value: "#0e8f7a" },
  { label: "Forest", value: "#15803d" },
  { label: "Ink", value: "#0b1520" },
  { label: "Sunset", value: "#c2410c" },
  { label: "Wine", value: "#9f1239" },
];

export function SettingsScreen({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(saveAppearance, initialFormState);
  const [logo, setLogo] = useState<UploadedImage | null>(
    settings.logoUrl && settings.logoKey
      ? {
          url: settings.logoUrl,
          key: settings.logoKey,
          driver: settings.logoDriver === "cloudinary" ? "cloudinary" : "local",
        }
      : null,
  );
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [facebookUrl, setFacebookUrl] = useState(settings.social.facebook);
  const [instagramUrl, setInstagramUrl] = useState(settings.social.instagram);
  const [twitterUrl, setTwitterUrl] = useState(settings.social.twitter);
  const [linkedinUrl, setLinkedinUrl] = useState(settings.social.linkedin);
  const [youtubeUrl, setYoutubeUrl] = useState(settings.social.youtube);

  const liveColor = isHexColor(primaryColor) ? normalizeHex(primaryColor) : settings.primaryColor;
  const liveLogo = logo?.url || settings.logoUrl || null;
  const logoBox = useRef<HTMLDivElement>(null);

  function openLogoPicker() {
    const trigger = logoBox.current?.querySelector<HTMLElement>('[role="button"]');
    trigger?.click();
  }

  return (
    <form action={action} className="settings-desk">
      <div className="sd-top">
        <p>These values are live on the public site: header, footer, contact page, and WhatsApp.</p>
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      <FormMessage state={state} />

      <div className="sd-stack">
        <section className="sd-card">
          <div className="sd-row">
            <div>
              <p className="sd-kicker">Logo</p>
              <p className="sd-help">Hover the mark to replace or remove it.</p>
            </div>
            <div className="sd-logo-upload" ref={logoBox}>
              <div className="sd-logo-stage worldcompassholiday-page">
                {liveLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={liveLogo} alt="" className="sd-logo-img" />
                ) : (
                  <BrandLogo tone="light" />
                )}
                <div className="sd-logo-actions">
                  <button type="button" onClick={openLogoPicker}>
                    Replace
                  </button>
                  {logo?.url ? (
                    <button type="button" className="is-remove" onClick={() => setLogo(null)}>
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
              <ImageUploader
                folder="brand"
                scope="logo"
                label=""
                className="sd-logo-input"
                value={logo}
                onChange={setLogo}
              />
            </div>
          </div>
          <div className="sd-row">
            <div>
              <p className="sd-kicker">Primary colour</p>
              <p className="sd-help">Buttons, links, and accents.</p>
            </div>
            <div className="sd-color">
              <input
                type="color"
                value={liveColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                aria-label="Pick primary colour"
              />
              <input
                className="sd-hex"
                name="primaryColor"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                spellCheck={false}
                autoCapitalize="off"
              />
              <div className="sd-swatches">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className={`sd-swatch${liveColor === preset.value ? " is-on" : ""}`}
                    style={{ background: preset.value }}
                    aria-label={preset.label}
                    onClick={() => setPrimaryColor(preset.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="sd-card">
          <div className="sd-row">
            <div>
              <p className="sd-kicker">Contact</p>
              <p className="sd-help">Footer, emails, and the floating WhatsApp button.</p>
            </div>
            <div className="sd-fields">
              <label className="sd-label">
                Email
                <input
                  className="sd-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="sd-label">
                Phone
                <input
                  className="sd-input"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                />
              </label>
              <label className="sd-label">
                WhatsApp
                <input
                  className="sd-input"
                  name="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  required
                />
              </label>
              <label className="sd-label">
                Location
                <input
                  className="sd-input"
                  name="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  maxLength={160}
                />
              </label>
            </div>
          </div>
          <div className="sd-row">
            <div>
              <p className="sd-kicker">Social</p>
              <p className="sd-help">Leave a field empty to hide it.</p>
            </div>
            <div className="sd-fields">
              <label className="sd-label">
                Facebook
                <input
                  className="sd-input"
                  name="facebookUrl"
                  type="url"
                  value={facebookUrl}
                  onChange={(event) => setFacebookUrl(event.target.value)}
                />
              </label>
              <label className="sd-label">
                Instagram
                <input
                  className="sd-input"
                  name="instagramUrl"
                  type="url"
                  value={instagramUrl}
                  onChange={(event) => setInstagramUrl(event.target.value)}
                />
              </label>
              <label className="sd-label">
                X
                <input
                  className="sd-input"
                  name="twitterUrl"
                  type="url"
                  value={twitterUrl}
                  onChange={(event) => setTwitterUrl(event.target.value)}
                />
              </label>
              <label className="sd-label">
                LinkedIn
                <input
                  className="sd-input"
                  name="linkedinUrl"
                  type="url"
                  value={linkedinUrl}
                  onChange={(event) => setLinkedinUrl(event.target.value)}
                />
              </label>
              <label className="sd-label span-2">
                YouTube
                <input
                  className="sd-input"
                  name="youtubeUrl"
                  type="url"
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                />
              </label>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}

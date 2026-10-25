import type { Metadata } from "next";
import Link from "next/link";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { noIndexRobots } from "@/lib/seo";
import "@/styles/visa-apply-demo.css";

export const metadata: Metadata = {
  title: "Visa form demo",
  robots: noIndexRobots,
};

export default function VisaApplyDemoPage() {
  return (
    <WorldCompassHolidayFrame>
      <section className="visa-demo">
        <p className="visa-demo-kicker">Demo only</p>
        <h1>One row, then the quote</h1>
        <p className="visa-demo-lead">
          Atlys, iVisa, and Sherpa open with a short bar. The picture is not beside the fields. This page is a comparison. The live apply form is unchanged.
        </p>
        <p className="visa-demo-live">
          <Link href="/visa-services/apply">Live apply page</Link>
        </p>

        <h2>How the best visa sites open</h2>
        <div className="visa-demo-compare">
          <article className="visa-demo-ref">
            <header>
              <strong>Atlys</strong>
              <span>Passport, then destination</span>
            </header>
            <div className="visa-demo-bar">
              <label>
                Passport
                <select defaultValue="India" aria-label="Atlys passport">
                  <option>India</option>
                </select>
              </label>
              <label>
                Traveling to
                <select defaultValue="" aria-label="Atlys destination">
                  <option value="">Select a destination</option>
                  <option>Thailand</option>
                </select>
              </label>
              <button className="visa-demo-go" type="button">
                Check visa requirements
              </button>
            </div>
            <p>The next screen shows the visa, the fee, and the delivery date before anyone pays. Two fields. No illustration.</p>
          </article>

          <article className="visa-demo-ref">
            <header>
              <strong>iVisa</strong>
              <span>Nationality, then destination</span>
            </header>
            <div className="visa-demo-bar">
              <label>
                Passport
                <select defaultValue="" aria-label="iVisa passport">
                  <option value="">Your nationality</option>
                  <option>India</option>
                </select>
              </label>
              <label>
                Destination
                <select defaultValue="" aria-label="iVisa destination">
                  <option value="">Where to?</option>
                  <option>Japan</option>
                </select>
              </label>
              <button className="visa-demo-go" type="button">
                Get started
              </button>
            </div>
            <p>The long form starts only after this. Fees are two lines: the government fee, and their service fee.</p>
          </article>

          <article className="visa-demo-ref">
            <header>
              <strong>Sherpa</strong>
              <span>Route and dates together</span>
            </header>
            <div className="visa-demo-bar">
              <label>
                Nationality
                <select defaultValue="India" aria-label="Sherpa nationality">
                  <option>India</option>
                </select>
              </label>
              <label>
                Where to
                <select defaultValue="Thailand" aria-label="Sherpa destination">
                  <option>Thailand</option>
                </select>
              </label>
              <label>
                Depart
                <input type="text" readOnly value="" placeholder="Date" aria-label="Sherpa departure" />
              </label>
              <label>
                Return
                <input type="text" readOnly value="" placeholder="Date" aria-label="Sherpa return" />
              </label>
              <button className="visa-demo-go" type="button">
                See requirements
              </button>
            </div>
            <p>Dates sit in the same bar. Requirements appear before an application starts.</p>
          </article>
        </div>

        <h2>Proposed for World Compass</h2>
        <form className="visa-demo-proposal-wrap">
          <div className="visa-demo-proposal">
            <label>
              Destination
              <select defaultValue="" name="country">
                <option value="">Country you are travelling to</option>
                <option>Thailand</option>
                <option>Japan</option>
                <option>United Arab Emirates</option>
                <option>Schengen area</option>
              </select>
            </label>
            <label>
              Nationality
              <select defaultValue="India" name="nationality">
                <option>India</option>
              </select>
            </label>
            <label>
              Departure
              <input name="departure" type="text" readOnly placeholder="Choose a date" />
            </label>
            <label>
              Return
              <input name="return" type="text" readOnly placeholder="Choose a date" />
            </label>
            <label>
              Travellers
              <input name="travellers" type="number" min={1} max={20} defaultValue={1} />
            </label>
            <button className="visa-demo-primary" type="button">
              Request visa help
            </button>
            <label className="visa-demo-note">
              Note, optional
              <input name="note" type="text" placeholder="A previous refusal, children on the trip, or a fixed appointment date" />
            </label>
            <button className="visa-demo-alt" type="button">
              Or send this request on WhatsApp
            </button>
          </div>
          <p className="visa-demo-promise">We reply within 24 hours. You pay nothing until you accept the quote.</p>
        </form>
      </section>
    </WorldCompassHolidayFrame>
  );
}

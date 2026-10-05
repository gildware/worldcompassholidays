import { FieldHelp } from "@/components/forms/FieldHelp";
import { theme } from "@/config/theme";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { enquiryInterests } from "@/lib/navigation";

type DestinationOption = {
  slug: string;
  name: string;
};

export function Hero({ destinations }: { destinations: DestinationOption[] }) {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div>
          <p className="text-sm font-medium tracking-wide text-white/70">
            {theme.brandName}
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
            {theme.headline}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
            {theme.tagline}
          </p>
        </div>
        <form
          action="/destinations"
          className="grid gap-4 rounded-2xl bg-white p-5 text-navy shadow-xl"
        >
          <div>
            <label htmlFor="q" className="text-sm font-medium">
              Where do you want to go?
            </label>
            <input
              id="q"
              name="q"
              list="destination-names"
              placeholder="Ladakh, Kerala, Thailand"
              className="mt-2"
            />
            <datalist id="destination-names">
              {destinations.map((destination) => (
                <option key={destination.slug} value={destination.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="interest" className="inline-flex items-center gap-1.5 text-sm font-medium">
              What do you need?
              <FieldHelp label="What do you need?" help="hero.need" />
            </label>
            <SearchableSelect
              id="interest"
              name="interest"
              defaultValue=""
              emptyLabel="Any service"
              searchPlaceholder="Search services"
              className="mt-2"
              options={enquiryInterests().filter((item) => item.value !== "general")}
            />
          </div>
          <button
            type="submit"
            className="h-11 rounded-md bg-brand text-sm font-medium text-white"
          >
            Search destinations
          </button>
        </form>
      </div>
    </section>
  );
}

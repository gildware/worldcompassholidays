export type FieldGuide = {
  what: string;
  why: string;
};

const guides: Record<string, FieldGuide> = {
  "destination.name": {
    what: "The public name of this place, such as Kashmir or Leh.",
    why: "It is the name travelers see on cards, menus, and search. A clear name makes the destination easy to find.",
  },
  "Parent destination": {
    what: "The place this destination sits under, if it is part of a larger region.",
    why: "Use it to build a tree, such as a valley inside a state. Leave it empty for a top-level destination.",
  },
  Region: {
    what: "The state, province, or area this place belongs to.",
    why: "Travelers and filters use the region to group nearby places. It should match how people search for the area.",
  },
  Country: {
    what: "The country this destination is in.",
    why: "Country keeps listings, maps, and search accurate, especially when several regions share a similar name.",
  },
  Summary: {
    what: "A short description of the destination, shown on website cards.",
    why: "A sentence or two helps someone decide whether to open the page. Keep it specific to this place.",
  },
  Image: {
    what: "The main photo for this destination.",
    why: "Cards and the destination page use this image. A clear photo makes the place recognizable at a glance.",
  },
  Published: {
    what: "Whether this destination is visible on the public website.",
    why: "Turn it off while the page is incomplete. Turn it on when travelers should be able to find and open it.",
  },
  "staff.name": {
    what: "The staff member’s full name.",
    why: "It is how they appear in the admin and on their account. Use the name the rest of the team will recognize.",
  },
  "staff.email": {
    what: "The email address this person will use to sign in.",
    why: "Sign-in and account notices go to this address. It must be an inbox they can open.",
  },
  "staff.phone": {
    what: "A phone number for this staff member.",
    why: "Optional. Add it so the team can reach them when email is not enough.",
  },
  Role: {
    what: "The permission set this person gets after they sign in.",
    why: "The role decides which admin areas they can view or change. Pick the smallest role that covers their work.",
  },
  "Temporary password": {
    what: "A starting password for the new staff account.",
    why: "They need it for the first sign-in. Share it privately and ask them to change it afterwards.",
  },
  "staff.newPassword": {
    what: "A replacement password for this staff account.",
    why: "Fill it only when you want to reset their password. Leave it blank to keep the password they already use.",
  },
  "Active account": {
    what: "Whether this staff member is allowed to sign in.",
    why: "Turn it off to block access without deleting the account. Turn it on when they should work in the admin again.",
  },
  "Role name": {
    what: "The name of this permission set, such as Operations staff.",
    why: "Staff are assigned by this name. Make it obvious which job the role is for.",
  },
  "permission.matrix": {
    what: "The actions this role is allowed to take in each area of the admin.",
    why: "Turn on only what this role needs. View lets them see records. Manage lets them create and edit them. Full turns on every action in that row.",
  },
  "permission.full": {
    what: "Grants every available action in that row at once.",
    why: "Use it when this role should both see and change that area. It does nothing for actions that do not apply.",
  },
  "permission.view": {
    what: "Lets this role open and read records in that area.",
    why: "Turn it on for people who need to look things up but should not change them.",
  },
  "permission.manage": {
    what: "Lets this role create and edit records in that area.",
    why: "Turn it on for people who maintain that part of the catalog, team, or bookings.",
  },
  "enquiry.name": {
    what: "Your name, so the team knows who sent the enquiry.",
    why: "Replies are addressed to you. Use the name you want on the conversation.",
  },
  "enquiry.email": {
    what: "The email address where you want the reply.",
    why: "The team writes back to this address. Use an inbox you check.",
  },
  "enquiry.phone": {
    what: "A phone number the team can call about this enquiry.",
    why: "Optional. Add it if a call is easier than email for dates, group size, or pickup details.",
  },
  Interest: {
    what: "The kind of trip or service this enquiry is about.",
    why: "It routes the message to the right part of the team, such as tours, hotels, or transport.",
  },
  Message: {
    what: "What you want to ask or book.",
    why: "Dates, group size, and any must-haves help the team reply with a useful plan instead of more questions.",
  },
  "hero.where": {
    what: "A destination or place name to search for.",
    why: "The site uses it to narrow the destination list. Type a place you want to visit, or pick one from the suggestions.",
  },
  "hero.need": {
    what: "The service you are looking for, such as a tour, stay, or ride.",
    why: "It filters the results toward that kind of trip. Leave it as any service if you are still browsing.",
  },
  "search.destinations": {
    what: "Filters the destination list as you type.",
    why: "Use a name, parent place, region, or country when the list is long and you need one record.",
  },
  "option.search": {
    what: "Filters the choices in this list as you type.",
    why: "Use it when the list is long. The saved value changes only after you pick a result.",
  },
  "search.tours": {
    what: "Filters the tour list as you type.",
    why: "Use a title, destination, or difficulty when you need to open or check one tour quickly.",
  },
  "login.email": {
    what: "The email address on your account.",
    why: "Sign-in matches this address to your account. Use the same email you registered with.",
  },
  "login.password": {
    what: "The password for this account.",
    why: "It confirms the account is yours. It is checked only for this sign-in and is not shown again.",
  },
  "Full name": {
    what: "Your name as it should appear on your account and bookings.",
    why: "The team and your booking records use this name. Use the name you want on confirmations.",
  },
  "signup.email": {
    what: "The email address for your new account.",
    why: "You will sign in with it, and booking updates are sent there. Use an inbox you control.",
  },
  "signup.phone": {
    what: "A phone number for your account.",
    why: "Optional. The team can use it for trip updates when email is slow.",
  },
  "signup.password": {
    what: "The password you will use to sign in.",
    why: "It protects your bookings and profile. Use at least 8 characters that you do not use elsewhere.",
  },
  "profile.email": {
    what: "The email address on your account. It cannot be edited here.",
    why: "Sign-in and booking mail use this address. Contact the team if it needs to change.",
  },
  "profile.phone": {
    what: "The phone number saved on your account.",
    why: "Update it when your number changes so the team can still reach you about a trip.",
  },
  "Current password": {
    what: "The password you use to sign in today.",
    why: "It confirms you are the account owner before a new password is saved.",
  },
  "account.newPassword": {
    what: "The password you want to use from now on.",
    why: "After you save, sign-in uses this password. Choose at least 8 characters.",
  },
  Guests: {
    what: "How many people this booking is for.",
    why: "Group size affects availability, vehicles, and the price. Update it if your party changed.",
  },
  "Preferred start date": {
    what: "The date you would like the trip to begin.",
    why: "The team checks departures and availability against this date. Leave it if your dates have not changed.",
  },
  "Notes for the team": {
    what: "Anything the team should know about this request.",
    why: "Use it for pickup points, dietary needs, or a change in plans that the other fields do not cover.",
  },
  "booking.status": {
    what: "Where this booking is in your process, such as new, confirmed, or cancelled.",
    why: "The customer and the rest of the team see this status. Change it when the booking actually moves forward or is closed.",
  },
  Title: {
    what: "The public name of this tour.",
    why: "It is the headline on cards and the tour page. Travelers use it to tell this trip apart from others.",
  },
  Content: {
    what: "The full description of the tour.",
    why: "This is the story on the tour page: route, pace, and what the days feel like. Write it for someone deciding whether to book.",
  },
  "Short description": {
    what: "A brief summary shown on tour cards.",
    why: "People see this before they open the page. One or two sentences should say who the trip is for and what is special about it.",
  },
  Category: {
    what: "The type of tour, such as trekking, cultural, or adventure.",
    why: "Category groups similar trips in listings and filters. Pick the one that best matches how you sell this tour.",
  },
  "Youtube video": {
    what: "A YouTube link for a video about this tour.",
    why: "Optional. A video on the tour page helps travelers see the route and terrain before they enquire.",
  },
  "Minimum advance reservations": {
    what: "How many days before departure a traveler must book.",
    why: "Use it when you need lead time for permits, guides, or transport. Leave it blank if last-minute bookings are fine.",
  },
  "Duration (hours / label)": {
    what: "A short duration label, such as 6 hours or a half day.",
    why: "It is the duration travelers read on the card. Use a phrase people understand, not only a number.",
  },
  "Duration days": {
    what: "How many days the tour lasts.",
    why: "Day count drives the itinerary, pricing context, and filters. Use 1 for a day trip.",
  },
  "Tour min people": {
    what: "The smallest group you will run this tour for.",
    why: "It tells travelers and staff when a departure is too small to operate.",
  },
  "Tour max people": {
    what: "The largest group you will take on this tour.",
    why: "It caps bookings so guides, vehicles, and permits are not overfilled.",
  },
  FAQs: {
    what: "Questions travelers often ask, with your answers.",
    why: "FAQs reduce repeat enquiries about timing, fitness, and what is included. Add one row per question.",
  },
  "tour.faq.question": {
    what: "The question a traveler would ask.",
    why: "Phrase it the way a customer would, so they can find the answer without contacting you.",
  },
  "tour.faq.answer": {
    what: "Your answer to that question.",
    why: "A direct answer sets expectations and prevents surprises after someone books.",
  },
  Include: {
    what: "Something the tour price already covers.",
    why: "Travelers compare trips by what is included. List guides, stays, meals, or permits that are part of the price.",
  },
  Exclude: {
    what: "Something the traveler must pay for or arrange themselves.",
    why: "Clear exclusions stop disputes about flights, tips, insurance, or optional activities.",
  },
  Itinerary: {
    what: "The day-by-day plan of the tour.",
    why: "Travelers book from the itinerary. Each day should say where they go and what they do.",
  },
  "tour.day.number": {
    what: "Which day of the tour this block is.",
    why: "The number orders the plan. Day 1 is the first day of the trip.",
  },
  "tour.day.title": {
    what: "A short title for that day, such as the place or the main activity.",
    why: "The title is the scannable headline. The description underneath can hold the detail.",
  },
  "tour.day.description": {
    what: "What happens on that day.",
    why: "Walking time, transfers, and highlights belong here so travelers know the pace before they book.",
  },
  "Banner image": {
    what: "The full-width photo at the top of the tour page.",
    why: "It is the first image on the tour page. Use a wide landscape shot of the trip, not a logo or text graphic.",
  },
  "Cover image": {
    what: "The photo shown on tour cards in listings.",
    why: "Travelers see this when browsing tours and destinations. Pick a clear, upright crop that reads well as a small card.",
  },
  Gallery: {
    what: "Extra photos of the tour, added one at a time.",
    why: "A gallery shows stays, views, and the group experience beyond the banner and cover.",
  },
  "Add gallery image": {
    what: "A photo to add to this tour’s gallery.",
    why: "Each upload becomes another image on the tour page. Add the pictures that help someone picture the trip.",
  },
  "tour.surroundings": {
    what: "Nearby education, health, or transport points around the tour.",
    why: "Travelers use these to judge how close schools, clinics, and stations are to the trip.",
  },
  "tour.surroundings.name": {
    what: "The name of a nearby place, such as a clinic, school, or station.",
    why: "The name is what travelers recognize. Use the real local name.",
  },
  "tour.surroundings.content": {
    what: "A short note about that nearby place.",
    why: "Say what it is or why it matters, such as the nearest hospital or the airport used for arrival.",
  },
  "tour.surroundings.distance": {
    what: "How far that place is from the tour, such as 2 km or 15 minutes.",
    why: "Distance tells travelers whether the place is practical to use during the trip.",
  },
  Destination: {
    what: "The destination this tour belongs to.",
    why: "The tour is listed under this place on the website. Pick the destination travelers would search for.",
  },
  "Real tour address": {
    what: "The street or meeting address for the tour.",
    why: "Staff and travelers use it for the meeting point or the start of the route. Use an address a driver can find.",
  },
  "Map latitude": {
    what: "The north–south position of the tour on a map.",
    why: "Together with longitude, it places the pin. Copy it from a map so the pin sits on the real meeting point.",
  },
  "Map longitude": {
    what: "The east–west position of the tour on a map.",
    why: "It pairs with latitude to drop the map pin in the right place.",
  },
  "Map zoom": {
    what: "How close the map opens, from a wide region to a street.",
    why: "A higher zoom shows the meeting point. A lower zoom shows the surrounding area. Use a level where the pin is easy to see.",
  },
  "Price from": {
    what: "The starting price travelers see for this tour.",
    why: "Cards show this as the “from” price. Use the lowest real price, not a placeholder.",
  },
  Currency: {
    what: "The currency that price is charged in.",
    why: "The symbol and amount only make sense together. Match the currency you actually collect.",
  },
  Difficulty: {
    what: "How demanding the tour is: easy, moderate, or challenging.",
    why: "Travelers use it to judge fitness. Pick the level that matches the hardest normal day, not the easiest.",
  },
  "Default state": {
    what: "Whether the tour can be booked any day, or only on dates you open.",
    why: "Always available means any date can be requested. Specific dates means you control which departures exist.",
  },
  "iCal import URL": {
    what: "A calendar link that lists when this tour is occupied or open.",
    why: "Optional. If you already keep availability in another calendar, this URL can bring those dates in.",
  },
  Visibility: {
    what: "Whether the tour is live on the website or saved as a draft.",
    why: "Publish when travelers should see it. Draft keeps it in the admin while photos, price, or the itinerary are still unfinished.",
  },
  "Featured tour": {
    what: "Marks this tour to be highlighted in listings.",
    why: "Use it for trips you want in front of the rest. Too many featured tours makes the highlight meaningless.",
  },
  "Travel styles": {
    what: "The styles that describe this trip, such as cultural, nature, or independent.",
    why: "Travelers filter by style. Tick every style that truly fits, and skip the ones that only partly apply.",
  },
  Facilities: {
    what: "Amenities available on this tour, such as wifi or a gym.",
    why: "Tick only what this trip actually provides. Travelers treat these as promises.",
  },
  "seo.index": {
    what: "Whether search engines may list this tour.",
    why: "Leave it on for tours you want found on Google. Turn it off for drafts or trips that should stay unlisted.",
  },
  "SEO title": {
    what: "The title search engines and browser tabs show for this tour.",
    why: "A specific title helps the right travelers find the page. Leave it blank to reuse the tour title.",
  },
  "SEO description": {
    what: "The short text search engines can show under the title.",
    why: "This snippet is often what someone reads before they click. Say where the tour goes and who it is for.",
  },
  "Featured SEO image": {
    what: "The image search and social previews can use for this tour.",
    why: "When a link is shared, this image is the picture beside the title. Use a clear photo of the trip.",
  },
  "Facebook title": {
    what: "The headline used when this tour is shared on Facebook.",
    why: "Social titles can be more inviting than the page title. Leave it blank to fall back to the SEO or tour title.",
  },
  "Facebook description": {
    what: "The text under the headline in a Facebook share.",
    why: "A sentence about the trip gives people a reason to open the link.",
  },
  "X title": {
    what: "The headline used when this tour is shared on X.",
    why: "Short titles work better in a post. Leave it blank to reuse the SEO or tour title.",
  },
  "X description": {
    what: "The text under the headline in an X share.",
    why: "Use one or two sentences. This is the caption people see before they visit the tour page.",
  },
};

export function guideFor(key: string, label: string): FieldGuide {
  return (
    guides[key] ??
    guides[label] ?? {
      what: `${label} is the value saved for this part of the form.`,
      why: "Fill it in so the record stays accurate for your team and for travelers.",
    }
  );
}

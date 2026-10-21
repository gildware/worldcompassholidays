export const hotelRequestFaqs = [
  {
    question: "When do I pay?",
    answer:
      "You pay nothing to send this form. We reply with hotels and a price. A stay is booked only after you accept that quote.",
  },
  {
    question: "What if the hotel is not on this website?",
    answer:
      "Send the name anyway, or describe the stay if you do not have a name. The search is not limited to the hotels listed here.",
  },
  {
    question: "How fast do you reply?",
    answer:
      "The first reply, with options and a price, is within 24 hours. If a date is tight, say so in the note and we start with what is still open.",
  },
  {
    question: "Can one request cover my family?",
    answer:
      "Yes. Put adults, children, and rooms on the form. Use the note for connecting rooms, a crib, or a ground-floor room.",
  },
  {
    question: "Do you book it, or only suggest it?",
    answer:
      "We suggest first. Nothing is held in your name until you accept the option and the price.",
  },
  {
    question: "What should I have ready before I ask?",
    answer:
      "The city, the dates, and how many people are enough. A hotel name, a neighbourhood, breakfast, or a nightly budget make the search tighter.",
  },
] as const;

export const hotelRequestSteps = [
  {
    title: "You send the brief",
    text: "City, dates, guests, and anything that matters. This page does not take a payment.",
  },
  {
    title: "We search",
    text: "The desk looks at listed hotels and stays that are not on this website.",
  },
  {
    title: "We contact you",
    text: "You get the options and the price on the phone or email you gave.",
  },
  {
    title: "You accept",
    text: "A room is booked only after you accept. Until then, the request stays an enquiry.",
  },
] as const;

export const hotelRequestStays = [
  {
    id: "water",
    title: "Beach, lake, or river",
    text: "A stay on the water. Tell us the coast, the lake, or the backwater.",
    stars: "any",
    message: "A beach, lake, or riverside stay.",
  },
  {
    id: "mountain",
    title: "Mountains",
    text: "A hill station or a quiet valley. Say if you want to be near a trail.",
    stars: "any",
    message: "A hill or mountain stay, quiet if possible.",
  },
  {
    id: "city",
    title: "City hotel",
    text: "Close to the centre, a station, or a meeting. Name the neighbourhood if you have one.",
    stars: "4",
    message: "A city hotel, close to the centre.",
  },
  {
    id: "family",
    title: "Family stay",
    text: "Space for children. Put the ages in the note if a room type depends on them.",
    stars: "4",
    message: "A family stay, with space for children.",
  },
] as const;

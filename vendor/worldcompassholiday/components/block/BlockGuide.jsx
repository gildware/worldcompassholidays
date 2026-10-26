import { theme } from "@/config/theme";

const icons = [
  "/img/featureIcons/1/1.svg",
  "/img/featureIcons/1/2.svg",
  "/img/featureIcons/1/3.svg",
];

const defaultItems = [
  {
    id: "price",
    title: "A price before you pay",
    text: "The quote names the fee. You accept it before anyone is booked.",
  },
  {
    id: "request",
    title: "One request for the trip",
    text: "Tours, stays, visas, and rentals start from the same enquiry.",
  },
  {
    id: "reply",
    title: "A person replies",
    text: `Call or WhatsApp ${theme.contact.phone}. We answer from India.`,
  },
];

const BlockGuide = ({ items = defaultItems }) => {
  const list = Array.isArray(items) && items.length ? items : defaultItems;
  return (
    <>
      {list.map((item, index) => (
        <div
          className="col-lg-3 col-sm-6"
          data-aos="fade"
          data-aos-delay={String((index + 1) * 100)}
          key={item.id || index}
        >
          <div className="featureIcon -type-1 ">
            <div className="d-flex justify-center">
              <img src={icons[index % icons.length]} alt="" className="js-lazy" />
            </div>
            <div className="text-center mt-30">
              <h4 className="text-18 fw-500">{item.title}</h4>
              <p className="text-15 mt-10">{item.text}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default BlockGuide;

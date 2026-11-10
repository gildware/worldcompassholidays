const BUS_PHOTO = "/img/buses/hire-bus-clean.jpg";

export function HomeBusScene() {
  return (
    <div className="hb-request__media" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hb-request__photo" src={BUS_PHOTO} alt="" />
    </div>
  );
}

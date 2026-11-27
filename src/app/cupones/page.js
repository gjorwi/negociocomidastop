import CouponsBusinessClient from "./coupons-client";

export const instant = false;

export const metadata = {
  title: "Cupones · comidasTop Negocios",
};

export default function BusinessCouponsPage() {
  return <CouponsBusinessClient />;
}

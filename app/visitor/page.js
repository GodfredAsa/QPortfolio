/**
 * Public route — no sign-in. Share: /visitor
 */
export const metadata = {
  title: "Visitor page | Quick Portfolio",
  description: "Public page for people you send the link to. No account required.",
};

export default function VisitorPage() {
  return (
    <main
      className="min-h-0 flex-1 bg-[#ececec]"
      aria-label="Visitor page"
    />
  );
}

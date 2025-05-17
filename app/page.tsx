import FAQsThree from "@/components/FaQtree";
import Features from "@/components/features-4";
// import { AccordionComponent } from "@/components/homepage/accordion-component";
import HeroSection from "@/components/homepage/hero-section";
import Pricing from "@/components/homepage/pricing";
import SideBySide from "@/components/homepage/side-by-side";
import PageWrapper from "@/components/wrapper/page-wrapper";
import { polar } from "@/lib/polar";
export const runtime = "edge";
export default async function Home() {
  // Fetch all products if no organization ID is specified
  const data = await polar.products.list({
    organizationId: process.env.POLAR_ORGANIZATION_ID || undefined,
  });

  // Filter products to only include those from your organization
  // This is a fallback in case POLAR_ORGANIZATION_ID is not set
  // You should set POLAR_ORGANIZATION_ID in your .env.local file
  const filteredProducts = {
    ...data?.result,
    items: data?.result?.items.filter(product =>
      // Keep only products that are not archived
      !product.isArchived &&
      // If you know your organization ID, you can hardcode it here
      // Example: product.organizationId === "your-org-id"
      // Or filter by product name if you know which products you want to show
      (product.name === "TagPix AI" || product.name.toLowerCase().includes("tagpix"))
    ) || []
  };

  return (
    <PageWrapper>
      <div className="w-full bg-gradient-to-t from-background to-background/40">
        <HeroSection />
        <SideBySide />
        <Features />
        <Pricing result={filteredProducts as any} />
        <FAQsThree />
      </div>
    </PageWrapper>
  );
}

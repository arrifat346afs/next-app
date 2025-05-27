"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { Check, CheckCircle2, DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Price {
  id: string;
  priceAmount: number;
  priceCurrency: string;
  recurringInterval: "month" | "year";
  productId?: string;
}

interface Benefit {
  description: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  prices: Price[];
  benefits: Benefit[];
  isRecurring?: boolean;
  isArchived?: boolean;
  organizationId?: string;
  createdAt?: Date;
  modifiedAt?: Date | null;
  metadata?: Record<string, any>;
  medias?: any[];
  attachedCustomFields?: any[];
}

interface PricingProps {
  result: {
    items: Product[];
    pagination: {
      totalCount: number;
      maxPage: number;
    };
  };
}

type PricingSwitchProps = {
  onSwitch: (value: string) => void;
};

type PricingCardProps = {
  user: ReturnType<typeof useUser>["user"];
  isYearly?: boolean;
  name: string;
  prices: Price[];
  description: string;
  benefits: Benefit[];
};

type PricingHeaderProps = {
  title: string;
  subtitle: string;
};

const PricingHeader = ({ title, subtitle }: PricingHeaderProps) => (
  <div className="text-center mb-10">
    <div className="mx-auto w-fit rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 px-4 py-1 mb-6">
      <div className="flex items-center gap-2 text-sm font-medium">
        <DollarSign className="h-4 w-4" />
        <span>Pricing</span>
      </div>
    </div>

    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text pb-2">
      {title}
    </h2>
    <p className=" mt-4 max-w-2xl mx-auto">{subtitle}</p>
  </div>
);

const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <div className="flex justify-center items-center gap-3">
    <Tabs defaultValue="0" className="w-[400px]" onValueChange={onSwitch}>
      <TabsList className="w-full">
        <TabsTrigger value="0" className="w-full">
          Monthly
        </TabsTrigger>
        <TabsTrigger value="1" className="w-full">
          Yearly
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
);

const FreePricingCard = ({
  user,
  isYearly,
  name,
  prices,
  description,
  benefits,
}: PricingCardProps) => {
  const router = useRouter();
  const getProCheckoutUrl = useAction(
    api.subscriptions.getProOnboardingCheckoutUrl
  );

  const currentPrice =
    prices.find((price) =>
      isYearly
        ? price.recurringInterval === "year"
        : price.recurringInterval === "month"
    ) || prices[0];

  const priceAmount = currentPrice
    ? (currentPrice.priceAmount / 100).toFixed(2)
    : "0";
  const currency = currentPrice?.priceCurrency?.toUpperCase() || "USD";
  const interval = isYearly ? "year" : "month";

  const handleCheckout = async () => {
    if (!currentPrice) return;

    try {
      const checkout = await getProCheckoutUrl({
        priceId: currentPrice.id,
      });
      window.location.href = checkout;
    } catch (error) {
      console.error("Failed to get checkout URL:", error);
    }
  };
    const handleButtonClick = () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    handleCheckout();
  };

  return (
    <Card className="relative w-full max-w-sm mx-4 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-transparent border-2">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold">Free</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tight">$0</span>
          <span className="text-lg text-muted-foreground">/forever</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <hr className="border-dashed" />

        <ul className="list-outside space-y-3 text-sm">
          {["Basic AI Model Access", "1GB Cloud Storage", "Community Support", "Limited API Calls", "Basic Analytics"].map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="size-3" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          onClick={handleButtonClick}
          variant="outline"
          className="w-full text-base font-semibold"
        >
          {!user ? "Sign in to continue" : "Get Started"}
        </Button>
      </CardFooter>
    </Card>
  );
};

const PricingCard = ({
  user,
  isYearly,
  name,
  prices,
  description,
  benefits,
}: PricingCardProps) => {
  const router = useRouter();
  const getProCheckoutUrl = useAction(
    api.subscriptions.getProOnboardingCheckoutUrl
  );

  const currentPrice =
    prices.find((price) =>
      isYearly
        ? price.recurringInterval === "year"
        : price.recurringInterval === "month"
    ) || prices[0];

  const priceAmount = currentPrice
    ? (currentPrice.priceAmount / 100).toFixed(2)
    : "0";
  const currency = currentPrice?.priceCurrency?.toUpperCase() || "USD";
  const interval = isYearly ? "year" : "month";

  const handleCheckout = async () => {
    if (!currentPrice) return;

    try {
      const checkout = await getProCheckoutUrl({
        priceId: currentPrice.id,
      });
      window.location.href = checkout;
    } catch (error) {
      console.error("Failed to get checkout URL:", error);
    }
  };

  const handleButtonClick = () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    handleCheckout();
  };

  const buttonText = !user
    ? "Sign in to continue"
    : !currentPrice
      ? "No price available"
      : "Get Started";

  return (
    <Card className="relative w-full max-w-sm mx-4 transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tight">
            {currency === "USD" ? "$" : currency} {priceAmount}
          </span>
          <span className="text-lg text-muted-foreground">/{interval}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <hr className="border-dashed" />

        <ul className="list-outside space-y-3 text-sm">
          {["Advanced AI Model Access", "Unlimited API Calls", "25GB Cloud Storage", "Priority Email & Chat Support", "Advanced Analytics Dashboard", "Custom Model Training", "API Key Access", "Dedicated Account Manager"].map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-blue-500" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          onClick={handleButtonClick}
          className="w-full text-base font-semibold">
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function Pricing({ result }: PricingProps) {
  const [isYearly, setIsYearly] = useState<boolean>(false);
  const [hasYearlyPlans, setHasYearlyPlans] = useState(false);
  const { user } = useUser();

  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1);

  useEffect(() => {
    // Check if any products have yearly pricing
    const hasYearly = result.items.some((product) =>
      product.prices.some((price) => price.recurringInterval === "year")
    );
    setHasYearlyPlans(hasYearly);

    // If we're on yearly view but no yearly plans exist, switch to monthly
    if (isYearly && !hasYearly) {
      setIsYearly(false);
    }
  }, [result.items, isYearly]);

  // Filter products based on current interval selection and product name
  const filteredProducts = result.items.filter(
    (item) =>
      // Only show non-archived products
      !item.isArchived &&
      // Filter by pricing interval
      item.prices?.some((price) =>
        isYearly
          ? price.recurringInterval === "year"
          : price.recurringInterval === "month"
      ) &&
      // Only show products from your organization (by name)
      // You can customize this filter based on your specific products
      (item.name === "Pro" || 
        item.name === "Free" ||
        item.name.toLowerCase().includes("pro") ||
        item.name.toLowerCase().includes("free"))
  );

  return (
    <section className="px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <PricingHeader
          title="Choose Your Plan"
          subtitle="Select the perfect plan for your needs."
        />

        {hasYearlyPlans && (
          <div className="mt-8 mb-12">
            <PricingSwitch onSwitch={togglePricingPeriod} />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-center items-center gap-8 mt-8"
        >
          {filteredProducts.map((item) => 
            item.name === "Free" ? (
              <FreePricingCard
                key={item.id}
                user={user}
                name={item.name}
                description={item.description || ""}
                prices={item.prices}
                benefits={item.benefits}
                isYearly={isYearly}
              />
            ) : (
              <PricingCard
                key={item.id}
                user={user}
                name={item.name}
                description={item.description || ""}
                prices={item.prices}
                benefits={item.benefits}
                isYearly={isYearly}
              />
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}

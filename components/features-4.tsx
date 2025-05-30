import {
  Cpu,
  Database,
  File,
  Fingerprint,
  Pencil,
  Settings2,
  Shuffle,
  Sparkles,
  Zap,
} from "lucide-react";
import { Card } from "./ui/card";
import { AnimatedGroup } from "./motion-primitives/animated-group";

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { type: "spring", bounce: 0.3, duration: 1.5 },
    },
  },
};

export default function Features() {
  return (
    <section className="py-12 md:py-20">
      <AnimatedGroup variants={transitionVariants}>
        <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
          <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
            <h2 className="text-balance text-4xl font-medium lg:text-5xl">
              Key Features
            </h2>
          </div>

          <div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 space-y-4">
                <Cpu className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">AI-Powered Metadata</h3>
                <p className="text-muted-foreground">
                  Automatically generate accurate titles, descriptions, and
                  keywords using advanced AI models.
                </p>
              </Card>

              <Card className="p-6 space-y-4">
                <Shuffle className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">Model Flexibility</h3>
                <p className="text-muted-foreground">
                  Choose from multiple AI providers and models to match your
                  specific requirements and budget.
                </p>
              </Card>

              <Card className="p-6 space-y-4">
                <Database className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">Batch Processing</h3>
                <p className="text-muted-foreground">
                  Process multiple images simultaneously for increased
                  efficiency.
                </p>
              </Card>

              <Card className="p-6 space-y-4">
                <Settings2 className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">Customizable Settings</h3>
                <p className="text-muted-foreground">
                  Adjust keyword count and description length to meet different
                  platform requirements.
                </p>
              </Card>

              <Card className="p-6 space-y-4">
                <File className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">Metadata Export</h3>
                <p className="text-muted-foreground">
                  Export your metadata to CSV and other formats for easy
                  integration with Adobe and SutterStock
                </p>
              </Card>

              <Card className="p-6 space-y-4">
                <Zap className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">Categorization</h3>
                <p className="text-muted-foreground">
                  Automatically categorize your images for better organization
                  and retrieval. Based on the title, keywords, and description.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </AnimatedGroup>
    </section>
  );
}

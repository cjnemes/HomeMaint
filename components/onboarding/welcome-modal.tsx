"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Home,
  ClipboardList,
  Calendar,
  FileText,
  Users,
  Database,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { loadSampleData } from "@/app/actions/onboarding";
import { toast } from "sonner";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(1);
  const [dataOption, setDataOption] = useState<"fresh" | "sample">("fresh");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);

    try {
      // If user chose sample data, load it
      if (dataOption === "sample") {
        const result = await loadSampleData();

        if (result.success) {
          toast.success("Sample Data Loaded!", {
            description: "You can now explore the app with realistic demo data.",
          });
        } else {
          toast.error("Error", {
            description: result.message,
          });
        }
      }

      // Mark onboarding as complete
      localStorage.setItem("hasCompletedOnboarding", "true");

      // Close modal and refresh to show data
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Welcome to HomeMaint!</DialogTitle>
              <DialogDescription className="text-base">
                Your personal home maintenance tracking assistant
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Track All Your Assets</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your HVAC, appliances, roof, plumbing, and more in one organized
                      place
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <ClipboardList className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Maintenance History</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep detailed records of all repairs, inspections, and service work
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Schedule Tasks</h3>
                    <p className="text-sm text-muted-foreground">
                      Never miss important maintenance with task scheduling and reminders
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                    <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Service Provider Directory</h3>
                    <p className="text-sm text-muted-foreground">
                      Store contact information for all your trusted contractors and services
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900">
                    <FileText className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Document Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload photos, manuals, receipts, and warranties - all in one place
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900">
                    <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Your Data, Your Control</h3>
                    <p className="text-sm text-muted-foreground">
                      All data stored locally on your device. Export anytime. Works offline.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleContinue} size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Choose Your Starting Point</DialogTitle>
              <DialogDescription className="text-base">
                Start with an empty slate or explore with sample data
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <RadioGroup value={dataOption} onValueChange={(value) => setDataOption(value as "fresh" | "sample")}>
                <div className="space-y-4">
                  {/* Start Fresh */}
                  <div className="relative">
                    <RadioGroupItem value="fresh" id="fresh" className="peer sr-only" />
                    <Label
                      htmlFor="fresh"
                      className="flex cursor-pointer flex-col rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                          <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">Start Fresh</h3>
                          <p className="text-sm text-muted-foreground">
                            Begin with an empty application and add your own home data
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs bg-muted px-2 py-1 rounded">Your data</span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">Clean slate</span>
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* Load Sample Data */}
                  <div className="relative">
                    <RadioGroupItem value="sample" id="sample" className="peer sr-only" />
                    <Label
                      htmlFor="sample"
                      className="flex cursor-pointer flex-col rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                          <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">Load Sample Data</h3>
                          <p className="text-sm text-muted-foreground">
                            Explore the app with realistic demo data (you can delete it later)
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs bg-muted px-2 py-1 rounded">4 Sample Assets</span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">3 Records</span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">3 Tasks</span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">3 Providers</span>
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
              <Button onClick={handleBack} variant="outline" className="w-full sm:w-auto">
                Back
              </Button>
              <Button onClick={handleContinue} size="lg" className="w-full sm:w-auto">
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">You&apos;re All Set!</DialogTitle>
              <DialogDescription className="text-base">
                Here&apos;s a quick overview to get you started
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Dashboard</p>
                    <p className="text-sm text-muted-foreground">
                      View your home overview, upcoming tasks, and recent activity
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Assets Page</p>
                    <p className="text-sm text-muted-foreground">
                      Click &quot;Add Asset&quot; to start tracking your home systems and appliances
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Maintenance Records</p>
                    <p className="text-sm text-muted-foreground">
                      Log service history and track costs for each asset
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Tasks</p>
                    <p className="text-sm text-muted-foreground">
                      Schedule future maintenance and set up recurring tasks
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Settings</p>
                    <p className="text-sm text-muted-foreground">
                      Export your data anytime for backup or to use elsewhere
                    </p>
                  </div>
                </div>
              </div>

              {dataOption === "sample" && (
                <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-100">
                        Sample Data Included
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        We&apos;ve added sample assets, records, tasks, and service providers to help you
                        explore the app. You can delete them anytime from their respective pages.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
              <Button onClick={handleBack} variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
                Back
              </Button>
              <Button
                onClick={handleFinish}
                size="lg"
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Start Using HomeMaint"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

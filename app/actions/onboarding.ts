"use server";

import { generateSampleData } from "@/lib/sample-data";
import { homeRepository } from "@/lib/db/repositories/home.repository";

/**
 * Server action to load sample data for onboarding
 */
export async function loadSampleData(): Promise<{ success: boolean; message: string }> {
  try {
    // Get the first home (there should only be one in local app)
    const homes = homeRepository.findAll();

    if (homes.length === 0) {
      return {
        success: false,
        message: "No home found. Please refresh the app.",
      };
    }

    const home = homes[0];
    if (!home) {
      return {
        success: false,
        message: "No home found. Please refresh the app.",
      };
    }

    // Generate sample data
    await generateSampleData(home.id);

    return {
      success: true,
      message: "Sample data loaded successfully!",
    };
  } catch (error) {
    console.error("Error loading sample data:", error);
    return {
      success: false,
      message: "Failed to load sample data. Please try again.",
    };
  }
}

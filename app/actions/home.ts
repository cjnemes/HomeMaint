'use server';

import { revalidatePath } from 'next/cache';
import { homeRepository } from '@/lib/db/repositories/home.repository';
import type { Home } from '@/lib/db/types';

/**
 * Get a home by ID
 */
export async function getHomeById(id: number): Promise<Home | undefined> {
  try {
    return homeRepository.findById(id);
  } catch (error) {
    console.error(`Failed to get home ${id}:`, error);
    throw new Error('Failed to fetch home');
  }
}

/**
 * Update home information
 */
export async function updateHome(
  id: number,
  data: Partial<Omit<Home, 'id' | 'created_at' | 'updated_at'>>
): Promise<Home | undefined> {
  try {
    const home = await homeRepository.update(id, data);

    if (home) {
      revalidatePath('/settings');
      revalidatePath('/');
    }

    return home;
  } catch (error) {
    console.error(`Failed to update home ${id}:`, error);
    throw new Error('Failed to update home');
  }
}

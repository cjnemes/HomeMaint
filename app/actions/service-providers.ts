'use server';

import { revalidatePath } from 'next/cache';
import { serviceProviderRepository } from '@/lib/db/repositories/service-provider.repository';
import { getFirstHome } from './assets';
import type { ServiceProvider, CreateServiceProvider } from '@/lib/db/types';

/**
 * Get all service providers for a home
 */
export async function getServiceProviders(homeId?: number): Promise<ServiceProvider[]> {
  try {
    const actualHomeId = homeId ?? (await getFirstHome()).id;
    return serviceProviderRepository.findByHomeId(actualHomeId);
  } catch (error) {
    console.error('Failed to get service providers:', error);
    throw new Error('Failed to fetch service providers');
  }
}

/**
 * Get preferred service providers for a home
 */
export async function getPreferredProviders(homeId?: number): Promise<ServiceProvider[]> {
  try {
    const actualHomeId = homeId ?? (await getFirstHome()).id;
    return serviceProviderRepository.findPreferred(actualHomeId);
  } catch (error) {
    console.error('Failed to get preferred providers:', error);
    throw new Error('Failed to fetch preferred providers');
  }
}

/**
 * Search service providers
 */
export async function searchServiceProviders(
  query: string,
  homeId?: number
): Promise<ServiceProvider[]> {
  try {
    const actualHomeId = homeId ?? (await getFirstHome()).id;
    return serviceProviderRepository.search(actualHomeId, query);
  } catch (error) {
    console.error('Failed to search service providers:', error);
    throw new Error('Failed to search service providers');
  }
}

/**
 * Get a single service provider by ID
 */
export async function getServiceProviderById(id: number): Promise<ServiceProvider | undefined> {
  try {
    return serviceProviderRepository.findById(id);
  } catch (error) {
    console.error(`Failed to get service provider ${id}:`, error);
    throw new Error('Failed to fetch service provider');
  }
}

/**
 * Create a new service provider
 */
export async function createServiceProvider(
  data: Omit<CreateServiceProvider, 'home_id'>,
  homeId?: number
): Promise<ServiceProvider> {
  try {
    const actualHomeId = homeId ?? (await getFirstHome()).id;

    const providerData: CreateServiceProvider = {
      ...data,
      home_id: actualHomeId,
      is_preferred: data.is_preferred ?? 0,
    };

    const provider = serviceProviderRepository.create(providerData);

    revalidatePath('/providers');
    return provider;
  } catch (error) {
    console.error('Failed to create service provider:', error);
    throw new Error('Failed to create service provider');
  }
}

/**
 * Update a service provider
 */
export async function updateServiceProvider(
  id: number,
  data: Partial<Omit<ServiceProvider, 'id' | 'home_id' | 'created_at' | 'updated_at'>>
): Promise<ServiceProvider | undefined> {
  try {
    const provider = await serviceProviderRepository.update(id, data);

    if (provider) {
      revalidatePath('/providers');
    }

    return provider;
  } catch (error) {
    console.error(`Failed to update service provider ${id}:`, error);
    throw new Error('Failed to update service provider');
  }
}

/**
 * Delete a service provider
 */
export async function deleteServiceProvider(id: number): Promise<boolean> {
  try {
    const result = serviceProviderRepository.delete(id);

    if (result) {
      revalidatePath('/providers');
    }

    return result;
  } catch (error) {
    console.error(`Failed to delete service provider ${id}:`, error);
    throw new Error('Failed to delete service provider');
  }
}

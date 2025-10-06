import { BaseRepository } from './base.repository';
import type { ServiceProvider, CreateServiceProvider } from '../types';

export class ServiceProviderRepository extends BaseRepository<
  ServiceProvider,
  CreateServiceProvider,
  ServiceProvider
> {
  constructor() {
    super('service_providers');
  }

  /**
   * Find all service providers for a home
   */
  findByHomeId(homeId: number): ServiceProvider[] {
    const stmt = this.db.prepare(`
      SELECT * FROM service_providers
      WHERE home_id = ?
      ORDER BY company_name ASC
    `);
    return stmt.all(homeId) as ServiceProvider[];
  }

  /**
   * Find preferred service providers
   */
  findPreferred(homeId: number): ServiceProvider[] {
    const stmt = this.db.prepare(`
      SELECT * FROM service_providers
      WHERE home_id = ? AND is_preferred = 1
      ORDER BY company_name ASC
    `);
    return stmt.all(homeId) as ServiceProvider[];
  }

  /**
   * Search service providers by name or service type
   */
  search(homeId: number, query: string): ServiceProvider[] {
    const stmt = this.db.prepare(`
      SELECT * FROM service_providers
      WHERE home_id = ? AND (
        company_name LIKE ? OR
        service_types LIKE ?
      )
      ORDER BY company_name ASC
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(homeId, searchPattern, searchPattern) as ServiceProvider[];
  }

  /**
   * Create a new service provider
   */
  create(data: CreateServiceProvider): ServiceProvider {
    const stmt = this.db.prepare(`
      INSERT INTO service_providers (
        home_id, company_name, contact_name, phone, email, website,
        address_line1, address_line2, city, state, postal_code,
        service_types, license_number, insurance_info, rating, notes, is_preferred
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.home_id,
      data.company_name,
      data.contact_name ?? null,
      data.phone ?? null,
      data.email ?? null,
      data.website ?? null,
      data.address_line1 ?? null,
      data.address_line2 ?? null,
      data.city ?? null,
      data.state ?? null,
      data.postal_code ?? null,
      data.service_types ?? null,
      data.license_number ?? null,
      data.insurance_info ?? null,
      data.rating ?? null,
      data.notes ?? null,
      data.is_preferred
    );

    const provider = this.findById(Number(result.lastInsertRowid));
    if (!provider) {
      throw new Error('Failed to create service provider');
    }
    return provider;
  }

  /**
   * Update an existing service provider
   */
  update(id: number, data: Partial<ServiceProvider>): ServiceProvider | undefined {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.company_name !== undefined) {
      fields.push('company_name = ?');
      values.push(data.company_name);
    }
    if (data.contact_name !== undefined) {
      fields.push('contact_name = ?');
      values.push(data.contact_name);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.website !== undefined) {
      fields.push('website = ?');
      values.push(data.website);
    }
    if (data.address_line1 !== undefined) {
      fields.push('address_line1 = ?');
      values.push(data.address_line1);
    }
    if (data.address_line2 !== undefined) {
      fields.push('address_line2 = ?');
      values.push(data.address_line2);
    }
    if (data.city !== undefined) {
      fields.push('city = ?');
      values.push(data.city);
    }
    if (data.state !== undefined) {
      fields.push('state = ?');
      values.push(data.state);
    }
    if (data.postal_code !== undefined) {
      fields.push('postal_code = ?');
      values.push(data.postal_code);
    }
    if (data.service_types !== undefined) {
      fields.push('service_types = ?');
      values.push(data.service_types);
    }
    if (data.license_number !== undefined) {
      fields.push('license_number = ?');
      values.push(data.license_number);
    }
    if (data.insurance_info !== undefined) {
      fields.push('insurance_info = ?');
      values.push(data.insurance_info);
    }
    if (data.rating !== undefined) {
      fields.push('rating = ?');
      values.push(data.rating);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }
    if (data.is_preferred !== undefined) {
      fields.push('is_preferred = ?');
      values.push(data.is_preferred);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE service_providers SET ${fields.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }
}

// Export singleton instance
export const serviceProviderRepository = new ServiceProviderRepository();

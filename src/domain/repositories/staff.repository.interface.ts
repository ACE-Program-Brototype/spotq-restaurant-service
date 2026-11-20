/**
 * Global Staff Identity Repository Interface.
 *
 * Defines the persistence contract for managing global staff identities (user profile,
 * credentials, and contact information) independently of tenant restaurant memberships.
 */
import type { Staff } from "@/domain/entities/staff.entity.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface IStaffRepository extends IBaseRepository<Staff, string> {
	findByEmail(email: string): Promise<Staff | null>;
	findById(id: string): Promise<Staff | null>;
	save(staff: Staff): Promise<void>;
	create?(staff: Staff): Promise<Staff>;
}

import type { Knex } from 'knex';

import { NotificationType as NotificationTypeRow } from '../../types/db-generated-types.js';
import { ContextType } from '../../types/types.js';
import { NotificationPreferenceItem } from '../schema/types/NotificationPreference.js';

export function configurableTypes(
  db: Knex,
  audience: string,
): Promise<ReadonlyArray<NotificationTypeRow>> {
  return db('notification_type')
    .where('is_active', true)
    .where('is_configurable', true)
    .whereIn('audience', ['all', audience])
    .orderBy('rank');
}

export async function audienceFor(
  loaders: ContextType['loaders'],
  roleId: number,
): Promise<string> {
  const role = await loaders.AccountRole.loadById(roleId);

  return role?.code ?? 'student';
}

/**
 * Every configurable type with this account's switches applied. A missing
 * preference row means both channels are on, so accounts are never backfilled.
 */
export async function readNotificationPreference(
  db: Knex,
  accountId: number,
  audience: string,
): Promise<NotificationPreferenceItem[]> {
  const [types, preferences] = await Promise.all([
    configurableTypes(db, audience),
    db('notification_preference')
      .where('account_id', accountId)
      .select('type_id', 'email_enabled', 'in_app_enabled'),
  ]);

  const byType = new Map(preferences.map((row) => [row.type_id, row]));

  return types.map((type) => {
    const preference = byType.get(type.id);

    return {
      type: type.code,
      emailEnabled: preference ? preference.email_enabled : true,
      inAppEnabled: preference ? preference.in_app_enabled : true,
    };
  });
}

export async function countUnreadNotifications(db: Knex, accountId: number): Promise<number> {
  const row = await db('notification')
    .where('account_id', accountId)
    .whereNull('read_at')
    .whereNull('deleted_at')
    .count<Array<{ count: string }>>('* as count')
    .first();

  return Number(row?.count ?? 0);
}

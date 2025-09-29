exports.up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: 'varchar(255)',
      notNull: false,
    },
    google_refresh_token: {
      type: 'text',
      notNull: false,
    },
    google_access_token: {
      type: 'text',
      notNull: false,
    },
    token_expires_at: {
      type: 'timestamp',
      notNull: false,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    subscription_tier: {
      type: 'varchar(50)',
      notNull: true,
      default: 'free',
    },
    daily_digest_enabled: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
  });

  pgm.createIndex('users', 'email');
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
exports.up = (pgm) => {
  pgm.createTable('analytics_cache', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    property_id: {
      type: 'uuid',
      notNull: true,
      references: 'ga_properties',
      onDelete: 'CASCADE',
    },
    cache_key: {
      type: 'varchar(255)',
      notNull: true,
    },
    data: {
      type: 'jsonb',
      notNull: true,
    },
    cached_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    expires_at: {
      type: 'timestamp',
      notNull: false,
    },
  });

  pgm.addConstraint('analytics_cache', 'unique_property_cache_key', {
    unique: ['property_id', 'cache_key'],
  });

  pgm.createIndex('analytics_cache', ['property_id', 'cache_key']);
  pgm.createIndex('analytics_cache', 'expires_at');
};

exports.down = (pgm) => {
  pgm.dropTable('analytics_cache');
};
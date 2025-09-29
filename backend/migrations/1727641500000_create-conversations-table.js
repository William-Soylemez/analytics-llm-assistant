exports.up = (pgm) => {
  pgm.createTable('conversations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    property_id: {
      type: 'uuid',
      notNull: true,
      references: 'ga_properties',
      onDelete: 'CASCADE',
    },
    messages: {
      type: 'jsonb',
      notNull: true,
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
  });

  pgm.createIndex('conversations', 'user_id');
  pgm.createIndex('conversations', 'property_id');
};

exports.down = (pgm) => {
  pgm.dropTable('conversations');
};
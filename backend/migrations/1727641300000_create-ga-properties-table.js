exports.up = (pgm) => {
  pgm.createTable('ga_properties', {
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
      type: 'varchar(255)',
      notNull: true,
    },
    property_name: {
      type: 'varchar(255)',
      notNull: false,
    },
    website_url: {
      type: 'varchar(500)',
      notNull: false,
    },
    connected_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    last_synced_at: {
      type: 'timestamp',
      notNull: false,
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
  });

  pgm.addConstraint('ga_properties', 'unique_user_property', {
    unique: ['user_id', 'property_id'],
  });

  pgm.createIndex('ga_properties', 'user_id');
  pgm.createIndex('ga_properties', 'property_id');
};

exports.down = (pgm) => {
  pgm.dropTable('ga_properties');
};
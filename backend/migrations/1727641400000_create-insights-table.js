exports.up = (pgm) => {
  pgm.createTable('insights', {
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
    insight_type: {
      type: 'varchar(100)',
      notNull: true,
    },
    title: {
      type: 'varchar(500)',
      notNull: false,
    },
    content: {
      type: 'text',
      notNull: true,
    },
    action_items: {
      type: 'jsonb',
      notNull: false,
    },
    date_range_start: {
      type: 'date',
      notNull: false,
    },
    date_range_end: {
      type: 'date',
      notNull: false,
    },
    generated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    user_viewed: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    user_rating: {
      type: 'integer',
      notNull: false,
    },
  });

  pgm.createIndex('insights', 'property_id');
  pgm.createIndex('insights', ['generated_at'], { method: 'btree', order: 'DESC' });
  pgm.createIndex('insights', 'insight_type');
};

exports.down = (pgm) => {
  pgm.dropTable('insights');
};
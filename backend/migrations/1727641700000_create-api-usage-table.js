exports.up = (pgm) => {
  pgm.createTable('api_usage', {
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
    endpoint: {
      type: 'varchar(255)',
      notNull: false,
    },
    ga_api_calls: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    llm_tokens_used: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    timestamp: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('api_usage', 'user_id');
  pgm.createIndex('api_usage', 'timestamp');
};

exports.down = (pgm) => {
  pgm.dropTable('api_usage');
};

exports.up = function(knex, Promise) {
  return Promise.all([
      knex.schema.createTable('users', (table)=> {
        table.increments('users_id').primary();
        table.string('first_name');
        table.string('last_name');
        table.string('email').unique();
        table.string('password_hash');
        table.string('counselor_or_patient');
        table.string('major');
        table.date('created_at');
        table.bigint('university_id');
      }),

      knex.schema.createTable('results', (table)=>{
        table.increments('result_id').primary();
        table.integer('writer_id')
              .references('users_id')
              .inTable('users');
        table.text('text');
        table.date('created_at');
        table.text('tone_response');
        table.text('insight_response');
      })
    ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('users'),
    knex.schema.dropTable('results')
  ])
};

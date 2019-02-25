// Update with your config settings.

module.exports = {
  development: {
    client: 'sqlite3', 
    connection: {
      filename: './data/lambda-auth.db' 
    },
    useNullAsDefault: true, 
  },
};

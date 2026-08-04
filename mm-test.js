const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.model('FooModel', new Schema({ a: String }));
const conn = mongoose.createConnection('mongodb://localhost:27017/doesnotmatter');
try {
  const M = conn.model('FooModel');
  console.log('conn.model found on separate connection:', !!M);
} catch (e) {
  console.log('conn.model threw:', e.name, '-', e.message);
}
console.log('default models.FooModel:', !!mongoose.models.FooModel);
process.exit(0);

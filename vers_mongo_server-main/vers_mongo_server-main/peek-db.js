require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL).then(async () => {
  const v = await mongoose.connection.collection('vehicles')
    .find({}).limit(5)
    .project({ rc_no: 1, last_four_digit_rc: 1, last_four_digit_chassis: 1, mek_and_model: 1 })
    .toArray();
  v.forEach(x => console.log(JSON.stringify(x)));
  await mongoose.disconnect();
}).catch(e => { console.error(e.message); process.exit(1); });

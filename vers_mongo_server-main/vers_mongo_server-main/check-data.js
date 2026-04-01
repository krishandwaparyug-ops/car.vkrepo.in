require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('./models/vehicle.model');

mongoose.connect(process.env.MONGO_DB || process.env.MONGO_URL).then(async () => {
  // Check vehicles with rc_no
  const withRc = await Vehicle.find({ rc_no: { $exists: true, $ne: '' } })
    .select('rc_no last_four_digit_rc')
    .limit(5)
    .lean();
  console.log('Vehicles with rc_no:', JSON.stringify(withRc));
  withRc.forEach(v => console.log('  last_four_digit_rc type:', typeof v.last_four_digit_rc, 'val:', v.last_four_digit_rc));

  const totalWithRc = await Vehicle.countDocuments({ rc_no: { $exists: true, $ne: '' } });
  console.log('Total with rc_no:', totalWithRc);

  const totalAll = await Vehicle.countDocuments({});
  console.log('Total all:', totalAll);

  // Test search with number vs string for chassis
  const asNum = await Vehicle.find({ last_four_digit_chassis: 1651 }).select('chassis_no last_four_digit_chassis').limit(2).lean();
  console.log('\nSearch chassis 1651 as NUMBER:', asNum.length, 'results');

  const asStr = await Vehicle.find({ last_four_digit_chassis: '1651' }).select('chassis_no last_four_digit_chassis').limit(2).lean();
  console.log('Search chassis 1651 as STRING:', asStr.length, 'results');

  // Check if last_four_digit_rc exists with number type
  const withRcNum = await Vehicle.find({ last_four_digit_rc: { $type: 'number' } }).limit(3).select('rc_no last_four_digit_rc').lean();
  console.log('\nlast_four_digit_rc as number type:', JSON.stringify(withRcNum));

  const withRcStr = await Vehicle.find({ last_four_digit_rc: { $type: 'string' } }).limit(3).select('rc_no last_four_digit_rc').lean();
  console.log('last_four_digit_rc as string type:', JSON.stringify(withRcStr));

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });

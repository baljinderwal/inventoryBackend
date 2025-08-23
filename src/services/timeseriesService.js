import { Point } from '@influxdata/influxdb3-client'
import influxDB from '../config/influxdbClient.js'

const database = process.env.INFLUXDB_DATABASE // make sure this is set in .env

// ---------------- Add Shoe ----------------
export const addShoe = async (size, color, quantity) => {
  console.log(`Adding shoe - Size: ${size}, Color: ${color}, Quantity: ${quantity}`)
  const point = Point
    .measurement("shoes")
    .setTag("size", size)
    .setTag("color", color)
    .setIntegerField("quantity", quantity)

    console.log("Writing point:", point)
    console.log("To database:", database)

  await influxDB.write(point, database)
}

// ---------------- Get Shoes ----------------
export const getShoes = async (filters) => {
  let query = `SELECT * FROM "shoes" WHERE time > now() - interval '30 days'`

  if (filters.size) {
    query += ` AND size = '${filters.size}'`
  }

  if (filters.color) {
    query += ` AND color = '${filters.color}'`
  }

  query += ` AND quantity > 0 ORDER BY time DESC LIMIT 1`

  const rows = await influxDB.query(query, database )
  let results = [];
  //console.log(`${"ants".padEnd(5)}${"bees".padEnd(5)}${"location".padEnd(10)}${"time".padEnd(15)}`);
  for await (const row of rows) {
    console.log(row);
    results.push(row);
      // let ants = row.ants || '';
      // let bees = row.bees || '';
      // let time = new Date(row.time);
      // console.log(`${ants.toString().padEnd(5)}${bees.toString().padEnd(5)}${row.location.padEnd(10)}${time.toString().padEnd(15)}`);
  }
  return results;
}

// ---------------- Sell Shoe ----------------
export const sellShoe = async (size, color) => {
  const point = Point
    .measurement("shoes")
    .setTag("size", size)
    .setTag("color", color)
    .setIntegerField("quantity", 0)
    .setTimestamp(new Date())

  await influxDB.write(point, database)
}

// ---------------- Close ----------------
export const close = async () => {
  await influxDB.close()
}

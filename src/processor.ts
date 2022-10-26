import BigNumber from 'bignumber.js'
import { OrgDataType } from './types'

type DataType = {
  timestamp: Date
  price: string
}

// Get Average value from array
const getAverage = (arr: string[]) =>
  arr.reduce((a, b) => a.plus(b), BigNumber(0)).idiv(arr.length)

const processData = (floorsData: OrgDataType[]) => {
  const refilled: DataType[] = []
  floorsData.forEach(({ timestamp, value: price }, i) => {
    let key = new Date(timestamp)
    // increment key by 5 min steps till next floor data
    do {
      refilled.push({ timestamp: key, price })
      if (i === floorsData.length - 1) {
        return
      }
      key = new Date(key.getTime() + 5 * 60 * 1000) // increment 5 mins
    } while (key < new Date(floorsData[i + 1].timestamp))
  })
  const twaps = [1, 4, 8].map((h) => {
    return refilled.map(({ timestamp, price }, i) => {
      // get last 12, 48, 96 samples
      return {
        timestamp,
        price:
          i < h * 12
            ? price
            : getAverage(refilled.slice(i - h * 12, i).map((e) => e.price)),
      }
    })
  })

  return twaps
}

export default processData

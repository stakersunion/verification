const axios = require('axios')
const moment = require('moment')

// Constants
const SECONDS_PER_SLOT = 12
const SLOTS_PER_EPOCH = 32
const GENESIS_TIME = 1606824000 // Beacon chain genesis time in UNIX seconds

// Helper function to convert date/time to epoch
const dateTimeToEpoch = (dateTime) => {
  const unixTime = moment(dateTime, 'M/D/YYYY, h:mm:ss A').unix()
  return Math.floor((unixTime - GENESIS_TIME) / (SECONDS_PER_SLOT * SLOTS_PER_EPOCH))
}

// Helper function to convert epoch to local time
const epochToLocalTime = (epoch) => {
  const unixTime = GENESIS_TIME + epoch * SECONDS_PER_SLOT * SLOTS_PER_EPOCH
  return moment.unix(unixTime).format('YYYY-MM-DD HH:mm:ss')
}

// Function to get validator indices based on the address
const getValidatorIndices = async (address) => {
  try {
    const response = await axios.get(
      `https://beaconcha.in/api/v1/validator/withdrawalCredentials/${address}`
    )
    return response.data.data.map((validator) => validator.validatorindex)
  } catch (error) {
    console.error('Error fetching validator indices:', error)
    return []
  }
}

// Function to get validator income details
const getValidatorIncomeDetails = async (validatorIndexes, startEpoch) => {
  try {
    let penaltyDetails = []
    for (const index of validatorIndexes) {
      const epoch = startEpoch + 10
      const response = await axios.get(
        `https://beaconcha.in/api/v1/validator/${index}/incomedetailhistory`,
        {
          params: {
            epoch: epoch,
            limit: 15,
          },
        }
      )

      response.data.data.forEach((item) => {
        if (item.income.attestation_source_penalty) {
          const localTime = epochToLocalTime(item.epoch)
          penaltyDetails.push({ epoch: item.epoch, time: localTime, missed: true })
        }
      })
    }
    console.log(JSON.stringify(penaltyDetails, null, 2))
  } catch (error) {
    console.error('Error fetching validator income details:', error)
  }
}

// Main function
const main = async () => {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.error('Usage: node script.js <address> <dateTime>')
    return
  }
  const address = args[0]
  const dateTime = args[1]

  const startEpoch = dateTimeToEpoch(dateTime)
  console.log(`Starting epoch for ${dateTime} is ${startEpoch}`)

  const validatorIndexes = await getValidatorIndices(address)
  if (validatorIndexes.length > 0) {
    await getValidatorIncomeDetails(validatorIndexes, startEpoch)
  } else {
    console.error('No validators found for the given address.')
  }
}

// Run the main function
main()

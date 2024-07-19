# Stakers Union Verification

## Introduction

A simple script using the BeaconCha.in API to verify an applicant's Proof of Independent Operation. The script takes in an applicant's execution layer address and the proposed time period for verification. The script obtains a list of associated validator indices and then checks the income detail history for missed attestations around the selected time by converting to epoch. The output has the format:

```
[
  {
    "epoch": Number,
    "time": LocalTime,
    "missed": boolean
  }
]
```

## Usage

`bun index.js "execution_layer_address" "verification_period"`

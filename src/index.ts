#!/usr/bin/env node

import fs from 'node:fs'

const projectId = process.env.VERCEL_PROJECT_ID
const teamId = process.env.VERCEL_TEAM_ID
const token = process.env.VERCEL_TOKEN
const commitSha = process.env.CI_COMMIT_SHA

let state: string
let url: string
const getDeployment = async (): Promise<void> => {
  console.log('Attempting to get deployment')
  const response = await fetch(`https://api.vercel.com/v6/deployments?teamId=${teamId}&projectId=${projectId}&meta-gitlabCommitSha=${commitSha}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const result = await response.json()
  state = result?.deployments[0].state
  url = result?.deployments[0].url

  if (state === 'READY') {
    console.log('Attempting to write to file: ', url)
    await fs.appendFile('vercel_deployment_url.txt', url, (err) => {
      if (err) {
        console.log('Something went wrong: ', err)
      }
    })
    return
  }

  console.log('State not ready: ', state)
  setTimeout(() => getDeployment(), 5000)
}

await getDeployment()


export {}


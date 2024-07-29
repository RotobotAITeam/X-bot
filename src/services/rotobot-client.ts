import { BotError } from '../bot-error.js'
import * as config from '../config.js'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second
const ROTOBOT_API_URL = 'https://stg.rotobot.ai/api'

interface ApiRequestBody {
    initial_query: string;
    user_email: string;
    title: string;
  }
  
  interface ApiResponse {
    data: any; // Adjust this according to the actual response structure
  }
  
  export class RotobotClient {
    async fetchRotobotAnswer(requestBody: ApiRequestBody): Promise<string> {
      let retries = 0
      while (retries < MAX_RETRIES) {
        try {
          const response = await fetch(`${ROTOBOT_API_URL}/v1/main-chat-endpoint`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 'Authorization': `Bearer `
            },
            body: JSON.stringify(requestBody),
          })
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
  
          const data = await response.json() as ApiResponse
          return data.data
        } catch (error) {
          retries++
          if (retries >= MAX_RETRIES) {
            throw new BotError(`Failed to fetch Rotobot answer after ${MAX_RETRIES} attempts`, {
              type: 'rotobot:network',
              cause: error
            })
          }
          console.warn(`Rotobot API request failed, retrying (${retries}/${MAX_RETRIES})`)
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        }
      }
      throw new Error('This should never be reached')
    }
  }
  
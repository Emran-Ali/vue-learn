import { defineStore } from 'pinia'
import axios from 'axios'

export const useStreamStore = defineStore('stream', () => {
  async function login(email: string, password: string) {
    try {
      const response = await axios.post('http://localhost:3030/auth/login', {
        email,
        password,
      })

      const accessToken = response.data.data.accessToken
      const streamToken = response.data.data.streamToken

      if (accessToken) {
        // Store token in localStorage
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('stream_token', streamToken)

        // Optionally store other user data
        // localStorage.setItem('user', JSON.stringify(response.data.user));
        return { accessToken, streamToken }
      } else {
        console.error('No access token in response')
      }
    } catch (error) {
      console.error('Login failed', error)
    }
  }

  async function authUser() {
    const accessToken = localStorage.getItem('access_token')
    const user = await axios.get('http://localhost:3030/auth/current-user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return user.data
  }

  async function getUser(
    id: string,
  ): Promise<{ userId: string; token: string; apiKey: string; channelId: string }> {
    const response = await axios.get(
      `https://gothic-tennessee-hats-medicine.trycloudflare.com/stream-webhook/stream-info?userId=${id}`,
    )
    return response.data
  }

  return {
    login: login,
    getUser: getUser,
    authUser: authUser,
  }
})

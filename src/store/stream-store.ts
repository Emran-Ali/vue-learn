import { defineStore } from 'pinia'
import axios from 'axios'
export const useStreamStore = defineStore('stream', () => {
  async function login(email: string, password: string) {
    try {
      const response = await axios.post('http://localhost:3030/login', {
        email,
        password,
      })

      const accessToken = response.data.access_token
      const streamToken = response.data.stream_token

      if (accessToken) {
        // Store token in localStorage
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('stream_token', streamToken)

        // Optionally store other user data
        // localStorage.setItem('user', JSON.stringify(response.data.user));

        console.log('Login successful')
      } else {
        console.error('No access token in response')
      }
    } catch (error) {
      console.error('Login failed', error)
    }
  }

  async function getUser(
    id: string,
  ): Promise<{ userId: string; token: string; apiKey: string; channelId: string }> {
    const response = await axios.get(
      `http://localhost:3030/stream-webhook/stream-info?userId=${id}`,
    )
    return response.data
  }

  async function createUser(user: { userId: string; name: string; role: string; image?: string }) {
    console.log('Created user', user)
    const response = await axios.post('http://localhost:3030/stream/create-user', user)

    return response.data
  }

  async function getStreamToken(userId: string) {
    const response = await axios.get(`http://localhost:3030/stream/user-token?userId=${userId}`)

    console.log(response.data.streamToken, response.data, 'token from store')

    localStorage.setItem('user', userId)
    localStorage.setItem('streamToken', response.data)

    return response.data
  }

  async function createCall(callData: { callId: string; teacherId: string; studentId: string }) {
    const response = await axios.post('http://localhost:3030/stream/create-call', callData)
    return response.data
  }

  return {
    login: login,
    getUser: getUser,
    createUser: createUser,
    getStreamToken: getStreamToken,
    createCall: createCall,
  }
})

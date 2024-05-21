import { kv } from '@vercel/kv'
import { StreamingTextResponse } from 'ai'
import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { imageAnalysisPrompt } from '../../constants/prompt'

import 'crypto-browserify/polyfill';
import 'stream-browserify/globals';

// Set the global objects to use the polyfill
global.crypto = require('crypto-browserify');
global.process = require('process');

import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
})

export const runtime = 'edge'

async function processResponse(
  responseStream: any,
  userId: string,
  chatId: any,
  imageFile: any,
  dataURI: string
) {
  let completion = ''
  let imagePreview = ''

  for await (const event of responseStream) {
    completion += `${event}`
  }
  completion += '\n}'

  const response = JSON.parse(completion)

  // Format the response
  let formattedResponse = ''

  let overallScore = 0
  const maxScore = 10
  const analysisKeys = Object.keys(response.analysis)
  const numAnalysisKeys = analysisKeys.length

  for (const [key, value] of Object.entries(response.analysis)) {
    const analysisValue = value as { score: number; comment: string }
    overallScore += analysisValue.score
    formattedResponse += `**${key}**: ${analysisValue.comment}\n\n`
  }

  const overallComment = `The overall sensitivity score is ${overallScore} out of ${maxScore}`

  let shadowColor = 'green'
  if (overallScore > numAnalysisKeys / 10) {
    shadowColor = 'red'
  }

  imagePreview = `![Image Preview|150x150](${dataURI} "${shadowColor} score")`

  formattedResponse = `## ${response.title}\n\n${imagePreview}\n\n### Overall Score: ${overallComment}\n\n${formattedResponse}`

  const id = chatId ?? nanoid()
  const createdAt = Date.now()
  const path = `/chat/${id}`

  const existingChatData = await kv.hgetall(`chat:${id}`)
  const existingMessages = Array.isArray(existingChatData?.messages)
    ? existingChatData.messages
    : []

  const payload = {
    id,
    title: response.title,
    userId,
    createdAt,
    path,
    messages: [
      ...existingMessages,
      {
        content: formattedResponse,
        role: 'assistant'
      }
    ]
  }
  await kv.hmset(`chat:${id}`, payload)
  await kv.zadd(`user:chat:${userId}`, {
    score: createdAt,
    member: `chat:${id}`
  })

  const output = new ReadableStream({
    start(controller) {
      controller.enqueue(
        JSON.stringify({ response: formattedResponse, chatId: id })
      )
      controller.close()
    }
  })
  return new StreamingTextResponse(output)
}

async function fileToDataURI(file: File): Promise<string> {
  // Read the image file as a Buffer
  const buffer = await file.arrayBuffer()

  // Convert the buffer to a base64 string
  const base64String = Buffer.from(buffer).toString('base64')

  // Create the data URI
  const dataURI = `data:${file.type};base64,${base64String}`

  return dataURI
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const imageFile = formData.get('imageFile')
  const currentUrl = formData.get('currentUrl')?.toString() || ''

  const dataURI = await fileToDataURI(imageFile as File)

  // Extract chatId from the URL path
  const chatId = currentUrl
    ? new URL(currentUrl).pathname.split('/')[2]
    : undefined

  const userId = (await auth())?.user.id
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const prompt = imageAnalysisPrompt

  const apiUrl =
    'yorickvp/llava-13b:b5f6212d032508382d61ff00469ddda3e32fd8a0e75dc39d8a4191bb742157fb'
  const res = replicate.stream(apiUrl, {
    input: {
      image: dataURI,
      top_p: 1,
      prompt: JSON.stringify(prompt),
      max_tokens: 1024,
      temperature: 0.2
    }
  })

  return processResponse(res, userId, chatId, imageFile, dataURI)
}

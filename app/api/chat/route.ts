import { kv } from '@vercel/kv'
import { StreamingTextResponse } from 'ai'
import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

async function processResponse(
  responseStream: ReadableStream<Uint8Array>,
  userId: string,
  json: any
) {
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  if (!responseStream) {
    writer.close()
    return new Response('No response stream', { status: 500 })
  }

  const reader = responseStream.pipeThrough(new TextDecoderStream()).getReader()
  let completion = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      completion += value
      writer.write(value)
    }
    writer.close()
  } catch (err) {
    writer.abort(err)
  } finally {
    reader.releaseLock()
  }

  const response = JSON.parse(completion)
  const id = json.id ?? nanoid()
  const createdAt = Date.now()
  const path = `/chat/${id}`
  const payload = {
    id,
    title: response.title,
    userId,
    createdAt,
    path,
    messages: [{ content: completion, role: 'assistant' }]
  }
  await kv.hmset(`chat:${id}`, payload)
  await kv.zadd(`user:chat:${userId}`, {
    score: createdAt,
    member: `chat:${id}`
  })

  const output = stream.readable
  return new StreamingTextResponse(output)
}

function getBase64Image(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
    reader.readAsDataURL(imageFile)
  })
}

export async function POST(req: Request) {
  const json = await req.json()
  const { previewToken, imageFile } = json
  const userId = (await auth())?.user.id
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const imageBase64 = await getBase64Image(imageFile)

  const apiPayload = {
    model: 'llava',
    prompt: {
      prompt:
        'Please analyze the provided image for sensitivity and security concerns. Provide a detailed assessment using the following metrics:',
      metrics: [
        'Nudity and Explicit Content',
        'Violence and Weapons',
        'Hate Symbols and Offensive Material',
        'Sensitive Context',
        'Privacy Violations',
        'Cultural Sensitivity',
        'Legal Compliance',
        'Contextual Analysis',
        'Emotional Impact',
        'Public Perception'
      ],
      expected_response_format: 'JSON',
      response_format_casting: {
        title: 'Provide a well clear title corncering the image',
        analysis: {
          'Nudity and Explicit Content': {
            score: 'integer',
            comment: 'string'
          },
          'Violence and Weapons': {
            score: 'integer',
            comment: 'string'
          },
          'Hate Symbols and Offensive Material': {
            score: 'integer',
            comment: 'string'
          },
          'Sensitive Context': {
            score: 'integer',
            comment: 'string'
          },
          'Privacy Violations': {
            score: 'integer',
            comment: 'string'
          },
          'Cultural Sensitivity': {
            score: 'integer',
            comment: 'string'
          },
          'Legal Compliance': {
            score: 'integer',
            comment: 'string'
          },
          'Contextual Analysis': {
            score: 'integer',
            comment: 'string'
          },
          'Emotional Impact': {
            score: 'integer',
            comment: 'string'
          },
          'Public Perception': {
            score: 'integer',
            comment: 'string'
          }
        }
      }
    },
    images: [imageBase64]
  }
  const apiUrl = 'http://localhost:11434/api/generate'
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiPayload)
  })

  const responseStream = res.body
  if (!responseStream) {
    return new Response('No response stream', { status: 500 })
  }

  return processResponse(responseStream, userId, json)
}

























































// import { kv } from '@vercel/kv'
// import { StreamingTextResponse } from 'ai'
// import { auth } from '@/auth'
// import { nanoid } from '@/lib/utils'

// export const runtime = 'edge'

// async function processResponse(
//   responseStream: ReadableStream<Uint8Array>,
//   messages: any[],
//   userId: string,
//   json: any
// ) {
//   const stream = new TransformStream()
//   const writer = stream.writable.getWriter()

//   if (!responseStream) {
//     writer.close()
//     return new Response('No response stream', { status: 500 })
//   }

//   const reader = responseStream.pipeThrough(new TextDecoderStream()).getReader()
//   let completion = ''

//   try {
//     while (true) {
//       const { value, done } = await reader.read()
//       if (done) break
//       completion += value
//       writer.write(value)
//     }
//     writer.close()
//   } catch (err) {
//     writer.abort(err)
//   } finally {
//     reader.releaseLock()
//   }

//   const title = json.messages[0].content.substring(0, 100)
//   const id = json.id ?? nanoid()
//   const createdAt = Date.now()
//   const path = `/chat/${id}`
//   const payload = {
//     id,
//     title,
//     userId,
//     createdAt,
//     path,
//     messages: [...messages, { content: completion, role: 'assistant' }]
//   }
//   await kv.hmset(`chat:${id}`, payload)
//   await kv.zadd(`user:chat:${userId}`, {
//     score: createdAt,
//     member: `chat:${id}`
//   })

//   const output = stream.readable
//   return new StreamingTextResponse(output)
// }

// function fakeApiResponse(prompt: any, image: any) {
//   const fakeResponse = `This is a fake response for prompt "${prompt}" and image "${image}"`
//   return new Response(fakeResponse, {
//     headers: {
//       'Content-Type': 'text/plain'
//     }
//   })
// }

// export async function POST(req: Request) {
//   const json = await req.json()
//   const { messages, previewToken } = json
//   const userId = (await auth())?.user.id
//   if (!userId) {
//     return new Response('Unauthorized', { status: 401 })
//   }

//   const prompt = json.messages[0].content
//   const image = 'json.images[0]'

//   const apiPayload = {
//     model: 'llava',
//     prompt: {
//       "prompt": "Please analyze the provided image for sensitivity and security concerns. Provide a detailed assessment using the following metrics:",
//       "metrics": [
//         "Nudity and Explicit Content",
//         "Violence and Weapons",
//         "Hate Symbols and Offensive Material",
//         "Sensitive Context",
//         "Privacy Violations",
//         "Cultural Sensitivity",
//         "Legal Compliance",
//         "Contextual Analysis",
//         "Emotional Impact",
//         "Public Perception"
//       ],
//       "expected_response_format": "JSON",
//       "response_format_casting": {
//         "analysis": {
//           "Nudity and Explicit Content": {
//             "score": "integer",
//             "comment": "string"
//           },
//           "Violence and Weapons": {
//             "score": "integer",
//             "comment": "string"
//           },
//           "Hate Symbols and Offensive Material": {
//             "score": "integer",
//             "comment": "string"
//           },
//           "Sensitive Context": {
//             "score": "integer",
//             "comment": "string"
//           },
//           "Privacy Violations": {
//             "score": "integer",
//             "comment": "string"
//           },
//           "Cultural Sensitivity": {
//             "score": "integer",
//             "comment": "string"
//           },
//           "Legal Compliance": {
//             "score": "integer",
//             "comment": "string"
//           },
//           "Contextual Analysis": {
//             "score": "integer",
//             "comment": "string"
//           },
//           "Emotional Impact": {
//             "score": "integer",
//             "comment": "string"
//           },
//           "Public Perception": {
//             "score": "integer",
//             "comment": "string"
//           }
//         }
//       }
//     },
//     images: [image],
//   }

//  // Simuler la réponse de l'API locale
//  const res = fakeApiResponse(JSON.stringify(apiPayload.prompt), image)

//   const responseStream = res.body
//   if (!responseStream) {
//     return new Response('No response stream', { status: 500 })
//   }

//   return processResponse(responseStream, messages, userId, json)
// }

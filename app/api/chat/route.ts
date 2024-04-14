import { kv } from '@vercel/kv'
import { StreamingTextResponse } from 'ai'
import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
})

export const runtime = 'edge'

async function processResponse(responseStream: any, userId: string) {
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  if (!responseStream) {
    writer.close()
    return new Response('No response stream', { status: 500 })
  }
  let completion = ''

  // try {

  //   while (true) {
  //     const { value, done } = await reader.read()
  //     if (done) break
  //     completion += value
  //     writer.write(value)
  //   }
  //   writer.close()
  // } catch (err) {
  //   writer.abort(err)
  // } finally {
  //   reader.releaseLock()
  // }

  for await (const event of responseStream) {
    completion += `${event}`
  }
  completion += '\n}'

//   const completion = responseStream.join('') + '\n}';
  
// console.log(completion);


  const response = JSON.parse(completion)
  const id = nanoid()
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

  const output = new ReadableStream({
    start(controller) {
      controller.enqueue(completion);
      controller.close();
    }
  });

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
  // const json = await req.json()
  // const { imageFile } = json

  const dataURI = await fileToDataURI(imageFile as File)

  const userId = (await auth())?.user.id
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const prompt = {
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
  }

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

  return processResponse(res, userId)
}

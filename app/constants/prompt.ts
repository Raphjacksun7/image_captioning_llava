// imageAnalysisPrompt.ts

export const imageAnalysisPrompt = {
  prompt:
    'Please perform a detailed analysis of the provided image for sensitivity and security concerns. Even seemingly simple images may hide deeper issues. Evaluate the image using the following metrics:',
  metrics: [
    {
      name: 'Nudity and Explicit Content',
      description:
        'Evaluate the presence of nudity, sexually explicit content, or other inappropriate imagery.',
      maxScore: 1
    },
    {
      name: 'Violence and Weapons',
      description:
        'Assess the depiction of violence, weapons, or other aggressive content.',
      maxScore: 1
    },
    {
      name: 'Hate Symbols and Offensive Material',
      description:
        'Identify any hate symbols, offensive language, or discriminatory content.',
      maxScore: 1
    },
    {
      name: 'Sensitive Context',
      description:
        'Consider any sensitive topics or contexts depicted in the image.',
      maxScore: 1
    },
    {
      name: 'Privacy Violations',
      description:
        'Evaluate whether the image violates privacy rights or exposes sensitive information.',
      maxScore: 1
    },
    {
      name: 'Cultural Sensitivity',
      description:
        'Assess the portrayal of diverse cultures and avoidances of stereotypes or cultural insensitivities.',
      maxScore: 1
    },
    {
      name: 'Legal Compliance',
      description:
        'Check if the image complies with relevant laws and regulations.',
      maxScore: 1
    },
    {
      name: 'Contextual Analysis',
      description:
        'Analyze the image within its context to understand its intended message or purpose.',
      maxScore: 1
    },
    {
      name: 'Emotional Impact',
      description: 'Evaluate the emotional impact of the image on viewers.',
      maxScore: 1
    },
    {
      name: 'Public Perception',
      description:
        'Consider how the image may be perceived by the public and its potential impact.',
      maxScore: 1
    }
  ],
  expected_response_format: 'JSON',
  response_format_casting: {
    title: 'Provide a clear and descriptive title for the image assessment',
    analysis: {
      'Nudity and Explicit Content': {
        score: 'integer (0-1)',
        comment: 'string'
      },
      'Violence and Weapons': {
        score: 'integer (0-1)',
        comment: 'string'
      },
      'Hate Symbols and Offensive Material': {
        score: 'integer (0-1)',
        comment: 'string'
      },
      'Sensitive Context': {
        score: 'integer (0-1)',
        comment: 'string'
      },
      'Privacy Violations': {
        score: 'integer (0-1)',
        comment: 'string'
      },
      'Cultural Sensitivity': {
        score: 'integer (0-1)',
        comment: 'string'
      },
      'Legal Compliance': {
        score: 'integer (0-1)',
        comment: 'string'
      },
      'Contextual Analysis': {
        score: 'integer (0-1)',
        comment: 'string'
      },
      'Emotional Impact': {
        score: 'integer (0-1)',
        comment: 'string'
      },
      'Public Perception': {
        score: 'integer (0-1)',
        comment: 'string'
      }
    }
  }
}

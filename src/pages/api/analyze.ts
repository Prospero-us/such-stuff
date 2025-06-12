import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // TODO: Implement Claude API integration
  // For now, return a mock response
  return res.status(200).json({
    score: 0.5,
    reason: 'API integration pending'
  });
} 
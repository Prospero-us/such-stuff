import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // List drafts
    return res.status(200).json({
      success: true,
      drafts: []
    });
  } else if (req.method === 'POST') {
    // Create draft
    return res.status(200).json({
      success: true,
      id: 'new-draft-id'
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 
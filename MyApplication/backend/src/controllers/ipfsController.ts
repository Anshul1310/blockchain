import { Request, Response } from 'express';
import { IPFSService } from '../services/ipfsService.js';

export class IPFSController {
  


  static async uploadJSON(req: Request, res: Response) {
    try {
      const payload = req.body;
      if (!payload || Object.keys(payload).length === 0) {
        return res.status(400).json({ error: 'Empty JSON payload provided' });
      }

      const cid = await IPFSService.uploadJSON(payload);
      return res.json({ success: true, cid });
    } catch (err) {
      console.error('IPFS Upload Error:', err);
      return res.status(500).json({ error: 'Failed to upload JSON to IPFS' });
    }
  }

  


  static async getJSON(req: Request, res: Response) {
    try {
      const { cid } = req.params;
      const data = await IPFSService.fetchJSON(cid);

      if (!data) {
        return res.status(404).json({ error: `CID ${cid} not found` });
      }

      return res.json({ cid, data });
    } catch (err) {
      console.error('IPFS Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch document from IPFS' });
    }
  }
}

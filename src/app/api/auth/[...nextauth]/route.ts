import { handlers } from '@/auth';
import { NextRequest } from 'next/server';

const { GET: originalGET, POST: originalPOST } = handlers;

export async function GET(request: NextRequest, context: any) {
  console.log(`[NextAuth Route] GET request to: ${request.url}`);
  try {
    const response = await originalGET(request);
    console.log(`[NextAuth Route] GET response status: ${response.status}`);
    return response;
  } catch (error) {
    console.error(`[NextAuth Route] GET error:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest, context: any) {
  console.log(`[NextAuth Route] POST request to: ${request.url}`);
  try {
    const response = await originalPOST(request);
    console.log(`[NextAuth Route] POST response status: ${response.status}`);
    return response;
  } catch (error) {
    console.error(`[NextAuth Route] POST error:`, error);
    throw error;
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { queryCloudFrontDistributions, type SearchParams } from '@/lib/aws-config';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const params: SearchParams = {};

    ['accountId', 'region', 'distributionId', 'domainName'].forEach((key) => {
      const value = sp.get(key);
      if (value) params[key as keyof SearchParams] = value;
    });

    const data = await queryCloudFrontDistributions(params);
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('CloudFront query error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { queryVPCs, type SearchParams } from '@/lib/aws-config';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const params: SearchParams = {};

    ['accountId', 'region', 'vpcId', 'cidr', 'name'].forEach((key) => {
      const value = sp.get(key);
      if (value) params[key as keyof SearchParams] = value;
    });

    const data = await queryVPCs(params);
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('VPC query error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

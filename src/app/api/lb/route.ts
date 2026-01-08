import { NextRequest, NextResponse } from 'next/server';
import { queryLoadBalancers, type SearchParams } from '@/lib/aws-config';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const params: SearchParams = {};

    ['accountId', 'region', 'loadBalancerName'].forEach((key) => {
      const value = sp.get(key);
      if (value) params[key as keyof SearchParams] = value;
    });

    const data = await queryLoadBalancers(params);
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('LoadBalancer query error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
